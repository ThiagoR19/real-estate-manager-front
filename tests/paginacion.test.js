import prueba from "node:test";
import verificar from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SourceTextModule, SyntheticModule, createContext } from "node:vm";

async function cargarServicio(ruta, pedir) {
  const contexto = createContext({ URLSearchParams });
  const modulos = new Map();
  async function cargar(url) {
    if (modulos.has(url)) return modulos.get(url);
    let modulo;
    if (url.endsWith("/utils/request.js")) {
      modulo = new SyntheticModule(["request", "http"], function () {
        this.setExport("request", pedir);
        this.setExport("http", {});
      }, { context: contexto, identifier: url });
    } else if (url.endsWith("/utils/sesion.js")) {
      modulo = new SyntheticModule(["obtenerSesion", "limpiarSesion"], function () {
        this.setExport("obtenerSesion", () => null);
        this.setExport("limpiarSesion", () => {});
      }, { context: contexto, identifier: url });
    } else {
      modulo = new SourceTextModule(await readFile(new URL(url), "utf8"), { context: contexto, identifier: url });
    }
    modulos.set(url, modulo);
    await modulo.link((nombre, origen) => cargar(new URL(nombre, origen.identifier).href));
    return modulo;
  }
  const modulo = await cargar(new URL(`../src/services/${ruta}.js`, import.meta.url).href);
  await modulo.evaluate();
  return modulo.namespace;
}

const respuesta = (pagina = 1, limite = 10, total = 35) => ({
  data: [{ id: 1 }], paginacion: { pagina, limite, total, paginas: Math.ceil(total / limite) },
});

prueba("cada servicio consulta únicamente la página solicitada", async () => {
  for (const [archivo, nombre, ruta, limite] of [
    ["agentes", "agentes", "/agentes", 10], ["inquilinos", "inquilinos", "/inquilinos", 10],
    ["propietarios", "propietarios", "/propietarios", 10], ["profesionales", "profesionales", "/profesionales", 10],
    ["inmobiliarias", "inmobiliarias", "/inmobiliarias", 10], ["inmobiliarias", "todosLosAdministradores", "/admins", 10],
    ["inmobiliarias", "todosLosAgentes", "/agentes", 10], ["propiedadesPropietario", "contratos", "/contratos", 10],
    ["propiedadesPropietario", "reportes", "/reportes", 5], ["documentos", "documentosContrato", "/documentos", 10],
    ["propiedades", "propiedades", "/propiedades", 12], ["pagos", "pagos", "/pagos", 12], ["cobros", "cobros", "/cobros", 12],
  ]) {
    const peticiones = [];
    const servicio = await cargarServicio(archivo, async (url) => { peticiones.push(url); return respuesta(3, limite); });
    const resultado = await servicio[nombre]({ pagina: 3 });
    verificar.deepEqual(peticiones, [`${ruta}?page=3&limit=${limite}`]);
    verificar.equal(resultado.paginacion.total, 35);
  }
});

prueba("búsqueda codificada y filtros documentados llegan al servidor", async () => {
  let solicitada;
  const { agentes } = await cargarServicio("agentes", async (url) => { solicitada = new URL(url, "http://api.local"); return respuesta(); });
  await agentes({ busqueda: "  Muñoz & Cía  ", filtros: { idInmobiliaria: 7 } });
  verificar.equal(solicitada.searchParams.get("q"), "Muñoz & Cía");
  verificar.equal(solicitada.searchParams.get("idInmobiliaria"), "7");
});

prueba("rechaza filtros y búsquedas que el endpoint no admite", async () => {
  let solicitudes = 0;
  const pedir = async () => { solicitudes++; return respuesta(); };
  const { inquilinos } = await cargarServicio("inquilinos", pedir);
  const { contratos } = await cargarServicio("propiedadesPropietario", pedir);
  const { todosLosAdministradores } = await cargarServicio("inmobiliarias", pedir);
  await verificar.rejects(inquilinos({ filtros: { activo: true } }), /Filtro no admitido/);
  await verificar.rejects(contratos({ busqueda: "casa" }), /búsqueda no está admitida/);
  await verificar.rejects(todosLosAdministradores({ filtros: { idInmobiliaria: 1 } }), /Filtro no admitido/);
  verificar.equal(solicitudes, 0);
});

prueba("valida límites antes de consultar y rechaza metadatos ausentes o incoherentes", async () => {
  const { inquilinos } = await cargarServicio("inquilinos", async () => ({ data: [] }));
  await verificar.rejects(inquilinos({ limite: 11 }), /tamaño de página/);
  await verificar.rejects(inquilinos({ pagina: 0 }), /página/);
  await verificar.rejects(inquilinos(), /paginación inválida/);
  const { propietarios } = await cargarServicio("propietarios", async () => ({ ...respuesta(), paginacion: { ...respuesta().paginacion, paginas: 0 } }));
  await verificar.rejects(propietarios(), /paginación inválida/);
});

prueba("propaga AbortSignal sin transformar una cancelación en resultados vacíos", async () => {
  const controlador = new AbortController();
  const cancelacion = new Error("Cancelada");
  const { profesionales } = await cargarServicio("profesionales", async (_, opciones) => {
    verificar.equal(opciones.signal, controlador.signal);
    throw cancelacion;
  });
  await verificar.rejects(profesionales({}, { signal: controlador.signal }), (error) => error === cancelacion);
});

prueba("el calendario completa solo las páginas del período visible", async () => {
  const peticiones = [];
  const filtros = { desde: "2026-11-23", hasta: "2026-11-29" };
  const { visitasDelPeriodo } = await cargarServicio("visitas", async (ruta) => {
    const url = new URL(ruta, "http://api.local");
    peticiones.push(url);
    const pagina = Number(url.searchParams.get("page"));
    return { data: [{ id: pagina }], paginacion: respuesta(pagina, 10, 15).paginacion };
  });
  const resultado = await visitasDelPeriodo({ filtros });
  verificar.equal(resultado.data.length, 2);
  verificar.equal(peticiones.length, 2);
  for (const url of peticiones) {
    verificar.equal(url.searchParams.get("desde"), filtros.desde);
    verificar.equal(url.searchParams.get("hasta"), filtros.hasta);
  }
  await verificar.rejects(visitasDelPeriodo(), /período/);
});

prueba("cancelar un período impide descargar sus páginas restantes", async () => {
  const controlador = new AbortController();
  let solicitudes = 0;
  const { visitasDelPeriodo } = await cargarServicio("visitas", async () => {
    solicitudes++;
    controlador.abort();
    return respuesta(1, 10, 100);
  });
  await verificar.rejects(visitasDelPeriodo({ filtros: { desde: "2026-11-01", hasta: "2026-11-30" } }, { signal: controlador.signal }));
  verificar.equal(solicitudes, 1);
});

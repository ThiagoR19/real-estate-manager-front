import { useCallback, useEffect, useState } from "react";

export default function useListadoPaginado(cargar, { busqueda = "", filtros = {}, limite = 10, habilitada = true, version = 0 } = {}) {
  const [solicitud, setSolicitud] = useState({ clave: "", pagina: 1 });
  const [revision, setRevision] = useState(0);
  const [respuesta, setRespuesta] = useState(null);
  const claveFiltros = JSON.stringify({ busqueda, filtros, limite });
  // Actualizar durante el render evita pedir la página anterior con filtros nuevos
  // y garantiza página 1 también al volver a una búsqueda utilizada antes.
  if (solicitud.clave !== claveFiltros) setSolicitud({ clave: claveFiltros, pagina: 1 });
  const pagina = solicitud.clave === claveFiltros ? solicitud.pagina : 1;
  const claveConsulta = JSON.stringify({ pagina, ...JSON.parse(claveFiltros), revision, version });
  const vigente = respuesta?.clave === claveConsulta;

  useEffect(() => {
    if (!habilitada) return undefined;
    let activa = true;
    const controlador = new AbortController();
    const consulta = JSON.parse(claveConsulta);
    const temporizador = setTimeout(async () => {
      try {
        const resultado = await cargar(consulta, { signal: controlador.signal });
        if (!activa) return;
        const ultimaPagina = Math.max(1, resultado.paginacion.paginas);
        if (consulta.pagina > ultimaPagina) {
          setSolicitud({ clave: claveFiltros, pagina: ultimaPagina });
          return;
        }
        setRespuesta({ clave: claveConsulta, ...resultado, error: "" });
      } catch (error) {
        if (activa && !controlador.signal.aborted) {
          setRespuesta({ clave: claveConsulta, data: [], paginacion: null, error: error.message });
        }
      }
    }, consulta.busqueda ? 300 : 0);
    return () => { activa = false; clearTimeout(temporizador); controlador.abort(); };
  }, [cargar, claveConsulta, claveFiltros, habilitada]);

  const cambiarPagina = useCallback((pagina) => {
    if (Number.isInteger(pagina) && pagina > 0) setSolicitud({ clave: claveFiltros, pagina });
  }, [claveFiltros]);
  const recargar = useCallback(() => setRevision((actual) => actual + 1), []);

  return {
    datos: habilitada && vigente ? respuesta.data : [],
    paginacion: habilitada && vigente ? respuesta.paginacion : null,
    error: habilitada && vigente ? respuesta.error : "",
    cargando: habilitada && !vigente,
    cambiarPagina,
    recargar,
  };
}

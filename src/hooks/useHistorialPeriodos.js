import { useEffect, useState } from "react";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function nombreMes(periodo) {
  return MESES[Number(periodo.slice(5, 7)) - 1];
}

export function nombrePeriodo(periodo) {
  return `${nombreMes(periodo)} ${periodo.slice(0, 4)}`;
}

const ZONA = "America/Argentina/Buenos_Aires";

export function formatearFecha(valor) {
  if (!valor) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor.split("-").reverse().join("/");
  return new Date(valor).toLocaleDateString("es-AR", { timeZone: ZONA, day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatearFechaHora(valor) {
  if (!valor) return "—";
  const hora = new Date(valor).toLocaleTimeString("es-AR", { timeZone: ZONA, hour: "2-digit", minute: "2-digit", hour12: false });
  return `${formatearFecha(valor)} · ${hora} hs`;
}

export function formatearMonto(valor) {
  if (valor === null || valor === undefined) return "—";
  return Number(valor).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function etiquetarContratos(contratos) {
  const repetidos = new Map();
  for (const { propiedad } of contratos) repetidos.set(propiedad, (repetidos.get(propiedad) ?? 0) + 1);
  return contratos.map((contrato) => {
    const { propiedad, idContrato } = contrato;
    const etiqueta = repetidos.get(propiedad) > 1 ? `${propiedad} · Contrato ${idContrato}` : propiedad;
    return { ...contrato, etiqueta };
  });
}

export default function useHistorialPeriodos(listar, consultar) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [contratoElegido, setContratoElegido] = useState(null);
  const [periodoElegido, setPeriodoElegido] = useState(null);
  const [recargas, setRecargas] = useState(0);
  const [estado, setEstado] = useState({ clave: null, detalle: null });

  useEffect(() => {
    let activo = true;
    listar()
      .then((lista) => {
        if (!activo) return;
        setItems(lista);
        setError("");
      })
      .catch((causa) => {
        if (!activo) return;
        setItems([]);
        setError(causa.message);
      });
    return () => {
      activo = false;
    };
  }, [listar, recargas]);

  const contratosPorId = new Map();
  for (const { idContrato, propiedad } of items ?? []) {
    contratosPorId.set(idContrato, { idContrato, propiedad });
  }
  const contratos = etiquetarContratos([...contratosPorId.values()]);
  const idContrato = contratosPorId.has(contratoElegido) ? contratoElegido : contratos[0]?.idContrato;
  const delContrato = (items ?? []).filter((item) => item.idContrato === idContrato);
  const seleccionado = delContrato.find((item) => item.id === periodoElegido || item.periodo === periodoElegido) ?? delContrato[0] ?? null;
  const idSeleccionado = seleccionado?.id;
  const clave = idSeleccionado == null ? null : `${idSeleccionado}|${recargas}`;

  useEffect(() => {
    if (!clave) return undefined;
    let activo = true;
    consultar(idSeleccionado)
      .then((detalle) => {
        if (!activo) return;
        setEstado({ clave, detalle });
      })
      .catch((causa) => {
        if (!activo) return;
        setEstado({ clave, detalle: null, error: causa.message });
      });
    return () => {
      activo = false;
    };
  }, [consultar, clave, idSeleccionado]);

  const anios = [...new Set(delContrato.map((item) => item.periodo.slice(0, 4)))].map((anio) => ({
    anio,
    periodos: delContrato.filter((item) => item.periodo.startsWith(anio)),
  }));
  const detalle = estado.clave === clave && estado.detalle ? estado.detalle : seleccionado;

  function elegir(id) {
    setPeriodoElegido(id);
  }

  function incorporar(item) {
    setItems((actual) => [item, ...(actual ?? []).filter(({ id }) => id !== item.id)]);
    setContratoElegido(item.idContrato);
    setPeriodoElegido(item.id);
    recargar();
  }

  function recargar() {
    setRecargas((cantidad) => cantidad + 1);
  }

  function elegirContrato(nuevoId, periodo = null) {
    setContratoElegido(nuevoId);
    setPeriodoElegido(periodo);
  }

  function moverContrato(direccion) {
    if (!contratos.length) return;
    const indice = contratos.findIndex((contrato) => contrato.idContrato === idContrato);
    elegirContrato(contratos[(indice + direccion + contratos.length) % contratos.length].idContrato);
  }

  return {
    items,
    error,
    contratos,
    contrato: contratos.find((item) => item.idContrato === idContrato) ?? null,
    delContrato,
    anios,
    seleccionado,
    detalle,
    cargandoDetalle: Boolean(clave) && estado.clave !== clave,
    errorDetalle: estado.clave === clave ? estado.error : null,
    elegirContrato,
    moverContrato,
    elegir,
    incorporar,
    recargar,
  };
}

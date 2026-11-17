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

export default function useHistorialPeriodos(listar, consultar) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [idContrato, setIdContrato] = useState(null);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [recargas, setRecargas] = useState(0);
  const [estado, setEstado] = useState({ clave: null, detalle: null });

  useEffect(() => {
    let activo = true;
    listar()
      .then((lista) => {
        if (!activo) return;
        setItems(lista);
        setError("");
        setIdContrato((actual) => actual ?? lista[0]?.idContrato ?? null);
        setIdSeleccionado((actual) => actual ?? lista[0]?.id ?? null);
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

  const clave = idSeleccionado ? `${idSeleccionado}|${recargas}` : null;

  useEffect(() => {
    if (!clave) return undefined;
    let activo = true;
    consultar(idSeleccionado)
      .then((detalle) => {
        if (!activo) return;
        setEstado({ clave, detalle });
        setError("");
      })
      .catch((causa) => {
        if (!activo) return;
        setEstado({ clave, detalle: null });
        setError(causa.message);
      });
    return () => {
      activo = false;
    };
  }, [consultar, clave, idSeleccionado]);

  const contratos = [];
  for (const item of items ?? []) {
    if (!contratos.some((contrato) => contrato.idContrato === item.idContrato)) {
      contratos.push({ idContrato: item.idContrato, propiedad: item.propiedad });
    }
  }

  const delContrato = (items ?? []).filter((item) => item.idContrato === idContrato);
  const anios = [...new Set(delContrato.map((item) => item.periodo.slice(0, 4)))].map((anio) => ({
    anio,
    periodos: delContrato.filter((item) => item.periodo.startsWith(anio)),
  }));
  const seleccionado = (items ?? []).find((item) => item.id === idSeleccionado) ?? null;
  const detalle = estado.clave === clave && estado.detalle ? estado.detalle : seleccionado;

  function elegir(id) {
    setIdSeleccionado(id);
    setError("");
  }

  function elegirContrato(nuevoId) {
    setError("");
    setIdContrato(nuevoId);
    setIdSeleccionado(items.find((item) => item.idContrato === nuevoId)?.id ?? null);
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
    elegirContrato,
    moverContrato,
    elegir,
    recargar: () => setRecargas((cantidad) => cantidad + 1),
  };
}

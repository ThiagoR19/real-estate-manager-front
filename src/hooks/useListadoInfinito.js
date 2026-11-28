import { useCallback, useEffect, useState } from "react";

function estadoInicial(clave) {
  return { clave, datos: [], paginacion: null, pedidas: 1, error: "" };
}

export default function useListadoInfinito(cargar, { filtros = {}, limite = 10, habilitada = true, version = 0 } = {}) {
  const clave = JSON.stringify({ filtros, limite, version });
  const [estado, setEstado] = useState(() => estadoInicial(clave));
  if (estado.clave !== clave) setEstado(estadoInicial(clave));
  const actual = estado.clave === clave ? estado : estadoInicial(clave);

  const cargadas = actual.paginacion?.pagina ?? 0;
  const quedanPaginas = !actual.paginacion || actual.paginacion.pagina < actual.paginacion.paginas;
  const siguiente = cargadas + 1;
  const debePedir = habilitada && !actual.error && quedanPaginas && actual.pedidas >= siguiente;

  useEffect(() => {
    if (!debePedir) return undefined;
    const controlador = new AbortController();
    const consulta = JSON.parse(clave);
    cargar({ pagina: siguiente, limite: consulta.limite, filtros: consulta.filtros }, { signal: controlador.signal })
      .then((resultado) => setEstado((previo) => (previo.clave !== clave ? previo : {
        ...previo, datos: [...previo.datos, ...resultado.data], paginacion: resultado.paginacion,
      })))
      .catch((error) => {
        if (controlador.signal.aborted) return;
        setEstado((previo) => (previo.clave !== clave ? previo : { ...previo, error: error.message }));
      });
    return () => controlador.abort();
  }, [cargar, clave, debePedir, siguiente]);

  const cargarMas = useCallback(() => {
    setEstado((previo) => (previo.clave !== clave ? previo : { ...previo, pedidas: (previo.paginacion?.pagina ?? 0) + 1 }));
  }, [clave]);
  const reintentar = useCallback(() => {
    setEstado((previo) => (previo.clave !== clave ? previo : { ...previo, error: "" }));
  }, [clave]);

  return {
    datos: actual.datos,
    total: actual.paginacion?.total ?? null,
    cargando: debePedir,
    hayMas: habilitada && quedanPaginas,
    error: actual.error,
    cargarMas,
    reintentar,
  };
}

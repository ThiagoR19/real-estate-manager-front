import EstadoListado from "./EstadoListado.jsx";
import PaginacionServidor from "./PaginacionServidor.jsx";
import "./ControlesHistorial.css";

export default function ControlesHistorial({ historial }) {
  const opciones = historial.contratos.some((contrato) => contrato.idContrato === historial.contrato?.idContrato)
    ? historial.contratos : [...historial.contratos, ...(historial.contrato ? [historial.contrato] : [])];
  return <section className="controles-historial" aria-label="Navegar contratos y períodos">
    <label>Contrato
      <select aria-label="Contrato del historial" value={historial.contrato?.idContrato ?? ""}
        onChange={(evento) => historial.elegirContrato(Number(evento.target.value))}>
        <option value="" disabled>Seleccioná un contrato</option>
        {opciones.map((contrato) => <option key={contrato.idContrato} value={contrato.idContrato}>{contrato.etiqueta} (#{contrato.idContrato})</option>)}
      </select>
    </label>
    <div aria-label="Páginas de contratos"><PaginacionServidor paginacion={historial.catalogo.paginacion} alCambiar={(pagina) => {
      historial.elegirContrato(null);
      historial.catalogo.cambiarPagina(pagina);
    }} /></div>
    <label>Año de los períodos
      <select aria-label="Año del historial" value={historial.anio} onChange={(evento) => historial.cambiarAnio(evento.target.value)}>
        <option value="">Todos</option>
        {Array.from({ length: 101 }, (_, indice) => 2100 - indice).map((anio) => <option key={anio} value={anio}>{anio}</option>)}
      </select>
    </label>
    <div aria-label="Páginas de períodos"><PaginacionServidor paginacion={historial.listado.paginacion} alCambiar={historial.listado.cambiarPagina} /></div>
    <EstadoListado cargando={historial.cargando} error={historial.catalogo.error || historial.listado.error || historial.errorResumen}
      alReintentar={() => { historial.catalogo.recargar(); historial.recargar(); }} />
  </section>;
}

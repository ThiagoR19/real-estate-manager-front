import { useState } from "react";
import usePropiedadesPaginadas from "../../hooks/usePropiedadesPaginadas.js";
import "./SelectorPropiedad.css";

function etiquetaPropiedad(propiedad) {
  return `${propiedad.nombre || "Propiedad"} (#${propiedad.id})${propiedad.ubicacion ? ` · ${propiedad.ubicacion}` : ""}`;
}

export default function SelectorPropiedad({ valor, propiedadInicial, alCambiar, requerida = false }) {
  const [seleccionada, setSeleccionada] = useState(propiedadInicial);
  const { propiedades, paginacion, cargando, error, busqueda, cambiarBusqueda, cambiarPagina, recargar } = usePropiedadesPaginadas();
  const opciones = seleccionada && String(seleccionada.id) === String(valor) && !propiedades.some((propiedad) => String(propiedad.id) === String(valor))
    ? [seleccionada, ...propiedades] : propiedades;

  return (
    <div className="selector-propiedad">
      <input type="search" aria-label="Buscar opciones de propiedades" placeholder="Buscar por nombre o ubicación..."
        maxLength={255} value={busqueda} onChange={(evento) => cambiarBusqueda(evento.target.value)} />
      <select aria-label="Propiedad" value={valor || ""} required={requerida} onChange={(evento) => {
        const propiedad = opciones.find((opcion) => String(opcion.id) === evento.target.value);
        if (propiedad) {
          setSeleccionada(propiedad);
          alCambiar(propiedad.id);
        }
      }}>
        <option value="" disabled>Seleccioná una propiedad</option>
        {opciones.map((propiedad) => <option key={propiedad.id} value={propiedad.id}>{etiquetaPropiedad(propiedad)}</option>)}
      </select>
      {cargando && <span role="status">Cargando opciones...</span>}
      {error && <span role="alert">{error} <button type="button" onClick={recargar}>Reintentar</button></span>}
      {paginacion && (
        <div className="selector-propiedad__paginas" aria-label="Páginas de opciones de propiedades">
          <button type="button" disabled={paginacion.pagina <= 1} onClick={() => cambiarPagina(paginacion.pagina - 1)}>Anterior</button>
          <span role="status">{paginacion.total ? `${paginacion.pagina} / ${paginacion.paginas} · ${paginacion.total} propiedades` : "Sin resultados"}</span>
          <button type="button" disabled={paginacion.pagina >= paginacion.paginas} onClick={() => cambiarPagina(paginacion.pagina + 1)}>Siguiente</button>
        </div>
      )}
    </div>
  );
}

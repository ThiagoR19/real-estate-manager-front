import { assetUrl } from "../../utils/assetUrl.js";
import { useEffect, useState } from "react";
import useListadoPaginado from "../../hooks/useListadoPaginado.js";
import useTotalListado from "../../hooks/useTotalListado.js";
import EstadoListado from "../../components/paginacion/EstadoListado.jsx";
import PaginacionServidor from "../../components/paginacion/PaginacionServidor.jsx";
import { calendarIcon, envelopeIcon, fileLinesIcon, houseIcon, locationDotIcon, magnifyingGlassIcon, peopleIcon, phoneIcon, plusIcon, xIcon } from "../../assets/icons";
import { ConfirmarEliminacionModal, AccionesEntidad, AvisoEnlaceActivacion, Boton, FiltroListado, PildoraResumen, mostrarAviso } from "../../components";
import InquilinoModal from "./InquilinoModal";
import "./Inquilinos.css";
import { api } from "../../services/api.js";

import avatarClass from "../../utils/avatarClass";
import initials from "../../utils/initials.js";

const OPCIONES_ESTADO = [{ valor: "activo", etiqueta: "Activo" }, { valor: "inactivo", etiqueta: "Inactivo" }];
const OPCIONES_VENCIMIENTO = [{ valor: "mes", etiqueta: "Este mes" }, { valor: "30dias", etiqueta: "Próximos 30 días" }];

function interpretarFecha(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function enlaceActivacion(activacion) {
  if (activacion?.enlace) return activacion.enlace;
  return activacion?.codigo
    ? `${window.location.origin}/activar?codigo=${encodeURIComponent(activacion.codigo)}`
    : "";
}

function formatearFecha(value) {
  const date = interpretarFecha(value);
  return date
    ? date.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
}

function ImagenPropiedad({ src }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="inquilinos__propiedad-image inquilinos__propiedad-image--empty" aria-hidden="true">
        <img src={houseIcon} alt="" />
      </div>
    );
  }

  return <img className="inquilinos__propiedad-image" src={src} alt="" onError={() => setFailed(true)} />;
}

function FilaInquilino({ inquilino, imagenesPropiedades, onEdit, onDelete, onGenerateActivation }) {
  const nombre = `${inquilino.nombre || ""} ${inquilino.apellido || ""}`.trim() || `DNI ${inquilino.dni}`;
  const status = inquilino.activo ? "Activo" : "Inactivo";
  const propertyImageUrl = imagenesPropiedades[inquilino.idPropiedad];
  return (
    <tr>
      <td data-label="Inquilino">
        <div className="inquilinos__person">
          <span className={`inquilinos__avatar ${avatarClass(inquilino.nombre, inquilino.apellido)}`}>
            {initials(inquilino.nombre, inquilino.apellido)}
          </span>
          <span className="inquilinos__person-copy">
            <strong>{nombre}</strong>
            <small>DNI {inquilino.dni || "—"}</small>
          </span>
        </div>
      </td>
      <td data-label="Contacto">
        <div className="inquilinos__contact">
          <span>
            <img src={envelopeIcon} alt="" />
            <span className="inquilinos__contact-text" title={inquilino.correo || "Correo sin especificar"}>
              {inquilino.correo || "Correo sin especificar"}
            </span>
          </span>
          <span>
            <img src={phoneIcon} alt="" />
            <span className="inquilinos__contact-text" title={inquilino.telefono || "Teléfono sin especificar"}>
              {inquilino.telefono || "Teléfono sin especificar"}
            </span>
          </span>
        </div>
      </td>
      <td data-label="Propiedad">
        <div className="inquilinos__propiedad">
          <ImagenPropiedad key={propertyImageUrl || "sin-imagen"} src={propertyImageUrl} />
          <span>
            <strong>{inquilino.propiedad || "Sin propiedad asignada"}</strong>
            <small>{inquilino.propiedadUbicacion || "Sin ubicación de propiedad"}</small>
          </span>
        </div>
      </td>
      <td data-label="Contrato">
        <span className="inquilinos__contract">
          <strong>{inquilino.idContrato ? `Contrato #${inquilino.idContrato}` : "Sin contrato"}</strong>
          <small>
            {inquilino.idContrato
              ? `${formatearFecha(inquilino.fechaInicio)} – ${formatearFecha(inquilino.fechaFin)}`
              : "Sin contrato vigente"}
          </small>
        </span>
      </td>
      <td data-label="Estado">
        <span
          className={`inquilinos__status inquilinos__status--${inquilino.activo ? "active" : "inactive"}`}
        >
          {status}
        </span>
      </td>
      <td data-label="Próximo vencimiento">
        <strong className="inquilinos__due">
          {inquilino.estadoContrato === "Vigente" ? formatearFecha(inquilino.fechaFin) : "—"}
        </strong>
      </td>
      <td data-label="Acciones" className="inquilinos__actions-cell">
        <AccionesEntidad
          entidad="inquilino"
          nombre={nombre}
          onEdit={() => onEdit(inquilino)}
          onDelete={() => onDelete(inquilino)}
          onGenerateActivation={
            inquilino.estadoCuenta === "PENDIENTE_ACTIVACION"
              ? () => onGenerateActivation(inquilino)
              : undefined
          }
        />
      </td>
    </tr>
  );
}

export default function Inquilinos() {
  const [imagenesPropiedades, setImagenesPropiedades] = useState({});
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [modal, setModal] = useState({ isOpen: false, mode: "create", inquilino: null });
  const [aviso, setAviso] = useState("");
  const [enlaceActivacionGenerado, setEnlaceActivacion] = useState("");
  const [filtros, setFiltros] = useState({});
  const [version, setVersion] = useState(0);
  const [opcionesPropiedad, setOpcionesPropiedad] = useState([]);
  const listado = useListadoPaginado(api.inquilinos, { busqueda: textoBusqueda, filtros, version });
  const inquilinos = listado.datos;
  const [pendienteEliminar, setPendienteEliminar] = useState(null);
  const activos = useTotalListado(api.inquilinos, { estado: "activo" }, { version });
  const inactivos = useTotalListado(api.inquilinos, { estado: "inactivo" }, { version });
  const conContratoVigente = useTotalListado(api.inquilinos, { contrato: "Vigente" }, { version });
  const vencenPronto = useTotalListado(api.inquilinos, { vencimiento: "30dias" }, { version });

  const summaryCards = [
    { label: "Inquilinos activos", value: activos, icon: peopleIcon, tone: "success" },
    { label: "Inquilinos inactivos", value: inactivos, icon: xIcon, tone: "warning" },
    { label: "Contratos vigentes", value: conContratoVigente, icon: fileLinesIcon, tone: "info" },
    { label: "Vencen en 30 días", value: vencenPronto, icon: calendarIcon, tone: "danger" },
  ];

  useEffect(() => {
    let activa = true;
    api.propiedadesConInquilinos()
      .then((propiedades) => activa && setOpcionesPropiedad(propiedades.map(({ id, nombre }) => ({ valor: id, etiqueta: nombre }))))
      .catch((error) => activa && mostrarAviso({ tipo: "advertencia", titulo: "No se pudo cargar el filtro de propiedades", mensaje: error.message }));
    return () => { activa = false; };
  }, [version]);

  function cambiarFiltro(nombre, valor) {
    setFiltros((actuales) => ({ ...actuales, [nombre]: valor }));
  }

  function recargarTodo() {
    setVersion((actual) => actual + 1);
  }
  const idsPropiedadesVisibles = [...new Set(inquilinos.map((inquilino) => inquilino.idPropiedad).filter(Boolean))].join(",");

  useEffect(() => {
    if (!idsPropiedadesVisibles) return undefined;
    let activa = true;
    const controlador = new AbortController();
    // Solo las propiedades de esta página de inquilinos, sin recorrer el catálogo.
    Promise.allSettled(idsPropiedadesVisibles.split(",").map((id) => api.propiedad(id, { signal: controlador.signal })))
      .then((resultados) => {
        if (!activa) return;
        const imagenes = Object.fromEntries(resultados.flatMap((resultado) => resultado.status === "fulfilled"
          ? [[resultado.value.id, assetUrl(resultado.value.imagenes?.[0]?.url)]] : []));
        setImagenesPropiedades(imagenes);
        if (resultados.some((resultado) => resultado.status === "rejected")) {
          mostrarAviso({ tipo: "advertencia", titulo: "Algunas imágenes de propiedades no están disponibles", mensaje: "Podés seguir gestionando los inquilinos." });
        }
      });
    return () => { activa = false; controlador.abort(); };
  }, [idsPropiedadesVisibles]);

  async function confirmarEliminacionInquilino() {
    if (!pendienteEliminar) return;
    try {
      await api.eliminarInquilino(pendienteEliminar.id);
      recargarTodo();
      mostrarAviso({
        tipo: "exito",
        titulo: "Inquilino eliminado",
        mensaje: `${`${pendienteEliminar.nombre || ""} ${pendienteEliminar.apellido || ""}`.trim() || `DNI ${pendienteEliminar.dni}`} fue eliminado.`,
      });
      setAviso("");
      setEnlaceActivacion("");
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo eliminar el inquilino", mensaje: error.message });
    } finally {
      setPendienteEliminar(null);
    }
  }

  async function generarEnlaceActivacion(inquilino) {
    try {
      const activacion = await api.generarEnlaceInquilino(inquilino.id);
      const titular = `${inquilino.nombre || ""} ${inquilino.apellido || ""}`.trim() || `DNI ${inquilino.dni}`;
      setEnlaceActivacion(enlaceActivacion(activacion));
      setAviso(`Enlace nuevo para ${titular}. Compartilo con el inquilino para activar su cuenta.`);
      mostrarAviso({ tipo: "info", titulo: "Enlace de activación generado", mensaje: "Copialo y compartilo con el inquilino para que active su cuenta." });
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo generar el enlace", mensaje: error.message });
    }
  }

  function abrirModalCreacion() {
    setModal({ isOpen: true, mode: "create", inquilino: null });
  }

  function editarInquilino(inquilino) {
    setModal({ isOpen: true, mode: "edit", inquilino });
  }

  function cerrarModalInquilino() {
    setModal((current) => ({ ...current, isOpen: false }));
  }

  async function guardarInquilino(formulario) {
    const existing = modal.mode === "edit" ? modal.inquilino : null;
    const body = {
      nombre: formulario.nombre || null,
      apellido: formulario.apellido || null,
      dni: formulario.dni || null,
      correo: formulario.correo || null,
      telefono: formulario.telefono || null,
      direccion: formulario.direccion || null,
    };
    const raw = existing
      ? await api.actualizarInquilino(existing.id, {
          ...body,
          dni: undefined,
          activo: formulario.activo,
          ...(formulario.idPropiedad && Number(formulario.idPropiedad) !== Number(existing.idPropiedad)
            ? { idPropiedad: Number(formulario.idPropiedad) }
            : {}),
        })
      : await api.crearInquilino(body);
    const result = { inquilino: raw, activationUrl: enlaceActivacion(raw.activacion) };
    recargarTodo();
    const titular = `${raw.nombre || ""} ${raw.apellido || ""}`.trim() || `DNI ${raw.dni}`;
    setAviso(!existing && result.activationUrl
      ? `Se creó el acceso de ${titular}. Compartí el enlace con su titular.`
      : "");
    setEnlaceActivacion(result.activationUrl || "");
    mostrarAviso({
      tipo: "exito",
      titulo: existing ? "Inquilino actualizado" : "Inquilino creado",
      mensaje: existing ? `Se actualizó la información de ${titular}.` : `Se creó el acceso de ${titular}.`,
    });
    cerrarModalInquilino();
  }

  return (
    <main id="inquilinos">
      <div className="inquilinos__page">
        <section className="inquilinos__overview" aria-labelledby="inquilinos-title">
          <div className="inquilinos__hero">
            <h1 id="inquilinos-title">Inquilinos</h1>
            <p>Gestiona la información de todos los inquilinos</p>
          </div>
          <div className="inquilinos__summary" aria-label="Resumen de inquilinos">
            {summaryCards.map((card) => (
              <PildoraResumen key={card.label} {...card} />
            ))}
          </div>
        </section>

        <section className="inquilinos__toolbar" aria-label="Buscar y filtrar inquilinos">
          <label className="inquilinos__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input
              type="search"
              placeholder="Buscar contacto..."
              aria-label="Buscar contacto"
              value={textoBusqueda}
              maxLength={255}
              onChange={(event) => setTextoBusqueda(event.target.value)}
            />
          </label>
          <FiltroListado etiqueta="Propiedad" todos="Todas las propiedades" opciones={opcionesPropiedad} icono={houseIcon} prefijo="inquilinos"
            valor={filtros.idPropiedad} alCambiar={(valor) => cambiarFiltro("idPropiedad", valor)} />
          <FiltroListado etiqueta="Estado" todos="Todos los estados" opciones={OPCIONES_ESTADO} icono={locationDotIcon} prefijo="inquilinos"
            valor={filtros.estado} alCambiar={(valor) => cambiarFiltro("estado", valor)} />
          <FiltroListado etiqueta="Vencimiento" todos="Todos los vencimientos" opciones={OPCIONES_VENCIMIENTO} icono={calendarIcon} prefijo="inquilinos"
            valor={filtros.vencimiento} alCambiar={(valor) => cambiarFiltro("vencimiento", valor)} />
          <Boton
            className="inquilinos__new-button"
            onClick={abrirModalCreacion}
            icon={plusIcon}
            text="Nuevo inquilino"
          />
        </section>

        <section className="inquilinos__table-card" aria-label="Listado de inquilinos">
          <div className="inquilinos__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Inquilino</th>
                  <th>Contacto</th>
                  <th>Propiedad</th>
                  <th>Contrato</th>
                  <th>Estado</th>
                  <th>Próximo vencimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inquilinos.map((inquilino) => (
                  <FilaInquilino
                    key={inquilino.id}
                    inquilino={inquilino}
                    imagenesPropiedades={imagenesPropiedades}
                    onEdit={editarInquilino}
                    onDelete={setPendienteEliminar}
                    onGenerateActivation={generarEnlaceActivacion}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <EstadoListado cargando={listado.cargando} error={listado.error} alReintentar={listado.recargar} vacio={!inquilinos.length} />
          <PaginacionServidor paginacion={listado.paginacion} alCambiar={listado.cambiarPagina} />
        </section>
      </div>

      {aviso && (
        <AvisoEnlaceActivacion
          message={aviso}
          url={enlaceActivacionGenerado}
          onDismiss={() => { setAviso(""); setEnlaceActivacion(""); }}
        />
      )}

      <ConfirmarEliminacionModal
        isOpen={Boolean(pendienteEliminar)}
        onClose={() => setPendienteEliminar(null)}
        onConfirm={confirmarEliminacionInquilino}
        title="¿Eliminar este inquilino? Se quitará su acceso y se conservará el historial de contratos, pagos y reportes."
      />

      {modal.isOpen && (
        <InquilinoModal
          isOpen={modal.isOpen}
          mode={modal.mode}
          inquilino={modal.inquilino}
          onClose={cerrarModalInquilino}
          onSubmit={guardarInquilino}
        />
      )}
    </main>
  );
}

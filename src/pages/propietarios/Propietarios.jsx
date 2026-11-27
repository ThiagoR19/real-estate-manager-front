import { useEffect, useState } from "react";
import { envelopeIcon, fileLinesIcon, clockIcon, magnifyingGlassIcon, peopleIcon, phoneIcon, plusIcon, xIcon } from "../../assets/icons";
import propertyImage from "/images.jpg";
import { Boton, PildoraResumen, ConfirmarEliminacionModal, AccionesEntidad, AvisoEnlaceActivacion, Paginacion, usePaginacion, mostrarAviso } from "../../components";
import PersonaModal from "./PersonaModal";
import "./Propietarios.css";
import { api } from "../../services/api.js";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import avatarClass from "../../utils/avatarClass.js";
import initials from "../../utils/initials.js";

function enlaceActivacion(activacion) {
  if (activacion?.enlace) return activacion.enlace;
  return activacion?.codigo
    ? `${window.location.origin}/activar?codigo=${encodeURIComponent(activacion.codigo)}`
    : "";
}

const prepararPropietario = (propietario) => ({
  ...propietario,
  nombreCompleto: `${propietario.nombre || ""} ${propietario.apellido || ""}`.trim() || `DNI ${propietario.dni}`,
  iniciales: initials(propietario.nombre, propietario.apellido),
  correo: propietario.correo || "",
  telefono: propietario.telefono || "",
  direccion: propietario.direccion || "",
  unidad: "",
  estado: propietario.activo ? "Activo" : "Inactivo",
});

const tarjetasResumen = (resumen, propietariosActivos) => [
  { key: "cobrosPendientes", label: "Cobros pendientes", value: resumen?.cobrosPendientes.total ?? "—", icon: xIcon, tone: "danger" },
  { key: "liquidacionesPorGenerar", label: "Liquidaciones por generar", value: resumen?.liquidacionesPorGenerar.total ?? "—", icon: clockIcon, tone: "warning" },
  { key: "propietariosActivos", label: "Propietarios activos", value: propietariosActivos, icon: peopleIcon, tone: "success" },
  { key: "cobrosAcreditados", label: "Cobros acreditados", value: resumen?.cobrosAcreditados.total ?? "—", icon: fileLinesIcon, tone: "info" },
];

function FilaPropietario({ propietario, onEdit, onDelete, onGenerateActivation }) {
  return (
    <tr>
      <td data-label="Propietario">
        <div className="propietarios__person">
          <span className={`propietarios__avatar ${avatarClass(propietario.nombre, propietario.apellido)}`}>{propietario.iniciales}</span>
          <span className="propietarios__person-copy">
            <strong>{propietario.nombreCompleto}</strong>
            <small>DNI {propietario.dni}</small>
          </span>
        </div>
      </td>
      <td data-label="Contacto">
        <div className="propietarios__contact">
          <span>
            <img src={envelopeIcon} alt="" />
            <span className="propietarios__contact-text" title={propietario.correo || "—"}>
              {propietario.correo || "—"}
            </span>
          </span>
          <span>
            <img src={phoneIcon} alt="" />
            <span className="propietarios__contact-text" title={propietario.telefono || "—"}>
              {propietario.telefono || "—"}
            </span>
          </span>
        </div>
      </td>
      <td data-label="Propiedad">
        <div className="propietarios__propiedad">
          <img className="propietarios__propiedad-image" src={propertyImage} alt="" />
          <span>
            <strong>{propietario.propiedad || "Sin propiedad asignada"}</strong>
            <small>{propietario.unidad}</small>
          </span>
        </div>
      </td>
      <td data-label="CBU">
        <span className="propietarios__muted-value" title={propietario.cbu || "—"}>{propietario.cbu || "—"}</span>
      </td>
      <td data-label="Alias">
        <span className="propietarios__muted-value" title={propietario.alias || "—"}>{propietario.alias || "—"}</span>
      </td>
      <td data-label="Estado">
        <span className={`propietarios__status propietarios__status--${propietario.activo ? "active" : "inactive"}`}>
          {propietario.estado}
        </span>
      </td>
      <td data-label="Acciones" className="propietarios__actions-cell">
        <AccionesEntidad
          entidad="propietario"
          nombre={propietario.nombreCompleto}
          onEdit={() => onEdit(propietario)}
          onDelete={() => onDelete(propietario)}
          onGenerateActivation={
            propietario.estadoCuenta === "PENDIENTE_ACTIVACION"
              ? () => onGenerateActivation(propietario)
              : undefined
          }
        />
      </td>
    </tr>
  );
}

export default function Propietarios() {
  const [propietarios, setPropietarios] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [errorResumen, setErrorResumen] = useState("");
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [modal, setModal] = useState(null);
  const [pendienteEliminar, setPendienteEliminar] = useState(null);
  const [aviso, setAviso] = useState("");
  const [enlaceActivacionGenerado, setEnlaceActivacion] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let active = true;
    api.propietarios()
      .then((rows) => { if (active) setPropietarios(rows.map(prepararPropietario)); })
      .catch((cause) => {
        if (!active) return;
        setError(cause.message);
        mostrarAviso({ tipo: "error", titulo: "No se pudieron cargar los propietarios", mensaje: cause.message });
      })
      .finally(() => { if (active) setCargando(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    api.resumenPropietarios()
      .then((result) => { if (active) setResumen(result); })
      .catch((cause) => { if (active) setErrorResumen(cause.message); });
    return () => { active = false; };
  }, []);

  async function actualizarResumen() {
    try {
      setResumen(await api.resumenPropietarios());
      setErrorResumen("");
    } catch (cause) {
      setErrorResumen(cause.message);
    }
  }

  const busquedaNormalizada = textoBusqueda.trim().toLowerCase();
  const propietariosVisibles = propietarios.filter(
    (propietario) =>
      !busquedaNormalizada ||
      [
        propietario.nombreCompleto,
        propietario.dni,
        propietario.correo,
        propietario.direccion,
        propietario.propiedad || "",
        propietario.cbu,
        propietario.alias,
      ].some((value) => String(value ?? "").toLowerCase().includes(busquedaNormalizada)),
  );
  const cards = tarjetasResumen(resumen, propietarios.filter((propietario) => propietario.activo).length);
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(propietariosVisibles);

  async function guardarPropietario(data) {
    const raw = modal.mode === "edit"
      ? await api.actualizarPropietario(modal.persona.id, {
          nombre: data.nombre || null, apellido: data.apellido || null,
          correo: data.correo || null, telefono: data.telefono || null,
          direccion: data.direccion || null, cbu: data.cbu || null,
          alias: data.alias || null, activo: data.estado === "Activo",
        })
      : await api.crearPropietario({
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni,
          correo: data.correo || null,
          telefono: data.telefono || null,
          direccion: data.direccion || null,
          cbu: data.cbu || null,
          alias: data.alias || null,
        });
    const saved = prepararPropietario(raw);
    setPropietarios((current) => modal.mode === "edit"
      ? current.map((propietario) => propietario.id === saved.id ? saved : propietario)
      : [saved, ...current]);
    actualizarResumen();
    const urlActivacion = enlaceActivacion(raw.activacion);
    setEnlaceActivacion(modal.mode === "edit" ? "" : urlActivacion);
    setAviso(modal.mode === "edit" || !urlActivacion
      ? ""
      : "Propietario creado. Compartí el enlace de activación con su titular.");
    mostrarAviso({
      tipo: "exito",
      titulo: modal.mode === "edit" ? "Propietario actualizado" : "Propietario creado",
      mensaje: modal.mode === "edit" ? "Los datos del propietario se guardaron." : "El propietario ya está en la lista.",
    });
    setModal(null);
  }

  async function generarEnlaceActivacion(propietario) {
    try {
      setError("");
      const activacion = await api.generarEnlacePropietario(propietario.id);
      setEnlaceActivacion(enlaceActivacion(activacion));
      setAviso(`Enlace nuevo para ${propietario.nombreCompleto}. Compartilo con el propietario para activar su cuenta.`);
      mostrarAviso({ tipo: "info", titulo: "Enlace de activación generado", mensaje: "Copialo y compartilo con el propietario para que active su cuenta." });
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo generar el enlace", mensaje: cause.message });
    }
  }

  async function eliminarPropietario() {
    try {
      await api.eliminarPropietario(pendienteEliminar.id);
      setPropietarios((current) => current.filter((propietario) => propietario.id !== pendienteEliminar.id));
      actualizarResumen();
      setAviso("");
      setEnlaceActivacion("");
      mostrarAviso({ tipo: "exito", titulo: "Propietario eliminado", mensaje: "El propietario se eliminó correctamente." });
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo eliminar al propietario", mensaje: cause.message });
    }
    finally { setPendienteEliminar(null); }
  }

  if (cargando) return <PageSkeleton variant="table" title="propietarios" />;

  return (
    <main id="propietarios">
      <div className="propietarios__page">
        <section className="propietarios__overview" aria-labelledby="propietarios-title">
          <div className="propietarios__hero">
            <h1 id="propietarios-title">Propietarios</h1>
            <p>Gestiona la información de todos los propietarios</p>
          </div>

          <div className="propietarios__summary" aria-label="Resumen de propietarios">
            {cards.map(({ key, ...card }) => (
              <PildoraResumen
                key={key}
                {...card}
              />
            ))}
          </div>
        </section>

        {errorResumen && <p className="propietarios__summary-error" role="alert">No se pudo actualizar el resumen: {errorResumen}</p>}
        <section className="propietarios__toolbar" aria-label="Buscar propietarios">
          <label className="propietarios__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input
              type="search"
              placeholder="Buscar propietario..."
              aria-label="Buscar propietario"
              value={textoBusqueda}
              onChange={(event) => { setTextoBusqueda(event.target.value); resetPage(); }}
            />
          </label>
          <Boton
            className="propietarios__new-button"
            onClick={() => setModal({ mode: "create", persona: null })}
            icon={plusIcon}
            text="Nuevo propietario"
          />
        </section>

        <section className="propietarios__table-card" aria-label="Listado de propietarios">
          <div className="propietarios__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Propietario</th>
                  <th>Contacto</th>
                  <th>Propiedad</th>
                  <th>CBU</th>
                  <th>ALIAS</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((propietario) => (
                  <FilaPropietario
                    key={propietario.id}
                    propietario={propietario}
                    onEdit={(persona) => setModal({ mode: "edit", persona })}
                    onDelete={setPendienteEliminar}
                    onGenerateActivation={generarEnlaceActivacion}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {!propietariosVisibles.length && (
            <p className="propietarios__empty">No encontramos propietarios con ese criterio.</p>
          )}
          <Paginacion page={page} totalPages={totalPages} total={propietariosVisibles.length} onPageChange={setPage} />
        </section>
      </div>

      {aviso && (
        <AvisoEnlaceActivacion
          message={aviso}
          url={enlaceActivacionGenerado}
          onDismiss={() => { setAviso(""); setEnlaceActivacion(""); }}
        />
      )}
      {error && <p className="propietarios__notice" role="alert">{error}</p>}

      {modal && (
        <PersonaModal
          kind="owner"
          mode={modal.mode}
          persona={modal.persona}
          onClose={() => setModal(null)}
          onSubmit={guardarPropietario}
        />
      )}
      <ConfirmarEliminacionModal
        isOpen={Boolean(pendienteEliminar)}
        title="¿Seguro que desea eliminar este propietario?"
        onClose={() => setPendienteEliminar(null)}
        onConfirm={eliminarPropietario}
      />
    </main>
  );
}

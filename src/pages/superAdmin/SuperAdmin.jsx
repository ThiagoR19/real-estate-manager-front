import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
import PageSkeleton from "../../components/skeleton/PageSkeleton";

import initials from "../../utils/initials";
import avatarClass from "../../utils/avatarClass";

import { PildoraResumen, Boton, ConfirmarEliminacionModal, mostrarAviso } from "../../components";
import AgencyModal from "./AgencyModal";
import { building, editSuper, plusIcon, trashCanIcon } from "../../assets/icons";
import "./SuperAdmin.css";

function AgencyLogo({ agency }) {
  if (agency.imagenLogo) {
    return (
      <span className="super-admin__inmobiliaria-logo" aria-hidden="true">
        <img src={api.urlRecurso(`/uploads/logos/${agency.imagenLogo}`)} alt="" />
      </span>
    );
  }
  const [primera = "", segunda = ""] = agency.nombre.split(/\s+/);
  return (
    <span className="super-admin__inmobiliaria-logo" aria-hidden="true">
      {initials(primera, segunda)}
    </span>
  );
}

function PersonAvatar({ persona }) {
  const [fotoRota, setFotoRota] = useState(false);
  if (persona.urlFotoPerfil && !fotoRota) {
    return (
      <span className="super-admin__avatar">
        <img src={api.urlRecurso(persona.urlFotoPerfil)} alt="" onError={() => setFotoRota(true)} />
      </span>
    );
  }
  return (
    <span className={`super-admin__avatar ${avatarClass(persona.nombre, persona.apellido)}`}>
      {initials(persona.nombre, persona.apellido)}
    </span>
  );
}

function personasDe(agency) {
  return [
    ...agency.admins.map((admin) => ({ ...admin, tipo: "admin", rol: "Admin", clave: `admin-${admin.id}` })),
    ...agency.agentes.map((agente) => ({ ...agente, tipo: "agente", rol: "Agente", clave: `agente-${agente.id}` })),
  ];
}

function enlaceActivacion(activacion) {
  if (activacion?.enlace) return activacion.enlace;
  return activacion?.codigo
    ? `${window.location.origin}/activar?codigo=${encodeURIComponent(activacion.codigo)}`
    : "";
}

export default function SuperAdmin() {
  const [estado, setEstado] = useState({ inmobiliarias: [], mensaje: "" });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
<<<<<<< HEAD
  const [enviando, setEnviando] = useState(false);
=======
  const [activationUrl, setActivationUrl] = useState("");
  const [activationMessage, setActivationMessage] = useState("");
>>>>>>> a2859aa527e1d617e4560f1c659c76a0fd4d73a8

  const cargar = useCallback(() => {
    let activo = true;
    api.panelSuperAdmin()
      .then((inmobiliarias) => activo && setEstado({ inmobiliarias, mensaje: "" }))
      .catch((causa) => {
        if (!activo) return;
        setEstado({ inmobiliarias: [], mensaje: causa.message });
        mostrarAviso({ tipo: "error", titulo: "No se pudieron cargar las inmobiliarias", mensaje: causa.message });
      })
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => cargar(), [cargar]);

  function reintentar() {
    setLoading(true);
    cargar();
  }

  async function ejecutar(peticion, exito) {
    try {
      await peticion();
      setModal(null);
      mostrarAviso({ tipo: "exito", titulo: exito });
      cargar();
    } catch (causa) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo completar la acción", mensaje: causa.message });
    }
  }

  async function crearInmobiliaria(nombre) {
    await ejecutar(() => api.crearInmobiliaria({ nombre }), "Inmobiliaria creada");
  }

  function editarInmobiliaria(agency, nombre) {
    if (nombre === agency.nombre) {
      setModal(null);
      return;
    }
    ejecutar(() => api.renombrarInmobiliaria(agency.id, nombre), "Inmobiliaria actualizada");
  }

  async function agregarAdmin(agency, datos) {
    setEnviando(true);
    try {
      const admin = await api.crearAdministrador({ ...datos, idInmobiliaria: agency.id });
<<<<<<< HEAD
      setModal({
        mode: "invitacion",
        agency,
        invitacion: { ...admin.activacion, persona: `${datos.nombre} ${datos.apellido}` },
=======
      setModal(null);
      setActivationUrl(enlaceActivacion(admin.activacion));
      setActivationMessage("Compartí el enlace con el administrador para que verifique su DNI y cree su cuenta.");
      mostrarAviso({
        tipo: "exito",
        titulo: "Admin creado",
        mensaje: "El administrador ya puede activar su cuenta con el enlace generado.",
>>>>>>> a2859aa527e1d617e4560f1c659c76a0fd4d73a8
      });
      mostrarAviso({ tipo: "exito", titulo: "Invitación creada", mensaje: "Copiá el enlace y compartilo con el administrador." });
      cargar();
    } catch (causa) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo crear la invitación", mensaje: causa.message });
    } finally {
      setEnviando(false);
    }
  }

  async function generarEnlaceAdmin(persona) {
    try {
      const activacion = await api.generarEnlaceAdministrador(persona.id);
      setActivationUrl(enlaceActivacion(activacion));
      setActivationMessage(`Enlace nuevo para ${persona.nombre} ${persona.apellido}. Compartilo para que pueda crear su cuenta.`);
      mostrarAviso({
        tipo: "info",
        titulo: "Enlace de activación generado",
        mensaje: "Compartilo con el administrador para que cree su cuenta.",
      });
    } catch (causa) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo generar el enlace", mensaje: causa.message });
    }
  }

  async function copiarEnlaceActivacion() {
    try {
      await navigator.clipboard.writeText(activationUrl);
      mostrarAviso({ tipo: "exito", titulo: "Enlace copiado" });
    } catch {
      mostrarAviso({ tipo: "error", titulo: "No se pudo copiar el enlace", mensaje: "Abrilo y copialo desde la barra del navegador." });
    }
  }

  function eliminarPersona(persona) {
    setAEliminar(persona);
  }

  function eliminarInmobiliaria(agency) {
    setModal(null);
    setAEliminar({ ...agency, tipo: "inmobiliaria" });
  }

  async function confirmarEliminar() {
    const elemento = aEliminar;
    setAEliminar(null);
    if (elemento.tipo === "inmobiliaria") {
      await ejecutar(() => api.eliminarInmobiliaria(elemento.id), `Inmobiliaria ${elemento.nombre} eliminada`);
      return;
    }
    const nombre = `${elemento.nombre} ${elemento.apellido}`;
    await ejecutar(() => (elemento.tipo === "admin" ? api.eliminarAdministrador(elemento.id) : api.eliminarAgente(elemento.id)), `${elemento.rol} ${nombre} eliminado`,
    );
  }

  function tituloConfirmacion() {
    if (!aEliminar) return "";
    if (aEliminar.tipo === "inmobiliaria") {
      return `¿Seguro que desea eliminar la inmobiliaria ${aEliminar.nombre}? Se borrarán todos sus datos.`;
    }
    return `¿Seguro que desea eliminar a ${aEliminar.nombre} ${aEliminar.apellido}?`;
  }

  function cambiarRol(persona, rol) {
    if (rol === persona.rol) return;
    const nombre = `${persona.nombre} ${persona.apellido}`;
    ejecutar(
      () => (persona.tipo === "agente" ? api.agenteAAdministrador(persona.id) : api.administradorAAgente(persona.id)),
      `${nombre} ahora es ${rol}`,
    );
  }

  function guardarModal(valor) {
    if (modal.mode === "admin") agregarAdmin(modal.agency, valor);
    else if (modal.mode === "edit") editarInmobiliaria(modal.agency, valor);
    else crearInmobiliaria(valor);
  }


  if (loading) return <PageSkeleton variant="super-admin" />;

  const { inmobiliarias, mensaje } = estado;

  return (
    <main id="super-admin">
      <aside className="super-admin__sidebar">
        <div className="super-admin__side-item is-active">
          <img src={building} alt="" />
          Inmobiliarias
        </div>
      </aside>
      <section className="super-admin__workspace">
        <div className="super-admin__topbar">
          <header className="super-admin__hero">
            <h1>Gestión de inmobiliarias</h1>
            <p>Administra la creación de inmobiliarias, a sus usuarios, etc.</p>
          </header>
          <div className="super-admin__actions">
            <PildoraResumen
              icon={building}
              label="Inmobiliarias activas"
              value={inmobiliarias.length}
              tone="success"
            />
            <Boton
              className="super-admin__new"
              icon={plusIcon}
              text="Nueva inmobiliaria"
              onClick={() => setModal({ mode: "create" })}
            />
          </div>
        </div>
        <section className="super-admin__inmobiliaria-list" aria-label="Inmobiliarias registradas">
<<<<<<< HEAD
=======
          {activationUrl && (
            <div className="super-admin__activation-notice" role="status">
              <p>{activationMessage}</p>
              <a href={activationUrl} target="_blank" rel="noreferrer">Abrir enlace de activación</a>
              <button type="button" onClick={copiarEnlaceActivacion}>Copiar enlace</button>
            </div>
          )}
>>>>>>> a2859aa527e1d617e4560f1c659c76a0fd4d73a8
          {mensaje && (
            <p className="super-admin__no-admins">
              {mensaje}{" "}
              <button className="super-admin__retry" type="button" onClick={reintentar}>
                Reintentar
              </button>
            </p>
          )}
          {!mensaje && !inmobiliarias.length && (
            <p className="super-admin__no-admins">Todavía no hay inmobiliarias registradas.</p>
          )}
          {inmobiliarias.map((agency) => {
            const personas = personasDe(agency);
            const abierta = Boolean(expanded[agency.id]);
            return (
              <article className={`super-admin__inmobiliaria${abierta ? " is-expanded" : ""}`} key={agency.id}>
                <header>
                  <AgencyLogo agency={agency} />
                  <h2>{agency.nombre}</h2>
                  <div className="super-admin__inmobiliaria-controls">
                    <button
                      className="super-admin__add-admin"
                      type="button"
                      onClick={() => setModal({ mode: "admin", agency })}
                    >
                      <span className="material-symbols-outlined">
                        add
                      </span>
                      Añadir admin
                    </button>
                    <button
                      className="super-admin__edit"
                      type="button"
                      onClick={() => setModal({ mode: "edit", agency })}
                      aria-label={`Editar ${agency.nombre}`}
                    >
                      <img src={editSuper} alt="" />
                    </button>
                    <button
                      className="super-admin__expand"
                      type="button"
                      onClick={() => setExpanded((current) => ({ ...current, [agency.id]: !current[agency.id] }))}
                      aria-label={`${abierta ? "Contraer" : "Expandir"} ${agency.nombre}`}
                      aria-expanded={abierta}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                </header>
                {abierta && (
                  <div className="super-admin__admins">
                    {personas.length ? (
                      personas.map((persona) => (
                        <article className="super-admin__admin" key={persona.clave}>
                          <PersonAvatar persona={persona} />
                          <button
                            className="super-admin__delete"
                            type="button"
                            onClick={() => eliminarPersona(persona)}
                            aria-label={`Eliminar a ${persona.nombre} ${persona.apellido}`}
                          >
                            <img src={trashCanIcon} alt="" />
                          </button>
                          <h3>
                            {persona.nombre} {persona.apellido}
                          </h3>
                          <label className="super-admin__role-label" htmlFor={`rol-${persona.clave}`}>Rol</label>
                          <select
                            className={`super-admin__rol super-admin__rol--${persona.tipo}`}
                            id={`rol-${persona.clave}`}
                            value={persona.rol}
                            onChange={(event) => cambiarRol(persona, event.target.value)}
                            aria-label={`Rol de ${persona.nombre} ${persona.apellido}`}
                          >
                            <option>Admin</option>
                            <option>Agente</option>
                          </select>
                          {persona.tipo === "admin" && persona.estadoCuenta === "PENDIENTE_ACTIVACION" && (
                            <button
                              className="super-admin__activation-link"
                              type="button"
                              onClick={() => generarEnlaceAdmin(persona)}
                            >
                              Generar enlace para crear cuenta
                            </button>
                          )}
                        </article>
                      ))
                    ) : (
                      <p className="super-admin__no-admins">
                        Esta inmobiliaria todavía no tiene administradores ni agentes.
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </section>
      {modal && (
        <AgencyModal
          key={`${modal.mode}-${modal.agency?.id || "new"}`}
          mode={modal.mode}
          agency={modal.agency && { ...modal.agency, name: modal.agency.nombre }}
          invitacion={modal.invitacion}
          enviando={enviando}
          onClose={() => setModal(null)}
          onSubmit={guardarModal}
          onDelete={modal.mode === "edit" ? () => eliminarInmobiliaria(modal.agency) : undefined}
        />
      )}
      <ConfirmarEliminacionModal
        isOpen={Boolean(aEliminar)}
        title={tituloConfirmacion()}
        onClose={() => setAEliminar(null)}
        onConfirm={confirmarEliminar}
      />
    </main>
  );
}

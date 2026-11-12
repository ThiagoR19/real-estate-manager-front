import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";

import initials from "../../utils/initials";
import avatarClass from "../../utils/avatarClass";

import { SummaryPill, Button, AgencyModal, ConfirmDeleteModal, mostrarToast } from "../../components";
import { building, editSuper, plusIcon, trashCanIcon } from "../../assets/icons";
import "./SuperAdmin.css";

function AgencyLogo({ agency }) {
  if (agency.imagenLogo) {
    return (
      <span className="super-admin__agency-logo" aria-hidden="true">
        <img src={api.assetUrl(`/uploads/logos/${agency.imagenLogo}`)} alt="" />
      </span>
    );
  }
  const [primera = "", segunda = ""] = agency.nombre.split(/\s+/);
  return (
    <span className="super-admin__agency-logo" aria-hidden="true">
      {initials(primera, segunda)}
    </span>
  );
}

function PersonAvatar({ persona }) {
  const [fotoRota, setFotoRota] = useState(false);
  if (persona.urlFotoPerfil && !fotoRota) {
    return (
      <span className="super-admin__avatar">
        <img src={api.assetUrl(persona.urlFotoPerfil)} alt="" onError={() => setFotoRota(true)} />
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

export default function SuperAdmin() {
  const [estado, setEstado] = useState({ inmobiliarias: [], mensaje: "" });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const cargar = useCallback(() => {
    let activo = true;
    api.superAdminPanel()
      .then((inmobiliarias) => activo && setEstado({ inmobiliarias, mensaje: "" }))
      .catch((causa) => {
        if (!activo) return;
        setEstado({ inmobiliarias: [], mensaje: causa.message });
        mostrarToast({ tipo: "error", titulo: "No se pudieron cargar las inmobiliarias", mensaje: causa.message });
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
      mostrarToast({ tipo: "exito", titulo: exito });
      cargar();
    } catch (causa) {
      mostrarToast({ tipo: "error", titulo: "No se pudo completar la acción", mensaje: causa.message });
    }
  }

  function crearInmobiliaria(nombre) {
    const body = { nombre }
    api.createAgency(body)
      .then((res) => {
        mostrarToast({ tipo: "exito", titulo: "Exito!", mensaje: "Inmobiliaria creada exitosamente" })
        console.log(res)
        cargar()
      })
      .catch((error) => {
        mostrarToast({ tipo: "error", titulo: "Oh, algo ha salido mal", mensaje: `ha ocurrido un ${error.menssage}` })
      })
  }

  function editarInmobiliaria(agency, nombre) {
    if (nombre === agency.nombre) {
      setModal(null);
      return;
    }
    ejecutar(() => api.renameAgency(agency.id, nombre), "Inmobiliaria actualizada");
  }

  async function agregarAdmin(agency, datos) {
    try {
      const admin = await api.createAdmin({ ...datos, idInmobiliaria: agency.id });
      setModal(null);
      mostrarToast({
        tipo: "exito",
        titulo: "Admin creado",
        mensaje: `Código de activación de ${admin.usuario}: ${admin.activacion?.codigo ?? "-"}`,
      });
      cargar();
    } catch (causa) {
      mostrarToast({ tipo: "error", titulo: "No se pudo crear el admin", mensaje: causa.message });
    }
  }

  // Abre la confirmación; recién al confirmar se hace el DELETE
  function eliminarPersona(persona) {
    setAEliminar(persona);
  }

  // Abre la confirmación para borrar la inmobiliaria que se está editando
  function eliminarInmobiliaria(agency) {
    setAEliminar({ ...agency, tipo: "inmobiliaria" });
  }

  async function confirmarEliminar() {
    const elemento = aEliminar;
    setAEliminar(null);
    if (elemento.tipo === "inmobiliaria") {
      await ejecutar(() => api.deleteAgency(elemento.id), `Inmobiliaria ${elemento.nombre} eliminada`);
      return;
    }
    const nombre = `${elemento.nombre} ${elemento.apellido}`;
    await ejecutar(() => (elemento.tipo === "admin" ? api.deleteAdmin(elemento.id) : api.deleteAgent(elemento.id)), `${elemento.rol} ${nombre} eliminado`,
    );
  }

  function tituloConfirmacion() {
    if (!aEliminar) return "";
    if (aEliminar.tipo === "inmobiliaria") {
      return `¿Seguro que desea eliminar la inmobiliaria ${aEliminar.nombre}? Se borrarán todos sus datos.`;
    }
    return `¿Seguro que desea eliminar a ${aEliminar.nombre} ${aEliminar.apellido}?`;
  }

  // Agente → Admin: PATCH /agentes/:id/ADMIN | Admin → Agente: PATCH /admins/:id/agente
  function cambiarRol(persona, rol) {
    if (rol === persona.rol) return;
    const nombre = `${persona.nombre} ${persona.apellido}`;
    ejecutar(
      () => (persona.tipo === "agente" ? api.agentToAdmin(persona.id) : api.adminToAgent(persona.id)),
      `${nombre} ahora es ${rol}`,
    );
  }

  function guardarModal(valor) {
    if (modal.mode === "admin") agregarAdmin(modal.agency, valor);
    else if (modal.mode === "edit") editarInmobiliaria(modal.agency, valor);
    else crearInmobiliaria(valor);
  }

  // Mientras carga no se muestra la página (acá va a ir el skeleton)
  if (loading) return <main id="super-admin" aria-busy="true" />;

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
            <SummaryPill
              icon={building}
              label="Inmobiliarias activas"
              value={inmobiliarias.length}
              tone="success"
            />
            <Button
              className="super-admin__new"
              icon={plusIcon}
              text="Nueva inmobiliaria"
              onClick={() => setModal({ mode: "create" })}
            />
          </div>
        </div>
        <section className="super-admin__agency-list" aria-label="Inmobiliarias registradas">
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
              <article className={`super-admin__agency${abierta ? " is-expanded" : ""}`} key={agency.id}>
                <header>
                  <AgencyLogo agency={agency} />
                  <h2>{agency.nombre}</h2>
                  <div className="super-admin__agency-controls">
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
                          <label className="super-admin__role-label" htmlFor={`rol-${persona.clave}`}>
                            Rol
                          </label>
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
          onClose={() => setModal(null)}
          onSubmit={guardarModal}
          onDelete={modal.mode === "edit" ? () => eliminarInmobiliaria(modal.agency) : undefined}
        />
      )}
      <ConfirmDeleteModal
        isOpen={Boolean(aEliminar)}
        title={tituloConfirmacion()}
        onClose={() => setAEliminar(null)}
        onConfirm={confirmarEliminar}
      />
    </main>
  );
}

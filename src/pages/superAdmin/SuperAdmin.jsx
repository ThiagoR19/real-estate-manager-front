import { assetUrl } from "../../utils/assetUrl.js";
import { useCallback, useState } from "react";
import { api } from "../../services/api";
import useListadoPaginado from "../../hooks/useListadoPaginado.js";
import EstadoListado from "../../components/paginacion/EstadoListado.jsx";
import PaginacionServidor from "../../components/paginacion/PaginacionServidor.jsx";
import PersonalSuperAdmin from "./PersonalSuperAdmin.jsx";

import initials from "../../utils/initials";

import { PildoraResumen, Boton, ConfirmarEliminacionModal, mostrarAviso } from "../../components";
import InmobiliariaModal from "./InmobiliariaModal";
import { angleDownIcon, building, editSuper, plusIcon } from "../../assets/icons";
import "./SuperAdmin.css";

function InmobiliariaLogo({ inmobiliaria }) {
  if (inmobiliaria.imagenLogo) {
    return (
      <span className="super-admin__inmobiliaria-logo" aria-hidden="true">
        <img src={assetUrl(`/uploads/logos/${inmobiliaria.imagenLogo}`)} alt="" />
      </span>
    );
  }
  const [primera = "", segunda = ""] = inmobiliaria.nombre.split(/\s+/);
  return (
    <span className="super-admin__inmobiliaria-logo" aria-hidden="true">
      {initials(primera, segunda)}
    </span>
  );
}

function enlaceActivacion(activacion) {
  if (activacion?.enlace) return activacion.enlace;
  return activacion?.codigo ? `${window.location.origin}/activar?codigo=${encodeURIComponent(activacion.codigo)}` : "";
}

export default function SuperAdmin() {
  const listado = useListadoPaginado(api.inmobiliarias);
  const inmobiliarias = listado.datos;
  const mensaje = listado.error;
  const [versionUsuarios, setVersionUsuarios] = useState(0);
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const recargarListado = listado.recargar;
  const cargar = useCallback(() => {
    recargarListado();
    setVersionUsuarios((actual) => actual + 1);
  }, [recargarListado]);
  const reintentar = listado.recargar;

  async function ejecutar(peticion, exito) {
    try {
      await peticion();
      setModal(null);
      mostrarAviso({ tipo: "exito", titulo: exito });
      cargar();
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo completar la acción", mensaje: error.message });
    }
  }

  async function crearInmobiliaria(nombre) {
    await ejecutar(() => api.crearInmobiliaria({ nombre }), "Inmobiliaria creada");
  }

  function editarInmobiliaria(inmobiliaria, nombre) {
    if (nombre === inmobiliaria.nombre) {
      setModal(null);
      return;
    }
    ejecutar(() => api.renombrarInmobiliaria(inmobiliaria.id, nombre), "Inmobiliaria actualizada");
  }

  async function agregarAdmin(inmobiliaria, datos) {
    setEnviando(true);
    try {
      const admin = await api.crearAdministrador({ ...datos, idInmobiliaria: inmobiliaria.id });
      setModal({
        mode: "invitacion",
        inmobiliaria,
        invitacion: {
          enlace: enlaceActivacion(admin.activacion),
          expiraEn: admin.activacion?.expiraEn,
          persona: `${datos.nombre} ${datos.apellido}`,
        },
      });
      mostrarAviso({ tipo: "exito", titulo: "Invitación creada", mensaje: "Copiá el enlace y compartilo con el administrador." });
      cargar();
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo crear la invitación", mensaje: error.message });
    } finally {
      setEnviando(false);
    }
  }

  async function generarEnlaceAdmin(inmobiliaria, persona) {
    try {
      const activacion = await api.generarEnlaceAdministrador(persona.id);
      setModal({
        mode: "invitacion",
        inmobiliaria,
        invitacion: {
          titulo: "Enlace generado",
          enlace: enlaceActivacion(activacion),
          expiraEn: activacion?.expiraEn,
          persona: `${persona.nombre} ${persona.apellido}`,
        },
      });
      mostrarAviso({
        tipo: "info",
        titulo: "Enlace de activación generado",
        mensaje: "Compartilo con el administrador para que cree su cuenta.",
      });
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo generar el enlace", mensaje: error.message });
    }
  }

  function eliminarPersona(persona) {
    setAEliminar(persona);
  }

  function eliminarInmobiliaria(inmobiliaria) {
    setModal(null);
    setAEliminar({ ...inmobiliaria, tipo: "inmobiliaria" });
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
    ejecutar(() => (persona.tipo === "agente" ? api.agenteAAdministrador(persona.id) : api.administradorAAgente(persona.id)), `${nombre} ahora es ${rol}`,);
  }

  function guardarModal(valor) {
    if (modal.mode === "admin") agregarAdmin(modal.inmobiliaria, valor);
    else if (modal.mode === "edit") editarInmobiliaria(modal.inmobiliaria, valor);
    else crearInmobiliaria(valor);
  }



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
              value={listado.paginacion?.total ?? "—"}
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
          {mensaje && (
            <p className="super-admin__no-admins">
              {mensaje}{" "}
              <button className="super-admin__retry" type="button" onClick={reintentar}>
                Reintentar
              </button>
            </p>
          )}
          {!listado.cargando && !mensaje && !inmobiliarias.length && (
            <p className="super-admin__no-admins">Todavía no hay inmobiliarias registradas.</p>
          )}
          <EstadoListado cargando={listado.cargando} />
          {inmobiliarias.map((inmobiliaria) => {
            const abierta = Boolean(expanded[inmobiliaria.id]);
            return (
              <article className={`super-admin__inmobiliaria${abierta ? " is-expanded" : ""}`} key={inmobiliaria.id}>
                <header>
                  <InmobiliariaLogo inmobiliaria={inmobiliaria} />
                  <h2>{inmobiliaria.nombre}</h2>
                  <div className="super-admin__inmobiliaria-controls">
                    <button
                      className="super-admin__add-admin"
                      type="button"
                      onClick={() => setModal({ mode: "admin", inmobiliaria })}
                    >
                      <span className="material-symbols-outlined">
                        add
                      </span>
                      Añadir admin
                    </button>
                    <button
                      className="super-admin__edit"
                      type="button"
                      onClick={() => setModal({ mode: "edit", inmobiliaria })}
                      aria-label={`Editar ${inmobiliaria.nombre}`}
                    >
                      <img src={editSuper} alt="" />
                    </button>
                    <button
                      className="super-admin__expand"
                      type="button"
                      onClick={() => setExpanded((current) => ({ ...current, [inmobiliaria.id]: !current[inmobiliaria.id] }))}
                      aria-label={`${abierta ? "Contraer" : "Expandir"} ${inmobiliaria.nombre}`}
                      aria-expanded={abierta}
                    >
                      <img src={angleDownIcon} alt="" aria-hidden="true" />
                    </button>
                  </div>
                </header>
                {abierta && <p className="super-admin__no-admins">
                  Consultá Administradores o Agentes más abajo para gestionar usuarios de la inmobiliaria #{inmobiliaria.id}.
                </p>}
              </article>
            );
          })}
        </section>
        <PaginacionServidor paginacion={listado.paginacion} alCambiar={listado.cambiarPagina} />
        <PersonalSuperAdmin tipo="admin" version={versionUsuarios} alEliminar={eliminarPersona} alCambiarRol={cambiarRol} alGenerarEnlace={generarEnlaceAdmin} />
        <PersonalSuperAdmin tipo="agente" version={versionUsuarios} alEliminar={eliminarPersona} alCambiarRol={cambiarRol} alGenerarEnlace={generarEnlaceAdmin} />
      </section>
      {modal && (
        <InmobiliariaModal
          key={`${modal.mode}-${modal.inmobiliaria?.id || "new"}`}
          mode={modal.mode}
          inmobiliaria={modal.inmobiliaria && { ...modal.inmobiliaria, name: modal.inmobiliaria.nombre }}
          invitacion={modal.invitacion}
          enviando={enviando}
          onClose={() => setModal(null)}
          onSubmit={guardarModal}
          onDelete={modal.mode === "edit" ? () => eliminarInmobiliaria(modal.inmobiliaria) : undefined}
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

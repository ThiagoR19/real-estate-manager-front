import { useEffect, useState } from "react";
import { envelopeIcon, peopleIcon, phoneIcon, penIcon, plusIcon, starIcon, trashCanIcon, } from "../../assets/icons/index.js";
import {SelectDesplegable,ConfirmarEliminacionModal,GestionModal,AccionesModal,Boton,Paginacion,usePaginacion,mostrarAviso,} from "../../components/index.js";
import ProfesionalModal from "./ProfesionalModal";
import "./Profesionales.css";

import { api } from "../../services/api.js";
import { ROLES, tieneRol } from "../../utils/roles.js";
import avatarClass from "../../utils/avatarClass.js";

export default function Profesionales() {
  const [profesionales, setProfesionales] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("Tipo");
  const [modal, setModal] = useState({ isOpen: false, mode: "create", profesional: null });
  const [pendienteEliminar, setPendienteEliminar] = useState(null);
  const [pendienteValorar, setPendienteValorar] = useState(null);
  const [puntuacionSeleccionada, setPuntuacionSeleccionada] = useState(0);
  const [enviandoValoracion, setEnviandoValoracion] = useState(false);
  const [error, setError] = useState("");
  const puedeValorar = tieneRol(ROLES.AGENTE);

  useEffect(() => {
    let active = true;
    api
      .profesionales()
      .then((rows) => { if (active) setProfesionales(rows); })
      .catch((error) => {
        if (!active) return;
        setError(error.message);
        mostrarAviso({ tipo: "error", titulo: "No se pudieron cargar los profesionales", mensaje: error.message });
      });
    return () => { active = false; };
  }, []);

  const opcionesFiltro = [
    "Tipo",
    ...new Set(profesionales.map((item) => item.profesion).filter(Boolean)),
  ];
  const profesionalesVisibles =
    tipoSeleccionado === "Tipo"
      ? profesionales
      : profesionales.filter(({ profesion }) => profesion === tipoSeleccionado);
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(profesionalesVisibles);

  function abrirModalCreacion() {
    setModal({ isOpen: true, mode: "create", profesional: null });
  }

  function editarProfesional(profesional) {
    setModal({ isOpen: true, mode: "edit", profesional });
  }

  function cerrarModalProfesional() {
    setModal((current) => ({ ...current, isOpen: false }));
  }

  async function guardarProfesional(formulario) {
    const body = {
      nombre: formulario.nombre,
      apellido: formulario.apellido,
      correo: formulario.correo || null,
      telefono: formulario.telefono || null,
      profesion: formulario.profesion,
    };
    if (modal.mode === "edit") {
      const saved = await api.actualizarProfesional(modal.profesional.id, body);
      setProfesionales((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      mostrarAviso({ tipo: "exito", titulo: "Profesional actualizado", mensaje: `Se actualizó la información de ${formulario.nombreCompleto}.` });
    } else {
      const saved = await api.crearProfesional(body);
      setProfesionales((current) => [...current, saved]);
      mostrarAviso({ tipo: "exito", titulo: "Profesional agregado", mensaje: `Se agregó a ${formulario.nombreCompleto} a la lista.` });
    }
    cerrarModalProfesional();
  }

  async function eliminarProfesional(profesional) {
    try {
      await api.eliminarProfesional(profesional.id);
      setProfesionales((current) => current.filter(({ id }) => id !== profesional.id));
      mostrarAviso({ tipo: "exito", titulo: "Profesional eliminado", mensaje: `${profesional.nombre} ${profesional.apellido} fue eliminado de la lista.` });
      setPendienteEliminar(null);
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo eliminar al profesional", mensaje: error.message });
    }
  }

  async function enviarValoracion(event) {
    event.preventDefault();
    if (!pendienteValorar || !puntuacionSeleccionada || enviandoValoracion) return;
    setEnviandoValoracion(true);
    try {
      const saved = await api.valorarProfesional(pendienteValorar.id, puntuacionSeleccionada);
      setProfesionales((current) => current.map((item) => item.id === saved.id ? saved : item));
      setPendienteValorar(null);
      setPuntuacionSeleccionada(0);
      mostrarAviso({ tipo: "exito", titulo: "Valoración guardada", mensaje: `Valoraste a ${saved.nombre} ${saved.apellido} con ${puntuacionSeleccionada} estrellas.` });
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo guardar la valoración", mensaje: error.message });
    } finally {
      setEnviandoValoracion(false);
    }
  }

  return (
    <main id="profesionales">
      <section className="profesionales__top" aria-label="Encabezado y filtros de profesionales">
        <div className="profesionales__intro">
          <h1>Profesionales</h1>
          <p>Gestiona la información de todos los profesionales</p>
        </div>

        <div className="profesionales__toolbar">
          <SelectDesplegable
            label="Tipo de profesional"
            placeholder="Tipo"
            value={tipoSeleccionado}
            options={opcionesFiltro}
            onChange={(value) => { setTipoSeleccionado(value); resetPage(); }}
            icon={peopleIcon}
            className="profesionales__filter"
            triggerClassName="profesionales__filter-trigger"
            iconClassName="profesionales__filter-icon"
            chevronClassName="profesionales__filter-arrow"
            optionsClassName="profesionales__filter-options"
          />

          <Boton
            className="profesionales__new"
            onClick={abrirModalCreacion}
            icon={plusIcon}
            text="Nuevo profesional"
          />
        </div>
      </section>

      <section className="profesionales__table-card" aria-label="Lista de profesionales">
        <div className="profesionales__table-scroll">
          <table className="profesionales__table">
            <colgroup>
              <col className="profesionales__column profesionales__column--profesionales" />
              <col className="profesionales__column profesionales__column--email" />
              <col className="profesionales__column profesionales__column--phone" />
              <col className="profesionales__column profesionales__column--rating" />
              <col className="profesionales__column profesionales__column--actions" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Profesional</th>
                <th scope="col">Email</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Rating</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((profesional) => (
                <tr key={profesional.id}>
                  <th scope="row" data-label="Profesional">
                    <div className="profesionales__identity">
                      <span className={`profesionales__avatar ${avatarClass(profesional.nombre, profesional.apellido)}`} aria-hidden="true">
                        {profesional.nombre?.[0]}
                        {profesional.apellido?.[0]}
                      </span>
                      <span>
                        <strong>
                          {profesional.nombre} {profesional.apellido}
                        </strong>
                        <small>{profesional.profesion}</small>
                      </span>
                    </div>
                  </th>
                  <td data-label="Contacto">
                    <span className="profesionales__contact">
                      <img src={envelopeIcon} alt="" />
                      <span title={profesional.correo}>{profesional.correo}</span>
                    </span>
                  </td>
                  <td data-label="Teléfono">
                    <span className="profesionales__contact">
                      <img src={phoneIcon} alt="" />
                      <span title={profesional.telefono}>{profesional.telefono}</span>
                    </span>
                  </td>
                  <td data-label="Rating">
                    {(() => {
                      const puntuacion = Number(profesional.ratingPromedio) || 0;
                      const cantidadResenas = Number(profesional.cantidadResenas) || 0;
                      return (
                        <div className="profesionales__rating">
                          <span
                            className="profesionales__rating-stars"
                            role="img"
                            aria-label={`${puntuacion.toFixed(1)} de 5 estrellas`}
                            style={{ "--rating-percent": `${puntuacion * 20}%` }}
                          >
                            ★★★★★
                          </span>
                          <strong>{puntuacion.toFixed(1)}</strong>
                          <small>({cantidadResenas}) votos</small>
                        </div>
                      );
                    })()}
                  </td>
                  <td data-label="Acciones">
                    <div className="profesionales__actions">
                      {puedeValorar && <button
                        className="profesionales__rate"
                        type="button"
                        aria-label={profesional.miVoto != null
                          ? `Ya valoraste a ${profesional.nombre} ${profesional.apellido} con ${profesional.miVoto} estrellas`
                          : `Valorar a ${profesional.nombre} ${profesional.apellido}`}
                        disabled={profesional.miVoto != null}
                        onClick={() => { setPendienteValorar(profesional); setPuntuacionSeleccionada(0); }}
                      >
                        <img src={starIcon} alt="" />
                        <span>{profesional.miVoto != null ? "Votado" : "Valorar"}</span>
                      </button>}
                      <button
                        className="profesionales__action profesionales__action--edit"
                        type="button"
                        aria-label={`Editar profesional: ${profesional.nombre} ${profesional.apellido}`}
                        onClick={() => editarProfesional(profesional)}
                      >
                        <img src={penIcon} alt="" />
                      </button>
                      <button
                        className="profesionales__action profesionales__action--delete"
                        type="button"
                        aria-label={`Eliminar profesional: ${profesional.nombre} ${profesional.apellido}`}
                        onClick={() => setPendienteEliminar(profesional)}
                      >
                        <img src={trashCanIcon} alt="" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {profesionalesVisibles.length === 0 && (
          <p className="profesionales__empty">No hay profesionales para este tipo.</p>
        )}
        <Paginacion page={page} totalPages={totalPages} total={profesionalesVisibles.length} onPageChange={setPage} />
      </section>

      {error && (
        <p className="profesionales__feedback" role="alert">
          {error}
        </p>
      )}

      <ConfirmarEliminacionModal
        isOpen={Boolean(pendienteEliminar)}
        onClose={() => setPendienteEliminar(null)}
        onConfirm={() => eliminarProfesional(pendienteEliminar)}
        title="¿Eliminar este profesional? Sus reportes quedarán sin profesional asignado."
      />

      {pendienteValorar && (
        <GestionModal
          isOpen
          onClose={() => { if (!enviandoValoracion) setPendienteValorar(null); }}
          title={`Valorar a ${pendienteValorar.nombre} ${pendienteValorar.apellido}`}
          subtitle="Cada agente puede votar una sola vez por profesional."
        >
          <form onSubmit={enviarValoracion}>
            <fieldset className="profesionales__vote-options" disabled={enviandoValoracion}>
              <legend>Elegí de 1 a 5 estrellas</legend>
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className={puntuacionSeleccionada === value ? "is-selected" : ""}>
                  <input type="radio" name="puntuacion" value={value} checked={puntuacionSeleccionada === value} onChange={() => setPuntuacionSeleccionada(value)} />
                  <span aria-hidden="true">★</span>{value}
                </label>
              ))}
            </fieldset>
            <AccionesModal onClose={() => setPendienteValorar(null)} submitText="Enviar valoración" disabled={!puntuacionSeleccionada || enviandoValoracion} />
          </form>
        </GestionModal>
      )}

      {modal.isOpen && (
        <ProfesionalModal
          isOpen={modal.isOpen}
          mode={modal.mode}
          profesional={
            modal.profesional && {
              ...modal.profesional,
              nombreCompleto: `${modal.profesional.nombre} ${modal.profesional.apellido}`,
              correo: modal.profesional.correo,
              telefono: modal.profesional.telefono,
              profesion: modal.profesional.profesion,
            }
          }
          onClose={cerrarModalProfesional}
          onSubmit={guardarProfesional}
        />
      )}
    </main>
  );
}

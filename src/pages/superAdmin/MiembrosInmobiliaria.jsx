import { useState } from "react";
import { assetUrl } from "../../utils/assetUrl.js";
import { api } from "../../services/api.js";
import useListadoInfinito from "../../hooks/useListadoInfinito.js";
import CargaAlFinal from "../../components/paginacion/CargaAlFinal.jsx";
import { linkIcon, trashCanIcon } from "../../assets/icons";
import initials from "../../utils/initials.js";
import avatarClass from "../../utils/avatarClass.js";

function AvatarPersona({ persona }) {
  const [fotoRota, setFotoRota] = useState(false);
  if (persona.urlFotoPerfil && !fotoRota) {
    return (
      <span className="super-admin__avatar">
        <img src={assetUrl(persona.urlFotoPerfil)} alt="" onError={() => setFotoRota(true)} />
      </span>
    );
  }
  return (
    <span className={`super-admin__avatar ${avatarClass(persona.nombre, persona.apellido)}`}>
      {initials(persona.nombre, persona.apellido)}
    </span>
  );
}

export default function MiembrosInmobiliaria({ inmobiliaria, version, alEliminar, alCambiarRol, alGenerarEnlace }) {
  const filtros = { idInmobiliaria: inmobiliaria.id };
  const admins = useListadoInfinito(api.todosLosAdministradores, { filtros, version });
  const agentes = useListadoInfinito(api.todosLosAgentes, { filtros, version, habilitada: !admins.hayMas && !admins.error });
  const listadoActivo = admins.hayMas || admins.error ? admins : agentes;
  const personas = [
    ...admins.datos.map((admin) => ({ ...admin, tipo: "admin", rol: "Admin", clave: `admin-${admin.id}` })),
    ...agentes.datos.map((agente) => ({ ...agente, tipo: "agente", rol: "Agente", clave: `agente-${agente.id}` })),
  ];
  const terminado = !admins.hayMas && !agentes.hayMas && !admins.error && !agentes.error;

  return (
    <div className="super-admin__admins">
      {personas.map((persona) => (
        <article className="super-admin__admin" key={persona.clave}>
          <AvatarPersona persona={persona} />
          <button
            className="super-admin__delete"
            type="button"
            onClick={() => alEliminar(persona)}
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
            onChange={(event) => alCambiarRol(persona, event.target.value)}
            aria-label={`Rol de ${persona.nombre} ${persona.apellido}`}
          >
            <option>Admin</option>
            <option>Agente</option>
          </select>
          {persona.tipo === "admin" && persona.estadoCuenta === "PENDIENTE_ACTIVACION" && (
            <button
              className="super-admin__activation-link"
              type="button"
              onClick={() => alGenerarEnlace(inmobiliaria, persona)}
              aria-label={`Generar enlace para que ${persona.nombre} ${persona.apellido} cree su cuenta`}
              title="Generar enlace para crear cuenta"
            >
              <span className="super-admin__activation-icon" style={{ "--icono-enlace": `url("${linkIcon}")` }} aria-hidden="true" />
            </button>
          )}
        </article>
      ))}
      {terminado && !personas.length && (
        <p className="super-admin__no-admins">Esta inmobiliaria todavía no tiene administradores ni agentes.</p>
      )}
      {listadoActivo.cargando && <p className="super-admin__no-admins" role="status">Cargando miembros...</p>}
      {listadoActivo.error && (
        <p className="super-admin__no-admins" role="alert">
          {listadoActivo.error}{" "}
          <button className="super-admin__retry" type="button" onClick={listadoActivo.reintentar}>Reintentar</button>
        </p>
      )}
      <CargaAlFinal activa={listadoActivo.hayMas && !listadoActivo.cargando && !listadoActivo.error} alLlegar={listadoActivo.cargarMas} />
    </div>
  );
}

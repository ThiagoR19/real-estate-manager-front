import { useState } from "react";
import { assetUrl } from "../../utils/assetUrl.js";
import { api } from "../../services/api.js";
import useListadoPaginado from "../../hooks/useListadoPaginado.js";
import EstadoListado from "../../components/paginacion/EstadoListado.jsx";
import PaginacionServidor from "../../components/paginacion/PaginacionServidor.jsx";
import initials from "../../utils/initials.js";
import avatarClass from "../../utils/avatarClass.js";

function AvatarPersonal({ persona }) {
  const [fotoRota, setFotoRota] = useState(false);
  return <span className={`super-admin__avatar ${avatarClass(persona.nombre, persona.apellido)}`}>
    {persona.urlFotoPerfil && !fotoRota ? <img src={assetUrl(persona.urlFotoPerfil)} alt="" onError={() => setFotoRota(true)} /> : initials(persona.nombre, persona.apellido)}
  </span>;
}

export default function PersonalSuperAdmin({ tipo, version, alEliminar, alCambiarRol, alGenerarEnlace }) {
  const [busqueda, setBusqueda] = useState("");
  const esAgente = tipo === "agente";
  const listado = useListadoPaginado(esAgente ? api.todosLosAgentes : api.todosLosAdministradores, { busqueda, version });
  const titulo = esAgente ? "Agentes" : "Administradores";
  return <section className="super-admin__personal" aria-label={titulo}>
    <h2>{titulo}</h2>
    {esAgente && <input type="search" value={busqueda} maxLength={255} aria-label="Buscar agentes de todas las inmobiliarias"
      placeholder="Buscar agentes..." onChange={(evento) => setBusqueda(evento.target.value)} />}
    <EstadoListado cargando={listado.cargando} error={listado.error} alReintentar={listado.recargar} vacio={!listado.datos.length} />
    <div className="super-admin__admins">
      {listado.datos.map((registro) => {
        const persona = { ...registro, tipo, rol: esAgente ? "Agente" : "Admin" };
        const inmobiliaria = { id: persona.idInmobiliaria, nombre: `Inmobiliaria #${persona.idInmobiliaria}` };
        return <article className="super-admin__admin" key={persona.id}>
          <AvatarPersonal persona={persona} />
          <h3>{persona.nombre} {persona.apellido}</h3>
          <p>{inmobiliaria.nombre}</p>
          <select className="super-admin__rol" value={persona.rol} aria-label={`Rol de ${persona.nombre} ${persona.apellido}`}
            onChange={(evento) => alCambiarRol(persona, evento.target.value)}>
            <option>Admin</option><option>Agente</option>
          </select>
          <button type="button" onClick={() => alEliminar(persona)}>Eliminar a {persona.nombre} {persona.apellido}</button>
          {!esAgente && persona.estadoCuenta === "PENDIENTE_ACTIVACION" &&
            <button type="button" onClick={() => alGenerarEnlace(inmobiliaria, persona)}>Generar enlace para crear cuenta</button>}
        </article>;
      })}
    </div>
    <PaginacionServidor paginacion={listado.paginacion} alCambiar={listado.cambiarPagina} />
  </section>;
}

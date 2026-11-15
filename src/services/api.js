import * as servicioDashboard from "./dashboard.js";
import * as servicioAgentes from "./agentes.js";
import * as servicioPropietarios from "./propietarios.js";
import * as servicioLogin from "./login.js";
import * as servicioPropiedades from "./propiedades.js";
import * as servicioPerfil from "./perfil.js";
import * as servicioProfesionales from "./profesionales.js";
import * as servicioInquilinos from "./inquilinos.js";
import * as servicioIndec from "./indec.js";
import * as servicioContVisita from "./contVisita.js";
import * as servicioVisitas from "./visitas.js";
import * as servicioChats from "./chats.js";
import * as servicioPropiedadesPropietario from "./propiedadesPropietario.js";
import * as servicioDocumentos from "./documentos.js";
import * as servicioNotificaciones from "./notificaciones.js";
import { assetUrl } from "../utils/assetUrl.js";
import * as servicioInmobiliarias from "./inmobiliarias.js";
import * as servicioMiInmobiliaria from "./miInmobiliaria.js";
import * as servicioInfoInmobiliaria from "./infoInmobiliaria.js";

export const api = {
  agentes: servicioAgentes.agentes,
  areas: servicioAgentes.areas,
  crearAgente: servicioAgentes.crearAgente,
  generarEnlaceAgente: servicioAgentes.generarEnlaceAgente,
  propietarios: servicioPropietarios.propietarios,
  crearPropietario: servicioPropietarios.crearPropietario,
  actualizarPropietario: servicioPropietarios.actualizarPropietario,
  eliminarPropietario: servicioPropietarios.eliminarPropietario,
  inmobiliarias: servicioInmobiliarias.inmobiliarias,
  administradores: servicioInmobiliarias.todosLosAdministradores,
  crearInmobiliaria: servicioInmobiliarias.crearInmobiliaria,
  crearAdministrador: servicioInmobiliarias.crearAdministrador,
  eliminarAdministrador: servicioInmobiliarias.eliminarAdministrador,
  actualizarAgente: servicioAgentes.actualizarAgente,
  eliminarAgente: servicioAgentes.eliminarAgente,
  obtenerSesion: servicioLogin.obtenerSesion,
  guardarSesion: servicioLogin.guardarSesion,
  limpiarSesion: servicioLogin.limpiarSesion,
  login: servicioLogin.login,
  registrar: servicioLogin.registrar,
  verificarDniInvitacion: servicioLogin.verificarDniInvitacion,
  cerrarSesion: servicioLogin.cerrarSesion,
  urlRecurso: assetUrl,
  catalogosPropiedades: servicioPropiedades.catalogosPropiedades,
  propiedades: servicioPropiedades.propiedades,
  propiedad: servicioPropiedades.propiedad,
  archivosPropiedad: servicioPropiedades.archivosPropiedad,
  crearPropiedad: servicioPropiedades.crearPropiedad,
  actualizarPropiedad: servicioPropiedades.actualizarPropiedad,
  eliminarPropiedad: servicioPropiedades.eliminarPropiedad,
  subirArchivosPropiedad: servicioPropiedades.subirArchivosPropiedad,
  eliminarArchivoPropiedad: servicioPropiedades.eliminarArchivoPropiedad,
  descargarDocumentoPropiedad: servicioPropiedades.descargarDocumentoPropiedad,
  obtenerPropiedad: servicioPropiedades.obtenerPropiedad,
  perfil: servicioPerfil.perfil,
  actualizarPerfil: servicioPerfil.actualizarPerfil,
  actualizarContrasena: servicioPerfil.actualizarContrasena,
  actualizarFotoPerfil: servicioPerfil.actualizarFotoPerfil,
  inquilinos: servicioInquilinos.inquilinos,
  inquilino: servicioInquilinos.inquilino,
  archivosInquilino: servicioInquilinos.archivosInquilino,
  crearInquilino: servicioInquilinos.crearInquilino,
  actualizarInquilino: servicioInquilinos.actualizarInquilino,
  eliminarInquilino: servicioInquilinos.eliminarInquilino,
  subirArchivosInquilino: servicioInquilinos.subirArchivosInquilino,
  eliminarArchivoInquilino: servicioInquilinos.eliminarArchivoInquilino,
  descargarDocumentoInquilino: servicioInquilinos.descargarDocumentoInquilino,
  profesionales: servicioProfesionales.profesionales,
  crearProfesional: servicioProfesionales.crearProfesional,
  actualizarProfesional: servicioProfesionales.actualizarProfesional,
  eliminarProfesional: servicioProfesionales.eliminarProfesional,
  indec: servicioIndec.indec,
  crearIndec: servicioIndec.crearIndec,
  dashboard: servicioDashboard.obtenerDashboard,
  contVisita: servicioContVisita.sumarVisita,
  visitas: servicioVisitas.visitas,
  todasLasVisitas: servicioVisitas.todasLasVisitas,
  clientesVisitas: servicioVisitas.clientesVisitas,
  crearClienteVisita: servicioVisitas.crearClienteVisita,
  crearVisita: servicioVisitas.crearVisita,
  actualizarVisita: servicioVisitas.actualizarVisita,
  cancelarVisita: servicioVisitas.cancelarVisita,
  conversaciones: servicioChats.conversaciones,
  contactosChat: servicioChats.contactos,
  mensajesChat: servicioChats.mensajes,
  enviarMensajeChat: servicioChats.enviarMensaje,
  iniciarConversacion: servicioChats.iniciarConversacion,
  marcarChatLeido: servicioChats.marcarLeido,
  descargarAdjuntoChat: servicioChats.descargarAdjunto,
  contratos: servicioPropiedadesPropietario.contratos,
  reportes: servicioPropiedadesPropietario.reportes,
  documentosContrato: servicioDocumentos.documentosContrato,
  descargarDocumento: servicioDocumentos.descargarDocumento,
  notificaciones: servicioNotificaciones.notificaciones,
  marcarNotificacionLeida: servicioNotificaciones.marcarNotificacionLeida,
  todosLosAdministradores: servicioInmobiliarias.todosLosAdministradores,
  todosLosAgentes: servicioInmobiliarias.todosLosAgentes,
  panelSuperAdmin: servicioInmobiliarias.panelSuperAdmin,
  eliminarInmobiliaria: servicioInmobiliarias.eliminarInmobiliaria,
  renombrarInmobiliaria: servicioInmobiliarias.renombrarInmobiliaria,
  administradorAAgente: servicioInmobiliarias.administradorAAgente,
  agenteAAdministrador: servicioInmobiliarias.agenteAAdministrador,
  miInmobiliaria: servicioMiInmobiliaria.miInmobiliaria,
  actualizarMiInmobiliaria: servicioMiInmobiliaria.actualizarMiInmobiliaria,
  infoInmobiliaria: servicioInfoInmobiliaria.infoInmobiliaria,
  propiedadesDestacadas: servicioInfoInmobiliaria.propiedadesDestacadas,
};

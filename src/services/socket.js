import { io } from "socket.io-client";
import { obtenerSesion } from "./login.js";
import { apiBase } from "../utils/request.js";

const servidor = /^https?:\/\//.test(apiBase) ? new URL(apiBase).origin : undefined;
let socket = null;
let tokenActual = null;

export function obtenerSocket() {
  const token = obtenerSesion()?.token;
  if (!token) {
    cerrarSocket();
    return null;
  }
  if (socket && tokenActual === token) return socket;

  cerrarSocket();
  tokenActual = token;
  socket = io(servidor, { auth: { token }, transports: ["websocket", "polling"] });
  socket.on("connect_error", (error) => {
    const codigo = error?.data?.codigo;
    if (codigo === "TOKEN_INVALIDO" || codigo === "TOKEN_FALTANTE") cerrarSocket();
  });
  return socket;
}

export function cerrarSocket() {
  socket?.disconnect();
  socket = null;
  tokenActual = null;
}

window.addEventListener("session-updated", () => {
  if (socket && obtenerSesion()?.token !== tokenActual) cerrarSocket();
});

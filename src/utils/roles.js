import { obtenerSesion } from "../services/login.js";

export const ROLES = {
  SUPERADMIN: 1,
  ADMIN: 2,
  AGENTE: 3,
  PROPIETARIO: 4,
  INQUILINO: 5,
};

export const NOMBRE_ROL = {
  [ROLES.SUPERADMIN]: "Super admin",
  [ROLES.ADMIN]: "Administrador",
  [ROLES.AGENTE]: "Agente",
  [ROLES.PROPIETARIO]: "Propietario",
  [ROLES.INQUILINO]: "Inquilino",
};

export const PERSONAL = [ROLES.ADMIN, ROLES.AGENTE];
export const TODOS_LOS_ROLES = Object.values(ROLES);

export function rolActual() {
  return Number(obtenerSesion()?.usuario?.rol);
}

export function tieneRol(...roles) {
  return roles.includes(rolActual());
}

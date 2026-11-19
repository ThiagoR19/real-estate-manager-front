import { createContext, useContext } from "react";

export const InmobiliariaPublicaContext = createContext({ inmobiliaria: null, cargando: true });

export default function useInmobiliariaPublica() {
  return useContext(InmobiliariaPublicaContext);
}

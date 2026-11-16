import { createContext, useContext } from "react";

// Datos públicos de la inmobiliaria de esta instancia. Los carga LayoutPublico una sola vez
// y quedan disponibles para todas las vistas de la landing.
export const InmobiliariaPublicaContext = createContext({ inmobiliaria: null, cargando: true });

// Devuelve { inmobiliaria, cargando } desde cualquier vista que esté dentro de LayoutPublico
export default function useInmobiliariaPublica() {
  return useContext(InmobiliariaPublicaContext);
}

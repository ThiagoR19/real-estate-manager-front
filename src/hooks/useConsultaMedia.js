import { useEffect, useState } from "react";

const coincide = (consulta) =>
  typeof window !== "undefined" && window.matchMedia(consulta).matches;

export default function useConsultaMedia(consulta) {
  const [activa, setActiva] = useState(() => coincide(consulta));

  useEffect(() => {
    const media = window.matchMedia(consulta);
    const actualizar = () => setActiva(media.matches);
    actualizar();
    media.addEventListener("change", actualizar);
    return () => media.removeEventListener("change", actualizar);
  }, [consulta]);

  return activa;
}

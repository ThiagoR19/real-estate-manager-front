import { Skeleton, NavegacionPortada, Estadisticas, TituloSeccion, Footer } from "../../components";
import BuscadorPropiedades from "./BuscadorPropiedades";
import TarjetaPropiedad from "./TarjetaPropiedad";

import fondoInicio from "../../assets/homeHero.png";

import "./Inicio.css";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";

// Cantidad de propiedades que se muestran en "Propiedades destacadas"
const CANTIDAD_DESTACADAS = 8;

export default function Inicio() {
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState({});
  const [propiedades, setPropiedades] = useState([]);

  const cargar = useCallback(() => {
    let activo = true;
    Promise.allSettled([api.infoInmobiliaria(), api.propiedadesDestacadas(CANTIDAD_DESTACADAS)])
      .then(([info, lista]) => {
        if (!activo) return;
        if (info.status === "fulfilled") setDatos(info.value);
        else console.error(info.reason);
        if (lista.status === "fulfilled") setPropiedades(lista.value);
        else console.error(lista.reason);
      })
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => cargar(), [cargar]);

  return (
    <Skeleton fondos={[fondoInicio]}>
      {!loading &&
        <>
          <section className="Inicio" data-sk-fondo>
            <NavegacionPortada
              URLLogo={datos.urlLogo}
            />

            <div className="Inicio__contenido">
              <h1 className="Inicio__titulo">
                Encuentra el hogar <span>de tus sueños</span>
              </h1>

              <p className="Inicio__texto">Las mejores propiedades en las ubicaciones más exclusivas</p>

              <BuscadorPropiedades className="Inicio__buscador" />
            </div>
          </section>

          <main>
            <Estadisticas
              anios={datos.aniosExperiencia}
              vendidas={datos.propiedadesVendidas}
              activas={datos.propiedadesActivas}
            />

            <section className="Propiedades" aria-labelledby="propiedades-titulo">
              <TituloSeccion
                id="propiedades-titulo"
                titulo="Propiedades destacadas"
                subtitulo="Las mejores opciones disponibles"
              />

              {propiedades.length ? (
                <div className="Propiedades__lista">
                  {propiedades.map((propiedad) => (
                    <TarjetaPropiedad key={propiedad.id} propiedad={propiedad} />
                  ))}
                </div>
              ) : (
                <p className="Propiedades__vacio">Todavía no hay propiedades publicadas.</p>
              )}
            </section>
          </main>

          <Footer 
          anios={datos.aniosExperiencia}
          URLLogo={datos.urlLogo}
          inmobiliaria={datos.nombre}
          />
        </>
      }
    </Skeleton>
  );
}

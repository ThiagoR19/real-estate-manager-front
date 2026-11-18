import { Skeleton, Estadisticas, TituloSeccion, mostrarAviso } from "../../components";
import BuscadorPropiedades from "./BuscadorPropiedades";
import TarjetaPropiedad from "./TarjetaPropiedad";

import fondoInicio from "../../assets/homeHero.png";

import "./Inicio.css";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";

// Cantidad de propiedades que se muestran en "Propiedades destacadas"
const CANTIDAD_DESTACADAS = 8;

// Tarjetas de relleno que se ven en skeleton mientras llegan las destacadas
const TARJETAS_RELLENO = Array.from({ length: 4 }, (_, indice) => ({
  id: `relleno-${indice}`,
  titulo: "Propiedad destacada",
  direccion: "Dirección de la propiedad",
  dormitorios: "-",
  banos: "-",
  superficie: "-",
  operacion: "Venta",
}));

// loading y datos vienen de LayoutPublico (datos de la inmobiliaria); acá solo se piden las destacadas.
// Mientras falte cualquiera de las dos cosas la vista se muestra en skeleton.
export default function Inicio({ loading, datos }) {
  const [cargandoPropiedades, setCargandoPropiedades] = useState(true);
  const [propiedades, setPropiedades] = useState([]);
  const cargando = loading || cargandoPropiedades;

  const cargar = useCallback(() => {
    let activo = true;
    api.propiedadesDestacadas(CANTIDAD_DESTACADAS)
      .then((lista) => activo && setPropiedades(lista))
      .catch((causa) => {
        console.error(causa);
        if (activo) mostrarAviso({ tipo: "error", titulo: "No se pudieron cargar las propiedades destacadas", mensaje: causa.message });
      })
      .finally(() => activo && setCargandoPropiedades(false));
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => cargar(), [cargar]);

  return (
    <Skeleton fondos={[fondoInicio]} cargando={cargando}>
      <section className="Inicio" data-sk-fondo style={{ backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.35) 0%, rgba(15, 23, 42, 0) 60%), url("${datos?.urlPrincipal ?? fondoInicio}")`, }}>
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
          anios={datos?.aniosExperiencia}
          vendidas={datos?.propiedadesVendidas}
          activas={datos?.propiedadesActivas}
        />

        <section className="Propiedades" aria-labelledby="propiedades-titulo">
          <TituloSeccion
            id="propiedades-titulo"
            titulo="Propiedades destacadas"
            subtitulo="Las mejores opciones disponibles"
          />

          {cargando || propiedades.length ? (
            <div className="Propiedades__lista">
              {(cargando ? TARJETAS_RELLENO : propiedades).map((propiedad) => (
                <TarjetaPropiedad key={propiedad.id} propiedad={propiedad} />
              ))}
            </div>
          ) : (
            <p className="Propiedades__vacio">Todavía no hay propiedades publicadas.</p>
          )}
        </section>
      </main>
    </Skeleton>
  );
}

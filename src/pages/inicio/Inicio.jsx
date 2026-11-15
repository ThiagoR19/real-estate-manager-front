import { Skeleton, NavegacionPortada, Estadisticas, TituloSeccion, Footer, } from "../../components";
import BuscadorPropiedades from "./BuscadorPropiedades";
import TarjetaPropiedad from "./TarjetaPropiedad";

import fondoInicio from "../../assets/homeHero.png";

import "./Inicio.css";

// TODO: imágenes provisorias (public/), reemplazar por las de cada propiedad
const imagenCasa = "/images%20(1).jpg";
const imagenTerraza = "/images.jpg";
const imagenVilla = "/ly-villa-costa-blanca-1_b02f5d33_900x900.jpg";

// TODO: reemplazar por los datos de la API
const propiedades = [
  {
    id: 1,
    titulo: "Departamento en Belgrano",
    direccion: "Av. Cabildo 2450, CABA",
    imagen: imagenTerraza,
    dormitorios: 2,
    banos: 2,
    superficie: 80,
    operacion: "Alquiler",
  },
  {
    id: 2,
    titulo: "Casa en Nordelta",
    direccion: "Av. de los Lagos 7010, Tigre",
    imagen: imagenCasa,
    dormitorios: 4,
    banos: 3,
    superficie: 240,
    operacion: "Venta",
  },
  {
    id: 3,
    titulo: "PH en Palermo",
    direccion: "Gorriti 4870, CABA",
    imagen: imagenVilla,
    dormitorios: 3,
    banos: 2,
    superficie: 110,
    operacion: "Alquiler",
  },
  {
    id: 4,
    titulo: "Casa en Pilar",
    direccion: "Ruta 8 Km 50, Pilar",
    imagen: imagenCasa,
    dormitorios: 5,
    banos: 4,
    superficie: 320,
    operacion: "Venta",
  },
  {
    id: 5,
    titulo: "Departamento en Núñez",
    direccion: "Av. del Libertador 7200, CABA",
    imagen: imagenTerraza,
    dormitorios: 2,
    banos: 1,
    superficie: 65,
    operacion: "Alquiler",
  },
  {
    id: 6,
    titulo: "Loft en Recoleta",
    direccion: "Ayacucho 1650, CABA",
    imagen: imagenVilla,
    dormitorios: 1,
    banos: 1,
    superficie: 55,
    operacion: "Alquiler",
  },
  {
    id: 7,
    titulo: "Casa en Ushuaia",
    direccion: "Bielke 747, Ushuaia",
    imagen: imagenCasa,
    dormitorios: 3,
    banos: 2,
    superficie: 150,
    operacion: "Venta",
  },
  {
    id: 8,
    titulo: "Departamento en Caballito",
    direccion: "Av. Rivadavia 5100, CABA",
    imagen: imagenTerraza,
    dormitorios: 3,
    banos: 2,
    superficie: 90,
    operacion: "Venta",
  },
];

export default function Inicio() {
  return (
    <Skeleton fondos={[fondoInicio]}>
      <section className="Inicio" data-sk-fondo>
        <NavegacionPortada />

        <div className="Inicio__contenido">
          <h1 className="Inicio__titulo">
            Encuentra el hogar <span>de tus sueños</span>
          </h1>

          <p className="Inicio__texto">Las mejores propiedades en las ubicaciones más exclusivas</p>

          <BuscadorPropiedades className="Inicio__buscador" />
        </div>
      </section>

      <main>
        <Estadisticas />

        <section className="Propiedades" aria-labelledby="propiedades-titulo">
          <TituloSeccion
            id="propiedades-titulo"
            titulo="Propiedades disponibles"
            subtitulo="Las mejores opciones disponibles"
          />

          <div className="Propiedades__lista">
            {propiedades.map((propiedad) => (
              <TarjetaPropiedad key={propiedad.id} propiedad={propiedad} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </Skeleton>
  );
}

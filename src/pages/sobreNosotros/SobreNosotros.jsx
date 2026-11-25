import { Skeleton, Estadisticas, TituloSeccion } from "../../components";

import fondoPortada from "../../assets/nosotrosHero.png";
import {
  manosIcon,
  libroIcon,
  medallaIcon,
  casaNosotrosIcon,
  valanzaIcon,
  camaraNosotrosIcon,
  llaveNosotrosIcon,
} from "../../assets/icons";

import "./SobreNosotros.css";

const valores = [
  { titulo: "Confianza", texto: "Garantizamos relaciones seguras", icono: manosIcon },
  { titulo: "Transparencia", texto: "Información clara en cada paso", icono: libroIcon },
  { titulo: "Excelencia", texto: "Calidad en cada operación", icono: medallaIcon },
];

const servicios = [
  {
    titulo: "Tasaciones profesionales",
    texto:
      "Determinamos el valor real y competitivo de tu propiedad con un análisis exhaustivo del mercado actual.",
    icono: casaNosotrosIcon,
  },
  {
    titulo: "Asesoramiento legal",
    texto: "Te acompañamos con contratos claros y gestiones seguras en cada etapa de la operación.",
    icono: valanzaIcon,
  },
  {
    titulo: "Fotografía profesional",
    texto: "Mostramos tu propiedad con imágenes de calidad que destacan sus mejores espacios.",
    icono: camaraNosotrosIcon,
  },
  {
    titulo: "Administración de alquileres",
    texto: "Nos ocupamos de cobros, contratos y mantenimiento para que no tengas que preocuparte.",
    icono: llaveNosotrosIcon,
  },
];

export default function SobreNosotros({ datos, loading, navegacion }) {
  return (
    <Skeleton className="Nosotros" cargando={loading}>
      <section
        className="Portada"
        data-sk-fondo
        style={{ backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.35) 0%, rgba(15, 23, 42, 0) 60%), url("${datos?.urlBanner ?? fondoPortada}")` }}
      >
        {navegacion}
        <div className="Portada__contenido">
          <h1 className="Portada__titulo">
            Sobre <span>nosotros</span>
          </h1>

          <p className="Portada__texto">Transformando sueños en hogares desde hace 15 años</p>
        </div>
      </section>

      <main>
        <p className="Presentacion">
          En KAIKEN PROPIEDADES nos apasiona conectar a las personas con su hogar ideal. Ofrecemos
          un asesoramiento transparente, ágil y personalizado en cada paso del camino.
        </p>

        <ul className="Valores" aria-label="Nuestros valores">
          {valores.map(({ titulo, texto, icono }) => (
            <li key={titulo} className="Valores__tarjeta">
              <span className="Valores__icono">
                <img src={icono} alt="" />
              </span>
              <h2 className="Valores__titulo">{titulo}</h2>
              <p className="Valores__texto">{texto}</p>
            </li>
          ))}
        </ul>

        <Estadisticas
          anios={datos?.aniosExperiencia}
          vendidas={datos?.propiedadesVendidas}
          activas={datos?.propiedadesActivas}
        />

        <section className="Servicios" aria-labelledby="servicios-titulo">
          <TituloSeccion
            id="servicios-titulo"
            titulo="Nuestros servicios principales"
            subtitulo="Ofrecemos soluciones integrales y personalizadas para acompañarte en cada etapa"
          />

          <ul className="Servicios__lista">
            {servicios.map(({ titulo, texto, icono }) => (
              <li key={titulo} className="Servicios__tarjeta">
                <span className="Servicios__icono">
                  <img src={icono} alt="" />
                </span>
                <h3 className="Servicios__titulo">{titulo}</h3>
                <p className="Servicios__texto">{texto}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

    </Skeleton>
  );
}

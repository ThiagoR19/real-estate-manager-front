import { Skeleton, Estadisticas, TituloSeccion } from "../../components";

import fondoPortada from "../../assets/nosotrosHero.png";
import confianzaIcono from "../../assets/icons/manosIcon.svg";
import transparenciaIcono from "../../assets/icons/libroIcon.svg";
import excelenciaIcono from "../../assets/icons/medallaIcon.svg";
import tasacionIcono from "../../assets/icons/casaNosotrosIcon.svg";
import legalIcono from "../../assets/icons/valanzaIcon.svg";
import camaraIcono from "../../assets/icons/camaraNosotrosIcon.svg";
import llaveIcono from "../../assets/icons/llaveNosotrosIcon.svg";

import "./SobreNosotros.css";

const valores = [
  { titulo: "Confianza", texto: "Garantizamos relaciones seguras", icono: confianzaIcono },
  { titulo: "Transparencia", texto: "Información clara en cada paso", icono: transparenciaIcono },
  { titulo: "Excelencia", texto: "Calidad en cada operación", icono: excelenciaIcono },
];

const servicios = [
  {
    titulo: "Tasaciones profesionales",
    texto:
      "Determinamos el valor real y competitivo de tu propiedad con un análisis exhaustivo del mercado actual.",
    icono: tasacionIcono,
  },
  {
    titulo: "Asesoramiento legal",
    texto: "Te acompañamos con contratos claros y gestiones seguras en cada etapa de la operación.",
    icono: legalIcono,
  },
  {
    titulo: "Fotografía profesional",
    texto: "Mostramos tu propiedad con imágenes de calidad que destacan sus mejores espacios.",
    icono: camaraIcono,
  },
  {
    titulo: "Administración de alquileres",
    texto: "Nos ocupamos de cobros, contratos y mantenimiento para que no tengas que preocuparte.",
    icono: llaveIcono,
  },
];

export default function SobreNosotros({ datos, loading }) {
  return (
    <Skeleton className="Nosotros" fondos={[fondoPortada]} cargando={loading}>
      <section className="Portada" data-sk-fondo>

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

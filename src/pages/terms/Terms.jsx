import { useRef, useState } from "react";
import {
  arrowsRotateIcon,
  circleInfoIcon,
  desktopIcon,
  envelopeIcon,
  fileLinesIcon as fileIcon,
  houseIcon,
  lockIcon,
  shieldHalvedIcon as shieldIcon,
  userIcon,
} from "../../assets/icons";
import "./Terms.css";

const sections = [
  {
    id: "introduccion",
    title: "Introducción",
    icon: fileIcon,
    text: "AGI Propiedades es una plataforma para organizar la gestión inmobiliaria en un solo lugar. Permite administrar propiedades, propietarios, inquilinos, agentes, contratos, pagos y comunicaciones de forma más simple y ordenada.",
  },
  {
    id: "uso-del-sistema",
    title: "Uso del sistema",
    icon: desktopIcon,
    text: "El sistema debe utilizarse únicamente para actividades relacionadas con la administración y comercialización de inmuebles. Cada usuario debe cargar información verdadera, mantenerla actualizada y evitar cualquier uso que pueda afectar a la plataforma o a otras personas.",
  },
  {
    id: "cuentas-de-usuario",
    title: "Cuentas de usuario",
    icon: userIcon,
    text: "Cada cuenta es personal y debe utilizarse con las credenciales asignadas a su titular. El usuario es responsable de mantener su contraseña en reserva y debe informar de inmediato cualquier acceso no autorizado o actividad sospechosa.",
  },
  {
    id: "propiedades-y-datos",
    title: "Propiedades y datos",
    icon: houseIcon,
    text: "La información de las propiedades, sus documentos y sus condiciones debe ser exacta y estar actualizada. Solo deben incorporarse datos y archivos que el usuario esté autorizado a administrar, respetando los derechos de sus titulares.",
  },
  {
    id: "responsabilidades",
    title: "Responsabilidades",
    icon: shieldIcon,
    text: "AGI Propiedades brinda herramientas para facilitar la gestión, pero cada usuario debe revisar la información antes de tomar decisiones o compartirla. La plataforma no reemplaza el asesoramiento legal, contable o profesional que pueda requerir cada operación.",
  },
  {
    id: "privacidad",
    title: "Privacidad",
    icon: lockIcon,
    text: "Los datos se utilizan para prestar y mejorar las funciones de la plataforma, gestionar las operaciones y facilitar las comunicaciones autorizadas. El acceso debe limitarse a las personas que lo necesitan para cumplir sus tareas y tratarse con la debida confidencialidad.",
  },
  {
    id: "limitaciones",
    title: "Limitaciones",
    icon: circleInfoIcon,
    text: "El servicio puede presentar interrupciones por mantenimiento, fallas técnicas o causas externas. Aunque se procura mantener la información disponible y segura, se recomienda conservar respaldos de los documentos importantes y verificar los datos antes de utilizarlos.",
  },
  {
    id: "modificaciones",
    title: "Modificaciones",
    icon: arrowsRotateIcon,
    text: "Estos términos pueden actualizarse para reflejar cambios en la plataforma, en sus funciones o en la normativa aplicable. Cuando una modificación sea relevante, se comunicará por los canales disponibles; continuar usando el sistema después de su publicación implica aceptar la versión vigente.",
  },
  {
    id: "contacto",
    title: "Contacto",
    icon: envelopeIcon,
    text: "Si necesitás ayuda, querés reportar un problema o tenés una consulta sobre estos términos, podés comunicarte con el equipo de AGI Propiedades a través de los canales de atención habilitados. Para agilizar la respuesta, incluí tu nombre, el detalle de la consulta y la sección relacionada.",
  },
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const contentRef = useRef(null);
  const sectionRefs = useRef({});

  function navigateToSection(event, id) {
    event.preventDefault();
    const section = sectionRefs.current[id];
    const content = contentRef.current;

    if (!section || !content) return;

    setActiveSection(id);
    content.scrollTo({
      top: Math.min(section.offsetTop, content.scrollHeight - content.clientHeight),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    section.focus({ preventScroll: true });
  }

  function updateActiveSection() {
    const content = contentRef.current;
    if (content.scrollTop + content.clientHeight >= content.scrollHeight - 2) {
      setActiveSection(sections.at(-1).id);
      return;
    }
    const currentSection = sections.findLast(
      ({ id }) => sectionRefs.current[id].offsetTop <= content.scrollTop + 24,
    );

    if (currentSection) setActiveSection(currentSection.id);
  }

  return (
    <main id="terms">
      <div className="terms__div">
        <aside className="terms__div-aside" id="terms-navigation">
          <nav className="terms__div-aside-nav" aria-label="Secciones de términos y condiciones">
            {sections.map(({ id, title, icon }) => (
              <a
                key={id}
                className="terms__aside-nav-a"
                href={`#terms-${id}`}
                aria-current={activeSection === id ? "location" : undefined}
                onClick={(event) => navigateToSection(event, id)}
              >
                <img src={icon} className="terms__nav-a-img" alt="" />
                <span className="terms__nav-a-span">{title}</span>
              </a>
            ))}
          </nav>
        </aside>

        <section className="terms__div-section" aria-labelledby="terms-title">
          <header className="terms__div-section-header">
            <h1 className="terms__section-header-h1" id="terms-title">Términos y condiciones</h1>
            <p className="terms__section-header-p">Condiciones de uso, responsabilidad y uso de la plataforma</p>
          </header>

          <div
            className="terms__div-section-div"
            ref={contentRef}
            onScroll={updateActiveSection}
            role="region"
            aria-label="Contenido de términos y condiciones"
            tabIndex={0}
          >
            {sections.map(({ id, title, text }, index) => (
              <section
                key={id}
                className="terms__section-div-section"
                id={`terms-${id}`}
                aria-labelledby={`terms-heading-${id}`}
                tabIndex={-1}
                ref={(element) => { sectionRefs.current[id] = element; }}
              >
                <span className="terms__div-section-span" aria-hidden="true">{index + 1}</span>
                <article className="terms__div-section-article">
                  <h2 className="terms__section-article-h2" id={`terms-heading-${id}`}>{title}</h2>
                <p className="terms__section-article-p">{text}</p>
                </article>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

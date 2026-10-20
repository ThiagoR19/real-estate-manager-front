import { useRef, useState } from "react";
import { Link } from "wouter";
import addressCardIcon from "../../assets/icons/address-card-regular-full.svg";
import buildingIcon from "../../assets/icons/building-columns-solid-full.svg";
import clockIcon from "../../assets/icons/clock-regular-full.svg";
import phoneIcon from "../../assets/icons/phone-solid-full.svg";
import "./Terms.css";

const sections = [
  {
    id: "introduccion",
    title: "Introducción",
    icon: addressCardIcon,
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like sometimes on purpose (injected humour and the like).",
  },
  {
    id: "uso-del-sistema",
    title: "Uso del sistema",
    icon: buildingIcon,
    text: "Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like sometimes on purpose (injected humour and the like).",
  },
  {
    id: "cuentas-de-usuario",
    title: "Cuentas de usuario",
    icon: addressCardIcon,
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like",
  },
  {
    id: "propiedades-y-datos",
    title: "Propiedades y datos",
    icon: buildingIcon,
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of",
  },
  { id: "responsabilidades", title: "Responsabilidades", icon: buildingIcon },
  { id: "privacidad", title: "Privacidad", icon: addressCardIcon },
  { id: "limitaciones", title: "Limitaciones", icon: addressCardIcon },
  { id: "modificaciones", title: "Modificaciones", icon: clockIcon },
  { id: "contacto", title: "Contacto", icon: phoneIcon },
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [navigationHidden, setNavigationHidden] = useState(false);
  const contentRef = useRef(null);
  const sectionRefs = useRef({});

  function navigateToSection(event, id) {
    event.preventDefault();
    const section = sectionRefs.current[id];
    const content = contentRef.current;

    if (!section || !content) return;

    setActiveSection(id);
    content.scrollTo({
      top: section.offsetTop,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    section.focus({ preventScroll: true });
  }

  function updateActiveSection() {
    const content = contentRef.current;
    const currentSection = sections.findLast(
      ({ id }) => sectionRefs.current[id].offsetTop <= content.scrollTop + 24,
    );

    if (currentSection) setActiveSection(currentSection.id);
  }

  return (
    <main id="terms">
      <header className="terms__header">
        <button
          className="terms__header-button"
          type="button"
          aria-label={navigationHidden ? "Mostrar secciones" : "Ocultar secciones"}
          aria-expanded={!navigationHidden}
          aria-controls="terms-navigation"
          onClick={() => setNavigationHidden(!navigationHidden)}
        >
          <img src={addressCardIcon} className="terms__header-button-img" alt="" />
        </button>

        <Link href="/dashboard" className="terms__header-a" aria-label="AGI, inicio">
          <img src={buildingIcon} className="terms__header-a-img" alt="" />
          <strong className="terms__header-a-strong">AGI</strong>
        </Link>

        <nav className="terms__header-nav" aria-label="Navegación principal">
          <Link href="/properties" className="terms__header-nav-a">Propiedades</Link>
          <span className="terms__header-nav-span">Agenda</span>
        </nav>

        <aside className="terms__header-aside" aria-label="Cuenta de usuario">
          <details className="terms__header-aside-details">
            <summary className="terms__aside-details-summary" aria-label="Notificaciones">
              <img src={clockIcon} className="terms__details-summary-img" alt="" />
            </summary>
            <p className="terms__aside-details-p">No tenés notificaciones nuevas.</p>
          </details>
          <Link href="/profile" className="terms__header-aside-a">
            <span className="terms__aside-a-span">
              Juan Pérez
              <small className="terms__a-span-small">Agente</small>
            </span>
            <i className="terms__aside-a-i" aria-hidden="true" />
          </Link>
        </aside>
      </header>

      <div className="terms__div" data-navigation-hidden={navigationHidden}>
        <aside className="terms__div-aside" id="terms-navigation" hidden={navigationHidden}>
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
                  <p className="terms__section-article-p">{text ?? sections[1].text}</p>
                </article>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

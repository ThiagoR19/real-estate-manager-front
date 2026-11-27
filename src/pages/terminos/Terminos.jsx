import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { fileLinesIcon } from "../../assets/icons";
import { sections } from "../../context/terminos.js";
import "./Terminos.css";

export default function Terminos({ publico = false }) {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const contentRef = useRef(null);
  const sectionRefs = useRef({});

  function irASeccion(event, id) {
    event.preventDefault();
    const section = sectionRefs.current[id];
    const content = contentRef.current;

    if (!section) return;

    setActiveSection(id);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth";
    if (window.matchMedia("(max-width: 760px)").matches) {
      section.scrollIntoView({ behavior, block: "start" });
    } else if (content) {
      content.scrollTo({
        top: Math.min(section.offsetTop, content.scrollHeight - content.clientHeight),
        behavior,
      });
    }
    section.focus({ preventScroll: true });
  }

  const updateActiveSection = useCallback(() => {
    const content = contentRef.current;
    if (window.matchMedia("(max-width: 760px)").matches) {
      const currentSection = [...sections].reverse().find(({ id }) => sectionRefs.current[id]?.getBoundingClientRect().top <= 140);
      if (currentSection) setActiveSection(currentSection.id);
      return;
    }
    if (!content) return;
    if (content.scrollTop + content.clientHeight >= content.scrollHeight - 2) {
      setActiveSection(sections.at(-1).id);
      return;
    }
    const currentSection = sections.findLast(
      ({ id }) => sectionRefs.current[id].offsetTop <= content.scrollTop + 24,
    );

    if (currentSection) setActiveSection(currentSection.id);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [updateActiveSection]);

  return (
    <main id="terminos" className={publico ? "terminos--publico" : undefined}>
      <div className="terminos__div">
        <aside className="terminos__div-aside" id="terminos-navigation">
          <nav className="terminos__div-aside-nav" aria-label="Secciones de términos y condiciones">
            {sections.map(({ id, title, icon }) => (
              <a
                key={id}
                className="terminos__aside-nav-a"
                href={`#terminos-${id}`}
                aria-current={activeSection === id ? "location" : undefined}
                onClick={(event) => irASeccion(event, id)}
              >
                <img src={icon} className="terminos__nav-a-img" alt="" />
                <span className="terminos__nav-a-span">{title}</span>
              </a>
            ))}
          </nav>
        </aside>

        <section className="terminos__div-section" aria-labelledby="terminos-title">
          {publico && <Link href="/login" className="terminos__volver">Volver al login</Link>}
          <header className="terminos__div-section-header">
            <h1 className="terminos__section-header-h1" id="terminos-title">
              Términos y condiciones
            </h1>
            <p className="terminos__section-header-p">
              Condiciones de uso, responsabilidad y uso de la plataforma
            </p>
          </header>

          <label className="terminos__mobile-documentation">
            <img src={fileLinesIcon} alt="" />
            <span className="sr-only">Ir a sección</span>
            <select
              value={activeSection}
              onChange={(event) => {
                const section = sectionRefs.current[event.target.value];
                if (section) {
                  setActiveSection(event.target.value);
                  section.scrollIntoView({
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
                    block: "start",
                  });
                }
              }}
              aria-label="Ir a sección de términos"
            >
              {sections.map(({ id, title }) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
            <span aria-hidden="true">⌄</span>
          </label>

          <div
            className="terminos__div-section-div"
            ref={contentRef}
            onScroll={updateActiveSection}
            role="region"
            aria-label="Contenido de términos y condiciones"
            tabIndex={0}
          >
            {sections.map(({ id, title, text }, index) => (
              <section
                key={id}
                className="terminos__section-div-section"
                id={`terminos-${id}`}
                aria-labelledby={`terminos-heading-${id}`}
                tabIndex={-1}
                ref={(element) => {
                  sectionRefs.current[id] = element;
                }}
              >
                <span className="terminos__div-section-span" aria-hidden="true">
                  {index + 1}
                </span>
                <article className="terminos__div-section-article">
                  <h2 className="terminos__section-article-h2" id={`terminos-heading-${id}`}>
                    {title}
                  </h2>
                  <p className="terminos__section-article-p">{text}</p>
                </article>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

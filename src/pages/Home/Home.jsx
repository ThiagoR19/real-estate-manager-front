import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import fondoCasa from "../../assets/fondoCasa.png";
import { Icon } from "../../components/home/HomeIcon";
import "./Home.css";

const properties = [
  { id: 1, image: "/images.jpg", title: "Departamento en Belgrano", location: "Av. Cabildo 2450, CABA", type: "Alquiler", rooms: 2, baths: 2, area: 80 },
  { id: 2, image: "/images.jpg", title: "Departamento en Belgrano", location: "Av. Cabildo 2450, CABA", type: "Alquiler", rooms: 2, baths: 2, area: 80 },
  { id: 3, image: "/images (1).jpg", title: "Casa moderna en Palermo", location: "Av. Dorrego 1800, CABA", type: "Venta", rooms: 3, baths: 2, area: 145 },
  { id: 4, image: "/ly-villa-costa-blanca-1_b02f5d33_900x900.jpg", title: "Casa con jardín en Nordelta", location: "Los Alamos 120, Tigre", type: "Alquiler", rooms: 4, baths: 3, area: 220 },
  { id: 5, image: "/images.jpg", title: "Departamento en Belgrano", location: "Av. Cabildo 2450, CABA", type: "Alquiler", rooms: 2, baths: 2, area: 80 },
  { id: 6, image: "/images (1).jpg", title: "Casa moderna en Palermo", location: "Av. Dorrego 1800, CABA", type: "Venta", rooms: 3, baths: 2, area: 145 },
  { id: 7, image: "/ly-villa-costa-blanca-1_b02f5d33_900x900.jpg", title: "Casa con jardín en Nordelta", location: "Los Alamos 120, Tigre", type: "Alquiler", rooms: 4, baths: 3, area: 220 },
  { id: 8, image: "/images.jpg", title: "Departamento en Belgrano", location: "Av. Cabildo 2450, CABA", type: "Alquiler", rooms: 2, baths: 2, area: 80 },
];

function Brand() {
  return (
    <Link href="/home" className="public-home__brand" aria-label="Kaiken Propiedades, inicio">
      <span className="public-home__brand-mark" aria-hidden="true"><span /><span /></span>
      <span className="public-home__brand-copy"><strong>KAIKEN</strong><small>PROPIEDADES</small></span>
    </Link>
  );
}

function SearchBox() {
  const [operation, setOperation] = useState("Alquilar");
  const [location, setLocation] = useState("");
  const [rooms, setRooms] = useState("");
  const [budget, setBudget] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <form className="public-home__search" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
      <div className="public-home__tabs" role="tablist" aria-label="Tipo de operación">
        {['Alquilar', 'Comprar'].map((item) => (
          <button className={operation === item ? "is-active" : ""} key={item} type="button" role="tab" aria-selected={operation === item} onClick={() => setOperation(item)}>{item}</button>
        ))}
      </div>
      <div className="public-home__search-fields">
        <label className="public-home__select-wrap"><Icon name="location" /><span className="sr-only">Ubicación</span><select value={location} onChange={(event) => setLocation(event.target.value)}><option value="">Ubicación</option><option>Belgrano</option><option>Palermo</option><option>Nordelta</option></select><Icon name="chevron" /></label>
        <label className="public-home__select-wrap"><Icon name="bed" /><span className="sr-only">Habitaciones</span><select value={rooms} onChange={(event) => setRooms(event.target.value)}><option value="">Habitaciones</option><option>1 habitación</option><option>2 habitaciones</option><option>3+ habitaciones</option></select><Icon name="chevron" /></label>
        <label className="public-home__select-wrap"><Icon name="wallet" /><span className="sr-only">Presupuesto</span><select value={budget} onChange={(event) => setBudget(event.target.value)}><option value="">Presupuesto</option><option>Hasta $500.000</option><option>$500.000 - $1.000.000</option><option>Más de $1.000.000</option></select><Icon name="chevron" /></label>
        <button className="public-home__search-button" type="submit">Buscar</button>
      </div>
      {submitted && <p className="public-home__search-status" role="status">Mostrando propiedades de {operation.toLowerCase()}{location ? ` en ${location}` : ""}.</p>}
    </form>
  );
}

function PropertyCard({ property }) {
  return (
    <article className="public-home__property-card">
      <img src={property.image} alt={property.title} />
      <div className="public-home__property-body">
        <h3>{property.title}</h3>
        <p className="public-home__location"><Icon name="location" />{property.location}</p>
        <div className="public-home__property-meta">
          <span><Icon name="bed" />{property.rooms}</span>
          <span><Icon name="bath" />{property.baths}</span>
          <span><Icon name="ruler" />{property.area} m²</span>
          <em>{property.type}</em>
        </div>
        <button type="button" className="public-home__details"><Icon name="eye" />Ver detalle</button>
      </div>
    </article>
  );
}

export default function Home() {
  const visibleProperties = useMemo(() => properties, []);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Kaiken Propiedades";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="public-home">
      <section className="public-home__hero" style={{ "--hero-image": `url(${fondoCasa})` }}>
        <header className="public-home__header">
          <Brand />
          <nav className="public-home__nav" aria-label="Navegación pública">
            <a href="#inicio">Inicio</a><Link href="/properties?filter=buy">Comprar</Link><Link href="/properties?filter=rent">Alquilar</Link><a href="#nosotros">Nosotros</a><a href="#contacto">Contacto</a>
          </nav>
          <div className="public-home__header-actions"><label className="public-home__quick-search"><span className="sr-only">Buscar por zona</span><input placeholder="Buscar por zona" /><Icon name="search" /></label><Link className="public-home__login" href="/login">Ingresar</Link></div>
        </header>
        <div className="public-home__hero-content" id="inicio">
          <p className="public-home__eyebrow">KAIKEN PROPIEDADES</p>
          <h1>Encuentra el hogar<br />de tus sueños</h1>
          <p className="public-home__hero-copy">Las mejores propiedades en las ubicaciones<br />más exclusivas</p>
          <SearchBox />
        </div>
      </section>

      <section className="public-home__stats" id="nosotros" aria-label="Nuestra trayectoria">
        <div><strong>+15</strong><span>Años de trayectoria</span></div><div><strong>1,200+</strong><span>Propiedades vendidas</span></div><div><strong>98%</strong><span>Clientes satisfechos</span></div><div><strong>450+</strong><span>Propiedades activas</span></div>
      </section>

      <section className="public-home__properties" id="propiedades">
        <div className="public-home__section-heading"><p>Descubrí tu próximo hogar</p><h2>Propiedades disponibles</h2><span>Las mejores opciones disponibles</span></div>
        <div className="public-home__property-grid">{visibleProperties.map((property) => <PropertyCard key={property.id} property={property} />)}</div>
      </section>

      <footer className="public-home__footer" id="contacto" style={{ "--footer-image": `url(${fondoCasa})` }}>
        <div className="public-home__footer-content">
          <div className="public-home__footer-brand"><Brand /><p>Te acompañamos en cada paso para<br />encontrar el hogar de tus sueños.<br />Trayectoria, confianza y seguridad en<br />cada operación.</p><div className="public-home__socials"><span>f</span><span>◎</span><span>in</span><span>▶</span></div></div>
          <div><h3>Navegación</h3><a href="#inicio">Inicio</a><Link href="/properties?filter=buy">Comprar</Link><Link href="/properties?filter=rent">Alquilar</Link><a href="#nosotros">Nosotros</a><a href="#contacto">Contacto</a></div>
          <div><h3>Legal &amp; soporte</h3><a href="/terms">Términos y condiciones</a><a href="/terms">Políticas de privacidad</a></div>
          <div><h3>Contacto</h3><p><Icon name="location" />Bielke 747</p><p><Icon name="phone" />+54 9 2901 6018 01</p><p><Icon name="mail" />nahuel.odi.tv@gmail.com</p><p><Icon name="clock" />Lun a Vie: 9:00 a 20:00 hs</p></div>
          <aside><Icon name="home" /><p>Esta página y sus portales de autogestión operan bajo AGI Propiedades, el sistema integral diseñado para simplificar, conectar y potenciar la gestión inmobiliaria.</p></aside>
        </div>
        <div className="public-home__copyright"><span>© 2026 KAIKEN PROPIEDADES. Todos los derechos reservados.</span><span>Diseñado y desarrollado por Séptimo Studios.</span></div>
      </footer>
    </main>
  );
}

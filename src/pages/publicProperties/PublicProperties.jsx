import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Icon } from '../../components';
import "./PublicProperties.css";

const properties = [
  { id: 1, image: "/images.jpg", title: "Departamento en Belgrano", location: "Av. Cabildo 2450, CABA", operation: "rent", type: "Departamento", rooms: 2, baths: 2, area: 80 },
  { id: 2, image: "/images.jpg", title: "Departamento en Belgrano", location: "Av. Cabildo 2450, CABA", operation: "rent", type: "Departamento", rooms: 2, baths: 2, area: 80 },
  { id: 3, image: "/images (1).jpg", title: "Casa moderna en Palermo", location: "Av. Dorrego 1800, CABA", operation: "buy", type: "Casa", rooms: 3, baths: 2, area: 145 },
  { id: 4, image: "/ly-villa-costa-blanca-1_b02f5d33_900x900.jpg", title: "Casa con jardín en Nordelta", location: "Los Alamos 120, Tigre", operation: "rent", type: "Casa", rooms: 4, baths: 3, area: 220 },
  { id: 5, image: "/images.jpg", title: "Departamento en Belgrano", location: "Av. Cabildo 2450, CABA", operation: "rent", type: "Departamento", rooms: 2, baths: 2, area: 80 },
  { id: 6, image: "/images (1).jpg", title: "Casa moderna en Palermo", location: "Av. Dorrego 1800, CABA", operation: "buy", type: "Casa", rooms: 3, baths: 2, area: 145 },
  { id: 7, image: "/ly-villa-costa-blanca-1_b02f5d33_900x900.jpg", title: "Casa con jardín en Nordelta", location: "Los Alamos 120, Tigre", operation: "rent", type: "Casa", rooms: 4, baths: 3, area: 220 },
  { id: 8, image: "/images.jpg", title: "Departamento en Belgrano", location: "Av. Cabildo 2450, CABA", operation: "rent", type: "Departamento", rooms: 2, baths: 2, area: 80 },
  { id: 9, image: "/images (1).jpg", title: "Casa moderna en Palermo", location: "Av. Dorrego 1800, CABA", operation: "buy", type: "Casa", rooms: 3, baths: 2, area: 145 },
];

function Brand() {
  return (
    <Link href="/home" className="public-properties__brand" aria-label="Kaiken Propiedades, inicio">
      <span className="public-properties__brand-mark" aria-hidden="true"><span /><span /></span>
      <span className="public-properties__brand-copy"><strong>KAIKEN</strong><small>PROPIEDADES</small></span>
    </Link>
  );
}

function PublicHeader({ operation, setOperation }) {
  return (
    <header className="public-properties__header">
      <Brand />
      <nav className="public-properties__nav" aria-label="Navegación pública">
        <Link href="/home">Inicio</Link>
        <Link className={operation === "buy" ? "is-active" : ""} href="/properties?filter=buy" onClick={() => setOperation("buy")}>Comprar</Link>
        <Link className={operation === "rent" ? "is-active" : ""} href="/properties?filter=rent" onClick={() => setOperation("rent")}>Alquilar</Link>
        <Link href="/home#nosotros">Nosotros</Link>
        <Link href="/home#contacto">Contacto</Link>
      </nav>
      <div className="public-properties__header-actions">
        <label className="public-properties__quick-search">
          <span className="sr-only">Buscar por zona</span>
          <input placeholder="Buscar por zona" />
          <Icon name="search" />
        </label>
        <Link className="public-properties__login" href="/login">Ingresar</Link>
      </div>
    </header>
  );
}

function FilterSidebar({ operation, setOperation }) {
  const [location, setLocation] = useState("");
  const [type, setType] = useState({ Casa: false, Departamento: false, Terreno: false });
  const [priceCurrency, setPriceCurrency] = useState("Pesos");
  const [bedrooms, setBedrooms] = useState("Todos");

  const toggleType = (name) => setType((current) => ({ ...current, [name]: !current[name] }));

  return (
    <aside className="public-properties__filters" aria-label="Filtros de propiedades">
      <h2>Operación</h2>
      <div className="public-properties__operation-toggle" role="tablist" aria-label="Tipo de operación">
        <Link className={operation === "buy" ? "is-active" : ""} href="/properties?filter=buy" role="tab" aria-selected={operation === "buy"} onClick={() => setOperation("buy")}>Venta</Link>
        <Link className={operation === "rent" ? "is-active" : ""} href="/properties?filter=rent" role="tab" aria-selected={operation === "rent"} onClick={() => setOperation("rent")}>Alquiler</Link>
      </div>

      <label className="public-properties__field-label" htmlFor="public-location">Ubicación</label>
      <input id="public-location" className="public-properties__text-input" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Ubicación (ej. Palermo, CABA)" />

      <fieldset>
        <legend>Tipo de propiedad</legend>
        {Object.keys(type).map((item) => (
          <label className="public-properties__checkbox" key={item}>
            <input type="checkbox" checked={type[item]} onChange={() => toggleType(item)} />
            <span>{item}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="public-properties__price-fieldset">
        <legend>Precio</legend>
        <div className="public-properties__currency-options">
          {['Pesos', 'USD'].map((currency) => (
            <label key={currency} className="public-properties__currency">
              <input type="radio" name="currency" checked={priceCurrency === currency} onChange={() => setPriceCurrency(currency)} />
              <span>{currency}</span>
            </label>
          ))}
        </div>
        <div className="public-properties__price-inputs"><input placeholder="Min" aria-label="Precio mínimo" /><span>—</span><input placeholder="Max" aria-label="Precio máximo" /></div>
      </fieldset>

      <fieldset>
        <legend>Dormitorios</legend>
        <div className="public-properties__bedroom-options">
          {['Todos', '1', '2', '3', '4+'].map((item) => (
            <button className={bedrooms === item ? "is-active" : ""} key={item} type="button" onClick={() => setBedrooms(item)}>{item}</button>
          ))}
        </div>
      </fieldset>

      <button className="public-properties__apply" type="button">Aplicar filtros</button>
      <button className="public-properties__clear" type="button" onClick={() => { setLocation(""); setType({ Casa: false, Departamento: false, Terreno: false }); setPriceCurrency("Pesos"); setBedrooms("Todos"); }}>Limpiar filtros</button>
    </aside>
  );
}

function PropertyCard({ property }) {
  return (
    <article className="public-properties__card">
      <img src={property.image} alt={property.title} />
      <div className="public-properties__card-body">
        <h2>{property.title}</h2>
        <p className="public-properties__location"><Icon name="location" />{property.location}</p>
        <div className="public-properties__meta">
          <span><Icon name="bed" />{property.rooms}</span>
          <span><Icon name="bath" />{property.baths}</span>
          <span><Icon name="ruler" />{property.area} m²</span>
          <em>{property.operation === "buy" ? "Venta" : "Alquiler"}</em>
        </div>
        <Link className="public-properties__details" href="/property"><Icon name="eye" />Ver detalle</Link>
      </div>
    </article>
  );
}

export default function PublicProperties() {
  const queryFilter = new URLSearchParams(window.location.search).get("filter");
  const [operation, setOperation] = useState(queryFilter === "rent" ? "rent" : "buy");
  const visibleProperties = useMemo(() => properties.filter((property) => property.operation === operation), [operation]);

  return (
    <main className="public-properties">
      <PublicHeader operation={operation} setOperation={setOperation} />
      <div className="public-properties__breadcrumb"><Link href="/home">Inicio</Link><span>&gt;</span><strong>Propiedades</strong></div>
      <div className="public-properties__layout">
        <FilterSidebar operation={operation} setOperation={setOperation} />
        <section className="public-properties__results" aria-labelledby="public-properties-title">
          <div className="public-properties__results-heading">
            <div><h1 id="public-properties-title">Propiedades en {operation === "buy" ? "venta" : "alquiler"}</h1><span>{visibleProperties.length === 0 ? 0 : 142} propiedades encontradas</span></div>
            <label>Ordenar por:<select defaultValue="recommended"><option value="recommended">Recomendados</option><option value="price-low">Menor precio</option><option value="price-high">Mayor precio</option></select></label>
          </div>
          <div className="public-properties__grid">
            {visibleProperties.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
        </section>
      </div>
    </main>
  );
}

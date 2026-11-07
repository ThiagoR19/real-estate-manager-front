import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Footer, Icon, PropertyCardSimple } from "../../components";
import kaikenLogo from "../../assets/icons/kaiken.svg";
import filterIcon from "../../assets/icons/options.svg";
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
      <img src={kaikenLogo} alt="Kaiken Propiedades" />
    </Link>
  );
}

function PublicHeader({ operation, setOperation }) {
  return (
    <header className="public-properties__header">
      <Brand />
      <nav className="public-properties__nav" aria-label="Navegación pública">
        <Link href="/home">Inicio</Link>
        <Link className={operation === "buy" ? "is-active" : ""} href="/public-properties?filter=buy" onClick={() => setOperation("buy")}>Comprar</Link>
        <Link className={operation === "rent" ? "is-active" : ""} href="/public-properties?filter=rent" onClick={() => setOperation("rent")}>Alquilar</Link>
        <Link href="/about-us">Nosotros</Link>
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

function FilterSidebar({ operation, setOperation, open, onClose }) {
  const [location, setLocation] = useState("");
  const [type, setType] = useState({ Casa: false, Departamento: false, Terreno: false });
  const [priceCurrency, setPriceCurrency] = useState("Pesos");
  const [bedrooms, setBedrooms] = useState("Todos");

  const toggleType = (name) => setType((current) => ({ ...current, [name]: !current[name] }));

  return (
    <aside id="public-property-filters" className={`public-properties__filters${open ? " is-open" : ""}`} role={open ? "dialog" : undefined} aria-modal={open || undefined} aria-label="Filtros de propiedades">
      <button className="public-properties__filter-handle" type="button" aria-label="Cerrar filtros" onClick={onClose}><span /></button>
      <h2>Operación</h2>
      <div className="public-properties__operation-toggle" role="tablist" aria-label="Tipo de operación">
        <Link className={operation === "buy" ? "is-active" : ""} href="/public-properties?filter=buy" role="tab" aria-selected={operation === "buy"} onClick={() => setOperation("buy")}>Venta</Link>
        <Link className={operation === "rent" ? "is-active" : ""} href="/public-properties?filter=rent" role="tab" aria-selected={operation === "rent"} onClick={() => setOperation("rent")}>Alquiler</Link>
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

      <button className="public-properties__apply" type="button" onClick={onClose}>Aplicar filtros</button>
      <button className="public-properties__clear" type="button" onClick={() => { setLocation(""); setType({ Casa: false, Departamento: false, Terreno: false }); setPriceCurrency("Pesos"); setBedrooms("Todos"); }}>Limpiar filtros</button>
    </aside>
  );
}

export default function PublicProperties() {
  const queryFilter = new URLSearchParams(window.location.search).get("filter");
  const [operation, setOperation] = useState(queryFilter === "rent" ? "rent" : "buy");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const visibleProperties = useMemo(() => properties.filter((property) => property.operation === operation), [operation]);

  useEffect(() => {
    if (!filtersOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => { if (event.key === "Escape") setFiltersOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [filtersOpen]);

  return (
    <main className="public-properties">
      <PublicHeader operation={operation} setOperation={setOperation} />
      <div className="public-properties__layout">
        {filtersOpen && <button className="public-properties__filter-backdrop" aria-label="Cerrar filtros" type="button" onClick={() => setFiltersOpen(false)} />}
        <FilterSidebar operation={operation} setOperation={setOperation} open={filtersOpen} onClose={() => setFiltersOpen(false)} />
        <section className="public-properties__results" aria-labelledby="public-properties-title">
          <div className="public-properties__results-heading">
            <div><h1 id="public-properties-title">Propiedades en {operation === "buy" ? "venta" : "alquiler"}</h1><span>{visibleProperties.length === 0 ? 0 : 142} propiedades encontradas</span></div>
            <label>Ordenar por:<select defaultValue="recommended"><option value="recommended">Recomendados</option><option value="price-low">Menor precio</option><option value="price-high">Mayor precio</option></select></label>
            <button className="public-properties__filter-toggle" type="button" aria-label="Abrir filtros" aria-expanded={filtersOpen} aria-controls="public-property-filters" onClick={() => setFiltersOpen(true)}><img src={filterIcon} alt="" /></button>
          </div>
          <div className="public-properties__grid">
            {visibleProperties.map((property) => <PropertyCardSimple key={property.id} property={property} variant="public" />)}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}

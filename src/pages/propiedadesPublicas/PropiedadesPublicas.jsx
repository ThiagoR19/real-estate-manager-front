import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Footer, Icono, TarjetaPropiedadSimple, Paginacion, usePaginacion, PROPERTY_PAGE_SIZE } from "../../components";
import kaikenLogo from "../../assets/icons/kaiken.svg";
import filterIcon from "../../assets/icons/options.svg";
import "./PropiedadesPublicas.css";

const properties = [
  {
    id: 1,
    image: "/images.jpg",
    title: "Departamento en Belgrano",
    location: "Av. Cabildo 2450, CABA",
    operation: "rent",
    type: "Departamento",
    rooms: 2,
    baths: 2,
    area: 80,
  },
  {
    id: 2,
    image: "/images.jpg",
    title: "Departamento en Belgrano",
    location: "Av. Cabildo 2450, CABA",
    operation: "rent",
    type: "Departamento",
    rooms: 2,
    baths: 2,
    area: 80,
  },
  {
    id: 3,
    image: "/images (1).jpg",
    title: "Casa moderna en Palermo",
    location: "Av. Dorrego 1800, CABA",
    operation: "buy",
    type: "Casa",
    rooms: 3,
    baths: 2,
    area: 145,
  },
  {
    id: 4,
    image: "/ly-villa-costa-blanca-1_b02f5d33_900x900.jpg",
    title: "Casa con jardín en Nordelta",
    location: "Los Alamos 120, Tigre",
    operation: "rent",
    type: "Casa",
    rooms: 4,
    baths: 3,
    area: 220,
  },
  {
    id: 5,
    image: "/images.jpg",
    title: "Departamento en Belgrano",
    location: "Av. Cabildo 2450, CABA",
    operation: "rent",
    type: "Departamento",
    rooms: 2,
    baths: 2,
    area: 80,
  },
  {
    id: 6,
    image: "/images (1).jpg",
    title: "Casa moderna en Palermo",
    location: "Av. Dorrego 1800, CABA",
    operation: "buy",
    type: "Casa",
    rooms: 3,
    baths: 2,
    area: 145,
  },
  {
    id: 7,
    image: "/ly-villa-costa-blanca-1_b02f5d33_900x900.jpg",
    title: "Casa con jardín en Nordelta",
    location: "Los Alamos 120, Tigre",
    operation: "rent",
    type: "Casa",
    rooms: 4,
    baths: 3,
    area: 220,
  },
  {
    id: 8,
    image: "/images.jpg",
    title: "Departamento en Belgrano",
    location: "Av. Cabildo 2450, CABA",
    operation: "rent",
    type: "Departamento",
    rooms: 2,
    baths: 2,
    area: 80,
  },
  {
    id: 9,
    image: "/images (1).jpg",
    title: "Casa moderna en Palermo",
    location: "Av. Dorrego 1800, CABA",
    operation: "buy",
    type: "Casa",
    rooms: 3,
    baths: 2,
    area: 145,
  },
];

function Marca() {
  return (
    <Link href="/inicio" className="propiedades-publicas__brand" aria-label="Kaiken Propiedades, inicio">
      <img src={kaikenLogo} alt="Kaiken Propiedades" />
    </Link>
  );
}

function EncabezadoPublico({ operation, setOperation }) {
  return (
    <header className="propiedades-publicas__header">
      <Marca />
      <nav className="propiedades-publicas__nav" aria-label="Navegación pública">
        <Link href="/inicio">Inicio</Link>
        <Link
          className={operation === "buy" ? "is-active" : ""}
          href="/propiedades-publicas?filter=buy"
          onClick={() => setOperation("buy")}
        >
          Comprar
        </Link>
        <Link
          className={operation === "rent" ? "is-active" : ""}
          href="/propiedades-publicas?filter=rent"
          onClick={() => setOperation("rent")}
        >
          Alquilar
        </Link>
        <Link href="/inicio#contacto">Contacto</Link>
      </nav>
      <div className="propiedades-publicas__header-actions">
        <label className="propiedades-publicas__quick-search">
          <span className="sr-only">Buscar por zona</span>
          <input placeholder="Buscar por zona" />
          <Icono name="search" />
        </label>
        <Link className="propiedades-publicas__login" href="/login">
          Ingresar
        </Link>
      </div>
    </header>
  );
}

function BarraLateralFiltros({ operation, setOperation, open, onClose }) {
  const [location, setLocation] = useState("");
  const [type, setType] = useState({ Casa: false, Departamento: false, Terreno: false });
  const [priceCurrency, setPriceCurrency] = useState("Pesos");
  const [bedrooms, setBedrooms] = useState("Todos");

  const toggleType = (name) => setType((current) => ({ ...current, [name]: !current[name] }));

  return (
    <aside
      id="propiedad-publica-filters"
      className={`propiedades-publicas__filters${open ? " is-open" : ""}`}
      role={open ? "dialog" : undefined}
      aria-modal={open || undefined}
      aria-label="Filtros de propiedades"
    >
      <button
        className="propiedades-publicas__filter-handle"
        type="button"
        aria-label="Cerrar filtros"
        onClick={onClose}
      >
        <span />
      </button>
      <h2>Operación</h2>
      <div
        className="propiedades-publicas__operation-toggle"
        role="tablist"
        aria-label="Tipo de operación"
      >
        <Link
          className={operation === "buy" ? "is-active" : ""}
          href="/propiedades-publicas?filter=buy"
          role="tab"
          aria-selected={operation === "buy"}
          onClick={() => setOperation("buy")}
        >
          Venta
        </Link>
        <Link
          className={operation === "rent" ? "is-active" : ""}
          href="/propiedades-publicas?filter=rent"
          role="tab"
          aria-selected={operation === "rent"}
          onClick={() => setOperation("rent")}
        >
          Alquiler
        </Link>
      </div>

      <label className="propiedades-publicas__field-label" htmlFor="public-location">
        Ubicación
      </label>
      <input
        id="public-location"
        className="propiedades-publicas__text-input"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        placeholder="Ubicación (ej. Palermo, CABA)"
      />

      <fieldset>
        <legend>Tipo de propiedad</legend>
        {Object.keys(type).map((item) => (
          <label className="propiedades-publicas__checkbox" key={item}>
            <input type="checkbox" checked={type[item]} onChange={() => toggleType(item)} />
            <span>{item}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="propiedades-publicas__price-fieldset">
        <legend>Precio</legend>
        <div className="propiedades-publicas__currency-options">
          {["Pesos", "USD"].map((currency) => (
            <label key={currency} className="propiedades-publicas__currency">
              <input
                type="radio"
                name="currency"
                checked={priceCurrency === currency}
                onChange={() => setPriceCurrency(currency)}
              />
              <span>{currency}</span>
            </label>
          ))}
        </div>
        <div className="propiedades-publicas__price-inputs">
          <input placeholder="Min" aria-label="Precio mínimo" />
          <span>—</span>
          <input placeholder="Max" aria-label="Precio máximo" />
        </div>
      </fieldset>

      <fieldset>
        <legend>Dormitorios</legend>
        <div className="propiedades-publicas__bedroom-options">
          {["Todos", "1", "2", "3", "4+"].map((item) => (
            <button
              className={bedrooms === item ? "is-active" : ""}
              key={item}
              type="button"
              onClick={() => setBedrooms(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </fieldset>

      <button className="propiedades-publicas__apply" type="button" onClick={onClose}>
        Aplicar filtros
      </button>
      <button
        className="propiedades-publicas__clear"
        type="button"
        onClick={() => {
          setLocation("");
          setType({ Casa: false, Departamento: false, Terreno: false });
          setPriceCurrency("Pesos");
          setBedrooms("Todos");
        }}
      >
        Limpiar filtros
      </button>
    </aside>
  );
}

export default function PropiedadesPublicas() {
  const queryFilter = new URLSearchParams(window.location.search).get("filter");
  const [operation, setOperation] = useState(queryFilter === "rent" ? "rent" : "buy");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const visibleProperties = properties.filter((property) => property.operation === operation);
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(visibleProperties, PROPERTY_PAGE_SIZE);
  const changeOperation = (value) => { setOperation(value); resetPage(); };

  useEffect(() => {
    if (!filtersOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [filtersOpen]);

  return (
    <main className="propiedades-publicas">
      <EncabezadoPublico operation={operation} setOperation={changeOperation} />
      <div className="propiedades-publicas__layout">
        {filtersOpen && (
          <button
            className="propiedades-publicas__filter-backdrop"
            aria-label="Cerrar filtros"
            type="button"
            onClick={() => setFiltersOpen(false)}
          />
        )}
        <BarraLateralFiltros
          operation={operation}
          setOperation={changeOperation}
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
        <section className="propiedades-publicas__results" aria-labelledby="propiedades-publicas-title">
          <div className="propiedades-publicas__results-heading">
            <div>
              <h1 id="propiedades-publicas-title">
                Propiedades en {operation === "buy" ? "venta" : "alquiler"}
              </h1>
              <span>{visibleProperties.length} propiedades encontradas</span>
            </div>
            <label>
              Ordenar por:
              <select defaultValue="recommended">
                <option value="recommended">Recomendados</option>
                <option value="price-low">Menor precio</option>
                <option value="price-high">Mayor precio</option>
              </select>
            </label>
            <button
              className="propiedades-publicas__filter-toggle"
              type="button"
              aria-label="Abrir filtros"
              aria-expanded={filtersOpen}
              aria-controls="propiedad-publica-filters"
              onClick={() => setFiltersOpen(true)}
            >
              <img src={filterIcon} alt="" />
            </button>
          </div>
          <div className="propiedades-publicas__grid">
            {pageItems.map((property) => (
              <TarjetaPropiedadSimple key={property.id} property={property} variant="public" />
            ))}
          </div>
          <Paginacion page={page} totalPages={totalPages} total={visibleProperties.length} onPageChange={setPage} pageSize={PROPERTY_PAGE_SIZE} />
        </section>
      </div>
      <Footer />
    </main>
  );
}

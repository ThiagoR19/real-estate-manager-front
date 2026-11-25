import { useEffect, useState } from "react";
import { Link, useSearchParams } from "wouter";
import { TarjetaPropiedadSimple, Paginacion, Skeleton, mostrarAviso } from "../../components";
import { PublicPropertiesSkeleton, PublicSkeletonBar } from "../../components/skeleton/PublicSkeletons";
import { api } from "../../services/api";
import { optionsIcon } from "../../assets/icons";
import "./PropiedadesPublicas.css";

const DORMITORIOS = ["Todos", "1", "2", "3", "4+"];
const MONEDAS = [
  { texto: "Pesos", valor: "ARS" },
  { texto: "USD", valor: "USD" },
];
const ORDENES = [
  { texto: "Más recientes", valor: "recientes" },
  { texto: "Menor precio", valor: "menorPrecio" },
  { texto: "Mayor precio", valor: "mayorPrecio" },
];
const PARAMS_FILTRO = ["ubicacion", "tipo", "moneda", "precioMin", "precioMax", "habitaciones"];

function useFiltrosUrl() {
  const [params, setParams] = useSearchParams();

  const cambiarFiltros = (cambios) => {
    setParams(
      (actuales) => {
        const siguientes = new URLSearchParams(actuales);
        Object.entries(cambios).forEach(([clave, valor]) => {
          if (valor === "" || valor == null) siguientes.delete(clave);
          else siguientes.set(clave, valor);
        });
        siguientes.delete("pagina");
        return siguientes;
      },
      { replace: true },
    );
  };

  const cambiarPagina = (pagina) => {
    setParams((actuales) => {
      const siguientes = new URLSearchParams(actuales);
      if (pagina === 1) siguientes.delete("pagina");
      else siguientes.set("pagina", pagina);
      return siguientes;
    });
  };

  return { params, cambiarFiltros, cambiarPagina };
}

function BarraLateralFiltros({ params, cambiarFiltros, tipos, cargandoTipos, operation, open, onClose }) {
  const ubicacion = params.get("ubicacion") ?? "";
  const tiposElegidos = (params.get("tipo") ?? "").split(",").filter(Boolean);
  const moneda = params.get("moneda") === "USD" ? "USD" : "ARS";
  const precioMin = params.get("precioMin") ?? "";
  const precioMax = params.get("precioMax") ?? "";
  const habitaciones = params.get("habitaciones") ?? "Todos";

  const alternarTipo = (tipo) => {
    const elegidos = tiposElegidos.includes(tipo)
      ? tiposElegidos.filter((elegido) => elegido !== tipo)
      : [...tiposElegidos, tipo];
    cambiarFiltros({ tipo: elegidos.join(",") });
  };

  const cambiarPrecio = (clave) => (event) =>
    cambiarFiltros({ [clave]: event.target.value.replace(/\D/g, "") });

  const limpiar = () => cambiarFiltros(Object.fromEntries(PARAMS_FILTRO.map((clave) => [clave, ""])));

  const hrefOperacion = (valor) => {
    const siguientes = new URLSearchParams(params);
    siguientes.set("filter", valor);
    siguientes.delete("pagina");
    return `/propiedades-publicas?${siguientes}`;
  };

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
          href={hrefOperacion("buy")}
          role="tab"
          aria-selected={operation === "buy"}
        >
          Venta
        </Link>
        <Link
          className={operation === "rent" ? "is-active" : ""}
          href={hrefOperacion("rent")}
          role="tab"
          aria-selected={operation === "rent"}
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
        value={ubicacion}
        onChange={(event) => cambiarFiltros({ ubicacion: event.target.value })}
        placeholder="Ubicación (ej. Palermo, CABA)"
      />

      <fieldset>
        <legend>Tipo de propiedad</legend>
        {cargandoTipos && (
          <div className="public-loading__filters" role="status" aria-label="Cargando tipos de propiedad">
            {Array.from({ length: 4 }, (_, index) => <PublicSkeletonBar key={index} width="70%" height={18} />)}
          </div>
        )}
        {tipos.map((tipo) => (
          <label className="propiedades-publicas__checkbox" key={tipo}>
            <input
              type="checkbox"
              checked={tiposElegidos.includes(tipo)}
              onChange={() => alternarTipo(tipo)}
            />
            <span>{tipo}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="propiedades-publicas__price-fieldset">
        <legend>Precio</legend>
        <div className="propiedades-publicas__currency-options">
          {MONEDAS.map(({ texto, valor }) => (
            <label key={valor} className="propiedades-publicas__currency">
              <input
                type="radio"
                name="currency"
                checked={moneda === valor}
                onChange={() => cambiarFiltros({ moneda: valor })}
              />
              <span>{texto}</span>
            </label>
          ))}
        </div>
        <div className="propiedades-publicas__price-inputs">
          <input
            placeholder="Min"
            aria-label="Precio mínimo"
            inputMode="numeric"
            value={precioMin}
            onChange={cambiarPrecio("precioMin")}
          />
          <span>—</span>
          <input
            placeholder="Max"
            aria-label="Precio máximo"
            inputMode="numeric"
            value={precioMax}
            onChange={cambiarPrecio("precioMax")}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>Dormitorios</legend>
        <div className="propiedades-publicas__bedroom-options">
          {DORMITORIOS.map((item) => (
            <button
              className={habitaciones === item ? "is-active" : ""}
              key={item}
              type="button"
              onClick={() => cambiarFiltros({ habitaciones: item === "Todos" ? "" : item })}
            >
              {item}
            </button>
          ))}
        </div>
      </fieldset>

      <button className="propiedades-publicas__apply" type="button" onClick={onClose}>
        Aplicar filtros
      </button>
      <button className="propiedades-publicas__clear" type="button" onClick={limpiar}>
        Limpiar filtros
      </button>
    </aside>
  );
}

export default function PropiedadesPublicas() {
  const { params, cambiarFiltros, cambiarPagina } = useFiltrosUrl();
  const busqueda = params.toString();
  const operation = params.get("filter") === "rent" ? "rent" : "buy";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [resultado, setResultado] = useState({ busqueda: null, propiedades: [], paginacion: null, tipos: [], error: false });
  const cargando = resultado.busqueda !== busqueda;
  const total = cargando ? 0 : resultado.paginacion?.total ?? 0;

  useEffect(() => {
    let activo = true;
    const espera = window.setTimeout(() => {
      api.catalogoPropiedades(new URLSearchParams(busqueda))
        .then((datos) => {
          if (!activo) return;
          setResultado({ ...datos, busqueda, error: false });
        })
        .catch((causa) => {
          console.error(causa);
          if (!activo) return;
          setResultado((anterior) => ({ ...anterior, busqueda, propiedades: [], paginacion: null, error: true }));
          mostrarAviso({ tipo: "error", titulo: "No se pudieron cargar las propiedades", mensaje: causa.message });
        });
    }, 300);

    return () => {
      activo = false;
      window.clearTimeout(espera);
    };
  }, [busqueda]);

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

  const irAPagina = (pagina) => {
    cambiarPagina(pagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="propiedades-publicas">
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
          params={params}
          cambiarFiltros={cambiarFiltros}
          tipos={resultado.tipos}
          cargandoTipos={cargando && !resultado.tipos.length}
          operation={operation}
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
        <section className="propiedades-publicas__results" aria-labelledby="propiedades-publicas-title">
          <div className="propiedades-publicas__results-heading">
            <div>
              <h1 id="propiedades-publicas-title">
                Propiedades en {operation === "buy" ? "venta" : "alquiler"}
              </h1>
              {cargando ? <PublicSkeletonBar width={150} height={17} /> : <span>{total} propiedades encontradas</span>}
            </div>
            <label>
              Ordenar por:
              <select
                value={params.get("orden") ?? "recientes"}
                onChange={(event) =>
                  cambiarFiltros({ orden: event.target.value === "recientes" ? "" : event.target.value })
                }
              >
                {ORDENES.map(({ texto, valor }) => (
                  <option key={valor} value={valor}>
                    {texto}
                  </option>
                ))}
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
              <img src={optionsIcon} alt="" />
            </button>
          </div>

          {!cargando && resultado.error && (
            <p className="propiedades-publicas__vacio">
              No pudimos cargar las propiedades. Probá de nuevo más tarde.
            </p>
          )}
          {!cargando && !resultado.error && !total && (
            <p className="propiedades-publicas__vacio">No encontramos propiedades con esos filtros.</p>
          )}

          {cargando ? <PublicPropertiesSkeleton /> : (
            <Skeleton key={busqueda} className="propiedades-publicas__grid">
              {resultado.propiedades.map((property) => (
                <TarjetaPropiedadSimple key={property.id} property={property} variant="public" />
              ))}
            </Skeleton>
          )}

          {!cargando && resultado.paginacion && (
            <Paginacion
              page={resultado.paginacion.pagina}
              totalPages={resultado.paginacion.paginas}
              total={total}
              onPageChange={irAPagina}
              pageSize={resultado.paginacion.limite}
            />
          )}
        </section>
      </div>
    </main>
  );
}

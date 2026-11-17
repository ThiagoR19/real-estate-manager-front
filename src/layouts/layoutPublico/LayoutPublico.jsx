import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { EncabezadoPublico, Footer, NavegacionPortada, mostrarAviso } from "../../components";
import { Inicio, PropiedadesPublicas, PropiedadPublica, SobreNosotros } from "../../pages/index.js";
import { InmobiliariaPublicaContext } from "../../hooks/useInmobiliariaPublica";
import { api } from "../../services/api";
import logoPorDefecto from "../../assets/icons/kaiken.svg";
import "./LayoutPublico.css";

// Rutas que usan el  header de portada(va encima de la imagen del hero)
const RUTAS_PORTADA = ["/", "/inicio", "/sobre-nosotros"];

// Layout de la landing: pide los datos de la inmobiliaria una sola vez, elige el header según la URL,
// muestra la vista que corresponde y el footer siempre.
// Los headers de portada van superpuestos al hero: su alto se guarda en --alto-portada
// para que el hero deje ese espacio arriba (ver LayoutPublico.css).
export default function LayoutPublico() {
  const [ubicacion] = useLocation();
  const [estado, setEstado] = useState({ inmobiliaria: null, cargando: true });
  const [altoPortada, setAltoPortada] = useState(0);
  const portadaRef = useRef(null);
  const esPortada = RUTAS_PORTADA.includes(ubicacion);
  const { inmobiliaria, cargando } = estado;
  // Mientras carga no se muestra ningún logo, para no parpadear entre el de reserva y el real
  const logo = cargando ? undefined : inmobiliaria?.urlLogo || logoPorDefecto;

  useEffect(() => {
    let activo = true;
    api.infoInmobiliaria()
      .then((inmobiliaria) => activo && setEstado({ inmobiliaria, cargando: false }))
      .catch((causa) => {
        console.error(causa);
        if (activo) {
          setEstado({ inmobiliaria: null, cargando: false });
          mostrarAviso({ tipo: "error", titulo: "No se pudo cargar la inmobiliaria", mensaje: causa.message });
        }
      });
    return () => {
      activo = false;
    };
  }, []);

  useLayoutEffect(() => {
    const header = portadaRef.current;
    if (!header) return undefined;
    const medir = () => setAltoPortada(header.offsetHeight);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(header);
    return () => observador.disconnect();
  }, [esPortada]);

  return (
    <InmobiliariaPublicaContext.Provider value={estado}>
      <div className="LayoutPublico" style={{ "--alto-portada": `${esPortada ? altoPortada : 0}px` }}>
        {esPortada ? (
          <div className="LayoutPublico__portada" ref={portadaRef}>
            <NavegacionPortada URLLogo={logo} />
          </div>
        ) : (
          <EncabezadoPublico logo={logo} />
        )}

        <Switch>
          <Route path="/">
            {() => <Inicio loading={cargando} datos={inmobiliaria} />}
          </Route>
          <Route path="/sobre-nosotros" component={SobreNosotros} />
          <Route path="/propiedades-publicas" component={PropiedadesPublicas} />
          <Route path="/propiedad-publica" component={PropiedadPublica} />
          <Route path="/inicio">
            {() => <Inicio loading={cargando} datos={inmobiliaria} />}
          </Route>
        </Switch>

        <Footer
          anios={inmobiliaria?.aniosExperiencia}
          URLLogo={logo}
          inmobiliaria={inmobiliaria?.nombre}
        />
      </div>
    </InmobiliariaPublicaContext.Provider>
  );
}

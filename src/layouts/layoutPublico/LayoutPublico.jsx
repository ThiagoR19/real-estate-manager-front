import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { EncabezadoPublico, Footer, NavegacionPortada, Skeleton, mostrarAviso } from "../../components";
import { Inicio, PropiedadesPublicas, PropiedadPublica, SobreNosotros } from "../../pages/index.js";
import { InmobiliariaPublicaContext } from "../../hooks/useInmobiliariaPublica";
import { api } from "../../services/api";
import logoPorDefecto from "../../assets/icons/kaiken.svg";
import "./LayoutPublico.css";

const RUTAS_PORTADA = ["/", "/inicio", "/sobre-nosotros"];

export default function LayoutPublico() {
  const [ubicacion] = useLocation();
  const [estado, setEstado] = useState({ inmobiliaria: null, cargando: true });
  const [altoPortada, setAltoPortada] = useState(0);
  const portadaRef = useRef(null);
  const esPortada = RUTAS_PORTADA.includes(ubicacion);
  const { inmobiliaria, cargando } = estado;
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
      <Skeleton className="LayoutPublico" cargando={cargando} style={{ "--alto-portada": `${esPortada ? altoPortada : 0}px` }}>
        {esPortada ? (<div className="LayoutPublico__portada" ref={portadaRef}> <NavegacionPortada URLLogo={logo} /></div>) : (<EncabezadoPublico logo={logo} />)}
        <Switch>
          <Route path="/sobre-nosotros">{() => { return (<SobreNosotros loading={cargando} datos={inmobiliaria} />) }}</Route>
          <Route path="/propiedades-publicas" component={PropiedadesPublicas} />
          <Route path="/propiedad-publica" component={PropiedadPublica} />
          <Route path="/inicio">{() => { return (<Inicio loading={estado.cargando} datos={inmobiliaria} />) }}</Route>
          <Route path="/">{() => { return (<Inicio loading={estado.cargando} datos={inmobiliaria} />) }}</Route>
        </Switch>

        <Footer anios={inmobiliaria?.aniosExperiencia} URLLogo={logo} inmobiliaria={inmobiliaria?.nombre} />
      </Skeleton>
    </InmobiliariaPublicaContext.Provider>
  );
}

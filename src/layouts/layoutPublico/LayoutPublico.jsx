import { useEffect, useState } from "react";
import { Route, Switch } from "wouter";
import { EncabezadoPublico, Footer, NavegacionPortada, Skeleton, mostrarAviso } from "../../components";
import { Inicio, PropiedadesPublicas, PropiedadPublica, SobreNosotros } from "../../pages/index.js";
import { InmobiliariaPublicaContext } from "../../hooks/useInmobiliariaPublica";
import { api } from "../../services/api";
import "./LayoutPublico.css";

export default function LayoutPublico() {
  const [estado, setEstado] = useState({ inmobiliaria: null, cargando: true });
  const { inmobiliaria, cargando } = estado;
  const logo = cargando ? undefined : inmobiliaria?.urlLogo || '';

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

  const navegacion = <NavegacionPortada URLLogo={logo} />;
  const encabezado = <EncabezadoPublico logo={logo} />;
  const inicio = <Inicio loading={cargando} datos={inmobiliaria} navegacion={navegacion} />;

  return (
    <InmobiliariaPublicaContext.Provider value={estado}>
      <Skeleton className="LayoutPublico" cargando={cargando}>
        <Switch>
          <Route path="/sobre-nosotros">
            <SobreNosotros loading={cargando} datos={inmobiliaria} navegacion={navegacion} />
          </Route>
          <Route path="/propiedades-publicas">
            {encabezado}
            <PropiedadesPublicas />
          </Route>
          <Route path="/propiedad-publica">
            {encabezado}
            <PropiedadPublica />
          </Route>
          <Route path="/inicio">{inicio}</Route>
          <Route path="/">{inicio}</Route>
        </Switch>

        <Footer anios={inmobiliaria?.aniosExperiencia} URLLogo={logo} inmobiliaria={inmobiliaria?.nombre} />
      </Skeleton>
    </InmobiliariaPublicaContext.Provider>
  );
}

import { useState, useEffect, useLayoutEffect } from "react";
const idInmobi = import.meta.env.VITE_ID_INMOBILIARIA;
import { Redirect, Route, Switch, useLocation, useSearch } from "wouter";
import { SobreNosotros, Inmobiliaria, Agentes, DashboardAgente, Chat, Cobros, ConfirmarRegistro, Dashboard, DashboardPropietario, Indec, Login, MisPropiedades, Propietarios, Pagos, PagosYCobros, Profesionales, Perfil, Propiedades, Propiedad, Registro, ReportesAgente, Agenda, SuperAdmin, Inquilinos, DashboardInquilino, Terminos } from "./pages/index.js";

import { Header, Navbar, LayoutPublico } from "./layouts/index.js";
import { inicioDelRol, puedeEntrar } from "./layouts/navegacion.js";
import { obtenerSesion } from "./services/login.js";
import { ROLES, rolActual } from "./utils/roles.js";
import { ContenedorAvisos } from "./components/index.js";

import "./App.css";
import { api } from "./services/api.js";

let yaSeHizo = false;
const validar = ["/", "/propiedades-publicas", "/propiedad-publica", "/sobre-nosotros", "/inicio"]

const RUTAS_LANDING = /^\/(inicio|sobre-nosotros|propiedades-publicas|propiedad-publica)?\/?$/

const dashboardsPorRol = {
  [ROLES.ADMIN]: Dashboard,
  [ROLES.AGENTE]: DashboardAgente,
  [ROLES.PROPIETARIO]: DashboardPropietario,
  [ROLES.INQUILINO]: DashboardInquilino,
};

function DashboardPorRol() {
  const rol = rolActual();
  if (rol === ROLES.SUPERADMIN) return <Redirect to="/super-admin" replace />;

  const DashboardDelRol = dashboardsPorRol[rol];
  if (!DashboardDelRol) return <Redirect to="/login" replace />;

  return <DashboardDelRol />;
}

function VistaConTransicion({ children, scrollAlInicio = false }) {
  const [pathname] = useLocation();
  const search = useSearch();

  useLayoutEffect(() => {
    if (!scrollAlInicio) return;
    const destino = document.getElementById(window.location.hash.slice(1));
    if (destino) {
      destino.scrollIntoView({ behavior: "instant", block: "start" });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, search, scrollAlInicio]);

  return (
    <div className="view-transition" key={pathname}>
      {children}
    </div>
  );
}

function SoloConRol({ ruta, children }) {
  const rol = rolActual();
  if (puedeEntrar(rol, ruta)) return children;
  return <Redirect to={inicioDelRol(rol)} replace />;
}

function RutaPrivada({ path, ruta = path, component: Componente }) {
  return (
    <Route path={path}>
      <SoloConRol ruta={ruta}>
        <Componente />
      </SoloConRol>
    </Route>
  );
}

function AuthenticatedApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  if (!obtenerSesion()?.token) {
    return <Redirect to="/inicio" replace />;
  }

  return (
    <div id="app-layout">
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((open) => !open)} />
      <Navbar menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div id="app-content">
        <VistaConTransicion>
          <RutaPrivada path="/admin-dashboard" component={DashboardPorRol} />
          <RutaPrivada path="/dashboard" component={DashboardPorRol} />
          <RutaPrivada path="/dashboard-agente" component={DashboardAgente} />
          <RutaPrivada path="/dashboard-inquilino" component={DashboardInquilino} />
          <RutaPrivada path="/dashboard-propietario" component={DashboardPropietario} />
          <RutaPrivada path="/agentes" component={Agentes} />
          <RutaPrivada path="/inquilinos" component={Inquilinos} />
          <RutaPrivada path="/propiedad/:id" ruta="/propiedad" component={Propiedad} />
          <RutaPrivada path="/propiedades" component={Propiedades} />
          <RutaPrivada path="/propietarios" component={Propietarios} />
          <RutaPrivada path="/perfil" component={Perfil} />
          <RutaPrivada path="/reportes-agente" component={ReportesAgente} />
          <RutaPrivada path="/reportes" component={ReportesAgente} />
          <RutaPrivada path="/chat" component={Chat} />
          <RutaPrivada path="/inmobiliaria" component={Inmobiliaria} />
          <RutaPrivada path="/pagos" component={Pagos} />
          <RutaPrivada path="/cobros" component={Cobros} />
          <RutaPrivada path="/pagos-cobros" component={PagosYCobros} />
          <RutaPrivada path="/indec" component={Indec} />
          <RutaPrivada path="/mis-propiedades" component={MisPropiedades} />
          <RutaPrivada path="/super-admin" component={SuperAdmin} />
          <RutaPrivada path="/agenda" component={Agenda} />
          <Route path="/sobre-nosotros" component={SobreNosotros} />
          <RutaPrivada path="/terminos" component={Terminos} />
          <RutaPrivada path="/profesionales" component={Profesionales} />
        </VistaConTransicion>
      </div>
    </div>
  );
}
function App() {
  const [location] = useLocation();

  useEffect(() => {
    if (yaSeHizo) return;
    yaSeHizo = true;

    if (validar.includes(location)) {
      api.contVisita(idInmobi)
    }
  }, [location])

  return (
    <>
      <Switch>
        <Route path={RUTAS_LANDING}>
          <VistaConTransicion scrollAlInicio><LayoutPublico /></VistaConTransicion>
        </Route>
        <Route path="/login"><VistaConTransicion scrollAlInicio><Login /></VistaConTransicion></Route>
        <Route path="/terminos">
          {obtenerSesion()?.token ? (
            <AuthenticatedApp />
          ) : (
            <VistaConTransicion scrollAlInicio><Terminos publico /></VistaConTransicion>
          )}
        </Route>
        <Route path="/registro"><VistaConTransicion scrollAlInicio><Registro /></VistaConTransicion></Route>
        <Route path="/activar"><VistaConTransicion scrollAlInicio><ConfirmarRegistro /></VistaConTransicion></Route>
        <Route path="/confirmar-registro"><VistaConTransicion scrollAlInicio><ConfirmarRegistro /></VistaConTransicion></Route>
        <Route>
          <AuthenticatedApp />
        </Route>
      </Switch>
      <ContenedorAvisos />
    </>
  );
}

export default App;

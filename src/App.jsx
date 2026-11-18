import { useState, useEffect } from "react";
const idInmobi = import.meta.env.VITE_ID_INMOBILIARIA;
import { Redirect, Route, Switch, useLocation } from "wouter";
import { SobreNosotros, Inmobiliaria, Agentes, DashboardAgente, Chat, Cobros, ConfirmarRegistro, Dashboard, DashboardPropietario, Indec, Login, MisPropiedades, Propietarios, Pagos, PagosYCobros, Profesionales, Perfil, Propiedades, Propiedad, Registro, ReportesAgente, Agenda, SuperAdmin, Inquilinos, DashboardInquilino, Terminos } from "./pages/index.js";

import { Header, Navbar, LayoutPublico } from "./layouts/index.js";
import { dashboardPorRol, puedeEntrar } from "./layouts/navegacion.js";
import { obtenerSesion } from "./services/login.js";
import { ContenedorAvisos } from "./components/index.js";

import "./App.css";
import { api } from "./services/api.js";

let yaSeHizo = false;
const validar = ["/", "/propiedades-publicas", "/propiedad-publica", "/sobre-nosotros", "/inicio"]
// Las vistas de la landing van todas dentro de LayoutPublico (header, datos de la inmobiliaria y footer)
const RUTAS_LANDING = /^\/(inicio|sobre-nosotros|propiedades-publicas|propiedad-publica)?\/?$/
const dashboardsPorRol = {
  2: Dashboard,
  3: DashboardAgente,
  4: DashboardPropietario,
  5: DashboardInquilino,
};

function DashboardPorRol() {
  const rol = Number(obtenerSesion()?.usuario?.rol);
  if (rol === 1) return <Redirect to="/super-admin" replace />;

  const DashboardDelRol = dashboardsPorRol[rol];
  if (!DashboardDelRol) return <Redirect to="/login" replace />;

  return <DashboardDelRol />;
}

function VistaConTransicion({ children }) {
  const [pathname] = useLocation();

  return (
    <div className="view-transition" key={pathname}>
      {children}
    </div>
  );
}

function SoloConRol({ ruta, children }) {
  const rol = Number(obtenerSesion()?.usuario?.rol);
  if (puedeEntrar(rol, ruta)) return children;
  return <Redirect to={dashboardPorRol[rol] ?? "/inicio"} replace />;
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
          <Route path="/admin-dashboard" component={DashboardPorRol} />
          <Route path="/dashboard" component={DashboardPorRol} />
          <Route path="/dashboard-agente" component={DashboardAgente} />
          <Route path="/dashboard-inquilino" component={DashboardInquilino} />
          <Route path="/dashboard-propietario" component={DashboardPropietario} />
          <Route path="/agentes" component={Agentes} />
          <Route path="/inquilinos" component={Inquilinos} />
          <Route path="/propiedad/:id" component={Propiedad} />
          <Route path="/propiedades" component={Propiedades} />
          <Route path="/propietarios" component={Propietarios} />
          <Route path="/perfil" component={Perfil} />
          <Route path="/reportes-agente" component={ReportesAgente} />
          <Route path="/reportes" component={ReportesAgente} />
          <Route path="/chat" component={Chat} />
          <Route path="/inmobiliaria" component={Inmobiliaria} />
          <Route path="/pagos">{() => <SoloConRol ruta="/pagos"><Pagos /></SoloConRol>}</Route>
          <Route path="/cobros">{() => <SoloConRol ruta="/cobros"><Cobros /></SoloConRol>}</Route>
          <Route path="/pagos-cobros">{() => <SoloConRol ruta="/pagos-cobros"><PagosYCobros /></SoloConRol>}</Route>
          <Route path="/indec" component={Indec} />
          <Route path="/mis-propiedades" component={MisPropiedades} />
          <Route path="/super-admin" component={SuperAdmin} />
          <Route path="/agenda" component={Agenda} />
          <Route path="/sobre-nosotros" component={SobreNosotros} />
          <Route path="/terminos" component={Terminos} />
          <Route path="/profesionales" component={Profesionales} />
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
          <VistaConTransicion><LayoutPublico /></VistaConTransicion>
        </Route>
        <Route path="/login"><VistaConTransicion><Login /></VistaConTransicion></Route>
        <Route path="/terminos">
          {obtenerSesion()?.token ? (
            <AuthenticatedApp />
          ) : (
            <VistaConTransicion><Terminos publico /></VistaConTransicion>
          )}
        </Route>
        <Route path="/registro"><VistaConTransicion><Registro /></VistaConTransicion></Route>
        <Route path="/activar"><VistaConTransicion><ConfirmarRegistro /></VistaConTransicion></Route>
        <Route path="/confirmar-registro"><VistaConTransicion><ConfirmarRegistro /></VistaConTransicion></Route>
        <Route>
          <AuthenticatedApp />
        </Route>
      </Switch>
      <ContenedorAvisos />
    </>
  );
}

export default App;

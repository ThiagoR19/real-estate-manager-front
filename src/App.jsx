import { useState, useEffect } from "react";
const idInmobi = import.meta.env.VITE_ID_INMOBILIARIA;
import { Redirect, Route, Switch, useLocation } from "wouter";
import { SobreNosotros, Inmobiliaria, Agentes, DashboardAgente, Chat, Cobros, ConfirmarRegistro, Dashboard, DashboardPropietario, Inicio, Indec, Login, MisPropiedades, Propietarios, Pagos, PagosYCobros, Profesionales, Perfil, Propiedades, Propiedad, PropiedadesPublicas, PropiedadPublica, Registro, ReportesAgente, Agenda, SuperAdmin, Inquilinos, DashboardInquilino, Terminos } from "./pages/index.js";

import { Header, Navbar } from "./layouts/index.js";
import { dashboardPorRol } from "./layouts/navegacion.js";
import { obtenerSesion } from "./services/login.js";
import { ContenedorAvisos } from "./components/index.js";

import "./App.css";
import { api } from "./services/api.js";

let yaSeHizo = false;
const validar = ["/", "/propiedades-publicas", "/propiedad-publica", "/sobre-nosotros", "/inicio"]
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
        <Route path="/reportes">{() => <ReportesAgente allowCreate />}</Route>
        <Route path="/chat" component={Chat} />
        <Route path="/inmobiliaria" component={Inmobiliaria} />
        <Route path="/pagos" component={Pagos} />
        <Route path="/cobros">
          {() => [1, 4].includes(Number(obtenerSesion()?.usuario?.rol))
            ? <Cobros />
            : <Redirect to={dashboardPorRol[Number(obtenerSesion()?.usuario?.rol)] ?? "/inicio"} replace />}
        </Route>
        <Route path="/pagos-cobros" component={PagosYCobros} />
        <Route path="/indec" component={Indec} />
        <Route path="/mis-propiedades" component={MisPropiedades} />
        <Route path="/super-admin" component={SuperAdmin} />
        <Route path="/agenda" component={Agenda} />
        <Route path="/sobre-nosotros" component={SobreNosotros} />
        <Route path="/terminos" component={Terminos} />
        <Route path="/profesionales" component={Profesionales} />
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
    <Switch>
      <Route path="/inicio" component={Inicio} />
      <Route path="/sobre-nosotros" component={SobreNosotros} />
      <Route path="/propiedades-publicas" component={PropiedadesPublicas} />
      <Route path="/propiedad-publica" component={PropiedadPublica} />
      <Route path="/login" component={Login} />
      <Route path="/registro" component={Registro} />
      <Route path="/activar" component={ConfirmarRegistro} />
      <Route path="/confirmar-registro" component={ConfirmarRegistro} />
      <Route path="/" component={Inicio} />
      <Route>
        <AuthenticatedApp />
        <ContenedorAvisos />
      </Route>
    </Switch>
  );
}

export default App;

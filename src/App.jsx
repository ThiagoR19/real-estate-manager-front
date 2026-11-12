import { useState, useEffect } from "react";
const idInmobi = import.meta.env.VITE_ID_INMOBILIARIA;
import { Redirect, Route, Switch, useLocation } from "wouter";
import { AboutUs, Agency, Agents, AgentDashboard, Chat, Collections, ConfirmRegister, Dashboard, DashboardOwner, Home, Indec, Login, MyProperties, Owners, Payments, PaymentsAndCollections, Professional, Profile, Properties, Property, PublicProperties, PublicProperty, Register, ReportsAgent, Schedule, SuperAdmin, SuperAdminDashboard, Tenant, TenantDashboard, Terms } from "./pages/index.js";

import { Header, Navbar } from "./layouts/index.js";
import { getSession } from "./services/login.js";
import { ToastContainer } from "./components/index.js";

import "./App.css";
import { api } from "./services/api.js";

let yaSeHizo = false;
const validar = ["/", "/public-properties", "/public-property", "/about-us", "/home"]

const dashboardsPorRol = {
  2: Dashboard,
  3: AgentDashboard,
  4: DashboardOwner,
  5: TenantDashboard,
};

function DashboardPorRol() {
  const rol = getSession()?.usuario?.rol;
  if (rol === 1) return <Redirect to="/super-admin" replace />;

  const DashboardDelRol = dashboardsPorRol[rol];
  if (!DashboardDelRol) return <Redirect to="/login" replace />;

  return <DashboardDelRol />;
}

function AuthenticatedApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  if (!getSession()?.token) {
    return <Redirect to="/home" replace />;
  }

  return (
    <div id="app-layout">
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((open) => !open)} />
      <Navbar menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div id="app-content">
        {/* <Route path="/admin-dashboard" component={Dashboard} /> */}
        <Route path="/dashboard" component={DashboardPorRol} />
        {/* <Route path="/agent-dashboard" component={AgentDashboard} />
        <Route path="/tenant-dashboard" component={TenantDashboard} />
        <Route path="/owner-dashboard" component={DashboardOwner} /> */}
        <Route path="/agents" component={Agents} />
        <Route path="/tenant" component={Tenant} />
        <Route path="/property/:id" component={Property} />
        <Route path="/properties" component={Properties} />
        <Route path="/owners" component={Owners} />
        <Route path="/profile" component={Profile} />
        <Route path="/reports-agent" component={ReportsAgent} />
        <Route path="/reports">{() => <ReportsAgent allowCreate />}</Route>
        <Route path="/chat" component={Chat} />
        <Route path="/agency" component={Agency} />
        <Route path="/payments" component={Payments} />
        <Route path="/collections" component={Collections} />
        <Route path="/payments-collections" component={PaymentsAndCollections} />
        <Route path="/indec" component={Indec} />
        <Route path="/my-properties" component={MyProperties} />
        <Route path="/super-admin" component={SuperAdmin} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/about-us" component={AboutUs} />
        <Route path="/terms" component={Terms} />
        <Route path="/professional" component={Professional} />
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
      <Route path="/home" component={Home} />
      <Route path="/about-us" component={AboutUs} />
      <Route path="/public-properties" component={PublicProperties} />
      <Route path="/public-property" component={PublicProperty} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/confirm-register" component={ConfirmRegister} />
      <Route path="/super-admin-dashboard" component={SuperAdminDashboard} />
      <Route path="/" component={Home} />
      <Route>
        <AuthenticatedApp />
        <ToastContainer />
      </Route>
    </Switch>
  );
}

export default App;

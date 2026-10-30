import { useState } from "react";
import { Route, Switch } from "wouter";
import { AboutUs, Agency, Agents, Chat, Cobros, Dashboard, DashboardAgente, DashboardInquilino, DashboardOwner, DashboardSuperAdmin, Home, Indec, Login, MyProperties, Owners, Payments, PaymentsAndCollections, Professional, Profile, Properties, Property, PublicProperties, PublicProperty, Reports, Schedule, SuperAdmin, Tenant, Terms } from "./pages/index.js";

import { Header, Navbar } from "./layouts/index.js";

import "./App.css";

function AuthenticatedApp() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div id="app-layout">
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((open) => !open)} />
      <Navbar menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div id="app-content">
        <Route path="/dashboard_admin" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard_agente" component={DashboardAgente} />
        <Route path="/dashboard_inquilino" component={DashboardInquilino} />
        <Route path="/dashboard_inquilinos" component={DashboardInquilino} />
        <Route path="/dashboard_dueño" component={DashboardOwner} />
        <Route path="/dashboard_propietarios" component={DashboardOwner} />
        <Route path="/agents" component={Agents} />
        <Route path="/tenant" component={Tenant} />
        <Route path="/property" component={Property} />
        <Route path="/properties" component={Properties} />
        <Route path="/owners" component={Owners} />
        <Route path="/profile" component={Profile} />
        <Route path="/reports" component={Reports} />
        <Route path="/chat" component={Chat} />
        <Route path="/agency" component={Agency} />
        <Route path="/payments" component={Payments} />
        <Route path="/cobros" component={Cobros} />
        <Route path="/pagos-cobros" component={PaymentsAndCollections} />
        <Route path="/indec" component={Indec} />
        <Route path="/mis-propiedades" component={MyProperties} />
        <Route path="/superadmin" component={SuperAdmin} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/aboutUs" component={AboutUs} />
        <Route path="/terms" component={Terms} />
        <Route path="/professional" component={Professional} />
      </div>
    </div>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/home" component={Home} />
      <Route path="/public_properties" component={PublicProperties} />
      <Route path="/public_property" component={PublicProperty} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard_superadmin" component={DashboardSuperAdmin} />
      <Route path="/" component={Home} />
      <Route>
        <AuthenticatedApp />
      </Route>
    </Switch>
  );
}

export default App;

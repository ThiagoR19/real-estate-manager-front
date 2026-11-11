import { useState } from "react";
import { Redirect, Route, Switch } from "wouter";
import { AboutUs, Agency, Agents, AgentDashboard, Chat, Collections, ConfirmRegister, Dashboard, DashboardOwner, Home, Indec, Login, MyProperties, Owners, Payments, PaymentsAndCollections, Professional, Profile, Properties, Property, PublicProperties, PublicProperty, Register, ReportsAgent, Schedule, SuperAdmin, SuperAdminDashboard, Tenant, TenantDashboard, Terms } from "./pages/index.js";

import { Header, Navbar } from "./layouts/index.js";
import { api } from "./services/api.js";

import "./App.css";

function AuthenticatedApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  if (!api.getSession()?.token) {
    return <Redirect to="/home" replace />;
  }

  return (
    <div id="app-layout">
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((open) => !open)} />
      <Navbar menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div id="app-content">
        <Route path="/admin-dashboard" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/agent-dashboard" component={AgentDashboard} />
        <Route path="/tenant-dashboard" component={TenantDashboard} />
        <Route path="/owner-dashboard" component={DashboardOwner} />
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
      </Route>
    </Switch>
  );
}

export default App;

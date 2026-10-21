import { Route, Switch } from "wouter";
import { AboutUs, Agency, Agents, Chat, Dashboard, Earnings, Login, Owners, Payments, Professional, Profile, Properties, Property, Reports, Schedule, Tenant, Terms } from "./pages/index.js";
import Navbar from "./layouts/Navbar";

import "./App.css";

function AuthenticatedApp() {
  return (
    <div id="app-layout">
      <Navbar />
      <div id="app-content">
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/agents" component={Agents} />
        <Route path="/properties" component={Properties} />
        <Route path="/tenant" component={Tenant} />
        <Route path="/property" component={Property} />
        <Route path="/owners" component={Owners} />
        <Route path="/profile" component={Profile} />
        <Route path="/reports" component={Reports} />
        <Route path="/chat" component={Chat} />
        <Route path="/agency" component={Agency} />
        <Route path="/payments" component={Payments} />
        <Route path="/earnings" component={Earnings} />
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
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route>
        <AuthenticatedApp />
      </Route>
    </Switch>
  );
}

export default App;


import { Route, Switch } from "wouter";
import AboutUs from "./pages/aboutUs/AboutUs";
import Agency from "./pages/agency/Agency";
import Agents from "./pages/agents/Agents";
import Chat from "./pages/chat/Chat";
import Dashboard from "./pages/dashboard/Dashboard";
import Earnings from "./pages/earnings/Earnings";
import Login from "./pages/login/Login";
import Owner from "./pages/owner/Owner";
import Payments from "./pages/payments/Payments";
import Properties from "./pages/properties/Properties";
import Profile from "./pages/profile/Profile";
import Reports from "./pages/reports/Reports";
import Tenant from "./pages/tenant/Tenant";
import Terms from "./pages/terms/Terms";
import Professional from "./pages/professional/Professional";
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
        <Route path="/owner" component={Owner} />
        <Route path="/profile" component={Profile} />
        <Route path="/reports" component={Reports} />
        <Route path="/terms" component={Terms} />
        <Route path="/chat" component={Chat} />
        <Route path="/agency" component={Agency} />
        <Route path="/payments" component={Payments} />
        <Route path="/earnings" component={Earnings} />
        <Route path="/about" component={AboutUs} />
        <Route path="/aboutUs" component={AboutUs} />
        <Route path="/about-us" component={AboutUs} />
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


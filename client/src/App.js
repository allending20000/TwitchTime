import Authentication from "./Authentication";
import Dashboard from "./Dashboard";
import Navbar from "./Navbar";
import Callback from "./Callback";
import User from "./User";
import About from "./About";
import NotFound from "./NotFound";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Authentication />
        </Route>
        <Route exact path="/dashboard">
          <Navbar />
          <Dashboard />
        </Route>
        <Route exact path="/callback">
          <Callback />
        </Route>
        <Route exact path="/user/:username/:broadcasterId/:timeToWatch">
          <Navbar />
          <User />
        </Route>
        <Route exact path="/about">
          <Navbar />
          <About />
        </Route>
        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

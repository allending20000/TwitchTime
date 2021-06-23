import Authentication from "./Authentication";
import Dashboard from "./Dashboard";
import Navbar from "./Navbar";
import Callback from "./Callback";
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
      </Switch>
    </Router>
  );
}

export default App;

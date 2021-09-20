import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav"
import { BrowserRouter as Router, Switch, NavLink, Route } from "react-router-dom";
import Overview from "./Overview";
import Queues from "./Queues";
import { QueuesProvider } from "./QueuesData";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  return <Container>
    <QueuesProvider>
      <Router>
        <Nav as="nav" >
          <Nav.Item>
            <Nav.Link as={NavLink} to="/">Overview</Nav.Link>
          </Nav.Item>
          {/* <Nav.Item>
          <Nav.Link as={NavLink} to="/connections">Connections</Nav.Link>
        </Nav.Item> */}
          <Nav.Item>
            <Nav.Link as={NavLink} to="/queues">Queues</Nav.Link>
          </Nav.Item>
        </Nav>
        <Switch>
          {/* <Route path="/connections"><Connections /></Route> */}
          <Route path="/queues"><Queues /></Route>
          <Route path="/"><Overview /></Route>
        </Switch>
      </Router>
    </QueuesProvider>
  </Container>
}
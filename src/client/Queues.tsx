import React from "react"
import { useQueues } from "./QueuesData";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import QueueForm from "./QueueForm";

export default function Queues() {
  const { state, data, error } = useQueues()

  return <>
    <Row>
      <h2>Queues</h2>
    </Row>
    <Row lg="1" xl="2">
      <Col>
        <Card>
          <Card.Header as="h4">List {state === "loading" && <em> (Loading...)</em>}</Card.Header>
          <Card.Body>
            {error && <em><b>Error loading queues: {error.message}</b></em>}
            <ListGroup>
              {data?.map((q) => (<ListGroup.Item key={q}>{q}</ListGroup.Item>))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
      <Col>
        <Card>
          <Card.Header as="h4">Add new</Card.Header>
          <Card.Body>
            <QueueForm />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </>
}
import React, { FormEventHandler, Reducer, useMemo, useReducer, useState } from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { useQueues } from "./QueuesData";
import { isQueueName, isValidQueueName, isBufferSize, TopicName } from "../shared";

export default function QueueForm() {
  const queues = useQueues();
  const [topics, dispatchTopics] = useReducer<Reducer<TopicName[], ["add"|"remove", TopicName]>>((prev, [action, target]) => {
    if (action === "add") return [...prev, target];
    if (action === "remove") {
      const pos = prev.findIndex(x => x === target)
      return [...prev.slice(0, pos), ...prev.slice(pos+1)]
    }
    return prev;
  }, [])
  const [name, setName] = useState('');
  const [bufferSize, setBufferSize] = useState('');
  const parsedName = useMemo(() => name === "" ? undefined : name, [name]);
  const isValidName = useMemo(
    () => isQueueName(parsedName) && isValidQueueName(parsedName, queues.data),
    [parsedName, queues],
  );
  const parsedBufferSize = useMemo(
    () => bufferSize === "" ? undefined : Number(bufferSize),
    [bufferSize]
  );
  const isValidBufferSize = useMemo(
    () => parsedBufferSize === undefined || isBufferSize(parsedBufferSize),
    [parsedBufferSize],
  );

  const isValid = useMemo(() => isValidName && isValidBufferSize, [isValidName, isValidBufferSize])
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const submit: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault()
    setSubmitting(true);
    setError(undefined)
    fetch("/api/queues", {
      method: "POST",
      body: JSON.stringify({ name: parsedName, bufferSize: parsedBufferSize, topics }),
      headers: {
        'Content-Type': 'Application/JSON',
      },
    }).then(
      () => { },
      (err) => setError(err instanceof Error ? err : new Error(String(err))),
    ).finally(() => setSubmitting(false));
  }

  return <Form onSubmit={submit}>
    <Row>
      <Col>
        <Form.Control type="text" placeholder="Name" aria-label="Name"
          isValid={isValidName} isInvalid={!isValidName}
          value={name} onChange={(ev) => setName(ev.target.value)} />
      </Col>
      <Col>
        <Form.Control type="number" placeholder="Buffer Size" aria-label="Buffer Size"
          value={bufferSize} onChange={(ev) => setBufferSize(ev.target.value)}
          isValid={isValidBufferSize} isInvalid={!isValidBufferSize}
          min="0" max={Number.MAX_SAFE_INTEGER} step="1" />
      </Col>
      <Col>
        <Button type="submit" disabled={submitting || !isValid}>Submit</Button>
      </Col>
    </Row>
    {error && (
      <Row>
        <Col>
          <Form.Text>{error.message}</Form.Text>
        </Col>
      </Row>
    )}
  </Form>;
}
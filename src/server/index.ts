import {
  BroadcastChannel,
  BroadcastSendModes,
  Channel,
  isBroadcastSendMode,
} from "@eyalsh/async_channels";
import express from "express";
import path from "path";
import { isQueueName, isValidExchangeRequestBody, isValidQueueName, validateQueueRequestBody } from "../shared";import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json())

interface Message {
  topic: string;
  payload: string;
}

const exchanges = new Map<string, BroadcastChannel<Message, string>>();

app.get("/api/exchanges", (req, res) => {
  res.send(Array.from(exchanges.keys()));
});
app.post("/api/exchanges", (req, res) => {
  const { name } = req.body;
  const sendMode = req.body.sendMode || BroadcastSendModes.WaitForOne;
  if (!isValidExchangeRequestBody({name, sendMode}, Array.from(exchanges.keys()))) return res.status(400).send("invalid request body!!!")

  exchanges.set(
    name,
    new BroadcastChannel<Message, string>((msg) => msg.topic, {
      sendMode,
      debugExtra: { exchange: name },
    }),
  );
  res.status(201).send({ sendMode });
});

const queues = new Map<string, Channel<Message>>();
app.get("/api/queues", (req, res) => {
  res.send(Array.from(queues.keys()))
});
app.post("/api/queues", async (req, res) => {
  const { name, bufferSize, topics } = req.body;
  console.log({name, bufferSize, topics})
  try {
    validateQueueRequestBody({name, bufferSize, topics}, Array.from(queues.keys()))
  } catch (e) {
    return res.status(400).send(e instanceof Error ? e.message : String(e))
  }

  const queue = new Channel<Message>(bufferSize, {
    debugExtra: { queue: name },
  });
  if (queues.has(name)) {
    return res.status(409).send(`A queue with the name ${name} already exists`);
  }
  queues.set(name, queue);
  res.status(201).send({ name, bufferSize, topics });
});

const port = process.env.PORT || 5000;
app.use(express.static(path.join(__dirname, "../../build")));
app.listen(port, () => console.log(`Listening on port ${port}`));

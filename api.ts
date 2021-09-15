import {
  BroadcastChannel,
  BroadcastSendModes,
  isBroadcastSendMode
} from "@eyalsh/async_channels";
import express from "express";

const app = express();

interface Message {
  topic: string;
  payload: string;
}

const exchanges = new Map<string, BroadcastChannel<Message, string>>();

app.post("/api/exchanges/:exchange", async (req, res) => {
  const sendMode = req.query.sendMode || BroadcastSendModes.WaitForOne;
  if (!isBroadcastSendMode((sendMode))) {
    return res.status(400).send("Invalid sendMode")
  }

  exchanges.set(req.params.exchange, new BroadcastChannel<Message, string>((msg) => msg.topic, { sendMode }));
  res.status(202);
});


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));

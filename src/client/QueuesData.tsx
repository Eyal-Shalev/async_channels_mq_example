import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { QueueName } from "../shared";
import useTimer from "./useTimer";

function isQueueType(x: unknown): x is QueueType {
  return typeof x === "string"
}
function isQueuesArray(x: unknown): x is QueueType[] {
  return Array.isArray(x) && x.every(isQueueType)
}
export type QueueType = QueueName;

type State = "loading" | "ready"

export type QueuesCtxType =
  | { state: Exclude<State, "loading">, data: QueueType[], error: undefined }
  | { state: Exclude<State, "loading">, data: undefined, error: Error }
  | { state: "loading", data: undefined, error: undefined }

export const queuesCtx = createContext<QueuesCtxType>({ state: "loading", data: undefined, error: undefined })

export const useQueues = () => useContext(queuesCtx);

export function QueuesProvider({ children }: PropsWithChildren<{}>) {
  const [cur, dispatchReset] = useTimer(5000)
  const [state, setState] = useState<State>("loading");
  const [data, setData] = useState<QueueType[]>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setState("loading");
    const ctrl = new AbortController();
    fetch("/api/queues", { signal: ctrl.signal })
      .then(resp => resp.ok ? resp.json() : resp.text().then(s => Promise.reject(s)))
      .then((data) => isQueuesArray(data) ? data : Promise.reject(new TypeError(`expected queues array, got: ${JSON.stringify(data)}`)))
      .then(
        (data) => setData(data),
        (err) => setError(err instanceof Error ? err : new Error(String(err))),
      )
      .finally(() => {
        setState("ready");
        dispatchReset();
      });
    return () => ctrl.abort();
  }, [cur, dispatchReset]);

  let ret: QueuesCtxType;
  if (data !== undefined) ret = { state: "ready", data, error: undefined };
  else if (error !== undefined) ret = { state: "ready", data: undefined, error };
  else if (state === "loading") ret = { state, data: undefined, error: undefined };
  else ret = { state, data: undefined, error: new Error("You've reached an unreachable point, congratulations 🎉") };

  return <queuesCtx.Provider value={ret}>
    {children}
  </queuesCtx.Provider>
}
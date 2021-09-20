import { Reducer, useEffect, useReducer, useState } from "react";

type FetchResultLoading = [true, undefined, undefined];
type FetchResultError = [false, undefined, Error];
type FetchResultData<T> = [false, T, undefined];
type FetchResult<T> =
  | FetchResultLoading
  | FetchResultError
  | FetchResultData<T>;

interface MyRequestInit extends RequestInit {
  refreshInterval?: number;
}

// export function useRefresh(refreshInterval?: number) {
//   const [cur, update] = useReducer<Reducer<Date | void, void>>(
//     () => new Date(),
//     void 0,
//   );
//   useEffect(() => {
//     if (refreshInterval === undefined) return;
//     const intervalId = setInterval(() => {
//       // update()
//     }, refreshInterval);
//     return () => clearInterval(intervalId);
//   }, [refreshInterval]);
//   return cur;
// }

export function useFetch(
  input: RequestInfo,
  init?: MyRequestInit,
): FetchResult<Response> {
  const {
    body,
    cache,
    credentials,
    headers,
    integrity,
    keepalive,
    method,
    mode
  } = init || {}
  // const refreshInterval = init?.refreshInterval;
  // delete init?.refreshInterval;
  // const cur = useRefresh(refreshInterval);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<Error>();
  const [resp, setResp] = useState<Response>();
  useEffect(() => {
    console.log({input, init})
    const ctrl = new AbortController();
    fetch(input, init).then(
      (resp) => {
        setResp(resp);
        setLoading(false);
      },
      (err) => {
        setErr(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      },
    );

    return () => ctrl.abort();
  }, [input, JSON.stringify(init)]);

  if (loading) return [true, undefined, undefined];
  if (resp !== undefined) return [false, resp, undefined];
  if (err !== undefined) return [false, undefined, err];
  throw new Error("You've reached an unreachable state, congratulations 🎉");
}

export function useJson<T>(
  guard: (o: unknown) => o is T,
  input: RequestInfo,
  init?: MyRequestInit,
): FetchResult<T> {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T>();
  const [err, setErr] = useState<Error>();
  const [fetchLoading, resp, fetchErr] = useFetch(input, init);

  useEffect(() => {
    if (fetchErr !== undefined) return setErr(fetchErr);
    if (resp === undefined) return;
    resp.json()
      .then((data) =>
        guard(data)
          ? data
          : Promise.reject(new TypeError(`invalid response: ${data}`))
      )
      .then(
        (data) => {
          setData(data);
          setLoading(false);
        },
        (err) => {
          setErr(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        },
      );
  }, [guard, fetchLoading, resp, fetchErr]);

  if (loading) return [true, undefined, undefined];
  if (err !== undefined) return [false, undefined, err];
  if (data !== undefined) return [false, data, undefined];
  throw new Error("You've reached an unreachable state, congratulations 🎉");
}

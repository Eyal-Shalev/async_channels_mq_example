import { Reducer, useEffect, useReducer } from "react";

export function useRefresh(refreshInterval?: number) {
  const [cur, update] = useReducer<Reducer<Date | void, void>>(
    () => new Date(),
    void 0,
  );
  useEffect(() => {
    if (refreshInterval === undefined) return;
    const intervalId = setInterval(() => {
      update()
    }, refreshInterval);
    return () => clearInterval(intervalId);
  }, [refreshInterval]);
  return cur;
}

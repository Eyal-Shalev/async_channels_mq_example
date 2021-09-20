import { ReducerWithoutAction, useEffect, useReducer, useState } from "react";

export default function useTimer(interval: number): [Date, () => void] {
  const [rand, reset] = useReducer<ReducerWithoutAction<number>>(
    Math.random,
    Math.random(),
  );
  const [cur, set] = useState(new Date());
  useEffect(() => {
    const id = setTimeout(() => set(new Date()), interval);
    return () => clearTimeout(id);
  }, [rand, interval]);

  return [cur, reset];
}

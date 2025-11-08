import { useEffect } from "react";
import { useMetricsStore } from "../store/metricsStore";

export function useRecordVisit(page: string): void {
  const recordVisit = useMetricsStore((state) => state.recordVisit);

  useEffect(() => {
    recordVisit(page);
  }, [recordVisit, page]);
}


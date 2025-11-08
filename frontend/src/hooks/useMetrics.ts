import { useMemo } from "react";
import { useMetricsStore } from "../store/metricsStore";

export function useMetrics() {
  const visits = useMetricsStore((state) => state.visits);
  const attractionViews = useMetricsStore((state) => state.attractionViews);
  const videoPlays = useMetricsStore((state) => state.videoPlays);
  const recordVisit = useMetricsStore((state) => state.recordVisit);
  const recordAttractionView = useMetricsStore((state) => state.recordAttractionView);
  const recordVideoPlay = useMetricsStore((state) => state.recordVideoPlay);

  return useMemo(
    () => ({
      visits,
      attractionViews,
      videoPlays,
      recordVisit,
      recordAttractionView,
      recordVideoPlay,
    }),
    [visits, attractionViews, videoPlays, recordVisit, recordAttractionView, recordVideoPlay],
  );
}


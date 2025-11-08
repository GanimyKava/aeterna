import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type MetricsState = {
  visits: Record<string, number>;
  attractionViews: Record<string, number>;
  videoPlays: Record<string, number>;
  recordVisit: (page: string) => void;
  recordAttractionView: (id: string) => void;
  recordVideoPlay: (id: string) => void;
};

const increment = (map: Record<string, number>, key: string): Record<string, number> => {
  const next = { ...map };
  next[key] = (next[key] ?? 0) + 1;
  return next;
};

export const useMetricsStore = create<MetricsState>()(
  devtools(
    persist(
      (set) => ({
        visits: {},
        attractionViews: {},
        videoPlays: {},
        recordVisit: (page) =>
          set((state) => ({
            visits: increment(state.visits, page),
          })),
        recordAttractionView: (id) =>
          set((state) => ({
            attractionViews: increment(state.attractionViews, id),
          })),
        recordVideoPlay: (id) =>
          set((state) => ({
            videoPlays: increment(state.videoPlays, id),
          })),
      }),
      {
        name: "eternity.metrics.v1",
        version: 1,
      },
    ),
  ),
);


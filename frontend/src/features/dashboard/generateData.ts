import type { Attraction } from "../../types/attraction";

export type DashboardAttraction = {
  id: string;
  name: string;
  type: string;
  city?: string | null;
  description?: string | null;
  views: number;
  revenue: number;
  engagement: number;
  completion: number;
};

export type DashboardData = {
  totalUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  detectionRate: number;
  totalRevenuePotential: number;
  activeLocations: number;
  attractions: DashboardAttraction[];
  modeUsage: Record<string, number>;
  completionByAttraction: { name: string; completion: number }[];
  sessionDuration: Record<string, number>;
  peakHours: number[];
  revenueByAttraction: { name: string; revenue: number }[];
  engagementByAttraction: { name: string; engagement: number }[];
  weeklyTrends: { day: string; sessions: number; revenue: number }[];
  conversionFunnel: Record<string, number>;
  cityData: Record<
    string,
    {
      visits: number;
      revenue: number;
      attractions: number;
    }
  >;
  locationEngagement: { name: string; engagement: number; visitors: number }[];
  touristFlow: { date: string; visitors: number }[];
  seasonalTrends: { month: string; visitors: number; revenue: number }[];
};

type MetricsSlice = StateCreator<unknown, [], [], { visits: Record<string, number>; attractionViews: Record<string, number> }>;

const average = (values: number[]): number => (values.length ? values.reduce((acc, value) => acc + value, 0) / values.length : 0);

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export function buildDashboardData(
  attractions: Attraction[],
  metrics: { visits: Record<string, number>; attractionViews: Record<string, number> },
): DashboardData {
  const { visits, attractionViews } = metrics;
  const totalVisits = Object.values(visits).reduce((acc, value) => acc + value, 0);
  const totalViews = Object.values(attractionViews).reduce((acc, value) => acc + value, 0);

  const baseUsers = Math.max(6000, totalVisits * 3 + Math.floor(Math.random() * 400));
  const baseSessions = Math.max(18000, totalVisits * 3.5 + Math.floor(Math.random() * 600));
  const avgSessionDuration = clamp(5 + Math.random() * 3, 5, 9);
  const detectionRate = clamp(84 + Math.random() * 8, 80, 95);

  const attractionDetails: DashboardAttraction[] = attractions.map((attraction) => {
    const views = Math.max(attractionViews[attraction.id] ?? 0, 800 + Math.floor(Math.random() * 1200));
    const revenuePerView = 6 + Math.random() * 6;
    const revenue = views * revenuePerView;
    const engagement = clamp(70 + Math.random() * 20, 70, 95);
    const completion = clamp(72 + Math.random() * 15, 70, 90);

    return {
      id: attraction.id,
      name: attraction.name,
      type: attraction.type,
      city: attraction.city,
      description: attraction.description,
      views,
      revenue,
      engagement,
      completion,
    };
  });

  const totalRevenuePotential = Math.max(
    220000,
    attractionDetails.reduce((acc, attraction) => acc + attraction.revenue, 0),
  );

  const modeUsage = attractions.reduce<Record<string, number>>((acc, attraction) => {
    const label =
      attraction.type === "marker"
        ? "Marker-based AR"
        : attraction.type === "imageNFT"
          ? "Image-based AR"
          : attraction.type === "location"
            ? "Location-based AR"
            : "Other";
    acc[label] = (acc[label] ?? 0) + Math.floor(Math.random() * 2000 + 1000);
    return acc;
  }, {});

  const sessionDuration = {
    "0-2 min": 2400,
    "2-5 min": 6100,
    "5-10 min": 9600,
    "10-15 min": 4800,
    "15+ min": 1300,
  };

  const peakHours = Array.from({ length: 24 }, (_, i) => {
    let base = 140;
    if (i === 10 || i === 14 || i === 18) base = 420;
    else if (i >= 8 && i <= 20) base = 200 + Math.sin((i - 8) * Math.PI / 12) * 150;
    else base = 90;
    return Math.floor(base + Math.random() * 40);
  });

  const weeklyTrends = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    const baseSessionsValue = 2600 + index * 150 + (isWeekend ? 400 : 0);
    const baseRevenueValue = 11000 + index * 600 + (isWeekend ? 1400 : 0);
    return {
      day: day.toLocaleDateString("en-US", { weekday: "short" }),
      sessions: Math.floor(baseSessionsValue + Math.random() * 150),
      revenue: Math.floor(baseRevenueValue + Math.random() * 350),
    };
  });

  const conversionFunnel = {
    "Page Views": Math.max(baseSessions * 1.6, 32000),
    "AR Sessions Started": Math.max(baseSessions * 0.95, 24000),
    "Markers Detected": Math.max(totalViews * 0.85, 20000),
    "Videos Played": Math.max(totalViews * 0.8, 18000),
    "Videos Completed": Math.max(totalViews * 0.6, 14000),
  };

  const cityData = attractionDetails.reduce<DashboardData["cityData"]>((accumulator, attraction) => {
    const city = attraction.city ?? "Unknown";
    if (!accumulator[city]) {
      accumulator[city] = {
        visits: 0,
        revenue: 0,
        attractions: 0,
      };
    }
    accumulator[city].visits += attraction.views;
    accumulator[city].revenue += attraction.revenue;
    accumulator[city].attractions += 1;
    return accumulator;
  }, {});

  const locationEngagement = attractionDetails
    .filter((attraction) => attraction.type === "location")
    .map((attraction) => ({
      name: attraction.name,
      engagement: attraction.engagement,
      visitors: attraction.views,
    }));

  const touristFlow = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const baseVisitors = 2600 + index * 120;
    return {
      date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      visitors: Math.floor(baseVisitors + Math.sin(index * 0.9) * 250 + Math.random() * 200),
    };
  });

  const seasonalTrends = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(new Date().getFullYear(), index, 1);
    const isPeak = index === 11 || index === 0 || index === 1;
    const growthFactor = 1 + index * 0.07;
    const baseVisitors = isPeak ? 7800 : 4200;
    const baseRevenue = isPeak ? 32000 : 15000;
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }),
      visitors: Math.floor(baseVisitors * growthFactor + Math.random() * 600),
      revenue: Math.floor(baseRevenue * growthFactor + Math.random() * 2800),
    };
  });

  return {
    totalUsers: Math.round(baseUsers),
    totalSessions: Math.round(baseSessions),
    avgSessionDuration,
    detectionRate,
    totalRevenuePotential,
    activeLocations: Math.max(locationEngagement.length, attractions.filter((attraction) => attraction.type === "location").length),
    attractions: attractionDetails,
    modeUsage,
    completionByAttraction: attractionDetails.map((attraction) => ({
      name: attraction.name,
      completion: attraction.completion,
    })),
    sessionDuration,
    peakHours,
    revenueByAttraction: attractionDetails.map((attraction) => ({
      name: attraction.name,
      revenue: attraction.revenue,
    })),
    engagementByAttraction: attractionDetails.map((attraction) => ({
      name: attraction.name,
      engagement: attraction.engagement,
    })),
    weeklyTrends,
    conversionFunnel,
    cityData,
    locationEngagement,
    touristFlow,
    seasonalTrends,
  };
}


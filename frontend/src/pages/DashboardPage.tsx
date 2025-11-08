import { useMemo } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Title as ChartTitle,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useAttractions } from "../hooks/useAttractions";
import { useMetrics } from "../hooks/useMetrics";
import { buildDashboardData } from "../features/dashboard/generateData";
import styles from "./DashboardPage.module.css";
import { useRecordVisit } from "../hooks/useRecordVisit";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, ChartTitle);

function DashboardPage(): JSX.Element {
  useRecordVisit("dashboard");
  const { data: attractions, isLoading, isError } = useAttractions();
  const metrics = useMetrics();

  const dashboard = useMemo(() => {
    if (!attractions) return null;
    return buildDashboardData(attractions, {
      visits: metrics.visits,
      attractionViews: metrics.attractionViews,
    });
  }, [attractions, metrics]);

  if (isLoading) {
    return <p>Loading dashboard...</p>;
  }

  if (isError || !dashboard) {
    return <p>Unable to load analytics at this time.</p>;
  }

  const funnelLabels = Object.keys(dashboard.conversionFunnel);

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1>Echoes of Eternity Insights</h1>
          <p>Network-assisted analytics that blend synthetic forecasts with live engagement telemetry.</p>
        </div>
      </header>

      <section className={styles.kpis}>
        <article>
          <span>👥</span>
          <div>
            <strong>{dashboard.totalUsers.toLocaleString()}</strong>
            <p>Total Users</p>
          </div>
        </article>
        <article>
          <span>📱</span>
          <div>
            <strong>{dashboard.totalSessions.toLocaleString()}</strong>
            <p>Sessions</p>
          </div>
        </article>
        <article>
          <span>⏱️</span>
          <div>
            <strong>{dashboard.avgSessionDuration.toFixed(1)}m</strong>
            <p>Avg Session Duration</p>
          </div>
        </article>
        <article>
          <span>🎯</span>
          <div>
            <strong>{dashboard.detectionRate.toFixed(1)}%</strong>
            <p>Detection Rate</p>
          </div>
        </article>
        <article>
          <span>💰</span>
          <div>
            <strong>${dashboard.totalRevenuePotential.toLocaleString()}</strong>
            <p>Revenue Potential</p>
          </div>
        </article>
        <article>
          <span>📍</span>
          <div>
            <strong>{dashboard.activeLocations}</strong>
            <p>Active Locations</p>
          </div>
        </article>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h2>Attractions Performance</h2>
          <ul className={styles.attractionList}>
            {dashboard.attractions.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong>
                <span>{item.city}</span>
                <div className={styles.attractionMetrics}>
                  <span>{item.views.toLocaleString()} views</span>
                  <span>${Math.round(item.revenue).toLocaleString()} revenue</span>
                  <span>{item.engagement.toFixed(1)}% engagement</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.card}>
          <h2>Top Attractions</h2>
          <Bar
            data={{
              labels: dashboard.attractions.map((item) => item.name),
              datasets: [
                {
                  label: "Views",
                  data: dashboard.attractions.map((item) => item.views),
                  backgroundColor: "rgba(66, 174, 255, 0.7)",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: "#c9dcff" } },
                y: { ticks: { color: "#c9dcff" } },
              },
            }}
            height={280}
          />
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h2>AR Mode Usage</h2>
          <Doughnut
            data={{
              labels: Object.keys(dashboard.modeUsage),
              datasets: [
                {
                  data: Object.values(dashboard.modeUsage),
                  backgroundColor: ["#60a5fa", "#38bdf8", "#a78bfa", "#f472b6"],
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  position: "bottom",
                  labels: { color: "#d7e5ff" },
                },
              },
            }}
          />
        </div>
        <div className={styles.card}>
          <h2>Completion Rate</h2>
          <Bar
            data={{
              labels: dashboard.completionByAttraction.map((item) => item.name),
              datasets: [
                {
                  label: "Video Completion %",
                  data: dashboard.completionByAttraction.map((item) => item.completion),
                  backgroundColor: "#34d399",
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: "#c9dcff" } },
                y: { ticks: { color: "#c9dcff" }, max: 100 },
              },
            }}
            height={280}
          />
        </div>
        <div className={styles.card}>
          <h2>Session Duration</h2>
          <Bar
            data={{
              labels: Object.keys(dashboard.sessionDuration),
              datasets: [
                {
                  label: "Sessions",
                  data: Object.values(dashboard.sessionDuration),
                  backgroundColor: "#facc15",
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: "#c9dcff" } },
                y: { ticks: { color: "#c9dcff" } },
              },
            }}
            height={280}
          />
        </div>
        <div className={styles.card}>
          <h2>Peak Usage</h2>
          <Line
            data={{
              labels: dashboard.peakHours.map((_, index) => `${index}:00`),
              datasets: [
                {
                  label: "Sessions",
                  data: dashboard.peakHours,
                  borderColor: "#8b5cf6",
                  backgroundColor: "rgba(139,92,246,0.2)",
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: "#d0e0ff" } } },
              scales: {
                x: { ticks: { color: "#c9dcff" } },
                y: { ticks: { color: "#c9dcff" } },
              },
            }}
            height={280}
          />
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h2>Revenue by Attraction</h2>
          <Bar
            data={{
              labels: dashboard.revenueByAttraction.map((item) => item.name),
              datasets: [
                {
                  label: "Revenue",
                  data: dashboard.revenueByAttraction.map((item) => item.revenue),
                  backgroundColor: "#f97316",
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: "#c9dcff" } },
                y: { ticks: { color: "#c9dcff" } },
              },
            }}
            height={280}
          />
        </div>
        <div className={styles.card}>
          <h2>Engagement Score</h2>
          <Bar
            data={{
              labels: dashboard.engagementByAttraction.map((item) => item.name),
              datasets: [
                {
                  label: "Engagement %",
                  data: dashboard.engagementByAttraction.map((item) => item.engagement),
                  backgroundColor: "#22c55e",
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: "#c9dcff" } },
                y: { ticks: { color: "#c9dcff" }, max: 100 },
              },
            }}
            height={280}
          />
        </div>
        <div className={styles.card}>
          <h2>Weekly Trends</h2>
          <Line
            data={{
              labels: dashboard.weeklyTrends.map((item) => item.day),
              datasets: [
                {
                  label: "Sessions",
                  data: dashboard.weeklyTrends.map((item) => item.sessions),
                  borderColor: "#38bdf8",
                  backgroundColor: "rgba(56,189,248,0.18)",
                },
                {
                  label: "Revenue",
                  data: dashboard.weeklyTrends.map((item) => item.revenue),
                  borderColor: "#f59e0b",
                  backgroundColor: "rgba(245,158,11,0.18)",
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: "#d7e6ff" } } },
              scales: {
                x: { ticks: { color: "#c9dcff" } },
                y: { ticks: { color: "#c9dcff" } },
              },
            }}
            height={280}
          />
        </div>
        <div className={styles.card}>
          <h2>Conversion Funnel</h2>
          <ul className={styles.funnel}>
            {funnelLabels.map((label, index) => (
              <li key={label} style={{ "--index": index } as React.CSSProperties}>
                <span>{label}</span>
                <strong>{dashboard.conversionFunnel[label].toLocaleString()}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h2>Popular Cities</h2>
          <Bar
            data={{
              labels: Object.keys(dashboard.cityData),
              datasets: [
                {
                  label: "Visits",
                  data: Object.values(dashboard.cityData).map((item) => item.visits),
                  backgroundColor: "#60a5fa",
                },
                {
                  label: "Revenue",
                  data: Object.values(dashboard.cityData).map((item) => item.revenue),
                  backgroundColor: "#f97316",
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              scales: {
                x: { ticks: { color: "#c9dcff" } },
                y: { ticks: { color: "#c9dcff" } },
              },
              plugins: {
                legend: {
                  labels: { color: "#dce8ff" },
                },
              },
            }}
            height={280}
          />
        </div>
        <div className={styles.card}>
          <h2>Location Engagement</h2>
          <Bar
            data={{
              labels: dashboard.locationEngagement.map((item) => item.name),
              datasets: [
                {
                  label: "Engagement %",
                  data: dashboard.locationEngagement.map((item) => item.engagement),
                  backgroundColor: "#f87171",
                },
                {
                  label: "Visitors",
                  data: dashboard.locationEngagement.map((item) => item.visitors),
                  backgroundColor: "#34d399",
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: { color: "#dce8ff" },
                },
              },
              scales: {
                x: { ticks: { color: "#c9dcff" } },
                y: { ticks: { color: "#c9dcff" } },
              },
            }}
            height={280}
          />
        </div>
        <div className={styles.card}>
          <h2>Tourist Flow</h2>
          <Line
            data={{
              labels: dashboard.touristFlow.map((item) => item.date),
              datasets: [
                {
                  label: "Visitors",
                  data: dashboard.touristFlow.map((item) => item.visitors),
                  borderColor: "#22d3ee",
                  backgroundColor: "rgba(34,211,238,0.18)",
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: "#d6e5ff" } } },
              scales: {
                x: { ticks: { color: "#c9dcff" } },
                y: { ticks: { color: "#c9dcff" } },
              },
            }}
            height={280}
          />
        </div>
        <div className={styles.card}>
          <h2>Seasonal Trends</h2>
          <Line
            data={{
              labels: dashboard.seasonalTrends.map((item) => item.month),
              datasets: [
                {
                  label: "Visitors",
                  data: dashboard.seasonalTrends.map((item) => item.visitors),
                  borderColor: "#8b5cf6",
                  backgroundColor: "rgba(139,92,246,0.18)",
                },
                {
                  label: "Revenue",
                  data: dashboard.seasonalTrends.map((item) => item.revenue),
                  borderColor: "#f59e0b",
                  backgroundColor: "rgba(245,158,11,0.18)",
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: "#d6e5ff" } } },
              scales: {
                x: { ticks: { color: "#c9dcff" } },
                y: { ticks: { color: "#c9dcff" } },
              },
            }}
            height={280}
          />
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;


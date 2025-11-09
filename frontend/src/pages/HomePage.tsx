import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";
import { useRecordVisit } from "../hooks/useRecordVisit";

const MarkerIcon = () => (
  <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s7-6.111 7-11a7 7 0 1 0-14 0c0 4.889 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const LocationIcon = () => (
  <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 10a7 7 0 0 1 14 0c0 5-7 11-7 11S5 15 5 10Z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);

const AdminIcon = () => (
  <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
    <circle cx="12" cy="7" r="3" />
    <rect x="3" y="3" width="18" height="18" rx="3" />
  </svg>
);

const DashboardIcon = () => (
  <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 13h6V3H3zm12 8h6v-8h-6zM15 3h6v6h-6zM3 21h6v-4H3z" />
  </svg>
);

const GuideIcon = () => (
  <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h10l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
    <path d="M14 4v6h6" />
    <path d="M8 12h7m-7 4h5" />
  </svg>
);

const arModes = [
  {
    title: "Marker-Based AR",
    description: "Point your device at a poster or pattern marker to unlock immersive video history.",
    to: "/ar/marker",
    icon: <MarkerIcon />,
  },
  {
    title: "Location AR",
    description: "Arrive at iconic destinations to trigger geo-fenced storytelling and video overlays.",
    to: "/ar/location",
    icon: <LocationIcon />,
  },
];

const tools = [
  {
    title: "Admin Studio",
    description: "Curate attractions, markers, and content in real time.",
    to: "/admin",
    icon: <AdminIcon />,
  },
  {
    title: "Time-Weave Dashboard",
    description: "Visualise engagement metrics, revenue trends, and tourism flows.",
    to: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    title: "Field Guide",
    description: "Get best-practice tips for on-site activations and guest support.",
    to: "/help",
    icon: <GuideIcon />,
  },
];

function HomePage(): JSX.Element {
  useRecordVisit("home");

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroPostcard}>
          <img src="/images/Uluru_Australia.jpg" alt="Uluru, Australia" loading="lazy" />
          <span>Outback Sunrise • Uluru</span>
        </div>
        <p className={styles.tagline}>Echoes of Eternity AR</p>
        <h1 className={styles.title}>Where Landmarks Remember</h1>
        <p className={styles.subtitle}>
          Bring Australia’s icons to life with network-powered augmented reality. Choose an AR mode below or open the
          operator toolkit to orchestrate dynamic experiences.
        </p>
        <div className={styles.heroActions}>
          <Link to="/ar/marker" className={styles.primary}>
            Enter AR
          </Link>
          <Link to="/dashboard" className={styles.secondary}>
            View Analytics
          </Link>
        </div>
      </section>

      <section className={styles.gridSection}>
        <h2>Explore AR Modes</h2>
        <div className={styles.grid}>
          {arModes.map((mode) => (
            <Link key={mode.to} to={mode.to} className={styles.card}>
              <span className={styles.cardIconWrap}>{mode.icon}</span>
              <h3>{mode.title}</h3>
              <p>{mode.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.gridSection}>
        <h2>Operator Toolkit</h2>
        <div className={styles.grid}>
          {tools.map((tool) => (
            <Link key={tool.to} to={tool.to} className={styles.card}>
              <span className={styles.cardIconWrap}>{tool.icon}</span>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;


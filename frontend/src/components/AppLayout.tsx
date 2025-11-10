import { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import styles from "./AppLayout.module.css";

type AppLayoutProps = {
  children: ReactNode;
};

const navItems = [
  { to: "/", label: "Home" },
  { to: "/ar/marker", label: "Marker AR" },
  { to: "/ar/location", label: "Location AR" },
  { to: "/admin", label: "Admin" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/analytics-chat", label: "Analytics Chat" },
  { to: "/help", label: "Help" },
];

export function AppLayout({ children }: AppLayoutProps): JSX.Element {
  const location = useLocation();

  const isArRoute = location.pathname.startsWith("/ar/");
  const shouldShowNav = !isArRoute;

  return (
    <div className={`${styles.appShell} ${isArRoute ? styles.arShell : ""}`}>
      {shouldShowNav ? (
        <header className={styles.header}>
          <Link to="/" className={styles.brand}>
            Echoes of Eternity
          </Link>
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
      ) : null}

      {isArRoute ? children : <main className={styles.main}>{children}</main>}
    </div>
  );
}


import styles from "./LoadingScreen.module.css";

export function LoadingScreen(): JSX.Element {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <p>Preparing Echoes of Eternity...</p>
    </div>
  );
}


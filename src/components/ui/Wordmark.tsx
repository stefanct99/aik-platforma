import { Logo } from "./Logo";
import styles from "./Wordmark.module.css";

export function Wordmark() {
  return (
    <span className={styles.znak}>
      <Logo />
      <span className={styles.wordmark}>
        <span className={styles.tvoj}>tvoj</span>
        <span className={styles.ai}>AI</span>
        <span className={styles.knjigovodja}>knjigovođa</span>
      </span>
    </span>
  );
}

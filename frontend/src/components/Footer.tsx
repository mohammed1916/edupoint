import React from 'react';
import styles from '../styles/footerAcrylic.module.css';

const Footer: React.FC = () => (
  <footer className={styles.acrylicFooter}>
    <div className={styles.footerContent}>
      <span>Affiliate partnerships via Awin (pending approval).</span>
      <a href="/privacy-policy" className={styles.privacyLink} target="_blank" rel="noopener noreferrer">Privacy Policy</a>
      <span className={styles.copyright}>&copy; {new Date().getFullYear()} GeoTourMate  — Built with care by Mohammed Abdullah. All rights reserved.</span>
    </div>
  </footer>
);

export default Footer;

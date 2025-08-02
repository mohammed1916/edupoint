import React, { useState } from 'react';
import styles from '../styles/consentBanner.module.css';

const ConsentBanner: React.FC<{ onAccept: () => void }> = ({ onAccept }) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className={styles.consentBanner}>
      This site uses cookies for analytics. By clicking Accept, you consent to analytics being enabled.
      <button
        className={styles.acceptButton}
        onClick={() => { setVisible(false); onAccept(); }}
      >
        Accept
      </button>
    </div>
  );
};

export default ConsentBanner;

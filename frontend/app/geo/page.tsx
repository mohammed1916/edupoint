import React from 'react';
import FirebaseNavbar from '../../src/components/FirebaseNavbar';
import styles from '../../src/styles/homepage.module.css';

const Geo = () => {
  return (
    <div className={styles.homepageContainer}>
      <FirebaseNavbar />
      <main className={styles.mainContent}>
        <h1>Geo Page</h1>
        {/* Add geo-specific content here */}
      </main>
    </div>
  );
};

export default Geo;

import React from 'react';
import FirebaseNavbar from '../src/components/FirebaseNavbar';
import GoogleCalendar from '../src/components/GoogleCalendar';
import Chatbot from '../src/components/Chatbot';
import styles from '../src/styles/homepage.module.css';

const Homepage = () => {
  return (
    <div className={styles.homepageContainer}>
      <main className={styles.mainContent}>
        <h1>Welcome to EduPoint</h1>
        <GoogleCalendar />
      </main>
      <Chatbot />
    </div>
  );
};

export default Homepage;
import React from 'react';
import FirebaseNavbar from '../components/FirebaseNavbar';
import GoogleCalendar from '../components/GoogleCalendar';
import Chatbot from '../components/Chatbot';
import styles from '../styles/homepage.module.css';

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

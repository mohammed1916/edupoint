import React from 'react';
import Navbar from '../components/Navbar';
import GoogleCalendar from '../components/GoogleCalendar';
import Chatbot from '../components/Chatbot';
import styles from '../styles/homepage.module.css';

const Homepage = () => {
  return (
    <div className={styles.homepageContainer}>
      <Navbar />
      <main className={styles.mainContent}>
        <h1>Welcome to EduPoint</h1>
        <GoogleCalendar />
      </main>
      <Chatbot />
    </div>
  );
};

export default Homepage;

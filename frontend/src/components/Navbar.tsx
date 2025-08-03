import React from 'react';
import Link from 'next/link';
import styles from '../styles/navbar.module.css';

const Navbar = () => (
  <nav className={styles.navbar}>
    <ul>
      <li><Link href="/">Home</Link></li>
      <li><Link href="/geo">Geo</Link></li>
      <li><Link href="/calendar">Calendar</Link></li>
      <li><Link href="#chatbot">Chatbot</Link></li>
    </ul>
  </nav>
);

export default Navbar;

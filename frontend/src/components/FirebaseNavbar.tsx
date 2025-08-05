import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from '../context/AuthContext';
import styles from './FirebaseNavbar.module.css';

const FirebaseNavbar = () => {
  const { profile, signIn, signOutUser } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  const handleSignIn = async () => {
    await signIn();
    setToast("Signed in!");
    setTimeout(() => setToast(null), 3000);
  };

  const handleSignOut = async () => {
    await signOutUser();
    setToast("Signed out!");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/geo">Geo</Link></li>
        <li><Link href="/calendar">Calendar</Link></li>
        <li><Link href="#chatbot">Chatbot</Link></li>
      </ul>
      <div className={styles.profileArea}>
        {!profile ? (
          <div>
            <button className={styles.fancyBtn} onClick={handleSignIn}>Sign in with Google</button>
            <p style={{ fontSize: '0.9rem', color: '#eee', marginTop: 8 }}>
              If you are not prompted for calendar access, <br />
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ color: '#ffd700' }}>revoke app access</a> and sign in again.
            </p>
          </div>
        ) : (
          <>
            {profile?.picture && (
              <img src={profile.picture} alt="Profile" className={styles.profileImg} />
            )}
            <span className={styles.profileName}>{profile?.name}</span>
            <button className={styles.fancyBtn} onClick={handleSignOut}>Sign Out</button>
          </>
        )}
      </div>
      {toast && (
        <div className={styles.toast}>{toast}</div>
      )}
    </nav>
  );
};

export default FirebaseNavbar;

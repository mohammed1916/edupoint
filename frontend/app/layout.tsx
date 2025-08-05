import React from 'react';
import FirebaseNavbar from '../src/components/FirebaseNavbar';
import { AuthProvider } from '../src/context/AuthContext';
import '../src/styles/modern.module.css';
import AnalyticsConsent from './components/AnalyticsConsent';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <FirebaseNavbar />
          {children}
          <AnalyticsConsent />
        </AuthProvider>
      </body>
    </html>
  );
}

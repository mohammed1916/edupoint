import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import store from '../redux/store';
import React from 'react';
import ConsentBanner from '../components/ConsentBanner';
import { app } from '../firebaseConfig';
import { getAnalytics } from "firebase/analytics";
import FirebaseNavbar from '../components/FirebaseNavbar';
import { AuthProvider } from '../context/AuthContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(false);

  const handleConsent = () => {
    if (typeof window !== 'undefined') {
      getAnalytics(app);
      setAnalyticsEnabled(true);
    }
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>
      <Provider store={store}>
        <AuthProvider>
          <FirebaseNavbar />
          <Component {...pageProps} />
          {!analyticsEnabled && <ConsentBanner onAccept={handleConsent} />}
        </AuthProvider>
      </Provider>
    </>
  );
}

export default MyApp;
import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import store from '../redux/store';
import React, { useState, createContext } from 'react';
import ConsentBanner from '../components/ConsentBanner';
import { app } from '../firebaseConfig';
import { getAnalytics } from "firebase/analytics";
import FirebaseNavbar from '../components/FirebaseNavbar';

export const AccessTokenContext = createContext<string | null>(null);

function MyApp({ Component, pageProps }: AppProps) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const handleConsent = () => {
    if (typeof window !== 'undefined') {
      getAnalytics(app);
      setAnalyticsEnabled(true);
    }
  };

  return (
    <Provider store={store}>
      <AccessTokenContext.Provider value={accessToken}>
        <FirebaseNavbar setAccessToken={setAccessToken} />
        <Component {...pageProps} />
        {!analyticsEnabled && <ConsentBanner onAccept={handleConsent} />}
      </AccessTokenContext.Provider>
    </Provider>
  );
}

export default MyApp;
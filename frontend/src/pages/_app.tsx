import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import store from '../redux/store';
import React, { useState } from 'react';
import ConsentBanner from '../components/ConsentBanner';
import { app, getAnalytics } from '../services/firebase';

function MyApp({ Component, pageProps }: AppProps) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  const handleConsent = () => {
    if (typeof window !== 'undefined') {
      getAnalytics(app);
      setAnalyticsEnabled(true);
    }
  };

  return (
    <Provider store={store}>
      <Component {...pageProps} />
      {!analyticsEnabled && <ConsentBanner onAccept={handleConsent} />}
    </Provider>
  );
}

export default MyApp;
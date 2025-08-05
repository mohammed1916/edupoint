import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import store from '../redux/store';
import React from 'react';
import ConsentBanner from '../components/ConsentBanner';
import { app } from '../firebaseConfig';
import { getAnalytics } from "firebase/analytics";
import FirebaseNavbar from '../components/FirebaseNavbar';
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(false);

  const handleConsent = () => {
    if (typeof window !== 'undefined') {
      getAnalytics(app);
      setAnalyticsEnabled(true);
    }
  };

  return (
    <Provider store={store}>
      <AuthProvider>
        <FirebaseNavbar />
        <Component {...pageProps} />
        {!analyticsEnabled && <ConsentBanner onAccept={handleConsent} />}
      </AuthProvider>
    </Provider>
  );
}

export default MyApp;
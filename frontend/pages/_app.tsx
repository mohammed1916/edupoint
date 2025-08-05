import type { AppProps } from 'next/app';
import { AuthProvider } from '../src/context/AuthContext';
import FirebaseNavbar from '../src/components/FirebaseNavbar';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <FirebaseNavbar setAccessToken={() => {}} />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
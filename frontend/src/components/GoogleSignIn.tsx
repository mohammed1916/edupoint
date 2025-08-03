import React, { useEffect, useState } from 'react';

const CLIENT_ID = '523580660855-0bj51varng67boign9vs26n7v5m08rks.apps.googleusercontent.com';

const GoogleSignIn = ({ onSignIn }: { onSignIn: (token: string) => void }) => {
  const [gapiLoaded, setGapiLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => setGapiLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (gapiLoaded && window.google) {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response: any) => {
          onSignIn(response.credential);
        },
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large' }
      );
    }
  }, [gapiLoaded, onSignIn]);

  return <div id="google-signin-btn" style={{ margin: '1rem 0' }} />;
};

export default GoogleSignIn;

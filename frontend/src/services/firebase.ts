import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD5gw5-rvgDFcH0JQmHbCDwfdPcGEjFDjQ",
  authDomain: "geotourmate.firebaseapp.com",
  projectId: "geotourmate",
  storageBucket: "geotourmate.firebasestorage.app",
  messagingSenderId: "1016845468862",
  appId: "1:1016845468862:web:ea038b861c26efbb434aef",
  measurementId: "G-KR3KWD159P"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Do not initialize analytics here. Only export the function.
export { app, getAnalytics };

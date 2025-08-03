// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
export const firebaseConfig = {
  apiKey: "AIzaSyARw1G5gkOpG_tOqfOHFjEqRo8QPDFMyBY",
  authDomain: "edupoint-b1bf5.firebaseapp.com",
  projectId: "edupoint-b1bf5",
  storageBucket: "edupoint-b1bf5.firebasestorage.app",
  messagingSenderId: "350853045874",
  appId: "1:350853045874:web:7a6607e69cb46b60b06ceb",
  measurementId: "G-YYEQVBGCVK"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined;
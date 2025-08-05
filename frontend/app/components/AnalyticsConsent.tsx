"use client";
import React, { useState } from "react";
import ConsentBanner from "../../src/components/ConsentBanner";
import { app } from "../../src/firebaseConfig";
import { getAnalytics } from "firebase/analytics";

const AnalyticsConsent: React.FC = () => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  const handleConsent = () => {
    if (typeof window !== "undefined") {
      getAnalytics(app);
      setAnalyticsEnabled(true);
    }
  };

  return !analyticsEnabled ? (
    <ConsentBanner onAccept={handleConsent} />
  ) : null;
};

export default AnalyticsConsent;

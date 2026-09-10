"use client";

import { useEffect, useState } from "react";
import { SplashScreen } from "./SplashScreen";

const SPLASH_SESSION_KEY = "bc_splash_shown";

export function SplashWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SPLASH_SESSION_KEY);

    setShowSplash(!alreadyShown);
    setHydrated(true);
  }, []);

  const handleFinishSplash = () => {
    sessionStorage.setItem(SPLASH_SESSION_KEY, "true");
    setShowSplash(false);
  };

  // Prevent the server-rendered UI from flashing before
  // we know whether the splash should be shown.
  if (!hydrated) {
    return null;
  }

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={handleFinishSplash}
        minimumDurationMs={4000}
      />
    );
  }

  return <>{children}</>;
}
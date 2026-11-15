"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { detectOpticalTier } from "./detect";
import type { OpticalTier, OpticalTierPreference } from "./types";

type OpticalTierContextValue = {
  tier: OpticalTier;
  detectedTier: OpticalTier;
  preference: OpticalTierPreference;
  setPreference: (value: OpticalTierPreference) => void;
};

const OpticalTierContext = createContext<OpticalTierContextValue | null>(null);

function readTierOverride(): OpticalTierPreference | null {
  if (typeof window === "undefined") return null;

  const value = new URLSearchParams(window.location.search).get("tier");
  if (value === "high" || value === "mid" || value === "low") return value;

  return null;
}

type OpticalProviderProps = {
  children: React.ReactNode;
  initialPreference?: OpticalTierPreference;
};

export function OpticalProvider({
  children,
  initialPreference = "auto",
}: OpticalProviderProps) {
  const [detectedTier, setDetectedTier] = useState<OpticalTier>("mid");
  const [preference, setPreference] =
    useState<OpticalTierPreference>(initialPreference);

  useEffect(() => {
    setDetectedTier(detectOpticalTier());

    const override = readTierOverride();
    if (override) setPreference(override);
  }, []);

  const tier = preference === "auto" ? detectedTier : preference;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.tier = tier;

    return () => {
      delete root.dataset.tier;
    };
  }, [tier]);

  const value = useMemo(
    () => ({
      tier,
      detectedTier,
      preference,
      setPreference,
    }),
    [tier, detectedTier, preference],
  );

  return (
    <OpticalTierContext.Provider value={value}>
      {children}
    </OpticalTierContext.Provider>
  );
}

export function useOpticalTier(): OpticalTierContextValue {
  const context = useContext(OpticalTierContext);

  if (!context) {
    throw new Error("useOpticalTier must be used within <OpticalProvider>.");
  }

  return context;
}

import type { MutableRefObject } from "react";

export type LogisticsZone = "maritime" | "offloading" | "transit" | "warehouse";

export interface ResponsiveSceneConfig {
  isMobile: boolean;
  particleCount: number;
  maxDpr: number;
  shadows: boolean;
  parallaxStrength: number;
}

export interface TelemetryDatum {
  label: string;
  value: string;
  accent?: boolean;
}

export interface TrackingFormState {
  origin: string;
  destination: string;
  cargoType: string;
  weight: string;
}

export interface TrackingEstimate {
  transitTime: string;
  handlingStages: number;
  status: "PLANNING READY";
  routeCode: string;
}

export interface SceneProps {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}

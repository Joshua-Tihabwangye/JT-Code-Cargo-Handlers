import type {
  TrackingEstimate,
  TrackingFormState,
} from "@/components/logistics/types";

export const EMPTY_TRACKING_FORM: TrackingFormState = {
  origin: "",
  destination: "",
  cargoType: "",
  weight: "",
};

export function calculateTrackingEstimate(
  form: TrackingFormState,
): TrackingEstimate {
  const origin = form.origin.trim();
  const destination = form.destination.trim();
  const weight = Number(form.weight);

  if (!origin || !destination || !form.cargoType || !form.weight) {
    throw new Error("Complete every field to calculate an estimate.");
  }

  if (origin.toLocaleLowerCase() === destination.toLocaleLowerCase()) {
    throw new Error("Origin and destination must be different.");
  }

  if (!Number.isFinite(weight) || weight <= 0 || weight > 50000) {
    throw new Error("Enter a weight between 1 and 50,000 kg.");
  }

  const routeSeed = [...`${origin}${destination}`].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  const cargoFactor = form.cargoType === "temperature" ? 2 : 0;
  const weightFactor = weight > 12000 ? 2 : weight > 4000 ? 1 : 0;
  const days = 4 + (routeSeed % 7) + cargoFactor + weightFactor;

  return {
    transitTime: `${days}–${days + 2} days`,
    handlingStages: weight > 12000 || form.cargoType === "oversized" ? 6 : 5,
    status: "PLANNING READY",
    routeCode: `${origin.slice(0, 3)}-${destination.slice(0, 3)}`.toUpperCase(),
  };
}

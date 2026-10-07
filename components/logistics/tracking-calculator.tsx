"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Calculator, CheckCircle2, Clock3, Layers3 } from "lucide-react";
import {
  calculateTrackingEstimate,
  EMPTY_TRACKING_FORM,
} from "@/lib/tracking-estimate";
import type { TrackingEstimate, TrackingFormState } from "./types";
import { GlassCard } from "./glass-card";

interface WebMCPTool {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute(input: unknown): unknown | Promise<unknown>;
}

interface ModelContext {
  registerTool(tool: WebMCPTool, options?: { signal?: AbortSignal }): void | Promise<void>;
}

declare global {
  interface Document {
    readonly modelContext?: ModelContext;
  }
}

function parseToolInput(input: unknown): TrackingFormState {
  if (!input || typeof input !== "object") throw new Error("Cargo estimate input is required.");
  const record = input as Record<string, unknown>;
  const keys: Array<keyof TrackingFormState> = ["origin", "destination", "cargoType", "weight"];
  const parsed = { ...EMPTY_TRACKING_FORM };
  keys.forEach((key) => {
    if (typeof record[key] !== "string") throw new Error(`${key} must be text.`);
    parsed[key] = record[key];
  });
  return parsed;
}

export function TrackingCalculator() {
  const [form, setForm] = useState<TrackingFormState>(EMPTY_TRACKING_FORM);
  const [estimate, setEstimate] = useState<TrackingEstimate | null>(null);
  const [error, setError] = useState("");

  const runEstimate = useCallback((values: TrackingFormState) => {
    try {
      const nextEstimate = calculateTrackingEstimate(values);
      setForm(values);
      setEstimate(nextEstimate);
      setError("");
      return nextEstimate;
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to calculate this route.";
      setEstimate(null);
      setError(message);
      throw caughtError;
    }
  }, []);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();

    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: "calculate_cargo_estimate",
            title: "Calculate cargo estimate",
            description:
              "Calculate the same demonstration cargo estimate shown in the JT-Code Cargo route planner.",
            inputSchema: {
              type: "object",
              properties: {
                origin: { type: "string", minLength: 2 },
                destination: { type: "string", minLength: 2 },
                cargoType: {
                  type: "string",
                  enum: ["general", "temperature", "oversized", "high-value"],
                },
                weight: { type: "string", pattern: "^[0-9]+(?:\\.[0-9]+)?$" },
              },
              required: ["origin", "destination", "cargoType", "weight"],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute(input) {
              const values = parseToolInput(input);
              return runEstimate(values);
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch((toolError: unknown) => {
        console.warn("Cargo estimate tool registration failed.", toolError);
      });
    } catch (toolError) {
      console.warn("Cargo estimate tool is unavailable.", toolError);
    }

    return () => lifecycle.abort();
  }, [runEstimate]);

  function updateField(field: keyof TrackingFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      runEstimate(form);
    } catch {
      // The visible error state is set by runEstimate.
    }
  }

  return (
    <GlassCard className="calculator-card" data-reveal>
      <div className="calculator-card__header">
        <Calculator aria-hidden="true" size={20} />
        <div>
          <span className="section-kicker">Route planner</span>
          <h3>Tracking estimate</h3>
        </div>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="calculator-fields">
          <label>
            Origin
            <select
              value={form.origin}
              onChange={(event) => updateField("origin", event.target.value)}
              aria-invalid={Boolean(error && !form.origin)}
            >
              <option value="">Select port</option>
              <option value="Mombasa">Mombasa</option>
              <option value="Rotterdam">Rotterdam</option>
              <option value="Singapore">Singapore</option>
              <option value="Dubai">Dubai</option>
            </select>
          </label>
          <label>
            Destination
            <select
              value={form.destination}
              onChange={(event) => updateField("destination", event.target.value)}
              aria-invalid={Boolean(error && !form.destination)}
            >
              <option value="">Select hub</option>
              <option value="Kampala">Kampala</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Kigali">Kigali</option>
              <option value="Dar es Salaam">Dar es Salaam</option>
            </select>
          </label>
          <label>
            Cargo type
            <select
              value={form.cargoType}
              onChange={(event) => updateField("cargoType", event.target.value)}
              aria-invalid={Boolean(error && !form.cargoType)}
            >
              <option value="">Select cargo</option>
              <option value="general">General freight</option>
              <option value="temperature">Temperature controlled</option>
              <option value="oversized">Oversized cargo</option>
              <option value="high-value">High-value cargo</option>
            </select>
          </label>
          <label>
            Weight (kg)
            <input
              inputMode="decimal"
              min="1"
              max="50000"
              type="number"
              placeholder="e.g. 2400"
              value={form.weight}
              onChange={(event) => updateField("weight", event.target.value)}
              aria-invalid={Boolean(error && !form.weight)}
            />
          </label>
        </div>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="button button--primary calculator-submit" type="submit">
          Calculate estimate
        </button>
      </form>

      <div className={`estimate-result ${estimate ? "is-ready" : ""}`} aria-live="polite">
        {estimate ? (
          <>
            <div>
              <Clock3 aria-hidden="true" size={17} />
              <span>Transit</span>
              <strong>{estimate.transitTime}</strong>
            </div>
            <div>
              <Layers3 aria-hidden="true" size={17} />
              <span>Handling</span>
              <strong>{estimate.handlingStages} stages</strong>
            </div>
            <div>
              <CheckCircle2 aria-hidden="true" size={17} />
              <span>Status</span>
              <strong>{estimate.status}</strong>
            </div>
          </>
        ) : (
          <p>Select a route and cargo profile to see a planning estimate.</p>
        )}
      </div>
      <p className="calculator-disclaimer">Planning estimate · Frontend demonstration only</p>
    </GlassCard>
  );
}

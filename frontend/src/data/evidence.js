// Synthetic evidence per scenario and stage, shaped like the backend plan match.
// Numbers are copied from backend/data/scenarios.json; evidence.test.js guards against drift.

export const confidence = { low: 25, high: 50 };

export const evidence = {
  "household-maes": {
    whisper: {
      score: 40,
      windowStage: "whisper",
      signals: [
        { label: "The renovation deadline is within three years", weight: 20, contribution: 20 },
        { label: "Energy costs have risen year after year", weight: 15, contribution: 15 },
        { label: "Most homes nearby are old", weight: 5, contribution: 5 },
      ],
      suppressed: [],
    },
    forming: {
      score: 75,
      windowStage: "forming",
      signals: [
        { label: "The renovation deadline is within three years", weight: 20, contribution: 20 },
        { label: "Energy costs have risen year after year", weight: 15, contribution: 15 },
        { label: "The heating system reaches the end of its life within a year", weight: 25, contribution: 25 },
        { label: "Recent visits to the energy pages", weight: 10, contribution: 10 },
        { label: "Most homes nearby are old", weight: 5, contribution: 5 },
      ],
      suppressed: [],
    },
    ready: {
      score: 90,
      windowStage: "ready",
      signals: [
        { label: "The renovation deadline is within three years", weight: 20, contribution: 20 },
        { label: "Energy costs have risen year after year", weight: 15, contribution: 15 },
        { label: "The heating system reaches the end of its life within a year", weight: 25, contribution: 25 },
        { label: "Recent visits to the energy pages", weight: 10, contribution: 10 },
        { label: "A boiler repair invoice", weight: 15, contribution: 15 },
        { label: "Most homes nearby are old", weight: 5, contribution: 5 },
      ],
      suppressed: [],
    },
  },
  "bakery-leuven": {
    whisper: {
      score: 40,
      windowStage: "whisper",
      signals: [
        { label: "Energy costs are rising against revenue", weight: 15, contribution: 15 },
        { label: "The planned van replacement is within a year", weight: 20, contribution: 20 },
        { label: "Most buildings nearby are old", weight: 5, contribution: 5 },
      ],
      suppressed: [],
    },
    forming: {
      score: 80,
      windowStage: "forming",
      signals: [
        { label: "Energy costs are rising against revenue", weight: 15, contribution: 15 },
        { label: "The planned van replacement is within a year", weight: 20, contribution: 20 },
        { label: "The planned van replacement is within six months", weight: 15, contribution: 15 },
        { label: "Delivery vans drive into the Brussels low-emission zone", weight: 25, contribution: 25 },
        { label: "Most buildings nearby are old", weight: 5, contribution: 5 },
      ],
      suppressed: [],
    },
    ready: {
      score: 100,
      windowStage: "ready",
      signals: [
        { label: "Energy costs are rising against revenue", weight: 15, contribution: 15 },
        { label: "The planned van replacement is within a year", weight: 20, contribution: 20 },
        { label: "The planned van replacement is within six months", weight: 15, contribution: 15 },
        { label: "Delivery vans drive into the Brussels low-emission zone", weight: 25, contribution: 25 },
        { label: "A deposit on a vehicle", weight: 20, contribution: 20 },
        { label: "Most buildings nearby are old", weight: 5, contribution: 5 },
      ],
      suppressed: [],
    },
  },
};

// The cached plans withhold nothing, so one state carries a labelled demo entry.
evidence["bakery-leuven"].whisper.suppressed = [
  { intent: "Home renovation", reason: "cooldown-dismissed", score: 31, demo: true },
];

const reasons = {
  "low-confidence": "not enough signals yet",
  "cooldown-dismissed": "paused after an earlier no",
};

export function reasonText(reason) {
  return reasons[reason] ?? "held back";
}

export function evidenceFor(scenarioId, stage) {
  return evidence[scenarioId]?.[stage] ?? null;
}

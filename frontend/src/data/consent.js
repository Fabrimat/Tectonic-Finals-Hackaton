// The four consent layers. Each is asked for on its own.
export const layers = [
  { id: "analysis", label: "Analysis" },
  { id: "goal", label: "Goal" },
  { id: "sharing", label: "Share" },
  { id: "commitment", label: "Commit" },
];

// The full wording per layer: what applies now and what is not happening yet. Shown behind Details.
export const contexts = {
  analysis: {
    layer: 1,
    now: "KBC looks at your own data to place you on the ladder. It stays in your view.",
    not: "No goal is set, nothing goes to a partner, nothing is bought.",
  },
  goal: {
    layer: 2,
    now: "You confirm what we think is coming and which data we used.",
    not: "Nothing is shared with a partner and nothing is bought.",
  },
  plan: {
    layer: 3,
    now: "Accepting a step sends a partner an anonymous request. Contact details follow only if you authorise that partner for that step.",
    not: "Nothing is bought. A quote or loan needs its own approval.",
  },
};

// What each layer is called in full, for the Details text.
export const layerNames = ["Analysis", "Goal confirmation", "Sharing anonymously with a partner", "Commitment to a paid step"];

// The decisions every slide state that shows decisions uses, so the plan, dashboard, numbers and
// deck figures agree. The household set accepts the energy loan and the insurance update, so the
// headline conversion into KBC products reads in a meaningful range.
export const decisionSets = {
  "household-maes": {
    accepted: ["epc", "estimate", "insulation", "energy-loan", "home-insurance"],
    deferred: ["heating"],
    rejected: ["solar"],
  },
  "bakery-leuven": {
    accepted: ["co2", "advice", "van-finance"],
    deferred: ["charging"],
    rejected: ["solar"],
  },
};

export function decisionQuery(scenarioId) {
  const set = decisionSets[scenarioId];
  return ["accepted", "deferred", "rejected"].map((key) => `${key}=${set[key].join(",")}`).join("&");
}

// Decisions as the app keeps them: { stepId: "accepted" | "deferred" | "rejected" }.
export function decisionMap(scenarioId) {
  const set = decisionSets[scenarioId];
  const map = {};
  for (const key of ["accepted", "deferred", "rejected"]) for (const id of set[key]) map[id] = key;
  return map;
}

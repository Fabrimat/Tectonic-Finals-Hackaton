import { facts, factLine } from "../data/facts.js";
import { groupRounds } from "../data/groupRounds.js";

// Notes the plan adds for one step, based on where the customer lives.
export function areaNotes(area, step) {
  if (!area) return [];
  const notes = [];
  if (area.historicCentre && step.areaTopics?.includes("historic")) {
    notes.push(factLine(facts.historicCentre));
  }
  if (step.roundService) {
    const open = groupRounds.filter((r) => area.openGroupRounds?.includes(r.id) && r.service === step.roundService);
    for (const round of open) {
      notes.push(`Group round open nearby: ${round.name}, run by ${round.runBy}.`);
    }
  }
  return notes;
}

export function stockLine(area) {
  if (!area || !area.buildingStockAge) return "";
  return `Buildings nearby are about ${area.buildingStockAge} years old.`;
}

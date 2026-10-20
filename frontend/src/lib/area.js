import { facts } from "../data/facts.js";
import { groupRounds } from "../data/groupRounds.js";

// Notes the plan adds for one step, based on where the customer lives.
export function areaNotes(area, step) {
  if (!area) return [];
  const notes = [];
  if (area.historicCentre && step.areaTopics?.includes("historic")) {
    notes.push(facts.historicCentre.text);
  }
  if (step.roundService) {
    const open = groupRounds.filter((r) => area.openGroupRounds?.includes(r.id) && r.service === step.roundService);
    for (const round of open) {
      notes.push(`A group round is open nearby: ${round.name}, run by ${round.runBy}. You can join it instead of asking for a separate quote.`);
    }
  }
  return notes;
}

export function stockLine(area) {
  if (!area || !area.buildingStockAge) return "";
  return `Buildings around you are typically about ${area.buildingStockAge} years old.`;
}

// Estimates for the proof of concept. Edit here, the Numbers page follows.
export const assumptions = {
  conversion: 0.25,
  leadValue: { A: 150, B: 450, C: 900 },
  commission: 0.08,
  retentionShare: 0.03,
  retentionMinSteps: 3,
  retentionYears: 1,
  marginPerYear: 180,
};

export function kbcEstimate(leads, acceptedCount) {
  const a = assumptions;
  const signedValue = leads.reduce((sum, l) => sum + a.leadValue[l.band] * a.conversion, 0);
  const commission = signedValue * a.commission;
  const eligible = acceptedCount >= a.retentionMinSteps;
  const retention = eligible ? a.retentionShare * a.retentionYears * a.marginPerYear : 0;
  return { signedValue, commission, eligible, retention, total: commission + retention };
}

export const eur = (n) => `EUR ${n.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;

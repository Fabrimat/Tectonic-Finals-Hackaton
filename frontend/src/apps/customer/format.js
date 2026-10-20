export function money(amount) {
  return `EUR ${amount.toLocaleString("en-GB")}`;
}

// Soft wording for a time ahead: whole years from two years on, months below that.
export function monthsLabel(months) {
  if (months >= 24) {
    const years = Math.round(months / 12);
    return `about ${years} ${years === 1 ? "year" : "years"}`;
  }
  const whole = Math.max(1, Math.round(months));
  return `about ${whole} ${whole === 1 ? "month" : "months"}`;
}

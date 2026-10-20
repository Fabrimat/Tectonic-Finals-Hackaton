import data from "../../data/synthetic.json" with { type: "json" };

// Estimates for the proof of concept live in data/synthetic.json, the slides read the same file.
// KBC value comes first from conversion into its own products. Partner commission is separate
// because only some partners pay one.
export const assumptions = data;

// Expected value of the KBC products among the accepted steps: conversion times first year value.
export function productEstimate(acceptedIds) {
  const accepted = new Set(acceptedIds);
  const items = data.kbcProducts
    .map((p) => {
      const count = p.stepIds.filter((id) => accepted.has(id)).length;
      return { id: p.id, label: p.label, conversion: p.conversion, value: p.value, count, expected: count * p.conversion * p.value };
    })
    .filter((item) => item.count > 0);
  return { items, total: items.reduce((sum, item) => sum + item.expected, 0) };
}

// Commission only for partners with a rate. The others still receive leads, KBC earns nothing from them.
export function commissionEstimate(leads) {
  const { conversion, leadValue } = data.partnerLeads;
  const items = [];
  for (const lead of leads) {
    const rate = data.commission[lead.partner] ?? null;
    let item = items.find((i) => i.partner === lead.partner);
    if (!item) {
      item = { partner: lead.partner, rate, leads: 0, signedValue: 0, amount: 0 };
      items.push(item);
    }
    const signed = leadValue[lead.band] * conversion;
    item.leads += 1;
    item.signedValue += signed;
    item.amount += rate ? signed * rate : 0;
  }
  const withRate = items.filter((i) => i.rate);
  return {
    items,
    total: items.reduce((sum, i) => sum + i.amount, 0),
    partnersWithRate: withRate.length,
    partnersWithout: items.length - withRate.length,
  };
}

export function retentionEstimate(acceptedCount) {
  const r = data.retention;
  const eligible = acceptedCount >= r.minSteps;
  return { eligible, amount: eligible ? r.share * r.years * r.marginPerYear : 0 };
}

export function kbcEstimate({ acceptedIds, leads }) {
  const products = productEstimate(acceptedIds);
  const retention = retentionEstimate(acceptedIds.length);
  const commission = commissionEstimate(leads);
  const own = products.total + retention.amount;
  return { products, retention, commission, own, all: own + commission.total };
}

export const eur = (n) => `EUR ${n.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;
export const eurWhole = (n) => eur(Math.round(n));

// Values an intent may carry. The frontend scenario data posts exactly these.
export const INTENT_REGIONS = ['Ghent', 'Leuven', 'Flanders'];

export const INTENT_SERVICES = [
  'Business charging point',
  'Energy certificate and inspection',
  'Group energy purchase',
  'Heating quote',
  'Insulation quote',
  'Renovation cost and grant estimate',
  'Solar panel quote',
  'Sustainability advice',
];

export const TIMEFRAME_PATTERN = /^Q[1-4] 20\d{2}$/;
export const ID_PATTERN = /^[a-z0-9_-]{1,64}$/;

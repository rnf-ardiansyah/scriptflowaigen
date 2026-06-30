export const NICHES = [
  "Skincare",
  "Fashion",
  "F&B",
  "Edukasi",
  "Finansial",
  "Gaming",
  "Lifestyle",
  "Property",
  "Beauty",
  "Tech",
] as const;

export type Niche = (typeof NICHES)[number];

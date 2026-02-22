export const CASE_TYPES = [
  "civil",
  "criminal",
  "family",
  "corporate",
  "employment",
  "property",
  "tax",
  "environmental",
  "intellectual_property",
  "immigration",
  "constitutional",
  "administrative",
  "commercial",
  "probate",
  "other",
] as const;

export type CaseType = (typeof CASE_TYPES)[number];

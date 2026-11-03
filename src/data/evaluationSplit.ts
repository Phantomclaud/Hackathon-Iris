// Held-out test set. These judgments are excluded from the knowledge base (SINGAPORE_PRECEDENTS),
// and their holdings are kept out of the audit input. Their rulings are only sent to the
// comparison, after the audit for that case has been produced.
// Matched by citation, so duplicate copies of the same judgment are held out together.
export const TEST_CITATIONS: string[] = [
  '[2022] SGHC(A) 8',
  '[2015] SGHC 259',
  '[2004] SGHC 89',
  '[2000] SGHC 58',
  '[2025] SGHC 142',
  '[2017] SGHC 53',
  '[2024] SGHC 286',
  '[2022] SGHC 74',
  '[2026] SGHC 15'
];

export const isTestCitation = (citation: string) => TEST_CITATIONS.includes(citation);

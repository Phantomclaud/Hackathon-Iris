import { SINGAPORE_STATUTES, SINGAPORE_PRECEDENTS } from '../data/singaporeLawData';

export interface SourceCheckResult {
  statutes: { title: string; url: string }[];
  precedents: { name: string; citation: string }[];
  unverified: string[];
}

const CASE_CITATION = /\[\d{4}\]\s*(?:SGHC\(A\)|SGHC|SGCA|SICC)\s*\d+|\[\d{4}\]\s*\d?\s*SLR(?:\(R\))?\s*\d+/g;
const ACT_TITLE = /([A-Z][A-Za-z&'\-]*(?: [A-Za-z&'\-]+){0,5} Act(?: \d{4})?)/g;

const normalise = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

const citationsOf = (p: { citation: string; aliases?: string[] }) => [p.citation, ...(p.aliases ?? [])].filter(Boolean);

export function checkSources(text: string): SourceCheckResult {
  const statutes = new Map<string, { title: string; url: string }>();
  const precedents = new Map<string, { name: string; citation: string }>();
  const unverified = new Set<string>();
  const haystack = normalise(text);

  for (const act of SINGAPORE_STATUTES) {
    if (haystack.includes(normalise(act.actTitle))) {
      statutes.set(act.id, { title: act.actTitle, url: act.ssoUrl });
    }
  }
  for (const prec of SINGAPORE_PRECEDENTS) {
    if (citationsOf(prec).some((c) => haystack.includes(normalise(c)))) {
      precedents.set(prec.id, { name: prec.caseName, citation: prec.citation });
    }
  }

  for (const cit of text.match(CASE_CITATION) ?? []) {
    const known = SINGAPORE_PRECEDENTS.some((p) =>
      citationsOf(p).some((c) => normalise(c).includes(normalise(cit)) || normalise(cit).includes(normalise(c)))
    );
    if (!known) unverified.add(cit);
  }
  for (const title of text.match(ACT_TITLE) ?? []) {
    const known = SINGAPORE_STATUTES.some((a) => normalise(a.actTitle) === normalise(title.replace(/\s+\d{4}$/, '')) || normalise(a.actTitle) === normalise(title));
    if (!known) unverified.add(title.trim());
  }

  return {
    statutes: [...statutes.values()],
    precedents: [...precedents.values()],
    unverified: [...unverified],
  };
}

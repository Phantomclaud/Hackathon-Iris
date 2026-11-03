import React, { useMemo } from 'react';
import { ShieldAlert, BookOpen, ExternalLink } from 'lucide-react';
import { checkSources } from '../utils/sourceCheck';
import { translations } from '../translations';
import { Language } from '../types/legal';

interface SourceFlagsProps {
  text: string;
  language?: Language;
}

export const SourceFlags: React.FC<SourceFlagsProps> = ({ text, language = 'en' }) => {
  const t = translations[language];
  const result = useMemo(() => checkSources(text), [text]);
  const empty = result.statutes.length === 0 && result.precedents.length === 0 && result.unverified.length === 0;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
      <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-slate-300">
        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
        <span>{t.srcCheckTitle}</span>
      </div>

      {empty && (
        <p className="text-slate-400">{t.srcNoCitations}</p>
      )}

      {result.statutes.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-semibold text-emerald-400 block">{t.srcStatutesLink}</span>
          {result.statutes.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 text-slate-200 hover:text-white">
              <ExternalLink className="w-3 h-3 text-emerald-400" />
              <span>{s.title}</span>
            </a>
          ))}
        </div>
      )}

      {result.precedents.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-semibold text-emerald-400 block">{t.srcCasesInList}</span>
          {result.precedents.map((p) => (
            <div key={p.citation} className="text-slate-200">
              {p.name} <span className="font-mono text-slate-400">{p.citation}</span>
            </div>
          ))}
        </div>
      )}

      {result.unverified.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-3 space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-300 flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.srcUnverified}</span>
          </span>
          {result.unverified.map((u) => (
            <div key={u} className="text-amber-200 font-mono">{u}</div>
          ))}
          <p className="text-amber-200/80">{t.srcCheckBeforeRelying}</p>
        </div>
      )}
    </div>
  );
};

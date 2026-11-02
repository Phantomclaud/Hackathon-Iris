import React, { useState } from 'react';
import { X, Search, ExternalLink, BookOpen, Scale, Award } from 'lucide-react';
import { SINGAPORE_STATUTES, SINGAPORE_PRECEDENTS } from '../data/singaporeLawData';
import { Language } from '../types/legal';
import { translations } from '../translations';

interface StatutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const StatutesDirectoryModal: React.FC<StatutesModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'statutes' | 'precedents'>('statutes');
  const t = translations[language];

  if (!isOpen) return null;

  const filteredStatutes = SINGAPORE_STATUTES.filter(
    (s) =>
      s.actTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.primaryForum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.keySections.some(
        (k) =>
          k.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const filteredPrecedents = SINGAPORE_PRECEDENTS.filter(
    (p) =>
      p.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.citation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subjectArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ratioDecidendi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-900/40 text-red-400 border border-red-800/60">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif">
                Singapore Statutes & Judicial Precedents
              </h2>
              <p className="text-xs text-slate-400">
                Official Singapore Legislation (SSO) & Supreme Court of Singapore Case Law
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Tabs */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setActiveTab('statutes')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'statutes'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Singapore Statutes ({filteredStatutes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('precedents')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'precedents'
                  ? 'bg-amber-700 text-amber-50 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Court Precedents ({filteredPrecedents.length})</span>
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'statutes' ? (
            filteredStatutes.length === 0 ? (
              <p className="text-center py-8 text-sm text-slate-500">No statutes matched your query.</p>
            ) : (
              filteredStatutes.map((statute) => (
                <div
                  key={statute.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-base">
                          {statute.actTitle}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-red-300 border border-slate-700">
                          {statute.shortCode}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({statute.chapterOrActNo})
                        </span>
                      </div>
                      <p className="text-xs text-emerald-400 mt-1 font-medium">
                        Primary Forum: {statute.primaryForum}
                      </p>
                    </div>

                    <a
                      href={statute.ssoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-xs text-red-400 hover:text-red-300 transition flex-shrink-0"
                    >
                      <span>SSO AGC Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Key Sections */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2">
                    {statute.keySections.map((sec, idx) => (
                      <div key={idx} className="text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        <span className="font-semibold text-amber-300 mr-2">
                          {sec.section}:
                        </span>
                        <span className="font-medium text-slate-200">
                          {sec.heading} —{' '}
                        </span>
                        <span className="text-slate-400">{sec.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )
          ) : filteredPrecedents.length === 0 ? (
            <p className="text-center py-8 text-sm text-slate-500">No court precedents matched your query.</p>
          ) : (
            filteredPrecedents.map((prec) => (
              <div
                key={prec.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-base font-serif italic">
                      {prec.caseName}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-semibold font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                        {prec.citation}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {prec.court}
                      </span>
                      <span className="text-xs text-slate-400">
                        Subject: {prec.subjectArea}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div>
                    <span className="font-semibold text-rose-300 block mb-0.5">
                      Ratio Decidendi / Legal Principle:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {prec.ratioDecidendi}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="font-semibold text-slate-400 block mb-0.5">
                      Doctrinal Significance in Singapore:
                    </span>
                    <p className="text-slate-400">{prec.significance}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

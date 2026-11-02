import React from 'react';
import { Scale, Building2, Users, BookOpen, Globe, FileDown } from 'lucide-react';
import { Language, UserMode } from '../types/legal';
import { translations } from '../translations';

interface HeaderProps {
  currentMode: UserMode;
  onModeChange: (mode: UserMode) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenStatutes: () => void;
  onOpenPrintReport?: () => void;
  canExportReport?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  language,
  onLanguageChange,
  onOpenStatutes,
  onOpenPrintReport,
  canExportReport = false
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Top/Left: Logo & Brand + Language Selector on Mobile */}
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-700 to-slate-950 flex items-center justify-center shadow-md shadow-red-950/40 ring-1 ring-red-400/30 flex-shrink-0">
                <Scale className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold tracking-tight text-white font-serif">
                    Iris <span className="text-red-400 font-sans text-xs font-bold tracking-normal uppercase px-1.5 py-0.5 rounded bg-red-950/80 border border-red-800">Legal AI</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 tracking-wider">
                    Singapore Law
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md hidden sm:block">
                  {t.tagline}
                </p>
              </div>
            </div>

            {/* Mobile Language Selector */}
            <div className="md:hidden">
              <div className="relative flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />
                <select
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value as Language)}
                  className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
                  aria-label={t.languageSelect}
                >
                  <option value="en" className="bg-slate-900 text-white">EN</option>
                  <option value="zh" className="bg-slate-900 text-white">中文</option>
                  <option value="ms" className="bg-slate-900 text-white">Melayu</option>
                  <option value="ta" className="bg-slate-900 text-white">தமிழ்</option>
                </select>
              </div>
            </div>
          </div>

          {/* Controls: Mode Switcher & Desktop Actions */}
          <div className="flex items-center justify-between md:justify-end space-x-2.5">
            {/* Mode Switcher Toggle (Public vs Corporate) */}
            <div className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-inner flex-1 md:flex-initial justify-center">
              <button
                type="button"
                onClick={() => onModeChange('public')}
                className={`flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 md:flex-initial ${
                  currentMode === 'public'
                    ? 'bg-red-700 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{t.modePublic}</span>
              </button>

              <button
                type="button"
                onClick={() => onModeChange('corporate')}
                className={`flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 md:flex-initial ${
                  currentMode === 'corporate'
                    ? 'bg-amber-700 text-amber-50 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{t.modeCorporate}</span>
              </button>
            </div>

            {/* Statutes Directory Button */}
            <button
              type="button"
              onClick={onOpenStatutes}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              title={t.statutesDirectory}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.statutesDirectory}</span>
            </button>

            {/* Export Report if available */}
            {canExportReport && onOpenPrintReport && (
              <button
                type="button"
                onClick={onOpenPrintReport}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-100 bg-emerald-950/60 hover:bg-emerald-900/80 rounded-lg border border-emerald-700/60 transition shadow-sm"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.exportReport}</span>
              </button>
            )}

            {/* Desktop 4 Official Singapore Languages Selector */}
            <div className="hidden md:flex relative items-center bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer pr-1"
                aria-label={t.languageSelect}
              >
                <option value="en" className="bg-slate-900 text-white">English (EN)</option>
                <option value="zh" className="bg-slate-900 text-white">中文 (ZH)</option>
                <option value="ms" className="bg-slate-900 text-white">Bahasa Melayu (MS)</option>
                <option value="ta" className="bg-slate-900 text-white">தமிழ் (TA)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

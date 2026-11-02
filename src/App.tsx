/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserMode, Language, PublicAnalysisResult, PublicCaseInput } from './types/legal';
import { Header } from './components/Header';
import { PublicView } from './components/PublicView';
import { CorporateView } from './components/CorporateView';
import { StatutesDirectoryModal } from './components/StatutesDirectoryModal';
import { PrintReportModal } from './components/PrintReportModal';
import { translations } from './translations';
import { Scale, ShieldCheck, ExternalLink } from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<UserMode>('public');
  const [language, setLanguage] = useState<Language>('en');

  // Modals state
  const [isStatutesModalOpen, setIsStatutesModalOpen] = useState(false);
  const [isPrintReportModalOpen, setIsPrintReportModalOpen] = useState(false);

  // Active public case report for printing/export
  const [activeAnalysis, setActiveAnalysis] = useState<PublicAnalysisResult | null>(null);
  const [activeCaseInput, setActiveCaseInput] = useState<PublicCaseInput | null>(null);

  const t = translations[language];

  const handleAnalysisGenerated = (result: PublicAnalysisResult, input: PublicCaseInput) => {
    setActiveAnalysis(result);
    setActiveCaseInput(input);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-900 selection:text-white">
      {/* Top Navigation */}
      <Header
        currentMode={currentMode}
        onModeChange={(mode) => setCurrentMode(mode)}
        language={language}
        onLanguageChange={(lang) => setLanguage(lang)}
        onOpenStatutes={() => setIsStatutesModalOpen(true)}
        onOpenPrintReport={() => setIsPrintReportModalOpen(true)}
        canExportReport={!!activeAnalysis}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentMode === 'public' ? (
          <PublicView
            language={language}
            onAnalysisGenerated={handleAnalysisGenerated}
            onOpenReportModal={() => setIsPrintReportModalOpen(true)}
          />
        ) : (
          <CorporateView language={language} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-slate-400">Iris Legal AI</span>
            <span>— Singapore Statutes Online & Supreme Court Jurisprudence Engine</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <a
              href="https://sso.agc.gov.sg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-slate-300 transition"
            >
              <span>Singapore Statutes Online (SSO)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.judiciary.gov.sg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-slate-300 transition"
            >
              <span>Singapore Judiciary</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-3 text-center sm:text-left text-[11px] text-slate-600">
          <p>{t.disclaimerNote}</p>
        </div>
      </footer>

      {/* Modals */}
      <StatutesDirectoryModal
        isOpen={isStatutesModalOpen}
        onClose={() => setIsStatutesModalOpen(false)}
        language={language}
      />

      <PrintReportModal
        isOpen={isPrintReportModalOpen}
        onClose={() => setIsPrintReportModalOpen(false)}
        caseInput={activeCaseInput || undefined}
        analysis={activeAnalysis || undefined}
      />
    </div>
  );
}

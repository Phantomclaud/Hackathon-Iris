import React from 'react';
import { X, Printer, Scale, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PublicAnalysisResult, PublicCaseInput } from '../types/legal';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseInput?: PublicCaseInput;
  analysis?: PublicAnalysisResult;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  caseInput,
  analysis
}) => {
  if (!isOpen || !analysis) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:shadow-none print:rounded-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">Official Legal Memorandum Preview</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Legal Document Content */}
        <div className="p-8 sm:p-12 overflow-y-auto font-serif space-y-8 flex-1 print:p-8">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                  Iris Legal Intelligence
                </span>
                <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                  Singapore Jurisdiction
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-1">
                Advisory Memorandum Grounded in Singapore Statutes Online (SSO) & Supreme Court Precedents
              </p>
            </div>
            <div className="text-right text-xs font-sans text-slate-600 space-y-0.5">
              <p className="font-bold">Doc Ref: SG/OPIN/{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</p>
              <p>Date: {new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p>Governing Law: Republic of Singapore</p>
            </div>
          </div>

          {/* Matter Summary */}
          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 font-sans text-xs space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 block uppercase font-semibold text-[10px]">Matter Title</span>
                <span className="font-bold text-slate-800">{caseInput?.title || 'Legal Dispute'}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-semibold text-[10px]">Category</span>
                <span className="font-bold text-slate-800 uppercase">{caseInput?.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-semibold text-[10px]">Claim Quantum</span>
                <span className="font-bold text-slate-800">SGD ${(caseInput?.claimAmount || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-semibold text-[10px]">Merit Score</span>
                <span className="font-bold text-emerald-700 text-sm">{analysis.overallMeritScore}/100</span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Assessment */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
              1. Executive Legal Assessment & Merits
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed">
              {analysis.summary}
            </p>
            <div className="p-3 bg-blue-50 border-l-4 border-blue-600 text-xs font-sans text-blue-900 rounded-r">
              <span className="font-bold">Limitation Act (Cap 163) Verification: </span>
              {analysis.limitationStatus.notes} (Status: {analysis.limitationStatus.isWithinPeriod ? 'TIMELY / WITHIN STATUTORY PERIOD' : 'RISK OF TIME BAR'})
            </div>
          </section>

          {/* Section 2: Recommended Singapore Venues */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
              2. Recommended Legal Venues & Remedies
            </h3>
            <div className="space-y-3 font-sans">
              {analysis.recommendedForums.map((forum, idx) => (
                <div key={idx} className="p-4 border border-slate-300 rounded-lg bg-white shadow-xs">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 text-sm">{forum.title}</h4>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      Est. Cost: {forum.costEstimate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{forum.description}</p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    <span className="font-semibold text-slate-700">Statutory Authority: </span>
                    {forum.statuteReference}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Case Flaws and Counter Strategies */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
              3. Case Flaws & Vulnerabilities (Opponent Anticipated Counter-Arguments)
            </h3>
            <div className="space-y-3 font-sans">
              {analysis.flawsIdentified.map((flaw, idx) => (
                <div key={idx} className="p-3.5 border-l-4 border-amber-500 bg-amber-50/60 rounded-r text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-950">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{flaw.issue}</span>
                  </div>
                  <p className="text-slate-700"><span className="font-semibold">Impact on Case:</span> {flaw.impactOnCase}</p>
                  <p className="text-emerald-900"><span className="font-semibold">Recommended Cure / Mitigation:</span> {flaw.counterStrategy}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Basis: {flaw.legalBasis}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Mandatory Evidentiary Proof Checklist */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
              4. Evidentiary Checklist to Win (Evidence Act Cap 97)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
              {analysis.evidenceChecklist.map((item, idx) => (
                <div key={idx} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{item.item}</span>
                  </div>
                  <p className="text-slate-600"><span className="font-semibold">Purpose:</span> {item.purpose}</p>
                  <p className="text-slate-500 text-[11px]">{item.evidenceActNote}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Precedent Citations & Statutory Grounding */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
              5. Singapore Judicial Precedents & Statutory Grounding
            </h3>
            <div className="space-y-2 font-sans text-xs">
              {analysis.precedentCitations.map((prec, idx) => (
                <div key={idx} className="p-3 bg-slate-100 rounded-lg">
                  <p className="font-bold text-slate-900 font-serif italic">{prec.caseName} <span className="font-mono text-red-700 not-italic">({prec.citation})</span> - {prec.court}</p>
                  <p className="text-slate-600 mt-1">{prec.principle}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Formal Disclaimer */}
          <div className="pt-6 border-t border-slate-300 font-sans text-[11px] text-slate-500 leading-normal flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              This memorandum is synthesized by Iris Legal AI Intelligence based on Singapore legislation and Singapore Court of Appeal precedents. It provides legal guidance and procedural structuring. For formal court representation, please consult an advocate and solicitor admitted to the Singapore Bar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

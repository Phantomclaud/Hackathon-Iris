import React, { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import {
  Scale,
  Send,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Building,
  UserCheck,
  FileText,
  ListOrdered,
  Bot,
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import {
  PublicCaseCategory,
  PublicCaseInput,
  PublicAnalysisResult,
  ChatMessage,
  Language,
  PublicSubMode
} from '../types/legal';
import { PUBLIC_SAMPLE_CASES } from '../data/singaporeLawData';
import { translations } from '../translations';
import { SourceFlags } from './SourceFlags';
import { FormattedText } from './FormattedText';
import {
  classifyPublicInfodump,
  PublicInfodumpClassification,
  getLocalizedInfodumpInitialReply,
  synthesizePublicAnalysis
} from '../utils/singaporeLawEngine';

interface PublicViewProps {
  language: Language;
  onAnalysisGenerated: (result: PublicAnalysisResult, input: PublicCaseInput) => void;
  onOpenReportModal: () => void;
}

export const PublicView: React.FC<PublicViewProps> = ({
  language,
  onAnalysisGenerated,
  onOpenReportModal
}) => {
  const t = translations[language];

  // Sub-mode toggle: Conversational Chatbot vs Advanced Structured Form
  const [subMode, setSubMode] = useState<PublicSubMode>('conversational');

  // Conversational Infodump State
  const [infodumpText, setInfodumpText] = useState('');
  const [isProcessingInfodump, setIsProcessingInfodump] = useState(false);
  const [infodumpMessages, setInfodumpMessages] = useState<ChatMessage[]>([
    {
      id: 'iris-intro',
      sender: 'ai',
      text: `Hello! I'm Iris, your Singapore Legal Intelligence Guide.\n\nYou do not need legal terms, court rules, or categories. Describe what happened below in your own words. You can paste a message, explain a dispute with your landlord, boss, merchant, or neighbour, or describe any money you're owed.\n\nI will analyze your story under Singapore statutes (SSO) and ask follow-up questions step by step.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      statutoryCitations: ['Singapore Statutes Online (SSO)', 'Community Justice & Tribunals System (CJTS)']
    }
  ]);
  const [activeClassification, setActiveClassification] = useState<PublicInfodumpClassification | null>(null);

  // Advanced Intake Form State
  const [category, setCategory] = useState<PublicCaseCategory>('tenancy');
  const [title, setTitle] = useState('Landlord withholding $3,500 rental deposit for fair wear and tear');
  const [claimAmount, setClaimAmount] = useState<number>(3500);
  const [incidentDate, setIncidentDate] = useState('2026-09-15');
  const [opponentType, setOpponentType] = useState<'individual' | 'business' | 'employer' | 'landlord'>('landlord');
  const [description, setDescription] = useState(
    'I rented a 2-bedroom HDB flat in Toa Payoh for 24 months. I handed over the keys upon lease expiry with clean condition photos. Landlord is now refusing to return my $3,500 deposit, claiming minor paint scuff marks and floor fading are damage rather than fair wear and tear. There is no damage clause permitting total forfeiture in the tenancy agreement.'
  );
  const [evidenceInput, setEvidenceInput] = useState(
    'Signed Tenancy Agreement (CEA standard template), Move-in & Move-out inspection photo log with date stamps, WhatsApp handover chat with landlord, Bank transfer receipt of initial deposit'
  );
  const [desiredOutcome, setDesiredOutcome] = useState('Full refund of SGD 3,500 security deposit plus filing fees.');

  // Analysis Result State (Shared between both modes)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PublicAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'forums' | 'flaws' | 'evidence' | 'actionPlan' | 'chat'>('overview');

  // Conversational Chat in Results State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Load Preset Case into Advanced Form
  const handleLoadSample = (sampleId: string) => {
    const sample = PUBLIC_SAMPLE_CASES.find((s) => s.id === sampleId);
    if (!sample) return;
    setCategory(sample.category);
    setTitle(sample.title);
    setClaimAmount(sample.claimAmount);
    setIncidentDate(sample.incidentDate);
    setOpponentType(sample.opponentType);
    setDescription(sample.description);
    setEvidenceInput(sample.evidenceHeld.join(', '));
    setDesiredOutcome(sample.desiredOutcome);
  };

  // Run Public Case Analysis from Advanced Form
  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAnalyzing(true);

    const inputData: PublicCaseInput = {
      title,
      category,
      claimAmount,
      incidentDate,
      opponentType,
      description,
      evidenceHeld: evidenceInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      desiredOutcome
    };

    try {
      const response = await fetch('/api/public/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputData, language })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      const result: PublicAnalysisResult = data.result;
      setAnalysisResult(result);
      onAnalysisGenerated(result, inputData);

      setChatMessages([
        {
          id: 'msg-welcome',
          sender: 'ai',
          text: `Hello! I have completed the legal analysis for "${title}" under Singapore Law.\n\nSummary: Your case has been assessed with a viability score of ${result.overallMeritScore}/100. Primary forum: ${result.recommendedForums[0]?.title || 'Small Claims Tribunal'}.\n\nYou can ask me any follow-up questions about court procedures, gathering evidence, or tackling the identified flaws!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          statutoryCitations: result.statutoryGrounding.map((s) => s.actTitle),
          precedentCitations: result.precedentCitations.map((p) => p.citation)
        }
      ]);
    } catch (err: any) {
      console.error('Error analyzing case:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Client fallback for instant local processing if server or network times out
  const applyClientInfodumpFallback = (textToSend: string) => {
    const classification = classifyPublicInfodump(textToSend);
    setActiveClassification(classification);

    setCategory(classification.detectedCategory);
    setTitle(textToSend.substring(0, 75).trim() + '...');
    setDescription(textToSend);
    if (classification.extractedAmount) {
      setClaimAmount(classification.extractedAmount);
    }
    setOpponentType(classification.opponentType);

    const localizedReply = getLocalizedInfodumpInitialReply(classification, language);

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: localizedReply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      statutoryCitations: ['Singapore Statutes Online (SSO)', 'Evidence Act (Cap 97) s 103'],
      extractedCaseContext: {
        category: classification.detectedCategory,
        estimatedClaim: classification.extractedAmount,
        likelyForum: classification.likelyForum
      }
    };
    setInfodumpMessages((prev) => [...prev, aiMsg]);
  };

  // Speech-to-text for the infodump box. Non-English speech is translated to English before submission.
  const [isListening, setIsListening] = useState(false);
  const [speechNote, setSpeechNote] = useState('');
  const [showSpeechMenu, setShowSpeechMenu] = useState(false);
  const recognitionRef = useRef<any>(null);
  const speechSupported = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const SPEECH_LANG: Record<string, string> = { en: 'en-SG', zh: 'zh-CN', ms: 'ms-MY', ta: 'ta-IN' };
  const SPEECH_OPTIONS = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
    { code: 'ms', label: 'Melayu' },
    { code: 'ta', label: 'தமிழ்' }
  ];

  const appendInfodump = (text: string) => {
    setInfodumpText((prev) => (prev ? `${prev} ${text}` : text));
  };

  const startListening = (lang: string) => {
    if (!speechSupported) return;

    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new Recognition();
    rec.lang = SPEECH_LANG[lang] || 'en-SG';
    rec.continuous = true;
    rec.interimResults = false;

    rec.onresult = async (event: any) => {
      let said = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) said += event.results[i][0].transcript;
      }
      said = said.trim();
      if (!said) return;

      if (lang === 'en') {
        appendInfodump(said);
        return;
      }

      setSpeechNote(t.pubTranslating);
      try {
        const response = await fetch('/api/public/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: said, sourceLanguage: lang })
        });
        const data = await response.json();
        appendInfodump(data.english || said);
        setSpeechNote(
          data.translated
            ? `${t.pubTranslatedNote} "${said}"`
            : t.pubTranslationFailed
        );
      } catch {
        appendInfodump(said);
        setSpeechNote(t.pubTranslationFailed);
      }
    };

    rec.onerror = (event: any) => {
      setSpeechNote(`${t.pubSpeechError} ${event.error}`);
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
    setSpeechNote('');
    rec.start();
    setIsListening(true);
  };

  // Conversational Infodump Handler
  const handleSendInfodump = async (customPrompt?: string) => {
    const textToSend = customPrompt || infodumpText;
    if (!textToSend.trim() || isProcessingInfodump) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setInfodumpMessages((prev) => [...prev, userMsg]);
    setInfodumpText('');
    setIsProcessingInfodump(true);

    try {
      const response = await fetch('/api/public/infodump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrativeText: textToSend, language })
      });

      if (response.ok) {
        const data = await response.json();
        const classification: PublicInfodumpClassification = data.classification;
        setActiveClassification(classification);

        // Pre-populate advanced fields in background
        setCategory(classification.detectedCategory);
        setTitle(textToSend.substring(0, 75).trim() + '...');
        setDescription(textToSend);
        if (classification.extractedAmount) {
          setClaimAmount(classification.extractedAmount);
        }
        setOpponentType(classification.opponentType);

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          statutoryCitations: data.statutoryCitations,
          extractedCaseContext: {
            category: classification.detectedCategory,
            estimatedClaim: classification.extractedAmount,
            likelyForum: classification.likelyForum
          }
        };
        setInfodumpMessages((prev) => [...prev, aiMsg]);
      } else {
        applyClientInfodumpFallback(textToSend);
      }
    } catch (err) {
      applyClientInfodumpFallback(textToSend);
    } finally {
      setIsProcessingInfodump(false);
    }
  };

  // Convert Conversational Infodump into Full Formal Memorandum & Action Plan
  const handleConvertInfodumpToReport = async () => {
    const inputData: PublicCaseInput = {
      title: title || 'Singapore Citizen Legal Dispute Inquiry',
      category: activeClassification?.detectedCategory || category,
      claimAmount: claimAmount || activeClassification?.extractedAmount || 0,
      incidentDate: incidentDate || new Date().toISOString().split('T')[0],
      opponentType: activeClassification?.opponentType || opponentType,
      description: description || infodumpMessages.filter((m) => m.sender === 'user').map((m) => m.text).join('\n\n'),
      evidenceHeld: [
        'Contemporaneous WhatsApp / chat communications',
        'Official invoices and receipts',
        'Bank transfer / proof of payment records'
      ],
      desiredOutcome: desiredOutcome || 'Statutory restitution and resolution under Singapore law.'
    };

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/public/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputData, language })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data.result);
        onAnalysisGenerated(data.result, inputData);
        // Switch to advanced view with results displayed
        setSubMode('advanced');
      } else {
        const fallbackReport = synthesizePublicAnalysis(inputData);
        setAnalysisResult(fallbackReport);
        onAnalysisGenerated(fallbackReport, inputData);
        setSubMode('advanced');
      }
    } catch (err) {
      const fallbackReport = synthesizePublicAnalysis(inputData);
      setAnalysisResult(fallbackReport);
      onAnalysisGenerated(fallbackReport, inputData);
      setSubMode('advanced');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Send Follow-up Chat Message in Results
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/public/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          caseContext: {
            title,
            category,
            claimAmount,
            description
          },
          language
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          statutoryCitations: data.statutoryCitations,
          precedentCitations: data.precedentCitations
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      } else {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Regarding your inquiry under Singapore Law: In disputes of this nature, you can lodge an application with the relevant Singapore tribunal (such as the Small Claims Tribunal via the Community Justice and Tribunals System - CJTS, or TADM for employment matters). Ensure all contemporaneous WhatsApp messages, invoices, and bank transfer slips are compiled into an exhibit bundle pursuant to Section 103 of the Evidence Act (Cap 97).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          statutoryCitations: ['Small Claims Tribunals Act (Cap 308) s 5', 'Evidence Act (Cap 97) s 103'],
          precedentCitations: ['Spandeck Engineering [2007] 4 SLR(R) 100']
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Regarding your inquiry under Singapore Law: In disputes of this nature, you can lodge an application with the relevant Singapore tribunal (such as the Small Claims Tribunal via the Community Justice and Tribunals System - CJTS, or TADM for employment matters). Ensure all contemporaneous WhatsApp messages, invoices, and bank transfer slips are compiled into an exhibit bundle pursuant to Section 103 of the Evidence Act (Cap 97).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        statutoryCitations: ['Small Claims Tribunals Act (Cap 308) s 5', 'Evidence Act (Cap 97) s 103'],
        precedentCitations: ['Spandeck Engineering [2007] 4 SLR(R) 100']
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner with Sub-Mode Selector */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-red-950 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-900/60 border border-red-700/60 text-red-200 text-xs font-semibold">
              <Scale className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.pubHeroBadge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
              {t.publicHeroTitle}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {t.publicHeroSubtitle}
            </p>
          </div>

          {/* Sub-Mode Switcher: Simple Chatbot Infodump vs Advanced Structured Form */}
          <div className="bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner flex flex-col sm:flex-row gap-1 self-start md:self-center">
            <button
              type="button"
              onClick={() => setSubMode('conversational')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                subMode === 'conversational'
                  ? 'bg-gradient-to-r from-red-700 to-rose-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>{t.publicModeConversational}</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode('advanced')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                subMode === 'advanced'
                  ? 'bg-gradient-to-r from-red-700 to-rose-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-300" />
              <span>{t.publicModeAdvanced}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-MODE 1: CONVERSATIONAL CHATBOT (SIMPLE INFODUMP & DISCUSSION) */}
      {/* ========================================================================= */}
      {subMode === 'conversational' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Conversational Stream (8 cols on lg) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col h-[650px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-900/50 flex items-center justify-center text-red-300 border border-red-800">
                  <Bot className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-serif">
                    {t.pubAssistantName}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t.pubAssistantTagline}
                  </p>
                </div>
              </div>

              {activeClassification && (
                <button
                  type="button"
                  onClick={handleConvertInfodumpToReport}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/80 rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t.generateFullReport}</span>
                </button>
              )}
            </div>

            {/* Quick Starter Story Pills */}
            <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {t.pubStartersTitle}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSendInfodump(t.pubQuickLandlord)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition text-left"
                >
                  {t.pubStarterLandlord}
                </button>
                <button
                  type="button"
                  onClick={() => handleSendInfodump(t.pubQuickEmployer)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition text-left"
                >
                  {t.pubStarterEmployer}
                </button>
                <button
                  type="button"
                  onClick={() => handleSendInfodump(t.pubStarterLaptopMsg)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition text-left"
                >
                  {t.pubStarterLaptop}
                </button>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {infodumpMessages.map((msg, index) => (
                <React.Fragment key={msg.id}>
                {index > 0 && <div className="h-px bg-slate-600 my-1" />}
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-2.5 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-red-700 to-rose-700 text-white shadow-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-inner'
                    }`}
                  >
                    <FormattedText text={msg.id === 'iris-intro' ? t.pubIntro : msg.text} />

                    {/* Context Badge if detected */}
                    {msg.extractedCaseContext && (
                      <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] space-y-1 text-slate-300 font-sans">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-amber-300">⚖️ Recognized Issue:</span>
                          <span className="capitalize">{msg.extractedCaseContext.category} Dispute</span>
                        </div>
                        {msg.extractedCaseContext.likelyForum && (
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-emerald-400">🏛️ Legal Venue:</span>
                            <span>{msg.extractedCaseContext.likelyForum}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {msg.statutoryCitations && msg.statutoryCitations.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-amber-300 font-mono">
                        📜 Singapore Grounding: {msg.statutoryCitations.join(' • ')}
                      </div>
                    )}

                    <div className="text-[9px] text-slate-400 text-right">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
                </React.Fragment>
              ))}

              {isProcessingInfodump && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-300 flex items-center space-x-2">
                    <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    <span>{t.pubAnalyzingStory}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Infodump Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendInfodump();
              }}
              className="space-y-2 pt-2 border-t border-slate-800"
            >
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={infodumpText}
                  onChange={(e) => setInfodumpText(e.target.value)}
                  placeholder={t.infodumpPlaceholder}
                  disabled={isProcessingInfodump}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => (isListening ? recognitionRef.current?.stop() : setShowSpeechMenu((v) => !v))}
                    disabled={isProcessingInfodump || !speechSupported}
                    title={speechSupported ? (isListening ? t.pubStopTitle : t.pubSpeakTitle) : t.pubSpeechUnsupported}
                    className={`h-full px-4 rounded-xl text-xs flex flex-col items-center justify-center space-y-1 transition border disabled:opacity-40 ${
                      isListening ? 'bg-red-900 border-red-500 text-white animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isListening ? t.pubStop : t.pubSpeak}</span>
                  </button>
                  {showSpeechMenu && !isListening && (
                    <div className="absolute bottom-full right-0 mb-2 z-20 min-w-[150px] bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                      <p className="px-3 py-2 text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-800">
                        {t.pubSpeechLangTitle}
                      </p>
                      {SPEECH_OPTIONS.map((opt) => (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() => {
                            setShowSpeechMenu(false);
                            startListening(opt.code);
                          }}
                          className="block w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!infodumpText.trim() || isProcessingInfodump}
                  className="px-5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex flex-col items-center justify-center space-y-1 transition shadow-lg shadow-red-950/40"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.infodumpSend}</span>
                </button>
              </div>
              {speechNote && <p className="text-[11px] text-slate-400">{speechNote}</p>}
              {!speechSupported && <p className="text-[11px] text-slate-500">{t.pubSpeechChromeNote}</p>}
            </form>
          </div>

          {/* Right Column: Dynamic Legal Insight Card (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-5">
            {activeClassification ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    {t.pubLiveBreakdown}
                  </h4>
                </div>

                {/* Category & Forum */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                      {t.infodumpDetected}
                    </span>
                    <span className="font-bold text-white text-sm">
                      {activeClassification.categoryLabel}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                      {t.infodumpForum}
                    </span>
                    <span className="font-semibold text-emerald-400">
                      {activeClassification.likelyForum}
                    </span>
                  </div>
                </div>

                {/* Statutory Rights */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    {t.infodumpRights}
                  </span>
                  <div className="space-y-1.5">
                    {activeClassification.keyLegalRights.map((right, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{right}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clarifying Questions Iris is asking */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    Questions to Consider:
                  </span>
                  <div className="space-y-1.5">
                    {activeClassification.suggestedQuestions.map((q, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                        ❓ {q}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate Official Report Button */}
                <button
                  type="button"
                  onClick={handleConvertInfodumpToReport}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t.generateFullReport}</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-amber-300">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white font-serif">
                  {t.pubAwaitingStory}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.pubAwaitingStoryBody}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODE 2: STRUCTURED CASE INTAKE (ADVANCED FORM & DETAILED REPORT) */}
      {/* ========================================================================= */}
      {subMode === 'advanced' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Case Intake Form (5 cols on lg) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-red-400" />
                  <span>{t.step1Title}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{t.step1Subtitle}</p>
              </div>
            </div>

            {/* Preset Buttons for Quick Scenario Testing */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {t.loadSampleCase}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadSample('sample-tenancy')}
                  className="text-left text-xs p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 transition truncate"
                >
                  🏠 {t.sampleCaseTenancy}
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('sample-employment')}
                  className="text-left text-xs p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 transition truncate"
                >
                  💼 {t.sampleCaseEmployment}
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('sample-consumer')}
                  className="text-left text-xs p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 transition truncate"
                >
                  💻 {t.sampleCaseConsumer}
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('sample-harassment')}
                  className="text-left text-xs p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 transition truncate"
                >
                  🛡️ {t.sampleCaseHarassment}
                </button>
              </div>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4 pt-2">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.caseCategoryLabel}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PublicCaseCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="tenancy">{t.pubCatTenancy}</option>
                  <option value="employment">{t.pubCatEmployment}</option>
                  <option value="consumer">{t.pubCatConsumer}</option>
                  <option value="harassment">{t.pubCatHarassment}</option>
                  <option value="small_claims">{t.pubCatSmallClaims}</option>
                  <option value="contract">{t.pubCatContract}</option>
                  <option value="negligence">{t.pubCatNegligence}</option>
                  <option value="family_estate">{t.pubCatFamily}</option>
                </select>
              </div>

              {/* Case Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.caseTitleLabel}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Claim Amount & Incident Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.claimAmountLabel}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.incidentDateLabel}
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {t.claimAmountHint}
              </p>

              {/* Opponent Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.opponentTypeLabel}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'landlord', label: t.pubPartyLandlord },
                    { id: 'employer', label: t.pubPartyEmployer },
                    { id: 'business', label: t.pubPartyMerchant },
                    { id: 'individual', label: t.pubPartyIndividual }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOpponentType(item.id as any)}
                      className={`py-2 px-1 text-center text-xs rounded-lg border font-medium transition ${
                        opponentType === item.id
                          ? 'bg-red-800 text-white border-red-600 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Factual Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.descriptionLabel}
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.descriptionPlaceholder}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Evidence Held */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.evidenceHeldLabel}
                </label>
                <textarea
                  rows={2}
                  value={evidenceInput}
                  onChange={(e) => setEvidenceInput(e.target.value)}
                  placeholder={t.evidenceHeldPlaceholder}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Desired Outcome */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.desiredOutcomeLabel}
                </label>
                <input
                  type="text"
                  value={desiredOutcome}
                  onChange={(e) => setDesiredOutcome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-red-950/40 transition disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.analyzingButton}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{t.analyzeButton}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Interactive Results & Advisory Dashboard (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {!analysisResult ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-red-400">
                  <Scale className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  {t.pubAwaitingCase}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Click &quot;Analyze Case under Singapore Law&quot; or choose one of the real-world Singapore scenario presets on the left. Iris will calculate case viability, statutory forums, flaws, evidence required, and an action plan.
                </p>
                <button
                  type="button"
                  onClick={() => handleAnalyze()}
                  className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition"
                >
                  <span>{t.pubSamplePresetLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                {/* Score & Merit Top Bar */}
                <div className="p-6 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 shadow-inner">
                      <span className="text-xl font-extrabold text-emerald-400 font-mono">
                        {analysisResult.overallMeritScore}
                      </span>
                      <span className="absolute -bottom-1 text-[9px] text-slate-400 font-semibold uppercase">
                        /100
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {t.meritScoreLabel}
                      </span>
                      <h3 className="text-sm font-bold text-white">
                        {analysisResult.meritVerdict}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      onClick={onOpenReportModal}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-200 transition shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t.printOfficialReport}</span>
                    </button>
                  </div>
                </div>

                {/* Limitation Act Alert */}
                <div className="px-6 py-2.5 bg-blue-950/30 border-b border-blue-900/40 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-blue-200">
                    <Calendar className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="font-semibold">{t.limitationPeriodLabel}:</span>
                    <span className="text-slate-300">{analysisResult.limitationStatus.notes}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    analysisResult.limitationStatus.isWithinPeriod
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                      : 'bg-red-900/60 text-red-300 border border-red-700'
                  }`}>
                    {analysisResult.limitationStatus.isWithinPeriod ? 'TIMELY' : 'EXPIRED'}
                  </span>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'overview', label: '1. Overview & Forum', icon: Building },
                    { id: 'flaws', label: '2. Case Flaws', icon: AlertTriangle },
                    { id: 'evidence', label: '3. Evidence Checklist', icon: CheckCircle2 },
                    { id: 'actionPlan', label: '4. Action Plan', icon: ListOrdered },
                    { id: 'chat', label: '5. Legal Q&A Chat', icon: MessageSquare }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-1.5 py-3 px-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'border-red-500 text-red-300 bg-slate-900/60'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Contents */}
                <div className="p-6">
                  {/* TAB 1: OVERVIEW & FORUMS */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t.analysisOverview}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                          {analysisResult.summary}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t.recommendedForumsTitle}
                        </h4>
                        <div className="space-y-3">
                          {analysisResult.recommendedForums.map((forum, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <h5 className="font-bold text-white text-sm">
                                  {forum.title}
                                </h5>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                                  {forum.costEstimate}
                                </span>
                              </div>

                              <p className="text-xs text-slate-300 leading-normal">
                                {forum.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                                <span>⏱️ Timeframe: <strong className="text-slate-200">{forum.timeframe}</strong></span>
                                <span>📜 Statutory Authority: <strong className="text-amber-300">{forum.statuteReference}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t.precedentsTitle}
                        </h4>
                        <div className="space-y-2">
                          {analysisResult.precedentCitations.map((prec, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                              <p className="font-bold text-amber-300 font-serif italic">
                                {prec.caseName} <span className="font-mono text-slate-400 not-italic">({prec.citation})</span>
                              </p>
                              <p className="text-slate-300 mt-1">{prec.principle}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: FLAWS & PROBLEMS */}
                  {activeTab === 'flaws' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t.flawsTitle}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {t.pubAnticipate}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {analysisResult.flawsIdentified.map((flaw, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <ShieldAlert className={`w-4 h-4 ${
                                  flaw.severity === 'high' ? 'text-red-400' : 'text-amber-400'
                                }`} />
                                <span className="font-bold text-white text-xs sm:text-sm">
                                  {flaw.issue}
                                </span>
                              </div>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                flaw.severity === 'high'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                                {flaw.severity}
                              </span>
                            </div>

                            <div className="text-xs space-y-1.5 text-slate-300">
                              <p>
                                <strong className="text-slate-400">{t.pubImpactOnCase} </strong>
                                {flaw.impactOnCase}
                              </p>
                              <p className="text-emerald-300">
                                <strong>{t.pubMitigation} </strong>
                                {flaw.counterStrategy}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono">
                                Legal Grounding: {flaw.legalBasis}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: EVIDENCE CHECKLIST */}
                  {activeTab === 'evidence' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t.evidenceChecklistTitle}
                        </h4>
                        <span className="text-xs text-slate-400">
                          Evidence Act (Cap 97) admissibility criteria
                        </span>
                      </div>

                      <div className="space-y-3">
                        {analysisResult.evidenceChecklist.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 font-bold text-white text-xs sm:text-sm">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>{item.item}</span>
                              </div>
                              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {item.priority}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300">
                              <strong>{t.pubLegalPurpose} </strong>{item.purpose}
                            </p>
                            <p className="text-xs text-slate-400">
                              <strong>{t.pubHowToObtain} </strong>{item.howToObtain}
                            </p>
                            <p className="text-[11px] text-amber-300/80 font-mono">
                              {item.evidenceActNote}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ACTION PLAN */}
                  {activeTab === 'actionPlan' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t.actionPlanTitle}
                      </h4>

                      <div className="space-y-3">
                        {analysisResult.actionPlan.map((step) => (
                          <div
                            key={step.stepNumber}
                            className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800"
                          >
                            <div className="w-7 h-7 rounded-full bg-red-900/60 border border-red-700 text-red-200 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {step.stepNumber}
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white">{step.phase}</span>
                                <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                                  {step.deadlineNotice}
                                </span>
                              </div>
                              <p className="text-slate-300 leading-normal">{step.action}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisResult && activeTab !== 'chat' && <SourceFlags text={JSON.stringify(analysisResult)} language={language} />}

                  {/* TAB 5: CONVERSATIONAL LEGAL CHAT */}
                  {activeTab === 'chat' && (
                    <div className="space-y-4 flex flex-col h-[460px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                          <span>{t.conversationalLegalChat}</span>
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {t.pubGroundedIn}
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {chatMessages.map((msg, index) => (
                          <React.Fragment key={msg.id}>
                          {index > 0 && <div className="h-px bg-slate-600 my-1" />}
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl p-3.5 text-xs space-y-2 ${
                                msg.sender === 'user'
                                  ? 'bg-red-700 text-white shadow-sm'
                                  : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-inner'
                              }`}
                            >
                              <FormattedText text={msg.id === 'iris-intro' ? t.pubIntro : msg.text} />
                              {msg.sender !== 'user' && <SourceFlags text={msg.text} language={language} />}
                              {msg.statutoryCitations && msg.statutoryCitations.length > 0 && (
                                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-amber-300 font-mono">
                                  📚 Citations: {msg.statutoryCitations.join(' • ')}
                                </div>
                              )}
                              <div className="text-[9px] text-slate-400 text-right">
                                {msg.timestamp}
                              </div>
                            </div>
                          </div>
                          </React.Fragment>
                        ))}
                        {isSendingChat && (
                          <div className="flex justify-start">
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center space-x-2">
                              <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                              <span>{t.pubRespondingNow}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={t.chatPlaceholder}
                          disabled={isSendingChat}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || isSendingChat}
                          className="px-4 py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{t.pubSend}</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

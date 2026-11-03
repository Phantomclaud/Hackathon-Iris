import React, { useEffect, useState } from 'react';
import {
  Building2,
  FolderPlus,
  Folder,
  FileText,
  Mail,
  ShieldAlert,
  Search,
  Plus,
  Sparkles,
  Link2,
  BookOpen,
  Scale,
  Clock,
  ArrowUpRight,
  Eye,
  CheckCircle,
  FileCheck,
  Download,
  Tag,
  Filter,
  Lock,
  Shield,
  Edit3,
  ChevronDown,
  SlidersHorizontal,
  AlertTriangle,
  X,
  FileSpreadsheet,
  MessageSquare
} from 'lucide-react';
import {
  CaseStatus,
  CorporateCase,
  DualSideFlawAnalysis,
  UploadedFileItem,
  Language,
  RelevanceTag,
  ConfidentialityTag,
  SourceTypeTag,
  FileMetadataTags
} from '../types/legal';
import { CORPORATE_SAMPLE_CASE } from '../data/singaporeLawData';
import { translations } from '../translations';
import { SourceFlags } from './SourceFlags';
import { parseEml, ParsedEmail } from '../utils/emlParser';
import { CASE_STUDIES } from '../data/caseStudies';
import { CASE_RULINGS, CourtRuling } from '../data/caseRulings';
import { isTestCitation } from '../data/evaluationSplit';

interface CorporateViewProps {
  language: Language;
}

// Tag display helper constants
export const RELEVANCE_META: Record<RelevanceTag, { label: string; chipClass: string; desc: string }> = {
  smoking_gun: {
    label: '⚡ Smoking Gun',
    chipClass: 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-sm shadow-rose-950/50 ring-1 ring-rose-500/30',
    desc: 'Decisive admission or fatal evidence of breach.'
  },
  high: {
    label: '🔥 High Relevance',
    chipClass: 'bg-amber-950/80 text-amber-300 border-amber-600',
    desc: 'Direct contractual terms, key notices or timeline evidence.'
  },
  medium: {
    label: '⚖️ Medium',
    chipClass: 'bg-yellow-950/70 text-yellow-300 border-yellow-700/80',
    desc: 'Supporting correspondence or contextual background.'
  },
  contextual: {
    label: '🔍 Contextual',
    chipClass: 'bg-sky-950/70 text-sky-300 border-sky-800',
    desc: 'Market rates, general industry practices or vessel specs.'
  },
  low: {
    label: '📄 Low',
    chipClass: 'bg-slate-800/80 text-slate-400 border-slate-700',
    desc: 'Ancillary admin records with minimal legal bearing.'
  }
};

export const CONFIDENTIALITY_META: Record<ConfidentialityTag, { label: string; chipClass: string; warning?: boolean; desc: string }> = {
  without_prejudice: {
    label: '🔒 Without Prejudice (s 23)',
    chipClass: 'bg-purple-950/90 text-purple-300 border-purple-500 shadow-sm shadow-purple-950/50 ring-1 ring-purple-500/40',
    warning: true,
    desc: 'Evidence Act s 23: Settlement negotiation, inadmissible save on costs.'
  },
  litigation_privilege: {
    label: '🛡️ Litigation Privilege',
    chipClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-600',
    desc: 'Created for the dominant purpose of pending Singapore litigation.'
  },
  legal_advice_privilege: {
    label: '⚖️ Legal Advice Privilege',
    chipClass: 'bg-violet-950/80 text-violet-300 border-violet-600',
    desc: 'Confidential communications with Singapore Advocate & Solicitor.'
  },
  counsel_eyes_only: {
    label: '👁️ Counsel Eyes Only',
    chipClass: 'bg-red-950/80 text-red-300 border-red-700',
    desc: 'Restricted by court confidentiality club or protective order.'
  },
  commercial_confidential: {
    label: '💼 Commercial Confidential',
    chipClass: 'bg-cyan-950/70 text-cyan-300 border-cyan-800',
    desc: 'Proprietary financial pricing or trade secrets.'
  },
  open_evidence: {
    label: '📄 Open Evidence',
    chipClass: 'bg-slate-900/90 text-slate-300 border-slate-700',
    desc: 'Non-privileged documents discoverable and admissible.'
  }
};

export const SOURCE_TYPE_META: Record<SourceTypeTag, { label: string; chipClass: string }> = {
  email_thread: {
    label: '✉️ Email Thread',
    chipClass: 'bg-sky-950/80 text-sky-300 border-sky-700'
  },
  contract_rider: {
    label: '📜 Contract & Rider',
    chipClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
  },
  chat_log: {
    label: '💬 Chat Log (WhatsApp/Teams)',
    chipClass: 'bg-teal-950/80 text-teal-300 border-teal-700'
  },
  witness_statement: {
    label: '👤 Witness Statement',
    chipClass: 'bg-amber-950/80 text-amber-300 border-amber-700'
  },
  financial_invoice: {
    label: '💵 Financial / Invoice',
    chipClass: 'bg-green-950/80 text-green-300 border-green-700'
  },
  regulatory_filing: {
    label: '🏛️ Regulatory / Port Log',
    chipClass: 'bg-purple-950/80 text-purple-300 border-purple-700'
  },
  expert_report: {
    label: '🔬 Expert Report',
    chipClass: 'bg-blue-950/80 text-blue-300 border-blue-700'
  },
  court_judgment: {
    label: '⚖️ Court Judgment',
    chipClass: 'bg-slate-900/90 text-slate-300 border-slate-600'
  }
};

const CORPORATE_CASES_KEY = 'iris-corporate-cases';

const SAMPLE_CORPORATE_CASE: CorporateCase = {
  id: 'case-vanguard-01',
  referenceNumber: CORPORATE_SAMPLE_CASE.referenceNumber,
  caseTitle: CORPORATE_SAMPLE_CASE.caseTitle,
  clientName: CORPORATE_SAMPLE_CASE.clientName,
  adverseParty: CORPORATE_SAMPLE_CASE.adverseParty,
  disputeValue: CORPORATE_SAMPLE_CASE.disputeValue,
  courtJurisdiction: CORPORATE_SAMPLE_CASE.courtJurisdiction,
  practiceArea: CORPORATE_SAMPLE_CASE.practiceArea,
  dateCreated: CORPORATE_SAMPLE_CASE.dateCreated,
  folders: [...CORPORATE_SAMPLE_CASE.folders],
  files: [...CORPORATE_SAMPLE_CASE.files]
};

const CASE_STUDY_CASES: CorporateCase[] = CASE_STUDIES.map((cs) => {
  const [claimant, respondent] = cs.caseName.split(/ v /);
  const heldOut = isTestCitation(cs.citation);
  return {
    id: cs.id,
    referenceNumber: cs.citation || cs.fileName,
    caseTitle: cs.caseName,
    clientName: claimant?.trim() || cs.caseName,
    adverseParty: respondent?.trim() || 'Not stated',
    disputeValue: 'Not applicable (case study)',
    courtJurisdiction: cs.court,
    practiceArea: cs.subjectArea,
    dateCreated: String(cs.year),
    status: 'archived',
    folders: ['1_Judgment'],
    files: [
      {
        id: `${cs.id}-judgment`,
        folderName: '1_Judgment',
        fileName: cs.fileName,
        fileType: 'pdf',
        sizeBytes: 0,
        uploadedAt: '',
        tags: {
          relevance: 'high',
          confidentiality: 'open_evidence',
          sourceType: 'court_judgment',
          customNotes: heldOut ? undefined : cs.notes || undefined
        },
        contentSummary: heldOut
          ? `Facts: ${cs.facts}\nIssues: ${cs.issues}`
          : `Facts: ${cs.facts}\nIssues: ${cs.issues}\nHolding: ${cs.ratioDecidendi}\nSignificance: ${cs.significance}`
      }
    ]
  };
});

function loadCorporateCases(): CorporateCase[] {
  let stored: CorporateCase[] = [];
  try {
    const parsed = JSON.parse(localStorage.getItem(CORPORATE_CASES_KEY) || 'null');
    if (Array.isArray(parsed)) stored = parsed;
  } catch {
    // Unreadable saved data falls back to the built-in cases
  }
  if (stored.length === 0) return [SAMPLE_CORPORATE_CASE, ...CASE_STUDY_CASES];
  const heldOutCases = new Map(CASE_STUDY_CASES.filter((c) => isTestCitation(c.referenceNumber)).map((c) => [c.id, c]));
  const shippingTerms = /demurrage|laycan|free pratique|notice of readiness|tuas|charterparty/i;
  const migrated = stored.map((c) => {
    if (c.id === SAMPLE_CORPORATE_CASE.id && c.caseTitle !== SAMPLE_CORPORATE_CASE.caseTitle) return SAMPLE_CORPORATE_CASE;
    const auditText = [...(c.lastAudit?.claimantFlaws ?? []), ...(c.lastAudit?.respondentFlaws ?? [])]
      .map((f) => `${f.title} ${f.description}`)
      .join(' ');
    return shippingTerms.test(auditText) ? { ...c, lastAudit: undefined, rulingComparison: undefined } : c;
  });
  const cleaned = migrated.map((c) => heldOutCases.get(c.id) ?? c);
  const storedIds = new Set(cleaned.map((c) => c.id));
  return [...cleaned, ...CASE_STUDY_CASES.filter((c) => !storedIds.has(c.id))];
}

export const CorporateView: React.FC<CorporateViewProps> = ({ language }) => {
  const t = translations[language];

  // Saved corporate cases, kept in the browser so each one can be reopened later
  const [cases, setCases] = useState<CorporateCase[]>(loadCorporateCases);
  const [activeCaseId, setActiveCaseId] = useState<string>(cases[0].id);
  const activeCase = cases.find((c) => c.id === activeCaseId) ?? cases[0];
  const activeStatus: CaseStatus = activeCase.status ?? 'active';
  const openCases = cases.filter((c) => (c.status ?? 'active') !== 'archived');
  const archivedCases = cases.filter((c) => c.status === 'archived');
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archiveQuery, setArchiveQuery] = useState('');
  const visibleArchivedCases = archivedCases.filter((c) => {
    const q = archiveQuery.trim().toLowerCase();
    return !q || [c.caseTitle, c.referenceNumber, c.practiceArea, c.courtJurisdiction, c.clientName, c.adverseParty]
      .some((v) => v.toLowerCase().includes(q));
  });

  useEffect(() => {
    try {
      localStorage.setItem(CORPORATE_CASES_KEY, JSON.stringify(cases));
    } catch {
      // Storage unavailable: cases stay in memory for this session
    }
  }, [cases]);

  const updateCase = (id: string, change: (c: CorporateCase) => CorporateCase) => {
    setCases((prev) => prev.map((c) => (c.id === id ? change(c) : c)));
  };

  const setActiveCase = (next: CorporateCase) => updateCase(next.id, () => next);

  const auditResult = activeCase.lastAudit ?? null;
  const setAuditResult = (result: DualSideFlawAnalysis | null) =>
    updateCase(activeCaseId, (c) => ({ ...c, lastAudit: result ?? undefined }));

  const openCase = (id: string) => {
    setActiveCaseId(id);
    setSelectedFolder('all');
    setTagFilterType('all');
    setTagFilterValue('all');
    setSearchQuery('');
    setSelectedFileForPreview(null);
    setEditingFile(null);
  };

  const setCaseStatus = (status: CaseStatus) => {
    const today = new Date().toISOString().split('T')[0];
    updateCase(activeCaseId, (c) => ({
      ...c,
      status,
      completedAt: status === 'active' ? undefined : (c.completedAt ?? today),
      archivedAt: status === 'archived' ? today : undefined
    }));
  };

  const ruling: CourtRuling | undefined = CASE_RULINGS[activeCase.id];
  const isHeldOut = isTestCitation(activeCase.referenceNumber);
  const revealRuling = !isHeldOut || !!activeCase.rulingComparison;
  const [isComparingRuling, setIsComparingRuling] = useState(false);
  const [rulingError, setRulingError] = useState('');

  const auditPointsOf = (analysis: DualSideFlawAnalysis) => [
    ...analysis.claimantFlaws.map((f) => ({ id: `claimant:${f.id}`, side: 'Claimant', title: f.title, description: f.description })),
    ...analysis.respondentFlaws.map((f) => ({ id: `respondent:${f.id}`, side: 'Respondent', title: f.title, description: f.description }))
  ];
  const auditPoints = auditResult ? auditPointsOf(auditResult) : [];
  const comparisonById = new Map((activeCase.rulingComparison || []).map((r) => [r.id, r]));

  const compareWithRuling = async () => {
    if (!ruling) return;
    const caseId = activeCase.id;
    setIsComparingRuling(true);
    setRulingError('');
    try {
      const audit = await runAudit();
      if (!audit) {
        setRulingError('The AI audit is unavailable right now. Wait a minute, then try again.');
        return;
      }
      const points = auditPointsOf(audit);
      if (points.length === 0) {
        setRulingError('The audit returned no points to compare. Try again.');
        return;
      }
      const response = await fetch('/api/corporate/compare-ruling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flaws: points, ruling, language })
      });
      if (!response.ok) {
        const detail = await response.text();
        console.error('Ruling comparison failed:', response.status, detail);
        throw new Error(String(response.status));
      }
      const data = await response.json();
      updateCase(caseId, (c) => ({ ...c, rulingComparison: data.results }));
    } catch (err: any) {
      console.error('Ruling comparison failed:', err);
      setRulingError(
        err?.message === '503'
          ? 'The AI model is busy right now. Wait a minute, then press Compare again.'
          : 'Comparison failed. Check the terminal for details, then try again.'
      );
    } finally {
      setIsComparingRuling(false);
    }
  };

  // Folder & Tag Filter State
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [tagFilterType, setTagFilterType] = useState<'all' | 'relevance' | 'confidentiality' | 'sourceType'>('all');
  const [tagFilterValue, setTagFilterValue] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected File Preview Drawer
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<UploadedFileItem | null>(null);

  // Email to Case Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTopic, setEmailTopic] = useState('');
  const [emailSender, setEmailSender] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isParsingEmail, setIsParsingEmail] = useState(false);
  const [importedEmails, setImportedEmails] = useState<ParsedEmail[]>([]);
  const [selectedEmailIndex, setSelectedEmailIndex] = useState<number | null>(null);

  // New Folder Creation State
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Add Document Mock State
  const [isAddDocExpanded, setIsAddDocExpanded] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [targetFolderForUpload, setTargetFolderForUpload] = useState(activeCase.folders[0] || 'Default');
  const [fileSummaryText, setFileSummaryText] = useState('');
  const [newFileRelevance, setNewFileRelevance] = useState<RelevanceTag>('high');
  const [newFileConfidentiality, setNewFileConfidentiality] = useState<ConfidentialityTag>('open_evidence');
  const [newFileSourceType, setNewFileSourceType] = useState<SourceTypeTag>('contract_rider');
  const [newFileNotes, setNewFileNotes] = useState('');

  // Edit Metadata Tags Modal State
  const [editingFile, setEditingFile] = useState<UploadedFileItem | null>(null);
  const [editRelevance, setEditRelevance] = useState<RelevanceTag>('high');
  const [editConfidentiality, setEditConfidentiality] = useState<ConfidentialityTag>('open_evidence');
  const [editSourceType, setEditSourceType] = useState<SourceTypeTag>('contract_rider');
  const [editNotes, setEditNotes] = useState('');

  // Dual Side Audit State
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isBusy = isRunningAudit || isComparingRuling;

  useEffect(() => {
    if (!isBusy) return;
    const started = Date.now();
    setElapsedSeconds(0);
    const timer = setInterval(() => setElapsedSeconds(Math.round((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [isBusy]);
  const [flawActiveTab, setFlawActiveTab] = useState<'claimant' | 'respondent' | 'sources' | 'precedents'>('claimant');

  // Open Edit Modal for a given file
  const handleOpenEditModal = (file: UploadedFileItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingFile(file);
    setEditRelevance(file.tags?.relevance || 'high');
    setEditConfidentiality(file.tags?.confidentiality || 'open_evidence');
    setEditSourceType(file.tags?.sourceType || 'contract_rider');
    setEditNotes(file.tags?.customNotes || '');
  };

  // Save Updated Tags for a file
  const handleSaveTags = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile) return;

    const updatedTags: FileMetadataTags = {
      relevance: editRelevance,
      confidentiality: editConfidentiality,
      sourceType: editSourceType,
      customNotes: editNotes.trim() || undefined,
      assignedBy: 'Counsel in charge'
    };

    const updatedFiles = activeCase.files.map((f) => {
      if (f.id === editingFile.id) {
        return {
          ...f,
          tags: updatedTags
        };
      }
      return f;
    });

    setActiveCase({
      ...activeCase,
      files: updatedFiles
    });

    // Also update preview drawer if this file was currently open
    if (selectedFileForPreview?.id === editingFile.id) {
      setSelectedFileForPreview({
        ...selectedFileForPreview,
        tags: updatedTags
      });
    }

    // Sync into auditResult sourceTracking if active
    if (auditResult) {
      const updatedSources = auditResult.sourceTracking.map((src) => {
        if (src.id === editingFile.id || src.docName === editingFile.fileName) {
          const relGrade =
            editRelevance === 'smoking_gun'
              ? 'Smoking Gun'
              : editRelevance === 'high'
              ? 'High'
              : editRelevance === 'medium'
              ? 'Medium'
              : 'Low';
          return {
            ...src,
            tags: updatedTags,
            relevanceGrade: relGrade as any
          };
        }
        return src;
      });

      // Also update flaw source tags if matched
      const updateFlawList = (flaws: any[]) =>
        flaws.map((flaw) => {
          if (flaw.sourceDocument.includes(editingFile.fileName) || editingFile.fileName.includes(flaw.sourceDocument)) {
            return {
              ...flaw,
              sourceTags: updatedTags
            };
          }
          return flaw;
        });

      setAuditResult({
        ...auditResult,
        claimantFlaws: updateFlawList(auditResult.claimantFlaws),
        respondentFlaws: updateFlawList(auditResult.respondentFlaws),
        sourceTracking: updatedSources
      });
    }

    setEditingFile(null);
  };

  const handleEmlFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const parsed = await Promise.all(files.map(async (file) => parseEml(await file.text(), file.name)));
    setImportedEmails(parsed);
    setSelectedEmailIndex(null);
    e.target.value = '';
  };

  const selectImportedEmail = (index: number) => {
    const email = importedEmails[index];
    setSelectedEmailIndex(index);
    setEmailTopic(email.subject);
    setEmailSender(email.from);
    setEmailBody(email.body);
  };

  // Parse Email to Create New Case
  const handleParseEmailToCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsParsingEmail(true);

    try {
      const response = await fetch('/api/corporate/email-to-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailSubject: emailTopic,
          emailBody: `From: ${emailSender}\n${emailBody}`
        })
      });

      if (!response.ok) throw new Error('Failed to parse email');
      const data = await response.json();
      const parsed = data.result;

      const newCaseObj: CorporateCase = {
        id: `case-${Date.now()}`,
        referenceNumber: `SG/CORP/${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        caseTitle: parsed.caseTitle,
        clientName: parsed.clientName || 'Instructing Client',
        adverseParty: parsed.adverseParty || 'Adverse Entity',
        disputeValue: parsed.disputeValue,
        courtJurisdiction: parsed.courtJurisdiction,
        practiceArea: parsed.practiceArea,
        createdFromEmail: true,
        dateCreated: new Date().toISOString().split('T')[0],
        folders: ['1_Email_Instruction', '2_Agreements', '3_Discovery_Logs'],
        files: [
          {
            id: `doc-${Date.now()}-1`,
            folderName: '1_Email_Instruction',
            fileName: 'Incoming_Instruction_Email.eml',
            fileType: 'email',
            sizeBytes: 154000,
            uploadedAt: new Date().toLocaleString(),
            metadata: {
              emailFrom: emailSender,
              emailSubject: emailTopic,
              emailDate: new Date().toLocaleString()
            },
            tags: {
              relevance: 'high',
              confidentiality: 'legal_advice_privilege',
              sourceType: 'email_thread',
              customNotes: 'Client initial instructions email received via Iris intake.'
            },
            contentSummary: emailBody.substring(0, 220) + '...'
          }
        ]
      };

      setCases((prev) => [newCaseObj, ...prev]);
      openCase(newCaseObj.id);
      setIsEmailModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsingEmail(false);
    }
  };

  // Run Corporate Flaw Audit
  const runAudit = async (): Promise<DualSideFlawAnalysis | null> => {
    setIsRunningAudit(true);
    setAuditError('');
    const caseId = activeCase.id;
    try {
      const response = await fetch('/api/corporate/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseData: { ...activeCase, lastAudit: undefined, rulingComparison: undefined }, language })
      });

      if (!response.ok) throw new Error('Corporate analysis failed');
      const data = await response.json();
      updateCase(caseId, (c) => ({ ...c, lastAudit: data.result, rulingComparison: undefined }));
      return data.result as DualSideFlawAnalysis;
    } catch (err) {
      console.error('Audit failed:', err);
      setAuditError('The AI audit is unavailable right now. Wait a minute, then run it again.');
      return null;
    } finally {
      setIsRunningAudit(false);
    }
  };

  const handleRunAudit = () => {
    void runAudit();
  };

  // Add Folder Handler
  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const clean = newFolderName.trim().replace(/\s+/g, '_');
    if (!activeCase.folders.includes(clean)) {
      setActiveCase({
        ...activeCase,
        folders: [...activeCase.folders, clean]
      });
    }
    setNewFolderName('');
    setIsAddFolderModalOpen(false);
  };

  // Add Document to Folder Handler with Metadata Tags
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const newDoc: UploadedFileItem = {
      id: `doc-${Date.now()}`,
      folderName: targetFolderForUpload,
      fileName: newFileName.trim(),
      fileType: newFileName.endsWith('.eml') ? 'email' : 'contract',
      sizeBytes: Math.floor(250000 + Math.random() * 800000),
      uploadedAt: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      tags: {
        relevance: newFileRelevance,
        confidentiality: newFileConfidentiality,
        sourceType: newFileSourceType,
        customNotes: newFileNotes.trim() || undefined
      },
      contentSummary: fileSummaryText.trim() || 'Uploaded legal document or correspondence for Singapore case audit.'
    };

    setActiveCase({
      ...activeCase,
      files: [newDoc, ...activeCase.files]
    });

    setNewFileName('');
    setFileSummaryText('');
    setNewFileNotes('');
    setIsAddDocExpanded(false);
  };

  // Filter Files Logic
  const filteredFiles = activeCase.files.filter((file) => {
    // Folder filter
    if (selectedFolder !== 'all' && file.folderName !== selectedFolder) {
      return false;
    }

    // Metadata Tag filter
    if (tagFilterType === 'relevance' && tagFilterValue !== 'all') {
      if (file.tags?.relevance !== tagFilterValue) return false;
    } else if (tagFilterType === 'confidentiality' && tagFilterValue !== 'all') {
      if (file.tags?.confidentiality !== tagFilterValue) return false;
    } else if (tagFilterType === 'sourceType' && tagFilterValue !== 'all') {
      if (file.tags?.sourceType !== tagFilterValue) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = file.fileName.toLowerCase().includes(q);
      const matchSummary = file.contentSummary.toLowerCase().includes(q);
      const matchNotes = file.tags?.customNotes?.toLowerCase().includes(q);
      if (!matchName && !matchSummary && !matchNotes) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner: Corporate Suite */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-200 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Singapore Law Firm & In-House Counsel Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
              {t.corporateHeroTitle}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {t.corporateHeroSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-950/50 transition cursor-pointer"
            >
              <Mail className="w-4 h-4 text-amber-200" />
              <span>{t.newCaseFromEmail}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Case Folders */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Folder className="w-4 h-4 text-amber-400" />
            <span>Case Folders</span>
          </h3>
          <span className="text-[10px] text-slate-500">
            {openCases.length} open · {archivedCases.length} archived
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {openCases.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => openCase(c.id)}
              className={`text-left px-3 py-2 rounded-xl border text-xs transition cursor-pointer ${
                c.id === activeCaseId
                  ? 'border-amber-500 bg-amber-950/40 text-white'
                  : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold truncate max-w-[220px]">{c.caseTitle}</span>
                {c.status === 'completed' && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Completed
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{c.referenceNumber}</div>
            </button>
          ))}
        </div>

        {archivedCases.length > 0 && (
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => setIsArchiveOpen((open) => !open)}
              className="flex items-center space-x-1.5 text-[10px] uppercase font-semibold text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isArchiveOpen ? '' : '-rotate-90'}`} />
              <span>Archive (reference material) · {archivedCases.length}</span>
            </button>
            {isArchiveOpen && (
            <div className="space-y-2">
            <input
              type="text"
              value={archiveQuery}
              onChange={(e) => setArchiveQuery(e.target.value)}
              placeholder="Search archived cases by name, citation, court or area..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {visibleArchivedCases.length === 0 && (
              <p className="text-[11px] text-slate-500">No archived cases match "{archiveQuery}".</p>
            )}
            <div className="max-h-56 overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-2">
              {visibleArchivedCases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openCase(c.id)}
                  className={`text-left px-3 py-2 rounded-xl border text-xs transition cursor-pointer ${
                    c.id === activeCaseId
                      ? 'border-amber-500 bg-amber-950/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Folder className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold truncate max-w-[220px]">{c.caseTitle}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {c.referenceNumber}{c.archivedAt ? ` · Archived ${c.archivedAt}` : ''}
                  </div>
                </button>
              ))}
            </div>
            </div>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Active Matter Info Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60">
              {activeCase.referenceNumber}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white font-serif">
              {activeCase.caseTitle}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Practice: <strong className="text-slate-200">{activeCase.practiceArea}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Client (Instructing)</span>
            <span className="font-semibold text-slate-200">{activeCase.clientName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Adverse Party</span>
            <span className="font-semibold text-rose-300">{activeCase.adverseParty}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">{t.jurisdictionLabel}</span>
            <span className="font-semibold text-slate-200">{activeCase.courtJurisdiction}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">{t.disputeValueLabel}</span>
            <span className="font-bold text-emerald-400 font-mono">{activeCase.disputeValue}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-800">
          <span className="text-[11px] text-slate-400">
            Status: <strong className="text-slate-200 capitalize">{activeStatus}</strong>
            {activeCase.completedAt ? ` · Completed ${activeCase.completedAt}` : ''}
            {activeCase.archivedAt ? ` · Archived ${activeCase.archivedAt}` : ''}
          </span>
          <div className="flex flex-wrap gap-2">
            {activeStatus === 'active' && (
              <button
                type="button"
                onClick={() => setCaseStatus('completed')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/80 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark as completed</span>
              </button>
            )}
            {activeStatus === 'completed' && (
              <>
                <button
                  type="button"
                  onClick={() => setCaseStatus('archived')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Archive for reference</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCaseStatus('active')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Reopen
                </button>
              </>
            )}
            {activeStatus === 'archived' && (
              <button
                type="button"
                onClick={() => setCaseStatus('active')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Restore to active
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Multi-Folder Evidence Manager & Dual-Side Flaw Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-Folder Dossier & Metadata Tagging Explorer (5 cols on lg) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FolderPlus className="w-4 h-4 text-amber-400" />
                <span>{t.uploadFoldersTitle}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.uploadFoldersDesc}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddFolderModalOpen(true)}
              className="text-xs text-amber-300 hover:text-amber-200 flex items-center space-x-1 font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Folder</span>
            </button>
          </div>

          {/* Folder Filter Bar */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Folders:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedFolder('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedFolder === 'all'
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                }`}
              >
                All ({activeCase.files.length})
              </button>
              {activeCase.folders.map((folderName) => {
                const count = activeCase.files.filter((f) => f.folderName === folderName).length;
                return (
                  <button
                    key={folderName}
                    type="button"
                    onClick={() => setSelectedFolder(folderName)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      selectedFolder === folderName
                        ? 'bg-amber-700 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Folder className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{folderName}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metadata Tag Filter Bar (Feature Requirement) */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.filterByTag}</span>
              </span>
              {(tagFilterType !== 'all' || tagFilterValue !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setTagFilterType('all');
                    setTagFilterValue('all');
                    setSearchQuery('');
                  }}
                  className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Tag Category Selector */}
            <div className="grid grid-cols-4 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setTagFilterType('all');
                  setTagFilterValue('all');
                }}
                className={`py-1 px-1.5 rounded text-center font-medium transition cursor-pointer ${
                  tagFilterType === 'all'
                    ? 'bg-amber-800 text-white'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {t.allTags}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTagFilterType('relevance');
                  setTagFilterValue('smoking_gun');
                }}
                className={`py-1 px-1.5 rounded text-center font-medium transition cursor-pointer ${
                  tagFilterType === 'relevance'
                    ? 'bg-rose-900 text-rose-100'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {t.tagRelevance}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTagFilterType('confidentiality');
                  setTagFilterValue('without_prejudice');
                }}
                className={`py-1 px-1.5 rounded text-center font-medium transition cursor-pointer ${
                  tagFilterType === 'confidentiality'
                    ? 'bg-purple-900 text-purple-100'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {t.tagConfidentiality}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTagFilterType('sourceType');
                  setTagFilterValue('email_thread');
                }}
                className={`py-1 px-1.5 rounded text-center font-medium transition cursor-pointer ${
                  tagFilterType === 'sourceType'
                    ? 'bg-sky-900 text-sky-100'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {t.tagSourceType}
              </button>
            </div>

            {/* Tag Pills Sub-Filter */}
            {tagFilterType === 'relevance' && (
              <div className="flex flex-wrap gap-1 pt-1">
                {(Object.keys(RELEVANCE_META) as RelevanceTag[]).map((tagKey) => (
                  <button
                    key={tagKey}
                    type="button"
                    onClick={() => setTagFilterValue(tagKey)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer transition ${
                      tagFilterValue === tagKey
                        ? RELEVANCE_META[tagKey].chipClass + ' ring-2 ring-white/30 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {RELEVANCE_META[tagKey].label}
                  </button>
                ))}
              </div>
            )}

            {tagFilterType === 'confidentiality' && (
              <div className="flex flex-wrap gap-1 pt-1">
                {(Object.keys(CONFIDENTIALITY_META) as ConfidentialityTag[]).map((tagKey) => (
                  <button
                    key={tagKey}
                    type="button"
                    onClick={() => setTagFilterValue(tagKey)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer transition ${
                      tagFilterValue === tagKey
                        ? CONFIDENTIALITY_META[tagKey].chipClass + ' ring-2 ring-white/30 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {CONFIDENTIALITY_META[tagKey].label}
                  </button>
                ))}
              </div>
            )}

            {tagFilterType === 'sourceType' && (
              <div className="flex flex-wrap gap-1 pt-1">
                {(Object.keys(SOURCE_TYPE_META) as SourceTypeTag[]).map((tagKey) => (
                  <button
                    key={tagKey}
                    type="button"
                    onClick={() => setTagFilterValue(tagKey)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer transition ${
                      tagFilterValue === tagKey
                        ? SOURCE_TYPE_META[tagKey].chipClass + ' ring-2 ring-white/30 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {SOURCE_TYPE_META[tagKey].label}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Keyword Search */}
            <div className="relative pt-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search by file name, summary or note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Collapsible Quick Add Document Form with Tag System */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1.5 uppercase tracking-wider">
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload New Evidence with Metadata Tags</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddDocExpanded(!isAddDocExpanded)}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                {isAddDocExpanded ? 'Collapse' : 'Expand Form'}
              </button>
            </div>

            {isAddDocExpanded ? (
              <form onSubmit={handleAddDocument} className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">File Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Employment_Contract.pdf"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Destination Folder</label>
                    <select
                      value={targetFolderForUpload}
                      onChange={(e) => setTargetFolderForUpload(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      {activeCase.folders.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Metadata Tag Selectors */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-amber-300 font-semibold mb-0.5">Relevance Tag</label>
                    <select
                      value={newFileRelevance}
                      onChange={(e) => setNewFileRelevance(e.target.value as RelevanceTag)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
                    >
                      <option value="smoking_gun">⚡ Smoking Gun</option>
                      <option value="high">🔥 High</option>
                      <option value="medium">⚖️ Medium</option>
                      <option value="contextual">🔍 Contextual</option>
                      <option value="low">📄 Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-purple-300 font-semibold mb-0.5">Privilege / Confidentiality</label>
                    <select
                      value={newFileConfidentiality}
                      onChange={(e) => setNewFileConfidentiality(e.target.value as ConfidentialityTag)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
                    >
                      <option value="open_evidence">📄 Open Evidence</option>
                      <option value="without_prejudice">🔒 Without Prejudice (s 23)</option>
                      <option value="litigation_privilege">🛡️ Litigation Privilege</option>
                      <option value="legal_advice_privilege">⚖️ Legal Advice Privilege</option>
                      <option value="counsel_eyes_only">👁️ Counsel Eyes Only</option>
                      <option value="commercial_confidential">💼 Commercial Confidential</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-sky-300 font-semibold mb-0.5">Source Type</label>
                    <select
                      value={newFileSourceType}
                      onChange={(e) => setNewFileSourceType(e.target.value as SourceTypeTag)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
                    >
                      <option value="contract_rider">📜 Contract & Rider</option>
                      <option value="email_thread">✉️ Email Thread</option>
                      <option value="chat_log">💬 Chat Log</option>
                      <option value="witness_statement">👤 Witness Statement</option>
                      <option value="financial_invoice">💵 Invoice</option>
                      <option value="regulatory_filing">🏛️ Regulatory</option>
                      <option value="expert_report">🔬 Expert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Content Summary / Evidence Quotation</label>
                  <input
                    type="text"
                    placeholder="e.g. Clause 9.1: 1 month written notice required to terminate"
                    value={fileSummaryText}
                    onChange={(e) => setFileSummaryText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Attorney Notes / Citation Tracking</label>
                  <input
                    type="text"
                    placeholder="e.g. No notice was given before dismissal"
                    value={newFileNotes}
                    onChange={(e) => setNewFileNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newFileName.trim()}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition cursor-pointer shadow-md"
                >
                  Upload & Categorize Evidence
                </button>
              </form>
            ) : (
              <p className="text-[11px] text-slate-400">
                Click &quot;Expand Form&quot; to upload contracts, emails, WhatsApp logs, or expert reports with custom metadata tags.
              </p>
            )}
          </div>

          {/* Files List with Metadata Tags */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredFiles.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
                No evidence items match the selected folder or metadata tag filter.
              </div>
            ) : (
              filteredFiles.map((file) => {
                const relMeta = RELEVANCE_META[file.tags?.relevance || 'high'];
                const confMeta = CONFIDENTIALITY_META[file.tags?.confidentiality || 'open_evidence'];
                const srcMeta = SOURCE_TYPE_META[file.tags?.sourceType || 'contract_rider'];

                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileForPreview(file)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition text-xs space-y-2 relative group ${
                      selectedFileForPreview?.id === file.id
                        ? 'bg-amber-950/40 border-amber-600 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: File Name & Size */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 font-semibold text-slate-200 truncate max-w-[240px]">
                        {file.fileType === 'email' ? (
                          <Mail className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        )}
                        <span className="truncate">{file.fileName}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                          {(file.sizeBytes / 1024).toFixed(0)} KB
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(file, e)}
                          title="Edit Metadata Tags"
                          className="p-1 rounded bg-slate-800 hover:bg-amber-700 text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Tags Badges Row */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {/* Relevance Tag */}
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${relMeta.chipClass}`}>
                        {relMeta.label}
                      </span>

                      {/* Confidentiality / Privilege Tag */}
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${confMeta.chipClass}`}>
                        {confMeta.label}
                      </span>

                      {/* Source Type Tag */}
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${srcMeta.chipClass}`}>
                        {srcMeta.label}
                      </span>
                    </div>

                    {/* Folder & Uploaded At */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono">
                        📁 {file.folderName}
                      </span>
                      <span>{file.uploadedAt}</span>
                    </div>

                    {/* Content Summary */}
                    <p className="text-slate-300 text-[11px] line-clamp-2 pt-1 border-t border-slate-800/60 leading-relaxed">
                      {file.contentSummary}
                    </p>

                    {/* Privileged / Attorney Custom Notes */}
                    {file.tags?.customNotes && (
                      <div className="text-[10px] bg-slate-900/90 text-amber-200/90 px-2 py-1 rounded border border-amber-900/40">
                        <strong className="text-amber-400">Counsel Note:</strong> {file.tags.customNotes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Document Preview Drawer if clicked */}
          {selectedFileForPreview && (
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-800/80 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <span>Document Detail & Metadata Tags</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(selectedFileForPreview)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer font-semibold"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{t.editMetadataTags}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFileForPreview(null)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div>
                <p className="font-semibold text-white text-sm">{selectedFileForPreview.fileName}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Folder: {selectedFileForPreview.folderName} | Size: {(selectedFileForPreview.sizeBytes / 1024).toFixed(0)} KB | Uploaded: {selectedFileForPreview.uploadedAt}
                </p>
              </div>

              {/* Tags Overview */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Assigned Legal Metadata Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${RELEVANCE_META[selectedFileForPreview.tags?.relevance || 'high'].chipClass}`}>
                    {RELEVANCE_META[selectedFileForPreview.tags?.relevance || 'high'].label}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${CONFIDENTIALITY_META[selectedFileForPreview.tags?.confidentiality || 'open_evidence'].chipClass}`}>
                    {CONFIDENTIALITY_META[selectedFileForPreview.tags?.confidentiality || 'open_evidence'].label}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${SOURCE_TYPE_META[selectedFileForPreview.tags?.sourceType || 'contract_rider'].chipClass}`}>
                    {SOURCE_TYPE_META[selectedFileForPreview.tags?.sourceType || 'contract_rider'].label}
                  </span>
                </div>
                {CONFIDENTIALITY_META[selectedFileForPreview.tags?.confidentiality || 'open_evidence'].warning && (
                  <p className="text-[10px] text-purple-300 pt-1 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-purple-400 flex-shrink-0" />
                    <span>Warning: Admissibility restriction under Evidence Act (Cap 97) s 23.</span>
                  </p>
                )}
              </div>

              {selectedFileForPreview.metadata?.emailFrom && (
                <div className="bg-slate-900 p-2.5 rounded-lg text-[11px] space-y-0.5 text-slate-300 border border-slate-800">
                  <p><strong>From:</strong> {selectedFileForPreview.metadata.emailFrom}</p>
                  <p><strong>To:</strong> {selectedFileForPreview.metadata.emailTo || 'ops@vanguardmarine.sg'}</p>
                  <p><strong>Date:</strong> {selectedFileForPreview.metadata.emailDate}</p>
                  <p><strong>Subject:</strong> {selectedFileForPreview.metadata.emailSubject}</p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Content Summary & Excerpt:</span>
                <p className="text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  {selectedFileForPreview.contentSummary}
                </p>
              </div>

              {selectedFileForPreview.tags?.customNotes && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-amber-400 block">Counsel Strategy Notes:</span>
                  <p className="text-amber-200/90 text-[11px] bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/50">
                    {selectedFileForPreview.tags.customNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Dual-Sided Flaw Matrix & Precedent Tracker (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {isBusy && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  {isRunningAudit ? 'Running audit' : 'Comparing with ruling'}
                </span>
                <span className="font-mono text-slate-400">{elapsedSeconds}s</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-red-700 via-amber-500 to-red-700 rounded-full animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-500">
                Exhaustive audits can take 1 to 2 minutes. The bar shows that the request is running, not how far along it is.
              </p>
            </div>
          )}

          {!auditResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white font-serif">
                Corporate Flaw Audit Ready
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Click &quot;Execute Full Legal Flaw Audit&quot; to cross-examine all {activeCase.files.length} documents and email chains. Iris will generate a dual-sided matrix revealing vulnerabilities for both Claimant and Respondent with exact file, line, metadata tags, and Singapore court citations.
              </p>
              <button
                type="button"
                onClick={handleRunAudit}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Run Full Dual-Sided Audit</span>
              </button>
              {auditError && <p className="text-[11px] text-rose-300 max-w-md mx-auto">{auditError}</p>}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              {/* Header Tab Switcher */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {t.dualSideFlawAnalysisTitle}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRunAudit}
                  disabled={isRunningAudit}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold transition disabled:opacity-40 cursor-pointer"
                >
                  {isRunningAudit ? 'Re-running audit...' : 'Re-run audit'}
                </button>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-mono">
                    Claimant Flaws: {auditResult.claimantFlaws.length}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                    Respondent Flaws: {auditResult.respondentFlaws.length}
                  </span>
                </div>
              </div>

              <div className="p-4 border-b border-slate-800">
                <SourceFlags text={JSON.stringify(auditResult)} />
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 overflow-x-auto no-scrollbar">
                {[
                  { id: 'claimant', label: t.claimantFlawsTab, count: auditResult.claimantFlaws.length },
                  { id: 'respondent', label: t.respondentFlawsTab, count: auditResult.respondentFlaws.length },
                  { id: 'sources', label: t.sourceTrackingTab, count: auditResult.sourceTracking.length },
                  { id: 'precedents', label: t.precedentsUsedTab, count: auditResult.statutoryPrecedentsUsed.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFlawActiveTab(tab.id as any)}
                    className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                      flawActiveTab === tab.id
                        ? 'border-amber-500 text-amber-300 bg-slate-900/60'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-1.5 text-[10px] font-mono opacity-80">({tab.count})</span>
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                {/* CLAIMANT FLAWS */}
                {flawActiveTab === 'claimant' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      Vulnerabilities in our client&apos;s position. Prepare rebuttals before opposing counsel exploits them in pleadings or cross-examination.
                    </p>
                    <div className="space-y-4">
                      {auditResult.claimantFlaws.map((flaw) => {
                        // Locate matching file metadata tags if available
                        const matchingFile = activeCase.files.find((f) =>
                          flaw.sourceDocument.toLowerCase().includes(f.fileName.toLowerCase()) ||
                          f.fileName.toLowerCase().includes(flaw.sourceDocument.toLowerCase())
                        );
                        const tags = matchingFile?.tags || flaw.sourceTags;

                        return (
                          <div
                            key={flaw.id}
                            className="p-4 rounded-xl bg-slate-950 border border-red-950/80 hover:border-red-800/80 transition space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-white text-xs sm:text-sm">
                                {flaw.title}
                              </h4>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                                {flaw.severity}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {flaw.description}
                            </p>

                            {/* Vulnerability Quote */}
                            <div className="p-3 bg-red-950/30 border-l-2 border-red-500 rounded-r text-xs text-red-200 italic font-serif">
                              <span className="not-italic text-[10px] text-red-400 font-sans uppercase font-bold block mb-1">
                                {t.vulnerabilityQuoteLabel}
                              </span>
                              {flaw.vulnerabilityQuote}
                            </div>

                            {/* Source Tracking & Attached Metadata Tags */}
                            <div className="space-y-2 bg-slate-900 p-3 rounded-lg border border-slate-800">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                                <div>
                                  <span className="text-slate-500 block">📁 {t.sourceDocLabel}</span>
                                  <span className="text-amber-300 font-mono font-medium">
                                    {flaw.sourceDocument} ({flaw.sourceCitation})
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">📜 {t.statuteCitationLabel}</span>
                                  <span className="text-slate-200 font-mono">{flaw.statuteOrPrecedent}</span>
                                </div>
                              </div>

                              {tags && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
                                  <span className="text-[10px] font-semibold text-slate-500 uppercase mr-1">Source Tags:</span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${RELEVANCE_META[tags.relevance].chipClass}`}>
                                    {RELEVANCE_META[tags.relevance].label}
                                  </span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${CONFIDENTIALITY_META[tags.confidentiality].chipClass}`}>
                                    {CONFIDENTIALITY_META[tags.confidentiality].label}
                                  </span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${SOURCE_TYPE_META[tags.sourceType].chipClass}`}>
                                    {SOURCE_TYPE_META[tags.sourceType].label}
                                  </span>
                                  {CONFIDENTIALITY_META[tags.confidentiality].warning && (
                                    <span className="text-[9px] text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded font-mono border border-purple-800">
                                      ⚠️ Without prejudice negotiation (s 23)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Opposing Argument & Mitigation */}
                            <div className="text-xs space-y-1.5 pt-2 border-t border-slate-800/80">
                              <p className="text-slate-300">
                                <strong className="text-rose-400">Opposing Counsel Anticipated Angle: </strong>
                                {flaw.opposingArgument}
                              </p>
                              <p className="text-emerald-300">
                                <strong className="text-emerald-400">{t.counterStrategyLabel} </strong>
                                {flaw.mitigationStrategy}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* RESPONDENT FLAWS */}
                {flawActiveTab === 'respondent' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      Opposing party admissions, procedural defaults, and evidentiary gaps for our team to exploit in cross-examination and summary judgment.
                    </p>
                    <div className="space-y-4">
                      {auditResult.respondentFlaws.map((flaw) => {
                        const matchingFile = activeCase.files.find((f) =>
                          flaw.sourceDocument.toLowerCase().includes(f.fileName.toLowerCase()) ||
                          f.fileName.toLowerCase().includes(flaw.sourceDocument.toLowerCase())
                        );
                        const tags = matchingFile?.tags || flaw.sourceTags;

                        return (
                          <div
                            key={flaw.id}
                            className="p-4 rounded-xl bg-slate-950 border border-emerald-950/80 hover:border-emerald-800/80 transition space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-white text-xs sm:text-sm">
                                {flaw.title}
                              </h4>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                {flaw.severity}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {flaw.description}
                            </p>

                            {/* Vulnerability Quote */}
                            <div className="p-3 bg-emerald-950/30 border-l-2 border-emerald-500 rounded-r text-xs text-emerald-200 italic font-serif">
                              <span className="not-italic text-[10px] text-emerald-400 font-sans uppercase font-bold block mb-1">
                                Opposing Party Admission / Contradiction:
                              </span>
                              {flaw.vulnerabilityQuote}
                            </div>

                            {/* Source Tracking & Attached Metadata Tags */}
                            <div className="space-y-2 bg-slate-900 p-3 rounded-lg border border-slate-800">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                                <div>
                                  <span className="text-slate-500 block">📁 {t.sourceDocLabel}</span>
                                  <span className="text-amber-300 font-mono font-medium">
                                    {flaw.sourceDocument} ({flaw.sourceCitation})
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">📜 {t.statuteCitationLabel}</span>
                                  <span className="text-slate-200 font-mono">{flaw.statuteOrPrecedent}</span>
                                </div>
                              </div>

                              {tags && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
                                  <span className="text-[10px] font-semibold text-slate-500 uppercase mr-1">Source Tags:</span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${RELEVANCE_META[tags.relevance].chipClass}`}>
                                    {RELEVANCE_META[tags.relevance].label}
                                  </span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${CONFIDENTIALITY_META[tags.confidentiality].chipClass}`}>
                                    {CONFIDENTIALITY_META[tags.confidentiality].label}
                                  </span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${SOURCE_TYPE_META[tags.sourceType].chipClass}`}>
                                    {SOURCE_TYPE_META[tags.sourceType].label}
                                  </span>
                                  {tags.relevance === 'smoking_gun' && (
                                    <span className="text-[9px] text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded font-mono border border-rose-800">
                                      ⚡ Key admission for trial
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Cross-Examination Strategy */}
                            <div className="text-xs pt-2 border-t border-slate-800/80">
                              <p className="text-amber-300">
                                <strong className="text-amber-400">{t.ourExploitationLabel} </strong>
                                {flaw.ourExploitationStrategy}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SOURCE TRACKING WITH METADATA TAGS */}
                {flawActiveTab === 'sources' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      Every single uploaded document and email correspondence tracked, categorized by metadata tags, and cited across identified legal issues.
                    </p>
                    <div className="space-y-3">
                      {auditResult.sourceTracking.map((src) => {
                        const matchingFile = activeCase.files.find((f) =>
                          src.docName.toLowerCase().includes(f.fileName.toLowerCase()) ||
                          f.fileName.toLowerCase().includes(src.docName.toLowerCase())
                        );
                        const tags = matchingFile?.tags || src.tags;

                        return (
                          <div
                            key={src.id}
                            className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 font-bold text-white">
                                <FileCheck className="w-4 h-4 text-amber-400" />
                                <span>{src.docName}</span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                Folder: {src.folder}
                              </span>
                            </div>

                            {/* Metadata Tag Row */}
                            {tags && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full border ${RELEVANCE_META[tags.relevance].chipClass}`}>
                                  {RELEVANCE_META[tags.relevance].label}
                                </span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full border ${CONFIDENTIALITY_META[tags.confidentiality].chipClass}`}>
                                  {CONFIDENTIALITY_META[tags.confidentiality].label}
                                </span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full border ${SOURCE_TYPE_META[tags.sourceType].chipClass}`}>
                                  {SOURCE_TYPE_META[tags.sourceType].label}
                                </span>
                                {tags.customNotes && (
                                  <span className="text-[10px] text-amber-300 font-sans">
                                    • {tags.customNotes}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="text-[10px] font-semibold text-slate-500 uppercase mr-1">Cited In Issues:</span>
                              {src.citedInIssues.map((issue, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                                >
                                  {issue}
                                </span>
                              ))}
                            </div>

                            <div className="text-[11px] text-amber-400/90 pt-1.5 border-t border-slate-800/80">
                              <strong className="text-slate-400">Singapore Statutory Connections: </strong>
                              {src.statutoryTies.join(', ')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PRECEDENTS USED */}
                {flawActiveTab === 'precedents' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      Binding Singapore apex court decisions and Singapore Statutes Online (SSO) grounding applied to this matter.
                    </p>
                    <div className="space-y-3">
                      {auditResult.statutoryPrecedentsUsed.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {item.type === 'statute' ? (
                                <Scale className="w-4 h-4 text-red-400" />
                              ) : (
                                <BookOpen className="w-4 h-4 text-amber-400" />
                              )}
                              <span className="font-bold text-white text-sm font-serif">
                                {item.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                              {item.citation}
                            </span>
                          </div>

                          <p className="text-slate-400 text-[11px]">
                            <strong>Authority: </strong>{item.courtOrAuthority}
                          </p>
                          <p className="text-slate-300 pt-1">
                            <strong>Application to Case: </strong>{item.applicationToCase}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Court Ruling */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Court Ruling</span>
            {ruling && !isHeldOut && (
              <span className="text-[10px] text-slate-400">Reference only: in the knowledge base, not used for testing</span>
            )}
          </div>
          {ruling && isHeldOut && (
            <button
              type="button"
              onClick={compareWithRuling}
              disabled={isComparingRuling || isRunningAudit}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold transition disabled:opacity-40 cursor-pointer"
            >
              {isComparingRuling ? 'Auditing and comparing...' : 'Audit and compare with ruling'}
            </button>
          )}
        </div>

        {rulingError && <p className="px-5 pt-4 text-xs text-rose-300">{rulingError}</p>}

        <div className="p-5 space-y-5 text-xs">
          {!ruling || !revealRuling ? (
            <p className="text-slate-400">
              {ruling
                ? 'Held-out test case. The ruling stays hidden until the audit has been run and compared, so the audit is not influenced by it.'
                : 'No court ruling is on file for this matter. Rulings are available for the judgments in the case library.'}
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase tracking-wide text-[11px]">Final decision</h4>
                <p className="text-slate-200 leading-relaxed">{ruling.finalDecision}</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase tracking-wide text-[11px]">Deciding factors</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  {ruling.decidingFactors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase tracking-wide text-[11px]">Influencing factors</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  {ruling.influencingFactors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wide text-[11px]">Audit points: used or ignored by the court</h4>
                {auditPoints.length === 0 && (
                  <p className="text-slate-400">Press "Audit and compare with ruling" to run the audit and check it against this ruling.</p>
                )}
                {auditPoints.map((point) => {
                  const result = comparisonById.get(point.id);
                  return (
                    <div
                      key={point.id}
                      className={`p-3 rounded-xl border space-y-1 ${
                        result?.status === 'used'
                          ? 'border-emerald-700 bg-emerald-950/30'
                          : result?.status === 'ignored'
                            ? 'border-rose-800 bg-rose-950/30'
                            : 'border-slate-800 bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-semibold text-slate-200">{point.side}: {point.title}</span>
                        {result ? (
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              result.status === 'used' ? 'bg-emerald-900 text-emerald-200' : 'bg-rose-900 text-rose-200'
                            }`}
                          >
                            {result.status === 'used' ? 'Used by court' : 'Ignored by court'}
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase text-slate-500">Not compared</span>
                        )}
                      </div>
                      {result && <p className="text-slate-400">{result.reason}</p>}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL: EDIT METADATA TAGS (FEATURE REQUIREMENT) */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-700/60 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base font-serif">
                  {t.editMetadataTags}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingFile(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Document:</span>
              <p className="font-semibold text-white truncate">{editingFile.fileName}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Folder: {editingFile.folderName}</p>
            </div>

            <form onSubmit={handleSaveTags} className="space-y-4">
              {/* Relevance Selector */}
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center justify-between">
                  <span>Relevance Rating:</span>
                  <span className="text-[10px] text-slate-400 font-normal">How decisive is this evidence?</span>
                </label>
                <select
                  value={editRelevance}
                  onChange={(e) => setEditRelevance(e.target.value as RelevanceTag)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="smoking_gun">⚡ Smoking Gun (Direct fatal admission / irrefutable breach)</option>
                  <option value="high">🔥 High Relevance (Governing clauses, explicit timeline proof)</option>
                  <option value="medium">⚖️ Medium (Supporting correspondence, background)</option>
                  <option value="contextual">🔍 Contextual (Industry customs, specifications)</option>
                  <option value="low">📄 Low (Ancillary administrative records)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1 italic">
                  {RELEVANCE_META[editRelevance].desc}
                </p>
              </div>

              {/* Confidentiality / Privilege Selector */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1 flex items-center justify-between">
                  <span>Confidentiality & Legal Privilege:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Singapore Evidence Act (Cap 97)</span>
                </label>
                <select
                  value={editConfidentiality}
                  onChange={(e) => setEditConfidentiality(e.target.value as ConfidentialityTag)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="without_prejudice">🔒 Without Prejudice (Evidence Act s 23 - Settlement Privilege)</option>
                  <option value="litigation_privilege">🛡️ Litigation Privilege (Dominant purpose of Singapore court proceedings)</option>
                  <option value="legal_advice_privilege">⚖️ Legal Advice Privilege (Advocate & Solicitor correspondence)</option>
                  <option value="counsel_eyes_only">👁️ Counsel Eyes Only (Subject to protective order)</option>
                  <option value="commercial_confidential">💼 Commercial Confidential (Trade secrets & sensitive pricing)</option>
                  <option value="open_evidence">📄 Open Evidence (Admissible and discoverable)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1 italic">
                  {CONFIDENTIALITY_META[editConfidentiality].desc}
                </p>
              </div>

              {/* Source Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-sky-300 mb-1">
                  Document Source Classification:
                </label>
                <select
                  value={editSourceType}
                  onChange={(e) => setEditSourceType(e.target.value as SourceTypeTag)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="email_thread">✉️ Email Thread (Contemporaneous correspondence)</option>
                  <option value="contract_rider">📜 Contract & Rider (Charterparty / Master Agreement)</option>
                  <option value="chat_log">💬 Instant Messaging (WhatsApp / WeChat / Teams logs)</option>
                  <option value="witness_statement">👤 Witness Statement (Deposition / Affidavit draft)</option>
                  <option value="financial_invoice">💵 Financial / Invoice (Bank statements, ledger records)</option>
                  <option value="regulatory_filing">🏛️ Regulatory / Port Authority (MPA logs, ACRA filings)</option>
                  <option value="expert_report">🔬 Expert Witness Report (Maritime surveyor / Forensic accounting)</option>
                </select>
              </div>

              {/* Custom Attorney Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Privileged Counsel Strategy Notes & Citations:
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Ask HR when the termination letter was actually sent"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingFile(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                >
                  {t.saveMetadataTags}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CASE FROM EMAIL TOPIC */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base font-serif">
                  {t.emailModalTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Import emails (.eml)</span>
                <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer">
                  Choose .eml files
                  <input type="file" accept=".eml,message/rfc822" multiple onChange={handleEmlFiles} className="hidden" />
                </label>
              </div>

              {importedEmails.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  Export emails from Outlook or Gmail as .eml files, then choose them here. Click an email to fill in the form below.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-800 rounded-xl p-2 bg-slate-950">
                  {importedEmails.map((email, index) => (
                    <button
                      key={`${email.fileName}-${index}`}
                      type="button"
                      onClick={() => selectImportedEmail(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition cursor-pointer ${
                        selectedEmailIndex === index
                          ? 'border-amber-500 bg-amber-950/40 text-white'
                          : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-semibold truncate">{email.subject}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {email.from}{email.date ? ` · ${email.date}` : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleParseEmailToCase} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Subject / Client Matter Title:
                </label>
                <input
                  type="text"
                  value={emailTopic}
                  onChange={(e) => setEmailTopic(e.target.value)}
                  placeholder={t.emailTopicPlaceholder}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sender (Client Contact):
                </label>
                <input
                  type="text"
                  value={emailSender}
                  onChange={(e) => setEmailSender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Raw Email Message Body / Instruction Memo:
                </label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder={t.emailBodyPlaceholder}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isParsingEmail}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                >
                  {isParsingEmail ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Extracting Issues & Creating Case...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.parseEmailButton}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW FOLDER */}
      {isAddFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-sm font-serif">
              Add New Discovery Folder
            </h3>
            <form onSubmit={handleAddFolder} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. 2_Employment_Contracts"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddFolderModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

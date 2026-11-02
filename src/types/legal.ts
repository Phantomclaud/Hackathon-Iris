export type Language = 'en' | 'zh' | 'ms' | 'ta';

export type UserMode = 'public' | 'corporate';

export type PublicSubMode = 'conversational' | 'advanced';

export type PublicCaseCategory =
  | 'employment'
  | 'tenancy'
  | 'consumer'
  | 'harassment'
  | 'small_claims'
  | 'contract'
  | 'negligence'
  | 'family_estate';

export interface PublicCaseInput {
  title: string;
  category: PublicCaseCategory;
  claimAmount?: number;
  incidentDate: string;
  opponentType: 'individual' | 'business' | 'employer' | 'landlord';
  description: string;
  evidenceHeld: string[];
  desiredOutcome: string;
}

export interface LegalOption {
  title: string;
  forum: string;
  costEstimate: string;
  timeframe: string;
  description: string;
  statuteReference: string;
  precedentCitation?: string;
  pros: string[];
  cons: string[];
}

export interface CaseFlaw {
  severity: 'high' | 'medium' | 'low';
  issue: string;
  impactOnCase: string;
  counterStrategy: string;
  legalBasis: string;
}

export interface RequiredEvidence {
  item: string;
  priority: 'essential' | 'recommended' | 'optional';
  purpose: string;
  howToObtain: string;
  evidenceActNote: string;
}

export interface PublicAnalysisResult {
  summary: string;
  overallMeritScore: number; // 0 - 100
  meritVerdict: string;
  limitationStatus: {
    isWithinPeriod: boolean;
    statutoryDeadlineYears: number;
    notes: string;
  };
  recommendedForums: LegalOption[];
  flawsIdentified: CaseFlaw[];
  evidenceChecklist: RequiredEvidence[];
  statutoryGrounding: {
    actTitle: string;
    section: string;
    summary: string;
    ssoLink?: string;
  }[];
  precedentCitations: {
    caseName: string;
    citation: string;
    principle: string;
    court: string;
  }[];
  actionPlan: {
    stepNumber: number;
    phase: string;
    action: string;
    deadlineNotice: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  statutoryCitations?: string[];
  precedentCitations?: string[];
  extractedCaseContext?: {
    category?: PublicCaseCategory;
    estimatedClaim?: number;
    likelyForum?: string;
    meritRating?: string;
  };
}

// Corporate Metadata Tagging Types
export type RelevanceTag =
  | 'smoking_gun'
  | 'high'
  | 'medium'
  | 'contextual'
  | 'low';

export type ConfidentialityTag =
  | 'without_prejudice'
  | 'litigation_privilege'
  | 'legal_advice_privilege'
  | 'counsel_eyes_only'
  | 'commercial_confidential'
  | 'open_evidence';

export type SourceTypeTag =
  | 'email_thread'
  | 'contract_rider'
  | 'chat_log'
  | 'witness_statement'
  | 'financial_invoice'
  | 'regulatory_filing'
  | 'expert_report';

export interface FileMetadataTags {
  relevance: RelevanceTag;
  confidentiality: ConfidentialityTag;
  sourceType: SourceTypeTag;
  customNotes?: string;
  assignedBy?: string;
}

export interface UploadedFileItem {
  id: string;
  folderName: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'email' | 'contract' | 'pleading' | 'evidence';
  sizeBytes: number;
  uploadedAt: string;
  metadata?: {
    emailFrom?: string;
    emailTo?: string;
    emailDate?: string;
    emailSubject?: string;
    pageCount?: number;
  };
  tags: FileMetadataTags;
  contentSummary: string;
}

export interface CorporateCase {
  id: string;
  referenceNumber: string;
  caseTitle: string;
  clientName: string;
  adverseParty: string;
  disputeValue: string;
  courtJurisdiction: string; // SICC / High Court (General Division) / State Courts / SIAC
  practiceArea: string;
  createdFromEmail?: boolean;
  dateCreated: string;
  folders: string[];
  files: UploadedFileItem[];
}

export interface DualSideFlawAnalysis {
  claimantFlaws: {
    id: string;
    title: string;
    severity: 'critical' | 'moderate' | 'minor';
    description: string;
    vulnerabilityQuote: string;
    sourceDocument: string;
    sourceCitation: string;
    sourceTags?: FileMetadataTags;
    opposingArgument: string;
    mitigationStrategy: string;
    statuteOrPrecedent: string;
  }[];
  respondentFlaws: {
    id: string;
    title: string;
    severity: 'critical' | 'moderate' | 'minor';
    description: string;
    vulnerabilityQuote: string;
    sourceDocument: string;
    sourceCitation: string;
    sourceTags?: FileMetadataTags;
    ourExploitationStrategy: string;
    statuteOrPrecedent: string;
  }[];
  sourceTracking: {
    id: string;
    docName: string;
    folder: string;
    date: string;
    tags: FileMetadataTags;
    citedInIssues: string[];
    relevanceGrade: 'Smoking Gun' | 'High' | 'Medium' | 'Low';
    statutoryTies: string[];
  }[];
  statutoryPrecedentsUsed: {
    type: 'statute' | 'case';
    title: string;
    citation: string;
    courtOrAuthority: string;
    applicationToCase: string;
  }[];
}

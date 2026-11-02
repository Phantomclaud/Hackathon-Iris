import {
  PublicCaseCategory,
  PublicCaseInput,
  PublicAnalysisResult,
  DualSideFlawAnalysis
} from '../types/legal';
import { SINGAPORE_STATUTES, SINGAPORE_PRECEDENTS } from '../data/singaporeLawData';

export interface LimitationCheckResult {
  isWithinPeriod: boolean;
  statutoryDeadlineYears: number;
  accrualDate: string;
  expiryDate: string;
  daysRemaining: number;
  notes: string;
}

export function calculateLimitationPeriod(
  incidentDateStr: string,
  category: PublicCaseCategory,
  targetForum: 'sct' | 'general' = 'general'
): LimitationCheckResult {
  const incidentDate = new Date(incidentDateStr);
  const now = new Date();

  // In Singapore law:
  // - Small Claims Tribunals Act (Cap 308) s 5(2): 2 years limitation
  // - Limitation Act (Cap 163) s 24A: Personal injury = 3 years
  // - Limitation Act (Cap 163) s 6(1): Contract & general torts = 6 years
  let statutoryYears = 6;
  if (targetForum === 'sct' || category === 'consumer' || category === 'small_claims') {
    statutoryYears = 2; // SCT specific limitation
  } else if (category === 'negligence') {
    statutoryYears = 3;
  } else if (category === 'employment') {
    statutoryYears = 1; // Under ECT/TADM claims generally within 1 year of dismissal
  }

  const expiryDate = new Date(incidentDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + statutoryYears);

  const diffTime = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isWithinPeriod = daysRemaining > 0;

  let notes = '';
  if (targetForum === 'sct') {
    notes = `Under Section 5(2) of the Small Claims Tribunals Act, actions must be lodged within 2 years of accrual.`;
  } else if (category === 'employment') {
    notes = `Under the Employment Claims Act, claims must be lodged with TADM within 1 year from the date the dispute arose (or within 6 months of termination for wrongful dismissal).`;
  } else if (category === 'negligence') {
    notes = `Under Section 24A of the Limitation Act (Cap 163), claims for negligence causing injury must be filed within 3 years.`;
  } else {
    notes = `Under Section 6(1) of the Limitation Act (Cap 163), actions founded on contract or tort must be brought within 6 years.`;
  }

  return {
    isWithinPeriod,
    statutoryDeadlineYears: statutoryYears,
    accrualDate: incidentDate.toISOString().split('T')[0],
    expiryDate: expiryDate.toISOString().split('T')[0],
    daysRemaining,
    notes
  };
}

export function determineSingaporeForum(
  category: PublicCaseCategory,
  claimAmount: number | undefined
): {
  primaryForum: string;
  costEstimate: string;
  timeframe: string;
  hasJurisdiction: boolean;
  notes: string;
} {
  const amount = claimAmount ?? 0;

  if (category === 'harassment') {
    return {
      primaryForum: 'Protection from Harassment Court (PHC) / State Courts',
      costEstimate: 'SGD $300 - $600 (Ex-parte application fee $200 + process service)',
      timeframe: 'Expedited Protection Orders (EPO) heard within 48-72 hours',
      hasJurisdiction: true,
      notes: 'Jurisdiction under POHA 2014 sections 12-13. Available for verbal harassment, online cyberbullying, stalking, or doxxing.'
    };
  }

  if (category === 'employment') {
    return {
      primaryForum: 'TADM Mediation followed by Employment Claims Tribunal (ECT)',
      costEstimate: 'SGD $10 - $60 for TADM mediation, $30 - $100 for ECT hearing',
      timeframe: 'Mediation within 4-6 weeks; ECT hearing within 2-3 months',
      hasJurisdiction: amount <= 30000,
      notes: 'Claims capped at $20,000 (or $30,000 for union members with Tripartite Mediation Framework assistance).'
    };
  }

  if (amount <= 20000 && ['tenancy', 'consumer', 'small_claims', 'contract'].includes(category)) {
    return {
      primaryForum: 'Small Claims Tribunals (SCT) - State Courts',
      costEstimate: 'SGD $10 - $50 (e-filing via Community Justice and Tribunals System - CJTS)',
      timeframe: 'Consultation within 10-14 days; Hearing within 3-6 weeks',
      hasJurisdiction: true,
      notes: 'No lawyers permitted under SCTA s 23. Covers tenancy agreements <= 2 years, sale of goods, and service contracts.'
    };
  }

  if (amount <= 30000 && ['tenancy', 'consumer', 'small_claims', 'contract'].includes(category)) {
    return {
      primaryForum: 'Small Claims Tribunals (SCT) via Memorandum of Consent',
      costEstimate: 'SGD $20 - $100 via CJTS',
      timeframe: 'Consultation within 2-3 weeks',
      hasJurisdiction: true,
      notes: 'Requires both parties to sign a Memorandum of Consent to extend jurisdiction from $20,000 to $30,000.'
    };
  }

  if (amount <= 60000) {
    return {
      primaryForum: "Magistrate's Court (State Courts of Singapore)",
      costEstimate: 'SGD $1,500 - $8,000 (simplified civil procedure under Rules of Court 2021)',
      timeframe: '6 - 9 months',
      hasJurisdiction: true,
      notes: 'Claims up to $60,000. Simplified civil process under Order 65 with early Single Application for Pending Matters.'
    };
  }

  if (amount <= 250000) {
    return {
      primaryForum: 'District Court (State Courts of Singapore)',
      costEstimate: 'SGD $8,000 - $25,000',
      timeframe: '9 - 14 months',
      hasJurisdiction: true,
      notes: 'Claims above $60,000 up to $250,000. Strict compliance with pre-action protocols under Rules of Court 2021.'
    };
  }

  return {
    primaryForum: 'General Division of the High Court (Singapore)',
    costEstimate: 'SGD $30,000+',
    timeframe: '12 - 18 months',
    hasJurisdiction: true,
    notes: 'Claims exceeding $250,000. Complex commercial litigation, cross-border or equitable remedies.'
  };
}

export function calculateCaseMeritScore(
  evidenceCount: number,
  hasContemporaneousDoc: boolean,
  isWithinLimitation: boolean,
  descriptionLength: number
): {
  score: number;
  verdict: string;
} {
  let score = 40; // Base baseline

  if (isWithinLimitation) {
    score += 15;
  } else {
    score -= 35; // Severe penalty for limitation lapse
  }

  // Evidence count weighting (Evidence Act s 103)
  if (evidenceCount >= 4) {
    score += 25;
  } else if (evidenceCount >= 2) {
    score += 15;
  } else if (evidenceCount === 1) {
    score += 8;
  }

  // Contemporaneous documentary evidence
  if (hasContemporaneousDoc) {
    score += 15;
  }

  // Factual articulation depth
  if (descriptionLength > 300) {
    score += 5;
  }

  score = Math.max(10, Math.min(95, score));

  let verdict = 'Moderate Case Merits';
  if (score >= 80) verdict = 'Strong Case with High Likelihood of Success';
  else if (score >= 65) verdict = 'Favorable Case Merits; Evidentiary Gaps Need Tightening';
  else if (score >= 45) verdict = 'Moderate Merits; Vulnerable to Opponent Counter-Arguments';
  else verdict = 'High Risk / Severe Evidentiary or Limitation Flaws';

  return { score, verdict };
}

export function parseIncomingEmailToCase(
  emailSubject: string,
  emailBody: string
): {
  caseTitle: string;
  adverseParty: string;
  clientName: string;
  practiceArea: string;
  disputeValue: string;
  courtJurisdiction: string;
  keyIssuesIdentified: string[];
  urgencyLevel: 'High' | 'Normal' | 'Critical';
} {
  const combined = `${emailSubject} \n ${emailBody}`.toLowerCase();

  let practiceArea = 'Commercial Dispute';
  let courtJurisdiction = 'General Division of the High Court';
  let disputeValue = 'SGD 350,000';
  let urgencyLevel: 'High' | 'Normal' | 'Critical' = 'Normal';

  if (combined.includes('charter') || combined.includes('demurrage') || combined.includes('vessel') || combined.includes('cargo')) {
    practiceArea = 'Maritime & Shipping Arbitration / Litigation';
    courtJurisdiction = 'Singapore International Commercial Court (SICC)';
    disputeValue = 'USD 850,000';
  } else if (combined.includes('tenant') || combined.includes('lease') || combined.includes('deposit') || combined.includes('rent')) {
    practiceArea = 'Real Estate & Tenancy Dispute';
    courtJurisdiction = 'Small Claims Tribunals / District Court';
    disputeValue = 'SGD 45,000';
  } else if (combined.includes('shareholder') || combined.includes('director') || combined.includes('oppression') || combined.includes('board')) {
    practiceArea = 'Corporate Governance & Minority Oppression';
    courtJurisdiction = 'General Division of the High Court';
    disputeValue = 'SGD 1,200,000';
  } else if (combined.includes('employment') || combined.includes('salary') || combined.includes('overtime') || combined.includes('dismissal')) {
    practiceArea = 'Employment & Labor Law';
    courtJurisdiction = 'Employment Claims Tribunal (ECT)';
    disputeValue = 'SGD 28,000';
  } else if (combined.includes('software') || combined.includes('ip') || combined.includes('copyright') || combined.includes('patent')) {
    practiceArea = 'Intellectual Property & Technology Litigation';
    courtJurisdiction = 'General Division of High Court (Specialist IP List)';
    disputeValue = 'SGD 600,000';
  }

  if (combined.includes('urgent') || combined.includes('injunction') || combined.includes('freeze') || combined.includes('immediate')) {
    urgencyLevel = 'Critical';
  } else if (combined.includes('deadline') || combined.includes('7 days') || combined.includes('demand')) {
    urgencyLevel = 'High';
  }

  // Extract client and adverse party heuristics
  let adverseParty = 'Counterparty Named in Correspondence';
  let clientName = 'Instructing Client';

  const toMatch = emailBody.match(/to:\s*([^\n]+)/i);
  const fromMatch = emailBody.match(/from:\s*([^\n]+)/i);

  if (fromMatch && fromMatch[1]) {
    clientName = fromMatch[1].trim();
  }
  if (toMatch && toMatch[1]) {
    adverseParty = toMatch[1].trim();
  }

  const keyIssuesIdentified: string[] = [];
  if (combined.includes('breach') || combined.includes('violation')) {
    keyIssuesIdentified.push('Breach of primary contractual obligation');
  }
  if (combined.includes('payment') || combined.includes('invoice') || combined.includes('withheld')) {
    keyIssuesIdentified.push('Failure to remit payment under agreed contractual terms');
  }
  if (combined.includes('notice') || combined.includes('terminated')) {
    keyIssuesIdentified.push('Validity of termination and sufficiency of contractual notice');
  }
  if (combined.includes('damage') || combined.includes('loss')) {
    keyIssuesIdentified.push('Quantification of loss and duty to mitigate under Singapore common law');
  }
  if (keyIssuesIdentified.length === 0) {
    keyIssuesIdentified.push('Repudiatory breach of agreement', 'Pre-action discovery obligations under ROC 2021');
  }

  return {
    caseTitle: emailSubject ? `Matter: ${emailSubject.replace(/^(re:|fwd:)\s*/i, '')}` : 'New Singapore Commercial Dispute',
    adverseParty,
    clientName,
    practiceArea,
    disputeValue,
    courtJurisdiction,
    keyIssuesIdentified,
    urgencyLevel
  };
}

export function synthesizePublicAnalysis(input: PublicCaseInput): PublicAnalysisResult {
  const lim = calculateLimitationPeriod(input.incidentDate, input.category, 'sct');
  const forum = determineSingaporeForum(input.category, input.claimAmount);
  const evidenceCount = input.evidenceHeld.length;
  const hasDoc = input.evidenceHeld.some(e =>
    /contract|agreement|receipt|invoice|statement|letter/i.test(e)
  );
  const merit = calculateCaseMeritScore(
    evidenceCount,
    hasDoc,
    lim.isWithinPeriod,
    input.description.length
  );

  // Relevant statutes and precedents
  const relevantStatutes = SINGAPORE_STATUTES.filter(s => {
    if (input.category === 'employment') return s.shortCode === 'EA';
    if (input.category === 'harassment') return s.shortCode === 'POHA';
    if (input.category === 'consumer') return s.shortCode === 'CPFTA' || s.shortCode === 'SCTA';
    if (input.category === 'tenancy') return s.shortCode === 'SCTA' || s.shortCode === 'CLA';
    return s.shortCode === 'SCTA' || s.shortCode === 'EA 1893' || s.shortCode === 'LA';
  });

  const relevantPrecedents = SINGAPORE_PRECEDENTS.filter(p => {
    if (input.category === 'negligence') return p.id === 'prec-spandeck' || p.id === 'prec-surender-singh';
    if (input.category === 'harassment') return p.id === 'prec-sim-cheng-run';
    if (input.category === 'consumer' || input.category === 'contract') return p.id === 'prec-chwee-kin-keong';
    return p.court === 'SGCA';
  });

  // Flaws
  const flaws = [];
  if (!hasDoc) {
    flaws.push({
      severity: 'high' as const,
      issue: 'Absence of contemporaneous written contract or formal documentation',
      impactOnCase: 'Under Section 103 of the Evidence Act (Cap 97), the burden of proof is on you. Oral agreements require substantial corroborative evidence.',
      counterStrategy: 'Subpoena or tender contemporaneous WhatsApp chat histories, emails, or bank records evidencing mutual assent.',
      legalBasis: 'Evidence Act (Cap 97) s 103 & Civil Law Act s 6'
    });
  }

  if (!input.evidenceHeld.some(e => /photo|video|log|cctv|card|inspect/i.test(e))) {
    flaws.push({
      severity: 'medium' as const,
      issue: 'Lack of dated physical or digital baseline records',
      impactOnCase: 'The respondent may argue pre-existing defects or dispute the condition at handover.',
      counterStrategy: 'Obtain service inspection reports, timestamped metadata from smartphone camera files, or third-party tradesman quotes.',
      legalBasis: 'Surender Singh v CapitaLand Commercial Management Ltd [2014] 4 SLR 730'
    });
  }

  flaws.push({
    severity: 'low' as const,
    issue: 'Potential failure to serve formal Written Letter of Demand before lodging',
    impactOnCase: 'Tribunals and courts favor parties who attempt amicable settlement and provide reasonable notice before legal action.',
    counterStrategy: 'Issue a formal Letter of Demand giving 7-14 days for settlement via registered post or tracked courier before filing.',
    legalBasis: 'Singapore Rules of Court 2021 Order 5 (Ideals of Justice & Alternative Dispute Resolution)'
  });

  // Evidence Checklist
  const evidenceChecklist = [
    {
      item: 'Formal Written Agreement / Contract / Invoices',
      priority: 'essential' as const,
      purpose: 'Proves privity of contract, agreed terms, and monetary obligations.',
      howToObtain: 'Locate original executed PDF or paper contract with signature.',
      evidenceActNote: 'Primary documentary evidence under Evidence Act s 64.'
    },
    {
      item: 'Contemporaneous Digital Communications (WhatsApp / Emails)',
      priority: 'essential' as const,
      purpose: 'Demonstrates timely notification of breach and establishes timeline of dispute.',
      howToObtain: 'Export entire chat threads with date/time stamps and phone numbers visible.',
      evidenceActNote: 'Admissible electronic records under Evidence Act s 116A.'
    },
    {
      item: 'Financial Proof of Payment / Bank Statements / Pay slips',
      priority: 'essential' as const,
      purpose: 'Quantifies exact financial losses and verifies transactional consideration.',
      howToObtain: 'Download official bank statements or FAST/PayNow transaction slips.',
      evidenceActNote: 'Corroborates quantum of damages sought.'
    },
    {
      item: 'Formal Written Notice of Demand (LOD)',
      priority: 'recommended' as const,
      purpose: 'Establishes clear notice, sets final deadline, and prevents surprise.',
      howToObtain: 'Send drafted letter via SingPost Registered Mail with tracking code.',
      evidenceActNote: 'Demonstrates procedural reasonableness and compliance with ADR.'
    }
  ];

  // Action plan
  const actionPlan = [
    {
      stepNumber: 1,
      phase: 'Pre-Action Preparation',
      action: 'Consolidate all contracts, WhatsApp logs, bank transfers, and photos into chronological exhibit bundle.',
      deadlineNotice: 'Within 3 days'
    },
    {
      stepNumber: 2,
      phase: 'Formal Notice of Demand',
      action: 'Send a formal Letter of Demand (LOD) demanding restitution within 7 to 14 business days.',
      deadlineNotice: 'Within 7 days'
    },
    {
      stepNumber: 3,
      phase: 'Tribunal Lodgement via CJTS / TADM',
      action: `File claim with ${forum.primaryForum} via Community Justice and Tribunals System (CJTS) or online e-Services.`,
      deadlineNotice: 'Before statutory limitation expiry'
    },
    {
      stepNumber: 4,
      phase: 'Mediation / Consultation',
      action: 'Attend court-directed mediation or consultation session. Present exhibit bundle and evidence checklist.',
      deadlineNotice: 'Scheduled within 10-21 days of filing'
    }
  ];

  return {
    summary: `Analysis of ${input.title}: Dispute categorized under ${input.category.toUpperCase()} against ${input.opponentType}. Total monetary claim: SGD $${(input.claimAmount ?? 0).toLocaleString()}. Primary recommended venue is ${forum.primaryForum}. Case demonstrates a viability score of ${merit.score}/100.`,
    overallMeritScore: merit.score,
    meritVerdict: merit.verdict,
    limitationStatus: {
      isWithinPeriod: lim.isWithinPeriod,
      statutoryDeadlineYears: lim.statutoryDeadlineYears,
      notes: lim.notes
    },
    recommendedForums: [
      {
        title: forum.primaryForum,
        forum: forum.primaryForum,
        costEstimate: forum.costEstimate,
        timeframe: forum.timeframe,
        description: forum.notes,
        statuteReference: relevantStatutes[0]?.actTitle || 'State Courts Act 1970',
        precedentCitation: relevantPrecedents[0]?.citation,
        pros: ['Cost effective and swift adjudication', 'Informal proceedings designed for prompt resolution'],
        cons: ['Subject to statutory monetary caps', 'Strict limitation deadlines']
      }
    ],
    flawsIdentified: flaws,
    evidenceChecklist,
    statutoryGrounding: relevantStatutes.map(s => ({
      actTitle: s.actTitle,
      section: s.keySections[0]?.section || 'Core Provisions',
      summary: s.keySections[0]?.description || s.primaryForum,
      ssoLink: s.ssoUrl
    })),
    precedentCitations: relevantPrecedents.map(p => ({
      caseName: p.caseName,
      citation: p.citation,
      principle: p.ratioDecidendi,
      court: p.court
    })),
    actionPlan
  };
}

export interface PublicInfodumpClassification {
  detectedCategory: PublicCaseCategory;
  categoryLabel: string;
  opponentType: 'individual' | 'business' | 'employer' | 'landlord';
  extractedAmount?: number;
  likelyForum: string;
  keyLegalRights: string[];
  suggestedQuestions: string[];
  initialResponse: string;
}

export function classifyPublicInfodump(narrativeText: string): PublicInfodumpClassification {
  const text = narrativeText.toLowerCase();

  // Extract dollar amount if present (supports $, SGD, dollars, bucks, 新币, 元, etc.)
  let extractedAmount: number | undefined;
  const amountMatch = narrativeText.match(/(?:\$|sgd|rm|新币|元)\s*([\d,]+(?:\.\d{2})?)|([\d,]+)\s*(?:dollars|sgd|bucks|新币|元)/i);
  if (amountMatch) {
    const rawNum = (amountMatch[1] || amountMatch[2]).replace(/,/g, '');
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed) && parsed > 0) {
      extractedAmount = parsed;
    }
  }

  // Heuristic topic matching for Singapore Law (Multilingual: EN, ZH, MS, TA)
  if (
    text.includes('landlord') ||
    text.includes('tenant') ||
    text.includes('rent') ||
    text.includes('deposit') ||
    text.includes('lease') ||
    text.includes('hdb') ||
    text.includes('condo') ||
    text.includes('flat') ||
    text.includes('wear and tear') ||
    text.includes('房东') ||
    text.includes('房客') ||
    text.includes('租客') ||
    text.includes('押金') ||
    text.includes('租金') ||
    text.includes('退租') ||
    text.includes('退房') ||
    text.includes('磨损') ||
    text.includes('tuan rumah') ||
    text.includes('penyewa') ||
    text.includes('sewa') ||
    text.includes('cagaran') ||
    text.includes('வாடகை') ||
    text.includes('முன்பணம்')
  ) {
    return {
      detectedCategory: 'tenancy',
      categoryLabel: 'Tenancy & Rental Deposit Dispute',
      opponentType: 'landlord',
      extractedAmount: extractedAmount ?? 3500,
      likelyForum: 'Small Claims Tribunals (SCT) - State Courts (Claims up to $20,000 / $30,000)',
      keyLegalRights: [
        'Landlords cannot forfeit deposits for reasonable fair wear and tear under Singapore common law.',
        'No legal representation allowed at SCT (SCTA s 23), making it fast and low-cost ($10-$50).',
        'Handover photographic inspection logs are vital primary documentary evidence.'
      ],
      suggestedQuestions: [
        'Did you take move-in and move-out condition photos or videos?',
        'Does your tenancy agreement contain a specific damage deduction clause?',
        'Have you issued a formal written Notice of Demand giving a 7-day refund deadline?'
      ],
      initialResponse: `I've analyzed your situation under Singapore tenancy law. It sounds like a residential tenancy dispute involving deposit withholding. Under Singapore law and standard CEA tenancy terms, a landlord has no right to deduct your security deposit for fair wear and tear. You can file an expedited claim at the Small Claims Tribunal (SCT) via CJTS for a nominal fee of $10 to $50 without needing a lawyer.`
    };
  }

  if (
    text.includes('boss') ||
    text.includes('employer') ||
    text.includes('company') ||
    text.includes('salary') ||
    text.includes('overtime') ||
    text.includes('fired') ||
    text.includes('terminated') ||
    text.includes('dismiss') ||
    text.includes('notice period') ||
    text.includes('mom') ||
    text.includes('cpf') ||
    text.includes('老板') ||
    text.includes('雇主') ||
    text.includes('公司') ||
    text.includes('薪水') ||
    text.includes('工资') ||
    text.includes('加班') ||
    text.includes('开除') ||
    text.includes('解雇') ||
    text.includes('辞退') ||
    text.includes('majikan') ||
    text.includes('pekerja') ||
    text.includes('gaji') ||
    text.includes('lebih masa') ||
    text.includes('pecat') ||
    text.includes('முதலாளி') ||
    text.includes('ஊதியம்') ||
    text.includes('வேலை')
  ) {
    return {
      detectedCategory: 'employment',
      categoryLabel: 'Employment, Wrongful Dismissal & Salary Claim',
      opponentType: 'employer',
      extractedAmount: extractedAmount ?? 4200,
      likelyForum: 'Tripartite Alliance for Dispute Management (TADM) & Employment Claims Tribunal (ECT)',
      keyLegalRights: [
        'Employees under Part IV of the Employment Act 1968 are entitled to 1.5x overtime pay for work beyond 44 hours/week.',
        'Termination without contractual notice requires salary in lieu of notice (Employment Act s 10-11).',
        'Wrongful dismissal claims must be lodged with TADM within 1 month of your last day.'
      ],
      suggestedQuestions: [
        'What was your basic monthly salary (is it <= $2,600 or <= $4,500 for workmen)?',
        'Did your employer provide written reasons or conduct an inquiry prior to termination?',
        'Do you have timesheets, biometric logs, or WhatsApp messages showing instructed overtime?'
      ],
      initialResponse: `I've reviewed your employment situation under the Singapore Employment Act 1968. If your employer terminated you abruptly or failed to pay agreed overtime/salary in lieu of notice, you have strong statutory protection. You should file for mediation with TADM within 1 month of termination before escalating to the Employment Claims Tribunal (ECT).`
    };
  }

  if (
    text.includes('bought') ||
    text.includes('seller') ||
    text.includes('shop') ||
    text.includes('merchant') ||
    text.includes('laptop') ||
    text.includes('phone') ||
    text.includes('carousell') ||
    text.includes('shopee') ||
    text.includes('lazada') ||
    text.includes('refund') ||
    text.includes('defective') ||
    text.includes('faulty') ||
    text.includes('lemon law') ||
    text.includes('broken') ||
    text.includes('卖家') ||
    text.includes('买到') ||
    text.includes('网购') ||
    text.includes('退款') ||
    text.includes('坏了') ||
    text.includes('瑕疵') ||
    text.includes('故障') ||
    text.includes('penjual') ||
    text.includes('beli') ||
    text.includes('rosak') ||
    text.includes('wang dikembalikan') ||
    text.includes('வாங்கிய') ||
    text.includes('விற்பனையாளர்') ||
    text.includes('பழுது')
  ) {
    return {
      detectedCategory: 'consumer',
      categoryLabel: 'Consumer Protection & Lemon Law Dispute',
      opponentType: 'business',
      extractedAmount: extractedAmount ?? 2850,
      likelyForum: 'Small Claims Tribunals (SCT) & CASE Mediation',
      keyLegalRights: [
        'Consumer Protection (Fair Trading) Act 2003 Lemon Law presumes goods failing within 6 months were defective at delivery.',
        'Merchant disclaimers like "All Sales Final" are void against unfair trade practices under CPFTA s 13.',
        'You have the statutory right to demand repair, replacement, or a full refund.'
      ],
      suggestedQuestions: [
        'Did the defect manifest within 6 months of delivery?',
        'Do you have an authorized technician or service report certifying the manufacturing fault?',
        'Did the seller refuse in writing via email or chat?'
      ],
      initialResponse: `I've reviewed your consumer purchase under Singapore's Lemon Law (CPFTA 2003). In Singapore, retailers cannot hide behind "no refund" fine print if the product suffers an inherent defect within 6 months. You are legally entitled to repair, replacement, or refund at the Small Claims Tribunal.`
    };
  }

  if (
    text.includes('neighbour') ||
    text.includes('neighbor') ||
    text.includes('corridor') ||
    text.includes('spotlight') ||
    text.includes('stalk') ||
    text.includes('harass') ||
    text.includes('scold') ||
    text.includes('insult') ||
    text.includes('yell') ||
    text.includes('doxx') ||
    text.includes('scared') ||
    text.includes('threat') ||
    text.includes('邻居') ||
    text.includes('骚扰') ||
    text.includes('跟踪') ||
    text.includes('威胁') ||
    text.includes('恐吓') ||
    text.includes('辱骂') ||
    text.includes('走廊') ||
    text.includes('jiran') ||
    text.includes('ugut') ||
    text.includes('kacau') ||
    text.includes('gangguan') ||
    text.includes('துன்புறுத்தல்') ||
    text.includes('அச்சுறுத்தல்')
  ) {
    return {
      detectedCategory: 'harassment',
      categoryLabel: 'Protection from Harassment (POHA)',
      opponentType: 'individual',
      extractedAmount: 0,
      likelyForum: 'Protection from Harassment Court (PHC) - State Courts',
      keyLegalRights: [
        'POHA 2014 Sections 3 & 4 make causing intentional harassment, alarm, or distress an actionable civil and criminal offence.',
        'Victims can apply for an urgent Expedited Protection Order (EPO) within 48 to 72 hours.',
        'Protection from Harassment Court can issue mandatory stop-orders and damages up to $20,000.'
      ],
      suggestedQuestions: [
        'Do you have CCTV, audio recordings, or timestamped decibel logs of the harassment?',
        'Have you filed police reports (NP299) or attempted Community Mediation Centre (CMC) resolution?',
        'Is the conduct threatening immediate physical violence or recurring nightly?'
      ],
      initialResponse: `I understand this is distressing. In Singapore, continuous harassment or aggressive intimidation by neighbours is prohibited under the Protection from Harassment Act (POHA) 2014. You can apply ex-parte to the Protection from Harassment Court for an Expedited Protection Order (EPO) that takes effect within 48-72 hours.`
    };
  }

  // Default general dispute
  return {
    detectedCategory: 'small_claims',
    categoryLabel: 'Civil / Small Claims Dispute',
    opponentType: 'business',
    extractedAmount: extractedAmount ?? 2000,
    likelyForum: 'Small Claims Tribunals (State Courts of Singapore)',
    keyLegalRights: [
      'Singapore civil disputes under $20,000 can be resolved swiftly via the Small Claims Tribunals.',
      'Burden of proof lies on the claimant on a balance of probabilities under Evidence Act s 103.',
      'Limitation period is 2 years for SCT claims and 6 years for general civil claims under Limitation Act Cap 163.'
    ],
    suggestedQuestions: [
      'What were the agreed terms or promises made between both parties?',
      'Do you have written proof (invoices, WhatsApp chats, or bank transfer receipts)?',
      'Have you issued a written notice demanding settlement?'
    ],
    initialResponse: `Thank you for sharing your situation. Iris has logged your facts under Singapore civil law. To help you evaluate the best course of action and likelihood of recovery, let's explore your evidence and timeline.`
  };
}

export function synthesizeCorporateDualSideAudit(caseData: any): DualSideFlawAnalysis {
  return {
    claimantFlaws: [
      {
        id: 'c-flaw-1',
        title: 'Delayed Tender of Rejection Notice (Failure to Mitigate)',
        severity: 'critical',
        description: 'Claimant delayed formal rejection of Respondent Tuas alternative discharge proposal by 11 days (4 May to 15 May 2026), during which demurrage accrued at USD 18,000/day ($198,000).',
        vulnerabilityQuote: '"ops@vanguardmarine.sg took 11 calendar days to formally reject the Tuas berth alternative proposal without justification."',
        sourceDocument: 'Folder: 2_Email_Correspondence_Chains / Email_Thread_Mitigation_Discussion_May2026.eml',
        sourceCitation: 'Page 2, Paras 4-7 (Timestamp: 2026-05-04 11:05 SGT)',
        sourceTags: {
          relevance: 'medium',
          confidentiality: 'without_prejudice',
          sourceType: 'email_thread',
          customNotes: 'Without prejudice settlement negotiations regarding Tuas berth alternative.'
        },
        opposingArgument: 'Respondent will assert Claimant breached duty to mitigate damages under Singapore common law and cannot claim demurrage for the 11-day delay period.',
        mitigationStrategy: 'Lead expert evidence demonstrating Tuas berth draft depth was unsafe for vessel draft under cl 7 of BIMCO Charterparty, justifying the technical review period.',
        statuteOrPrecedent: 'The "Solholt" [1983] 1 Lloyd\'s Rep 605; Spandeck Engineering [2007] 4 SLR(R) 100'
      },
      {
        id: 'c-flaw-2',
        title: 'Ambiguity in Notice of Readiness (NOR) Free Pratique Verification',
        severity: 'moderate',
        description: 'MPA port log indicates free pratique granted 45 minutes after NOR email tender, creating technical invalidity argument under charterparty cl 9.',
        vulnerabilityQuote: '"Notice of Readiness tendered at 08:00 hrs; Port Health clearance stamped at 08:45 hrs."',
        sourceDocument: 'Folder: 3_Port_Logs_and_NOR / Jurong_Port_Master_Log_April_2026.pdf',
        sourceCitation: 'Page 1, Entry 14B (Timestamp: 11 April 2026 08:00 - 08:45 hrs)',
        sourceTags: {
          relevance: 'high',
          confidentiality: 'open_evidence',
          sourceType: 'regulatory_filing',
          customNotes: 'Official MPA log entry admissible as public register record under Evidence Act s 35.'
        },
        opposingArgument: 'Respondent may argue premature NOR was invalid ab initio under The "Mexico 1" [1990] 1 Lloyd\'s Rep 507.',
        mitigationStrategy: 'Cite subsequent acceptance of berth allocation by Respondent operations on 12 April as waiver/estoppel of preliminary NOR defect.',
        statuteOrPrecedent: 'The "Happy Day" [2002] 2 Lloyd\'s Rep 487 (Doctrine of implied acceptance of NOR)'
      }
    ],
    respondentFlaws: [
      {
        id: 'r-flaw-1',
        title: 'Express Written Admission of Vessel Arrival and Laycan Compliance',
        severity: 'critical',
        description: 'Respondent chartering director expressly admitted vessel arrived within laycan and conceded the delay was due to third-party berth occupation.',
        vulnerabilityQuote: '"We acknowledge vessel arrived within laycan on 10 April, but berth was occupied by third party. We are working to clear."',
        sourceDocument: 'Folder: 2_Email_Correspondence_Chains / Email_Thread_Bunker_Notice_April2026.eml',
        sourceCitation: 'Page 1, Paragraph 3 (Timestamp: 2026-04-12 14:32 SGT)',
        sourceTags: {
          relevance: 'smoking_gun',
          confidentiality: 'open_evidence',
          sourceType: 'email_thread',
          customNotes: 'Explicit admission by Respondent admitting vessel arrived within laycan.'
        },
        ourExploitationStrategy: 'Introduce this email as an unequivocal admission of liability under Section 17 & 18 of the Evidence Act (Cap 97). Disproves Respondent defense of late arrival.',
        statuteOrPrecedent: 'Evidence Act 1893 s 17-21 (Admissions by party opponents); Chwee Kin Keong [2005] 1 SLR(R) 502'
      },
      {
        id: 'r-flaw-2',
        title: 'Failure to Serve Contemporaneous Protest on Demurrage Rate Calculation',
        severity: 'moderate',
        description: 'Respondent failed to dispute Claimant weekly demurrage statements served between April and June 2026, creating an estoppel by silence / convention.',
        vulnerabilityQuote: '"No objection or alternative demurrage timesheet received within the 30-day contractual protest window under cl 18(b)."',
        sourceDocument: 'Folder: 1_Contracts_and_Riders / BIMCO_Gencon_Charterparty_Dated_14_Jan_2026.pdf',
        sourceCitation: 'Clause 18(b), Page 4',
        sourceTags: {
          relevance: 'high',
          confidentiality: 'commercial_confidential',
          sourceType: 'contract_rider',
          customNotes: 'Governing agreement, cl 18 demurrage, cl 24 Singapore law.'
        },
        ourExploitationStrategy: 'Bar Respondent from disputing laytime calculations at trial pursuant to contractually mandated time-bar clause.',
        statuteOrPrecedent: 'Singapore Court of Appeal in PT Perusahaan Gas Negara [2015] 4 SLR 364 & Civil Law Act s 6'
      }
    ],
    sourceTracking: [
      {
        id: 'src-1',
        docName: 'BIMCO_Gencon_Charterparty_Dated_14_Jan_2026.pdf',
        folder: '1_Contracts_and_Riders',
        date: '2026-01-14',
        tags: {
          relevance: 'high',
          confidentiality: 'commercial_confidential',
          sourceType: 'contract_rider',
          customNotes: 'Governing agreement, clause 18 demurrage provisions.'
        },
        citedInIssues: ['Governing law cl 24', 'Demurrage rate cl 18', 'Protest time-bar cl 18(b)'],
        relevanceGrade: 'High',
        statutoryTies: ['Civil Law Act s 6', 'SICC Order 110']
      },
      {
        id: 'src-2',
        docName: 'Email_Thread_Bunker_Notice_April2026.eml',
        folder: '2_Email_Correspondence_Chains',
        date: '2026-04-12',
        tags: {
          relevance: 'smoking_gun',
          confidentiality: 'open_evidence',
          sourceType: 'email_thread',
          customNotes: 'Party admission by Respondent acknowledging vessel laycan arrival (Evidence Act s 17).'
        },
        citedInIssues: ['Respondent admission of laycan compliance', 'Berth congestion responsibility'],
        relevanceGrade: 'Smoking Gun',
        statutoryTies: ['Evidence Act s 17', 'Evidence Act s 116A']
      },
      {
        id: 'src-3',
        docName: 'Email_Thread_Mitigation_Discussion_May2026.eml',
        folder: '2_Email_Correspondence_Chains',
        date: '2026-05-04',
        tags: {
          relevance: 'medium',
          confidentiality: 'without_prejudice',
          sourceType: 'email_thread',
          customNotes: 'Without prejudice settlement negotiations regarding Tuas berth alternative.'
        },
        citedInIssues: ['Claimant delay in responding to Tuas proposal', 'Mitigation of damages'],
        relevanceGrade: 'Medium',
        statutoryTies: ['Common Law Duty to Mitigate', 'Spandeck Duty of Care']
      },
      {
        id: 'src-4',
        docName: 'Jurong_Port_Master_Log_April_2026.pdf',
        folder: '3_Port_Logs_and_NOR',
        date: '2026-04-11',
        tags: {
          relevance: 'high',
          confidentiality: 'open_evidence',
          sourceType: 'regulatory_filing',
          customNotes: 'Official MPA timestamp record admissible under Evidence Act s 35.'
        },
        citedInIssues: ['NOR timestamp', 'Free pratique timing gap'],
        relevanceGrade: 'High',
        statutoryTies: ['Evidence Act s 35 (Public Records)']
      },
      {
        id: 'src-5',
        docName: 'Formal_Notice_of_Demand_Dated_15_June_2026.pdf',
        folder: '4_Pleadings_and_Demands',
        date: '2026-06-15',
        tags: {
          relevance: 'high',
          confidentiality: 'litigation_privilege',
          sourceType: 'witness_statement',
          customNotes: 'Pre-action protocol letter of demand under ROC 2021.'
        },
        citedInIssues: ['Statutory demand', 'Interest reservation under CLA s 30A'],
        relevanceGrade: 'High',
        statutoryTies: ['Rules of Court 2021 Order 5', 'Civil Law Act s 30A']
      }
    ],
    statutoryPrecedentsUsed: [
      {
        type: 'statute',
        title: 'Evidence Act 1893 (Cap 97)',
        citation: 'Sections 17-21, 64, 116A',
        courtOrAuthority: 'Parliament of Singapore / SSO',
        applicationToCase: 'Governs admissibility of Respondent email admissions and digital MPA port master logs as authentic electronic records.'
      },
      {
        type: 'statute',
        title: 'Civil Law Act 1909 (Cap 43)',
        citation: 'Section 6 & Section 30A',
        courtOrAuthority: 'Parliament of Singapore / SSO',
        applicationToCase: 'Statutory basis for contractual enforceability and entitlement to post-judgment commercial interest.'
      },
      {
        type: 'case',
        title: 'Spandeck Engineering (S) Pte Ltd v Defence Science & Technology Agency',
        citation: '[2007] 4 SLR(R) 100',
        courtOrAuthority: 'Singapore Court of Appeal (SGCA)',
        applicationToCase: 'Standard for tortious economic loss and proximity in operational oversight.'
      },
      {
        type: 'case',
        title: 'Chwee Kin Keong v Digilandmall.com Pte Ltd',
        citation: '[2005] 1 SLR(R) 502',
        courtOrAuthority: 'Singapore Court of Appeal (SGCA)',
        applicationToCase: 'Establishes principles of electronic correspondence contract formation and objective manifestation of intent.'
      },
      {
        type: 'case',
        title: 'PT Perusahaan Gas Negara v CRW Joint Operation',
        citation: '[2015] 4 SLR 364',
        courtOrAuthority: 'Singapore Court of Appeal (SGCA)',
        applicationToCase: 'Enforceability of dispute resolution clauses and commercial time-bars in international agreements.'
      }
    ]
  };
}

export function getLocalizedInfodumpInitialReply(
  classification: PublicInfodumpClassification,
  language: 'en' | 'zh' | 'ms' | 'ta' = 'en'
): string {
  const cat = classification.detectedCategory;

  if (cat === 'tenancy') {
    switch (language) {
      case 'zh':
        return '我已根据新加坡租赁与房屋法令分析了您的情况。这属于租赁押金扣留争议。根据新加坡普通法及标准租赁协议，房东无权因正常自然磨损（fair wear and tear）扣除您的押金。您可以向新加坡国家法院下属的小额索偿法庭（SCT）通过CJTS系统提起申诉，费用仅需10至50新币，无需聘请律师。';
      case 'ms':
        return 'Saya telah menganalisis situasi anda di bawah undang-undang sewaan Singapura. Ini merupakan pertikaian penahanan deposit. Di bawah undang-undang Singapura, tuan rumah tidak berhak memotong deposit untuk kehausan wajar. Anda boleh memfailkan tuntutan di Tribunal Tuntutan Kecil (SCT) melalui CJTS dengan yuran $10 hingga $50 tanpa memerlukan peguam.';
      case 'ta':
        return 'சிங்கப்பூர் வாடகைச் சட்டத்தின் கீழ் உங்கள் நிலையை நான் மதிப்பாய்வு செய்துள்ளேன். இது முன்பணத்தைத் திரும்பப் பெறாதது தொடர்பான தகராறாகும். சிங்கப்பூர் சட்டத்தின்படி, இயல்பான தேய்மானத்திற்காக உங்கள் முன்பணத்தைப் பிடித்தம் செய்ய வீட்டு உரிமையாளருக்கு உரிமை இல்லை. நீங்கள் வழக்கறிஞர் இல்லாமலேயே CJTS மூலம் சிறு உரிமை தீர்ப்பாயத்தில் (SCT) $10 முதல் $50 வரையிலான கட்டணத்தில் மனு செய்யலாம்.';
      default:
        return classification.initialResponse || "I've analyzed your situation under Singapore tenancy law. It sounds like a residential tenancy dispute involving deposit withholding. Under Singapore law and standard CEA tenancy terms, a landlord has no right to deduct your security deposit for fair wear and tear. You can file an expedited claim at the Small Claims Tribunal (SCT) via CJTS for a nominal fee of $10 to $50 without needing a lawyer.";
    }
  }

  if (cat === 'employment') {
    switch (language) {
      case 'zh':
        return '我已根据新加坡《雇佣法令》（Employment Act 1968）分析了您的劳资情况。如果您的雇主无故将您突然解雇，或未支付加班费及代通知金，您享有法定的强力保障。您应在离职后1个月内向劳资政纠纷调解联盟（TADM）申请调解，如调解未果可进一步转介至雇佣索偿审裁处（ECT）。';
      case 'ms':
        return 'Saya telah menyemak situasi pekerjaan anda di bawah Akta Pekerjaan Singapura 1968. Jika majikan memecat anda secara tiba-tiba atau tidak membayar kerja lebih masa/gaji ganti rugi notis, anda dilindungi oleh statut. Anda harus memfailkan pengantaraan dengan TADM dalam tempoh 1 bulan sebelum ke Tribunal Tuntutan Pekerjaan (ECT).';
      case 'ta':
        return 'சிங்கப்பூர் வேலைவாய்ப்புச் சட்டம் 1968 இன் கீழ் உங்கள் வேலை நிலைமையை நான் மதிப்பாய்வு செய்துள்ளேன். உங்கள் முதலாளி உங்களை திடீரென நீக்கியிருந்தால் அல்லது நிலுவை சம்பளத்தை வழங்கத் தவறினால், உங்களுக்கு உறுதியான சட்டப் பாதுகாப்பு உண்டு. நீங்கள் 1 மாதத்திற்குள் TADM இல் மத்தியஸ்தத்திற்கு விண்ணப்பிக்க வேண்டும்.';
      default:
        return classification.initialResponse || "I've reviewed your employment situation under the Singapore Employment Act 1968. If your employer terminated you abruptly or failed to pay agreed overtime/salary in lieu of notice, you have strong statutory protection. You should file for mediation with TADM within 1 month of termination before escalating to the Employment Claims Tribunal (ECT).";
    }
  }

  if (cat === 'consumer') {
    switch (language) {
      case 'zh':
        return '我已根据新加坡《消费者保护（公平交易）法令》（CPFTA Lemon Law 柠檬法）分析了您的消费纠纷。在新加坡，若商品在交付后6个月内出现固有瑕疵，商家不得以“概不退款”等霸王条款免责。您依法有权要求免费维修、更换或全额退款，并可向小额索偿法庭提起申诉。';
      case 'ms':
        return 'Saya telah menyemak pembelian anda di bawah Undang-Undang Lemon Singapura (CPFTA 2003). Di Singapura, peniaga tidak boleh berlindung di sebalik klausa "tiada bayaran balik" jika barangan rosak dalam masa 6 bulan. Anda berhak menuntut pembaikan, penggantian atau bayaran balik.';
      case 'ta':
        return 'சிங்கப்பூரின் லெமன் சட்டத்தின் (CPFTA 2003) கீழ் உங்கள் நுகர்வோர் வாங்குதலை நான் ஆய்வு செய்துள்ளேன். 6 மாதங்களுக்குள் தயாரிப்பில் குறைபாடு ஏற்பட்டால், வணிகர்கள் பணத்தைத் திரும்பப் பெற மறுக்க முடியாது. பழுதுபார்ப்பு, மாற்று அல்லது முழு பணத்தைத் திரும்பப் பெற உங்களுக்கு சட்டப்பூர்வ உரிமை உள்ளது.';
      default:
        return classification.initialResponse || "I've reviewed your consumer purchase under Singapore's Lemon Law (CPFTA 2003). In Singapore, retailers cannot hide behind 'no refund' fine print if the product suffers an inherent defect within 6 months. You are legally entitled to repair, replacement, or refund at the Small Claims Tribunal.";
    }
  }

  if (cat === 'harassment') {
    switch (language) {
      case 'zh':
        return '我十分理解这种处境给您带来的困扰与压力。在新加坡，邻里骚扰、言语威胁或恶意跟踪均受到《防止骚扰法令》（POHA 2014）的严格制约。您可以单方面向防止骚扰法庭（PHC）申请紧急保护令（EPO），通常在48至72小时内即可生效制止侵害。';
      case 'ms':
        return 'Saya faham ini mendatangkan tekanan. Di Singapura, gangguan berterusan atau ugutan oleh jiran dilarang di bawah Akta Perlindungan daripada Gangguan (POHA) 2014. Anda boleh memohon Perintah Perlindungan Segera (EPO) di Mahkamah Perlindungan Gangguan dalam 48-72 jam.';
      case 'ta':
        return 'இது மிகவும் மன உளைச்சலை ஏற்படுத்துகிறது என்பதை நான் புரிந்துகொள்கிறேன். சிங்கப்பூரில் தொல்லை அல்லது அச்சுறுத்தல் கொடுப்பது துன்புறுத்தல் தடுப்புச் சட்டம் (POHA) 2014 இன் கீழ் தடை செய்யப்பட்டுள்ளது. 48-72 மணி நேரத்திற்குள் அவசர பாதுகாப்பு உத்தரவை (EPO) நீங்கள் பெறலாம்.';
      default:
        return classification.initialResponse || 'I understand this is distressing. In Singapore, continuous harassment or aggressive intimidation by neighbours is prohibited under the Protection from Harassment Act (POHA) 2014. You can apply ex-parte to the Protection from Harassment Court for an Expedited Protection Order (EPO) that takes effect within 48-72 hours.';
    }
  }

  // Default general
  switch (language) {
    case 'zh':
      return '感谢您向 Iris 倾诉纠纷详情。Iris 已根据新加坡民事成文法与判例法记录了案件事实。为了协助您评估最佳维权途径与索赔胜算，建议您核实保留关键书面凭证与时间节点。';
    case 'ms':
      return 'Terima kasih kerana berkongsi situasi anda. Iris telah merekodkan fakta anda di bawah undang-undang sivil Singapura. Untuk membantu menilai tindakan terbaik dan peluang kejayaan, mari semak bukti dan garis masa anda.';
    case 'ta':
      return 'உங்கள் நிலையைப் பகிர்ந்ததற்கு நன்றி. சிங்கப்பூர் உரிமையியல் சட்டத்தின் கீழ் உங்கள் வழக்கை Iris பதிவு செய்துள்ளது. சிறந்த நடவடிக்கை மற்றும் இழப்பீட்டு வாய்ப்புகளை மதிப்பிட உங்கள் ஆதாரங்களையும் காலவரிசையையும் மதிப்பாய்வு செய்வோம்.';
    default:
      return classification.initialResponse || "Thank you for sharing your situation. Iris has logged your facts under Singapore civil law. To help you evaluate the best course of action and likelihood of recovery, let's explore your evidence and timeline.";
  }
}


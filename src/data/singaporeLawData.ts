import { UploadedFileItem } from '../types/legal';
import { CASE_STUDIES } from './caseStudies';
import { isTestCitation } from './evaluationSplit';

export interface SingaporeStatute {
  id: string;
  actTitle: string;
  shortCode: string;
  year: number;
  chapterOrActNo: string;
  keySections: {
    section: string;
    heading: string;
    description: string;
  }[];
  primaryForum: string;
  ssoUrl: string;
}

export interface SingaporePrecedent {
  id: string;
  caseName: string;
  citation: string;
  aliases?: string[];
  court: 'SGCA' | 'SGHC' | 'SGHC(A)' | 'SICC' | 'SGDC' | 'SGMC' | 'SGFC' | 'Other';
  year: number;
  subjectArea: string;
  ratioDecidendi: string;
  significance: string;
}

export const SINGAPORE_STATUTES: SingaporeStatute[] = [
  {
    id: 'ea-1968',
    actTitle: 'Employment Act 1968',
    shortCode: 'EA',
    year: 1968,
    chapterOrActNo: 'Cap 91 / 2020 Rev Ed',
    keySections: [
      {
        section: 'Section 10 & 11',
        heading: 'Notice of termination of contract',
        description: 'Notice of termination by either party must be given or salary paid in lieu thereof as agreed under employment contract.'
      },
      {
        section: 'Section 14',
        heading: 'Misconduct and wrongful dismissal',
        description: 'Dismissal without notice requires due inquiry for misconduct. Claims for wrongful dismissal are adjudicated via TADM and the Employment Claims Tribunal (ECT).'
      },
      {
        section: 'Section 38',
        heading: 'Hours of work and overtime pay',
        description: 'Employees covered under Part IV (basic salary <= $2,600 or workmen <= $4,500) are entitled to 1.5x hourly rate of pay for overtime work beyond 8 hours a day or 44 hours a week.'
      },
      {
        section: 'Section 21',
        heading: 'Time of payment of salary',
        description: 'Salary must be paid at least once a month and within 7 days after the end of the salary period.'
      }
    ],
    primaryForum: 'Tripartite Alliance for Dispute Management (TADM) / Employment Claims Tribunal (ECT)',
    ssoUrl: 'https://sso.agc.gov.sg/Act/EA1968'
  },
  {
    id: 'poha-2014',
    actTitle: 'Protection from Harassment Act 2014',
    shortCode: 'POHA',
    year: 2014,
    chapterOrActNo: 'Cap 256A / Act 17 of 2014',
    keySections: [
      {
        section: 'Section 3',
        heading: 'Intentionally causing harassment, alarm or distress',
        description: 'Using threatening, abusive or insulting words, behavior or communication with intent to cause victim harassment, alarm or distress.'
      },
      {
        section: 'Section 5',
        heading: 'Fear, provocation or facilitation of violence',
        description: 'Threatening or abusive conduct causing victim to believe immediate unlawful violence will be used against them.'
      },
      {
        section: 'Section 7',
        heading: 'Unlawful stalking',
        description: 'Repeated or continuous acts of following, monitoring, or sending unwanted communications to a person or their family.'
      },
      {
        section: 'Section 12 & 13',
        heading: 'Protection Orders (PO) & Expedited Protection Orders (EPO)',
        description: 'Victims may apply ex-parte to the Protection from Harassment Court (PHC) for an urgent interim EPO within 48-72 hours restraining perpetrator.'
      }
    ],
    primaryForum: 'Protection from Harassment Court (State Courts of Singapore)',
    ssoUrl: 'https://sso.agc.gov.sg/Act/POHA2014'
  },
  {
    id: 'scta-1984',
    actTitle: 'Small Claims Tribunals Act 1984',
    shortCode: 'SCTA',
    year: 1984,
    chapterOrActNo: 'Cap 308 / 2020 Rev Ed',
    keySections: [
      {
        section: 'Section 5',
        heading: 'Jurisdiction of tribunal',
        description: 'Covers claims arising from sale of goods, provision of services, damage caused to property (except motor accidents), and residential tenancy agreements not exceeding 2 years.'
      },
      {
        section: 'Section 5(1A)',
        heading: 'Monetary claim limits ($20,000 / $30,000)',
        description: 'Standard claims up to SGD 20,000. Can be extended to SGD 30,000 if both claimant and respondent execute written consent via Memorandum of Consent.'
      },
      {
        section: 'Section 23',
        heading: 'Right of audience - No legal representation',
        description: 'No lawyer or advocate is permitted to represent any party, keeping costs low and the hearing informal and accessible.'
      },
      {
        section: 'Section 5(2)',
        heading: 'Limitation period for filing',
        description: 'Claims must be filed within 2 years from the date on which the cause of action accrued.'
      }
    ],
    primaryForum: 'Small Claims Tribunals (State Courts of Singapore)',
    ssoUrl: 'https://sso.agc.gov.sg/Act/SCTA1984'
  },
  {
    id: 'cpfta-2003',
    actTitle: 'Consumer Protection (Fair Trading) Act 2003',
    shortCode: 'CPFTA',
    year: 2003,
    chapterOrActNo: 'Cap 52A / 2020 Rev Ed',
    keySections: [
      {
        section: 'Section 4',
        heading: 'Unfair trade practices',
        description: 'Prohibits suppliers from misleading, false claims, taking unfair advantage of consumer, or exerting undue pressure.'
      },
      {
        section: 'Part III (Lemon Law)',
        heading: 'Defective goods repair, replacement or refund',
        description: 'Goods with defects appearing within 6 months of delivery are presumed defective at point of delivery unless supplier proves otherwise.'
      },
      {
        section: 'Section 6',
        heading: 'Consumer right to sue for unfair practice',
        description: 'Consumers can claim damages or rescission up to $30,000 at the Small Claims Tribunal.'
      }
    ],
    primaryForum: 'Consumers Association of Singapore (CASE) / Small Claims Tribunal',
    ssoUrl: 'https://sso.agc.gov.sg/Act/CPFTA2003'
  },
  {
    id: 'cla-1909',
    actTitle: 'Civil Law Act 1909',
    shortCode: 'CLA',
    year: 1909,
    chapterOrActNo: 'Cap 43 / 2020 Rev Ed',
    keySections: [
      {
        section: 'Section 6',
        heading: 'Statute of Frauds - Contracts required to be in writing',
        description: 'Contracts for sale or disposition of immovable property or guarantees must be evidenced in writing and signed by party to be charged.'
      },
      {
        section: 'Section 5',
        heading: 'Law of tort and damages',
        description: 'Contributory negligence apportionment and survival of causes of action.'
      }
    ],
    primaryForum: 'State Courts / General Division of High Court',
    ssoUrl: 'https://sso.agc.gov.sg/Act/CLA1909'
  },
  {
    id: 'ea-1893',
    actTitle: 'Evidence Act 1893',
    shortCode: 'EA 1893',
    year: 1893,
    chapterOrActNo: 'Cap 97 / 2020 Rev Ed',
    keySections: [
      {
        section: 'Section 103 & 104',
        heading: 'Burden of proof on civil standard',
        description: 'The burden of proof as to any particular fact lies on the party who asserts it. Civil standard of proof is balance of probabilities.'
      },
      {
        section: 'Section 64 & 65',
        heading: 'Primary and secondary documentary evidence',
        description: 'Documents must be proved by primary evidence unless original is lost, in opponent possession, or certified copies qualify under exceptions.'
      },
      {
        section: 'Section 116A',
        heading: 'Admissibility of electronic records and communications',
        description: 'Electronic emails, WhatsApp chat logs, and digital system logs are admissible provided device integrity and authentication conditions are satisfied.'
      }
    ],
    primaryForum: 'All Singapore Courts & Tribunals',
    ssoUrl: 'https://sso.agc.gov.sg/Act/EA1893'
  },
  {
    id: 'ca-1967',
    actTitle: 'Companies Act 1967',
    shortCode: 'CA',
    year: 1967,
    chapterOrActNo: 'Cap 50 / 2020 Rev Ed',
    keySections: [
      {
        section: 'Section 157',
        heading: 'Directors duty to act honestly and use reasonable diligence',
        description: 'Directors must at all times exercise power in good faith for proper purpose and avoid conflicts of interest.'
      },
      {
        section: 'Section 216',
        heading: 'Remedy in cases of oppression or injustice against minority shareholders',
        description: 'Minority shareholders can apply to court where company affairs are conducted in a manner oppressive to one or more members.'
      }
    ],
    primaryForum: 'General Division of the High Court (Singapore)',
    ssoUrl: 'https://sso.agc.gov.sg/Act/CA1967'
  },
  {
    id: 'pdpa-2012',
    actTitle: 'Personal Data Protection Act 2012',
    shortCode: 'PDPA',
    year: 2012,
    chapterOrActNo: 'Act 26 of 2012 / 2020 Rev Ed',
    keySections: [
      {
        section: 'Sections 13 - 17',
        heading: 'Consent, Purpose, and Notification Obligations',
        description: 'Organizations may only collect, use or disclose personal data with individual consent for purposes that a reasonable person would consider appropriate.'
      },
      {
        section: 'Section 24',
        heading: 'Protection obligation for security arrangements',
        description: 'Reasonable security arrangements must prevent unauthorized access, collection, use, disclosure, copying or modification of personal data.'
      },
      {
        section: 'Section 48O',
        heading: 'Right of private action in court',
        description: 'Individuals who suffer loss or damage directly as a result of a contravention of Part 4 to 6B have a private right of action in civil court.'
      }
    ],
    primaryForum: 'Personal Data Protection Commission (PDPC) / District Court',
    ssoUrl: 'https://sso.agc.gov.sg/Act/PDPA2012'
  },
  {
    id: 'lim-1959',
    actTitle: 'Limitation Act 1959',
    shortCode: 'LA',
    year: 1959,
    chapterOrActNo: 'Cap 163 / 2020 Rev Ed',
    keySections: [
      {
        section: 'Section 6(1)',
        heading: 'Limitation of actions in contract and tort',
        description: 'Action founded on contract or tort must be brought within 6 years from the date on which the cause of action accrued.'
      },
      {
        section: 'Section 24A',
        heading: 'Personal injury claims limitation',
        description: 'Actions claiming damages for negligence, nuisance, or breach of duty causing personal injury must be brought within 3 years.'
      }
    ],
    primaryForum: 'All Singapore Civil Courts',
    ssoUrl: 'https://sso.agc.gov.sg/Act/LA1959'
  }
];

const CORE_PRECEDENTS: SingaporePrecedent[] = [
  {
    id: 'prec-spandeck',
    caseName: 'Spandeck Engineering (S) Pte Ltd v Defence Science & Technology Agency',
    citation: '[2007] 4 SLR(R) 100',
    court: 'SGCA',
    year: 2007,
    subjectArea: 'Tort / Negligence / Duty of Care',
    ratioDecidendi: 'Established Singapore unified two-stage test for duty of care: (1) Preliminary threshold of factual foreseeability; (2) Stage 1: Legal proximity (physical, circumstantial, causal, and voluntary assumption of responsibility/reliance); (3) Stage 2: Policy considerations to negate liability.',
    significance: 'Apex ruling establishing the test for negligence claims across all industries in Singapore, departing from the UK Caparo/Anns dichotomy.'
  },
  {
    id: 'prec-chwee-kin-keong',
    caseName: 'Chwee Kin Keong and Others v Digilandmall.com Pte Ltd',
    citation: '[2005] 1 SLR(R) 502',
    court: 'SGCA',
    year: 2005,
    subjectArea: 'Contract Law / Electronic Commerce / Unilateral Mistake',
    ratioDecidendi: 'Where a party knows or has constructive knowledge that an online pricing term is a typographical error (snapping up an offer too good to be true), equity and common law void the contract for unilateral mistake.',
    significance: 'Landmark decision in Singapore electronic transactions and consumer contract disputes regarding predatory purchase orders.'
  },
  {
    id: 'prec-acb-thomson',
    caseName: 'ACB v Thomson Medical Pte Ltd and Others',
    citation: '[2017] 1 SLR 918',
    court: 'SGCA',
    year: 2017,
    subjectArea: 'Medical Negligence / Tort / Damages',
    ratioDecidendi: 'Recognized a new head of conventional damages for "loss of genetic affinity" following an IVF sperm mix-up, balancing autonomy with traditional heads of tort damage.',
    significance: 'Seminal Singapore Court of Appeal judgment redefining actionable psychiatric harm, medical negligence, and conventional damages.'
  },
  {
    id: 'prec-sim-cheng-run',
    caseName: 'Sim Cheng Run v Shaik Raheem',
    citation: '[2021] SGHC 279',
    court: 'SGHC',
    year: 2021,
    subjectArea: 'Defamation / POHA / Digital Harassment',
    ratioDecidendi: 'Defamatory allegations posted on social media forums can attract aggravated damages; clarified the strict standards for defenses of justification, fair comment, and qualified privilege.',
    significance: 'Benchmark for assessing damage awards and intersection between POHA cyber-harassment orders and common law tort of defamation.'
  },
  {
    id: 'prec-ho-kang-peng',
    caseName: 'Ho Kang Peng v Scintronix Corp Ltd',
    citation: '[2014] 3 SLR 329',
    court: 'SGCA',
    year: 2014,
    subjectArea: 'Corporate Law / Directors Duties / Fiduciary Liability',
    ratioDecidendi: 'Directors owe an unyielding fiduciary duty under s 157 Companies Act; improper payments even if disguised as legitimate commissions constitute dishonest breach and render the director liable to account for entire corporate losses.',
    significance: 'Leading authority on corporate governance, shareholder derivative suits, and piercing corporate veil for director misconduct.'
  },
  {
    id: 'prec-pgn-crw',
    caseName: 'PT Perusahaan Gas Negara (Persero) TBK v CRW Joint Operation',
    citation: '[2015] 4 SLR 364',
    court: 'SGCA',
    year: 2015,
    subjectArea: 'Arbitration / SICC / Enforcement of International Awards',
    ratioDecidendi: 'Affirmed Singapore policy of minimal curial intervention in arbitral awards under the International Arbitration Act (Cap 143A); enforcing interim adjudications under dispute board rules.',
    significance: 'Reaffirmed Singapore position as premier international dispute resolution forum with strict enforcement of commercial arbitration agreements.'
  },
  {
    id: 'prec-tan-seng-kee',
    caseName: 'Tan Seng Kee v Attorney-General and other appeals',
    citation: '[2022] SGCA 16',
    court: 'SGCA',
    year: 2022,
    subjectArea: 'Constitutional Law / Public Interest / Fundamental Liberties',
    ratioDecidendi: 'Extensive analysis of locus standi, prosecutorial discretion under Article 35(8), and constitutional equal protection under Article 12(1) of Singapore Constitution.',
    significance: 'High-water mark for statutory interpretation and constitutional jurisprudence in Singapore.'
  },
  {
    id: 'prec-surender-singh',
    caseName: 'Surender Singh s/o Jagdish Singh v CapitaLand Commercial Management Ltd',
    citation: '[2014] 4 SLR 730',
    court: 'SGHC',
    year: 2014,
    subjectArea: 'Occupiers Liability / Slip and Fall / Evidence',
    ratioDecidendi: 'Occupier owes a duty to ensure reasonable safety of invitees, but liability is not strict; claimant must tender contemporaneous inspection logs or photographic proof of defective premise.',
    significance: 'Crucial precedent for commercial slip-and-fall and property management negligence claims in Singapore.'
  }
];

// Case library judgments with a citation. Entries without one are kept as Corporate case folders only.
export const SINGAPORE_PRECEDENTS: SingaporePrecedent[] = [
  ...CORE_PRECEDENTS,
  ...CASE_STUDIES.filter((cs, i) => !cs.unreadable && cs.citation && !isTestCitation(cs.citation) && CASE_STUDIES.findIndex((o) => o.citation === cs.citation) === i).map((cs) => ({
    id: `prec-${cs.id}`,
    caseName: cs.caseName,
    citation: cs.citation,
    aliases: cs.aliases,
    court: cs.court as SingaporePrecedent['court'],
    year: cs.year,
    subjectArea: cs.subjectArea,
    ratioDecidendi: cs.ratioDecidendi,
    significance: cs.significance
  }))
];

export const PUBLIC_SAMPLE_CASES = [
  {
    id: 'sample-tenancy',
    title: 'Landlord withholding $3,500 rental deposit for fair wear and tear',
    category: 'tenancy' as const,
    claimAmount: 3500,
    incidentDate: '2026-09-15',
    opponentType: 'landlord' as const,
    description: 'I rented a 2-bedroom HDB flat in Toa Payoh for 24 months. I handed over the keys upon lease expiry with clean condition photos. Landlord is now refusing to return my $3,500 deposit, claiming minor paint scuff marks and floor fading are damage rather than fair wear and tear. There is no damage clause permitting total forfeiture in the tenancy agreement.',
    evidenceHeld: ['Signed Tenancy Agreement (CEA standard template)', 'Move-in & Move-out inspection photo log with date stamps', 'WhatsApp handover chat with landlord', 'Bank transfer receipt of initial deposit'],
    desiredOutcome: 'Full refund of SGD 3,500 security deposit plus filing fees.'
  },
  {
    id: 'sample-employment',
    title: 'Sudden dismissal without 1-month notice after claiming overtime',
    category: 'employment' as const,
    claimAmount: 4200,
    incidentDate: '2026-10-02',
    opponentType: 'employer' as const,
    description: 'I was employed as an administrative coordinator earning $2,400 basic monthly salary. Over the past 6 months, I worked 18 hours of recorded overtime per month without 1.5x overtime pay. When I submitted a formal claim for $4,200 in accrued overtime pay under Part IV of the Employment Act, my manager terminated my contract on the spot with zero notice and withheld my final salary.',
    evidenceHeld: ['Employment Contract with 1-month notice clause', 'Biometric punch-in timecards', 'Emails demanding overtime work from manager', 'Pay slips showing unpaid overtime hours'],
    desiredOutcome: 'Payment of $4,200 overtime pay + 1-month salary in lieu of notice + wrongful dismissal compensation.'
  },
  {
    id: 'sample-consumer',
    title: 'Refusal of refund for defective high-end laptop under Lemon Law',
    category: 'consumer' as const,
    claimAmount: 2850,
    incidentDate: '2026-08-20',
    opponentType: 'business' as const,
    description: 'Purchased a $2,850 gaming laptop from Sim Lim Square retailer. Within 3 weeks, the motherboard suffered repeated thermal shutdowns and GPU artifacting. The merchant refused repair or refund, pointing to a small receipt print saying "All Goods Sold Non-Refundable".',
    evidenceHeld: ['Original sales receipt & invoice', 'Authorized service center inspection report confirming internal hardware fault', 'Written emails to retailer reporting failure within 30 days'],
    desiredOutcome: 'Full refund of SGD 2,850 under CPFTA Lemon Law provisions.'
  },
  {
    id: 'sample-harassment',
    title: 'Neighbour repeatedly shining strobe spotlight and banging corridor gate',
    category: 'harassment' as const,
    claimAmount: 0,
    incidentDate: '2026-10-18',
    opponentType: 'individual' as const,
    description: 'Next door neighbour has been shining a high-intensity LED strobe light into my family master bedroom between 1 AM and 4 AM, and banging metal gate loudly every night for 4 weeks. They yelled profanities at my elderly mother in the common corridor.',
    evidenceHeld: ['CCTV surveillance footage with audio and timestamps', 'Decibel measurement logs', 'Police dispatch report cards (3 visits)', 'Neighbourhood committee mediation letter ignored by respondent'],
    desiredOutcome: 'Urgent Expedited Protection Order (EPO) under POHA s 12 and mandatory injunction to remove spotlights.'
  }
];

// Based on the reported judgment in Center for Competency-Based Learning and Development Pte Ltd v SkillsFuture Singapore Agency [2024] 5 SLR 481 ([2024] SGHC 121).
// File summaries reconstruct the documents that the judgment describes. They are not the original documents.
export const CORPORATE_SAMPLE_CASE = {
  referenceNumber: '[2024] SGHC 121',
  caseTitle: 'Center for Competency-Based Learning and Development Pte Ltd v SkillsFuture Singapore Agency [2024] 5 SLR 481',
  clientName: 'Center for Competency-Based Learning and Development Pte Ltd (Plaintiff, training provider)',
  adverseParty: 'SkillsFuture Singapore Agency (Defendant, statutory body)',
  disputeValue: 'Claim sum of SGD 1,439,157.72 (SGD 14,244.30 allowed); counterclaim of SGD 793,083.79 allowed',
  courtJurisdiction: 'General Division of the High Court (Suit No 718 of 2021)',
  practiceArea: 'Contract: Termination, Clawback Clauses and Estoppel',
  dateCreated: '2026-10-25',
  folders: ['1_Funding_Contract', '2_Termination_Documents', '3_Audit_and_Trainee_Evidence'],
  files: <UploadedFileItem[]>[
    {
      id: 'doc-001',
      folderName: '1_Funding_Contract',
      fileName: 'SkillsConnect_General_Terms_and_Conditions.pdf',
      fileType: 'contract' as const,
      sizeBytes: 1845000,
      uploadedAt: '2026-10-25 09:15',
      tags: {
        relevance: 'high',
        confidentiality: 'commercial_confidential',
        sourceType: 'contract_rider',
        customNotes: 'Cl 12.1(a) and 12.1(d) give termination grounds. Cl 13.4 is the clawback clause. Cl 15.1 is the general exemption. Check each against the judgment at [169] to [212].'
      },
      contentSummary: 'Standard-form SkillsConnect contract, entered into around May 2007. Cl 7.3 and 14.1(c): claim information must be true, accurate and complete to the best of knowledge. Cl 12.1(d): termination where SSG is of the opinion that the provider is guilty of gross moral turpitude. Cl 13.4: clawback of all funding received on termination. Cl 15.1: general exemption and release.'
    },
    {
      id: 'doc-002',
      folderName: '2_Termination_Documents',
      fileName: 'Notice_of_Intent_16_Oct_2020.pdf',
      fileType: 'pleading' as const,
      sizeBytes: 402000,
      uploadedAt: '2026-10-25 09:20',
      tags: {
        relevance: 'high',
        confidentiality: 'open_evidence',
        sourceType: 'regulatory_filing',
        customNotes: 'Notice cited cl 12.1(c), not 12.1(a) or (d). The court still allowed termination under 12.1(a) (at [170] and [171]).'
      },
      contentSummary: 'Notice of intent to terminate issued by SSG on 16 October 2020, alleging breaches of cl 7.3, cl 7.5 and cll 4.6(a) to (b). Sought a refund of SGD 793,083.79 and gave 14 days to show cause. Said previously approved claims would be rejected unless resubmitted by 15 November 2020.'
    },
    {
      id: 'doc-003',
      folderName: '2_Termination_Documents',
      fileName: 'Ad_hoc_Claim_Approval_Emails_Oct_2020_Mar_2021.eml',
      fileType: 'email' as const,
      sizeBytes: 680000,
      uploadedAt: '2026-10-25 09:22',
      metadata: {
        emailFrom: 'SkillsFuture Singapore Agency (automated)',
        emailTo: 'Center for Competency-Based Learning and Development Pte Ltd',
        emailDate: '2020-10-16 to 2021-03-25',
        emailSubject: 'Ad hoc claim approved, subject to disbursement conditions'
      },
      tags: {
        relevance: 'smoking_gun',
        confidentiality: 'open_evidence',
        sourceType: 'email_thread',
        customNotes: 'Key to the estoppel finding. The court held SSG was estopped from using the clawback for claims made during the intervening period (at [231]).'
      },
      contentSummary: 'About 200 emails during the intervening period, each stating "This claim has been approved and will be disbursed if you meet disbursement conditions". SSG did not suspend the provider account, and the provider kept running courses until 25 March 2021.'
    },
    {
      id: 'doc-004',
      folderName: '2_Termination_Documents',
      fileName: 'Termination_Letter_25_March_2021.pdf',
      fileType: 'pleading' as const,
      sizeBytes: 215000,
      uploadedAt: '2026-10-25 09:25',
      tags: {
        relevance: 'high',
        confidentiality: 'open_evidence',
        sourceType: 'regulatory_filing',
        customNotes: 'Terminated under cl 12.1(d) on the opinion of gross moral turpitude. The court held that the opinion is the qualifying event, so the court does not test its facts (at [179]).'
      },
      contentSummary: 'Immediate termination under cl 12.1(d), stating SSG had "formed the opinion that CBLD is guilty of gross moral turpitude". Stated under cl 13.4 that no further funding would be paid, even for claims already approved.'
    },
    {
      id: 'doc-005',
      folderName: '3_Audit_and_Trainee_Evidence',
      fileName: 'Trainee_Statements_and_CBLD_Declarations.pdf',
      fileType: 'evidence' as const,
      sizeBytes: 2950000,
      uploadedAt: '2026-10-25 09:30',
      tags: {
        relevance: 'high',
        confidentiality: 'litigation_privilege',
        sourceType: 'witness_statement',
        customNotes: 'Of 14 trainee statements, the court accepted the evidence for Trainees 1, 3 and 9 and rejected the CBLD declarations (at [76]). No finding of dishonesty (at [163]).'
      },
      contentSummary: 'Interview statements from 14 trainees and the provider\'s mass declarations. The court found Trainee 9 attended no sessions and did not sign her attendance sheets. It found Trainees 1 and 3 attended under 75% of the stated course duration. It did not find that the provider acted dishonestly.'
    }
  ]
};

import { Language } from '../types/legal';

export interface TranslationDictionary {
  appTitle: string;
  appSubtitle: string;
  tagline: string;
  modePublic: string;
  modeCorporate: string;
  toggleHint: string;
  languageSelect: string;
  statutesDirectory: string;
  exportReport: string;

  // Public View Modes
  publicModeConversational: string;
  publicModeAdvanced: string;
  infodumpTitle: string;
  infodumpSubtitle: string;
  infodumpPlaceholder: string;
  infodumpSend: string;
  infodumpDetected: string;
  infodumpForum: string;
  infodumpRights: string;
  generateFullReport: string;

  // Public Advanced Form
  publicHeroTitle: string;
  publicHeroSubtitle: string;
  step1Title: string;
  step1Subtitle: string;
  caseCategoryLabel: string;
  caseTitleLabel: string;
  claimAmountLabel: string;
  claimAmountHint: string;
  incidentDateLabel: string;
  opponentTypeLabel: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  evidenceHeldLabel: string;
  evidenceHeldPlaceholder: string;
  desiredOutcomeLabel: string;
  analyzeButton: string;
  analyzingButton: string;
  loadSampleCase: string;
  sampleCaseTenancy: string;
  sampleCaseEmployment: string;
  sampleCaseConsumer: string;
  sampleCaseHarassment: string;

  // Public Results
  analysisOverview: string;
  meritScoreLabel: string;
  limitationPeriodLabel: string;
  recommendedForumsTitle: string;
  flawsTitle: string;
  evidenceChecklistTitle: string;
  statutesGroundingTitle: string;
  precedentsTitle: string;
  actionPlanTitle: string;
  conversationalLegalChat: string;
  chatPlaceholder: string;
  sendQuestion: string;
  printOfficialReport: string;

  // Corporate View
  corporateHeroTitle: string;
  corporateHeroSubtitle: string;
  newCaseFromEmail: string;
  emailModalTitle: string;
  emailTopicPlaceholder: string;
  emailBodyPlaceholder: string;
  parseEmailButton: string;
  uploadFoldersTitle: string;
  uploadFoldersDesc: string;
  selectFoldersButton: string;
  addFolder: string;
  dualSideFlawAnalysisTitle: string;
  claimantFlawsTab: string;
  respondentFlawsTab: string;
  sourceTrackingTab: string;
  precedentsUsedTab: string;
  severityCritical: string;
  severityModerate: string;
  severityMinor: string;
  vulnerabilityQuoteLabel: string;
  sourceDocLabel: string;
  statuteCitationLabel: string;
  counterStrategyLabel: string;
  ourExploitationLabel: string;
  activeCaseInfo: string;
  jurisdictionLabel: string;
  disputeValueLabel: string;
  runCorporateAudit: string;
  runningAudit: string;

  // Metadata Tagging
  filterByTag: string;
  tagRelevance: string;
  tagConfidentiality: string;
  tagSourceType: string;
  allTags: string;
  editMetadataTags: string;
  saveMetadataTags: string;

  // Common
  disclaimerNote: string;
  close: string;
  cancel: string;
  confirm: string;
  search: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appTitle: 'Iris Legal AI',
    appSubtitle: 'Singapore Law Advisory & Case Intelligence',
    tagline: 'Strictly grounded on Singapore Statutes (SSO) & Singapore Apex Court Precedents',
    modePublic: 'Public / Citizen Advisory',
    modeCorporate: 'Corporate / Law Firm Portal',
    toggleHint: 'Switch between Citizen Legal Guidance and Law Firm Case Dossier Intelligence',
    languageSelect: 'Language / 语言 / Bahasa / தமிழ்',
    statutesDirectory: 'SG Statutes & Precedents',
    exportReport: 'Export Official Report',

    publicModeConversational: '💬 Conversational Chat (Simple Infodump)',
    publicModeAdvanced: '📋 Structured Case Intake (Advanced)',
    infodumpTitle: 'Tell Iris What Happened in Your Own Words',
    infodumpSubtitle: 'No need to know legal terms or categories. Type or paste your whole story below. Iris will automatically spot your legal issues, calculate your rights under Singapore statutes, and guide you through an interactive conversation.',
    infodumpPlaceholder: 'Infodump everything here (e.g., "My landlord is withholding my $3,500 deposit for minor scuffs on the floor", "My boss fired me with zero notice after I asked for unpaid overtime", "A seller on Carousell sent me a defective laptop and blocked me")...',
    infodumpSend: 'Tell Iris',
    infodumpDetected: 'Identified Singapore Legal Category:',
    infodumpForum: 'Likely Singapore Forum:',
    infodumpRights: 'Key Statutory Rights & Protection:',
    generateFullReport: 'Generate Full Official Legal Memorandum & Action Plan',

    publicHeroTitle: 'Solve Your Legal Problem under Singapore Law',
    publicHeroSubtitle: 'Describe your dispute. Iris calculates case merits, procedural options (Small Claims Tribunal, POHA, TADM/ECT), key vulnerabilities, and required evidentiary proof.',
    step1Title: 'Submit Your Case Details',
    step1Subtitle: 'Enter facts accurately. All analyses cite Singapore Statutes and Court of Appeal precedents.',
    caseCategoryLabel: 'Case Category',
    caseTitleLabel: 'Case Subject / Summary Title',
    claimAmountLabel: 'Estimated Claim Amount (SGD)',
    claimAmountHint: 'Small Claims Tribunal limit is $20,000 (up to $30,000 with mutual written consent). Magistrate court is up to $60,000.',
    incidentDateLabel: 'Date Incident Occurred',
    opponentTypeLabel: 'Opposing Party Type',
    descriptionLabel: 'Incident Facts & Timeline',
    descriptionPlaceholder: 'Detail what occurred: dates, communications, breaches, promises made, and financial losses incurred...',
    evidenceHeldLabel: 'Evidence Currently in Your Possession (comma separated)',
    evidenceHeldPlaceholder: 'e.g., Signed tenancy agreement, WhatsApp message screenshots, bank transfer receipt, police report...',
    desiredOutcomeLabel: 'Desired Outcome / Remedy Sought',
    analyzeButton: 'Analyze Case under Singapore Law',
    analyzingButton: 'Analyzing under SG Statutes & Precedents...',
    loadSampleCase: 'Quick Load Real-World Singapore Scenarios:',
    sampleCaseTenancy: 'Rental Deposit Dispute ($3,500)',
    sampleCaseEmployment: 'Unpaid Overtime & Dismissal ($4,200)',
    sampleCaseConsumer: 'Defective Laptop Lemon Law ($2,850)',
    sampleCaseHarassment: 'Neighbour Corridor Harassment (POHA)',

    analysisOverview: 'Case Merits & Legal Viability Assessment',
    meritScoreLabel: 'Case Viability Score',
    limitationPeriodLabel: 'Limitation Act (Cap 163) Status',
    recommendedForumsTitle: 'Appropriate Legal Forums & Remedies in Singapore',
    flawsTitle: 'Vulnerabilities & Problems in Your Case',
    evidenceChecklistTitle: 'Mandatory Evidentiary Proof Checklist (Evidence Act Cap 97)',
    statutesGroundingTitle: 'Applicable Singapore Statutes Online (SSO)',
    precedentsTitle: 'Binding Singapore Judicial Precedents (SGCA / SGHC)',
    actionPlanTitle: 'Step-by-Step Action Plan & Filing Procedure',
    conversationalLegalChat: 'Interactive Singapore Legal Counsel Chat',
    chatPlaceholder: 'Ask questions (e.g., "What if the landlord refuses to attend SCT mediation?", "How do I file via CJTS?")...',
    sendQuestion: 'Send Question',
    printOfficialReport: 'Print / Save Legal Advisory Memorandum',

    corporateHeroTitle: 'Corporate Counsel & Law Firm Intelligence Suite',
    corporateHeroSubtitle: 'Multi-folder batch discovery review, metadata tagging, dual-sided flaw matrix (Claimant vs Respondent), and granular source & precedent tracking.',
    newCaseFromEmail: '+ New Case from Email Topic',
    emailModalTitle: 'Create New Singapore Legal Matter from Incoming Email',
    emailTopicPlaceholder: 'Email subject / Client matter name...',
    emailBodyPlaceholder: 'Paste raw incoming email correspondence or instruction memo here...',
    parseEmailButton: 'Generate Case Dossier & Spot Issues',
    uploadFoldersTitle: 'Multi-Folder Evidence & Discovery Dossier',
    uploadFoldersDesc: 'Upload and organize pleadings, contracts, email chains, and witness logs into distinct folders with metadata tags.',
    selectFoldersButton: 'Select Folder / Files to Add',
    addFolder: '+ Add New Folder',
    dualSideFlawAnalysisTitle: 'Dual-Sided Case Flaw Matrix & Strategic Vulnerabilities',
    claimantFlawsTab: 'Claimant Vulnerabilities (Our Side / Client)',
    respondentFlawsTab: 'Respondent Vulnerabilities (Opposing Side)',
    sourceTrackingTab: 'Source Document & Citation Tracker',
    precedentsUsedTab: 'Singapore Statutes & Precedents Used',
    severityCritical: 'CRITICAL RISK',
    severityModerate: 'MODERATE RISK',
    severityMinor: 'MINOR ISSUE',
    vulnerabilityQuoteLabel: 'Evidentiary / Factual Vulnerability:',
    sourceDocLabel: 'Source Document & Line Citation:',
    statuteCitationLabel: 'Singapore Law / Precedent Grounding:',
    counterStrategyLabel: 'Recommended Counter-Strategy & Cure:',
    ourExploitationLabel: 'Our Strategic Cross-Examination / Exploitation:',
    activeCaseInfo: 'Active Legal Matter',
    jurisdictionLabel: 'Court / Forum Jurisdiction:',
    disputeValueLabel: 'Dispute Value:',
    runCorporateAudit: 'Execute Full Legal Flaw Audit',
    runningAudit: 'Analyzing Cross-Folder Inconsistencies & Citing Precedents...',

    filterByTag: 'Filter by Metadata Tag',
    tagRelevance: 'Relevance',
    tagConfidentiality: 'Confidentiality / Privilege',
    tagSourceType: 'Source Type',
    allTags: 'All Evidence',
    editMetadataTags: 'Tag Metadata',
    saveMetadataTags: 'Apply Tags',

    disclaimerNote: 'Iris provides legal analytical information grounded in Singapore Statutes Online (SSO) and Singapore Court judgments. It does not replace an advocate and solicitor-client relationship.',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    search: 'Search Singapore Statutes & Case Law...'
  },

  zh: {
    appTitle: 'Iris 新加坡法律智能平台',
    appSubtitle: '新加坡法律咨询与企业诉讼情报系统',
    tagline: '严格基于新加坡立法法令（SSO）与新加坡终审法院（SGCA）判例支持',
    modePublic: '公众 / 公民咨询',
    modeCorporate: '企业 / 律所系统',
    toggleHint: '在公民法律援助和律师案件卷宗双边漏洞审查之间切换',
    languageSelect: '选择语言 (Language)',
    statutesDirectory: '新加坡法规与判例库',
    exportReport: '导出正式法律报告',

    publicModeConversational: '💬 对话式智能助理（简单自由叙述）',
    publicModeAdvanced: '📋 结构化案件申报（高级专业模式）',
    infodumpTitle: '用您自己的话向 Iris 倾诉纠纷经过',
    infodumpSubtitle: '无需懂得法律专有名词或分类。在下方直接输入或粘贴发生的任何事情。Iris 将自动识别新加坡法律焦点，计算您的法定权益，并进行友好自然的答疑解惑。',
    infodumpPlaceholder: '在此自由倾诉发生的事（例如：“房东扣了我3500新币押金，说是墙面有轻微划痕”、“我向老板追讨加班费后，他未经通知直接把我开除了”、“在Carousell买到坏电脑，卖家拉黑了我”）...',
    infodumpSend: '发送给 Iris',
    infodumpDetected: '已识别新加坡法定案件类别：',
    infodumpForum: '建议维权法定机构：',
    infodumpRights: '官方成文法赋予您的核心权益：',
    generateFullReport: '一键生成正式法律意见书与行动清单',

    publicHeroTitle: '依照新加坡法律解决您的法律纠纷',
    publicHeroSubtitle: '输入您的争议详情。Iris将分析案件胜率、推荐法定途径（小额索偿法庭、防止骚扰法令POHA、劳资政争议调解TADM）、揭示案情漏洞并提供制胜证据清单。',
    step1Title: '提交案件基本事实',
    step1Subtitle: '请准确填写事实。所有法律分析均附新加坡官方成文法及判例引证。',
    caseCategoryLabel: '案件类别',
    caseTitleLabel: '案件主题 / 简要标题',
    claimAmountLabel: '争议金额 (新币 SGD)',
    claimAmountHint: '新加坡小额索偿法庭（SCT）法定限额为2万新币（经双方书面同意可提至3万新币）。治安法庭限额6万新币。',
    incidentDateLabel: '事发日期',
    opponentTypeLabel: '对方当事人身份',
    descriptionLabel: '事实经过与争议细节',
    descriptionPlaceholder: '详细说明事情经过：时间节点、双方沟通、违约行为、承诺事项以及造成的直接经济损失...',
    evidenceHeldLabel: '目前您手中持有的证据（逗号分隔）',
    evidenceHeldPlaceholder: '例如：已签署的租约合同、WhatsApp聊天截图、银行转账凭单、警方报案记录...',
    desiredOutcomeLabel: '您期望的法律结果与补救诉求',
    analyzeButton: '根据新加坡法律进行全面深度分析',
    analyzingButton: '正在结合新加坡法令与法院判例研判中...',
    loadSampleCase: '快速载入新加坡典型真实案例：',
    sampleCaseTenancy: '租房押金争议 ($3,500)',
    sampleCaseEmployment: '无故解雇与加班费 ($4,200)',
    sampleCaseConsumer: '电脑缺陷柠檬法退款 ($2,850)',
    sampleCaseHarassment: '邻里走廊恶意骚扰 (POHA)',

    analysisOverview: '案件胜率评估与法律可行性研判',
    meritScoreLabel: '案件法律胜诉指数',
    limitationPeriodLabel: '诉讼时效法令 (Cap 163) 状态',
    recommendedForumsTitle: '新加坡适用法定维权途径与法庭',
    flawsTitle: '您案件中存在的致命缺陷与弱点',
    evidenceChecklistTitle: '法庭决胜证据清单（符合新加坡证据法）',
    statutesGroundingTitle: '新加坡官方立法法令依据 (SSO)',
    precedentsTitle: '新加坡最高法院权威约束性判例 (SGCA / SGHC)',
    actionPlanTitle: '步骤化行动计划与诉讼申请程序',
    conversationalLegalChat: '互动式新加坡法律顾问咨询',
    chatPlaceholder: '随时追问（例如：“如果房东拒绝参加小额法庭调解怎么办？”、“如何通过CJTS提交？”）...',
    sendQuestion: '发送法律咨询',
    printOfficialReport: '打印 / 保存法律分析意见书',

    corporateHeroTitle: '企业法务与律师事务所智能分析中枢',
    corporateHeroSubtitle: '支持多文件夹海量卷宗审查、标签元数据管理、原被告双向漏洞矩阵剖析、精准文件引证与先例检索。',
    newCaseFromEmail: '+ 从电子邮件主题创建新案',
    emailModalTitle: '从收到的邮件创建新加坡法律卷宗',
    emailTopicPlaceholder: '邮件主题 / 客户案由...',
    emailBodyPlaceholder: '在此粘贴收到的原始业务邮件或法律指示备忘录...',
    parseEmailButton: '自动解析并提取争议要点',
    uploadFoldersTitle: '多文件夹证据与披露文件卷宗',
    uploadFoldersDesc: '批量上传并管理诉状、商务合同、往来邮件链以及证人证言记录，支持按证据关联度及保密特权加标签。',
    selectFoldersButton: '选择文件夹 / 批量添加文件',
    addFolder: '+ 添加新分类文件夹',
    dualSideFlawAnalysisTitle: '双向漏洞矩阵（原告 vs 被告攻防要点）',
    claimantFlawsTab: '原告方漏洞剖析（我方客户风险点）',
    respondentFlawsTab: '被告方漏洞剖析（对方弱点及突破口）',
    sourceTrackingTab: '证据来源文件与页码引用追踪',
    precedentsUsedTab: '引用之新加坡成文法与判例',
    severityCritical: '严重致命风险',
    severityModerate: '中等风险要点',
    severityMinor: '一般瑕疵',
    vulnerabilityQuoteLabel: '事实或证据漏洞原文摘录：',
    sourceDocLabel: '来源文件与具体段落引证：',
    statuteCitationLabel: '新加坡法令及判例法依据：',
    counterStrategyLabel: '建议补救防范方案：',
    ourExploitationLabel: '我方法庭交叉盘问与进攻策略：',
    activeCaseInfo: '当前审理卷宗',
    jurisdictionLabel: '管辖法院 / 仲裁机构：',
    disputeValueLabel: '涉案争议标的额：',
    runCorporateAudit: '执行全案法律漏洞双向审查',
    runningAudit: '正在交叉比对各文件夹证据并检索判例...',

    filterByTag: '按元数据标签筛选证据',
    tagRelevance: '关联程度',
    tagConfidentiality: '保密特权 / 免责性质',
    tagSourceType: '证据来源类型',
    allTags: '全部证据',
    editMetadataTags: '标记元数据标签',
    saveMetadataTags: '保存标签',

    disclaimerNote: 'Iris 提供基于新加坡法令与司法判决的专业法律分析，不构成正式的执业律师与客户代理关系。',
    close: '关闭',
    cancel: '取消',
    confirm: '确认',
    search: '检索新加坡法令及判例法...'
  },

  ms: {
    appTitle: 'Iris Kepintaran Perundangan Singapura',
    appSubtitle: 'Nasihat Undang-Undang & Perisikan Korporat Singapura',
    tagline: 'Berasaskan Statut Singapura (SSO) & Preseden Mahkamah Rayuan Singapura',
    modePublic: 'Orang Awam',
    modeCorporate: 'Firma Guaman',
    toggleHint: 'Tukar antara Panduan Undang-Undang Awam dan Analisis Kelemahan Kes Peguam',
    languageSelect: 'Pilih Bahasa',
    statutesDirectory: 'Direktori Statut & Preseden SG',
    exportReport: 'Eksport Laporan Rasmi',

    publicModeConversational: '💬 Chatbot Perbualan (Luahan Fakta Mudah)',
    publicModeAdvanced: '📋 Borang Kes Berstruktur (Lanjutan)',
    infodumpTitle: 'Ceritakan Kepada Iris Apa Yang Berlaku',
    infodumpSubtitle: 'Tidak perlu tahu istilah guaman atau kategori. Ceritakan segalanya dalam perkataan anda sendiri. Iris akan mengenal pasti hak anda di bawah statut Singapura.',
    infodumpPlaceholder: 'Luahkan semua di sini (cth., "Tuan rumah enggan pulangkan deposit $3,500 saya sebab calar sikit", "Majikan pecat saya tanpa notis lepas saya minta gaji lebih masa", "Penjual di Carousell bagi barang rosak dan sekat saya")...',
    infodumpSend: 'Hantar Kepada Iris',
    infodumpDetected: 'Kategori Undang-Undang Dikenal Pasti:',
    infodumpForum: 'Forum / Tribunal Singapura:',
    infodumpRights: 'Hak Statut Utama Anda:',
    generateFullReport: 'Jana Laporan Penuh & Pelan Tindakan',

    publicHeroTitle: 'Selesaikan Masalah Undang-Undang Anda di Bawah Undang-Undang Singapura',
    publicHeroSubtitle: 'Nyatakan pertikaian anda. Iris menilai merit kes, pilihan forum (Tribunal Tuntutan Kecil, POHA, TADM/ECT), kelemahan hujah, dan bukti wajib untuk menang.',
    step1Title: 'Hantarkan Butiran Kes Anda',
    step1Subtitle: 'Masukkan fakta dengan tepat. Semua analisis disokong oleh Statut Singapura dan preseden kehakiman.',
    caseCategoryLabel: 'Kategori Kes',
    caseTitleLabel: 'Tajuk / Ringkasan Kes',
    claimAmountLabel: 'Anggaran Nilai Tuntutan (SGD)',
    claimAmountHint: 'Had Tribunal Tuntutan Kecil ialah $20,000 (hingga $30,000 dengan persetujuan bertulis bersama). Mahkamah Majistret sehingga $60,000.',
    incidentDateLabel: 'Tarikh Kejadian',
    opponentTypeLabel: 'Jenis Pihak Bertentangan',
    descriptionLabel: 'Kronologi Fakta & Butiran Kejadian',
    descriptionPlaceholder: 'Terangkan secara terperinci apa yang berlaku: tarikh, komunikasi, pelanggaran kontrak, janji yang dibuat, dan kerugian dialami...',
    evidenceHeldLabel: 'Bukti yang Ada dalam Simpanan Anda (dipisahkan koma)',
    evidenceHeldPlaceholder: 'cth., Perjanjian sewa bertandatangan, tangkapan skrin WhatsApp, resit pindahan bank, laporan polis...',
    desiredOutcomeLabel: 'Hasil / Remedi yang Dihasratkan',
    analyzeButton: 'Analisis Kes di Bawah Undang-Undang SG',
    analyzingButton: 'Menganalisis mengikut Statut & Preseden Mahkamah...',
    loadSampleCase: 'Muat Pantas Senario Nyata Singapura:',
    sampleCaseTenancy: 'Pertikaian Deposit Sewa Rumah ($3,500)',
    sampleCaseEmployment: 'Pemecatan Tanpa Notis & Lebih Masa ($4,200)',
    sampleCaseConsumer: 'Komputer Rosak & Bayaran Balik Lemon Law ($2,850)',
    sampleCaseHarassment: 'Gangguan Jiran di Koridor Flat (POHA)',

    analysisOverview: 'Penilaian Merit & Daya Maju Undang-Undang',
    meritScoreLabel: 'Skor Kebolehlaksanaan Kes',
    limitationPeriodLabel: 'Status Akta Had Masa (Cap 163)',
    recommendedForumsTitle: 'Forum & Saluran Perundangan Sesuai di Singapura',
    flawsTitle: 'Kelemahan & Masalah dalam Kes Anda',
    evidenceChecklistTitle: 'Senarai Semak Bukti Mandatori (Akta Keterangan Cap 97)',
    statutesGroundingTitle: 'Statut Singapura Online (SSO) Terpakai',
    precedentsTitle: 'Preseden Kehakiman Mengikat (SGCA / SGHC)',
    actionPlanTitle: 'Pelan Tindakan Berperingkat & Prosedur Pemfailan',
    conversationalLegalChat: 'Sesi Soal Jawab Bersama Penasihat Undang-Undang AI',
    chatPlaceholder: 'Tanya soalan lanjut (cth., "Bagaimana jika tuan rumah enggan hadir ke SCT?", "Bagaimana memfailkan melalui CJTS?")...',
    sendQuestion: 'Hantar Soalan',
    printOfficialReport: 'Cetak / Simpan Memorandum Rasmi',

    corporateHeroTitle: 'Pusat Perisikan Peguam Korporat & Firma Guaman',
    corporateHeroSubtitle: 'Semakan dokumen pelbagai folder serentak, pelabelan metadata bukti, matriks kelemahan dwipihak (Plaintif vs Defendan), dan penjejakan sumber terperinci.',
    newCaseFromEmail: '+ Kes Baharu daripada Emel',
    emailModalTitle: 'Cipta Perkara Perundangan Baharu daripada Emel Masuk',
    emailTopicPlaceholder: 'Subjek emel / Nama perkara anak guam...',
    emailBodyPlaceholder: 'Tampal kandungan emel atau arahan guaman di sini...',
    parseEmailButton: 'Jana Dosir Kes & Kenal Pasti Isu',
    uploadFoldersTitle: 'Dosir Bukti & Dokumen Pelbagai Folder',
    uploadFoldersDesc: 'Muat naik dan susun pliding, kontrak, rantaian emel, dan kenyataan saksi mengikut folder dengan tag metadata.',
    selectFoldersButton: 'Pilih Folder / Fail untuk Ditambah',
    addFolder: '+ Tambah Folder Baharu',
    dualSideFlawAnalysisTitle: 'Matriks Kelemahan Kes Dwipihak',
    claimantFlawsTab: 'Kelemahan Plaintif (Pihak Kami / Anak Guam)',
    respondentFlawsTab: 'Kelemahan Defendan (Pihak Bertentangan)',
    sourceTrackingTab: 'Penjejak Sumber Dokumen & Petikan',
    precedentsUsedTab: 'Statut & Preseden Singapura Digunakan',
    severityCritical: 'RISIKO KRITIKAL',
    severityModerate: 'RISIKO SEDERHANA',
    severityMinor: 'ISU KECIL',
    vulnerabilityQuoteLabel: 'Petikan Kelemahan Faktual / Keterangan:',
    sourceDocLabel: 'Dokumen Sumber & Petikan Baris:',
    statuteCitationLabel: 'Undang-Undang / Preseden Singapura Terpakai:',
    counterStrategyLabel: 'Strategi Pencegahan & Pembaikan Disyorkan:',
    ourExploitationLabel: 'Strategi Pemeriksaan Balas / Eksploitasi Kami:',
    activeCaseInfo: 'Perkara Perundangan Aktif',
    jurisdictionLabel: 'Bidang Kuasa Mahkamah / Forum:',
    disputeValueLabel: 'Nilai Pertikaian:',
    runCorporateAudit: 'Jalankan Audit Penuh Kelemahan Kes',
    runningAudit: 'Meneliti Percanggahan Antara Fail & Menyemak Preseden...',

    filterByTag: 'Tapis Mengikut Tag Metadata',
    tagRelevance: 'Relevansi',
    tagConfidentiality: 'Kerahsiaan / Keistimewaan',
    tagSourceType: 'Jenis Sumber',
    allTags: 'Semua Bukti',
    editMetadataTags: 'Ubah Tag',
    saveMetadataTags: 'Simpan Tag',

    disclaimerNote: 'Iris menyediakan maklumat analitik undang-undang berlandaskan Statut Singapura dan penghakiman mahkamah. Ini tidak menggantikan nasihat peguam bela dan peguam cara bertauliah.',
    close: 'Tutup',
    cancel: 'Batal',
    confirm: 'Sahkan',
    search: 'Cari Statut & Kes Mahkamah Singapura...'
  },

  ta: {
    appTitle: 'Iris சிங்கப்பூர் சட்ட நுண்ணறிவு',
    appSubtitle: 'சிங்கப்பூர் சட்ட ஆலோசனை மற்றும் பெருநிறுவன வழக்கு நுண்ணறிவு',
    tagline: 'சிங்கப்பூர் சட்டங்கள் (SSO) மற்றும் சிங்கப்பூர் மேல்முறையீட்டு நீதிமன்ற முந்தைய தீர்ப்புகளின் அடிப்படையில் இயங்குகிறது',
    modePublic: 'குடிமக்கள் உதவி',
    modeCorporate: 'நிறுவன வழக்கறிஞர்',
    toggleHint: 'பொதுமக்கள் சட்ட வழிகாட்டுதல் மற்றும் நிறுவன வழக்கு கோப்பு ஆய்வு இடையே மாற்றவும்',
    languageSelect: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    statutesDirectory: 'சிங்கப்பூர் சட்டங்கள் மற்றும் முந்தைய தீர்ப்புகள்',
    exportReport: 'அதிகாரப்பூர்வ அறிக்கையை ஏற்றுமதி செய்க',

    publicModeConversational: '💬 உரையாடல் சாட்பாட் (எளிய தகவல் பகிர்வு)',
    publicModeAdvanced: '📋 கட்டமைக்கப்பட்ட படிவம் (மேம்பட்ட முறை)',
    infodumpTitle: 'நடந்ததை உங்கள் சொந்த வார்த்தைகளில் Iris இடம் கூறுங்கள்',
    infodumpSubtitle: 'சட்ட விதிகளையோ பிரிவுகளையோ நீங்கள் தெரிந்து கொள்ள வேண்டிய அவசியமில்லை. நடந்த சம்பவங்களை கீழே தட்டச்சு செய்யவும். Iris உங்கள் சட்ட உரிமைகளை அடையாளம் கண்டு உங்களுக்கு வழிகாட்டும்.',
    infodumpPlaceholder: 'நடந்ததை இங்கே பகிரவும் (எ.கா., "வீட்டு உரிமையாளர் எனது $3500 முன்பணத்தைத் தர மறுக்கிறார்", "கூடுதல் பணி ஊதியம் கேட்டதால் முதலாளி என்னை அறிவிப்பின்றி நீக்கினார்", "கேரௌசலில் வாங்கிய மடிக்கணினி பழுதாகிவிட்டது")...',
    infodumpSend: 'Iris இடம் அனுப்பு',
    infodumpDetected: 'அடையாளம் காணப்பட்ட வழக்கு வகை:',
    infodumpForum: 'பொருத்தமான சிங்கப்பூர் மன்றம்:',
    infodumpRights: 'உங்களுக்குரிய முக்கிய சட்ட உரிமைகள்:',
    generateFullReport: 'முழு அதிகாரப்பூர்வ அறிக்கையை உருவாக்கு',

    publicHeroTitle: 'சிங்கப்பூர் சட்டத்தின் கீழ் உங்கள் சட்டப் பிரச்சினைக்கு தீர்வு காணுங்கள்',
    publicHeroSubtitle: 'உங்கள் வழக்கு விவரங்களை உள்ளிடவும். சிறிய உரிமைகோரல் தீர்ப்பாயம் (SCT), POHA மற்றும் TADM ஆகிய வழிகள், வழக்கின் பலவீனங்கள் மற்றும் வெற்றிபெறத் தேவையான சான்றுகளை Iris ஆராய்கிறது.',
    step1Title: 'உங்கள் வழக்கு விவரங்களை சமர்ப்பிக்கவும்',
    step1Subtitle: 'உண்மைகளை துல்லியமாக உள்ளிடவும். அனைத்து பகுப்பாய்வுகளும் சிங்கப்பூர் சட்டங்கள் மற்றும் நீதிமன்ற தீர்ப்புகளை மேற்கோள் காட்டுகின்றன.',
    caseCategoryLabel: 'வழக்கு வகை',
    caseTitleLabel: 'வழக்கின் தலைப்பு / சுருக்கம்',
    claimAmountLabel: 'மதிப்பிடப்பட்ட கோரிக்கை தொகை (SGD)',
    claimAmountHint: 'சிறிய உரிமைகோரல் தீர்ப்பாயத்தின் வரம்பு $20,000 (இருதரப்பு எழுத்துப்பூர்வ ஒப்புதலுடன் $30,000 வரை). மாஜிஸ்திரேட் நீதிமன்றம் $60,000 வரை.',
    incidentDateLabel: 'சம்பவம் நடந்த தேதி',
    opponentTypeLabel: 'எதிர் தரப்பினரின் வகை',
    descriptionLabel: 'சம்பவ உண்மைகள் மற்றும் காலவரிசை',
    descriptionPlaceholder: 'நடந்ததை விரிவாக விவரிக்கவும்: தேதிகள், தகவல் பரிமாற்றங்கள், ஒப்பந்த மீறல்கள், வாக்குறுதிகள் மற்றும் ஏற்பட்ட நிதி இழப்புகள்...',
    evidenceHeldLabel: 'தற்போது உங்களிடம் உள்ள சான்றுகள் (கற்பிதக்குறியால் பிரிக்கவும்)',
    evidenceHeldPlaceholder: 'எ.கா., கையொப்பமிடப்பட்ட வாடகை ஒப்பந்தம், வாட்ஸ்அப் உரையாடல்கள், வங்கி பரிமாற்ற ரசீது, போலீஸ் அறிக்கை...',
    desiredOutcomeLabel: 'விரும்பிய தீர்வு / நிவாரணம்',
    analyzeButton: 'சிங்கப்பூர் சட்டத்தின்படி வழக்கை ஆய்வு செய்',
    analyzingButton: 'சிங்கப்பூர் சட்டங்கள் மற்றும் தீர்ப்புகளின் கீழ் ஆய்வு செய்கிறது...',
    loadSampleCase: 'உண்மையான சிங்கப்பூர் மாதிரி வழக்குகளை ஏற்றவும்:',
    sampleCaseTenancy: 'வாடகை முன்பண தகராறு ($3,500)',
    sampleCaseEmployment: 'அறிவிப்பின்றி பணிநீக்கம் மற்றும் கூடுதல் பணி ஊதியம் ($4,200)',
    sampleCaseConsumer: 'குறைபாடுள்ள மடிக்கணினி லெமன் சட்ட பணத்தைத் திரும்பப் பெறுதல் ($2,850)',
    sampleCaseHarassment: 'அண்டை வீட்டுக்காரர் தொல்லை (POHA)',

    analysisOverview: 'வழக்கின் சட்டத் தகுதி மற்றும் சாத்தியக்கூறு மதிப்பீடு',
    meritScoreLabel: 'வழக்கு வெற்றி வாய்ப்பு மதிப்பெண்',
    limitationPeriodLabel: 'காலவரையறை சட்டம் (Cap 163) நிலை',
    recommendedForumsTitle: 'சிங்கப்பூரில் பரிந்துரைக்கப்பட்ட சட்ட மன்றங்கள் மற்றும் தீர்வுகள்',
    flawsTitle: 'உங்கள் வழக்கில் உள்ள பலவீனங்கள் மற்றும் பிரச்சினைகள்',
    evidenceChecklistTitle: 'கட்டாய சான்றுகள் சரிபார்ப்புப் பட்டியல் (சான்றுகள் சட்டம் Cap 97)',
    statutesGroundingTitle: 'பொருந்தக்கூடிய சிங்கப்பூர் சட்டங்கள் (SSO)',
    precedentsTitle: 'சிங்கப்பூர் நீதிமன்ற முந்தைய முன்மாதிரி தீர்ப்புகள் (SGCA / SGHC)',
    actionPlanTitle: 'படி படியான நடவடிக்கை திட்டம் மற்றும் தாக்கல் செய்யும் முறை',
    conversationalLegalChat: 'சிங்கப்பூர் சட்ட ஆலோசகருடன் உரையாடல்',
    chatPlaceholder: 'கேள்விகள் கேளுங்கள் (எ.கா., "வீட்டு உரிமையாளர் SCT சமரசத்திற்கு வர மறுத்தால் என்ன செய்வது?", "CJTS மூலம் எவ்வாறு தாக்கல் செய்வது?")...',
    sendQuestion: 'கேள்வியை அனுப்பு',
    printOfficialReport: 'சட்ட ஆலோசனை அறிக்கையை அச்சிடு / சேமி',

    corporateHeroTitle: 'பெருநிறுவன வழக்கறிஞர் நுண்ணறிவு தளம்',
    corporateHeroSubtitle: 'ஒரே நேரத்தில் பல கோப்புறைகளை ஆய்வு செய்தல், சான்றுகளின் மெட்டாடேட்டா குறியீடு, இருதரப்பு பலவீனங்கள் மதிப்பீடு (வாதி vs பிரதிவாதி), மற்றும் துல்லியமான கண்காணிப்பு.',
    newCaseFromEmail: '+ மின்னஞ்சல் தலைப்பிலிருந்து புதிய வழக்கு',
    emailModalTitle: 'மின்னஞ்சலிலிருந்து புதிய சிங்கப்பூர் சட்ட வழக்கை உருவாக்குங்கள்',
    emailTopicPlaceholder: 'மின்னஞ்சல் பொருள் / கிளையண்ட் வழக்கின் பெயர்...',
    emailBodyPlaceholder: 'மின்னஞ்சல் செய்தி அல்லது சட்ட குறிப்பை இங்கே ஒட்டவும்...',
    parseEmailButton: 'வழக்கு ஆவணத்தை உருவாக்கி பிரச்சினைகளைக் கண்டறியவும்',
    uploadFoldersTitle: 'பல கோப்புறை சான்றுகள் மற்றும் ஆவணக் காப்பகம்',
    uploadFoldersDesc: 'ஒப்பந்தங்கள், மின்னஞ்சல்கள், நீதிமன்ற ஆவணங்கள் மற்றும் சாட்சி அறிக்கைகளை கோப்புறைகளாகப் பதிவேற்றி மெட்டாடேட்டா குறியீடுகளுடன் நிர்வகிக்கவும்.',
    selectFoldersButton: 'கோப்புறை / கோப்புகளைத் தேர்ந்தெடுக்கவும்',
    addFolder: '+ புதிய கோப்புறையைச் சேர்க்கவும்',
    dualSideFlawAnalysisTitle: 'இருதரப்பு வழக்கு பலவீனங்கள் மேட்ரிக்ஸ்',
    claimantFlawsTab: 'வாதி தரப்பு பலவீனங்கள் (நமது தரப்பு அபாயங்கள்)',
    respondentFlawsTab: 'பிரதிவாதி தரப்பு பலவீனங்கள் (எதிர் தரப்பு பலவீனங்கள்)',
    sourceTrackingTab: 'ஆவண மூலங்கள் மற்றும் மேற்கோள் கண்காணிப்பாளர்',
    precedentsUsedTab: 'பயன்படுத்தப்பட்ட சிங்கப்பூர் சட்டங்கள் மற்றும் தீர்ப்புகள்',
    severityCritical: 'முக்கிய அபாயம்',
    severityModerate: 'மிதமான அபாயம்',
    severityMinor: 'சிறிய குறைபாடு',
    vulnerabilityQuoteLabel: 'உண்மை அல்லது சான்று பலவீனப் பகுதி:',
    sourceDocLabel: 'மூல ஆவணம் மற்றும் வரி மேற்கோள்:',
    statuteCitationLabel: 'சிங்கப்பூர் சட்டம் / தீர்ப்பு மேற்கோள்:',
    counterStrategyLabel: 'பரிந்துரைக்கப்பட்ட மாற்று உத்தி:',
    ourExploitationLabel: 'நமது குறுக்கு விசாரணை உத்தி:',
    activeCaseInfo: 'செயலில் உள்ள வழக்கு',
    jurisdictionLabel: 'நீதிமன்ற அதிகார வரம்பு:',
    disputeValueLabel: 'தகராறு மதிப்பு:',
    runCorporateAudit: 'முழுமையான வழக்கு பலவீன தணிக்கையை இயக்கவும்',
    runningAudit: 'கோப்புறைகளுக்கிடையிலான முரண்பாடுகளை ஒப்பிட்டு தீர்ப்புகளைத் தேடுகிறது...',

    filterByTag: 'மெட்டாடேட்டா குறியீடு மூலம் வடிகட்டவும்',
    tagRelevance: 'முக்கியத்துவம்',
    tagConfidentiality: 'ரகசியம் / சலுகை',
    tagSourceType: 'மூல வகை',
    allTags: 'அனைத்து சான்றுகளும்',
    editMetadataTags: 'குறியீடுகளை மாற்றவும்',
    saveMetadataTags: 'குறியீடுகளைச் சேமி',

    disclaimerNote: 'Iris சிங்கப்பூர் சட்டங்கள் மற்றும் நீதிமன்றத் தீர்ப்புகளின் அடிப்படையில் சட்ட பகுப்பாய்வை வழங்குகிறது. இது ஒரு வழக்கறிஞரின் நேரடி ஆலோசனையை மாற்றாது.',
    close: 'மூடு',
    cancel: 'ரத்து செய்',
    confirm: 'உறுதி செய்',
    search: 'சிங்கப்பூர் சட்டங்கள் மற்றும் வழக்குகளைத் தேடுங்கள்...'
  }
};

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLimitationPeriod,
  determineSingaporeForum,
  calculateCaseMeritScore,
  parseIncomingEmailToCase,
  synthesizePublicAnalysis,
  classifyPublicInfodump,
  getLocalizedInfodumpInitialReply
} from './singaporeLawEngine';

test('calculateLimitationPeriod computes SCT 2-year limitation correctly', () => {
  const result = calculateLimitationPeriod('2026-01-01', 'consumer', 'sct');
  assert.equal(result.statutoryDeadlineYears, 2);
  assert.ok(result.notes.includes('Small Claims Tribunals Act'));
});

test('calculateLimitationPeriod computes Contract 6-year limitation correctly', () => {
  const result = calculateLimitationPeriod('2025-06-01', 'contract', 'general');
  assert.equal(result.statutoryDeadlineYears, 6);
  assert.ok(result.notes.includes('Section 6(1) of the Limitation Act'));
  assert.equal(result.isWithinPeriod, true);
});

test('calculateLimitationPeriod flags time-barred claims after deadline', () => {
  // 10 years ago
  const result = calculateLimitationPeriod('2015-01-01', 'contract', 'general');
  assert.equal(result.isWithinPeriod, false);
  assert.ok(result.daysRemaining < 0);
});

test('determineSingaporeForum routes small consumer claim to SCT', () => {
  const forum = determineSingaporeForum('consumer', 4500);
  assert.ok(forum.primaryForum.includes('Small Claims Tribunals'));
  assert.equal(forum.hasJurisdiction, true);
  assert.ok(forum.notes.includes('SCTA s 23'));
});

test('determineSingaporeForum routes harassment to POHA Court', () => {
  const forum = determineSingaporeForum('harassment', 0);
  assert.ok(forum.primaryForum.includes('Protection from Harassment Court'));
  assert.ok(forum.timeframe.includes('48-72 hours'));
});

test('determineSingaporeForum routes high-value dispute to High Court', () => {
  const forum = determineSingaporeForum('contract', 1500000);
  assert.ok(forum.primaryForum.includes('General Division of the High Court'));
});

test('calculateCaseMeritScore scores evidence and penalizes time-barred cases', () => {
  const validCase = calculateCaseMeritScore(4, true, true, 450);
  assert.ok(validCase.score >= 80, `Expected score >= 80, got ${validCase.score}`);
  assert.ok(validCase.verdict.includes('Strong Case'));

  const expiredCase = calculateCaseMeritScore(1, false, false, 100);
  assert.ok(expiredCase.score < 50, `Expected score < 50, got ${expiredCase.score}`);
});

test('parseIncomingEmailToCase accurately spots practice area and issues', () => {
  const subject = 'Breach of Charterparty & Demurrage at Jurong Berth';
  const body = 'From: ops@vanguardmarine.sg\nTo: chartering@marinabayhorizon.com\nUrgent notice: Vessel laycan exceeded and unpaid demurrage of $850,000.';
  const parsed = parseIncomingEmailToCase(subject, body);

  assert.ok(parsed.practiceArea.includes('Maritime'));
  assert.ok(parsed.courtJurisdiction.includes('SICC'));
  assert.equal(parsed.urgencyLevel, 'Critical');
  assert.ok(parsed.keyIssuesIdentified.length > 0);
});

test('synthesizePublicAnalysis produces comprehensive report with Singapore statutes and precedents', () => {
  const analysis = synthesizePublicAnalysis({
    title: 'Unpaid overtime and termination',
    category: 'employment',
    claimAmount: 4200,
    incidentDate: '2026-08-01',
    opponentType: 'employer',
    description: 'Terminated after asking for overtime compensation under Employment Act.',
    evidenceHeld: ['Employment contract', 'Timesheets', 'Pay slips'],
    desiredOutcome: 'Recovery of salary and overtime pay'
  });

  assert.ok(analysis.overallMeritScore > 0);
  assert.ok(analysis.flawsIdentified.length > 0);
  assert.ok(analysis.evidenceChecklist.length >= 3);
  assert.ok(analysis.statutoryGrounding.some(s => s.actTitle.includes('Employment Act')));
  assert.ok(analysis.actionPlan.length >= 3);
});

test('classifyPublicInfodump extracts tenancy category and amount from freeform text', () => {
  const result = classifyPublicInfodump('My landlord refuses to return my $3,500 deposit for minor scuffs on the floor');
  assert.equal(result.detectedCategory, 'tenancy');
  assert.equal(result.opponentType, 'landlord');
  assert.equal(result.extractedAmount, 3500);
  assert.ok(result.likelyForum.includes('Small Claims Tribunals'));
});

test('classifyPublicInfodump extracts employment wrongful dismissal from boss infodump', () => {
  const result = classifyPublicInfodump('My boss fired me suddenly because I asked for unpaid overtime of $4200 dollars');
  assert.equal(result.detectedCategory, 'employment');
  assert.equal(result.opponentType, 'employer');
  assert.ok(result.keyLegalRights.some(r => r.includes('Employment Act')));
});

test('getLocalizedInfodumpInitialReply provides localized responses in EN, ZH, MS, and TA', () => {
  const tenancyClassification = classifyPublicInfodump('My landlord refuses to return my $3500 deposit');
  
  const enReply = getLocalizedInfodumpInitialReply(tenancyClassification, 'en');
  assert.ok(enReply.includes('Singapore tenancy law'));
  assert.ok(enReply.includes('Small Claims Tribunal'));

  const zhReply = getLocalizedInfodumpInitialReply(tenancyClassification, 'zh');
  assert.ok(zhReply.includes('新加坡租赁与房屋法令'));
  assert.ok(zhReply.includes('小额索偿法庭'));

  const msReply = getLocalizedInfodumpInitialReply(tenancyClassification, 'ms');
  assert.ok(msReply.includes('Tribunal Tuntutan Kecil'));

  const taReply = getLocalizedInfodumpInitialReply(tenancyClassification, 'ta');
  assert.ok(taReply.includes('சிறு உரிமை தீர்ப்பாயத்தில்'));
});


import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
import {
  calculateLimitationPeriod,
  determineSingaporeForum,
  calculateCaseMeritScore,
  parseIncomingEmailToCase,
  synthesizePublicAnalysis,
  classifyPublicInfodump,
  getLocalizedInfodumpInitialReply
} from './src/utils/singaporeLawEngine.ts';
import { SINGAPORE_STATUTES, SINGAPORE_PRECEDENTS } from './src/data/singaporeLawData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Anthropic client, exposed with the same generateContent call shape the routes already use.
function getAIClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.startsWith('MY_') || apiKey.length < 10) {
    return null;
  }
  const client = new Anthropic({ apiKey });
  return {
    models: {
      generateContent: async ({ contents, config }: { model?: string; contents: string; config?: { responseMimeType?: string; maxOutputTokens?: number; temperature?: number; noThinking?: boolean } }) => {
        const wantsJson = config?.responseMimeType === 'application/json';
        const message = await client.messages.create({
          model: ANTHROPIC_MODEL,
          max_tokens: config?.maxOutputTokens ?? 16000,
          ...(config?.noThinking ? { thinking: { type: 'disabled' as const } } : {}),
          messages: [
            {
              role: 'user',
              content: wantsJson ? `${contents}\n\nReturn only valid JSON, with no code fences or commentary.` : contents
            }
          ]
        });
        const text = message.content.map((block) => (block.type === 'text' ? block.text : '')).join('').trim();
        return { text: wantsJson ? text.replace(/^```(?:json)?\s*|\s*```$/g, '') : text };
      }
    }
  };
}

// Timeout wrapper to prevent hanging network calls with generous threshold for Cloud Run & LLM generation
async function callWithTimeout<T>(promise: Promise<T>, timeoutMs: number = 25000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI request timeout')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// GET statutes and precedents
app.get('/api/statutes', (_req: Request, res: Response) => {
  res.json({
    statutes: SINGAPORE_STATUTES,
    precedents: SINGAPORE_PRECEDENTS
  });
});

// POST Public Infodump Conversational Intake
app.post('/api/public/infodump', async (req: Request, res: Response) => {
  try {
    const { narrativeText, language = 'en' } = req.body;
    if (!narrativeText || !narrativeText.trim()) {
      return res.status(400).json({ error: 'Narrative text required' });
    }

    const classification = classifyPublicInfodump(narrativeText);
    const ai = getAIClient();

    if (ai) {
      try {
        const langInstructions = {
          en: 'Reply in plain, direct, everyday English without jargon.',
          zh: '请用直接、简明且易懂的简体中文回答，不要使用晦涩难懂的法言法语，让普通老百姓一目了然。',
          ms: 'Sila jawab dalam Bahasa Melayu yang terus, jelas, dan mudah difahami oleh orang awam.',
          ta: 'தயவுசெய்து எளிய மற்றும் நேரடியான தமிழில் பதிலளிக்கவும்.'
        }[language as 'en' | 'zh' | 'ms' | 'ta'] || 'Reply in plain, direct English.';

        const prompt = `You are Iris, a direct Singapore Legal Intelligence Assistant for the everyday general public.
The user is sharing what happened to them without knowing legal categories or jargon.
Language: ${langInstructions}

User Story:
"${narrativeText}"

Task:
1. State the legal position in one sentence. Do not comment on their feelings.
2. Clearly identify their legal rights and cause of action under Singapore Law (e.g. Employment Act 1968, Protection from Harassment Act POHA 2014, Consumer Protection Fair Trading Act CPFTA Lemon Law, Small Claims Tribunals Act).
3. Outline what they can do next in simple, actionable terms (e.g. Small Claims Tribunal via CJTS, TADM mediation, POHA Court).
4. Highlight 2-3 specific pieces of evidence they must preserve (Evidence Act s 103/116A: WhatsApp logs, receipts, contracts).
5. Ask 1-2 friendly follow-up questions to understand their situation better.

Be direct and factual. Do not reassure, sympathise, encourage, or praise. Keep the whole reply under 180 words. One short line per point.
Use these section titles in bold, in this order: **LEGAL ACTS & CHARTERS**, **NEXT STEPS**, **RETAIN THESE INFORMATION**, **FOLLOW-UP QUESTIONS**.
Formatting: put each section title on its own line in bold, for example **NEXT STEPS**. Use lines starting with "- " for bullet points.`;

        // Use gemini-3.1-flash-lite for instant conversational intake with 20s timeout
        const response = await callWithTimeout(
          ai.models.generateContent({
            model: ANTHROPIC_MODEL,
            contents: prompt,
            config: {
              maxOutputTokens: 8000,
              noThinking: true,
              temperature: 0.5
            }
          }),
          20000
        );

        if (response.text) {
          return res.json({
            classification,
            reply: response.text,
            statutoryCitations: ['Singapore Statutes Online (SSO)', 'Evidence Act (Cap 97) s 103']
          });
        }
      } catch (geminiErr: any) {
        console.info('[Iris Legal AI] Gemini infodump call fell back to Singapore statutory engine:', geminiErr?.message || geminiErr);
      }
    }

    const localizedReply = getLocalizedInfodumpInitialReply(classification, language as any);

    return res.json({
      classification,
      reply: localizedReply,
      statutoryCitations: ['Singapore Statutes Online (SSO)', 'Small Claims Tribunals Act']
    });
  } catch (err: any) {
    console.error('Error in /api/public/infodump:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST Translate a spoken or typed account into English before classification
app.post('/api/public/translate', async (req: Request, res: Response) => {
  try {
    const { text, sourceLanguage = 'en' } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'Text required' });
    }

    const ai = getAIClient();
    if (ai && sourceLanguage !== 'en') {
      try {
        const response = await callWithTimeout(
          ai.models.generateContent({
            model: ANTHROPIC_MODEL,
            contents: `Translate the following account into plain English. Keep names, dates, amounts and places exactly as given. Return only the translation, with no commentary.\n\n${text}`,
            config: { maxOutputTokens: 800, temperature: 0 }
          }),
          15000
        );
        if (response.text) {
          return res.json({ english: response.text.trim(), translated: true });
        }
      } catch (geminiErr: any) {
        console.info('[Iris Legal AI] Translation fell back to original text:', geminiErr?.message || geminiErr);
      }
    }

    return res.json({ english: String(text).trim(), translated: false });
  } catch (err: any) {
    console.error('Error in /api/public/translate:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST Public Case Analysis
app.post('/api/public/analyze', async (req: Request, res: Response) => {
  try {
    const { input, language = 'en' } = req.body;
    if (!input || !input.title || !input.description) {
      return res.status(400).json({ error: 'Missing required case title or description' });
    }

    // Baseline calculation from deterministic Singapore Law Engine
    const baseline = synthesizePublicAnalysis(input);

    const ai = getAIClient();
    if (ai) {
      try {
        const langInstructions = {
          en: 'Respond in professional English.',
          zh: '请用专业的简体中文回答，同时保留关键的新加坡法庭及法令英文缩写与引证 (例如 Small Claims Tribunal, POHA, SGCA)。',
          ms: 'Sila jawab dalam Bahasa Melayu yang profesional, sambil mengekalkan istilah statut dan nama mahkamah Singapura rasmi.',
          ta: 'தயவுசெய்து தொழில்முறை தமிழில் பதிலளிக்கவும், அதே நேரத்தில் சிங்கப்பூர் சட்டங்கள் மற்றும் நீதிமன்றங்களின் அதிகாரப்பூர்வ பெயர்களையும் குறிப்பிடவும்.'
        }[language as 'en' | 'zh' | 'ms' | 'ta'] || 'Respond in professional English.';

        const prompt = `You are Iris, a senior Singapore legal intelligence AI.
Analyze the following public citizen legal case under Singapore Law ONLY.
Language requirement: ${langInstructions}

Grounding instructions:
1. Ground your analysis STRICTLY on Singapore law statutes (Singapore Statutes Online - SSO) such as Employment Act 1968, Protection from Harassment Act (POHA) 2014, Consumer Protection (Fair Trading) Act 2003, Small Claims Tribunals Act 1984, Civil Law Act 1909, and Evidence Act 1893.
2. Ground and cite landmark Singapore Court of Appeal (SGCA) or High Court (SGHC) precedents with full official neutral citations (e.g., Spandeck Engineering [2007] 4 SLR(R) 100, Chwee Kin Keong [2005] 1 SLR(R) 502, ACB v Thomson Medical [2017] 1 SLR 918, Sim Cheng Run [2021] SGHC 279).
3. Evaluate:
   - What the user can legally do (exact Singapore forums: Small Claims Tribunal, TADM/ECT, POHA Court, Magistrate's Court).
   - Weaknesses & problems with their case (evidentiary burden under Evidence Act s 103, absence of contemporaneous records, limitation risks).
   - Evidence required to win (specific documents, WhatsApp/email exports with timestamps, inspection logs, receipts).
   - Step-by-step procedural action plan.

Case Details:
- Title: ${input.title}
- Category: ${input.category}
- Claim Amount: SGD ${input.claimAmount || 0}
- Incident Date: ${input.incidentDate}
- Opponent: ${input.opponentType}
- Facts: ${input.description}
- Evidence Held: ${JSON.stringify(input.evidenceHeld)}
- Desired Outcome: ${input.desiredOutcome}

Return a valid JSON object matching this schema:
{
  "summary": "Detailed legal executive summary",
  "overallMeritScore": 75,
  "meritVerdict": "Favorable Case Merits / Strong Case...",
  "recommendedForums": [
    {
      "title": "Small Claims Tribunals (SCT)",
      "forum": "Small Claims Tribunals (State Courts)",
      "costEstimate": "SGD $10 - $50",
      "timeframe": "2 - 4 weeks",
      "description": "...",
      "statuteReference": "Small Claims Tribunals Act s 5",
      "precedentCitation": "...",
      "pros": ["..."],
      "cons": ["..."]
    }
  ],
  "flawsIdentified": [
    {
      "severity": "high",
      "issue": "...",
      "impactOnCase": "...",
      "counterStrategy": "...",
      "legalBasis": "..."
    }
  ],
  "evidenceChecklist": [
    {
      "item": "...",
      "priority": "essential",
      "purpose": "...",
      "howToObtain": "...",
      "evidenceActNote": "..."
    }
  ],
  "statutoryGrounding": [
    {
      "actTitle": "...",
      "section": "...",
      "summary": "...",
      "ssoLink": "https://sso.agc.gov.sg"
    }
  ],
  "precedentCitations": [
    {
      "caseName": "...",
      "citation": "...",
      "principle": "...",
      "court": "SGCA"
    }
  ],
  "actionPlan": [
    {
      "stepNumber": 1,
      "phase": "...",
      "action": "...",
      "deadlineNotice": "..."
    }
  ]
}`;

        const response = await callWithTimeout(
          ai.models.generateContent({
            model: ANTHROPIC_MODEL,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          }),
          30000
        );

        if (response.text) {
          const parsed = JSON.parse(response.text);
          // Enrich with exact limitation calculation
          parsed.limitationStatus = baseline.limitationStatus;
          return res.json({ result: parsed, source: ANTHROPIC_MODEL });
        }
      } catch (aiErr: any) {
        console.info('[Iris Legal AI] Gemini analysis call fell back to Singapore statutory engine:', aiErr?.message || aiErr);
      }
    }

    // Return deterministic fallback
    return res.json({ result: baseline, source: 'deterministic-sg-engine' });
  } catch (err: any) {
    console.error('Error in /api/public/analyze:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST Conversational Q&A (Public Case Follow-ups)
app.post('/api/public/chat', async (req: Request, res: Response) => {
  try {
    const { messages, caseContext, language = 'en' } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing messages array' });
    }

    const lastMessage = messages[messages.length - 1]?.text || '';
    const ai = getAIClient();

    if (ai) {
      try {
        const langInstructions = {
          en: 'Reply in clear, professional English.',
          zh: '请用专业但易懂的简体中文回答，并在适当地方注明新加坡法律术语（例如小额法庭 SCT, 防止骚扰法 POHA）。',
          ms: 'Sila jawab dalam Bahasa Melayu yang jelas dan mesra orang awam, sambil menyatakan terma undang-undang Singapura.',
          ta: 'சிங்கப்பூர் சட்ட விதிகளைக் குறிப்பிட்டு தெளிவான தமிழில் பதிலளிக்கவும்.'
        }[language as 'en' | 'zh' | 'ms' | 'ta'] || 'Reply in clear English.';

        const prompt = `You are Iris, an interactive Singapore Legal Advisor assisting a citizen with their legal case.
Language requirement: ${langInstructions}

Rules:
- Give practical, actionable advice strictly based on Singapore statutes (SSO) and Singapore court rules.
- Always cite the relevant Singapore Statute or precedent where applicable (e.g., SCTA 1984 s 5, Employment Act 1968 s 14, POHA s 3, Evidence Act s 103, Spandeck [2007] 4 SLR(R) 100).
- If the user asks about procedures (e.g. filing, costs, timelines, evidence, CJTS), give specific Singapore State Courts procedural details.
- Clarify what they can do next and warn them of risks.

Case Context:
Title: ${caseContext?.title || 'User Legal Inquiry'}
Category: ${caseContext?.category || 'General'}
Claim Amount: SGD ${caseContext?.claimAmount || 0}
User Question: "${lastMessage}"

Conversation History:
${messages.slice(-4, -1).map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}

Give a direct answer in under 250 words, starting with the answer. Do not reassure, sympathise, or encourage. Be legally precise.
Formatting: put each section title on its own line in bold, for example **NEXT STEPS**. Use lines starting with "- " for bullet points.`;

        const response = await callWithTimeout(
          ai.models.generateContent({
            model: ANTHROPIC_MODEL,
            contents: prompt,
            config: {
              maxOutputTokens: 8000,
              noThinking: true,
              temperature: 0.5
            }
          }),
          20000
        );

        if (response.text) {
          return res.json({
            reply: response.text,
            statutoryCitations: ['Singapore Statutes Online (SSO)', 'Evidence Act (Cap 97) s 103'],
            precedentCitations: ['Singapore Court of Appeal Jurisprudence']
          });
        }
      } catch (geminiErr: any) {
        console.info('[Iris Legal AI] Gemini chat call fell back to Singapore statutory advice:', geminiErr?.message || geminiErr);
      }
    }

    // Deterministic fallback response
    let fallbackReply = `Regarding your inquiry under Singapore Law: In disputes of this nature, you can lodge an application with the relevant Singapore tribunal (such as the Small Claims Tribunal via the Community Justice and Tribunals System - CJTS, or TADM for employment matters). Ensure all contemporaneous WhatsApp messages, invoices, and bank transfer slips are compiled into an exhibit bundle pursuant to Section 103 of the Evidence Act (Cap 97).`;
    if (lastMessage.toLowerCase().includes('cost') || lastMessage.toLowerCase().includes('fee')) {
      fallbackReply = `Filing fees in Singapore are kept deliberately affordable for tribunals: Small Claims Tribunal filing fees range from SGD $10 to $50 depending on the claim quantum. Applications under the Protection from Harassment Act (POHA) cost approximately SGD $200 for an Expedited Protection Order (EPO).`;
    } else if (lastMessage.toLowerCase().includes('time') || lastMessage.toLowerCase().includes('long')) {
      fallbackReply = `For Small Claims Tribunals, an initial consultation mediation session is typically scheduled within 10 to 14 days of online e-filing via CJTS. If unresolved, a tribunal hearing before a referee occurs within 3 to 6 weeks.`;
    }

    return res.json({
      reply: fallbackReply,
      statutoryCitations: ['Small Claims Tribunals Act (Cap 308) s 5', 'Evidence Act (Cap 97) s 103'],
      precedentCitations: ['Spandeck Engineering [2007] 4 SLR(R) 100']
    });
  } catch (err: any) {
    console.error('Error in /api/public/chat:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST Corporate Email to Case
app.post('/api/corporate/email-to-case', async (req: Request, res: Response) => {
  try {
    const { emailSubject, emailBody } = req.body;
    if (!emailSubject && !emailBody) {
      return res.status(400).json({ error: 'Email subject or body required' });
    }

    const parsed = parseIncomingEmailToCase(emailSubject || '', emailBody || '');
    res.json({ result: parsed });
  } catch (err: any) {
    console.error('Error in /api/corporate/email-to-case:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST Corporate Dual-Side Flaw Analysis
app.post('/api/corporate/analyze', async (req: Request, res: Response) => {
  try {
    const { caseData, language = 'en' } = req.body;

    const ai = getAIClient();
    if (ai && caseData) {
      try {
        const prompt = `You are a Senior Singapore Corporate Litigation Counsel & Partner.
Analyze this commercial dispute dossier involving multiple evidence folders, emails, contracts, and pleadings under Singapore Law.
Language: ${language}

Task:
1. Conduct an exhaustive dual-sided flaw audit:
   - Claimant Vulnerabilities (our client's weaknesses: failure to mitigate, notice delays, ambiguity, estoppel).
   - Respondent Vulnerabilities (opposing party flaws: admissions in email chains, failure to serve contemporaneous protest, breach of express terms).
2. For EVERY vulnerability, cite the EXACT file name, paragraph/clause number, and exact email timestamp.
3. Ground every flaw in Singapore Statutes (e.g. Evidence Act 1893 s 17-21, Civil Law Act s 6, Companies Act s 157) and Singapore Court of Appeal (SGCA) / SICC precedents (e.g. Spandeck Engineering, Chwee Kin Keong, PT Perusahaan Gas Negara).

Case Metadata:
- Title: ${caseData.caseTitle}
- Client: ${caseData.clientName}
- Adverse Party: ${caseData.adverseParty}
- Jurisdiction: ${caseData.courtJurisdiction}
- Dispute Value: ${caseData.disputeValue}
- Folders & Files: ${JSON.stringify(caseData.files?.map((f: any) => ({ folder: f.folderName, name: f.fileName, summary: f.contentSummary, metadata: f.metadata })))}

Return a JSON matching this schema:
{
  "claimantFlaws": [
    {
      "id": "c1",
      "title": "...",
      "severity": "critical",
      "description": "...",
      "vulnerabilityQuote": "...",
      "sourceDocument": "...",
      "sourceCitation": "...",
      "opposingArgument": "...",
      "mitigationStrategy": "...",
      "statuteOrPrecedent": "..."
    }
  ],
  "respondentFlaws": [
    {
      "id": "r1",
      "title": "...",
      "severity": "critical",
      "description": "...",
      "vulnerabilityQuote": "...",
      "sourceDocument": "...",
      "sourceCitation": "...",
      "ourExploitationStrategy": "...",
      "statuteOrPrecedent": "..."
    }
  ],
  "sourceTracking": [
    {
      "id": "s1",
      "docName": "...",
      "folder": "...",
      "date": "...",
      "citedInIssues": ["..."],
      "relevanceGrade": "High",
      "statutoryTies": ["..."]
    }
  ],
  "statutoryPrecedentsUsed": [
    {
      "type": "statute",
      "title": "...",
      "citation": "...",
      "courtOrAuthority": "...",
      "applicationToCase": "..."
    }
  ]
}`;

        let response: any = null;
        let auditContents = prompt;
        let speedFocus = false;
        for (let attempt = 0; attempt < 3 && !response?.text; attempt++) {
          if (attempt > 0 && !speedFocus) await new Promise((resolve) => setTimeout(resolve, 3000));
          try {
            response = await callWithTimeout(
              ai.models.generateContent({
                model: ANTHROPIC_MODEL,
                contents: auditContents,
                config: {
                  responseMimeType: 'application/json'
                }
              }),
              300000
            );
          } catch (attemptErr: any) {
            const timedOut = String(attemptErr?.message || '').includes('timeout');
            console.info(`[Iris Legal AI] Corporate audit attempt ${attempt + 1} failed:`, attemptErr?.message || attemptErr);
            if (!timedOut) continue;
            if (speedFocus) break;
            speedFocus = true;
            console.info('[Iris Legal AI] Audit passed 5 minutes. Switching to speed focus.');
            auditContents = `${prompt}\n\nSPEED FOCUS (overrides the exhaustive requirement above): the exhaustive audit ran past 5 minutes. Return only the 3 most serious claimant flaws and the 3 most serious respondent flaws. Keep every field to one short sentence. Leave out all other points.`;
          }
        }

        if (response?.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ result: parsed, source: ANTHROPIC_MODEL, mode: speedFocus ? 'speed' : 'exhaustive' });
        }
      } catch (aiErr: any) {
        console.info('[Iris Legal AI] Corporate dual-side AI call fell back to statutory dossier engine:', aiErr?.message || aiErr);
      }
    }

    return res.status(503).json({ error: 'AI audit unavailable. Wait a minute, then run the audit again.' });
  } catch (err: any) {
    console.error('Error in /api/corporate/analyze:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST Compare Audit Points with a Court Ruling
app.post('/api/corporate/compare-ruling', async (req: Request, res: Response) => {
  try {
    const { flaws, ruling, language = 'en' } = req.body;
    if (!Array.isArray(flaws) || flaws.length === 0 || !ruling) {
      return res.status(400).json({ error: 'Audit points and ruling required' });
    }

    const ai = getAIClient();
    if (!ai) return res.status(503).json({ error: 'AI unavailable' });

    const prompt = `You are a Singapore litigation counsel checking an internal audit against a court ruling.
Language: ${language}

Court ruling:
Final decision: ${ruling.finalDecision}
Deciding factors: ${JSON.stringify(ruling.decidingFactors || [])}
Influencing factors: ${JSON.stringify(ruling.influencingFactors || [])}

Audit points:
${JSON.stringify(flaws)}

Task: for each audit point, decide whether the court used it.
- "used": the court's decision, deciding factors, or influencing factors rely on this point or a point that covers it.
- "ignored": the court did not rely on this point.
Give a reason of one sentence for each point. Do not invent court reasoning that is not in the ruling.

Return JSON in this form:
{"results":[{"id":"<audit point id>","status":"used" | "ignored","reason":"..."}]}`;

    let parsed: any = null;
    let lastErr: any = null;
    const attempts = [ANTHROPIC_MODEL, ANTHROPIC_MODEL, ANTHROPIC_MODEL];
    for (const [attempt, model] of attempts.entries()) {
      if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
      try {
        const response = await callWithTimeout(
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          }),
          35000
        );
        parsed = JSON.parse(response.text || '{"results":[]}');
        break;
      } catch (modelErr: any) {
        lastErr = modelErr;
        console.info(`[Iris Legal AI] Ruling comparison failed on ${model}:`, modelErr?.message || modelErr);
      }
    }

    if (!parsed) {
      return res.status(503).json({ error: lastErr?.message || 'AI unavailable' });
    }
    return res.json({ results: parsed.results || [] });
  } catch (err: any) {
    console.error('Error in /api/corporate/compare-ruling:', err);
    res.status(500).json({ error: err.message || 'Comparison failed' });
  }
});

// Dev vs Prod Vite Integration
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Iris Singapore Legal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

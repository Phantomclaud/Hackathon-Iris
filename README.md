# Iris: Singapore Law AI Intelligence

Iris is a legal information app for Singapore. It has two sides:

- **Public:** a citizen describes a dispute in plain language. Iris identifies the likely legal issue, the forum, the relevant statutes, and the next steps. It supports speech input and English, Chinese, Malay, and Tamil.
- **Corporate:** a litigation team manages a case file, runs a dual-sided flaw audit, and compares that audit with a court ruling.

Iris provides legal information, not legal advice. It does not replace an advocate and solicitor.

## Features

**Public**
- Plain-language intake with a structured reply: legal position, next steps, evidence to keep, and follow-up questions.
- Analysis form for a case with a category, parties, claim amount, and evidence.
- Chat for follow-up questions.
- Source check: each answer is compared with the app's statute and precedent lists. Statutes get SSO links, and unknown citations are flagged as unverified.
- Speech input with a language menu. Non-English speech is translated to English before it goes into the description box.
- Full translation of the public page in English, Chinese, Malay, and Tamil.

**Corporate**
- Case folders: each case is saved in the browser, so you can reopen it later. Cases can be marked completed, archived, reopened, or restored. The archive is searchable and collapsible.
- Document register with folders, metadata tags (relevance, confidentiality, source type), and file summaries.
- Email import: load `.eml` files and fill a new case from one of them.
- Email agent: describe the email you need, and Claude searches and reads your Gmail using tools to find it. You choose the email before a case is created.
- Dual-sided flaw audit: claimant and respondent vulnerabilities, with sources. Running an audit shows a progress bar. An exhaustive audit that runs past 5 minutes is retried as a shorter speed-focused audit.
- Court ruling section: for held-out test cases, the audit is produced first, and then the ruling is revealed and compared with the audit. Each audit point is marked as used or ignored by the court, with a reason.
- Case studies: the 45 judgments in the case library are available as archived case folders, with their facts, issues, and holdings.

## Requirements

- **Node.js** (the project was developed and run on Node 26 on Windows).
- **An Anthropic API key** for the AI features. Without a key, the AI routes return errors and the app shows its fallback text.
- **Google Chrome or Microsoft Edge** for speech input. Chrome sends audio to Google's speech service.

## Setup

```bash
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is needed because the project has an existing esbuild version conflict between Vite and tsx.

Create your environment file from the example and add your key:

```bash
cp .env.example .env
```

Then edit `.env`:

```
ANTHROPIC_API_KEY="your-key-here"
ANTHROPIC_MODEL="claude-haiku-5-5"
```

Keep `.env` out of version control. It's listed in `.gitignore`.

## Running

```bash
npm run dev
```

Open http://localhost:3000.

The server (`server.ts`) runs the API and the Vite dev server together. If you change `server.ts` or `.env`, restart `npm run dev`. Changes to files under `src/` update in the browser on refresh.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the server and the app on port 3000 |
| `npm start` | Same as `dev` |
| `npm run build` | Builds the front end with Vite |
| `npm run lint` | Type-checks the project with `tsc --noEmit` |

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Yes, for AI features | API key for Claude |
| `ANTHROPIC_MODEL` | No | Model name. Defaults to `claude-haiku-5-5` |
| `APP_URL` | No | Public URL of the app when hosted. Not needed locally |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` | No, for the email agent | Gmail read-only access. Without them, the agent reports that Gmail is not connected |

### Gmail setup (for the email agent)

1. In Google Cloud, create a project and enable the Gmail API.
2. Create an OAuth client ID of type Desktop app. Note the client ID and secret.
3. Use the OAuth 2.0 Playground to get a refresh token for the scope `https://www.googleapis.com/auth/gmail.readonly`.
4. Put the three values in `.env` and restart the server.

The agent only reads mail. It can't send, delete, or change anything in the inbox.

## How the AI is used

Every AI call goes to Claude. Most calls send a text prompt and read the text reply. The only tool use is the email agent (`/api/corporate/email-agent`), where Claude calls read-only Gmail tools to find an email. The app doesn't use web search.

| Route | Purpose | Notes |
| --- | --- | --- |
| `/api/public/infodump` | Plain-language intake reply | Thinking disabled for speed. Under 180 words |
| `/api/public/chat` | Follow-up chat | Thinking disabled for speed. Under 250 words |
| `/api/public/translate` | Translate non-English speech to English | Only called for non-English speech |
| `/api/public/analyze` | Public case analysis | |
| `/api/corporate/analyze` | Dual-sided audit | Exhaustive first. Switches to speed focus after 5 minutes. Thinking on |
| `/api/corporate/compare-ruling` | Mark audit points as used or ignored by the court | Retries on busy errors |
| `/api/corporate/email-agent` | Claude calls `search_emails` and `read_email` (Gmail) until it finds the email the task describes | Tool use. Up to six tool turns. Read-only |

If an AI call fails, the public routes fall back to text from the statute engine (`src/utils/singaporeLawEngine.ts`). The corporate audit returns an error instead of a fallback, so the page never shows an audit that the AI didn't produce.

## Legal data

Iris works from fixed data in `src/data/`. It does not look up SSO or court databases while it answers.

- `singaporeLawData.ts`: the statute list (with SSO links), the core precedent list, and the sample cases.
- `caseStudies.ts`: the 45 library judgments, as generated from the PDFs in the case library. Each entry has its citation, facts, issues, holding, and significance.
- `caseRulings.ts`: the final decision, deciding factors, and influencing factors for each judgment.
- `evaluationSplit.ts`: the held-out test set. These judgments are left out of the precedent list, and their holdings are kept out of the audit input.

Judgments outside the held-out set are used as the knowledge base, and their rulings are shown for reference only. Held-out judgments are used only to score audits. They're listed by citation, so duplicate copies of the same judgment are held out together.

## Project structure

```
server.ts                       Express server, AI client, and API routes
src/
  App.tsx                       App shell and mode switch (public / corporate)
  components/
    PublicView.tsx              Public intake, analysis, and chat
    CorporateView.tsx           Corporate case folders, audit, and court ruling
    FormattedText.tsx           Renders bold headings and bullets in replies
    SourceFlags.tsx             Source check panel
    Header.tsx, PrintReportModal.tsx, StatutesDirectoryModal.tsx
  data/                         Statutes, precedents, case studies, rulings, split
  translations/index.ts         All interface text in four languages
  types/legal.ts                Shared types
  utils/
    singaporeLawEngine.ts       Statute-based fallback engine
    sourceCheck.ts              Client-side citation check
    emlParser.ts                .eml file reader
```

## Known limitations

- **Statutes are not checked live.** The AI answers from its training and the fixed lists. Check any section number against SSO before relying on it.
- **Case summaries need checking.** The facts, holdings, and rulings were written by reading each judgment with an AI. Spot-check them against the judgment.
- **The AI may already know the library cases.** The held-out split keeps the app's own data clean, but it can't remove knowledge the model learned in training.
- **Translations need review.** Malay and Tamil text was written without a native-speaker check.
- **Corporate case storage is per browser.** Saved cases live in the browser's local storage. They don't sync between computers or browsers.
- **Speech input** works only in Chrome and Edge.
- **Audit speed.** An exhaustive audit can take several minutes. The progress bar shows that a request is running, not how far along it is.
- **Unit tests.** `src/utils/singaporeLawEngine.test.ts` exists, but no script runs it.

## Source

Repository: https://github.com/Phantomclaud/Hackathon-Iris

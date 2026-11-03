// Gmail tools for the corporate email agent. Claude chooses which tool to call through the Anthropic tool-use API.

export const GMAIL_TOOLS = [
  {
    name: 'search_emails',
    description:
      'Search the connected Gmail inbox using Gmail search syntax, for example: from:client@example.com subject:termination newer_than:90d. Returns up to max_results emails with id, from, subject, date and snippet.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Gmail search query' },
        max_results: { type: 'integer', description: 'Number of emails to return, from 1 to 10', minimum: 1, maximum: 10 }
      },
      required: ['query']
    }
  },
  {
    name: 'read_email',
    description: 'Read the full plain-text body of one email, using an id returned by search_emails.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Message id from search_emails' }
      },
      required: ['id']
    }
  }
];

type GmailHeader = { name: string; value: string };

let cachedToken: { value: string; expiresAt: number } | null = null;

export function isGmailConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN);
}

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) return cachedToken.value;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN!,
      grant_type: 'refresh_token'
    })
  });
  if (!res.ok) throw new Error(`Gmail sign-in failed (${res.status})`);

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function gmailGet(path: string): Promise<any> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
    headers: { Authorization: `Bearer ${await accessToken()}` }
  });
  if (!res.ok) throw new Error(`Gmail request failed (${res.status})`);
  return res.json();
}

function headerValue(headers: GmailHeader[] | undefined, name: string): string {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function plainText(payload: any): string {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain' && payload.body?.data) return decodeBase64Url(payload.body.data);
  for (const part of payload.parts ?? []) {
    const text = plainText(part);
    if (text) return text;
  }
  return '';
}

export async function runGmailTool(name: string, input: any): Promise<any> {
  if (!isGmailConfigured()) {
    return {
      error: 'Gmail is not connected. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GMAIL_REFRESH_TOKEN in the environment file.'
    };
  }

  if (name === 'search_emails') {
    const max = Math.min(Math.max(Number(input?.max_results) || 5, 1), 10);
    const list = await gmailGet(`messages?q=${encodeURIComponent(String(input?.query || ''))}&maxResults=${max}`);
    const emails = [];
    for (const item of list.messages ?? []) {
      const msg = await gmailGet(
        `messages/${item.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`
      );
      const headers = msg.payload?.headers as GmailHeader[] | undefined;
      emails.push({
        id: item.id,
        from: headerValue(headers, 'From'),
        subject: headerValue(headers, 'Subject'),
        date: headerValue(headers, 'Date'),
        snippet: msg.snippet ?? ''
      });
    }
    return { count: emails.length, emails };
  }

  if (name === 'read_email') {
    const msg = await gmailGet(`messages/${encodeURIComponent(String(input?.id || ''))}?format=full`);
    const headers = msg.payload?.headers as GmailHeader[] | undefined;
    const body = plainText(msg.payload) || msg.snippet || '';
    return {
      id: msg.id,
      from: headerValue(headers, 'From'),
      to: headerValue(headers, 'To'),
      subject: headerValue(headers, 'Subject'),
      date: headerValue(headers, 'Date'),
      body: body.slice(0, 6000)
    };
  }

  return { error: `Unknown tool: ${name}` };
}

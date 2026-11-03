export interface ParsedEmail {
  fileName: string;
  subject: string;
  from: string;
  date: string;
  body: string;
}

function parseHeaders(block: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const unfolded = block.replace(/\n[ \t]+/g, ' ');
  for (const line of unfolded.split('\n')) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const name = line.slice(0, idx).trim().toLowerCase();
    if (!(name in headers)) headers[name] = line.slice(idx + 1).trim();
  }
  return headers;
}

function decodeQuotedPrintable(input: string): string {
  const cleaned = input.replace(/=\n/g, '');
  const parts = cleaned.split(/((?:=[0-9A-Fa-f]{2})+)/);
  const bytes: number[] = [];
  for (const part of parts) {
    if (/^(=[0-9A-Fa-f]{2})+$/.test(part)) {
      for (const hex of part.match(/[0-9A-Fa-f]{2}/g) || []) bytes.push(parseInt(hex, 16));
    } else {
      bytes.push(...new TextEncoder().encode(part));
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function decodeBase64(input: string): string {
  try {
    const binary = atob(input.replace(/\s+/g, ''));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return input;
  }
}

function decodeEncodedWords(value: string): string {
  return value.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_, _charset, enc, text) => {
    if (enc.toUpperCase() === 'B') return decodeBase64(text);
    return decodeQuotedPrintable(text.replace(/_/g, ' '));
  });
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractBody(headers: Record<string, string>, body: string): string {
  const contentType = (headers['content-type'] || 'text/plain').toLowerCase();

  if (contentType.startsWith('multipart/')) {
    const boundaryMatch = (headers['content-type'] || '').match(/boundary="?([^";]+)"?/i);
    if (!boundaryMatch) return body;
    const parts = body.split(`--${boundaryMatch[1]}`).slice(1);
    let htmlFallback = '';
    for (const part of parts) {
      if (part.startsWith('--')) continue;
      const split = part.indexOf('\n\n');
      if (split < 0) continue;
      const partHeaders = parseHeaders(part.slice(0, split));
      const partType = (partHeaders['content-type'] || '').toLowerCase();
      if (partType.startsWith('text/plain')) return extractBody(partHeaders, part.slice(split + 2));
      if (partType.startsWith('text/html') && !htmlFallback) htmlFallback = extractBody(partHeaders, part.slice(split + 2));
      if (partType.startsWith('multipart/')) {
        const nested = extractBody(partHeaders, part.slice(split + 2));
        if (nested) return nested;
      }
    }
    return htmlFallback;
  }

  const encoding = (headers['content-transfer-encoding'] || '').toLowerCase();
  let text = body;
  if (encoding === 'quoted-printable') text = decodeQuotedPrintable(body);
  else if (encoding === 'base64') text = decodeBase64(body);

  if (contentType.startsWith('text/html')) text = stripHtml(text);
  return text.trim();
}

export function parseEml(raw: string, fileName: string): ParsedEmail {
  const normalized = raw.replace(/\r\n/g, '\n');
  const split = normalized.indexOf('\n\n');
  const headerBlock = split >= 0 ? normalized.slice(0, split) : normalized;
  const bodyBlock = split >= 0 ? normalized.slice(split + 2) : '';
  const headers = parseHeaders(headerBlock);

  return {
    fileName,
    subject: decodeEncodedWords(headers['subject'] || '') || fileName,
    from: decodeEncodedWords(headers['from'] || ''),
    date: headers['date'] || '',
    body: extractBody(headers, bodyBlock)
  };
}

/**
 * DeepL translation helper using REST API.
 * Requires DEEPL_API_KEY in environment. Optionally DEEPL_API_URL (default: https://api-free.deepl.com).
 */

type SupportedLang = 'en' | 'fr' | 'es';

function toDeeplLang(lang: SupportedLang): string {
  // Map to DeepL target/source language codes
  switch (lang) {
    case 'en':
      return 'EN';
    case 'fr':
      return 'FR';
    case 'es':
      return 'ES';
    default:
      return 'EN';
  }
}

export async function translateTextsWithDeepl(
  texts: string[],
  source: SupportedLang,
  target: SupportedLang
): Promise<string[]> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPL_API_KEY environment variable is not set');
  }
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const baseUrl = process.env.DEEPL_API_URL || 'https://api-free.deepl.com';
  const url = `${baseUrl}/v2/translate`;

  const form = new URLSearchParams();
  form.append('source_lang', toDeeplLang(source));
  form.append('target_lang', toDeeplLang(target));
  // Avoid line merging/splitting by DeepL; keep formatting
  form.append('preserve_formatting', '1');
  form.append('split_sentences', 'nonewlines');
  for (const t of texts) {
    form.append('text', t);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DeepL request failed: ${res.status} ${body}`);
  }

  const json: any = await res.json();
  const translations = Array.isArray(json?.translations)
    ? json.translations.map((t: any) => String(t.text ?? ''))
    : [];
  if (translations.length !== texts.length) {
    // Fallback to maintain array length
    const filled = new Array(texts.length).fill('');
    for (let i = 0; i < Math.min(filled.length, translations.length); i++) {
      filled[i] = translations[i];
    }
    return filled;
  }
  return translations;
}

/**
 * Translates a WebVTT file content by translating only cue text lines.
 * Keeps WEBVTT header, timestamps, and settings as is.
 */
export async function translateWebVtt(
  vttContent: string,
  source: SupportedLang,
  target: SupportedLang
): Promise<string> {
  const lines = vttContent.split(/\r?\n/);
  const isTimecode = (line: string) => /-->/.test(line);
  const isHeaderOrMeta = (line: string) =>
    line.startsWith('WEBVTT') || line.startsWith('NOTE') || line.startsWith('STYLE') || line.startsWith('REGION');

  // Collect indices of translatable lines
  const translatableIndices: number[] = [];
  const translatableTexts: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.trim().length === 0 ||
      isHeaderOrMeta(line) ||
      isTimecode(line)
    ) {
      continue;
    }
    // Many cues have an optional ID line before timecodes; we avoid translating lone numeric IDs
    if (/^\d+$/.test(line.trim())) {
      continue;
    }
    // Otherwise translate this line
    translatableIndices.push(i);
    translatableTexts.push(line);
  }

  if (translatableTexts.length === 0) {
    return vttContent;
  }

  const translated = await translateTextsWithDeepl(translatableTexts, source, target);
  const output = [...lines];
  translatableIndices.forEach((idx, j) => {
    output[idx] = translated[j] ?? lines[idx];
  });
  return output.join('\n');
}



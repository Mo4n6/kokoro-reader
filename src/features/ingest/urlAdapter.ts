import { normalizeArticleReadable } from '../../domain/normalize';
import { NormalizedDocument } from '../../domain/segments';

interface ExtractResponse {
  article?: {
    title?: string;
    textContent?: string;
  };
  title?: string;
  textContent?: string;
  content?: string;
}

function toReadablePayload(payload: ExtractResponse): { title?: string; textContent: string } {
  const articleText = payload.article?.textContent;
  const topLevelText = payload.textContent ?? payload.content;
  const textContent = articleText ?? topLevelText ?? '';

  return {
    title: payload.article?.title ?? payload.title,
    textContent,
  };
}

/**
 * Sends a URL to the backend extractor and normalizes the readability payload.
 */
export async function ingestUrl(url: string): Promise<NormalizedDocument> {
  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`URL extract failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ExtractResponse;
  return normalizeArticleReadable(toReadablePayload(payload));
}

export type IngestInputRequest =
  | { type: 'paste'; payload: string }
  | { type: 'file'; payload: File }
  | { type: 'url'; payload: string };

/**
 * Unified ingestion facade for paste, file, and URL inputs.
 */
export async function ingestInput({ type, payload }: IngestInputRequest): Promise<NormalizedDocument> {
  switch (type) {
    case 'paste':
      return (await import('./pasteAdapter')).ingestPastedText(payload);
    case 'file':
      return (await import('./fileAdapter')).ingestFile(payload);
    case 'url':
      return ingestUrl(payload);
    default: {
      const neverType: never = type;
      throw new Error(`Unknown ingest type: ${neverType}`);
    }
  }
}

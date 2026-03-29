import { normalizePlainText } from '../../domain/normalize';
import { NormalizedDocument } from '../../domain/segments';

/**
 * Converts textarea content into a speakable normalized document.
 */
export function ingestPastedText(textareaValue: string): Promise<NormalizedDocument> {
  return Promise.resolve(normalizePlainText(textareaValue));
}

import { normalizeMarkdown, normalizePlainText } from '../../domain/normalize';
import { NormalizedDocument } from '../../domain/segments';

const MARKDOWN_EXTENSION = /\.md(?:own|arkdown)?$/i;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000E-\u001F\u007F]/;

export type FileParseErrorCode = 'UNSUPPORTED_FILE_TYPE' | 'BINARY_FILE_CONTENT';

export interface FileParseErrorShape {
  code: FileParseErrorCode;
  message: string;
  fileName: string;
}

export class FileParseError extends Error {
  readonly code: FileParseErrorCode;
  readonly fileName: string;

  constructor({ code, message, fileName }: FileParseErrorShape) {
    super(message);
    this.name = 'FileParseError';
    this.code = code;
    this.fileName = fileName;
  }
}

function inferIsMarkdown(fileName: string): boolean {
  return MARKDOWN_EXTENSION.test(fileName);
}

function inferIsPlainTextLike(file: Blob): boolean {
  if (!file.type) {
    return true;
  }

  return file.type.startsWith('text/') || file.type === 'application/json' || file.type === 'application/xml';
}

function hasLikelyBinaryContent(rawText: string): boolean {
  return CONTROL_CHARACTERS.test(rawText);
}

/**
 * Uses Blob.text() to parse uploaded files into normalized documents.
 */
export async function ingestFile(file: File): Promise<NormalizedDocument> {
  if (!inferIsPlainTextLike(file) && !inferIsMarkdown(file.name)) {
    throw new FileParseError({
      code: 'UNSUPPORTED_FILE_TYPE',
      message: `Unsupported file type: ${file.type || 'unknown'}`,
      fileName: file.name,
    });
  }

  const rawText = await file.text();

  if (!rawText.trim() || hasLikelyBinaryContent(rawText)) {
    throw new FileParseError({
      code: 'BINARY_FILE_CONTENT',
      message: 'Uploaded file appears to be binary or contains unsupported control characters.',
      fileName: file.name,
    });
  }

  return inferIsMarkdown(file.name) ? normalizeMarkdown(rawText) : normalizePlainText(rawText);
}

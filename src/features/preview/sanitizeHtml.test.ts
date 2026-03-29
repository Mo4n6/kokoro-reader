import { describe, expect, it } from 'vitest';
import {
  sanitizeHtml,
  sanitizeMarkdownPreviewHtml,
  sanitizeReadabilityHtml,
} from './sanitizeHtml';
import { markdownRenderedHtmlMalicious } from './__fixtures__/xss/markdownRenderedHtml.fixture';
import { readabilityContentMalicious } from './__fixtures__/xss/readabilityContent.fixture';
import { sanitizeMarkdownHtmlPreview } from '../../domain/normalize';

describe('sanitizeHtml', () => {
  it('removes script tags, event handlers, javascript urls, and unsafe svg payloads', () => {
    const output = sanitizeHtml(markdownRenderedHtmlMalicious);

    expect(output).not.toMatch(/<script/i);
    expect(output).not.toMatch(/on\w+=/i);
    expect(output).not.toMatch(/javascript:/i);
  });
});

describe('sanitizeMarkdownPreviewHtml', () => {
  it('sanitizes markdown rendered HTML', () => {
    const output = sanitizeMarkdownPreviewHtml(markdownRenderedHtmlMalicious);

    expect(output).toContain('<h1>Preview</h1>');
    expect(output).not.toMatch(/on\w+=/i);
    expect(output).not.toMatch(/javascript:/i);
  });

  it('is used by normalize markdown preview path helper', () => {
    const output = sanitizeMarkdownHtmlPreview(markdownRenderedHtmlMalicious);

    expect(output).toContain('<h1>Preview</h1>');
    expect(output).not.toMatch(/<script/i);
  });
});

describe('sanitizeReadabilityHtml', () => {
  it('sanitizes readability-derived HTML content', () => {
    const output = sanitizeReadabilityHtml(readabilityContentMalicious);

    expect(output).toContain('<article>');
    expect(output).not.toMatch(/<iframe/i);
    expect(output).not.toMatch(/on\w+=/i);
    expect(output).not.toMatch(/javascript:/i);
  });
});

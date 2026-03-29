import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purifier = createDOMPurify(window);

const FORBID_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'];
const FORBID_ATTR = ['style'];
const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto|tel|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i;

function scrubSvgXLinkHref(node: Element): void {
  if (node.namespaceURI !== 'http://www.w3.org/2000/svg') {
    return;
  }

  const href = node.getAttribute('xlink:href') ?? node.getAttribute('href');
  if (!href) {
    return;
  }

  if (/^\s*javascript:/i.test(href)) {
    node.removeAttribute('xlink:href');
    node.removeAttribute('href');
  }
}

purifier.addHook('afterSanitizeAttributes', (node) => {
  if (!(node instanceof window.Element)) {
    return;
  }

  for (const attr of Array.from(node.attributes)) {
    if (/^on/i.test(attr.name)) {
      node.removeAttribute(attr.name);
    }
  }

  scrubSvgXLinkHref(node);
});

export function sanitizeHtml(html: string): string {
  return purifier.sanitize(html, {
    FORBID_TAGS,
    FORBID_ATTR,
    ALLOWED_URI_REGEXP,
    USE_PROFILES: { html: true, svg: true, svgFilters: false },
  });
}

export function sanitizeMarkdownPreviewHtml(renderedHtml: string): string {
  return sanitizeHtml(renderedHtml);
}

export function sanitizeReadabilityHtml(readabilityHtml: string): string {
  return sanitizeHtml(readabilityHtml);
}

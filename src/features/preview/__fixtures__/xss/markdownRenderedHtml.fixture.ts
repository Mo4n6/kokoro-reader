export const markdownRenderedHtmlMalicious = `
<h1>Preview</h1>
<p><a href="javascript:alert('xss')" onclick="alert('xss')">click me</a></p>
<script>alert('xss')</script>
<svg><a xlink:href="javascript:alert('xss')"><text>bad svg link</text></a></svg>
`;

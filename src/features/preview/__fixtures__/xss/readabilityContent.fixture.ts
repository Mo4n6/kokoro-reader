export const readabilityContentMalicious = `
<article>
  <h2>Readable body</h2>
  <img src="x" onerror="alert('xss')" />
  <iframe src="https://evil.example"></iframe>
  <a href="javascript:alert('xss')">bad uri</a>
  <svg><g onload="alert(1)"><a href="javascript:alert(1)">svg payload</a></g></svg>
</article>
`;

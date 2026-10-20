import { describe, it, expect } from 'vitest';
import { sanitizeInput, escapeHtml, truncateText } from '@/utils/sanitizer';

describe('sanitizer - Happy Paths', () => {
  it('sanitizeInput strips angle brackets and trims extra whitespace', () => {
    const malicious = '   <script>alert("xss")</script> Computer Science   ';
    const clean = sanitizeInput(malicious);
    expect(clean).not.toContain('<');
    expect(clean).not.toContain('>');
    expect(clean).toBe('scriptalert("xss")/script Computer Science');
  });

  it('escapeHtml converts special HTML characters to safe entities', () => {
    const raw = '<div class="test" & \'hello\'>';
    const escaped = escapeHtml(raw);
    expect(escaped).toBe('&lt;div class=&quot;test&quot; &amp; &#39;hello&#39;&gt;');
  });

  it('truncateText trims long strings and appends ellipsis', () => {
    const longText = 'This is a very comprehensive academic reference manual for software engineering students';
    const truncated = truncateText(longText, 25);
    expect(truncated).toBe('This is a very comprehens...');
    expect(truncateText('Short', 20)).toBe('Short');
  });
});

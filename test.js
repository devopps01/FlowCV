const html = '<p>Line 1</p><p>Line 2</p>';
const path = 'test.path';
const overrides = { 'test.path.p[0]': { fontSize: 16, fontWeight: 'bold' } };
let pIndex = 0;
let liIndex = 0;
let cleaned = html.replace(/<(p|li)(>|\s[^>]*>)/gi, (match, rawTag, rest) => {
  const tag = rawTag.toLowerCase();
  const idx = tag === 'p' ? pIndex++ : liIndex++;
  const stylePath = `${path}.${tag}[${idx}]`;
  let inlineStyle = '';
  if (overrides && overrides[stylePath]) {
    const styleObj = overrides[stylePath];
    const styleStr = Object.entries(styleObj).map(([k,v]) => {
      const dashKey = k.replace(/([A-Z])/g, "-$1").toLowerCase();
      const value = typeof v === 'number' && k !== 'fontWeight' ? `${v}px` : v;
      return `${dashKey}:${value}`;
    }).join(';');
    if (styleStr) inlineStyle = ` style="${styleStr}"`;
  }
  return `<${rawTag} data-style-path="${stylePath}"${inlineStyle}${rest}`;
});
console.log(cleaned);

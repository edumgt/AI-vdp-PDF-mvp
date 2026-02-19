/**
 * MVP line-break
 * - space_based: 공백 단어 단위 줄바꿈
 * - cjk: 문자 단위 줄바꿈(간단)
 * NOTE: 실제 폭 측정은 폰트 메트릭 기반으로 고도화 필요
 */
function estimateWidth(text, fontSize) {
  // 매우 단순한 추정치(알파벳 0.55em, 공백 0.35em 등)
  let w = 0;
  for (const ch of text) {
    if (ch === " ") w += fontSize * 0.35;
    else if (/[A-Za-z0-9]/.test(ch)) w += fontSize * 0.55;
    else w += fontSize * 0.60; // accents/CJK etc
  }
  return w;
}

function lineBreak({ text, maxWidth, policy, fontSize }) {
  const s = String(text || "");
  if (!s.trim()) return [""];

  if (policy === "cjk") {
    const out = [];
    let line = "";
    for (const ch of s) {
      const next = line + ch;
      if (estimateWidth(next, fontSize) > maxWidth && line.length > 0) {
        out.push(line);
        line = ch;
      } else {
        line = next;
      }
    }
    if (line) out.push(line);
    return out;
  }

  // default: space_based
  const words = s.split(/(\s+)/); // keep spaces
  const out = [];
  let line = "";
  for (const token of words) {
    const next = line + token;
    if (estimateWidth(next, fontSize) > maxWidth && line.trim().length > 0) {
      out.push(line.trimEnd());
      line = token.trimStart();
    } else {
      line = next;
    }
  }
  if (line) out.push(line.trimEnd());
  return out;
}

module.exports = { lineBreak };

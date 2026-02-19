/**
 * Layout Engine (MVP)
 * - 템플릿(boxes) + 원고(content_json) + 개인화 + 줄바꿈 규칙을 적용해 Render Tree 생성
 * - 실제 인쇄용 품질을 위해서는 폭 측정(폰트 메트릭)과 금칙/하이픈 등의 고도화가 필요합니다.
 */
const { replaceTokens } = require("./token");
const { lineBreak } = require("./linebreak");

function buildRenderTree({ template, manuscript, langRole, personalization, rules }) {
  const render = {
    book_id: template.book_id,
    page_id: template.page_id,
    version: template.version,
    page: template.page,
    nodes: []
  };

  for (const box of template.boxes) {
    if (box.type !== "text") continue;
    if (box.lang_role !== langRole) continue;

    const keys = box.content_keys || [];
    const rawText = keys.map(k => manuscript.content?.[k] ?? "").join("\n");

    // personalizaion: {NAME},{DATE}
    const text = replaceTokens(rawText, personalization);

    // line break
    const lines = lineBreak({
      text,
      maxWidth: box.w,
      policy: rules?.policy || "space_based",
      // NOTE: width estimation is simplified (MVP)
      fontSize: box.style?.font_size || 12
    });

    render.nodes.push({
      type: "text",
      box_id: box.id,
      x: box.x, y: box.y, w: box.w, h: box.h,
      style: box.style,
      lines
    });
  }

  return render;
}

module.exports = { buildRenderTree };

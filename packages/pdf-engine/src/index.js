/**
 * PDF Engine (MVP)
 * - pdf-lib 기반으로 텍스트를 그려 PDF를 생성합니다.
 * - 폰트 임베딩: TTF/OTF 파일을 로드하여 embedFont 합니다.
 * - Bleed/Trim box: pdf-lib은 고급 박스/OutputIntent 등을 직접 다루기 제한이 있으므로,
 *   MVP는 "bleed 여유 포함 페이지 생성" + "메타/검수 스크립트" 구조로 제공합니다.
 * - PDF/X 완전 준수, ICC OutputIntent, CMYK 고급 처리 등은 2차 확장 포인트입니다.
 */
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

function env(name, fallback) {
  return process.env[name] || fallback;
}

function resolveFontPath(fontsDir, fileName) {
  const p = path.resolve(fontsDir, fileName);
  if (!fs.existsSync(p)) {
    throw new Error(`Font file not found: ${p}. Put your TTF/OTF in assets/fonts and update font preset.`);
  }
  return p;
}

async function renderPdf({ renderTree, fontPreset, outPath }) {
  const fontsDir = env("FONTS_DIR", "./assets/fonts");

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const pageW = renderTree.page.width_pt;
  const pageH = renderTree.page.height_pt;
  const bleed = renderTree.page.bleed_pt || 0;

  // MVP: bleed 포함한 전체 페이지 크기로 생성 (Trim = inner box)
  const page = pdfDoc.addPage([pageW + bleed * 2, pageH + bleed * 2]);

  const fontMap = fontPreset?.preset_json?.font_map || { latin_sans: "YOUR_FONT_FILE.ttf" };
  const defaultFontFile = fontMap.latin_sans;

  const fontBytes = fs.readFileSync(resolveFontPath(fontsDir, defaultFontFile));
  const font = await pdfDoc.embedFont(fontBytes, { subset: true }); // subset=true는 일반적으로 인쇄에 OK. "완전 포함" 정책은 협의 필요.

  // background (optional): white
  page.drawRectangle({ x: 0, y: 0, width: page.getWidth(), height: page.getHeight(), color: rgb(1,1,1) });

  for (const node of renderTree.nodes) {
    if (node.type !== "text") continue;

    const style = node.style || {};
    const fontSize = style.font_size || 12;
    const leading = style.leading || (fontSize * 1.2);

    // PDF 좌표계: 좌하단이 (0,0)
    // 템플릿 y는 상단 기준으로 설계된 경우가 많아서, 여기서는 "상단 기준"처럼 사용:
    // yTop = bleed + node.y; text baseline 계산은 단순화
    const x = bleed + node.x;
    const yTop = bleed + node.y;

    let cursorY = yTop;
    for (const line of node.lines) {
      page.drawText(line, {
        x,
        y: cursorY,
        size: fontSize,
        font,
        color: rgb(0,0,0) // MVP: RGB. CMYK 출력 의도/ICC는 2차 확장 포인트.
      });
      cursorY -= leading;
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, pdfBytes);
  return { outPath, size: pdfBytes.length };
}

module.exports = { renderPdf };

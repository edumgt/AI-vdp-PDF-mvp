#!/usr/bin/env node
/**
 * MVP Preflight 샘플
 * - 실제 산업용 Preflight(예: Acrobat Preflight/Callas) 완전 대체가 아니라,
 *   "사고 방지용 기본 검사"를 제공하는 스캐폴딩입니다.
 */
const fs = require("fs");
const path = require("path");

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/preflight-check.js <pdf_path>");
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error("File not found:", file);
  process.exit(1);
}

const stat = fs.statSync(file);
console.log("[preflight] file:", path.resolve(file));
console.log("[preflight] size:", stat.size, "bytes");
console.log("[preflight] NOTE: 폰트/박스 상세 검사는 2차에서 PDF 파서/도구 연동 권장");
process.exit(0);

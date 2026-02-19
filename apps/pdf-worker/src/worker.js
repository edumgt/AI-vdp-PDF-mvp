const path = require("path");
const crypto = require("crypto");
const { Worker } = require("bullmq");
const { connection } = require("../../apps/api-server/src/queue");
const { getClient } = require("./db");
const { buildRenderTree } = require("@joya/layout-engine");
const { renderPdf } = require("@joya/pdf-engine");

function env(name, fallback) { return process.env[name] || fallback; }

const concurrency = parseInt(env("WORKER_CONCURRENCY", "2"), 10);
const localPdfDir = path.resolve(env("LOCAL_PDF_DIR", "./storage/pdfs"));

async function loadLatestTemplate(client, bookId, pageId) {
  const r = await client.query(
    "SELECT template_json FROM templates WHERE book_id=$1 AND page_id=$2 ORDER BY version DESC LIMIT 1",
    [bookId, pageId]
  );
  if (r.rowCount === 0) throw new Error(`template not found: ${bookId}/${pageId}`);
  return r.rows[0].template_json;
}

async function loadLatestManuscript(client, bookId, pageId, lang) {
  const r = await client.query(
    "SELECT content_json FROM manuscripts WHERE book_id=$1 AND page_id=$2 AND lang=$3 ORDER BY version DESC LIMIT 1",
    [bookId, pageId, lang]
  );
  if (r.rowCount === 0) throw new Error(`manuscript not found: ${bookId}/${pageId}/${lang}`);
  return r.rows[0].content_json;
}

async function loadDefaultFontPreset(client) {
  const r = await client.query("SELECT preset_json FROM font_presets WHERE lang='default' ORDER BY version DESC LIMIT 1");
  if (r.rowCount === 0) return { preset_json: { font_map: { latin_sans: "YOUR_FONT_FILE.ttf" } } };
  return r.rows[0].preset_json;
}

async function updateJob(client, jobId, patch) {
  const fields = [];
  const values = [];
  let i = 1;

  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k}=$${i++}`);
    values.push(v);
  }
  values.push(jobId);
  const sql = `UPDATE pdf_jobs SET ${fields.join(", ")} WHERE job_id=$${i}`;
  await client.query(sql, values);
}

function sha256File(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

async function processOrder(orderId, jobId) {
  const client = await getClient();
  try {
    await updateJob(client, jobId, { status: "running", started_at: new Date().toISOString() });

    const o = await client.query("SELECT * FROM orders WHERE order_id=$1", [orderId]);
    if (o.rowCount === 0) throw new Error("order not found");
    const order = o.rows[0];

    // 개인화는 3페이지 한정
    const pages = ["cover", "opening", "closing"];

    // MVP: main 언어만 PDF로 생성 (확장: 4개 언어 모두 페이지에 배치)
    // 현재 템플릿 박스의 lang_role='main'만 처리하도록 되어 있음
    const mainLang = order.main_lang;

    const preset = await loadDefaultFontPreset(client);

    // Render Tree 합치기: 여러 페이지
    const renderTrees = [];
    for (const pageId of pages) {
      const template = await loadLatestTemplate(client, order.book_id, pageId);
      const manuscript = await loadLatestManuscript(client, order.book_id, pageId, mainLang);
      const rt = buildRenderTree({
        template,
        manuscript,
        langRole: "main",
        personalization: { name: order.name, date: order.date },
        rules: { policy: "space_based" } // mainLang별로 매핑 확장 가능
      });
      renderTrees.push(rt);
    }

    // 단일 PDF로 페이지를 이어붙이는 방식은 2차에서 개선 가능.
    // MVP: 페이지 1개 PDF로 출력(cover) + 확장 포인트 문서화
    const outFile = path.join(localPdfDir, `${orderId}.pdf`);
    const result = await renderPdf({
      renderTree: renderTrees[0],
      fontPreset: { preset_json: preset },
      outPath: outFile
    });

    const buf = require("fs").readFileSync(outFile);
    const hash = sha256File(buf);

    await client.query(
      "INSERT INTO pdf_outputs(order_id,file_path,file_hash,source_snapshot) VALUES ($1,$2,$3,$4)",
      [orderId, outFile, hash, { template: "latest", manuscript: "latest", font_preset: "default/latest" }]
    );

    await client.query("UPDATE orders SET status='done' WHERE order_id=$1", [orderId]);
    await updateJob(client, jobId, { status: "done", finished_at: new Date().toISOString() });

    return result;
  } catch (e) {
    try {
      await client.query("UPDATE orders SET status='failed' WHERE order_id=$1", [orderId]);
      await updateJob(client, jobId, { status: "failed", error_log: String(e.message || e), finished_at: new Date().toISOString() });
    } catch (_) {}
    throw e;
  } finally {
    await client.end();
  }
}

const worker = new Worker("pdf-jobs", async (job) => {
  const { order_id, job_id } = job.data;
  console.log("[worker] start", order_id, job_id);
  const r = await processOrder(order_id, job_id);
  console.log("[worker] done", order_id, r);
  return r;
}, { connection, concurrency });

worker.on("failed", (job, err) => {
  console.error("[worker] failed", job?.id, err);
});

console.log(`[worker] running. concurrency=${concurrency}`);

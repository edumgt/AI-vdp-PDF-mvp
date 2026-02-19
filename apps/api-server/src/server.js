const express = require("express");
const cors = require("cors");
const path = require("path");
const { makeId } = require("@joya/shared");
const { getClient } = require("./db");
const { pdfQueue } = require("./queue");

function env(name, fallback) { return process.env[name] || fallback; }

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// static PDFs (local mode)
const localPdfDir = path.resolve(env("LOCAL_PDF_DIR", "./storage/pdfs"));
app.use("/files", express.static(localPdfDir));

app.get("/health", (req, res) => res.json({ ok: true }));

/**
 * Create order
 */
app.post("/api/orders", async (req, res) => {
  const { book_id, main_lang, sub_langs, name, date } = req.body || {};
  if (!book_id || !main_lang || !Array.isArray(sub_langs) || sub_langs.length !== 3 || !name || !date) {
    return res.status(400).json({ error: "invalid payload" });
  }

  const orderId = makeId("ORD");
  const jobId = makeId("JOB");

  const client = await getClient();
  try {
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO orders(order_id,book_id,main_lang,sub_langs,name,date,status) VALUES ($1,$2,$3,$4,$5,$6,'created')",
      [orderId, book_id, main_lang, sub_langs, name, date]
    );
    await client.query(
      "INSERT INTO pdf_jobs(job_id,order_id,status) VALUES ($1,$2,'pending')",
      [jobId, orderId]
    );
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    return res.status(500).json({ error: "db error", detail: String(e.message || e) });
  } finally {
    await client.end();
  }

  return res.json({ order_id: orderId, job_id: jobId, status: "created" });
});

/**
 * Enqueue PDF generation
 */
app.post("/api/orders/:id/generate", async (req, res) => {
  const orderId = req.params.id;

  const client = await getClient();
  let order;
  let job;
  try {
    const o = await client.query("SELECT * FROM orders WHERE order_id=$1", [orderId]);
    if (o.rowCount === 0) return res.status(404).json({ error: "order not found" });
    order = o.rows[0];

    const j = await client.query("SELECT * FROM pdf_jobs WHERE order_id=$1 ORDER BY created_at DESC LIMIT 1", [orderId]);
    if (j.rowCount === 0) return res.status(404).json({ error: "job not found" });
    job = j.rows[0];

    await client.query("UPDATE orders SET status='queued' WHERE order_id=$1", [orderId]);
    await client.query("UPDATE pdf_jobs SET status='queued' WHERE job_id=$1", [job.job_id]);

  } finally {
    await client.end();
  }

  await pdfQueue.add("render", { order_id: orderId, job_id: job.job_id }, { attempts: 1 });
  return res.json({ ok: true, order_id: orderId, job_id: job.job_id });
});

/**
 * Get order status
 */
app.get("/api/orders/:id", async (req, res) => {
  const orderId = req.params.id;

  const client = await getClient();
  try {
    const o = await client.query("SELECT * FROM orders WHERE order_id=$1", [orderId]);
    if (o.rowCount === 0) return res.status(404).json({ error: "order not found" });

    const j = await client.query("SELECT * FROM pdf_jobs WHERE order_id=$1 ORDER BY created_at DESC LIMIT 1", [orderId]);
    const out = await client.query("SELECT * FROM pdf_outputs WHERE order_id=$1 ORDER BY created_at DESC LIMIT 1", [orderId]);

    return res.json({
      order: o.rows[0],
      job: j.rows[0] || null,
      output: out.rows[0] || null
    });
  } finally {
    await client.end();
  }
});

/**
 * Download PDF
 */
app.get("/api/orders/:id/pdf", async (req, res) => {
  const orderId = req.params.id;

  const client = await getClient();
  try {
    const out = await client.query("SELECT * FROM pdf_outputs WHERE order_id=$1 ORDER BY created_at DESC LIMIT 1", [orderId]);
    if (out.rowCount === 0) return res.status(404).json({ error: "pdf not ready" });

    const filePath = out.rows[0].file_path;
    // local mode: stored under LOCAL_PDF_DIR
    return res.redirect(`/files/${path.basename(filePath)}`);
  } finally {
    await client.end();
  }
});

const port = parseInt(env("API_PORT", "8081"), 10);
app.listen(port, () => {
  console.log(`[api] listening on :${port}`);
});

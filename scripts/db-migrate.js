#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { connect } = require("./db-util");

(async () => {
  const client = await connect();
  try {
    const sqlPath = path.join(__dirname, "..", "infra", "db", "migrations", "001_init.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    await client.query(sql);
    console.log("[db:migrate] OK");
  } finally {
    await client.end();
  }
})().catch((e) => {
  console.error("[db:migrate] FAILED", e);
  process.exit(1);
});

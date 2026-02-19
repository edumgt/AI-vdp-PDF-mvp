#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { connect } = require("./db-util");

(async () => {
  const client = await connect();
  try {
    const sqlPath = path.join(__dirname, "..", "infra", "db", "seed", "seed.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    await client.query(sql);
    console.log("[db:seed] OK");
  } finally {
    await client.end();
  }
})().catch((e) => {
  console.error("[db:seed] FAILED", e);
  process.exit(1);
});

const crypto = require("crypto");

function makeId(prefix) {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  const rand = crypto.randomBytes(3).toString("hex");
  return `${prefix}-${y}${m}${day}-${rand}`.toUpperCase();
}

function pickEnv(name, fallback) {
  return process.env[name] || fallback;
}

function nowIso() {
  return new Date().toISOString();
}

module.exports = { makeId, pickEnv, nowIso };

const { Queue } = require("bullmq");

function env(name, fallback) { return process.env[name] || fallback; }

const connection = {
  host: env("REDIS_HOST", "localhost"),
  port: parseInt(env("REDIS_PORT", "6379"), 10),
};

const pdfQueue = new Queue("pdf-jobs", { connection });

module.exports = { pdfQueue, connection };

const { Client } = require("pg");

function env(name, fallback) { return process.env[name] || fallback; }

async function getClient() {
  const client = new Client({
    host: env("POSTGRES_HOST", "localhost"),
    port: parseInt(env("POSTGRES_PORT", "5432"), 10),
    database: env("POSTGRES_DB", "joya"),
    user: env("POSTGRES_USER", "joya"),
    password: env("POSTGRES_PASSWORD", "joya1234"),
  });
  await client.connect();
  return client;
}

module.exports = { getClient };

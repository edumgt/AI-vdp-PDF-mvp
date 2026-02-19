#!/usr/bin/env node
const { spawnSync } = require("child_process");
const path = require("path");

const compose = path.join(__dirname, "..", "infra", "docker", "docker-compose.yml");
const r = spawnSync("docker", ["compose", "-f", compose, "down", "--remove-orphans"], { stdio: "inherit" });
process.exit(r.status ?? 0);

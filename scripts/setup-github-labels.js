#!/usr/bin/env node
/**
 * setup-github-labels.js
 * Creates all required labels in the repo.
 * Run once: GITHUB_TOKEN=xxx node scripts/setup-github-labels.js
 */
"use strict";
const { execSync } = require("child_process");

const OWNER = "amitre";
const REPO  = "Mashkanta2";
const TOKEN = process.env.GITHUB_TOKEN || process.argv[2];

if (!TOKEN) { console.error("GITHUB_TOKEN not set"); process.exit(1); }

const LABELS = [
  { name: "bug",         color: "d73a4a", description: "Something isn't working" },
  { name: "cr",          color: "0075ca", description: "Change Request / New Feature" },
  { name: "P1-critical", color: "b60205", description: "Breaks core functionality" },
  { name: "P2-high",     color: "e4e669", description: "Important, fix soon" },
  { name: "P3-medium",   color: "fbca04", description: "Normal priority" },
  { name: "P4-low",      color: "c2e0c6", description: "Nice to have" },
  { name: "approved",    color: "0e8a16", description: "CR approved for development" },
  { name: "in-progress", color: "1d76db", description: "Currently being developed" },
  { name: "done",        color: "6f42c1", description: "Completed" },
];

function githubCurl(method, path, body) {
  const dataArg = body ? `-d '${JSON.stringify(body).replace(/'/g, "'\\''")}'` : "";
  const cmd = `curl -s -w "\\n%{http_code}" -X ${method} \
    -H "Authorization: token ${TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "Content-Type: application/json" \
    -H "User-Agent: mashkanta2-setup" \
    ${dataArg} \
    "https://api.github.com${path}"`;
  const out = execSync(cmd, { encoding: "utf8" });
  const lines = out.trim().split("\n");
  const status = parseInt(lines.pop(), 10);
  return { status, body: JSON.parse(lines.join("\n") || "{}") };
}

for (const label of LABELS) {
  const get = githubCurl("GET", `/repos/${OWNER}/${REPO}/labels/${encodeURIComponent(label.name)}`);
  if (get.status === 200) {
    console.log(`  exists : ${label.name}`);
  } else {
    const create = githubCurl("POST", `/repos/${OWNER}/${REPO}/labels`, label);
    if (create.status === 201) console.log(`  created: ${label.name}`);
    else console.error(`  FAILED ${label.name}: ${JSON.stringify(create.body)}`);
  }
}
console.log("Done.");

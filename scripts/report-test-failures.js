#!/usr/bin/env node
/**
 * report-test-failures.js
 *
 * Reads Jest JSON output (test-results.json) and creates GitHub Issues for
 * each failed test that doesn't already have an open issue.
 *
 * Usage (called automatically by GitHub Actions):
 *   GITHUB_TOKEN=xxx node scripts/report-test-failures.js
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const OWNER = "amitre";
const REPO  = "Mashkanta2";
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error("GITHUB_TOKEN not set. Skipping issue reporting.");
  process.exit(0);
}

function githubCurl(method, path, body) {
  const dataArg = body
    ? `-d '${JSON.stringify(body).replace(/'/g, "'\\''")}'`
    : "";
  const cmd = `curl -s -w "\\n%{http_code}" -X ${method} \
    -H "Authorization: token ${TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "Content-Type: application/json" \
    -H "User-Agent: mashkanta2-test-reporter" \
    ${dataArg} \
    "https://api.github.com${path}"`;
  const out = execSync(cmd, { encoding: "utf8" });
  const lines = out.trim().split("\n");
  const status = parseInt(lines.pop(), 10);
  return { status, body: JSON.parse(lines.join("\n") || "{}") };
}

function priorityForFile(testFile) {
  const base = path.basename(testFile || "");
  if (base.includes("calculations")) return "P1-critical";
  if (base.includes("rates-cache"))  return "P2-high";
  if (base.includes("rates-api"))    return "P2-high";
  return "P3-medium";
}

function findOpenIssue(title) {
  const q = encodeURIComponent(`"${title}" repo:${OWNER}/${REPO} is:issue is:open`);
  const res = githubCurl("GET", `/search/issues?q=${q}&per_page=5`);
  if (res.status !== 200) return null;
  return (res.body.items || []).find((i) => i.title === title) || null;
}

function createIssue(title, body, labels) {
  const res = githubCurl("POST", `/repos/${OWNER}/${REPO}/issues`, { title, body, labels });
  if (res.status === 201) {
    console.log(`Created issue #${res.body.number}: ${title}`);
  } else {
    console.error(`Failed to create issue: ${JSON.stringify(res.body)}`);
  }
}

const resultsFile = path.join(process.cwd(), "test-results.json");

if (!fs.existsSync(resultsFile)) {
  console.log("test-results.json not found — skipping");
  process.exit(0);
}

const results = JSON.parse(fs.readFileSync(resultsFile, "utf8"));
const failures = [];

for (const suite of (results.testResults || [])) {
  for (const test of (suite.testResults || [])) {
    if (test.status === "failed") failures.push({ suite, test });
  }
}

if (failures.length === 0) {
  console.log("All tests passed — no issues to report");
  process.exit(0);
}

console.log(`Found ${failures.length} test failure(s). Reporting to GitHub Issues...`);

for (const { suite, test } of failures) {
  const priority = priorityForFile(suite.testFilePath);
  const title = `[Bug] ${test.fullName}`;
  const failureMsg = (test.failureMessages || []).join("\n\n");
  const fileRef = suite.testFilePath
    ? path.relative(process.cwd(), suite.testFilePath)
    : "unknown file";

  const body = `## כשל בבדיקה אוטומטית

**שם הבדיקה:** \`${test.fullName}\`
**קובץ:** \`${fileRef}\`
**תאריך:** ${new Date().toISOString()}

## פרטי השגיאה

\`\`\`
${failureMsg}
\`\`\`

## מידע נוסף

- **Suite:** \`${suite.testFilePath || ""}\`
- **Duration:** ${test.duration || 0}ms
- **Priority:** ${priority}

---
*נוצר אוטומטית על ידי GitHub Actions*`;

  const existing = findOpenIssue(title);
  if (existing) {
    console.log(`Issue already open: ${title} (#${existing.number})`);
  } else {
    createIssue(title, body, ["bug", priority]);
  }
}

console.log("Done.");

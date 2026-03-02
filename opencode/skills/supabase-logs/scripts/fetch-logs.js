#!/usr/bin/env node

/**
 * fetch-logs.js — Download Supabase Edge Function logs via Management API
 *
 * Usage:
 *   node fetch-logs.js [options]
 *
 * Options:
 *   --project <ref>       Project ref (20-char string). Auto-detected if omitted.
 *   --function <name>     Filter by function name. Fetches all functions if omitted.
 *   --last <duration>     Time window: 15m, 30m, 1h, 2h, 6h, 12h, 24h (default: 30m)
 *   --type <type>         Log type: "runtime", "edge", or "both" (default: "both")
 *   --output <file>       Save JSON to file instead of printing to stdout
 *   --limit <n>           Max log rows per query (default: 200, max: 1000)
 *   --help                Show this help
 *
 * Auth:
 *   Reads SUPABASE_ACCESS_TOKEN from .env in the current working directory
 *   or from the environment. Get a token at: https://supabase.com/dashboard/account/tokens
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, join, dirname } from "path";
import { execSync } from "child_process";

// ---------------------------------------------------------------------------
// Config & arg parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {
    project: null,
    function: null,
    last: "30m",
    type: "both",
    output: null,
    limit: 200,
    help: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--project") args.project = argv[++i];
    else if (arg === "--function") args.function = argv[++i];
    else if (arg === "--last") args.last = argv[++i];
    else if (arg === "--type") args.type = argv[++i];
    else if (arg === "--output") args.output = argv[++i];
    else if (arg === "--limit") args.limit = parseInt(argv[++i], 10);
  }

  return args;
}

function parseDuration(str) {
  const match = str.match(/^(\d+)(m|h|d)$/);
  if (!match) throw new Error(`Invalid duration: "${str}". Use format like 30m, 2h, 1d`);
  const [, n, unit] = match;
  const ms = { m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return parseInt(n, 10) * ms;
}

function loadEnv() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

// ---------------------------------------------------------------------------
// Supabase API helpers
// ---------------------------------------------------------------------------

async function apiFetch(path, token, params = {}) {
  const url = new URL(`https://api.supabase.com${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase API error ${res.status}: ${body}`);
  }

  return res.json();
}

async function listProjects(token) {
  return apiFetch("/v1/projects", token);
}

async function fetchLogs(token, projectRef, sql, isoStart, isoEnd) {
  return apiFetch(`/v1/projects/${projectRef}/analytics/endpoints/logs.all`, token, {
    sql,
    iso_timestamp_start: isoStart,
    iso_timestamp_end: isoEnd,
  });
}

// ---------------------------------------------------------------------------
// SQL query builders
// ---------------------------------------------------------------------------

function buildRuntimeLogsQuery(functionName, limit) {
  // function_logs: console.log output from inside the edge function.
  // metadata is an array — unnest it to access fields like function_id.
  // To filter by name we join against function_edge_logs which stores pathname.
  const fnFilter = functionName
    ? `AND m.function_id IN (
    SELECT DISTINCT em.function_id
    FROM function_edge_logs AS el
      CROSS JOIN UNNEST(el.metadata) AS em
      CROSS JOIN UNNEST(em.request) AS er
    WHERE er.pathname = '/functions/v1/${functionName}'
  )`
    : "";

  return `
SELECT
  datetime(t.timestamp) AS time,
  t.event_message,
  m.function_id,
  m.level,
  m.execution_id
FROM function_logs AS t
  CROSS JOIN UNNEST(t.metadata) AS m
WHERE m.event_type = 'Log'
  ${fnFilter}
ORDER BY t.timestamp DESC
LIMIT ${limit}
  `.trim();
}

function buildEdgeLogsQuery(functionName, limit) {
  // function_edge_logs: HTTP request/response metadata for each invocation.
  // metadata → request → pathname  (NOT "path" — actual column name is "pathname")
  const fnFilter = functionName
    ? `AND r.pathname = '/functions/v1/${functionName}'`
    : "AND r.pathname LIKE '/functions/v1/%'";

  return `
SELECT
  datetime(t.timestamp) AS time,
  r.method,
  r.pathname,
  r.search,
  res.status_code,
  m.execution_time_ms
FROM function_edge_logs AS t
  CROSS JOIN UNNEST(t.metadata) AS m
  CROSS JOIN UNNEST(m.request) AS r
  CROSS JOIN UNNEST(m.response) AS res
WHERE TRUE
  ${fnFilter}
ORDER BY t.timestamp DESC
LIMIT ${limit}
  `.trim();
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatRuntimeLogs(rows, functionName) {
  if (!rows || rows.length === 0) return "  (no runtime logs found)\n";

  return rows
    .map((row) => {
      const time = row.time || row.timestamp || "?";
      const msg = row.event_message || "";
      const level = row.level ? `[${row.level.toUpperCase()}] ` : "";
      return `  [${time}] ${level}${msg}`;
    })
    .join("\n");
}

function formatEdgeLogs(rows, functionName) {
  if (!rows || rows.length === 0) return "  (no edge logs found)\n";

  return rows
    .map((row) => {
      const time = row.time || "?";
      const method = row.method || "?";
      const path = row.pathname || row.path || "?";
      const status = row.status_code || "?";
      const latency = row.execution_time_ms != null ? `${row.execution_time_ms}ms` : "?";
      const statusIcon = status >= 500 ? "🔴" : status >= 400 ? "🟡" : "🟢";
      return `  [${time}] ${statusIcon} ${method} ${path} → ${status} (${latency})`;
    })
    .join("\n");
}

// ---------------------------------------------------------------------------
// Auto-detect project — monorepo-aware
// ---------------------------------------------------------------------------

/** Find the git repo root, falling back to cwd if not in a git repo. */
function findGitRoot(startDir) {
  try {
    return execSync("git rev-parse --show-toplevel", { cwd: startDir, stdio: ["pipe", "pipe", "pipe"] })
      .toString()
      .trim();
  } catch {
    return startDir;
  }
}

/**
 * Search for supabase/config.toml files under `baseDir`, up to `maxDepth` levels deep.
 * Uses targeted directory listing rather than full recursive walk — fast even in large monorepos.
 * Returns an array of { configPath, projectId } for all matches found.
 */
function findSupabaseConfigs(baseDir, maxDepth = 4) {
  const results = [];

  function scan(dir, depth) {
    if (depth > maxDepth) return;

    // Check if this dir itself contains supabase/config.toml
    const candidate = join(dir, "supabase", "config.toml");
    if (existsSync(candidate)) {
      const content = readFileSync(candidate, "utf8");
      const match = content.match(/project_id\s*=\s*["']?([a-z]{20})["']?/);
      if (match) {
        results.push({ configPath: candidate, projectId: match[1] });
        return; // don't descend further once we found supabase/ here
      }
    }

    // Descend into subdirectories, skipping noise
    const SKIP = new Set(["node_modules", ".git", ".opencode", "dist", "build", ".output", "coverage", ".turbo"]);
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (SKIP.has(entry.name) || entry.name.startsWith(".")) continue;
      scan(join(dir, entry.name), depth + 1);
    }
  }

  scan(baseDir, 0);
  return results;
}

async function resolveProject(token, explicitRef) {
  if (explicitRef) return explicitRef;

  const searchBase = findGitRoot(process.cwd());
  console.error(`🔍 Searching for supabase/config.toml under ${searchBase} (max depth 4)...`);

  const configs = findSupabaseConfigs(searchBase, 4);

  if (configs.length === 1) {
    console.error(`📎 Auto-detected project from ${configs[0].configPath}: ${configs[0].projectId}`);
    return configs[0].projectId;
  }

  if (configs.length > 1) {
    console.error("\nMultiple supabase configs found. Use --project <ref> to specify one:\n");
    for (const c of configs) {
      console.error(`  ${c.projectId}  (${c.configPath})`);
    }
    console.error("");
    process.exit(1);
  }

  // No config.toml found — fall back to Management API project list
  console.error("📡 No config.toml found, fetching projects from Supabase API...");
  const projects = await listProjects(token);

  if (!projects || projects.length === 0) {
    throw new Error("No Supabase projects found for this token.");
  }

  if (projects.length === 1) {
    console.error(`📎 Auto-selected only project: ${projects[0].name} (${projects[0].id})`);
    return projects[0].id;
  }

  // Multiple projects — list them and exit
  console.error("\nMultiple projects found. Use --project <ref> to specify one:\n");
  for (const p of projects) {
    console.error(`  ${p.id}  ${p.name}  (${p.region || "?"})`);
  }
  console.error("");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  loadEnv();

  const args = parseArgs(process.argv);

  if (args.help) {
    console.log(readFileSync(new URL(import.meta.url), "utf8").match(/\/\*\*([\s\S]*?)\*\//)[0]);
    process.exit(0);
  }

  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error(
      "❌ SUPABASE_ACCESS_TOKEN not set.\n" +
        "   Add it to your .env file:\n" +
        "   SUPABASE_ACCESS_TOKEN=sbp_...\n\n" +
        "   Get a token at: https://supabase.com/dashboard/account/tokens"
    );
    process.exit(1);
  }

  // Time range
  const durationMs = parseDuration(args.last);
  const now = new Date();
  const start = new Date(now - durationMs);
  const isoStart = start.toISOString();
  const isoEnd = now.toISOString();

  const projectRef = await resolveProject(token, args.project);
  const fnName = args.function || null;
  const limit = Math.min(args.limit, 1000);

  console.error(
    `\n📋 Fetching logs for project ${projectRef}` +
      (fnName ? ` / function: ${fnName}` : " / all functions") +
      `\n⏱  Time range: ${args.last} (${isoStart} → ${isoEnd})\n`
  );

  const results = { project: projectRef, function: fnName, timeRange: { start: isoStart, end: isoEnd }, runtime: [], edge: [] };
  const errors = [];

  // Fetch runtime logs
  if (args.type === "runtime" || args.type === "both") {
    try {
      const sql = buildRuntimeLogsQuery(fnName, limit);
      const data = await fetchLogs(token, projectRef, sql, isoStart, isoEnd);
      results.runtime = data.result || [];
    } catch (err) {
      errors.push(`Runtime logs error: ${err.message}`);
    }
  }

  // Fetch edge logs
  if (args.type === "edge" || args.type === "both") {
    try {
      const sql = buildEdgeLogsQuery(fnName, limit);
      const data = await fetchLogs(token, projectRef, sql, isoStart, isoEnd);
      results.edge = data.result || [];
    } catch (err) {
      errors.push(`Edge logs error: ${err.message}`);
    }
  }

  // Output
  if (args.output) {
    writeFileSync(args.output, JSON.stringify(results, null, 2));
    console.error(`✅ Logs saved to ${args.output}`);
    console.error(`   Runtime logs: ${results.runtime.length} entries`);
    console.error(`   Edge logs:    ${results.edge.length} entries`);
  } else {
    // Human-readable output
    if (results.runtime.length > 0 || args.type !== "edge") {
      console.log(`\n${"─".repeat(60)}`);
      console.log(`📟 RUNTIME LOGS (console output from function code)`);
      console.log("─".repeat(60));
      console.log(formatRuntimeLogs(results.runtime, fnName));
    }

    if (results.edge.length > 0 || args.type !== "runtime") {
      console.log(`\n${"─".repeat(60)}`);
      console.log(`🌐 EDGE LOGS (HTTP requests/responses)`);
      console.log("─".repeat(60));
      console.log(formatEdgeLogs(results.edge, fnName));
    }

    console.log(`\n${"─".repeat(60)}`);
    console.log(
      `📊 Summary: ${results.runtime.length} runtime entries, ${results.edge.length} edge entries`
    );
  }

  if (errors.length > 0) {
    console.error("\n⚠️  Errors encountered:");
    for (const e of errors) console.error(`   ${e}`);
  }
}

main().catch((err) => {
  console.error(`\n❌ Fatal error: ${err.message}`);
  process.exit(1);
});

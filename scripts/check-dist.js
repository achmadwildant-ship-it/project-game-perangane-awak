/**
 * check-dist.js
 * Gate: verify no dev-only route names leak into the production dist/.
 * Fails with exit code 1 if any of the forbidden strings are found.
 */
import fs from "fs";
import path from "path";

const DIST_DIR = new URL("../dist", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const FORBIDDEN = ["anchor-editor", "anchor-verify", "anchor-check"];

function walkFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

const files = walkFiles(DIST_DIR);
let found = false;

for (const file of files) {
  // Only scan text files (JS, HTML, CSS)
  if (!/\.(js|html|css|map)$/.test(file)) continue;
  const content = fs.readFileSync(file, "utf-8");
  for (const forbidden of FORBIDDEN) {
    if (content.includes(forbidden)) {
      console.error(`✗ Found forbidden string "${forbidden}" in: ${path.relative(DIST_DIR, file)}`);
      found = true;
    }
  }
}

if (found) {
  console.error("\n✗ dist/ contains dev-only route names. The production build is broken.");
  process.exit(1);
} else {
  console.log(`✓ dist/ check passed: none of [${FORBIDDEN.join(", ")}] found in production bundle.`);
}

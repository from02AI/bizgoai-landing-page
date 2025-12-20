import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const tailwindPath = path.join(root, "dist", "tailwind.css");
const legacyPath = path.join(root, "src", "styles", "legacy.css");
const outPath = path.join(root, "dist", "styles.css");

if (!fs.existsSync(tailwindPath)) {
  console.error(`Missing ${tailwindPath}. Run Tailwind build first.`);
  process.exit(1);
}

if (!fs.existsSync(legacyPath)) {
  console.error(`Missing ${legacyPath}. Run scripts/extract-inline-css.mjs first.`);
  process.exit(1);
}

const tailwind = fs.readFileSync(tailwindPath, "utf8");
const legacy = fs.readFileSync(legacyPath, "utf8");

// Preserve today’s cascade: Tailwind first, legacy overrides after.
const combined = `${tailwind}\n\n${legacy}`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, combined, "utf8");

console.log("Wrote dist/styles.css (tailwind + legacy overrides)");

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "index.html");
const legacyCssPath = path.join(root, "src", "styles", "legacy.css");

const html = fs.readFileSync(indexPath, "utf8");

// Match the legacy inline CSS block that currently sits between </head> ... </style> </head>
const styleBlockRegex = /<style>([\s\S]*?)<\/style>\s*<\/head>/m;
const match = html.match(styleBlockRegex);

if (!match) {
  console.error("No inline <style>...</style></head> block found. Nothing to extract.");
  process.exit(1);
}

const css = match[1];
fs.mkdirSync(path.dirname(legacyCssPath), { recursive: true });
fs.writeFileSync(legacyCssPath, css, "utf8");

let updated = html;

// Remove the inline style block + the extra closing </head> that follows it.
updated = updated.replace(styleBlockRegex, "");

// Switch the linked CSS to the combined build output.
updated = updated.replace(
  /<link\s+rel="stylesheet"\s+href="\.\/dist\/tailwind\.css\?v=\d+"\s*>/,
  '<link rel="stylesheet" href="./dist/styles.css?v=5">'
);

// If the stylesheet link didn't match (unexpected version/format), try a looser replace.
if (!updated.includes("./dist/styles.css")) {
  updated = updated.replace(
    /<link\s+rel="stylesheet"\s+href="\.\/dist\/tailwind\.css([^"]*)"\s*>/,
    '<link rel="stylesheet" href="./dist/styles.css?v=5">'
  );
}

fs.writeFileSync(indexPath, updated, "utf8");

console.log("Extracted inline CSS to src/styles/legacy.css and updated index.html to use dist/styles.css?v=5");

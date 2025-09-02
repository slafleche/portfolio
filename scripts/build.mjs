import { build } from "esbuild";
import { vanillaExtractPlugin } from "@vanilla-extract/esbuild-plugin";
import fs from "fs";
import path from "path";

// Delete public folder if it exists
const PUBLIC_DIR = "public";
if (fs.existsSync(PUBLIC_DIR)) {
  fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
  console.log("[build] Cleared previous public folder");
}

// Recreate public folder
fs.mkdirSync(PUBLIC_DIR);
console.log("[build] Created public folder");

// Create minimal index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio</title>
</head>
<body>
  <div id="root"></div>
  <script src="./main.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(PUBLIC_DIR, "index.html"), indexHtml);
console.log("[build] Created index.html");

// Build React app
await build({
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outfile: path.join(PUBLIC_DIR, "main.js"),
  minify: true,
  sourcemap: true,
  loader: { ".ts": "ts", ".tsx": "tsx" },
  plugins: [vanillaExtractPlugin()],
  define: { "process.env.NODE_ENV": '"production"' },
});

console.log("[build] Build complete");

import { build } from "esbuild";
import { vanillaExtractPlugin } from "@vanilla-extract/esbuild-plugin";
import chokidar from "chokidar";
import http from "http";
import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";

const PUBLIC_DIR = "public";
const OUTFILE = path.join(PUBLIC_DIR, "main.js");
const PORT = 3000;

// Ensure public folder exists and index.html is there
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);
const indexPath = path.join(PUBLIC_DIR, "index.html");
if (!fs.existsSync(indexPath)) {
  const html = `<!DOCTYPE html>
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
</html>`;
  fs.writeFileSync(indexPath, html);
  console.log("[serve] Created index.html");
}

// Build function
async function bundle() {
  try {
    await build({
      entryPoints: ["src/index.tsx"],
      bundle: true,
      outfile: OUTFILE,
      sourcemap: true,
      minify: false,
      loader: { ".ts": "ts", ".tsx": "tsx" },
      plugins: [vanillaExtractPlugin()],
      define: { "process.env.NODE_ENV": '"development"' },
    });
    console.log("[esbuild] Build complete.");
  } catch (err) {
    console.error("[esbuild] Build failed:", err);
  }
}

// Initial build
await bundle();

// Watch src folder
chokidar
  .watch("src", { ignoreInitial: true })
  .on("all", async (event, file) => {
    console.log(`[watch] ${event}: ${file}`);
    await bundle();
  });

// Serve public folder
const server = http.createServer((req, res) => {
  const filePath = path.join(
    PUBLIC_DIR,
    req.url === "/" ? "index.html" : req.url,
  );
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Server running at: ${url}`);
  console.log(`Clickable link: \u001B]8;;${url}\u0007${url}\u001B]8;;\u0007`);

  // Auto-open browser on macOS
  exec(`open ${url}`);

  // Show network IP
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        console.log(
          `Accessible on your network: http://${iface.address}:${PORT}`,
        );
      }
    }
  }
});

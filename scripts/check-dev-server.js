import { createServer } from "vite";

async function verifyDevServer() {
  const port = 5174;
  const server = await createServer({
    server: { port, host: "127.0.0.1" },
    logLevel: "silent",
  });

  try {
    await server.listen();
    const baseUrl = `http://127.0.0.1:${port}`;

    // 1. Fetch root HTML
    const resHtml = await fetch(`${baseUrl}/`);
    if (!resHtml.ok) {
      throw new Error(`Dev server root failed with HTTP ${resHtml.status}`);
    }
    const htmlText = await resHtml.text();
    if (!htmlText.includes("index.html") && !htmlText.includes("<div id=\"app\">")) {
      throw new Error("Dev server root HTML is missing expected app container");
    }

    // 2. Fetch /src/main.ts (triggers Vite dev transform on main entrypoint)
    const resMain = await fetch(`${baseUrl}/src/main.ts`);
    if (!resMain.ok) {
      throw new Error(`Dev server /src/main.ts failed with HTTP ${resMain.status}`);
    }
    const mainText = await resMain.text();
    if (mainText.includes("Error:") || mainText.includes("PARSE_ERROR")) {
      throw new Error(`Error in /src/main.ts:\n${mainText.slice(0, 300)}`);
    }

    // 3. Fetch /src/config.ts (triggers Vite dev transform on config)
    const resConfig = await fetch(`${baseUrl}/src/config.ts`);
    if (!resConfig.ok) {
      throw new Error(`Dev server /src/config.ts failed with HTTP ${resConfig.status}`);
    }
    const configText = await resConfig.text();
    if (configText.includes("Error:") || configText.includes("PARSE_ERROR")) {
      throw new Error(`Error in /src/config.ts:\n${configText.slice(0, 300)}`);
    }

    console.log("✓ Dev server check passed: root, /src/main.ts, and /src/config.ts loaded cleanly with HTTP 200.");
  } finally {
    await server.close();
  }
}

verifyDevServer().catch((err) => {
  console.error("✗ Dev server check failed:", err.message);
  process.exit(1);
});


/**
 * Starts Next on 0.0.0.0 and prints URLs you can actually open.
 * 0.0.0.0 is only a bind address — browsers cannot navigate to it (ERR_ADDRESS_INVALID).
 */
import { spawn } from "node:child_process";
import { join } from "node:path";
import os from "node:os";

const port = Number(process.env.PORT) || 3000;

function isLanIPv4(net) {
  if (net.internal) return false;
  return net.family === "IPv4" || net.family === 4;
}

function printDevUrls() {
  console.log("");
  console.log("  Open in this PC’s browser:");
  console.log(`    http://localhost:${port}`);
  console.log("");
  console.log("  On your phone (same Wi‑Fi), use your PC’s address — not 0.0.0.0:");
  const nets = os.networkInterfaces();
  let any = false;
  for (const addrs of Object.values(nets)) {
    if (!addrs) continue;
    for (const net of addrs) {
      if (isLanIPv4(net)) {
        console.log(`    http://${net.address}:${port}`);
        any = true;
      }
    }
  }
  if (!any) {
    console.log("    (no non-internal IPv4 found — check Wi‑Fi / run ipconfig)");
  }
  console.log("");
}

printDevUrls();

const nextCli = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextCli, "dev", "-H", "0.0.0.0", "-p", String(port)], {
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));

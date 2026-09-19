// scripts/wait-vite.js
// 等待 Vite dev server 在 5173 端口启动
const http = require("http");

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function check() {
  for (let i = 0; i < 30; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get("http://127.0.0.1:5173", (res) => {
          resolve(res);
        });
        req.on("error", reject);
        req.setTimeout(1000, () => req.destroy(new Error("timeout")));
      });
      console.log("[electron:wait] Vite ready on 5173");
      return;
    } catch {
      await wait(1000);
    }
  }
  console.error("[electron:wait] Vite timeout (30s)");
  process.exit(1);
}

check();

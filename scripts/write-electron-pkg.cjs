// scripts/write-electron-pkg.js
// 在 dist-electron/ 下生成子 package.json，声明 type=commonjs
// 解决根 package.json 的 "type": "module" 让 Electron 主进程 .js 被当 ESM 的问题
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "dist-electron");
const outFile = path.join(outDir, "package.json");

if (!fs.existsSync(outDir)) {
  console.error(`[write-electron-pkg] ${outDir} not found, run tsc first`);
  process.exit(1);
}

const content = {
  type: "commonjs",
  main: "main.js",
};

fs.writeFileSync(outFile, JSON.stringify(content, null, 2) + "\n", "utf-8");
console.log(`[write-electron-pkg] wrote ${outFile}`);

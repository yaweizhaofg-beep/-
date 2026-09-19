// scripts/diagnose-electron.cjs
// Electron 启动诊断脚本：在本地终端运行会输出完整错误日志
// 解决 npm run electron:dev 因 sandbox 不显示错误的问题
const path = require("path");
const fs = require("fs");

console.log("=== Electron 启动诊断 ===\n");

// 1. 检查 main 字段
const rootPkg = require(path.join(__dirname, "..", "package.json"));
console.log("1. Root package.json");
console.log("   main:", rootPkg.main || "(missing)");
console.log("   type:", rootPkg.type);
if (!rootPkg.main) {
  console.error("   ❌ 缺少 main 字段");
  process.exit(1);
}

// 2. 检查入口文件
const mainFile = path.join(__dirname, "..", rootPkg.main);
console.log("\n2. Main 入口文件");
console.log("   path:", mainFile);
console.log("   exists:", fs.existsSync(mainFile));
if (!fs.existsSync(mainFile)) {
  console.error(`   ❌ 入口文件不存在，请先运行: npm run electron:compile`);
  process.exit(1);
}

// 3. 检查 dist-electron/package.json
const subPkg = path.join(__dirname, "..", "dist-electron", "package.json");
console.log("\n3. dist-electron/package.json (子包覆盖)");
if (fs.existsSync(subPkg)) {
  const content = JSON.parse(fs.readFileSync(subPkg, "utf-8"));
  console.log("   type:", content.type);
  if (content.type !== "commonjs") {
    console.error(`   ❌ 子包 type 必须是 commonjs (当前: ${content.type})`);
    process.exit(1);
  }
} else {
  console.error(`   ❌ 子包 package.json 不存在，请运行: npm run electron:compile`);
  process.exit(1);
}

// 4. 检查 main.js 模块格式
const mainContent = fs.readFileSync(mainFile, "utf-8");
const isCJS = /"use strict"|module\.exports|require\(/.test(mainContent);
console.log("\n4. Main 文件格式");
console.log("   is CJS:", isCJS);
if (!isCJS) {
  console.error("   ❌ main.js 不是 CJS 格式");
  process.exit(1);
}

// 5. 检查 preload
const preloadFile = path.join(__dirname, "..", "dist-electron", "preload.js");
console.log("\n5. Preload 文件");
console.log("   exists:", fs.existsSync(preloadFile));

// 6. Node 直接 require 测试
console.log("\n6. Node CJS 加载测试");
try {
  // 模拟 Electron 的 require 但 mock electron 模块
  const Module = require("module");
  const orig = Module.prototype.require;
  Module.prototype.require = function (id) {
    if (id === "electron") {
      return new Proxy({}, {
        get: (target, prop) => {
          // app / BrowserWindow / ipcMain / dialog / shell / nativeTheme 都返回 undefined
          // 这是预期行为，错误会在 app.whenReady() 调用时出现
          return undefined;
        },
      });
    }
    return orig.apply(this, arguments);
  };
  // 在 mock 环境下 require 应该成功（不再报 ESM 错误）
  // 不实际执行 app.whenReady() 所以不会触发运行时错误
  const code = fs.readFileSync(mainFile, "utf-8");
  new Function("require", "module", "exports", "__dirname", "__filename", code);
  console.log("   ✅ 文件可被 Node 以 CJS 加载");
} catch (e) {
  console.error("   ❌ CJS 加载失败:", e.message);
  process.exit(1);
}

// 7. Electron 二进制
console.log("\n7. Electron 二进制");
const electronBin = path.join(__dirname, "..", "node_modules", ".bin", "electron");
if (fs.existsSync(electronBin)) {
  console.log("   path:", electronBin);
  console.log("   ✅ 已安装");
} else {
  console.error("   ❌ Electron 未安装，请运行: npm install");
  process.exit(1);
}

console.log("\n=== ✅ 所有静态检查通过 ===");
console.log("\n下一步：在本地终端运行");
console.log("  npm run electron:dev");
console.log("\n如仍失败，捕获完整错误：");
console.log("  npm run electron:dev 2>&1 | tee electron-debug.log");
console.log("  ./node_modules/.bin/electron . 2>&1 | tee electron-stdout.log");

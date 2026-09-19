// ═══════════════════════════════════════════════════════════════════════════════════
// electron/main.ts - Electron 主进程 (CommonJS)
// 负责窗口管理、IPC 通信、文件对话框
// ═══════════════════════════════════════════════════════════════════════════════════

import { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } from "electron";
import * as path from "path";

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV !== "production";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#0a0912",
    show: false,
    frame: false,        // 无边框窗口（配合自定义 titlebar）
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 14, y: 10 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 加载页面
  if (isDev) {
    mainWindow.loadURL("http://127.0.0.1:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // 新窗口打开到外部浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

// ─── App Lifecycle ───────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ─── IPC Handlers ───────────────────────────────────────────────────────────────

// 窗口控制
ipcMain.handle("window:minimize", () => mainWindow?.minimize());
ipcMain.handle("window:maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.handle("window:close", () => mainWindow?.close());
ipcMain.handle("window:isMaximized", () => mainWindow?.isMaximized());

// 文件对话框
ipcMain.handle("dialog:openFile", async (_event: unknown, options: {
  filters?: { name: string; extensions: string[] }[];
  title?: string;
  multiple?: boolean;
}) => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: options.title ?? "选择文件",
    filters: options.filters ?? [{ name: "所有文件", extensions: ["*"] }],
    properties: [
      "openFile",
      ...(options.multiple ? ["multiSelections" as const] : []),
    ],
  });
  return result.canceled ? null : result.filePaths;
});

ipcMain.handle("dialog:saveFile", async (_event: unknown, options: {
  defaultPath?: string;
  filters?: { name: string; extensions: string[] }[];
  title?: string;
}) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    title: options.title ?? "保存文件",
    defaultPath: options.defaultPath,
    filters: options.filters ?? [{ name: "所有文件", extensions: ["*"] }],
  });
  return result.canceled ? null : result.filePath;
});

// 系统信息
ipcMain.handle("system:getPlatform", () => process.platform);
ipcMain.handle("system:getTheme", () => nativeTheme.shouldUseDarkColors ? "dark" : "light");

// Shell 操作
ipcMain.handle("shell:openExternal", (_event: unknown, url: string) => shell.openExternal(url));

// 应用信息
ipcMain.handle("app:getVersion", () => app.getVersion());

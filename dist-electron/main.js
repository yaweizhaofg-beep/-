"use strict";
// ═══════════════════════════════════════════════════════════════════════════════════
// electron/main.ts - Electron 主进程 (CommonJS)
// 负责窗口管理、IPC 通信、文件对话框
// ═══════════════════════════════════════════════════════════════════════════════════
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
let mainWindow = null;
const isDev = process.env.NODE_ENV !== "production";
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 960,
        minHeight: 640,
        backgroundColor: "#0a0912",
        show: false,
        frame: false, // 无边框窗口（配合自定义 titlebar）
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
    }
    else {
        mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    }
    mainWindow.once("ready-to-show", () => {
        mainWindow?.show();
    });
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    // 新窗口打开到外部浏览器
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: "deny" };
    });
}
// ─── App Lifecycle ───────────────────────────────────────────────────────────────
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
// ─── IPC Handlers ───────────────────────────────────────────────────────────────
// 窗口控制
electron_1.ipcMain.handle("window:minimize", () => mainWindow?.minimize());
electron_1.ipcMain.handle("window:maximize", () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    }
    else {
        mainWindow?.maximize();
    }
});
electron_1.ipcMain.handle("window:close", () => mainWindow?.close());
electron_1.ipcMain.handle("window:isMaximized", () => mainWindow?.isMaximized());
// 文件对话框
electron_1.ipcMain.handle("dialog:openFile", async (_event, options) => {
    const result = await electron_1.dialog.showOpenDialog(mainWindow, {
        title: options.title ?? "选择文件",
        filters: options.filters ?? [{ name: "所有文件", extensions: ["*"] }],
        properties: [
            "openFile",
            ...(options.multiple ? ["multiSelections"] : []),
        ],
    });
    return result.canceled ? null : result.filePaths;
});
electron_1.ipcMain.handle("dialog:saveFile", async (_event, options) => {
    const result = await electron_1.dialog.showSaveDialog(mainWindow, {
        title: options.title ?? "保存文件",
        defaultPath: options.defaultPath,
        filters: options.filters ?? [{ name: "所有文件", extensions: ["*"] }],
    });
    return result.canceled ? null : result.filePath;
});
// 系统信息
electron_1.ipcMain.handle("system:getPlatform", () => process.platform);
electron_1.ipcMain.handle("system:getTheme", () => electron_1.nativeTheme.shouldUseDarkColors ? "dark" : "light");
// Shell 操作
electron_1.ipcMain.handle("shell:openExternal", (_event, url) => electron_1.shell.openExternal(url));
// 应用信息
electron_1.ipcMain.handle("app:getVersion", () => electron_1.app.getVersion());

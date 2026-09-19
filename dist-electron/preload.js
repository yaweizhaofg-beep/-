"use strict";
// ═══════════════════════════════════════════════════════════════════════════════════
// electron/preload.ts - Electron 预加载脚本
// 通过 contextBridge 安全暴露 IPC API 给渲染进程
// ═══════════════════════════════════════════════════════════════════════════════════
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const api = {
    window: {
        minimize: () => electron_1.ipcRenderer.invoke("window:minimize"),
        maximize: () => electron_1.ipcRenderer.invoke("window:maximize"),
        close: () => electron_1.ipcRenderer.invoke("window:close"),
        isMaximized: () => electron_1.ipcRenderer.invoke("window:isMaximized"),
    },
    dialog: {
        openFile: (options) => electron_1.ipcRenderer.invoke("dialog:openFile", options ?? {}),
        saveFile: (options) => electron_1.ipcRenderer.invoke("dialog:saveFile", options ?? {}),
    },
    system: {
        getPlatform: () => electron_1.ipcRenderer.invoke("system:getPlatform"),
        getTheme: () => electron_1.ipcRenderer.invoke("system:getTheme"),
    },
    shell: {
        openExternal: (url) => electron_1.ipcRenderer.invoke("shell:openExternal", url),
    },
    app: {
        getVersion: () => electron_1.ipcRenderer.invoke("app:getVersion"),
    },
};
electron_1.contextBridge.exposeInMainWorld("electronAPI", api);

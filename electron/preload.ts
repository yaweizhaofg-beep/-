// ═══════════════════════════════════════════════════════════════════════════════════
// electron/preload.ts - Electron 预加载脚本
// 通过 contextBridge 安全暴露 IPC API 给渲染进程
// ═══════════════════════════════════════════════════════════════════════════════════

import { contextBridge, ipcRenderer } from "electron";

export interface ElectronAPI {
  // 窗口控制
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  };
  // 文件对话框
  dialog: {
    openFile: (options?: {
      filters?: { name: string; extensions: string[] }[];
      title?: string;
      multiple?: boolean;
    }) => Promise<string[] | null>;
    saveFile: (options?: {
      defaultPath?: string;
      filters?: { name: string; extensions: string[] }[];
      title?: string;
    }) => Promise<string | null>;
  };
  // 系统
  system: {
    getPlatform: () => Promise<string>;
    getTheme: () => Promise<"dark" | "light">;
  };
  // Shell
  shell: {
    openExternal: (url: string) => Promise<void>;
  };
  // App
  app: {
    getVersion: () => Promise<string>;
  };
}

const api: ElectronAPI = {
  window: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    maximize: () => ipcRenderer.invoke("window:maximize"),
    close: () => ipcRenderer.invoke("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:isMaximized"),
  },
  dialog: {
    openFile: (options) => ipcRenderer.invoke("dialog:openFile", options ?? {}),
    saveFile: (options) => ipcRenderer.invoke("dialog:saveFile", options ?? {}),
  },
  system: {
    getPlatform: () => ipcRenderer.invoke("system:getPlatform"),
    getTheme: () => ipcRenderer.invoke("system:getTheme"),
  },
  shell: {
    openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url),
  },
  app: {
    getVersion: () => ipcRenderer.invoke("app:getVersion"),
  },
};

contextBridge.exposeInMainWorld("electronAPI", api);

// 声明全局类型
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

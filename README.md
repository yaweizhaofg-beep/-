# 星核耀火 AI 桌面应用

> 1:1 还原 Figma 设计稿的桌面软件原型

## 项目简介

基于 Figma Make 生成的 React + TypeScript 代码，开发桌面软件原型。

## 技术栈

- **React 18** + **TypeScript**
- **Vite** 构建工具
- **Lucide React** 图标库
- **后期可集成 Electron** 打包为桌面应用

## 桌面适配

- **主窗口**：1440×900（标准桌面）
- **侧边栏**：220px（展开）/ 64px（收起）
- **顶栏**：56px（含窗口控制）
- **响应式**：1024px - 1440px 自动适配

## 页面结构

```
星核耀火2.0/
├── src/
│   ├── App.tsx                        # 主应用
│   ├── shared.ts                      # 共享数据/类型
│   ├── main.tsx                       # 入口
│   ├── styles/
│   │   └── globals.css                # 全局样式
│   └── pages/
│       ├── WorkspacePage              # 工作空间（首页）
│       ├── ProjectsPage               # 项目列表
│       ├── StoryboardPage             # 分镜工作台 ⭐
│       ├── CanvasPage                 # 画布编辑器 ⭐
│       ├── PlotAnalysisPage           # 剧情解析 ⭐
│       └── TeamPage                   # 团队管理 ⭐
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 功能模块

### 1. 工作空间（dashboard）
- 用户欢迎信息
- 快捷统计（并发任务、余额等）
- 最近项目展示
- 快速开始入口

### 2. 项目列表
- 项目卡片视图
- 进度条展示
- 状态标识

### 3. 分镜工作台 ⭐ 核心功能
- **左侧**：分镜列表（支持网格/列表切换）
- **右侧**：视频预览 + 生成信息
- 状态管理：排队、生成中、已完成、失败
- 操作：重新生成、下载、批量提交

### 4. 画布编辑器 ⭐ 核心功能
- **节点画布**：可拖拽节点（剧本、角色、场景、分镜、生图、审核、导出）
- **SVG 连线**：电流流动动画效果
- **缩放/平移**：滚轮缩放、Alt+拖拽平移
- **工具栏**：选择、移动、连线、节点、文本

### 5. 剧情解析 ⭐ 核心功能
- 解析列表（已完成、解析中、排队中）
- 新建解析弹窗
- 详情页（场景分析、角色出场、AI 摘要）

### 6. 团队管理 ⭐ 核心功能
- 成员列表（头像、角色、状态）
- 在线/离线状态
- 邀请成员弹窗（账号输入 + 职能选择）
- 角色修改、移除成员

### 7. 素材库
- 占位页面（待实现）

### 8. 账单
- 个人钱包 / 团队钱包余额展示
- 快速充值

## 启动项目

### 1. 安装依赖
```bash
cd /Users/zhaoyawei/Documents/星核耀火2.0
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问应用
打开浏览器访问 http://localhost:5173

## 打包为桌面应用（可选）

### 安装 Electron
```bash
npm install electron electron-builder -D
```

### 添加主进程文件 `main.js`
```javascript
const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: false,         // 无边框窗口
    titleBarStyle: 'hidden', // macOS
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.loadFile('dist/index.html')
}

app.whenReady().then(createWindow)
```

### 打包
```bash
npm run build
electron-builder
```

## 设计规范

- **主色调**：橙色 (#FF8A1F)
- **辅色**：紫色 (#A78BFA)
- **背景**：深色 (#0A0912)
- **字体**：PingFang SC / Microsoft YaHei
- **圆角**：8-16px
- **动画**：0.15s - 0.4s ease

## 后续优化

- [ ] 落地页完整实现（注册、登录、引导流程）
- [ ] 素材库完整功能
- [ ] 用户中心
- [ ] Electron 集成（窗口控制、菜单栏）
- [ ] 数据持久化
- [ ] 真实 API 接入
- [ ] 键盘快捷键支持
- [ ] 主题切换（深色/浅色）

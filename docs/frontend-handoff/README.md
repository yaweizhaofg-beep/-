# 星核耀火 · 前端交付说明

> 交付日期：2026-09-19
> 交付分支：`handoff/frontend-ui`（基于 main `b8f6bb9`）
> 接收方：前端研发

本说明面向接手的前端工程师，介绍项目现状、本轮交付边界、如何启动、哪些已完成 / 未完成 / 未验证，以及建议的接手顺序。**请同时阅读根目录 `docs/ui-implementation.md`（设计还原记录、可用性优化轮次、未验证项）。**

---

## 1. 技术栈

| 项 | 版本 / 说明 |
| --- | --- |
| 框架 | React 18 + TypeScript 5 |
| 构建 | Vite 5（`base: "./"`，支持任意子路径部署） |
| 桌面壳 | Electron 28（已配置，含 `electron/main.ts` / `electron/preload.ts` / `dist-electron/`） |
| 图标 | lucide-react 0.344 |
| 路由 | 自研 hash-router + deep-link（`?page=xxx`）+ popstate 同步 |
| 状态 | 局部 `useState`（页面内）；未引入全局状态库 |
| 样式 | 内联 CSS-in-JS（`style={{...}}`）+ `src/styles/globals.css`（玻璃质感、scrollbar、动效 keyframes） |
| TypeScript | `strict` + `noUnusedLocals`（编译 0 错误） |

**包管理器**：本项目用 `npm`，提交了 `package-lock.json`。不要换 pnpm / yarn，否则 lockfile 失效。

---

## 2. 环境要求

- Node.js 20+（GitHub Actions 用 20）
- macOS / Linux / Windows 均可（开发不需要 Electron 二进制）
- 端口：默认 9091（`vite.config.ts` 已加 `strictPort: false` + polling watch 以兼容沙盒）
- Electron 启动需要图形界面；沙盒环境无法验证，已通过 `electron:diagnose` 脚本做静态检查

---

## 3. 安装与启动

```bash
# 1. 克隆并 checkout 交付分支
git clone https://github.com/yaweizhaofg-beep/-.git
cd -
git fetch origin
git checkout handoff/frontend-ui

# 2. 安装依赖
npm ci          # 或 npm install（lockfile 兼容）

# 3. 类型检查
npm run typecheck

# 4. 浏览器预览（仅前端 UI）
npm run dev
# → http://127.0.0.1:9091/ （被占用则自动换端口，看终端输出）

# 5. 生产构建
npm run build
# 产物在 dist/，可直接静态托管（已配 GitHub Pages：main 分支推送触发 .github/workflows/deploy.yml）

# 6. Electron 桌面调试（需要 GUI）
npm run electron:diagnose    # 静态诊断
npm run electron:dev         # 自动等 Vite + 启动 Electron
npm run electron:build       # 全量打包（需 electron-builder 配置）
```

### 常用深链（直接打开任意页面）

| URL | 用途 |
| --- | --- |
| `/?page=workspace` | 创作首页 |
| `/?page=projects` | 全部剧目 |
| `/?page=new-project` | 新建剧目（双栏 + AI 助手） |
| `/?page=plot-analysis` | 剧情解析入口（视频解析 / 小说改编） |
| `/?page=storyboard` | 分镜工作台 |
| `/?page=canvas` | 无限画布 |
| `/?page=team-assets` | 资产库 |
| `/?page=billing` | 账单 |
| `/?page=register` | 注册 |
| `/?page=onboarding` | 引导 |

浏览器前进 / 后退会自动同步选中态（已加 `popstate` 监听）。

---

## 4. 代码结构

```
.
├── electron/                    # Electron 主进程 + preload
├── scripts/                     # .cjs 工具脚本（wait-vite / diagnose / write-pkg）
├── docs/
│   ├── ui-implementation.md     # 设计还原 + 可用性优化记录
│   └── frontend-handoff/        # ← 本文件
├── src/
│   ├── App.tsx                  # 路由 + 窗口壳 + Sidebar/Header
│   ├── main.tsx                 # 入口
│   ├── shared.ts                # colors / PageId / PLANS / STUDIO_MEMBERS / PLOT_ANALYSES / PROJECT / STORYBOARDS / TASK
│   ├── styles/globals.css       # 全局动画 / 玻璃 / scrollbar
│   └── pages/
│       ├── LandingPage.tsx      # 落地页（Banners / FAQ / Plans / Hero）
│       ├── AuthPage.tsx / RegisterPage.tsx / OnboardingPage.tsx
│       ├── WorkspacePage.tsx    # 创作首页（4 入口 + 顶部 CTA）
│       ├── NewProjectPage.tsx   # 新建剧目（双栏 + 模式卡 + 5 参数 + AI 助手）
│       ├── PlotAnalysisPage.tsx # 入口 + 视频/小说流程壳（路由到子视图）
│       ├── PlotAnalysis/        # 拆分后的子视图
│       │   ├── shared.tsx       # IAEntry / EpInfo / SbShot 类型 + NOVEL_ASSETS / EPS / SB_SHOTS 数据
│       │   ├── AssetsView.tsx   # Make 1148-1571 移植：分类 tab + 卡片网格 + 编辑 modal + 装造版本
│       │   └── ScriptView.tsx   # Make 1581-1760 移植：集切换 + 镜头列表 + 角色 @ tooltip
│       ├── StoryboardPage.tsx   # 分镜工作台（1:1 Make + 本轮可用性优化）
│       ├── CanvasPage.tsx       # 无限画布
│       ├── TeamAssetsPage.tsx   # 团队资产
│       ├── TeamPage.tsx
│       ├── BatchPage.tsx        # 批量生成任务
│       ├── ResultPage.tsx       # 生成结果
│       ├── DeliveryPage.tsx
│       ├── BillingPage.tsx      # 账单
│       ├── UpgradePage.tsx      # 升级套餐
│       ├── UserCenterPage.tsx
│       └── AIChapterPage.tsx
├── tmp/make-app.tsx             # Figma Make 导出参考（不参与构建）
├── make-src/App.tsx             # 同上（备份）
├── package.json / package-lock.json
├── tsconfig.json / tsconfig.electron.json
├── vite.config.ts
└── .github/workflows/deploy.yml # 仅 main 触发 GitHub Pages 部署
```

---

## 5. 已完成（本仓库当前 HEAD）

### 已还原 / 已实现的页面

- ✅ 落地页（Landing）：Nav / Banner / Hero / 流程 / 套餐 / FAQ / 响应式
- ✅ 登录 / 注册 / 引导（demo，未接真实账号系统）
- ✅ 创作首页（Workspace）：4 个快速入口卡 + 顶部 CTA + 空间切换
- ✅ 全部剧目（projects）：项目卡片网格 + 状态徽章
- ✅ 新建剧目（new-project）：小说/剧本双模式 + 5 参数 + 上传 + AI 助手右栏
- ✅ 剧情解析入口（plot-analysis）：2 张大入口卡（视频解析 / 小说转分镜）
- ✅ 视频解析流程：左侧剧集列表 + 中央 E 集标题 / 3 数据 / 3 tab（情节曲线 / 场景时间线 / 人物群像）+ AreaChart
- ✅ 小说改编流程：4 子 tab（导入改编 / 分集规划 / 资产确认 / 剧本编辑）
- ✅ **资产确认 AssetsView**：分类 tab（角色/场景/道具）+ 卡片网格 + 新增按钮 + 编辑 modal（prompt / 装造版本 / 提示词导出）
- ✅ **剧本编辑 ScriptView**：集切换 rail + 镜头列表（景别/运镜/时长/视觉描述/对白/角色 @ tooltip）+ 提示词编辑/导出 + 跳转分镜编辑
- ✅ 分镜工作台（storyboard）：1:1 Make 还原 + 本轮可用性优化
- ✅ 无限画布（canvas）
- ✅ 资产库（team-assets）
- ✅ 团队 / 账单 / 升级 / 批量生成 / 生成结果 / AI 章节

### 本轮可用性优化（仅 StoryboardPage）

- 工具栏低频操作收进"更多"下拉（撤销 / 重做 / 连续预览 / 生成记录）
- 工具栏左侧面包屑：`资产 / 《项目》 / 第N集 · M 镜 · 已完成 K/T`
- 批量按钮按选中数条件显示（未选灰显 + 提示）
- 删除二次确认
- 右资产面板可折叠（与左栏对称）
- 生成锁仅团队态显示
- 多处冗余信息去除

完整映射表见 `docs/ui-implementation.md` "可用性优化轮次"。

---

## 6. 已验证

| 项 | 方式 | 结果 |
| --- | --- | --- |
| TypeScript 编译 | `npm run typecheck` | ✅ 0 错误 |
| 生产构建 | `npm run build` | ✅ 606.66 kB / gzip 153.16 kB，1492 模块 |
| Git 状态 | `git status` | ✅ 工作区干净（HEAD `b8f6bb9`） |
| 路由跳转 | 浏览器 snapshot | ✅ 深链 / 前进后退 / popstate |
| 截图（早期） | `.cursor/skills/pc-design-fidelity/` 的 page-*.png | 见 `docs/ui-implementation.md` 验证清单 |

---

## 7. **未验证**（沙盒内浏览器实测受限，需在本地或真实环境补测）

- **AssetsView / ScriptView 完整交互**：modal、装造版本管理、@tooltip、跳转到分镜编辑 —— 代码完整但沙盒浏览器 snapshot 缓存导致 UI 滞后
- **Electron 桌面运行**：图形界面启动 / 窗口拖拽 / 文件对话框 / IPC / 打包签名 —— 沙盒禁止 GUI 进程
- **本地音频 / 视频预览**：当前为 CSS 渐变占位，未接真实媒体
- **vite dev server 文件监听**：已加 `usePolling: true, interval: 300`；本地 Linux/macOS 通常 fsevents/inotify 正常
- **删除二次确认**目前用浏览器原生 `confirm()`，Electron 化后建议替换为自定义 modal

**沙盒内未实测项 = 接手后最先要补测的项。**

---

## 8. 已知问题

### 设计还原层面

- Make 资源中部分交互（如批量生成的真实进度回调、AI 助手上下文记忆）未接真实服务，均为 demo 模拟
- 字体未硬编码，沿用本地 sans-serif（推断）；如需精确还原需补 PingFang / Inter
- 移动端 / 平板未单独适配（PC 桌面软件目标）

### 业务接入层面

- **LLM / 视频生成 / 图片生成**全部为前端模拟：
  - `NewProjectPage.sendChat`：`setTimeout 600ms` 模拟回复
  - `StoryboardPage.cycleStatus`：点击循环切换状态，**未接真实模型**
  - `CostConfirmModal`：确认后跳到 `batch` 页，**未真实扣费**
- **文件上传**：只记录文件名（`uploadedFile: string`），未做 MIME / 大小 / 后端读取
- **登录 / 注册 / 付费 / 用户体系**：均为本地状态，无后端

### 工程层面

- 浏览器主 chunk 606 kB（gzip 153 kB），建议后续 `manualChunks` 拆分（vite 已警告）
- 未配置 ESLint / Prettier / 单元测试
- 未配置 CI 单元测试（仅 GitHub Pages 部署工作流）

---

## 9. 建议接手顺序（前 3 件优先）

1. **本地跑通 + 实测 AssetsView / ScriptView 交互**：见上文"未验证"，先在 `?page=plot-analysis` 走完 小说改编 / 视频解析 全流程，补回 UI 回归用例
2. **接入真实后端服务**：优先 `NewProjectPage` 的 AI 助手 chat（替换 `setTimeout` 为 fetch + 流式渲染）；再处理 `StoryboardPage` 的生成回调（轮询 / SSE / WebSocket 选一种）
3. **拆分主 chunk + 配置 ESLint / Prettier**：当前内联样式 + 606 kB 单 chunk 难以维护，建议按 `pages/*` 拆 chunk，统一 lint

---

## 10. mock 数据 / 真实接口 / 待接入服务

| 位置 | 当前 | 接入位置（建议） |
| --- | --- | --- |
| `src/shared.ts` | `PLANS / STUDIO_MEMBERS / PLOT_ANALYSES / PROJECT / STORYBOARDS / TASK` 全为本地常量 | 接 `GET /api/plans` `GET /api/projects/:id` 等 |
| `src/pages/NewProjectPage.tsx` `sendChat` | `setTimeout` 模拟 AI | `POST /api/ai/chat` 流式 |
| `src/pages/StoryboardPage.tsx` `cycleStatus` / `CostConfirmModal` | 状态机切换 / 跳转 `batch` | 真实生成任务 `POST /api/storyboard/:id/generate` + 轮询状态 |
| `src/pages/PlotAnalysisPage.tsx` `NewAnalysisModal` | 上传只记录文件名 | `POST /api/upload` + `POST /api/analysis/start` |
| `src/pages/BillingPage.tsx` | 套餐展示 / 模拟订单 | `GET /api/billing/orders` `POST /api/billing/pay` |
| `src/pages/LandingPage.tsx` | Banners / FAQ / Plans 全静态 | 接 CMS / 后端 |

---

## 11. Make 参考与设计约束

- **Make file key**：`gAlz60sm49QC7SQ6Kjb0X0`（星核耀火）
- **发布预览**：https://studio-scoop-93444024.figma.site
- **Make App.tsx 资源 URI**：`file://figma/make/source/gAlz60sm49QC7SQ6Kjb0X0/src/app/App.tsx`
- **本地备份**：`tmp/make-app.tsx` / `make-src/App.tsx`（不参与构建，仅供查阅）
- **项目 skill**：`.cursor/skills/pc-design-fidelity/SKILL.md` + `references/`

**设计约束**：
- 颜色：`#FF8A1F`（橙）/ `#FF9D42`（hover）/ `#FFAD4A`（亮）/ `#FF5010`（深）
- 强调：橙金渐变文字（`.gradient-text` shimmer 4s）
- 背景：深色玻璃 `linear-gradient(160deg, rgba(255,255,255,.13) → .05)` + `backdrop-filter: blur(24px) saturate(180%)`
- 动画 keyframes：`glow-pulse / glow-slow / ring-cw / ring-ccw / shimmer / ticker / fade-up / beam-pulse / spin / typing-dot / slide-in-right`
- 工具类：`.glass-btn .orange-btn .gradient-text .tilt-card .beam/2/3/4 .glow-a/b .ring-cw/ccw .ticker .fade-up/1/2/3/4`

**已在本轮放开**：可用性优化授权（布局 / 信息层级 / 控件分组 / 默认展开 / 操作路径可按实际问题调整），不再以"严格还原"为由阻挡。

---

## 12. 其他说明

- 不含真实密钥 / 令牌；如有需要请新增 `.env.example`（仓库暂无，建议接手时按需创建）
- `.env / .env.local / *.log / node_modules / dist / .DS_Store` 已在 `.gitignore`（如未配置请补）
- Electron 启动链路修复记录见 `docs/ui-implementation.md` "Electron 启动链路修复（2026-09-18）"

---

有任何问题优先看 `docs/ui-implementation.md`，本文件只做项目级别交接说明。

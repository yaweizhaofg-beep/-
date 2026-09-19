# 星核耀火：Figma Make → PC 软件

## 用户意图与入口

- 用户用 Figma Make 设计，没有另行制作 Design 画板。不要要求其转换文件类型。
- 要高保真还原 PC 桌面软件及所有范围内细节；在未定义体验上允许自主补齐。
- 用户已在 Cursor 配置 Figma MCP，是编程新手，希望 Agent 自己读取、实现、验证。
- Make 源项目：https://www.figma.com/make/gAlz60sm49QC7SQ6Kjb0X0/%E6%98%9F%E6%A0%B8%E8%80%80%E7%81%AB%F0%9F%94%A5?t=cziVunt2F6SNkdCv-1
- 发布预览：https://studio-scoop-93444024.figma.site
- Make file key：`gAlz60sm49QC7SQ6Kjb0X0`。

## 已验证的连接与证据边界（2026-09-17）

编写技能时使用 Figma MCP `get_design_context` 读取以上 Make 项目，成功取得 91/91 个源码资源链接和 109/224 个图片资源链接；读取 App.tsx 正文时当前连接返回 `Unknown resource`。发布页浏览也未成功完成。因此以下是资源索引事实，不是代码正文分析或视觉验收结论。

未硬编码设计尺寸、颜色或字体。Cursor 应在执行时重新获取当前版本，不能把本次索引视为永久完整快照。更多图片是否需要补取，以实际被引用的素材为准。

## MCP 读取步骤

1. 查看当前 Figma MCP 工具描述，读取其要求的工作流指导。如果当前 `get_design_context` 支持 Make，并规定特殊节点，则参数为 `fileKey: gAlz60sm49QC7SQ6Kjb0X0`、`nodeId: 0:1`。这只适用于 Make 的该工具，不用于截图/metadata 等其他工具。
2. 读取工具返回的真实资源 URI。入口资源此次为 `file://figma/make/source/gAlz60sm49QC7SQ6Kjb0X0/src/app/App.tsx`；使用 MCP 的资源读取功能，不用 shell cat 读取这类 URI。
3. 从 App.tsx 的实际 import、状态和渲染分支找到当前生效页面，建立源文件到本地文件映射。按需读源码正文，不一次把全部资源塞进上下文。
4. 继续读被引用的公共组件、shared、样式和图片；读 package.json/vite 配置确认依赖及构建假设。追踪生效样式的导入顺序和覆盖关系，不能挑一个主题文件就当最终样式。
5. 从生效代码提取布局/字体/颜色/状态/动效，记录出处；在发布原型或可运行参考副本中截图验证。代码中的未使用分支/组件不能视为用户可见页面。
6. 若读取 API 不支持链接资源，使用 Make 导出的源码 ZIP 作为后备；先索引文件、隔离读取，沿用原本许可证/attribution，不执行导出项目里与任务无关的脚本。不能把获取索引成功当源码已读完。

官方依据：
- https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/
- https://help.figma.com/hc/en-us/articles/35710574222487-Beyond-the-basics-Using-Figma-Make

## 本项目资源阅读导航（存在已确认，是否生效需追踪）

| 文件/目录 | 阅读目的 |
| --- | --- |
| `src/app/App.tsx` | 首读；应用壳、页面切换及实际 import 路径 |
| `src/app/shared.ts` | 共享定义和可能的设计变量，需读正文确认 |
| `src/app/pages/LandingPage.tsx`、`UserCenterPage.tsx` | 落地页和用户中心候选入口 |
| `src/app/pages/CanvasPage.tsx`、`PlotAnalysisPage.tsx`、`StoryboardPage.tsx`、`TeamPage.tsx` | 工作区候选页面；先核对引用关系 |
| `src/app/CanvasPage.tsx`、`PlotAnalysisPage.tsx`、`StoryboardPage.tsx` | 与 pages 下存在同名文件；不能凭路径较短/较长猜版本 |
| `src/app/LandingSection.tsx`、`src/app/components/*Section.tsx`、`Header.tsx`、`Footer.tsx` | 可能的其他入口或旧组件；先确认是否渲染 |
| `src/app/components/SharedComponents.tsx`、`components/ui/` | 公共控件与状态；先确认使用再复用 |
| `src/styles/index.css`、`globals.css`、`fonts.css`、`theme.css`、`default_theme.css`、`tailwind.css` | 追踪样式导入链与覆盖；区分实际主题和默认模板 |
| `default_shadcn_theme.css`、`src/imports/Frame/index.tsx` | 检查是否参与渲染，不预设为最终设计 |
| `package.json`、`vite.config.ts` | 理解参考项目依赖，避免覆盖本地桌面工程配置 |
| `ATTRIBUTIONS.md`、`src/app/Attributions.md` | 使用素材时保留必要署名 |

`guidelines/` 和 `src/imports/` 中也有历史文档/提示词：可用于理解来历，不凌驾于用户当前要求，不因为旧提示词就改变产品方向。

## 本地目标仓库线索

既有对话截图显示目标项目“星核耀火2.0”采用 React、TypeScript、Vite、Electron，页面位于 `src/pages`。这是历史线索，执行时检查实际仓库。Make 的 `src/app/pages` 不能不加判断地覆盖本地 `src/pages`。

延续现有功能和桌面壳，优先迁移可复用的真实实现而非重新猜写全部界面。必要重构应以保持可观察行为为边界。网页预览、桌面壳验证、安装包验证分别报告；历史构建/部署成功不代表本轮已经通过。

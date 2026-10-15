# 星核耀火数据管理台

漫剧制作管理与电视大屏的可运行前端交付，包括登录、总览、剧目IP、团队、运营和自定义大屏。原生 JavaScript / CSS，无第三方运行依赖。

**后端接手先读 [BACKEND_HANDOFF.md](BACKEND_HANDOFF.md)，接口以 [API_CONTRACT.md](API_CONTRACT.md) 和当前 HTTP 适配器为准。**

## 运行

需要 Node.js 22 或以上，在本目录执行，无需 npm install：

```sh
npm run dev        # http://127.0.0.1:4173/
npm test           # Node内置测试
npm run build      # 重新生成 dist/
npm run verify     # 校验静态资源和模块引用
npm run fixtures   # 导出完整虚构 /studio 响应到 artifacts/studio-response.json
```

演示账号 `admin`，密码 `Xinghe2026!`。只有登录，无注册。示例业务时间为2026年10月；“当日”模型筛选使用真实北京时间，样例日期之外显示空态。

## 功能

- 总览：累计积分、月度立项与产出、剧目IP轮播、预计完成及逾期、模型消耗环图、发布表现、团队产出、按组轮播的员工节点。
- 剧目IP：网页立项、同名关联制作软件、任务节点、生成记录、有效时长、成本、人效横向排名及发布数据。
- 团队：4组×约8名在职员工的假设案例，增组、从同步员工池分配、转组、调整角色及移出，保留历史归属。
- 运营：接收最终交付，记录投放事实，回填浏览/点赞/收藏；不实际执行平台投放。
- 大屏：我的大屏4×4方案库、创建/复制/软删除/恢复；单页编辑、局部换位、自适应、缩放、锁定、撤销、预览、全屏和退出。
- 展示：极光、流星、星光，15/30/60秒轮播；员工列表溢出时自动向下滚动，再切换小组。
- 品牌：透明白色 NovaTale / 星核耀火 Logo，虚构剧集封面。

## 切换后端

修改 [public/config.js](public/config.js)：

```js
globalThis.STUDIO_CONFIG = { mode: 'http', apiBase: '/api/v1' };
```

配置在应用启动前载入，不放密钥。推荐静态站点与 `/api/v1` 同源反向代理，使用服务端Cookie会话。

默认mock模式：演示登录保存在标签页sessionStorage，案例保存在localStorage（键 `zizi-studio-prototype-v1`）。所有姓名、账单、流量、视频和网盘链接均为虚构。演示登录不构成真实访问控制。

HTTP模式隐藏演示凭据与重置案例入口，使用真实登录、会话和业务接口。**本目录不包含后端服务、生产数据库、账号管理、制作软件同步、真实通知或平台数据采集服务。**

## 目录

```text
src/app.js          页面编排及交互
src/domain/         业务口径、节点、画布与锁定规则
src/data/           登录、mock/HTTP适配器、虚构数据
src/ui/             组件、弹窗、编辑器、轮播和动画
src/styles/         设计令牌与模块样式
public/             运行配置、Logo、封面
scripts/            预览、构建、校验、导出数据
tests/             自动测试
docs/screenshots/  最新交付参考图
```

`dist/` 与 `artifacts/` 为可再生输出，不提交Git。其他文档：[制作与运营规则](PRODUCTION_OPERATIONS_SPEC.md)。旧适配方法不代表新增需求；当前网页的制作节点只读，职责边界见交付说明。

# 星核耀火数据管理台 · 唯一交付入口

交付版本：2026-10-16。**本文件是本管理台唯一有效的产品与技术交付文档。** 启动、业务规则、接口、字段、职责及验收均在本页；旧版分散文档已删除，不再作为实现依据。仓库仅交付本次管理台，统一使用main分支；代码位于本文件同级目录。

交付内容是可运行的前端原型、假设案例、业务计算、HTTP适配器和自动测试。真实后端、制作软件同步、生产权限、平台采集及站外通知尚待接入，不能将演示登录当作生产访问控制。

## 目录

1. [启动与交接](#启动与交接)
2. [功能与录入边界](#功能与录入边界)
3. [统一业务规则](#统一业务规则)
4. [接口与数据契约](#接口与数据契约)
5. [代码导航与接入顺序](#代码导航与接入顺序)
6. [验收与上线边界](#验收与上线边界)

## 启动与交接

需要 Node.js 22 或以上。下载仓库后在仓库根目录执行，无第三方运行依赖，无需 npm install：

```sh
git clone https://github.com/yaweizhaofg-beep/-.git xinghe-dashboard
cd xinghe-dashboard
npm test              # 自动测试
npm run build         # 生成 dist/
npm run verify        # 检查构建资源与模块引用
npm run fixtures      # 导出完整虚构 /studio 响应
npm run dev           # 本机预览 http://127.0.0.1:4173/
```

局域网演示执行 `npm run preview:lan`，终端会输出本机局域网地址（端口4174），同一网络可访问。它仅提供构建后的静态页面，电脑需保持开机；演示数据在各自浏览器独立保存，不是共享数据库。

演示账号：`admin`；密码：`Xinghe2026!`。只有登录，无注册。案例默认业务月份为2026年10月；模型“当日”按实际北京时间筛选，样例日期之外显示空态。所有员工、积分、流量、网盘和视频均为虚构。

HTTP接入修改 [public/config.js](public/config.js)：

```js
globalThis.STUDIO_CONFIG = { mode: 'http', apiBase: '/api/v1' };
```

推荐静态页面与 `/api/v1` 同源反向代理。配置不得放密钥。HTTP模式调用真实登录与业务接口，隐藏演示凭据和重置入口。mock模式会话存于标签页sessionStorage，业务案例存于localStorage键 `zizi-studio-prototype-v1`。

`npm run fixtures` 生成的 `artifacts/studio-response.json` 是完整接口样本，不是生产数据库。`dist/` 与 `artifacts/` 为可再生输出，不提交Git。

## 功能与录入边界

| 页面 | 当前交付功能 |
|---|---|
| 总览 | 累计积分、月度立项/制作/完成、有效产出和成本、剧目IP、模型消耗、发布表现、团队产出、按组轮播的员工工作节点；详情查看具体数据 |
| 剧目IP | 网页立项及同名关联，封面/计划/逾期，项目任务、生成记录、有效时长贡献、成本、人效横向排名、发布数据 |
| 团队 | 4组×约8名在职员工案例，新增小组、同步员工池、分配/转组/角色调整/移出，月度剧目进度、积分、有效时长及更新时间 |
| 运营 | 制作进度、最终交付待办、接收最新交付、记录已投放事实及浏览/点赞/收藏；不调用平台发布接口 |
| 我的大屏 | 4×4方案库，可下滑、创建/复制/软删除/恢复；从总览选择组件、多选项目范围、单页编辑、自适应、换位、缩放、锁定、撤销、预览、全屏/退出 |

视觉沿用当前玻璃质感、极光、流星、星光与绿色发光累计积分；贡献条为细线，姓名/占比/分钟独立标注。剧目与发布表现支持15/30/60秒轮播；“正在推进”标题与组名同行，组内员工溢出自动向下滚动，读完再切组。侧栏始终保持侧边布局。

| 数据或动作 | 权威录入端 | 网页权限 |
|---|---|---|
| IP立项、计划日期、初始参与名单 | 网页 | 创建及软件关联 |
| 原始员工、在职状态 | 后端/制作软件 | 同步员工池，分配组织小组与角色 |
| 制作指派、首次推理、分镜生成、个人网盘上传 | 制作软件 | 只读展示 |
| 组长点完成、每人最终有效时长、统一网盘链接 | 制作软件 | 只读展示，触发运营待办 |
| 接收交付、投放信息、发布累计数据 | 网页运营 | 接收与回填 |
| 模型扣费、退款、成功视频输出数 | 后端/制作软件 | 筛选和统计 |
| 大屏配置 | 网页 | 保存、展示、软删除与恢复 |

组织小组可以调整；项目剧组和已发生的积分/时长归属是历史事实，不能随员工转组改写。离职员工不出现在当前人员列表，历史记录及ID仍保留。网页不提供制作节点代填、分集审核或树状图。

## 统一业务规则

### 员工推进节点

项目“任务”、推进详情和组轮播共用 `src/domain/work-progress.js`，同一员工参与多剧时逐剧显示：

| 事实事件 | 展示状态 |
|---|---|
| 剧目已立项，尚未指派该员工 | 剧本与资产拆分中 |
| 已指派，尚未首次推理 | 已指派 · 待开始制作 |
| 开始第一个分镜推理（失败也算已开始） | 制作中 |
| 员工在软件上传本轮完整交付的合法百度网盘链接，且晚于最近推理 | 员工制作完成 · 待组长确认 |
| 组长在软件确认完成，提交每人最终有效时长及统一网盘链接 | 项目已完成 · 进入运营 |
| 在职员工未关联工作项目 | 待分配 |

状态按上述事实中已达到的最高节点判断，整剧有效最终交付优先。正式服务应提供 `productionAssignments`、`inferenceStartedAt`；成员名单、旧任务和generatedAt仅为兼容依据。上传后再次推理，当前原型回到制作中。案例存在分集上传；正式同步必须表达员工在该剧本轮完整交付，不能用单集完成冒充个人整剧完成。

### 计划、完成与月度统计

- 创建时间取createdAt，旧样例缺失时回退approvedAt；预计完成取plannedEnd，北京时间当日结束为截止。
- IP卡未逾期显示“正常生产中”，逾期按北京时间自然日差显示天数；详情时间线额外显示24小时内到期预警，超过截止按向上取整天数显示超时。完成后显示按期/逾期交付。
- 制作结束时间只取最新有效组长交付confirmedAt，不用员工上传、分集审核或运营发布时间替代。当前基础有效性要求approved、合法时间/最终百度网盘链接、所有时长非负且至少一人有效时长大于0；后端还必须校验应交付员工集合完整。
- 首次完成月份取第一条有效交付确认时间，更正不重复计入首次完成。阶段台账按剧集最新确认版本取值；最终时长替代阶段值。两者一致时保留原产出日，不一致时按最终回填产出日记录更正。
- 未完成剧显示整剧已生成分镜/计划总分镜百分比，完成剧显示确认有效分钟。`productionProgress`必须是完整汇总，不能用分页明细行数当分母；未知分母不造百分比。

### 积分、有效时长、人效与模型

| 指标 | 统一口径 |
|---|---|
| 累计积分 | 期初consumptionOpening.points + 期初截止后净积分流水；期初与流水不得重复覆盖。600万是演示值 |
| 净消耗 | 扣费减退款；charges退款流水为负；模型按日汇总中的扣费/退款字段各自非负 |
| 有效时长 | 源字段秒，展示分钟，来自组长确认；原始生成视频秒数不等于有效秒数 |
| 贡献占比 | 个人确认有效时长 / 当前项目确认总有效时长；不以积分占比代替 |
| 人效比 | 净积分 / 有效分钟，单位积分/分钟，升序排名、越低越省；净金额/有效分钟另以元/分钟展示 |
| 排名缺失 | 无有效时长、消耗未同步或净退款为负，不参与正常排名，不显示为零成本冠军 |
| 模型环图 | 当日/当月/自定义日期内，视频模型扣费积分占比；显示成功视频输出数与净消耗，退款单列 |
| 成功视频数 | 成功输出数，不是请求次数、账单数或去重分镜数 |

分镜去重键为项目+剧集+分镜ID，重试不重复计数；当前成功归属取最新时间与ID。正式后端应保证唯一current成功记录。编号区间包含首尾，缺号不推断产出。生成时间、原始秒数和确认有效秒数独立保留。

### 运营、发布与同步

组长最终交付产生待办，按交付ID/版本幂等。运营先接收最新有效交付，再记录实际投放时间、平台、作品ID、发布链接及累计数据；投放时间不得早于制作完成。同剧可投多个平台，项目+平台+作品ID唯一。

发布数据取每部作品最新累计快照，历史快照不相加；预告快照不自动等于正式投放。新交付版本、撤回或版本冲突拒绝旧表单提交。服务端记录操作者与回填时间，保留历史与审计。

网页演示每日08:00更新标识，实际采集与定时刷新由后端任务保证；网页团队/运营每60秒读取，编辑期间避免覆盖输入。当前无真实推送或站外消息。自动采集与人工回填的覆盖策略属于接入前需确定的事项。

同名同步仅用于首次完整名称唯一匹配：零匹配等待、多匹配冲突、唯一匹配绑定两端稳定ID。后续改名不解除绑定，名称不能用作长期主键。

### 大屏布局

单页24×12网格，项目范围多选。局部换位只改选中和目标模块，其他模块不跟随整行移动。尺寸变化使用adaptive拟合内容；空白区域移动不得重叠或越界。自动排版是独立操作。

locked固定模块x/y/w/h，禁止移动、缩放、交换、移除；解锁后才能编辑。自动排版绕开锁定模块；数据刷新与轮播继续。锁定随方案保存，支持撤销。全屏按视口适配，退出返回管理界面。旧多页配置仅在可完整合并时迁移，不能静默丢弃模块。

## 接口与数据契约

本节对应当前 `src/data/http-repository.js` 和 `src/data/auth.js`。完整样本由 `npm run fixtures` 从当前工厂生成，字段名以此处和适配器为准，不另维护第二份字段文档。

### 通用

前缀 `/api/v1`；JSON UTF-8。成功 `{data:...}`；错误 `{code,message,details}`。服务端实施会话、资源权限、审计、事务与幂等。

时间戳为带时区ISO8601，日期YYYY-MM-DD，月份YYYY-MM，统计按Asia/Shanghai。流量计数是非负整数；积分与金额可小数；有效时长源字段为秒。实际字段名不能直接替换为其他概念名，否则需转换适配层。

请求使用同源Cookie（credentials:same-origin），非GET请求携带会话返回的 `X-CSRF-Token`。建议Cookie为HttpOnly、Secure、SameSite，服务端校验Origin与CSRF。配置文件不放密钥。

### 登录，无注册

| 方法 | 路径 | 请求 | 成功响应 |
|---|---|---|---|
| POST | /auth/login | `{account,password}` | `{data:{user:{id,name,account},csrfToken}}`，设置Cookie |
| GET | /auth/session | 无 | 同上，无有效会话401 |
| POST | /auth/logout | `{}` | 撤销会话并清Cookie，200/204 |

账号由管理员在后端开通。失败统一账号密码错误，限流429。业务接口401让网页回到登录。DemoAuth只是原型；HttpAuth不把密码或令牌写入持久化存储。

### 网页当前调用

| 方法 | 路径 | 请求及用途 |
|---|---|---|
| GET | /studio | 完整快照；当前适配器不传month/query |
| GET | /platform-snapshots/latest | 读取每日批次，随后重新读取studio |
| POST | /projects | IP立项表单，返回项目 |
| POST | /projects/{id}/sync | 完整同名唯一关联软件 |
| POST | /employee-directory/sync | 同步在职员工池 |
| POST | /groups | 创建小组 |
| PUT | /groups/{id} | 保存小组与version |
| POST | /groups/{id}/members | `{employeeIds,version}` |
| PATCH | /groups/{id}/members/{employeeId} | 角色/转组，含源version和目标targetVersion |
| DELETE | /groups/{id}/members/{employeeId} | JSON `{version}`，只解除组织归属 |
| POST | /screens | `{name,template,modules}` 创建单页方案，返回完整Screen |
| PUT | /screens/{id} | 保存完整Screen与version，返回递增版本的Screen |
| PATCH | /screens/{id} | `{archived:true}`软删除，false恢复 |
| POST | /production-handoffs/{id}/receipt | `{}`，幂等接收最新有效最终交付 |
| POST | /operations | 新建运营回填 |
| PUT | /operations/{id} | 更新运营，包含version及handoffId |

常规写入成功后重新GET studio；新建/保存Screen必须返回完整Screen供编辑器继续使用。适配器保留的旧 updateTeam/createTask/updateTask/confirmLedger/approveEpisode/updateProjectStatus/saveRelease 并非当前网页开放制作写入口，任务、生成、上传、组长确认仍由软件经后端同步。

### studio快照

数组无记录时返回 `[]`。当前界面不统一兼容缺失字段，建议以生成样本起步。服务端返回对象包在 `{data:对象}` 中。

| 字段 | 实际关键属性 |
|---|---|
| schemaVersion, now | schemaVersion=1，now为服务端业务时间 |
| employees | `{id,name,active,role,tone?}`；仅active显示，历史ID引用保留 |
| groups | `{id,name,leaderId,memberIds,roles,version,updatedAt,tone?}` |
| directorySync, metricsSyncedAt | directorySync含syncedAt/source，指标刷新时间 |
| projects | 见下文Project |
| episodes | `{id,projectId,name,approved,cancelled?...}` |
| tasks | 旧任务 `{id,projectId,name,assigneeId,status,type,due,version}`，不代表个人交付 |
| charges | `{id,projectId,groupId,employeeId,points,amount,postedAt,model,kind}`，退款为负 |
| consumptionOpening | `{points,through,source}`，积分期初不能与后续流水重叠 |
| ledgers | `{projectId,episodeId,version,confirmed,total,rows}`，rows见下文 |
| releases, releaseHistory | `{id,projectId,platform,workId,views,likes,saves,snapshotAt,source?}` |
| screens | 含软删除方案以支持恢复，见Screen |
| productionAssignments | 推荐真实接入补充 `{projectId,employeeId,assignedAt,cancelled?}` |
| generationRecords, productionUploads | 见生成与上传 |
| productionHandoffs, productionProgress | 最终交付、整剧分镜汇总 |
| modelUsageDaily | 模型按日完整输出和积分汇总 |
| operations, operationReceipts | 运营回填及交付接收 |
| audit | `{action,details,at}`，仅有权查看的记录 |
| softwareProjects | 演示仓储的同名项目列表，真实绑定无需向网页暴露所有软件项目 |

#### Project及立项

对象使用 `members`（不是memberIds），现有模拟关联字段为softwareId：

```js
{id,ip,name,displayName,genre,synopsis,leaderId,members,groupId,status,phase,
 approvedAt,startedAt,plannedStart,plannedEnd,completedAt,firstCompletedAt,
 sync,softwareId,version,cover,tone}
```

立项表单提交ip/name/leaderId/members/episodeCount/plannedStart/plannedEnd/genre/synopsis/draft等。HTML表单数字/布尔值可能为字符串，服务端须严格转换校验。剧本文本当前由前端读取正文，不等于服务端文件存储。

首次完整名称唯一匹配：无匹配等待、多匹配冲突、唯一匹配持久化两端ID。改名不能破坏已绑定关系，不能把名称当长期主键。

#### 员工节点

推进详情、项目任务及按组轮播共用 `src/domain/work-progress.js`：立项拆分 → 已指派待开始 → 首次推理制作中 → 个人网盘上传后员工完成/待组长确认 → 组长最终确认后项目完成/进入运营。

正式接入需指派事实和首次推理时间，不能仅等成功生成才同步。成员名单、旧任务、generatedAt仅作兼容。上传后又推理，原型回到制作中；返工和本轮交付范围必须与软件对齐。

#### 生成与上传

```js
generationRecords: [{id,projectId,episodeId,shotId,shotNumber,employeeId,status,
 current,inferenceStartedAt,startedAt,generatedAt,videoSeconds,source}]
productionUploads: [{id,projectId,employeeId,episodeId,uploadedAt,url,source}]
productionProgress: [{projectId,generatedShots,totalShots,
 employees:[{employeeId,generatedShots}],syncedAt,source}]
```

按项目+剧集+分镜去重，当前成功归属取最新；推理失败也可证明已开始制作。原始视频秒数不是审核有效秒数。个人上传需代表该员工在该剧本轮交付，不能把单集上传误作全部完成。整剧生成百分比使用完整汇总，员工合计等于generatedShots；分母未知不得造百分比。

#### 有效时长及最终交付

```js
ledgers: [{projectId,episodeId,version,confirmed,total,
 rows:[{employeeId,leaderId,groupId,seconds,producedOn}]}]
productionHandoffs: [{id,projectId,version,groupId,leaderId,approved,confirmedAt,
 finalUrl,accessCode,employeeDurations:[{employeeId,groupId,seconds,producedOn?}],source}]
```

组长确认+合法最终百度网盘链接+有效confirmedAt+最终有效时长结果共同形成制作完成和运营待办。后端验证员工集合完整性，基础前端校验不能代替。首次完成取第一条有效交付，更正产生新版本。

最终有效时长替代阶段值，历史归属不能因转组改写。人效=净积分/有效分钟；金额成本=净金额/有效分钟，单位分开。无有效时长、消耗未同步或净退款为负时不正常排名。

#### 模型按日汇总

```js
modelUsageDaily: [{date,projectId,modelId,modelName,mediaType:'video',
 successfulVideos,consumedPoints,refundedPoints,source}]
```

每日+项目+模型唯一，扣费退款都是非负数，净额=扣费-退款。成功视频数是输出数，不是请求数/分镜数。环图按扣费占比，退款单列；日期含首尾，按北京时间。模型名动态返回，Seedance 2.0只是案例。

#### 运营及发布

```js
operationReceipts: [{handoffId,receivedAt,operator}]
operations: [{id,projectId,handoffId,platform,workId,publishUrl,publishedAt,
 views,likes,saves,note,operator,recordedAt,version,source}]
```

更新请求沿用operationId识别记录，路径也带ID。必须接收最新有效交付；publishedAt不早于完成，计数非负整数，项目+平台+作品ID唯一。操作者及记录时间由服务端生成。

保存运营同时更新当前发布快照并保留历史，累计值不重复相加；旧交付、撤回、并发冲突返回409。网页仅记录投放事实；实际每日采集、源优先级和失败重试由后端实现。

#### Screen单页与锁定

```js
{id,name,template,month,projectId,projectIds,rotationSeconds,
 pages:[{id,components:[{id,type,x,y,w,h,scope,projectId?,adaptive?,locked?}]}],
 version,archived,updatedAt}
```

- pages.length=1；projectIds可多选；rotationSeconds为15/30/60。
- type为metrics/project/instruments/teams/release/tasks，兼容cost/note。24×12整数网格，不重叠不出界。
- 普通最小尺寸见WIDGETS；adaptive=true允许紧凑槽位（当前最小4×2），内容自动拟合。
- 换位仅修改选中及目标两模块，其他模块不动；自动排版是独立动作。
- locked=true固定x/y/w/h，不能移动/缩放/被交换；自动排版围绕它布局，需解锁才能移除，轮播与刷新不受影响。
- version乐观锁，成功返回完整递增版本。archived布尔值实现软删除/恢复，保留布局和锁定。

### 错误及验收

400/422字段/布局，401会话，403权限，404不存在，409版本或交付冲突，429限流。message可向用户展示，details不得泄露内部数据。

正式服务必须另测资源越权、重名、重复交付、旧交付回填、撤回、缺少个人时长、退款冲销、离职历史及海量明细。当前studio为完整快照，海量记录需专门分页端点并调整前端，不能悄悄截断后继续当全量计算。

## 代码导航与接入顺序

| 位置 | 责任 |
|---|---|
| src/app.js | 页面编排、路由、事件与刷新 |
| src/domain/work-progress.js | 员工节点、推进详情、IP卡日期状态 |
| src/domain/production.js | 分镜去重、最终交付、有效时长、详情预警 |
| src/domain/ | 其余统计、小组、大屏布局及锁定规则 |
| src/data/auth.js | DemoAuth / HttpAuth与会话 |
| src/data/http-repository.js | 后端HTTP调用边界 |
| src/data/mock-repository.js | 假设案例仓储及事务校验参考 |
| src/ui/ | 页面组件、详情弹窗、运营、编辑器、轮播与动效 |
| src/styles/ | 令牌、布局和模块样式 |
| public/ | 运行配置、Logo及封面 |
| scripts/、tests/ | 构建、局域网预览、案例导出、校验及测试 |

前后端接入顺序：登录/会话 → 完整studio快照 → 网页写接口 → 制作软件事件同步 → 最终交付事务与运营 → 模型/发布真实统计 → 大屏持久化联调。

HTTP适配器保留的旧制作写方法仅用于兼容，当前网页未开放这些入口，不是新增后端需求。后端应基于本页“网页当前调用”表实现接口；制作软件内部路由、队列及鉴权自行设计。

## 验收与上线边界

本次文档整理不改变既有页面业务。交付校验命令为 `npm test && npm run build && npm run verify`；实际运行结果随本次GitHub提交记录核验。

| 场景 | 验收结果 |
|---|---|
| 登录 | 错误密码失败，正确登录可进入，退出及401回到登录；无注册入口 |
| IP与组织 | 立项唯一同名关联；员工池分组/转组后历史消耗、时长不迁移 |
| 制作节点 | 软件依次同步指派/首次推理/个人上传/组长完成，任务、推进详情、轮播展示一致 |
| 有效时长 | 未完显示分镜百分比；完结显示有效分钟；净积分/有效分钟排名与贡献占比可复算 |
| 运营 | 必须接收最新有效交付；重复接收幂等，旧交付/并发冲突409，累计快照不累加 |
| 模型 | 日期、成功输出、扣费、退款、净额与环图逐项可核对 |
| 大屏 | 多选项目、单页、局部移动不牵动整行、锁定持久化、自适应、删除恢复、全屏退出 |
| 明细 | 筛选和滚动正常，空数据有空态，不能将部分明细当全量计算 |

接入前必须确定的四项边界：

1. **制作软件交付协议**：本轮交付ID、员工覆盖集合、返工/撤回事件及权限。当前前端基础校验不替代软件完整流程校验。
2. **数据规模与同步**：当前studio是完整快照；生成明细40行分页在客户端。大数据量要新增服务端分页接口并改前端，统计仍用完整汇总，禁止静默截断。
3. **运营数据来源**：真实平台授权、每日采集、人工回填优先级、失败重试与通知渠道。当前仅网页待办和周期刷新，无实际投放/文件上传/网盘可下载验证。
4. **生产账号与口径**：服务端开通账号、管理员/组长/运营资源权限、真实积分期初与价格换算、实际默认月份。示例身份、封面、600万积分不能作为真实数据上线。

后端上线另测401/403、资源越权、重名、重复同步、旧版本回填、交付撤回、遗漏员工时长、退款冲销、离职历史及跨组/多平台统计；落实Cookie会话、CSRF、幂等、乐观锁、事务和审计。当前交付不包含生产数据库迁移或部署服务。

# 后端接口与前端数据契约

版本2026-10-15。以 `src/data/http-repository.js`、`src/data/auth.js` 和 `npm run fixtures` 导出的完整对象为实现基准。此文替代早期多页大屏、网页修改制作任务及分集审核的旧约定。

## 通用

前缀 `/api/v1`；JSON UTF-8。成功 `{data:...}`；错误 `{code,message,details}`。服务端实施会话、资源权限、审计、事务与幂等。

时间戳为带时区ISO8601，日期YYYY-MM-DD，月份YYYY-MM，统计按Asia/Shanghai。流量计数是非负整数；积分与金额可小数；有效时长源字段为秒。实际字段名不能直接替换为其他概念名，否则需转换适配层。

请求使用同源Cookie（credentials:same-origin），非GET请求携带会话返回的 `X-CSRF-Token`。建议Cookie为HttpOnly、Secure、SameSite，服务端校验Origin与CSRF。配置文件不放密钥。

## 登录，无注册

| 方法 | 路径 | 请求 | 成功响应 |
|---|---|---|---|
| POST | /auth/login | `{account,password}` | `{data:{user:{id,name,account},csrfToken}}`，设置Cookie |
| GET | /auth/session | 无 | 同上，无有效会话401 |
| POST | /auth/logout | `{}` | 撤销会话并清Cookie，200/204 |

账号由管理员在后端开通。失败统一账号密码错误，限流429。业务接口401让网页回到登录。DemoAuth只是原型；HttpAuth不把密码或令牌写入持久化存储。

## 网页当前调用

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

## studio快照

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

### Project及立项

对象使用 `members`（不是memberIds），现有模拟关联字段为softwareId：

```js
{id,ip,name,displayName,genre,synopsis,leaderId,members,groupId,status,phase,
 approvedAt,startedAt,plannedStart,plannedEnd,completedAt,firstCompletedAt,
 sync,softwareId,version,cover,tone}
```

立项表单提交ip/name/leaderId/members/episodeCount/plannedStart/plannedEnd/genre/synopsis/draft等。HTML表单数字/布尔值可能为字符串，服务端须严格转换校验。剧本文本当前由前端读取正文，不等于服务端文件存储。

首次完整名称唯一匹配：无匹配等待、多匹配冲突、唯一匹配持久化两端ID。改名不能破坏已绑定关系，不能把名称当长期主键。

### 员工节点

推进详情、项目任务及按组轮播共用 `src/domain/work-progress.js`：立项拆分 → 已指派待开始 → 首次推理制作中 → 个人网盘上传后员工完成/待组长确认 → 组长最终确认后项目完成/进入运营。

正式接入需指派事实和首次推理时间，不能仅等成功生成才同步。成员名单、旧任务、generatedAt仅作兼容。上传后又推理，原型回到制作中；返工和本轮交付范围必须与软件对齐。

### 生成与上传

```js
generationRecords: [{id,projectId,episodeId,shotId,shotNumber,employeeId,status,
 current,inferenceStartedAt,startedAt,generatedAt,videoSeconds,source}]
productionUploads: [{id,projectId,employeeId,episodeId,uploadedAt,url,source}]
productionProgress: [{projectId,generatedShots,totalShots,
 employees:[{employeeId,generatedShots}],syncedAt,source}]
```

按项目+剧集+分镜去重，当前成功归属取最新；推理失败也可证明已开始制作。原始视频秒数不是审核有效秒数。个人上传需代表该员工在该剧本轮交付，不能把单集上传误作全部完成。整剧生成百分比使用完整汇总，员工合计等于generatedShots；分母未知不得造百分比。

### 有效时长及最终交付

```js
ledgers: [{projectId,episodeId,version,confirmed,total,
 rows:[{employeeId,leaderId,groupId,seconds,producedOn}]}]
productionHandoffs: [{id,projectId,version,groupId,leaderId,approved,confirmedAt,
 finalUrl,accessCode,employeeDurations:[{employeeId,groupId,seconds,producedOn?}],source}]
```

组长确认+合法最终百度网盘链接+有效confirmedAt+最终有效时长结果共同形成制作完成和运营待办。后端验证员工集合完整性，基础前端校验不能代替。首次完成取第一条有效交付，更正产生新版本。

最终有效时长替代阶段值，历史归属不能因转组改写。人效=净积分/有效分钟；金额成本=净金额/有效分钟，单位分开。无有效时长、消耗未同步或净退款为负时不正常排名。

### 模型按日汇总

```js
modelUsageDaily: [{date,projectId,modelId,modelName,mediaType:'video',
 successfulVideos,consumedPoints,refundedPoints,source}]
```

每日+项目+模型唯一，扣费退款都是非负数，净额=扣费-退款。成功视频数是输出数，不是请求数/分镜数。环图按扣费占比，退款单列；日期含首尾，按北京时间。模型名动态返回，Seedance 2.0只是案例。

### 运营及发布

```js
operationReceipts: [{handoffId,receivedAt,operator}]
operations: [{id,projectId,handoffId,platform,workId,publishUrl,publishedAt,
 views,likes,saves,note,operator,recordedAt,version,source}]
```

更新请求沿用operationId识别记录，路径也带ID。必须接收最新有效交付；publishedAt不早于完成，计数非负整数，项目+平台+作品ID唯一。操作者及记录时间由服务端生成。

保存运营同时更新当前发布快照并保留历史，累计值不重复相加；旧交付、撤回、并发冲突返回409。网页仅记录投放事实；实际每日采集、源优先级和失败重试由后端实现。

### Screen单页与锁定

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

## 错误及验收

400/422字段/布局，401会话，403权限，404不存在，409版本或交付冲突，429限流。message可向用户展示，details不得泄露内部数据。

正式服务必须另测资源越权、重名、重复交付、旧交付回填、撤回、缺少个人时长、退款冲销、离职历史及海量明细。当前studio为完整快照，海量记录需专门分页端点并调整前端，不能悄悄截断后继续当全量计算。

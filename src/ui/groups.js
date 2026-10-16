import { avatar, badge, button, escape, sectionTitle, statusNames } from './common.js';
import { icon } from './icons.js';
import { groupOfEmployee, groupSummaries, groupSummary } from '../domain/groups.js';
import { memberWorkState, workforceEfficiency, groupEfficiency } from '../domain/workforce.js';
import { activeEmployees, nameOf, number, projectSummary } from '../domain/metrics.js';

const stamp = value => value ? new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value)) : '尚未同步';
const hidden = (name,value) => `<input type="hidden" name="${name}" value="${escape(value)}">`;
const field = (label,html) => `<label class="field"><span>${label}</span>${html}</label>`;
function form(title,type,content,save='保存') {
  return `<div class="dialog-head"><div><h2>${escape(title)}</h2><p>员工身份与原始岗位来自后端，网页只维护分组关系。</p></div>${button(icon('close'),'close-dialog','aria-label="关闭"','icon-button')}</div><form id="active-form" data-form="${type}"><div class="dialog-body">${content}<div class="form-error" id="form-error" role="alert"></div></div></form><div class="dialog-footer">${button('取消','close-dialog')}<button class="button primary" form="active-form" type="submit">${save}</button></div>`;
}

export function renderGroups(data,state) {
  const query=state.query||'';
  const summaries=groupSummaries(data,state.month).filter(group=>!query||`${group.name} ${group.members.map(id=>nameOf(data,id)).join(' ')}`.includes(query));
  const people=activeEmployees(data);
  const unassigned=people.filter(person=>!groupOfEmployee(data,person.id));
  const directoryQuery=state.directoryQuery||'';
  const directory=(state.directoryFilter==='all'||directoryQuery?people:unassigned).filter(person=>!directoryQuery||`${person.name} ${person.role} ${person.id}`.includes(directoryQuery));
  return `<div class="page-heading"><div><p class="welcome">从员工池分配，让每个小组的产出清晰可见</p><h1>团队与人员 <span>${state.month.replace('-','.')}</span></h1></div><div class="heading-actions">${button(`${icon('sync',15)} 同步数据`,'sync-directory')}${button(`${icon('plus',16)} 新增小组`,'new-group','','primary')}</div></div>
  <div class="group-overview"><div><strong>${data.groups.length}</strong><span>小组</span></div><div><strong>${people.length}</strong><span>在职员工</span></div><div><strong>${unassigned.length}</strong><span>待分配</span></div><p><i class="dot"></i>员工池已同步 · ${stamp(data.directorySync?.syncedAt)}<small>调组只改变当前组织归属，项目剧组与历史数据独立保留。</small></p></div>
  <div class="workgroup-grid">${summaries.map((group,index)=>`<article class="workgroup-card glass tone-${group.tone}"><header><div class="workgroup-title"><span class="workgroup-index">${String(index+1).padStart(2,'0')}</span><div><h2>${escape(group.name)}</h2><p>${group.leaderId?`${avatar(data,group.leaderId,true)} 组长 · ${escape(nameOf(data,group.leaderId))}`:'<span class="group-warning">待配置组长</span>'}</p></div></div>${button(icon('edit',15),'edit-group',`data-id="${group.id}" aria-label="配置${escape(group.name)}"`,'icon-button')}</header>
  <div class="workgroup-metrics"><div><span>本月净消耗</span><strong>${number(group.points)}<small>积分</small></strong></div><div><span>本月有效产出</span><strong>${number(group.minutes,1)}<small>分钟</small></strong></div></div><div class="group-sync-status"><i class="dot"></i>已同步 ${stamp(group.syncedAt)}${button('数据详情 ↗','group-details',`data-id="${group.id}"`,'text-button')}</div>
  <section class="group-projects"><div class="group-section-title"><h3>本月制作剧目</h3><span>${group.projects.length}部 · ${group.completed}部完成</span></div>${group.projects.map(project=>projectProgress(data,project)).join('')||'<p class="group-empty">本月暂无制作项目</p>'}</section>
  <section class="group-members"><div class="group-section-title"><h3>组内成员 <span>${group.members.length}人</span></h3>${button(`${icon('plus',12)} 添加组员`,'add-group-members',`data-id="${group.id}"`,'text-button')}</div><div class="group-member-grid">${group.members.map(id=>{const person=data.employees.find(row=>row.id===id);return `<div class="group-member">${avatar(data,id,true)}<div class="group-member-copy"><strong>${escape(person.name)}</strong><small>${escape(group.leaderId===id?'组长':group.roles?.[id]||person.role)}</small>${workBadges(data,id,state.month)}</div><div class="member-controls">${button(icon('edit',12),'edit-group-member',`data-id="${group.id}" data-employee="${id}" aria-label="调整${escape(person.name)}分组"`,'icon-button')}${button(icon('close',12),'remove-group-member',`data-id="${group.id}" data-employee="${id}" aria-label="从${escape(group.name)}移出${escape(person.name)}"`,'icon-button')}</div></div>`;}).join('')||'<p class="group-empty">从同步员工池中添加组员</p>'}</div></section></article>`).join('')||'<div class="empty-state">未找到匹配小组或员工</div>'}</div>
  ${efficiencyPanel(data,state.month,query)}<section class="directory-panel panel glass">${sectionTitle('原始员工池',`<span class="quiet-label">后端同步 · 身份与岗位只读</span>`)}<div class="directory-toolbar"><div>${button(`待分配 ${unassigned.length}`,'directory-filter','data-filter="unassigned"',state.directoryFilter!=='all'?'secondary':'ghost')}${button(`全部员工 ${people.length}`,'directory-filter','data-filter="all"',state.directoryFilter==='all'?'secondary':'ghost')}</div><label class="search-box">${icon('search',15)}<input id="directory-query" value="${escape(directoryQuery)}" placeholder="搜索姓名、岗位或员工ID" aria-label="搜索同步员工"></label></div><div class="detail-table-scroll"><table class="data-table"><thead><tr><th>员工</th><th>员工ID</th><th>原始岗位</th><th>当前小组</th><th>操作</th></tr></thead><tbody>${directory.map(person=>{const group=groupOfEmployee(data,person.id);return `<tr><td>${escape(person.name)}</td><td>${escape(person.id)}</td><td>${escape(person.role)}</td><td>${escape(group?.name||'待分配')}</td><td>${button(group?'调整分组':'分配小组',group?'edit-group-member':'assign-employee',`data-id="${group?.id||''}" data-employee="${person.id}"`,'text-button')}</td></tr>`;}).join('')||'<tr><td colspan="5" class="directory-empty">全部在职员工已分配。移出组员或同步新员工后，会进入待分配池。</td></tr>'}</tbody></table></div></section>`;
}

export function groupDialog(data,id=null) {
  const group=data.groups.find(row=>row.id===id);
  const members=group?group.memberIds.filter(id=>data.employees.some(row=>row.id===id&&row.active)):[];
  return form(group?'配置小组':'新增小组','workgroup',`${hidden('id',id||'')}${hidden('version',group?.version||0)}<div class="form-grid">${field('小组名称',`<input name="name" value="${escape(group?.name||'')}" required maxlength="50" placeholder="例如：星火五组">`)}${field('组长',`<select name="leaderId"><option value="">暂不配置</option>${members.map(id=>`<option value="${id}" ${group?.leaderId===id?'selected':''}>${escape(nameOf(data,id))}</option>`).join('')}</select>`)}</div><p class="form-hint">先将员工加入本组，再从成员中设置组长。小组人数可灵活调整，不限制为8人。</p>`,group?'保存小组':'创建小组');
}
export function addMembersDialog(data,id) {
  const group=data.groups.find(row=>row.id===id);
  const candidates=activeEmployees(data).filter(person=>!group.memberIds.includes(person.id));
  return form(`添加组员 · ${group.name}`,'group-members',`${hidden('groupId',id)}${hidden('version',group.version)}<p class="form-hint">选择同步得到的在职员工。调入其他组员工时会同时从原小组移出；原组长被调出后，该组需重新配置组长。</p><input id="member-pool-query" placeholder="按姓名或岗位查找" aria-label="筛选可分配员工"><div class="assignment-pool">${candidates.map(person=>`<label class="assignment-option" data-member-search="${escape(person.name+' '+person.role)}"><input type="checkbox" name="employeeIds" value="${person.id}">${avatar(data,person.id,true)}<span><strong>${escape(person.name)}</strong><small>${escape(person.role)} · ${escape(groupOfEmployee(data,person.id)?.name||'待分配')}</small></span></label>`).join('')||'<p class="group-empty">没有其他可分配的在职员工</p>'}</div>`,'加入本组');
}
export function memberDialog(data,id,employeeId) {
  const group=data.groups.find(row=>row.id===id);
  const person=data.employees.find(row=>row.id===employeeId);
  return form(`调整组员 · ${person.name}`,'group-member',`${hidden('groupId',id)}${hidden('employeeId',employeeId)}${hidden('version',group.version)}<p class="form-hint">员工ID ${escape(person.id)} · 原始岗位 ${escape(person.role)}（由后端同步）</p><div class="form-grid">${field('当前归属小组',`<select name="targetGroupId">${data.groups.map(row=>`<option value="${row.id}" ${row.id===id?'selected':''}>${escape(row.name)}</option>`).join('')}</select>`)}${field('组内角色 / 分工',`<input name="groupRole" value="${escape(group.roles?.[employeeId]||person.role)}" maxlength="40">`)}</div><p class="form-hint">调整分组和组内分工不会修改原始岗位、项目剧组或历史消耗数据。</p>`,'保存调整');
}
export function assignEmployeeDialog(data,employeeId) {
  return form(`分配小组 · ${nameOf(data,employeeId)}`,'assign-employee',`${hidden('employeeId',employeeId)}${field('选择小组',`<select name="groupId" required><option value="">请选择</option>${data.groups.map(group=>`<option value="${group.id}">${escape(group.name)}</option>`).join('')}</select>`)}`,'加入小组');
}
export function groupDetails(data,id,month) {
  const summary=groupSummary(data,data.groups.find(row=>row.id===id),month);
  return `<div class="dialog-head"><div><h2>${escape(summary.name)} · ${month}</h2><p>净消耗 ${number(summary.points)}积分 · 确认有效产出 ${number(summary.minutes,1)}分钟</p></div>${button(icon('close'),'close-dialog','aria-label="关闭"','icon-button')}</div><div class="dialog-body data-detail-body"><p class="form-hint">按账单与时长记录的历史小组ID归属。调组后历史统计不变。同步于 ${stamp(summary.syncedAt)}。</p><div class="detail-table-scroll"><table class="data-table"><thead><tr><th>日期</th><th>剧目</th><th>员工</th><th>净积分</th><th>金额（元）</th></tr></thead><tbody>${summary.charges.map(row=>`<tr><td>${escape(row.postedAt.slice(0,10))}</td><td>${escape(data.projects.find(project=>project.id===row.projectId)?.displayName)}</td><td>${escape(nameOf(data,row.employeeId))}</td><td>${number(row.points,1)}</td><td>${number(row.amount,2)}</td></tr>`).join('')||'<tr><td colspan="5">本月暂无生成消耗记录</td></tr>'}</tbody></table></div></div>`;
}

function projectProgress(data,project) {
  const summary=projectSummary(data,project);
  return `<div class="group-project-item"><div class="group-project-row"><button data-action="project" data-id="${project.id}">${icon('film',14)}${escape(project.displayName)}</button>${badge(project.status,project.status==='completed'?'已完成':statusNames[project.status])}</div><div class="group-progress-meta"><span>成片审核 ${summary.approved}/${summary.episodeCount}集</span><strong>${summary.progress===null?'待配置集数':`${number(summary.progress,0)}%`}</strong></div><div class="group-drama-track" role="progressbar" aria-label="${escape(project.displayName)}成片审核进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${summary.progress||0}"><span style="width:${summary.progress||0}%"></span></div><p class="group-project-tasks">任务 ${summary.done}/${summary.tasks.length}项完成 · ${summary.tasks.filter(task=>task.status==='running').length}项执行中${button('查看剧目 ↗','project',`data-id="${project.id}"`,'text-button')}</p></div>`;
}
function workBadges(data,id,month) {
  const work=memberWorkState(data,id,month);
  const tones={'制作中':'making','剪辑中':'editing','待确认':'review','受阻':'blocked','已完成':'done','待开始':'pending','待分配':'idle'};
  const detail=work.tasks.map(task=>`${data.projects.find(project=>project.id===task.projectId)?.displayName||'未知剧目'} · ${task.name} · ${statusNames[task.status]||task.status}`).join('；')||'本月暂无分配任务';
  return `<div class="member-work-states" title="${escape(detail)}">${work.states.map(state=>`<span class="member-work-badge work-${tones[state.label]}"><i></i>${state.label}${state.count?` · ${state.count}`:''}</span>`).join('')}</div>`;
}
function efficiencyPanel(data,month,query) {
  const people=workforceEfficiency(data,month).filter(row=>!query||`${row.name} ${row.groupName}`.includes(query));
  const groups=groupEfficiency(data,month).filter(row=>!query||row.name.includes(query));
  const table=(rows,person=false)=>`<div class="efficiency-table-scroll"><table class="data-table"><thead><tr><th>排名</th><th>${person?'员工 / 当前组':'小组'}</th><th>净积分</th><th>有效分钟</th><th>积分 / 分钟 ↓</th></tr></thead><tbody>${rows.map(row=>`<tr><td><span class="efficiency-rank ${row.rank&&row.rank<=3?'top-rank':''}">${row.rank||'—'}</span></td><td>${person?button(escape(row.name),'person',`data-id="${row.id}"`,'text-button'):button(escape(row.name),'group-details',`data-id="${row.id}"`,'text-button')}${person?`<small>${escape(row.groupName)}</small>`:''}</td><td>${number(row.points,0)}</td><td>${number(row.minutes,1)}</td><td>${row.ratio===null?`<span class="efficiency-pending">${row.reason}</span>`:`<strong class="efficiency-value">${number(row.ratio,2)}</strong>`}</td></tr>`).join('')||'<tr><td colspan="5">没有匹配记录</td></tr>'}</tbody></table></div>`;
  return `<section class="efficiency-section panel glass">${sectionTitle('人效比排名',`<span class="quiet-label">${month} · 积分 / 有效分钟 · 越低越靠前</span>`)}<p class="efficiency-note">同月净使用积分（扣费−退款）÷同月已确认有效时长。无有效时长、消耗未同步或净退款为负时不参与排名。</p><div class="efficiency-columns"><section><h3>小组人效</h3>${table(groups)}</section><section><h3>员工人效 <span>在职员工</span></h3>${table(people,true)}</section></div><p class="efficiency-note">小组按产生记录时的历史归属统计；员工汇总跨组、跨剧数据，“当前组”仅展示现组织归属。状态小标来自本月任务，悬停可查看剧目与任务。</p></section>`;
}

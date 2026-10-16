import { carousel } from './carousel-template.js';
import { employeeWorkRows } from '../domain/work-progress.js';
import { avatar, badge, button, escape } from './common.js';
import { icon } from './icons.js';

export function workProgressPreview(data, options={}) {
  const rows=employeeWorkRows(data);
  const groups=[...(data.groups || []).map(group=>({id:group.id,name:group.name})),{id:'',name:'待分配小组'}];
  const cards=groups.map(group=>{
    const people=new Map();
    for(const row of rows.filter(row=>row.groupId===group.id)) {
      if(!people.has(row.employeeId))people.set(row.employeeId,{name:row.name,projects:[]});
      people.get(row.employeeId).projects.push(row);
    }
    if(!people.size)return '';
    return `<section class="workforce-slide" data-work-group="${escape(group.id)}"><header class="section-title workforce-group-heading"><h3>正在推进 <span>${escape(group.name)}</span></h3>${button(`详情 ${icon('arrow',12)}`,'data-detail','data-kind="tasks"','text-button module-detail')}</header><div class="workforce-members">${[...people].map(([id,person])=>`<article class="workforce-member" data-group-employee="${escape(id)}"><div class="workforce-member-name">${avatar(data,id,true)}<strong>${escape(person.name)}</strong></div><div class="workforce-member-projects">${person.projects.map(row=>`<div title="${escape(row.projectName)} · ${escape(row.label)}"><span>${escape(row.projectName)}</span><small class="workforce-state workforce-state-${row.status}">${escape(row.label)}</small></div>`).join('')}</div></article>`).join('')}</div></section>`;
  }).filter(Boolean);
  return cards.length?carousel(cards,{intervalSeconds:15,...options,kind:'workforce',label:'小组员工工作状态'}):'<p class="empty-state">暂无在职员工</p>';
}

export function workProgressDetails(data) {
  const rows = employeeWorkRows(data);
  const groups = [...(data.groups || []).map(group=>({id:group.id,name:group.name})),{id:'',name:'待分配小组'}];
  const populated = groups.map(group=>({...group,rows:rows.filter(row=>row.groupId===group.id)})).filter(group=>group.rows.length);
  return `<div class="dialog-head"><div><h2>员工工作状态</h2><p>按小组查看 · 制作软件同步</p></div>${button(icon('close'),'close-dialog','aria-label="关闭"','icon-button')}</div>
    <div class="dialog-body work-progress-body"><div class="work-progress-scroll">${populated.map((group,index)=>{
      const people = new Map();
      for (const row of group.rows) {
        if (!people.has(row.employeeId)) people.set(row.employeeId, {name:row.name,projects:[]});
        people.get(row.employeeId).projects.push(row);
      }
      return `<details class="work-progress-group" ${index===0?'open':''}><summary><strong>${escape(group.name)}</strong><span>${people.size}人</span></summary>
        <table class="data-table work-progress-table"><thead><tr><th>员工</th><th>工作项目</th><th>当前节点</th></tr></thead><tbody>${[...people].map(([id,person])=>`<tr data-work-employee="${escape(id)}"><td><div class="person-cell">${avatar(data,id,true)}${escape(person.name)}</div></td><td colspan="2"><div class="employee-projects">${person.projects.map(row=>`<div class="employee-project-state"><span>${escape(row.projectName)}</span>${badge(row.status,row.label)}</div>`).join('')}</div></td></tr>`).join('')}</tbody></table></details>`;
    }).join('') || '<p class="empty-state">暂无在职员工</p>'}</div></div>`;
}

export function projectWorkTasks(data, projectId) {
  const rows=employeeWorkRows(data).filter(row=>row.projectId===projectId);
  return `<div class="section-title"><h3>员工任务状态</h3><span class="source-chip">制作软件同步 · 网页只读</span></div><div class="table-wrap project-work-tasks"><table class="data-table"><thead><tr><th>员工</th><th>工作项目</th><th>当前节点</th></tr></thead><tbody>${rows.map(row=>`<tr><td><div class="person-cell">${avatar(data,row.employeeId,true)}${escape(row.name)}</div></td><td>${escape(row.projectName)}</td><td>${badge(row.status,row.label)}</td></tr>`).join('') || '<tr><td colspan="3">暂无员工任务</td></tr>'}</tbody></table></div>`;
}

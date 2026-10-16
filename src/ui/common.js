import { productionGenerationProgress } from '../domain/production.js';
import { icon } from './icons.js';
import { nameOf, employee, number, percentages, contribution, projectSummary, releaseSummary, shortNumber } from '../domain/metrics.js';
export const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const statusNames = { producing: '制作中', completed: '制作完成', paused: '已暂停', planned: '待开工', draft: '草稿', cancelled: '已撤销', running: '执行中', pending: '待执行', review: '待确认', blocked: '阻塞', connected: '已关联', waiting: '待同名项目', delayed: '同步延迟', conflict: '同名冲突' };
export const badge = (status, text) => `<span class="badge badge-${status}"><span class="status-dot"></span>${escape(text || statusNames[status] || status)}</span>`;
export const button = (label, action, attrs = '', variant = '') => `<button type="button" class="button ${variant}" data-action="${action}" ${attrs}>${label}</button>`;
export function avatar(data, id, small = false) {
  const person = employee(data, id);
  return `<span class="avatar tone-${person?.tone || 'neutral'} ${small ? 'small' : ''}" title="${escape(nameOf(data, id))}">${escape(person?.active ? person.name.slice(-2) : '历')}</span>`;
}
export function poster(project, className = '') {
  return `<div class="poster poster-${project.cover || 'mist'} ${className}">${project.cover === 'echo' ? '<img src="./public/assets/echo-archive.png" alt="回声档案原创示例封面" fetchpriority="high">' : '<span class="poster-art" aria-hidden="true"></span>'}<div class="poster-caption"><span>${escape(project.genre)}</span><strong>${escape(project.displayName)}</strong><small>原创示例作品</small></div></div>`;
}
const contributionColor = tone => ({ violet: 'violet', peach: 'peach', rose: 'pink', mint: 'mint', sky: 'blue' }[tone] || 'blue');
export function contributionBar(data, projectId, focusedEmployee = '') {
  const output = contribution(data, projectId);
  if (!output.total) return '<div class="empty-bar">尚未确认有效时长</div>';
  return `<div class="contribution-bar effective-contribution" aria-label="有效时长贡献分布">${output.rows.map(row => `<button class="contribution-segment contribution-${contributionColor(row.tone)} ${focusedEmployee && row.id !== focusedEmployee ? 'muted-segment' : ''}" style="--share:${row.seconds / output.total}" data-action="person" data-id="${escape(row.id)}" title="${escape(row.name)}：${number(row.seconds / 60, 2)}分钟 / ${row.share}%">${row.share >= 16 ? `<span>${escape(row.name)} <b>${row.share}%</b></span>` : ''}</button>`).join('')}</div><div class="contribution-legend effective-contribution-legend">${output.rows.map(row => `<span><i class="dot contribution-${contributionColor(row.tone)}"></i><span class="effective-person">${escape(row.name)} <b>${row.share}%</b></span><span class="effective-duration">${number(row.seconds / 60, 1)}<small>有效分钟</small></span></span>`).join('')}</div>`;
}
export function heroCard(data, project, { compact = false, personId = '' } = {}) {
  const summary = projectSummary(data, project);
  const top = summary.contributions.rows.find(row => !['unassigned', 'historical'].includes(row.id));
  const running = summary.tasks.filter(task => ['running', 'blocked'].includes(task.status));
  return `<article class="hero-card glass ${compact ? 'compact' : ''} tone-${project.tone}">
    <div class="cover-panel">${poster(project)}<span class="cover-meta">${summary.episodeCount}集 · ${escape(project.genre)}</span></div>
    <div class="hero-content"><div class="hero-topline">${badge(project.status)}<span class="subtle">${avatar(data, project.leaderId, true)} ${escape(nameOf(data, project.leaderId))} · 组长</span></div>
    <h2>${escape(project.displayName)}</h2><p class="hero-subtitle">${escape(project.subtitle || '每一份有效产出，都让故事更进一步。')}</p>
    <div class="project-timing"><span>${icon('clock', 15)} 已耗时 <b>${number(summary.days, 1)}天</b></span><span>计划完成 <b>${escape(project.plannedEnd.slice(5).replace('-', '/'))}</b></span></div>
    <div class="episode-progress"><div><span>成片审核进度</span><b>${summary.approved} <small>/ ${summary.episodeCount}集</small></b></div><div class="progress-track"><span style="--progress:${summary.progress || 0}%"></span></div></div>
    <div class="contribution-heading"><div><small>已确认有效时长</small><strong>${number(summary.contributions.total / 60, 1)}<span>分钟</span></strong></div>${top ? `<div class="best-person">${icon('star', 15)} ${escape(top.name)}贡献最多 <b>${number(top.seconds / 60, 1)}分钟</b></div>` : ''}</div>
    ${contributionBar(data, project.id, personId)}
    <div class="hero-bottom"><div class="working-people">${running.map(task => avatar(data, task.assigneeId, true)).join('')}<span>${running.length ? `${running.length}人正在推进` : '当前无执行中任务'}</span></div>${button(`查看项目 ${icon('arrow', 16)}`, 'project', `data-id="${project.id}"`, 'ghost')}</div>
    <div class="hero-footnote">${summary.filled}/${summary.episodeCount}集已填报 · 贡献占比不等于制作完成率</div></div></article>`;
}
export function taskRows(data, tasks, { actions = false, max = 4 } = {}) {
  if (!tasks.length) return '<div class="empty-state">当前范围暂无工作任务</div>';
  return `<div class="task-list">${tasks.slice(0, max).map(task => `<div class="task-row"><div class="task-person">${avatar(data, task.assigneeId, true)}<div><strong>${escape(nameOf(data, task.assigneeId))}</strong><small>${escape(data.projects.find(project => project.id === task.projectId)?.displayName)}</small></div></div><div class="task-description"><strong>${escape(task.name)}</strong><small>截止 ${escape(task.due.slice(5).replace('-', '/'))}</small></div>${badge(task.status)}${actions ? button(icon(task.status === 'review' ? 'check' : 'edit', 15), task.status === 'review' ? 'complete-task' : 'task-edit', `data-id="${task.id}" aria-label="${task.status === 'review' ? '确认完成' : '编辑任务'}"`, 'icon-button') : ''}</div>`).join('')}</div>`;
}
export function releasePanel(data, projectId) {
  const result = releaseSummary(data, projectId);
  return `<div class="release-metrics">${[['eye', '浏览 / 播放', result.views], ['heart', '点赞', result.likes], ['bookmark', '收藏', result.saves]].map(([symbol, label, value]) => `<div><span>${icon(symbol, 17)} ${label}</span><strong>${shortNumber(value)}</strong></div>`).join('')}</div><div class="release-footnote">${result.rows.length ? `${escape(result.rows.map(row => row.platform).join('、'))} · 累计计数<br>快照 ${result.updated.slice(5, 16).replace('T', ' ')}` : '暂无平台快照，可在项目中录入'}<br>不代表去重观众人数</div>`;
}
export function sectionTitle(title, right = '') { return `<div class="section-title"><h3>${title}</h3>${right}</div>`; }
export function empty(message) { return `<div class="empty-state">${icon('film', 28)}<p>${escape(message)}</p></div>`; }

export function generationContributionBar(data,projectId) {
 const progress=productionGenerationProgress(data,projectId);
 if(!progress.generated)return '<p class="production-empty">尚未生成分镜</p>';
 if(!progress.people.length)return '<p class="production-empty">人员分镜归属待同步</p>';
 const shares=percentages(progress.people.map(row=>row.count));
 const rows=progress.people.map((row,index)=>({...row,name:nameOf(data,row.employeeId),color:contributionColor(employee(data,row.employeeId)?.tone),share:shares[index]}));
 return `<div class="contribution-bar" aria-label="生成分镜贡献分布">${rows.map(row=>`<button class="contribution-segment contribution-${row.color}" style="--share:${row.count/progress.generated}" data-action="person" data-id="${escape(row.employeeId)}" title="${escape(row.name)}：${row.count}个分镜 / ${row.share}%">${row.share>=16?`<span>${escape(row.name)} <b>${row.share}%</b></span>`:''}</button>`).join('')}</div><div class="contribution-legend">${rows.map(row=>`<span><i class="dot contribution-${row.color}"></i>${escape(row.name)} <b>${number(row.count)}<small>个分镜</small></b></span>`).join('')}</div>`;
}

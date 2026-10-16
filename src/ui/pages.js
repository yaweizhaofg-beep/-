import { icon } from './icons.js';
import { button, escape, poster, badge, avatar, sectionTitle, empty } from './common.js';
import { nameOf, projectSummary, monthOf, activeEmployees, personStats, number } from '../domain/metrics.js';
import { renderGroups } from './groups.js';

export function renderProjects(data, state) {
  const matches = data.projects.filter(project => (!state.query || `${project.displayName} ${project.name} ${nameOf(data, project.leaderId)}`.includes(state.query)) && (state.projectFilter === 'all' || (state.projectFilter === 'month' ? monthOf(project.approvedAt) === state.month : project.status === state.projectFilter)));
  return `<div class="page-heading"><div><p class="welcome">从一个IP，到一部完整作品</p><h1>项目与立项</h1></div>${button(`${icon('plus', 17)} 新建IP立项`, 'new-project', '', 'primary')}</div><div class="filters">${[['all', '全部项目'], ['month', '本月立项'], ['producing', '制作中'], ['completed', '制作完成'], ['paused', '已暂停'], ['draft', '草稿']].map(([filter, label]) => `<button class="filter-tab ${state.projectFilter === filter ? 'selected' : ''}" data-action="project-filter" data-filter="${filter}">${label}</button>`).join('')}<span class="quiet-label">${matches.length}部作品 · 历史按立项月份查询</span></div><div class="project-grid">${matches.map(project => { const summary = projectSummary(data, project); return `<article class="project-card glass">${poster(project)}<h3>${escape(project.displayName)}</h3><p>${escape(project.genre)} · ${escape(nameOf(data, project.leaderId))}组</p><div class="inline-stat"><span>审核集数</span><b>${summary.approved}/${summary.episodeCount}</b></div><div class="progress-track"><span style="--progress:${summary.progress || 0}%"></span></div><div class="inline-stat"><span>确认有效产出</span><b>${number(summary.contributions.total / 60, 1)}分钟</b></div><div class="card-actions">${badge(project.status)}${button(`打开项目 ${icon('arrow', 16)}`, 'project', `data-id="${project.id}"`, 'ghost')}</div></article>`; }).join('') || empty('当前范围暂无项目')}</div>`;
}
export function renderPeople(data, state) { return renderGroups(data, state); }
export function screenThumbnail() { return `<div class="screen-thumb"><div></div><div><img class="thumb-cover" src="./public/assets/echo-archive.png" alt=""><span class="thumb-lines"></span></div><div></div><div></div><div></div></div>`; }
export function renderScreens(data) {
  const screens = data.screens.filter(screen => !screen.archived);
  const archived = data.screens.filter(screen => screen.archived);
  return `<section class="screens-library" aria-label="我的大屏方案库">
    <div class="page-heading"><div><p class="welcome">自由组合总览模块，保存你的专属大屏</p><h1>我的大屏 <span>${screens.length}个方案</span></h1></div>${button(`${icon('plus', 18)} 新建方案`, 'new-screen', '', 'primary')}</div>
    <div class="screen-grid" tabindex="0" aria-label="大屏方案，可向下滚动">${screens.map(screen => `<article class="screen-card glass" data-screen-id="${escape(screen.id)}">
      ${screenThumbnail()}<div class="screen-card-info"><h3 title="${escape(screen.name)}">${escape(screen.name)}</h3><p>${screen.pages.length}页 · 16:9 · V${screen.version}</p></div>
      <div class="screen-card-actions">${button(`${icon('edit', 14)} 编辑`, 'edit-screen', `data-id="${escape(screen.id)}"`)}${button(`${icon('play', 14)} 展示`, 'display', `data-id="${escape(screen.id)}"`, 'primary')}${button(icon('copy', 14), 'copy-screen', `data-id="${escape(screen.id)}" aria-label="复制方案" title="复制方案"`, 'icon-button')}${button(icon('trash', 14), 'delete-screen', `data-id="${escape(screen.id)}" aria-label="删除${escape(screen.name)}" title="删除方案"`, 'icon-button screen-delete')}</div>
    </article>`).join('') || empty('还没有大屏方案，点击右上角新建方案')}</div>
    ${archived.length ? `<details class="deleted-screens"><summary>已删除方案（${archived.length}）</summary><div>${archived.map(screen => `<div class="deleted-screen"><span>${escape(screen.name)}</span>${button('恢复', 'restore-screen', `data-id="${escape(screen.id)}"`, 'text-button')}</div>`).join('')}</div></details>` : ''}
  </section>`;
}

import { workProgressPreview } from './work-progress.js';
import { ipDeliveryState } from '../domain/work-progress.js';
import { productionCompletedAt, productionGenerationProgress } from '../domain/production.js';
import { carousel } from './carousel.js';
import { icon } from './icons.js';
import { avatar, badge, button, contributionBar, generationContributionBar, escape, poster, sectionTitle, taskRows } from './common.js';
import { cumulativePoints, nameOf, number, projectSummary, shortNumber, sum } from '../domain/metrics.js';
import { latestReleaseRows } from '../domain/releases.js';
import { renderInstruments } from './instruments.js';

export const detailLink = kind => button(`详情 ${icon('arrow', 12)}`, 'data-detail', `data-kind="${kind}"`, 'text-button module-detail');

export function productionGallery(data, projects = data.projects, options = {}) {
  const cards = projects.filter(project => project.status !== 'draft').map(project => {
    const summary = projectSummary(data, project);
    const delivery = ipDeliveryState(data, project);
    const completed=Boolean(productionCompletedAt(data,project.id)),generation=productionGenerationProgress(data,project.id);
    const percent=completed?100:generation.percentage;
    const progressText=completed?`${summary.approved}/${summary.episodeCount}集 · 制作已完成`:`${generation.aggregate?'已生成':'已同步'} ${number(generation.generated)} / ${generation.total===null?'总数待同步':number(generation.total)} 个分镜`;
    const value=completed?number(summary.contributions.total/60,1):generation.percentage===null?'—':`${number(generation.percentage,1)}%`;
    return `<article class="production-tile tone-${project.tone}" data-production-phase="${completed?'completed':'generating'}"><div class="production-main">${poster(project)}<div class="production-copy"><div><button class="project-title" data-action="project" data-id="${project.id}">${escape(project.displayName)}</button>${badge(completed?'completed':project.status==='completed'?'producing':project.status)}</div><p>${avatar(data,project.leaderId,true)} ${escape(nameOf(data,project.leaderId))} · ${progressText}</p><div class="production-progress" role="img" aria-label="${completed?'制作已完成':`分镜生成进度${percent===null?'待同步':number(percent,1)+'%'}`}"><span style="width:${percent||0}%"></span></div></div><strong>${value}<small>${completed?'有效分钟':generation.invalid?'分镜数据待校验':generation.percentage===null?'总分镜数待同步':'分镜生成完成度'}</small></strong></div><div class="ip-delivery"><span>预计完成 <b>${escape(delivery.planned)}</b></span><span class="${delivery.overdueDays ? 'ip-overdue' : 'ip-on-time'}">${escape(delivery.label)}</span></div><div class="production-share-title">${completed?'有效时长占比':'生成分镜占比'}</div>${completed?contributionBar(data,project.id):generationContributionBar(data,project.id)}</article>`;
  });
  return cards.length ? carousel(cards, options) : '<p class="empty-state">没有匹配的作品</p>';
}

export function releaseGallery(data, projectId = null, options = {}) {
  const rows = latestReleaseRows(data, projectId);
  const ids = [...new Set(rows.map(row => row.projectId))];
  const updated = rows.map(row => row.snapshotAt).sort().at(-1);
  const cards = ids.map(id => {
    const project = data.projects.find(project => project.id === id);
    if (!project) return '';
    const records = rows.filter(row => row.projectId === id);
    return `<button class="release-tile tone-${project.tone}" data-action="project" data-id="${id}" data-tab="release">${poster(project, 'release-cover')}<div class="release-content"><div class="release-title"><strong>${escape(project.displayName)}</strong><span>${escape(records.map(row => row.platform).join(' / '))}</span></div><div class="release-numbers">${[['浏览/播放', 'views', 'eye'], ['点赞', 'likes', 'thumbs-up'], ['收藏', 'saves', 'star']].map(([label, key, symbol]) => `<div><b>${shortNumber(sum(records.map(row => row[key])))}</b><small>${icon(symbol,18)}<span>${label}</span></small></div>`).join('')}</div></div></button>`;
  }).filter(Boolean);
  return `${cards.length ? carousel(cards, {intervalSeconds:15,...options,kind:'release',label:'多剧发布表现'}) : '<p class="empty-state">尚无发布快照</p>'}<div class="release-update"><i class="dot"></i>每日08:00更新 · 最近 ${updated ? escape(updated.slice(5, 16).replace('T', ' ')) : '尚未更新'} · 假设案例</div>`;
}

export function renderOverview(data, state, { metricStrip, teamPanel }) {
  const matches = project => !state.query || `${project.name} ${project.displayName} ${nameOf(data, project.leaderId)} ${project.members.map(id => nameOf(data, id)).join(' ')}`.includes(state.query);
  const projects = data.projects.filter(project => project.status !== 'draft' && matches(project));
  const points = cumulativePoints(data);
  return `<div class="overview-page"><div class="overview-heading"><div><p class="welcome">星核耀火 · 创作与经营一览</p><h1>制作总览 <span>${state.month.replace('-', '.')}</span></h1></div><div class="heading-actions">${button(`${icon('monitor', 15)} 大屏`, 'display-default')}${button(`${icon('plus', 16)} IP立项`, 'new-project', '', 'primary')}</div></div>
  <div class="overview-stats"><button class="points-summary" data-action="data-detail" data-kind="credits"><span>累计积分消耗 <i>详情 ↗</i></span><strong>${number(points.points)}<small>积分</small></strong><p>截至 ${points.cutoff.replaceAll('-', '.')} · 含历史累计 · 假设案例</p></button>${metricStrip(data, state.month, false)}</div>
  <div class="overview-board"><section class="panel glass overview-productions">${sectionTitle('剧目IP', detailLink('projects'))}${productionGallery(data, projects)}<span class="overview-scope">共${projects.length}部作品 · 按部轮播 · 全部记录见详情</span></section>
  ${renderInstruments(data, state.month, state.modelFilters).replace('class="instruments panel glass model-consumption"', 'class="instruments panel glass model-consumption overview-instruments"')}
  
  <section class="panel glass overview-releases">${sectionTitle('多剧发布表现', detailLink('releases'))}${releaseGallery(data)}</section>
  <section class="panel glass overview-teams">${teamPanel(data, state.month)}</section>
  <section class="panel glass overview-tasks">${workProgressPreview({...data,projects})}<p class="overview-scope">按小组轮播 · 员工工作项目与当前节点</p></section></div></div>`;
}

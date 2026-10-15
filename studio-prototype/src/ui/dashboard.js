import { icon } from './icons.js';
import { escape, sectionTitle } from './common.js';
import { cumulativePoints, monthlyMetrics, teamStats, comparison, number } from '../domain/metrics.js';
import { groupSummaries } from '../domain/groups.js';
import { renderOverview, detailLink } from './overview.js';

export function metricStrip(data, month, includePoints = true) {
  const metrics = monthlyMetrics(data, month);
  const kinds = { '累计积分':'credits', '本月立项':'projects-month', '正在制作':'projects-active', '本月首次完成':'projects-completed', '平均制作周期':'projects-completed', '有效产出':'duration-month', '净生成成本':'charges-month' };
  const values = [['本月立项', metrics.launched, '部', '正式立项'], ['正在制作', metrics.active, '部', '截至示例当前时刻'], ['本月首次完成', metrics.completed, '部', '返工不重复计数'], ['有效产出', number(metrics.minutes, 1), '分钟', '按产出日期'], ['平均制作周期', number(metrics.averageDays, 1), '天', '首次完成项目'], ['净生成成本', number(metrics.cost, 0), '元', '期间扣费 − 退款']];
  if (includePoints) { const total = cumulativePoints(data); values.unshift(['累计积分', number(total.points), '积分', data.scopeLabel?`所选剧目已记录消耗 · 截至${total.cutoff}`:`截至${total.cutoff}`]); }
  return `<div class="metric-strip ${includePoints ? 'with-points' : ''}">${values.map(([label, value, unit, note]) => `<button type="button" data-action="data-detail" data-kind="${kinds[label]}" class="metric-item ${label === '有效产出' ? 'metric-focus' : ''}"><span>${label}</span><div class="metric-number">${value}<small>${unit}</small></div><p>${note}</p></button>`).join('')}</div>`;
}
export function teamPanel(data, month, full = false) {
  const grouped=Boolean(data.groups?.length);
  const rows = grouped?groupSummaries(data,month).sort((a,b)=>b.minutes-a.minutes):teamStats(data,month);
  const label=team=>grouped?team.name:`${team.name}组`;
  const max = rows[0]?.minutes || 1;
  const delta = rows.length > 1 ? comparison(rows[0].minutes, rows[1].minutes) : null;
  return `${sectionTitle('团队产出', detailLink('teams'))}<div class="team-bars">${rows.map((team, index) => `<button class="team-line" data-action="${grouped?'group-details':'leader'}" data-id="${team.id}"><div><span class="rank">${String(index + 1).padStart(2, '0')}</span><strong>${escape(label(team))}</strong><b>${number(team.minutes, 1)}<small>分钟</small></b></div><div class="team-track"><span class="tone-${team.tone}" style="--progress:${team.minutes / max * 100}%"></span></div>${full ? `<small>${team.memberCount}位贡献人员 · 同月产出口径</small>` : ''}</button>`).join('')}</div>${delta ? `<div class="team-comparison">${icon('arrow', 16)}<span><b>${escape(label(rows[0]))}</b> 比 ${escape(label(rows[1]))}多 <strong>${number(delta.difference, 1)}分钟</strong>${delta.percentage != null ? `<small>领先 ${number(delta.percentage, 1)}%</small>` : ''}</span></div>` : '<p class="muted">暂无可比较团队</p>'}<p class="panel-note">汇总确认产出 · 部分剧时长未齐，排名暂定</p>`;
}
export function renderDashboard(data, state) {
  return renderOverview(data, state, { metricStrip, teamPanel });
}

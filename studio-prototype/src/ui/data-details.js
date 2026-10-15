import { workProgressDetails } from './work-progress.js';
import { effectiveDurationRows } from '../domain/production.js';
import { icon } from './icons.js';
import { button, escape, statusNames } from './common.js';
import { cumulativePoints, latestLedgers, monthlyProjectRecords, monthOf, nameOf, number, projectSummary, teamStats } from '../domain/metrics.js';
import { latestReleaseRows } from '../domain/releases.js';
import { groupSummaries } from '../domain/groups.js';

/** Drill-down tables share the same records and selectors as the overview charts. */
export function dataDetails(data, kind, month) {
  if (kind === 'tasks') return workProgressDetails(data);
  let title, columns, rows, note;
  const projectName = id => data.projects.find(project => project.id === id)?.displayName || '历史汇总';
  const link = (id, tab = 'overview') => button('查看', 'project', `data-id="${escape(id)}" data-tab="${tab}"`, 'text-button');
  if (kind === 'duration-month') {
    title = `${month} 有效产出记录`; columns = ['产出日期', '作品', '集数', '贡献人员', '责任组长', '有效分钟'];
    rows = data.projects.flatMap(project => effectiveDurationRows(data,project.id).filter(row=>monthOf(row.producedOn)===month).map(row=>[row.producedOn,project.displayName,data.episodes.find(episode=>episode.id===row.episodeId)?.name||'整剧最终回填',nameOf(data,row.employeeId),nameOf(data,row.leaderId),number(row.seconds/60,2)]));
    note = '与月度有效产出指标及每日趋势使用相同的已确认台账记录。';
  } else if (kind === 'charges-month') {
    title = `${month} 生成费用明细`; columns = ['入账日期', '作品', '员工', '模型', '净积分', '净金额（元）'];
    rows = data.charges.filter(row => monthOf(row.postedAt) === month).map(row => [row.postedAt.slice(0,10), projectName(row.projectId), nameOf(data,row.employeeId), row.model, number(row.points,1), number(row.amount,2)]);
    note = '正值为消耗，负值为退款；与净生成成本指标同月同口径。';
  } else if (kind === 'credits') {
    const summary = cumulativePoints(data);
    title = `积分消耗明细 · ${number(summary.points)}积分`;
    columns = ['日期', '项目', '员工', '类型', '积分变动', '金额（元）'];
    rows = [[data.consumptionOpening?.through || '—', '历史累计期初', '—', '期初余额', number(summary.opening), '—'], ...summary.rows.map(row => [row.postedAt.slice(0, 10), projectName(row.projectId), nameOf(data, row.employeeId), row.points < 0 ? '退款冲回' : '生成消耗', number(row.points, 1), number(row.amount, 2)])];
    note = `截至${summary.cutoff}，历史期初 + 后续消耗 − 退款；全为虚构演示记录。`;
  } else if (kind === 'releases') {
    title = '剧目发布与每日快照'; columns = ['作品', '平台', '平台作品ID', '浏览/播放', '点赞', '收藏', '快照时间', '版本'];
    const latest = latestReleaseRows(data);
    rows = [...latest.map(row => ({ ...row, current: true })), ...(data.releaseHistory || []).map(row => ({ ...row, current: false }))].sort((a, b) => b.snapshotAt.localeCompare(a.snapshotAt)).map(row => [projectName(row.projectId), row.platform, row.workId, number(row.views), number(row.likes), number(row.saves), row.snapshotAt.slice(0, 16).replace('T', ' '), row.current ? '最新累计' : '历史快照']);
    note = '每日北京时间08:00更新，图形展示每个平台作品的最新累计值。历史累计快照不会重复相加。演示环境使用虚构增量。';
  } else if (kind === 'teams') {
    title = `${month} 团队产出明细`; columns = ['排名', '责任组长', '有效分钟', '贡献人数'];
    rows = (data.groups?.length?groupSummaries(data,month).map(row=>({...row,memberCount:row.members.length})).sort((a,b)=>b.minutes-a.minutes):teamStats(data,month)).map((row, index) => [index + 1, row.name, number(row.minutes, 2), row.memberCount]);
    note = '按产出日期归月，按台账中记录的当时组长归属。';
  } else if (['production', 'duration'].includes(kind)) {
    title = '集审核与时长填报明细'; columns = ['作品', '集数', '成片审核', '已确认有效分钟', '台账版本', '操作'];
    rows = data.projects.filter(project => monthOf(project.approvedAt) === month).flatMap(project => {
      const ledgers = latestLedgers(data, project.id);
      return data.episodes.filter(row => row.projectId === project.id && !row.cancelled).map(episode => {
        const ledger = ledgers.find(row => row.episodeId === episode.id);
        return [project.displayName, episode.name, episode.approved ? '已通过' : '待审核', ledger ? number(ledger.total / 60, 2) : '未填报', ledger?.version || '—', link(project.id, 'duration')];
      });
    });
    note = '审核进度与有效时长各自统计；未填报不等同于零产出。环形图筛选本月立项作品。';
  } else {
    title = '全部作品数据'; columns = ['作品', '立项日期', '组长', '状态', '已审核集', '有效分钟', '耗时（天）', '净成本（元）', '操作'];
    const sets = monthlyProjectRecords(data, month);
    const records = { 'projects-month': sets.projects, 'projects-active': sets.active, 'projects-completed': sets.completed }[kind] || data.projects;
    rows = records.map(project => {
      const summary = projectSummary(data, project);
      return [project.displayName, project.approvedAt?.slice(0, 10) || '草稿', nameOf(data, project.leaderId), statusNames[project.status], `${summary.approved}/${summary.episodeCount}`, number(summary.contributions.total / 60, 1), number(summary.days, 1), number(summary.cost.amount, 2), link(project.id)];
    });
    note = kind === 'projects' ? '全部作品的完整数据；点击查看可继续查询项目任务、成本、时长和发布记录。' : `${month}所点指标对应的作品记录；首次完成时间用于制作周期统计。`;
  }
  return `<div class="dialog-head"><div><h2>${escape(title)}</h2><p>${escape(note)}</p></div>${button(icon('close'), 'close-dialog', 'aria-label="关闭"', 'icon-button')}</div><div class="dialog-body data-detail-body"><div class="detail-table-meta">共 ${rows.length} 条 · 表格内可上下/左右滚动查看</div><div class="detail-table-scroll"><table class="data-table"><thead><tr>${columns.map(column => `<th>${escape(column)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((value, index) => `<td>${columns[index] === '操作' ? value : escape(value)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${columns.length}">当前暂无记录</td></tr>`}</tbody></table></div></div>`;
}

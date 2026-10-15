import { effectiveDurationRows, productionCompletedAt, firstProductionCompletedAt } from './production.js';
import { latestReleaseRows } from './releases.js';
export const sum = values => values.reduce((total, value) => total + Number(value || 0), 0);
export const minutes = seconds => seconds / 60;
export const number = (value, digits = 0) => value == null ? '—' : new Intl.NumberFormat('zh-CN', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
export const shortNumber = value => value == null ? '—' : value >= 10000 ? `${number(value / 10000, 1)}万` : number(value);
export const monthOf = date => String(date || '').slice(0, 7);
export function cumulativePoints(data) {
  const cutoff = data.now.slice(0, 10);
  const opening = data.consumptionOpening?.points || 0;
  const rows = data.charges.filter(row => row.postedAt.slice(0, 10) <= cutoff);
  return { points: opening + sum(rows.map(row => row.points)), opening, cutoff, rows };
}
export const employee = (data, id) => data.employees.find(person => person.id === id);
export const activeEmployees = data => data.employees.filter(person => person.active);
export const nameOf = (data, id) => employee(data, id)?.active ? employee(data, id).name : id ? '历史成员' : '未归属';
export const projectTasks = (data, id) => data.tasks.filter(task => task.projectId === id);
export const episodes = (data, id) => data.episodes.filter(episode => episode.projectId === id && !episode.cancelled);
export function latestLedgers(data, id) {
  const latest = new Map();
  for (const ledger of data.ledgers.filter(row => row.projectId === id && row.confirmed)) {
    const previous = latest.get(ledger.episodeId);
    if (!previous || ledger.version > previous.version) latest.set(ledger.episodeId, ledger);
  }
  return [...latest.values()];
}

/** Display shares use largest remainder rounding; calculations never use rounded labels. */
export function percentages(values) {
  const total = sum(values);
  if (!total) return values.map(() => 0);
  const raw = values.map(value => value / total * 1000);
  const parts = raw.map(Math.floor);
  const remainder = 1000 - sum(parts);
  const order = raw.map((value, index) => ({ index, remainder: value - parts[index] })).sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < remainder; i++) parts[order[i % order.length].index]++;
  return parts.map(value => value / 10);
}

export function contribution(data, projectId, month = null) {
  const ledgerRows = effectiveDurationRows(data, projectId).filter(row => !month || monthOf(row.producedOn) === month);
  const grouped = new Map();
  for (const row of ledgerRows) {
    const person = employee(data, row.employeeId);
    const key = !row.employeeId ? 'unassigned' : person?.active ? row.employeeId : 'historical';
    const existing = grouped.get(key) || { id: key, name: key === 'unassigned' ? '未归属' : key === 'historical' ? '历史成员' : person.name, seconds: 0, tone: person?.tone || 'neutral' };
    existing.seconds += row.seconds;
    grouped.set(key, existing);
  }
  const rows = [...grouped.values()].sort((a, b) => b.seconds - a.seconds);
  const shares = percentages(rows.map(row => row.seconds));
  return { total: sum(rows.map(row => row.seconds)), rows: rows.map((row, index) => ({ ...row, share: shares[index] })) };
}

export function projectCost(data, projectId, employeeId = null) {
  const rows = data.charges.filter(row => row.projectId === projectId && (!employeeId || row.employeeId === employeeId));
  return { points: sum(rows.map(row => row.points)), amount: rows.length ? sum(rows.map(row => row.amount)) : null };
}

export function projectSummary(data, project) {
  const eps = episodes(data, project.id);
  const tasks = projectTasks(data, project.id).filter(task => task.status !== 'cancelled');
  const adopted = contribution(data, project.id);
  const cost = projectCost(data, project.id);
  const approved = eps.filter(ep => ep.approved).length;
  const filled = latestLedgers(data, project.id).length;
  return { ...project, approved, episodeCount: eps.length, progress: eps.length ? approved / eps.length * 100 : null, tasks,
    done: tasks.filter(task => task.status === 'completed').length, contributions: adopted, cost, filled,
    unitCost: adopted.total > 0 && cost.amount != null ? cost.amount / (adopted.total / 60) : null,
    days: project.startedAt ? Math.max(0, (new Date(productionCompletedAt(data,project.id) || data.now) - new Date(project.startedAt)) / 86400000) : null };
}

export function monthlyProjectRecords(data, month) {
  const projects = data.projects.filter(project => project.approvedAt && monthOf(project.approvedAt) === month);
  const completed = data.projects.filter(project => monthOf(firstProductionCompletedAt(data,project.id)) === month);
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const cutoff = month === monthOf(data.now) ? data.now : `${month}-${String(lastDay).padStart(2, '0')}T23:59:59+08:00`;
  const active = data.projects.filter(project => project.status === 'producing' && project.startedAt && project.startedAt <= cutoff && (!project.completedAt || project.completedAt > cutoff));
  return { projects, completed, active };
}

export function monthlyMetrics(data, month) {
  const { projects, completed, active } = monthlyProjectRecords(data, month);
  const totalSeconds = data.projects.flatMap(project => effectiveDurationRows(data, project.id)).filter(row => monthOf(row.producedOn) === month).reduce((total, row) => total + Number(row.seconds || 0), 0);
  const charges = data.charges.filter(row => monthOf(row.postedAt) === month);
  const periods = completed.filter(project => project.startedAt).map(project => (new Date(firstProductionCompletedAt(data,project.id)) - new Date(project.startedAt)) / 86400000);
  return { launched: projects.length, active: active.length, completed: completed.length, minutes: totalSeconds / 60, cost: sum(charges.map(row => row.amount)), averageDays: periods.length ? sum(periods) / periods.length : null };
}

export function teamStats(data, month) {
  const grouped = new Map();
  for (const row of data.projects.flatMap(project => effectiveDurationRows(data, project.id)).filter(row => monthOf(row.producedOn) === month)) {
    const existing = grouped.get(row.leaderId) || { id: row.leaderId, name: nameOf(data, row.leaderId), seconds: 0, members: new Set(), tone: employee(data, row.leaderId)?.tone || 'neutral' };
    existing.seconds += row.seconds;
    if (row.employeeId) existing.members.add(row.employeeId);
    grouped.set(row.leaderId, existing);
  }
  return [...grouped.values()].map(team => ({ ...team, minutes: team.seconds / 60, memberCount: team.members.size })).sort((a, b) => b.seconds - a.seconds);
}

export function comparison(a, b) {
  return { difference: a - b, percentage: b > 0 ? (a - b) / b * 100 : null };
}

export function releaseSummary(data, projectId) {
  const rows = latestReleaseRows(data, projectId);
  return { views: rows.length ? sum(rows.map(row => row.views)) : null, likes: rows.length ? sum(rows.map(row => row.likes)) : null, saves: rows.length ? sum(rows.map(row => row.saves)) : null, updated: rows.at(-1)?.snapshotAt, rows };
}

export function personStats(data, personId) {
  const seconds = sum(data.projects.flatMap(project=>effectiveDurationRows(data,project.id)).filter(row => row.employeeId === personId).map(row => row.seconds));
  const charges = data.charges.filter(row => row.employeeId === personId);
  const amount = sum(charges.map(row => row.amount));
  return { seconds, amount, tasks: data.tasks.filter(task => task.assigneeId === personId), projects: data.projects.filter(project => project.members.includes(personId)), unitCost: seconds > 0 ? amount / (seconds / 60) : null };
}

import { effectiveDurationRows } from './production.js';
import { latestLedgers, monthOf, sum } from './metrics.js';

export const groupOfEmployee = (data, employeeId) => (data.groups || []).find(group => group.memberIds.includes(employeeId));
export function groupSummary(data, group, month) {
  const activeIds = new Set(data.employees.filter(employee => employee.active).map(employee => employee.id));
  const members = group.memberIds.filter(id => activeIds.has(id));
  const projects = data.projects.filter(project => project.groupId === group.id && project.status !== 'draft' && (
    monthOf(project.approvedAt) === month || ((project.startedAt || project.approvedAt || '').slice(0,7) <= month && (!project.completedAt || monthOf(project.completedAt) >= month))
  ));
  const charges = data.charges.filter(row => row.groupId === group.id && monthOf(row.postedAt) === month);
  const rows = data.projects.flatMap(project => effectiveDurationRows(data, project.id)).filter(row => row.groupId === group.id && monthOf(row.producedOn) === month);
  return { ...group, leaderId: members.includes(group.leaderId) ? group.leaderId : null, members, projects, charges, points: sum(charges.map(row => row.points)), minutes: sum(rows.map(row => row.seconds)) / 60, completed: projects.filter(project => project.status === 'completed').length, syncedAt: data.metricsSyncedAt || data.now };
}
export const groupSummaries = (data, month) => (data.groups || []).map(group => groupSummary(data, group, month));

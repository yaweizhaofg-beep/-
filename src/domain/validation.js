export class DomainError extends Error {
  constructor(code, message) { super(message); this.name = 'DomainError'; this.code = code; }
}
export function requireValue(condition, code, message) { if (!condition) throw new DomainError(code, message); }
export function validateProject(input, projects) {
  requireValue(input.name?.trim(), 'REQUIRED_NAME', '请填写项目名称。');
  requireValue(!projects.some(project => project.name === input.name.trim()), 'NAME_CONFLICT', '已有同名项目，请为不同季或版本使用独立名称。');
  requireValue(input.leaderId, 'REQUIRED_LEADER', '请选择该剧组长。');
  requireValue(Number.isInteger(input.episodeCount) && input.episodeCount > 0 && input.episodeCount <= 200, 'INVALID_EPISODES', '示例支持1–200集，请输入整数。');
  requireValue(input.plannedStart && input.plannedEnd && input.plannedEnd > input.plannedStart, 'INVALID_PLAN', '计划完成时间必须晚于开始时间。');
}
export function validateLedger(input, data) {
  requireValue(Number.isFinite(input.total) && input.total >= 0, 'INVALID_DURATION', '总时长须为非负秒数。');
  const total = input.rows.reduce((sum, row) => sum + Number(row.seconds), 0);
  requireValue(Math.abs(total - input.total) < 0.001, 'DURATION_TOTAL_MISMATCH', `归属合计${total}秒，与确认总时长${input.total}秒不一致。`);
  const project = data.projects.find(project => project.id === input.projectId);
  requireValue(project, 'PROJECT_NOT_FOUND', '项目不存在。');
  const seen = new Set();
  for (const row of input.rows) {
    requireValue(Number.isFinite(row.seconds) && row.seconds >= 0, 'INVALID_DURATION', '每行时长须为非负秒数。');
    requireValue(row.producedOn && row.producedOn <= data.now.slice(0, 10), 'INVALID_DATE', '产出日期不能为空或晚于示例当前日期。');
    requireValue(!row.employeeId || project.members.includes(row.employeeId), 'INVALID_MEMBERSHIP', '贡献人员须为该剧成员。');
    const key = `${row.employeeId}|${row.producedOn}|${row.leaderId}`;
    requireValue(!seen.has(key), 'DUPLICATE_ROW', '同员工、日期及责任组长的记录重复，请先合并。');
    seen.add(key);
  }
  const episode = data.episodes.find(ep => ep.id === input.episodeId);
  requireValue(episode && episode.projectId === input.projectId, 'INVALID_EPISODE', '请选择本剧的集。');
  requireValue(!episode.duration || input.total <= episode.duration, 'DURATION_EXCEEDS_EPISODE', '确认有效时长不能超过成片基准时长。');
}

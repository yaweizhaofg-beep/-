import { productionCompletedAt, validBaiduUrl } from './production.js';
import { groupOfEmployee } from './groups.js';

/** Software events, rather than editable web task labels, determine production milestones. */
export function employeeProjectStage(data, project, employeeId) {
  const completedAt = productionCompletedAt(data, project.id);
  if (completedAt) return {label:'项目已完成 · 进入运营', status:'completed', at:completedAt};
  const records = (data.generationRecords || []).filter(row=>row.projectId===project.id && row.employeeId===employeeId && row.status!=='queued' && row.status!=='pending');
  const times = records.map(row=>row.inferenceStartedAt || row.startedAt || row.generatedAt).filter(Boolean).sort();
  const upload = (data.productionUploads || []).filter(row=>row.projectId===project.id && row.employeeId===employeeId && validBaiduUrl(row.url) && row.uploadedAt && (!times.length || row.uploadedAt >= times.at(-1))).sort((a,b)=>b.uploadedAt.localeCompare(a.uploadedAt))[0];
  if (upload) return {label:'员工制作完成 · 待组长确认', status:'review', at:upload.uploadedAt};
  if (times.length) return {label:'制作中', status:'running', at:times[0]};
  const assignment = (data.productionAssignments || []).find(row=>row.projectId===project.id && row.employeeId===employeeId && !row.cancelled);
  const task = (data.tasks || []).find(row=>row.projectId===project.id && row.assigneeId===employeeId && row.status!=='cancelled');
  if (assignment || task || (project.members || []).includes(employeeId) && employeeId!==project.leaderId) return {label:'已指派 · 待开始制作',status:'pending',at:assignment?.assignedAt || null};
  return {label:'剧本与资产拆分中',status:'planned',at:project.approvedAt};
}

export function employeeWorkRows(data) {
  return data.employees.filter(person=>person.active).flatMap(person=>{
    const group = groupOfEmployee(data, person.id);
    const projects = data.projects.filter(project=>project.approvedAt && project.status!=='draft' && (
      (project.members || []).includes(person.id) || project.leaderId===person.id ||
      (data.productionAssignments || []).some(row=>row.projectId===project.id && row.employeeId===person.id && !row.cancelled) ||
      (data.tasks || []).some(row=>row.projectId===project.id && row.assigneeId===person.id && row.status!=='cancelled') ||
      (data.generationRecords || []).some(row=>row.projectId===project.id && row.employeeId===person.id) ||
      (data.productionUploads || []).some(row=>row.projectId===project.id && row.employeeId===person.id)
    ));
    const base={employeeId:person.id,name:person.name,groupId:group?.id || '',groupName:group?.name || '待分配小组'};
    return projects.length ? projects.map(project=>({...base,projectId:project.id,projectName:project.displayName,leaderId:project.leaderId,...employeeProjectStage(data,project,person.id)})) : [{...base,projectId:null,projectName:'暂无工作项目',label:'待分配',status:'planned',at:null}];
  });
}

export function ipDeliveryState(data, project) {
  const planned = project.plannedEnd?.slice(0,10);
  if (!planned || !Number.isFinite(Date.parse(planned))) return {planned:'待设置',label:'预计完成时间待设置',overdueDays:0};
  const finished = productionCompletedAt(data,project.id);
  const day = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(finished || data.now));
  const overdueDays = Math.max(0,Math.round((Date.parse(day)-Date.parse(planned))/86400000));
  return {planned,overdueDays,label:finished ? overdueDays ? `逾期${overdueDays}天交付` : '已按期完成' : overdueDays ? `逾期${overdueDays}天` : '正常生产中'};
}

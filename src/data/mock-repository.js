import { latestHandoff, productionCompletedAt } from '../domain/production.js';
import { createFixtures } from './fixtures.js';
import { DomainError, requireValue, validateLedger, validateProject } from '../domain/validation.js';
import { validateLayout, defaultLayout, autoLayout, OVERVIEW_MODULES } from '../domain/layout.js';
import { dailySnapshotDate } from '../domain/releases.js';

const STORAGE_KEY = 'zizi-studio-prototype-v1';
const id = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

/** Repository boundary: UI never accesses localStorage or writes fixture objects directly. */
export class MockRepository {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
    try { this.state = JSON.parse(storage?.getItem(STORAGE_KEY)); } catch { this.state = null; }
    if (!this.state || this.state.schemaVersion !== 1) this.state = createFixtures();
    const defaults = createFixtures();
    for (const employee of defaults.employees) if (!this.state.employees.some(row => row.id === employee.id)) this.state.employees.push(employee);
    for(const key of ['generationRecords','productionUploads','productionHandoffs','productionProgress','modelUsageDaily','operations','operationReceipts'])this.state[key] ||= defaults[key];
    this.state.groups ||= defaults.groups;
    for(const group of this.state.groups)group.roles ||= {};
    this.state.directorySync ||= defaults.directorySync;
    this.state.metricsSyncedAt ||= defaults.metricsSyncedAt;
    for (const project of this.state.projects) project.groupId ||= defaults.projects.find(row => row.id === project.id)?.groupId || null;
    for (const charge of this.state.charges) charge.groupId ||= this.state.projects.find(row => row.id === charge.projectId)?.groupId || null;
    for (const ledger of this.state.ledgers) for (const row of ledger.rows) row.groupId ||= this.state.projects.find(project => project.id === ledger.projectId)?.groupId || null;
    this.state.consumptionOpening ||= defaults.consumptionOpening;
    this.state.releaseHistory ||= [];
    for (const row of defaults.releases) if (!this.state.releases.some(existing => existing.projectId === row.projectId)) this.state.releases.push(row);
  }
  async read() { return structuredClone(this.state); }
  async syncDirectory() {
    this.state.directorySync = { syncedAt:new Date().toISOString(), source:'后端员工池 · 假设案例' };
    this.state.metricsSyncedAt = this.state.directorySync.syncedAt;
    return this.commit('DIRECTORY_SYNCED', { retainedGroups:this.state.groups.length, employeeCount:this.state.employees.filter(row=>row.active).length });
  }
  checkedGroup(groupId, version) {
    const group = this.state.groups.find(row => row.id === groupId);
    requireValue(group, 'GROUP_NOT_FOUND', '小组不存在。');
    requireValue(group.version === Number(version), 'VERSION_CONFLICT', '分组已被更新，请重新打开后操作。');
    return group;
  }
  async saveGroup(input) {
    requireValue(input.name?.trim(), 'GROUP_NAME_REQUIRED', '请填写小组名称。');
    requireValue(!this.state.groups.some(row=>row.id!==input.id && row.name===input.name.trim()), 'GROUP_NAME_CONFLICT', '小组名称已存在。');
    const existing = input.id ? this.checkedGroup(input.id,input.version) : null;
    const group = existing || { id:id('group'), memberIds:[], roles:{}, tone:'violet', version:0 };
    requireValue(!input.leaderId || group.memberIds.includes(input.leaderId), 'LEADER_NOT_MEMBER', '请先将员工加入本组，再设置为组长。');
    requireValue(!input.leaderId || this.state.employees.some(row=>row.id===input.leaderId&&row.active),'EMPLOYEE_NOT_ACTIVE','组长必须为同步得到的在职员工。');
    group.name=input.name.trim();group.leaderId=input.leaderId||null;group.version++;group.updatedAt=new Date().toISOString();
    if(!existing)this.state.groups.push(group);
    return this.commit('GROUP_SAVED',{groupId:group.id});
  }
  async addGroupMembers(groupId, employeeIds, version) {
    const group = this.checkedGroup(groupId,version);
    requireValue(employeeIds.length>0, 'MEMBERS_REQUIRED', '请选择需要加入的员工。');
    for(const employeeId of employeeIds) requireValue(this.state.employees.some(row=>row.id===employeeId&&row.active),'EMPLOYEE_NOT_ACTIVE','只能分配同步得到的在职员工。');
    for(const employeeId of new Set(employeeIds)) {
      for(const other of this.state.groups.filter(row=>row.id!==groupId&&row.memberIds.includes(employeeId))) {
        other.memberIds=other.memberIds.filter(id=>id!==employeeId);delete other.roles[employeeId];
        if(other.leaderId===employeeId)other.leaderId=null;
        other.version++;other.updatedAt=new Date().toISOString();
      }
      if(!group.memberIds.includes(employeeId))group.memberIds.push(employeeId);
    }
    group.version++;group.updatedAt=new Date().toISOString();
    return this.commit('GROUP_MEMBERS_ASSIGNED',{groupId,employeeIds});
  }
  async removeGroupMember(groupId, employeeId, version) {
    const group = this.checkedGroup(groupId,version);
    requireValue(group.memberIds.includes(employeeId),'MEMBER_NOT_FOUND','该员工已不在本组。');
    group.memberIds=group.memberIds.filter(id=>id!==employeeId);delete group.roles[employeeId];
    if(group.leaderId===employeeId)group.leaderId=null;
    group.version++;group.updatedAt=new Date().toISOString();
    return this.commit('GROUP_MEMBER_REMOVED',{groupId,employeeId});
  }
  async updateGroupMember(groupId, employeeId, input) {
    const group = this.checkedGroup(groupId,input.version);
    requireValue(group.memberIds.includes(employeeId),'MEMBER_NOT_FOUND','该员工已不在本组。');
    if(input.targetGroupId && input.targetGroupId!==groupId) {
      const target=this.checkedGroup(input.targetGroupId,input.targetVersion);
      group.memberIds=group.memberIds.filter(id=>id!==employeeId);delete group.roles[employeeId];
      if(group.leaderId===employeeId)group.leaderId=null;
      group.version++;group.updatedAt=new Date().toISOString();
      target.memberIds=[...new Set([...target.memberIds,employeeId])];
      target.roles[employeeId]=input.groupRole?.trim()||'';
      target.version++;target.updatedAt=new Date().toISOString();
    } else {
      group.roles[employeeId]=input.groupRole?.trim()||'';group.version++;group.updatedAt=new Date().toISOString();
    }
    return this.commit('GROUP_MEMBER_UPDATED',{groupId,employeeId,targetGroupId:input.targetGroupId});
  }
  async refreshDailyReleases(now = new Date()) {
    const day = dailySnapshotDate(now);
    let changed = false;
    for (const [index, row] of this.state.releases.entries()) {
      const previous = row.snapshotAt.slice(0, 10);
      if (day <= previous) continue;
      const days = Math.round((Date.parse(day) - Date.parse(previous)) / 86400000);
      this.state.releaseHistory.push(structuredClone(row));
      row.views += days * (1200 + index * 630);
      row.likes += days * (85 + index * 31);
      row.saves += days * (28 + index * 13);
      row.snapshotAt = `${day}T08:00:00+08:00`;
      changed = true;
    }
    if (changed) await this.commit('MOCK_DAILY_RELEASE_SNAPSHOT', { day, source: '虚构演示增量，不连接真实平台' });
    return this.read();
  }
  commit(action, details) {
    this.state.audit.unshift({ id: id('audit'), action, details, at: this.state.now });
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.state));
    return this.read();
  }
  async reset() { this.state = createFixtures(); this.storage?.removeItem(STORAGE_KEY); return this.read(); }
  async createProject(input) {
    validateProject(input, this.state.projects);
    const project = { id: id('project'), ip: input.ip || input.name, name: input.name.trim(), displayName: input.name.trim(), genre: input.genre || '新立项', subtitle: input.synopsis || '一个新的故事，从这里开始。', synopsis: input.synopsis, cover: 'mist', tone: 'violet', leaderId: input.leaderId, members: [...new Set([input.leaderId, ...input.members])], status: input.draft ? 'draft' : 'planned', phase: '待开工', plannedStart: input.plannedStart, plannedEnd: input.plannedEnd, approvedAt: input.draft ? null : this.state.now, sync: 'waiting', version: 1 };
    project.groupId=this.state.groups.find(group=>group.memberIds.includes(input.leaderId))?.id||null;
    this.state.projects.unshift(project);
    for (let i = 1; i <= input.episodeCount; i++) this.state.episodes.push({ id: `${project.id}-ep${i}`, projectId: project.id, name: `EP${String(i).padStart(2, '0')}`, approved: false, duration: null });
    return this.commit('PROJECT_CREATED', project.name);
  }
  async updateTeam(projectId, input) {
    const project = this.state.projects.find(row => row.id === projectId);
    const removed = project.members.filter(personId => !input.members.includes(personId) && personId !== input.leaderId);
    const pending = this.state.tasks.filter(task => task.projectId === projectId && removed.includes(task.assigneeId) && !['completed', 'cancelled'].includes(task.status));
    requireValue(!pending.length || input.transferTo, 'OPEN_TASKS', '移出人员还有未完成任务，请选择接手员工。');
    for (const task of pending) { task.assigneeId = input.transferTo; task.version++; }
    project.leaderId = input.leaderId;
    project.members = [...new Set([input.leaderId, ...input.members])];
    project.version++;
    return this.commit('TEAM_UPDATED', { projectId, removed, transferred: pending.length });
  }
  async updateTask(taskId, input) {
    const task = this.state.tasks.find(row => row.id === taskId);
    requireValue(task, 'TASK_NOT_FOUND', '任务不存在。');
    if (input.assigneeId) task.assigneeId = input.assigneeId;
    if (input.status) task.status = input.status;
    if (input.status === 'completed') task.completedAt = this.state.now;
    task.version++;
    return this.commit('TASK_UPDATED', { taskId, ...input });
  }
  async createTask(input) {
    requireValue(input.name.trim() && input.assigneeId && input.due, 'INVALID_TASK', '请填写任务、负责人和截止日期。');
    this.state.tasks.unshift({ ...input, id: id('task'), status: 'pending', version: 1 });
    return this.commit('TASK_CREATED', input.name);
  }
  async confirmLedger(input) {
    input={...input,rows:input.rows.map(row=>({...row,groupId:row.groupId||this.state.projects.find(project=>project.id===input.projectId)?.groupId||null}))};
    validateLedger(input, this.state);
    const existing = this.state.ledgers.find(row => row.episodeId === input.episodeId);
    requireValue(!existing || existing.version === input.version, 'VERSION_CONFLICT', '台账已被更新，请重新加载。');
    const ledger = { ...input, id: existing?.id || id('ledger'), version: (existing?.version || 0) + 1, confirmed: true };
    if (existing) this.state.ledgers[this.state.ledgers.indexOf(existing)] = ledger; else this.state.ledgers.push(ledger);
    return this.commit('LEDGER_CONFIRMED', { episodeId: input.episodeId, previous: existing, current: ledger });
  }
  async approveEpisode(episodeId) {
    const episode = this.state.episodes.find(row => row.id === episodeId);
    episode.approved = !episode.approved;
    const project = this.state.projects.find(row => row.id === episode.projectId);
    const complete = this.state.episodes.filter(row => row.projectId === project.id).every(row => row.approved);
    project.status = complete ? 'completed' : 'producing';
    project.completedAt = complete ? this.state.now : null;
    if (complete && !project.firstCompletedAt) project.firstCompletedAt = this.state.now;
    return this.commit('EPISODE_REVIEWED', { episodeId, approved: episode.approved });
  }
  async updateProjectStatus(projectId, status) {
    const project = this.state.projects.find(row => row.id === projectId);
    project.status = status;
    if (status === 'producing' && !project.startedAt) project.startedAt = this.state.now;
    if (status === 'planned' && !project.approvedAt) project.approvedAt = this.state.now;
    return this.commit('PROJECT_STATUS_UPDATED', { projectId, status });
  }
  async saveRelease(input) {
    requireValue(input.platform && input.workId && [input.views, input.likes, input.saves].every(value => Number.isFinite(value) && value >= 0), 'INVALID_RELEASE', '请填写平台作品ID及非负计数。');
    const existing = this.state.releases.find(row => row.projectId === input.projectId && row.platform === input.platform && row.workId === input.workId);
    const row = { ...input, id: existing?.id || id('release'), snapshotAt: this.state.now };
    if (existing) { this.state.releaseHistory.push(structuredClone(existing)); this.state.releases[this.state.releases.indexOf(existing)] = row; } else this.state.releases.push(row);
    return this.commit('RELEASE_SAVED', input.projectId);
  }
  async syncProject(projectId) {
    const project = this.state.projects.find(row => row.id === projectId);
    const candidates = this.state.softwareProjects.filter(row => row.name.trim() === project.name);
    project.sync = candidates.length > 1 ? 'conflict' : candidates.length === 1 ? 'connected' : 'waiting';
    project.softwareId = candidates[0]?.id || null;
    return this.commit('MOCK_NAME_MATCH', { projectId, candidates: candidates.length });
  }
  async receiveHandoff(handoffId) {
    const handoff=this.state.productionHandoffs.find(row=>row.id===handoffId);
    requireValue(handoff&&latestHandoff(this.state,handoff.projectId)?.id===handoffId&&productionCompletedAt(this.state,handoff.projectId),'NOT_READY','该交付尚未完成或版本已更新，请刷新。');
    if(!this.state.operationReceipts.some(row=>row.handoffId===handoffId))this.state.operationReceipts.push({handoffId,receivedAt:new Date().toISOString(),operator:'运营示例账号'});
    return this.commit('OPERATIONS_HANDOFF_RECEIVED',{handoffId});
  }
  async saveOperation(input) {
    const handoff=latestHandoff(this.state,input.projectId);
    requireValue(handoff&&handoff.id===input.handoffId&&productionCompletedAt(this.state,input.projectId),'STALE_HANDOFF','最终交付未就绪或版本已改变，请重新接收。');
    requireValue(this.state.operationReceipts.some(row=>row.handoffId===handoff.id),'RECEIPT_REQUIRED','请先接收组长的最终交付。');
    const publishedAt=/[zZ]|[+-]\d{2}:\d{2}$/.test(input.publishedAt||'')?input.publishedAt:`${input.publishedAt}:00+08:00`;
    requireValue(Number.isFinite(Date.parse(publishedAt))&&Date.parse(publishedAt)>=Date.parse(handoff.confirmedAt),'INVALID_PUBLISH_TIME','投放时间不得早于最终交付时间。');
    requireValue(input.platform?.trim()&&input.workId?.trim()&&[input.views,input.likes,input.saves].every(value=>Number.isInteger(value)&&value>=0),'INVALID_OPERATION','请填写平台、作品ID与非负整数指标。');
    let url;try{url=new URL(input.publishUrl);}catch{}
    requireValue(url&&['https:','http:'].includes(url.protocol),'INVALID_PUBLISH_URL','请填写有效的投放页面链接。');
    const existing=input.operationId?this.state.operations.find(row=>row.id===input.operationId):null;
    requireValue(!input.operationId||existing,'OPERATION_NOT_FOUND','投放记录已不存在。');
    requireValue(!existing||(existing.projectId===input.projectId&&existing.handoffId===handoff.id&&existing.version===Number(input.version)),'VERSION_CONFLICT','投放记录已更新，请重新打开。');
    requireValue(!this.state.operations.some(row=>row.id!==existing?.id&&row.projectId===input.projectId&&row.platform===input.platform.trim()&&row.workId===input.workId.trim()),'DUPLICATE_OPERATION','该平台作品已录入，请编辑原记录。');
    const record={id:existing?.id||id('operation'),projectId:input.projectId,handoffId:handoff.id,platform:input.platform.trim(),workId:input.workId.trim(),publishUrl:url.href,publishedAt,views:input.views,likes:input.likes,saves:input.saves,note:(input.note||'').slice(0,2000),operator:'运营示例账号',recordedAt:new Date().toISOString(),version:(existing?.version||0)+1,source:'operations-web'};
    if(existing)this.state.operations[this.state.operations.indexOf(existing)]=record;else this.state.operations.push(record);
    const snapshot=this.state.releases.find(row=>row.projectId===record.projectId&&row.platform===record.platform&&row.workId===record.workId);
    const next={id:snapshot?.id||id('release'),projectId:record.projectId,platform:record.platform,workId:record.workId,views:record.views,likes:record.likes,saves:record.saves,snapshotAt:record.recordedAt,source:'operations-web'};
    if(snapshot){this.state.releaseHistory.push(structuredClone(snapshot));this.state.releases[this.state.releases.indexOf(snapshot)]=next;}else this.state.releases.push(next);
    await this.commit('OPERATION_PUBLISHED',{id:record.id,handoffId:handoff.id,version:record.version});
    return structuredClone(record);
  }
  async saveScreen(input) {
    requireValue(input.name.trim(), 'INVALID_SCREEN', '请填写大屏名称。');
    requireValue(Array.isArray(input.pages)&&input.pages.length===1,'SINGLE_PAGE_REQUIRED','大屏只支持一页，请减少模块或调整尺寸。');
    if(input.projectIds!==undefined)requireValue(Array.isArray(input.projectIds)&&input.projectIds.length>0&&new Set(input.projectIds).size===input.projectIds.length&&input.projectIds.every(projectId=>this.state.projects.some(project=>project.id===projectId&&project.status!=='draft')), 'INVALID_SCOPE', '请选择至少一部有效剧目。');
    if(input.rotationSeconds!==undefined)requireValue([15,30,60].includes(input.rotationSeconds), 'INVALID_ROTATION', '轮播间隔支持15、30或60秒。');
    requireValue(input.pages.every(page => validateLayout(page.components)), 'INVALID_LAYOUT', '组件重叠或超出画布，请调整布局。');
    const existing = this.state.screens.find(row => row.id === input.id);
    requireValue(!existing || existing.version === input.version, 'VERSION_CONFLICT', '方案已更新，请重载或另存副本。');
    const screen = { ...structuredClone(input), id: existing?.id || id('screen'), version: (existing?.version || 0) + 1, updatedAt: this.state.now };
    if (existing) this.state.screens[this.state.screens.indexOf(existing)] = screen; else this.state.screens.push(screen);
    await this.commit('SCREEN_SAVED', screen.name);
    return screen;
  }
  async createScreen(name, template = 'overview', modules = null) {
    requireValue(!modules || (modules.length > 0 && new Set(modules).size === modules.length && modules.every(type => OVERVIEW_MODULES.includes(type))), 'INVALID_MODULES', '请至少选择一个有效总览模块。');
    const components = defaultLayout();
    if (template === 'teams') components[1] = { ...components[1], type: 'cost' };
    return this.saveScreen({ name, template, version: 0, month: '2026-10', projectId: 'echo', pages: modules ? autoLayout(modules.map((type,index)=>({id:`w-${index}`,type,scope:'inherit'}))) : [{ id: id('page'), components }], archived: false });
  }
  async setScreenArchived(screenId, archived) {
    const screen = this.state.screens.find(row => row.id === screenId);
    requireValue(screen, 'SCREEN_NOT_FOUND', '大屏方案不存在。');
    screen.archived = archived;
    return this.commit(archived ? 'SCREEN_ARCHIVED' : 'SCREEN_RESTORED', screenId);
  }
  archiveScreen(screenId) { return this.setScreenArchived(screenId, true); }
  restoreScreen(screenId) { return this.setScreenArchived(screenId, false); }
  async demoUpdate() {
    this.state.charges.push({ id: id('demo-charge'), projectId: 'echo', groupId:'group-1', employeeId: 'ming', points: 40, amount: 6, postedAt: this.state.now, model: 'Sora', kind: 'video' });
    const day=this.state.now.slice(0,10);let usage=this.state.modelUsageDaily.find(row=>row.date===day&&row.projectId==='echo'&&row.modelId==='sora');if(!usage){usage={date:day,projectId:'echo',modelId:'sora',modelName:'Sora',mediaType:'video',consumedPoints:0,refundedPoints:0,successfulVideos:0,source:'fictional-model-aggregate'};this.state.modelUsageDaily.push(usage);}usage.consumedPoints+=40;usage.successfulVideos+=1;
    this.state.metricsSyncedAt=new Date().toISOString();
    return this.commit('DEMO_EVENT', '模拟一次6元生成扣费；不自动增加已采用有效时长。');
  }
}

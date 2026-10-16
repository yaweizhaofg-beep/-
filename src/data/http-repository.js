/** Backend adapter. Keep server authorization and validation; prototype role controls are not security. */
export class HttpRepository {
  constructor(baseUrl = '/api/v1') { this.baseUrl = baseUrl.replace(/\/$/, ''); }
  async request(path, method = 'GET', body) {
    const response = await fetch(`${this.baseUrl}${path}`, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(this.csrfToken && method!=='GET'?{'X-CSRF-Token':this.csrfToken}:{}) }, body: body ? JSON.stringify(body) : undefined });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { const error = new Error(payload.message || `请求失败（${response.status}）`); error.code = payload.code; error.status=response.status; if(response.status===401&&!path.startsWith('/auth/'))globalThis.dispatchEvent?.(new Event('studio:unauthorized')); throw error; }
    return payload.data ?? payload;
  }
  read() { return this.request('/studio'); }
  syncDirectory() { return this.request('/employee-directory/sync','POST'); }
  saveGroup(input) { return this.request(`/groups${input.id?`/${encodeURIComponent(input.id)}`:''}`,input.id?'PUT':'POST',input); }
  addGroupMembers(id,employeeIds,version) { return this.request(`/groups/${encodeURIComponent(id)}/members`,'POST',{employeeIds,version}); }
  removeGroupMember(id,employeeId,version) { return this.request(`/groups/${encodeURIComponent(id)}/members/${encodeURIComponent(employeeId)}`,'DELETE',{version}); }
  updateGroupMember(id,employeeId,input) { return this.request(`/groups/${encodeURIComponent(id)}/members/${encodeURIComponent(employeeId)}`,'PATCH',input); }
  refreshDailyReleases() { return this.request('/platform-snapshots/latest'); }
  receiveHandoff(id) { return this.request(`/production-handoffs/${encodeURIComponent(id)}/receipt`,'POST',{}); }
  saveOperation(input) { return this.request(`/operations${input.operationId?`/${encodeURIComponent(input.operationId)}`:''}`,input.operationId?'PUT':'POST',input); }
  createProject(input) { return this.request('/projects', 'POST', input); }
  updateTeam(id, input) { return this.request(`/projects/${encodeURIComponent(id)}/team`, 'PUT', input); }
  createTask(input) { return this.request('/work-tasks', 'POST', input); }
  updateTask(id, input) { return this.request(`/work-tasks/${encodeURIComponent(id)}`, 'PATCH', input); }
  confirmLedger(input) { return this.request(`/episodes/${encodeURIComponent(input.episodeId)}/ledger`, 'PUT', input); }
  approveEpisode(id) { return this.request(`/episodes/${encodeURIComponent(id)}/review`, 'POST'); }
  updateProjectStatus(id, status) { return this.request(`/projects/${encodeURIComponent(id)}/status`, 'PATCH', { status }); }
  saveRelease(input) { return this.request('/platform-snapshots', 'PUT', input); }
  syncProject(id) { return this.request(`/projects/${encodeURIComponent(id)}/sync`, 'POST'); }
  saveScreen(input) { return this.request(`/screens${input.id ? `/${encodeURIComponent(input.id)}` : ''}`, input.id ? 'PUT' : 'POST', input); }
  createScreen(name, template, modules) { return this.request('/screens', 'POST', { name, template, modules }); }
  archiveScreen(id) { return this.request(`/screens/${encodeURIComponent(id)}`, 'PATCH', { archived: true }); }
  restoreScreen(id) { return this.request(`/screens/${encodeURIComponent(id)}`, 'PATCH', { archived: false }); }
  reset() { throw new Error('真实接口模式不支持重置业务数据。'); }
  demoUpdate() { throw new Error('真实接口模式不注入模拟数据。'); }
}

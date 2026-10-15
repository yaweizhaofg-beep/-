export function screenProjectIds(data, screen) {
  const valid = data.projects.filter(project => project.status !== 'draft').map(project => project.id);
  const selection = Array.isArray(screen.projectIds) ? screen.projectIds : screen.template === 'project' ? [screen.projectId] : valid;
  return valid.filter(id => selection.includes(id));
}
export function scopedScreenData(data, ids) {
  const selected = new Set(ids);
  const scoped = { ...data, scopeLabel:'所选剧目', consumptionOpening:{points:0}, projects:data.projects.filter(project=>selected.has(project.id)) };
  for(const key of ['episodes','ledgers','charges','tasks','releases','releaseHistory','modelUsageDaily']) {
    if(key==='modelUsageDaily'&&!Array.isArray(data[key]))continue;
    scoped[key]=(data[key]||[]).filter(row=>selected.has(row.projectId));
  }
  return scoped;
}
export function rotationSeconds(value) { return [15,30,60].includes(Number(value)) ? Number(value) : 15; }

/** Daily reporting boundary: 08:00 Asia/Shanghai. */
export function dailySnapshotDate(now = new Date()) {
  // 08:00 in Shanghai equals 00:00 UTC, so the reporting date follows UTC.
  return new Date(now).toISOString().slice(0, 10);
}

export function latestReleaseRows(data, projectId = null) {
  const latest = new Map();
  for (const row of data.releases.filter(row => !projectId || row.projectId === projectId)) {
    const key = `${row.projectId}|${row.platform}|${row.workId}`;
    if (!latest.has(key) || row.snapshotAt > latest.get(key).snapshotAt) latest.set(key, row);
  }
  return [...latest.values()];
}

import { modelUsageFixtures } from './model-usage-fixtures.js';
import { productionFixtures } from './production-fixtures.js';
import { defaultLayout } from '../domain/layout.js';

/** All names, projects, expenses and platform counts are fictional demonstration fixtures. */
export function createFixtures() {
  const employees = [
    { id: 'lead-lin', name: '林知夏', role: '组长', active: true, tone: 'violet' },
    { id: 'lead-xu', name: '许见川', role: '组长', active: true, tone: 'mint' },
    { id: 'ming', name: '小明', role: '视频制作', active: true, tone: 'violet' },
    { id: 'li', name: '小李', role: '资产制作', active: true, tone: 'rose' },
    { id: 'zhao', name: '小赵', role: '剪辑制作', active: true, tone: 'mint' },
    { id: 'yue', name: '沈月', role: '视频制作', active: true, tone: 'peach' },
    { id: 'hao', name: '陈浩', role: '编剧', active: true, tone: 'sky' },
    { id: 'former', name: '历史员工', role: '制作', active: false, tone: 'neutral' },
  ];
  employees.push(
    { id:'lead-qiao', name:'乔予安', role:'组长', active:true, tone:'rose' },
    { id:'lead-shen', name:'沈听澜', role:'组长', active:true, tone:'sky' },
  );
  const extraNames = ['顾南','陈芮','宋禾','江予','叶宁','苏梨','周言','许诺','程远','温乔','季川','林朵','方舟','陆夏','白榆','赵可','李昕','唐悦','余安','何洛','孟星','贺言','秦夏'];
  extraNames.forEach((name,index)=>employees.push({ id:`staff-${index+1}`, name, role:['分镜制作','视频制作','资产制作','剪辑制作'][index%4], active:true, tone:['violet','mint','rose','sky'][index%4], source:'backend-demo' }));
  const groupMembers = [
    ['lead-lin','ming','li','zhao',...Array.from({length:4},(_,i)=>`staff-${i+1}`)],
    ['lead-xu','yue','hao',...Array.from({length:5},(_,i)=>`staff-${i+5}`)],
    ['lead-qiao',...Array.from({length:7},(_,i)=>`staff-${i+10}`)],
    ['lead-shen',...Array.from({length:7},(_,i)=>`staff-${i+17}`)],
  ];
  const groups = ['星火一组','逐光二组','织梦三组','远航四组'].map((name,index)=>({ id:`group-${index+1}`, name, leaderId:groupMembers[index][0], memberIds:groupMembers[index], roles:{}, tone:['violet','mint','rose','sky'][index], version:1, updatedAt:'2026-10-14T18:30:00+08:00' }));
  const projects = [
    { id: 'echo', ip: '回声档案', name: '回声档案_第一季', displayName: '回声档案', subtitle: '当记忆开始说谎，回声会留下证词。', genre: '悬疑 · 科幻', cover: 'echo', tone: 'violet', leaderId: 'lead-lin', members: ['lead-lin', 'ming', 'li', 'zhao'], status: 'producing', phase: '视频制作', approvedAt: '2026-10-02T09:00:00+08:00', startedAt: '2026-10-03T09:00:00+08:00', plannedStart: '2026-10-03', plannedEnd: '2026-10-18', sync: 'connected', version: 1, synopsis: '调查员在雨夜收到一封来自未来的档案，她必须在记忆被重写前找出真相。' },
    { id: 'changan', ip: '长安拾梦', name: '长安拾梦_第一季', displayName: '长安拾梦', subtitle: '灯火深处，拾起一场未醒的梦。', genre: '古风 · 奇幻', cover: 'changan', tone: 'peach', leaderId: 'lead-xu', members: ['lead-xu', 'yue', 'li', 'hao'], status: 'completed', phase: '制作完成', approvedAt: '2026-10-01T09:00:00+08:00', startedAt: '2026-10-02T09:00:00+08:00', completedAt: '2026-10-11T09:00:00+08:00', firstCompletedAt: '2026-10-11T09:00:00+08:00', plannedStart: '2026-10-02', plannedEnd: '2026-10-12', sync: 'connected', version: 1 },
    { id: 'moon', ip: '月亮的来信', name: '月亮的来信_第一季', displayName: '月亮的来信', subtitle: '所有未寄出的信，都在月光里相遇。', genre: '都市 · 治愈', cover: 'moon', tone: 'sky', leaderId: 'lead-lin', members: ['lead-lin', 'zhao', 'yue'], status: 'producing', phase: '分镜制作', approvedAt: '2026-10-09T09:00:00+08:00', startedAt: '2026-10-10T09:00:00+08:00', plannedStart: '2026-10-10', plannedEnd: '2026-10-22', sync: 'waiting', version: 1 },
    { id: 'mist', ip: '雾隐镇', name: '雾隐镇_第一季', displayName: '雾隐镇', subtitle: '迷雾之后，每个人都有另一个名字。', genre: '悬疑 · 冒险', cover: 'mist', tone: 'mint', leaderId: 'lead-xu', members: ['lead-xu', 'ming', 'hao'], status: 'paused', phase: '等待剧本修订', approvedAt: '2026-09-25T09:00:00+08:00', startedAt: '2026-09-27T09:00:00+08:00', plannedStart: '2026-09-27', plannedEnd: '2026-10-25', sync: 'delayed', version: 1 },
  ];
  const projectGroup = { echo:'group-1', changan:'group-2', moon:'group-3', mist:'group-4' };
  for (const project of projects) project.groupId = projectGroup[project.id];
  for (const [projectId,leaderId] of [['moon','lead-qiao'],['mist','lead-shen']]) {
    const project=projects.find(row=>row.id===projectId);
    project.members=project.members.filter(id=>id!==project.leaderId);
    project.leaderId=leaderId;project.members.unshift(leaderId);
  }
  const episodes = projects.flatMap(project => Array.from({ length: { echo: 8, changan: 6, moon: 4, mist: 3 }[project.id] }, (_, index) => ({ id: `${project.id}-ep${index + 1}`, projectId: project.id, name: `EP${String(index + 1).padStart(2, '0')}`, approved: index < ({ echo: 3, changan: 6, moon: 1, mist: 0 }[project.id]), duration: { echo: 720, changan: 600, moon: 480, mist: 600 }[project.id] })));
  const ledgers = [];
  function addLedger(projectId, count, total, allocations, leaderId) {
    for (let i = 0; i < count; i++) ledgers.push({ id: `${projectId}-ledger${i}`, projectId, episodeId: `${projectId}-ep${i + 1}`, total, version: 1, confirmed: true, rows: allocations.map(([employeeId, share]) => ({ employeeId, seconds: total * share, leaderId, producedOn: `2026-10-${String(5 + i).padStart(2, '0')}` })) });
  }
  addLedger('echo', 3, 720, [['ming', .5], ['li', .3], ['zhao', .2]], 'lead-lin');
  addLedger('changan', 6, 600, [['yue', .5], ['li', .3], ['hao', .2]], 'lead-xu');
  addLedger('moon', 1, 480, [['zhao', .7], ['yue', .3]], 'lead-qiao');
  for(const ledger of ledgers) for(const row of ledger.rows) row.groupId=projectGroup[ledger.projectId];
  const charges = ledgers.flatMap(ledger => ledger.rows.map((row, index) => ({ id: `${ledger.id}-charge${index}`, projectId: ledger.projectId, employeeId: row.employeeId, points: row.seconds / 60 * 80, amount: row.seconds / 60 * (ledger.projectId === 'echo' ? 12 : 10), postedAt: `${row.producedOn}T16:00:00+08:00`, model: ledger.projectId === 'changan' ? 'Seedance' : 'Sora', kind: 'video' })));
  charges.push({ id: 'echo-refund', projectId: 'echo', employeeId: 'ming', points: -80, amount: -12, postedAt: '2026-10-13T09:00:00+08:00', kind: 'refund', model: 'Sora' });
  for(const charge of charges) charge.groupId=projectGroup[charge.projectId];
  const tasks = [
    ['t1', 'echo', 'EP04 · 雨夜追踪视频', 'ming', 'running', '视频制作', '2026-10-15'],
    ['t2', 'echo', 'EP05 · 角色与场景资产', 'li', 'running', '资产制作', '2026-10-16'],
    ['t3', 'echo', 'EP03 · 成片精剪', 'zhao', 'review', '剪辑制作', '2026-10-14'],
    ['t4', 'echo', 'EP06 · 分镜拆解', 'ming', 'pending', '分镜制作', '2026-10-17'],
    ['t5', 'echo', 'EP01 · 视频制作', 'ming', 'completed', '视频制作', '2026-10-06'],
    ['t6', 'echo', 'EP02 · 图片资产', 'li', 'completed', '资产制作', '2026-10-07'],
    ['t7', 'echo', 'EP02 · 成片剪辑', 'zhao', 'completed', '剪辑制作', '2026-10-08'],
    ['t8', 'moon', 'EP02 · 台词与分镜', 'yue', 'running', '分镜制作', '2026-10-16'],
    ['t9', 'moon', 'EP01 · 成片剪辑', 'zhao', 'completed', '剪辑制作', '2026-10-12'],
    ['t10', 'mist', 'EP01 · 剧本修订', 'hao', 'blocked', '编剧', '2026-10-18'],
  ].map(([id, projectId, name, assigneeId, status, type, due]) => ({ id, projectId, name, assigneeId, status, type, due, version: 1 }));
  const releases = [{ id: 'rel1', projectId: 'changan', platform: '红果', workId: 'DEMO-HG-1001', views: 286400, likes: 12860, saves: 4320, snapshotAt: '2026-10-14T16:00:00+08:00' }, { id: 'rel2', projectId: 'echo', platform: '抖音预告', workId: 'DEMO-DY-2001', views: 38600, likes: 2480, saves: 860, snapshotAt: '2026-10-14T16:00:00+08:00' }];
  const screens = [
    { id: 'screen-main', name: '制作工作室 · 月度总览', template: 'overview', version: 1, month: '2026-10', projectId: 'echo', pages: [{ id: 'page1', components: defaultLayout() }], updatedAt: '2026-10-14T17:00:00+08:00', archived: false },
    { id: 'screen-echo', name: '回声档案 · 项目专项', template: 'project', version: 1, month: '2026-10', projectId: 'echo', pages: [{ id: 'page1', components: defaultLayout() }], updatedAt: '2026-10-14T16:00:00+08:00', archived: false },
  ];
  releases.push(
    { id: 'rel3', projectId: 'moon', platform: '抖音预告', workId: 'DEMO-DY-2002', views: 187600, likes: 9630, saves: 3240, snapshotAt: '2026-10-14T08:00:00+08:00' },
    { id: 'rel4', projectId: 'mist', platform: '快手预告', workId: 'DEMO-KS-3001', views: 96400, likes: 5820, saves: 1860, snapshotAt: '2026-10-14T08:00:00+08:00' },
  );
  const consumptionOpening = { points: 5991760, through: '2026-09-30', source: '历史累计期初 · 假设案例' };
  const base = { schemaVersion: 1, now: '2026-10-14T18:30:00+08:00', consumptionOpening, groups, directorySync:{syncedAt:'2026-10-14T18:30:00+08:00',source:'后端员工池 · 假设案例'}, metricsSyncedAt:'2026-10-14T18:30:00+08:00', releaseHistory: [], employees, projects, episodes, ledgers, charges, tasks, releases, screens, softwareProjects: [{ id: 'sw-echo', name: '回声档案_第一季' }, { id: 'sw-changan', name: '长安拾梦_第一季' }], audit: [] };
  return {...base,...productionFixtures(base),modelUsageDaily:modelUsageFixtures(base)};
}

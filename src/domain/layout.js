export const GRID = { columns: 24, rows: 12 };
export const WIDGETS = {
  instruments: { name: '模型消耗占比', minW: 12, minH: 4 },
  metrics: { name: '核心指标与累计积分', minW: 24, minH: 2 },
  project: { name: '剧目IP', minW: 12, minH: 4 },
  teams: { name: '团队产出对比', minW: 8, minH: 4 },
  release: { name: '发布平台表现', minW: 8, minH: 3 },
  tasks: { name: '员工工作状态', minW: 8, minH: 4 },
  cost: { name: '人员时长与成本', minW: 12, minH: 4 },
  note: { name: '说明与数据口径', minW: 6, minH: 2 },
};
export const defaultLayout = () => [
  { id: 'w1', type: 'metrics', x: 0, y: 0, w: 24, h: 2, scope: 'inherit' },
  { id: 'w2', type: 'project', x: 0, y: 2, w: 16, h: 6, scope: 'inherit' },
  { id: 'w3', type: 'teams', x: 16, y: 2, w: 8, h: 4, scope: 'inherit' },
  { id: 'w4', type: 'release', x: 16, y: 6, w: 8, h: 6, scope: 'inherit' },
  { id: 'w5', type: 'tasks', x: 0, y: 8, w: 16, h: 4, scope: 'inherit' },
];
export const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
export const inBounds = item => item.x >= 0 && item.y >= 0 && item.x + item.w <= GRID.columns && item.y + item.h <= GRID.rows;
export function validateLayout(items) {
  return items.every((item, index) => WIDGETS[item.type] && inBounds(item) && item.w >= (item.adaptive ? 4 : WIDGETS[item.type].minW) && item.h >= (item.adaptive ? 2 : WIDGETS[item.type].minH) && !items.slice(index + 1).some(other => overlaps(item, other)));
}
/** Stable collision resolution. The complete gesture rolls back if no placement is possible. */
export function placeWidget(items, changed) {
  if(items.find(row=>row.id===changed.id)?.locked)return null;
  const result = structuredClone(items);
  const at = result.findIndex(item => item.id === changed.id);
  if (at >= 0) result[at] = changed; else result.push(changed);
  if (!inBounds(changed) || changed.w < WIDGETS[changed.type].minW || changed.h < WIDGETS[changed.type].minH) return null;
  const occupied = [changed];
  for (const item of result.filter(item => item.id !== changed.id).sort((a, b) => a.y - b.y || a.x - b.x)) {
    if (occupied.some(other => overlaps(item, other))) {
      if(item.locked)return null;
      let found = false;
      for (let y = 0; y <= GRID.rows - item.h && !found; y++) for (let x = 0; x <= GRID.columns - item.w; x++) {
        const candidate = { ...item, x, y };
        if (!occupied.some(other => overlaps(candidate, other))) { Object.assign(item, candidate); found = true; break; }
      }
      if (!found) return null;
    }
    occupied.push(item);
  }
  return validateLayout(result) ? result : null;
}

/** Overview modules are the shared catalogue for creation and the editor. */
export const OVERVIEW_MODULES = ['metrics', 'project', 'instruments', 'teams', 'release', 'tasks'];
export function autoLayout(items) {
  if(items.some(item=>item.locked))return layoutAroundLocked(items);
  const rows = [];
  for (const item of items) {
    const config = WIDGETS[item.type];
    if (!config) throw new Error('未知模块');
    const width = config.minW;
    let row = rows.at(-1);
    if (!row || row.width + width > GRID.columns) {
      row = { items: [], width: 0, height: 0 }; rows.push(row);
    }
    row.items.push({ ...item, w: width }); row.width += width;
    row.height = Math.max(row.height, config.minH);
  }
  const batches = [[]]; let height = 0;
  for (const row of rows) {
    if (height + row.height > GRID.rows) { batches.push([]); height = 0; }
    batches.at(-1).push(row); height += row.height;
  }
  return batches.map((batch, pageIndex) => {
    let y = 0;
    let extra = GRID.rows - batch.reduce((total, row) => total + row.height, 0);
    const flexible = batch.filter(row => !row.items.every(item => item.type === 'metrics'));
    for (let i = 0; i < extra && flexible.length; i++) flexible[i % flexible.length].height++;
    const components = batch.flatMap(row => {
      let x = 0;
      const spare = GRID.columns - row.width;
      const widgets = row.items.map((item, i) => {
        const w = item.w + Math.floor(spare / row.items.length) + (i < spare % row.items.length ? 1 : 0);
        const result = { ...item, x, y, w, h: row.height }; x += w; return result;
      }); y += row.height; return widgets;
    });
    return { id: `auto-page-${pageIndex}`, components };
  });
}
/** Swap only with the nearest module in a direction; all peer slots stay fixed. */
export function moveModule(items, id, direction) {
  const current = items.find(item => item.id === id);
  if (!current || current.locked) return null;
  const horizontal = direction === 'left' || direction === 'right';
  const sign = direction === 'left' || direction === 'up' ? -1 : 1;
  const axis = horizontal ? 'x' : 'y', cross = horizontal ? 'y' : 'x';
  const size = horizontal ? 'w' : 'h', crossSize = horizontal ? 'h' : 'w';
  const center = (item, key, dimension) => item[key] + item[dimension] / 2;
  const candidates = items.filter(item => !item.locked && item.id !== id && sign * (center(item, axis, size) - center(current, axis, size)) > .1);
  candidates.sort((a,b) => {
    const score = item => Math.abs(center(item, axis, size)-center(current, axis, size)) + 3*Math.abs(center(item,cross,crossSize)-center(current,cross,crossSize));
    return score(a)-score(b);
  });
  return candidates[0] ? swapModules(items, id, candidates[0].id) : null;
}
export function swapModules(items, from, to) {
  const source=items.find(item=>item.id===from), target=items.find(item=>item.id===to);
  if(!source||!target||source.locked||target.locked||from===to)return null;
  const slot=item=>({x:item.x,y:item.y,w:item.w,h:item.h});
  const swapped=items.map(item=>item.id===from?{...item,...slot(target)}:item.id===to?{...item,...slot(source)}:{...item});
  const adaptive=swapped.map(item=>item.id===from||item.id===to?{...item,adaptive:true}:item);
  return validateLayout(adaptive)?[{id:'single-page',components:adaptive}]:null;
}

/** Local free-position edits leave every other module untouched. */
export function placeWidgetLocally(items, changed) {
  if(items.find(row=>row.id===changed.id)?.locked)return null;
  const result=items.some(row=>row.id===changed.id)?items.map(row=>row.id===changed.id?{...changed,adaptive:true}:{...row}):[...items,{...changed,adaptive:true}];
  return validateLayout(result)?result:null;
}

/** Locked slots are anchors. Existing free widgets retain their slots where possible. */
function layoutAroundLocked(items) {
  const locked=items.filter(row=>row.locked).map(row=>({...row}));
  if(!validateLayout(locked))return [];
  if(validateLayout(items))return [{id:'single-page',components:structuredClone(items)}];
  function arrange(keepExisting) {
    const placed=[...locked],pending=[];
    for(const item of items.filter(row=>!row.locked)){
      if(keepExisting&&validateLayout([...placed,item]))placed.push({...item});else pending.push(item);
    }
    for(const item of pending){
      const config=WIDGETS[item.type];if(!config)return null;
      const options=[{w:item.w,h:item.h},{w:config.minW,h:config.minH},{w:8,h:3},{w:6,h:2},{w:4,h:2}];
      let found=null;
      for(const size of options){
        if(!Number.isInteger(size.w)||!Number.isInteger(size.h))continue;
        for(let y=0;y<=GRID.rows-size.h&&!found;y++)for(let x=0;x<=GRID.columns-size.w;x++){
          const candidate={...item,...size,x,y,adaptive:true};
          if(validateLayout([...placed,candidate])){found=candidate;break;}
        }
        if(found)break;
      }
      if(!found)return null;placed.push(found);
    }
    return items.map(item=>placed.find(row=>row.id===item.id));
  }
  const components=arrange(true)||arrange(false);
  return components?[{id:'single-page',components}]:[];
}

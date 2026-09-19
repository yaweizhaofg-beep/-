// ═══ PlotAnalysis 子视图共享类型 / 数据 / 组件 ════════════════════════════════════
// 从 Figma Make PlotAnalysisPage.tsx 第 122-160、29-56、350-365 行移植
// 用于 AssetsView 与 ScriptView 之间共享，保持与 Make 一致。

export type ARole = "主角" | "配角" | "路人";
export type AssetSource = { chap: string; ep: string; scene: string };

export type AEntry = {
  id: string;
  type: "角色" | "场景" | "道具";
  name: string;
  role?: ARole;
  prompt: string;
  ok: boolean;
  count: number;
  sources?: AssetSource[];
};

// Make 初始视频资产数据（Make 第 125-134 行）
export const IA: AEntry[] = [
  { id: "c1", type: "角色", name: "林沐",   role: "主角", prompt: "30岁画家，修长，棉麻衬衫，侧脸近景，神情内敛。", ok: true,  count: 18 },
  { id: "c2", type: "角色", name: "苏玫",   role: "主角", prompt: "28岁投资人，藏青西装，正面中景，目光锐利。",     ok: true,  count: 15 },
  { id: "c3", type: "角色", name: "陈刚",   role: "配角", prompt: "35岁，西装略松，多背景出现。",                   ok: false, count: 8  },
  { id: "c4", type: "角色", name: "路人甲", role: "路人", prompt: "",                                              ok: false, count: 2  },
  { id: "s1", type: "场景", name: "城市画廊",   role: undefined, prompt: "玻璃幕墙，冷色调美术灯光，精英感强。",     ok: true,  count: 12 },
  { id: "s2", type: "场景", name: "咖啡厅",     role: undefined, prompt: "暖木质感，轻音乐，情绪过渡空间。",         ok: true,  count: 5  },
  { id: "s3", type: "场景", name: "林沐公寓",   role: undefined, prompt: "",                                       ok: false, count: 4  },
  { id: "p1", type: "道具", name: "匿名信",     role: undefined, prompt: "米白信封，手写隶书，高潮核心道具。",       ok: false, count: 3  },
];

// Make 小说流资产（含章节来源溯源）（Make 第 136-149 行）
export const NOVEL_ASSETS: AEntry[] = [
  { id: "nc1", type: "角色", name: "林沐",   role: "主角", prompt: "30岁都市画家，棉麻白衬衫，侧脸近景，神情内敛。", ok: true,  count: 18,
    sources: [{ chap: "第1-3章", ep: "E01-E06", scene: "S01,S02,S04" }] },
  { id: "nc2", type: "角色", name: "苏玫",   role: "主角", prompt: "28岁投资人，藏青西装，正面中景，目光锐利。",     ok: true,  count: 15,
    sources: [{ chap: "第2-7章", ep: "E01-E05", scene: "S02,S04,S06" }] },
  { id: "nc3", type: "角色", name: "陈刚",   role: "配角", prompt: "35岁商人，西装略松，背景人物多见。",              ok: false, count: 8,
    sources: [{ chap: "第3-11章", ep: "E02-E04", scene: "S03,S05" }] },
  { id: "ns1", type: "场景", name: "城市画廊", role: undefined, prompt: "玻璃幕墙，冷白光，精英感。",                   ok: true,  count: 12,
    sources: [{ chap: "第1-2章", ep: "E01,E03", scene: "S01,S02" }] },
  { id: "ns2", type: "场景", name: "林沐公寓", role: undefined, prompt: "艺术家住所，暖光，画具散落。",                 ok: false, count: 5,
    sources: [{ chap: "第4-6章", ep: "E01,E05", scene: "S05" }] },
  { id: "np1", type: "道具", name: "匿名信",   role: undefined, prompt: "米白信封，手写隶书，高潮核心道具。",           ok: false, count: 3,
    sources: [{ chap: "第1章",   ep: "E01",     scene: "S01" }] },
];

// Make 集数数据（Make 第 189-208 行，含 emotion/hook/novelChap 等字段）
export type EpInfo = {
  n: number; t: string; dur: string; synopsis: string;
  fullSynopsis: string; openHook: string; climax: string; endHook: string;
  hook: string; conflict: string; chars: string[]; novelChap: string;
  emotion: number; fore: number; rev: number; locked: boolean;
};

export const EPS: EpInfo[] = [
  { n: 1, t: "初见惊鸿", dur: "2分00秒", synopsis: "两位主角在画展偶遇，一幅油画引发命运交汇",
    fullSynopsis: "林沐在好友引荐下参加城市画廊开幕展，无意中偶遇投资人苏玫。两人被同一幅《镜中人》吸引，短暂交谈后分开，但林沐发现画中人与苏玫惊人相似。",
    openHook: "林沐在展厅外收到一封无名信", climax: "苏玫在画作前驻足，眼神失神三秒",
    endHook: "林沐打开匿名信，镜头锁定信封上的笔迹", hook: "匿名信的神秘笔迹",
    conflict: "情感误会引发初步张力", chars: ["林沐", "苏玫", "陈刚"], novelChap: "第1-3章",
    emotion: 42, fore: 30, rev: 20, locked: false },
  { n: 2, t: "镜中人", dur: "2分00秒", synopsis: "苏玫发现油画中藏着自己的秘密，信任危机萌生",
    fullSynopsis: "苏玫拿着偷拍的油画照片深夜查资料，发现画中细节与她的童年记忆惊人吻合。她主动约见林沐，试图套取信息，却被林沐识破意图。",
    openHook: "苏玫对着镜子，镜中油画的影像与她重叠", climax: "林沐说出那句「你来找我，不只是为了那幅画」",
    endHook: "苏玫失踪，林沐的电话接通后沉默三秒", hook: "苏玫手机信号突然中断",
    conflict: "身份揭露引发信任崩塌", chars: ["林沐", "苏玫"], novelChap: "第4-7章",
    emotion: 58, fore: 55, rev: 45, locked: false },
  { n: 3, t: "暗流涌动", dur: "2分00秒", synopsis: "陈刚的隐秘身份渐现，三方博弈格局成型",
    fullSynopsis: "陈刚约林沐吃饭，无意间漏出他认识苏玫的细节。林沐暗中调查，发现陈刚与一个神秘基金公司有关联，而那家公司正是苏玫的对手。",
    openHook: "陈刚提到苏玫时，手指不自觉捏紧了酒杯", climax: "三方在同一个地下停车场意外碰面",
    endHook: "陈刚递给林沐一张名片", hook: "三方在停车场同时回头",
    conflict: "利益冲突浮出水面", chars: ["林沐", "苏玫", "陈刚"], novelChap: "第8-11章",
    emotion: 71, fore: 60, rev: 65, locked: true },
  { n: 4, t: "抉择之夜", dur: "2分00秒", synopsis: "林沐被迫在两段感情间抉择，情与义正面碰撞",
    fullSynopsis: "林沐在画廊收到匿名信后情绪崩溃，他需要决定是否告诉苏玫关于油画背后的真相。与此同时，陈刚抛出一个足以改变所有人命运的提议。",
    openHook: "林沐深夜在画廊，对着《镜中人》坐了一整夜", climax: "林沐对苏玫说出真相",
    endHook: "镜头拉远，画廊灯光渐暗", hook: "林沐最终拨通的那个电话",
    conflict: "真相与情感的终极碰撞", chars: ["林沐", "苏玫", "陈刚"], novelChap: "第12-15章",
    emotion: 85, fore: 75, rev: 80, locked: false },
];

// Make 分镜数据（Make 第 29-56 行）
export type ShotP = { id: string; label: string; text: string };
export type SbShot = {
  shot: number; ep: string; scene: string; dur: string;
  frameType: string; angle: string; movement: string;
  visual: string; chars: string; action: string;
  dialogue: string; narration: string; sfx: string;
  status: string;
  prompts: ShotP[];
};
export const SB_SHOTS: SbShot[] = [
  { shot: 1, ep: "E01", scene: "S01", dur: "15s", frameType: "大远景", angle: "平拍", movement: "固定",
    visual: "画廊外景，黄昏金光斜射玻璃幕墙", chars: "林沐", action: "提着画具袋缓步走近",
    dialogue: "", narration: "那是个普通的傍晚", sfx: "城市环境音·遥远的人声", status: "待审",
    prompts: [
      { id: "p1", label: "场景", text: "城市画廊外景，黄昏暖光，玻璃幕墙反光，现代感，电影质感，写实主义，街道人流虚化背景" },
      { id: "p2", label: "人物", text: "@林沐 东亚男性30岁，棉麻白衬衫，画具袋斜挎，画廊门口，黄昏逆光剪影，侧身缓步入画，电影感" },
      { id: "p3", label: "光效", text: "黄昏金光透过玻璃幕墙折射形成斑驳光晕，暖橙色调笼罩全景，浅景深，摄影级渲染" },
    ] },
  { shot: 2, ep: "E01", scene: "S01", dur: "8s", frameType: "近景", angle: "平拍", movement: "固定",
    visual: "林沐侧脸，若有所思地望向展厅", chars: "林沐", action: "停顿，深呼吸",
    dialogue: "", narration: "", sfx: "", status: "待审",
    prompts: [
      { id: "p1", label: "人物特写", text: "@林沐 东亚男性30岁，侧脸近景，白棉麻衬衫领口微松，黄昏逆光打亮轮廓，神情内敛若有所思，电影感" },
      { id: "p2", label: "眼神", text: "@林沐 男性眼部侧面特写，眼神深邃内敛带有旧日记忆的重量，睫毛被橙光勾边，高清，胶片质感" },
    ] },
  { shot: 3, ep: "E01", scene: "S02", dur: "12s", frameType: "中景", angle: "平拍", movement: "轻微手持",
    visual: "展厅内，苏玫站在《镜中人》前", chars: "苏玫", action: "近距离端详画作，微微侧头",
    dialogue: "", narration: "", sfx: "展厅轻音乐", status: "待审",
    prompts: [
      { id: "p1", label: "人物", text: "@苏玫 东亚女性28岁，藏青修身西装，丸子头，画廊展厅，暖色美术灯斜打，侧身端详大幅油画，精英气质" },
      { id: "p2", label: "场景", text: "现代画廊展厅内景，白色展墙，暖黄美术射灯，大幅油画《镜中人》占据画面背景，地面抛光石材反光" },
      { id: "p3", label: "构图", text: "@苏玫 背影望向油画，人物与画作形成视觉叙事对话，暖光从右侧打入制造戏剧阴影，手持轻微晃动增加真实感" },
    ] },
  { shot: 4, ep: "E01", scene: "S02", dur: "18s", frameType: "双人中景", angle: "平拍", movement: "固定",
    visual: "两人同时看向油画，画面构图形成对称", chars: "林沐·苏玫", action: "目光在画作上交汇，同时转向彼此",
    dialogue: "苏玫：这幅《镜中人》——是你画的？", narration: "", sfx: "", status: "已确认",
    prompts: [
      { id: "p1", label: "双人", text: "@林沐 与 @苏玫 双人中景对视，油画展厅，电影感对称构图，暖美术灯，都市精英风格，两人面部情绪层次清晰" },
      { id: "p2", label: "场景", text: "展厅《镜中人》油画居中，@林沐 立于左侧，@苏玫 立于右侧，三角构图，画作作为情节节点道具突出" },
      { id: "p3", label: "情绪", text: "微妙情感张力在 @林沐 与 @苏玫 之间流动，目光交汇的0.5秒定格，浅景深虚化背景，电影感，无台词静默" },
      { id: "p4", label: "特写", text: "@林沐 表情从惊愕到认出的细微变化，@苏玫 探究而略带挑衅的眼神，两人面部特写交叉剪辑，细腻表演捕捉" },
    ] },
];

// Make RBadge（Make 第 350-365 行）：角色标签切换
export function RBadge({ r, sel, on }: { r: ARole; sel: boolean; on: () => void }) {
  return (
    <button onClick={on}
      style={{ padding: "3px 9px", borderRadius: 20, fontSize: 10.5, fontWeight: sel ? 700 : 400, cursor: "pointer",
        background: sel ? "rgba(255,138,31,.15)" : "rgba(255,255,255,.05)",
        border: `1px solid ${sel ? "rgba(255,138,31,.35)" : "rgba(255,255,255,.1)"}`,
        color: sel ? "#FF8A1F" : "rgba(255,255,255,.4)",
        transition: "all .12s" }}>
      {r}
    </button>
  );
}

// 主题色（Make 第 309 行）：视频金 / 小说紫
export function accent(mode: "video" | "novel" | null): string {
  return mode === "video" ? "#FF8A1F" : "#A855F7";
}

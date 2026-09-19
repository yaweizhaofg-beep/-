// ═══════════════════════════════════════════════════════════════════════════════════
// StoryboardPage - 分镜工作台
// 设计来源：Figma Make App.tsx 中 StoryboardPage（gAlz60sm49QC7SQ6Kjb0X0）
// 还原版本：1:1 三栏布局 — 左集数导航 / 中间表格编辑 / 右资产面板
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import {
  AlertOctagon, AlertTriangle, ArrowDown, ArrowUp, CalendarClock,
  Check, CheckCircle, ChevronDown, ChevronLeft, Clock, Film,
  ImageIcon, Layers, Loader2, Mic2, PenLine, Play, Plus,
  Redo2, Search, Shield, Trash2, Undo2, Wrench, X, Zap,
  Download, Maximize2, Scissors, Video, MoreHorizontal,
} from "lucide-react";
import { colors, type PageId } from "../shared";

interface NavType { navigate: (p: PageId) => void; }

// ─── 本地 token（对齐 Make StoryboardPage 实际渲染色 C）─────────────────
const C = {
  bg: "#0E0F11", nav: "#111214", toolbar: "#151619",
  panel: "#18191D", input: "#202126",
  text: "#F2F2F3", sub: "#898D98", div: "#27292F",
  orange: "#FF6A1A", danger: "#E65C5C",
};
const gold = "#ffac30";
const GRID = "66px 1fr 108px 88px 88px 66px 78px 156px 72px";

// ─── 类型 ──────────────────────────────────────────────────────────────
type ShotStatus = "none" | "generating" | "done" | "failed";
type ShotPrompt = { id: string; label: string; text: string };
type Shot = {
  id: string; num: number; script: string;
  characters: string[]; scene: string | null; props: string[];
  voiceover: ShotStatus; imageStatus: ShotStatus; videoStatus: ShotStatus;
  prompts: ShotPrompt[];
};

// ─── 项目 + 章节上下文 ────────────────────────────────────────────────
type Episode = { id: string; label: string; shots: number; done: number };

const PROJECT = {
  name: "《镜像》", id: "PRJ-20260821-014", chapter: "第03集《回声》",
  storyboards: { total: 20, done: 12, running: 3, queued: 4, failed: 1 },
};

const EPISODES: Episode[] = [
  { id: "ep1", label: "第1集《缘起》", shots: 18, done: 14 },
  { id: "ep2", label: "第2集《迷途》", shots: 22, done: 8  },
  { id: "ep3", label: "第3集《回声》", shots: 20, done: 12 },
  { id: "ep4", label: "第4集《闪回》", shots: 16, done: 0  },
];

// ─── 镜头数据（mock；Make 实际为 SHOTS_INIT）────────────────────────────
const SHOTS_INIT: Shot[] = [
  {
    id: "SB-001", num: 1,
    script: "孙悟空 手持金箍棒腾空跃起，俯瞰远处火焰山，烈焰映红半边天际。\n「师父，前方便是火焰山，此番借芭蕉扇，非比寻常。」",
    characters: ["孙悟空"], scene: "火焰山外", props: ["金箍棒"],
    voiceover: "done", imageStatus: "done", videoStatus: "none",
    prompts: [
      { id: "p1", label: "主镜·人物", text: "东方古风体系，孙悟空腾空跃起，手持金箍棒，仰视构图，火焰山烈焰从下方蔓延，映红天际，英雄姿态，动感光影，写实风格，超高细节，电影质感。" },
      { id: "p2", label: "场景·火焰山", text: "中国古风奇幻场景，火焰山全景，滚滚红焰冲天，炙热空气扭曲感，远处山体通红，气势磅礴，黄昏时分，浓烟弥漫，高精度写实，4K质感渲染。" },
      { id: "p3", label: "特写·金箍棒", text: "金箍棒道具特写，金色如意纹路精雕细琢，法器光芒内敛，深色背景衬托，古典质感金属材质，细节纹理清晰，产品级渲染。" },
      { id: "p4", label: "氛围·远景", text: "火焰山远景全景，天空被火光映红，云层橙红翻涌，山脉轮廓隐约可见，史诗级自然奇观，中国山水画意境融合写实，宏大叙事感。" },
    ],
  },
  {
    id: "SB-002", num: 2,
    script: "唐僧 双手合十，神情凝重，立于山脚仰望前方滚滚火焰。\n「悟空，万事小心，早去早回。」",
    characters: ["唐僧"], scene: "山脚营地", props: [],
    voiceover: "none", imageStatus: "generating", videoStatus: "none",
    prompts: [
      { id: "p1", label: "主镜·人物", text: "东方古风，唐僧法师，双手合十，神情庄严凝重，站立构图，面向火焰山方向，飘逸袈裟在微风中轻扬，暖橙火光侧打在脸上，写实风格，人物主体清晰。" },
      { id: "p2", label: "场景·山脚营地", text: "古风营地场景，简朴行李包袱置于一旁，火把摇曳，远处火焰山的热浪感可见，傍晚暖色调，大地色系，质朴自然，氛围感强烈。" },
      { id: "p3", label: "情绪·特写", text: "唐僧脸部特写，慈悲而坚定的眼神遥望前方，眼中倒映橙红火光，眉眼略带忧虑，法师妆束，面容清秀，光影层次丰富，4K写实人物渲染。" },
    ],
  },
];

// ─── 资产 mock（角色/场景/道具/音色）──────────────────────────────────
const ASSETS: Record<string, { id: string; name: string; used: boolean }[]> = {
  "角色": [
    { id: "c1", name: "孙悟空", used: true },
    { id: "c2", name: "唐僧",   used: true },
    { id: "c3", name: "猪八戒", used: false },
    { id: "c4", name: "沙僧",   used: false },
  ],
  "场景": [
    { id: "s1", name: "火焰山外", used: true  },
    { id: "s2", name: "山脚营地", used: true  },
    { id: "s3", name: "天庭宫殿", used: false },
  ],
  "道具": [
    { id: "p1", name: "金箍棒", used: true  },
    { id: "p2", name: "芭蕉扇", used: false },
    { id: "p3", name: "袈裟",   used: false },
  ],
  "音色": [
    { id: "v1", name: "男声·磁性", used: true  },
    { id: "v2", name: "女声·温柔", used: false },
    { id: "v3", name: "少年·活泼", used: true  },
  ],
};

const charColor: Record<string, string> = {
  "孙悟空": "#FF6A1A", "唐僧": "#a78bfa", "猪八戒": "#fbbf24", "沙僧": "#38bdf8",
};

// ─── 模型列表（mock，对齐 Make TEXT/IMAGE/VIDEO_MODELS）────────────────
const TEXT_MODELS = [
  { name: "星核拆镜·极速", sub: "DeepSeek V4 Flash", price: "¥0.014/次" },
  { name: "星核拆镜·深度", sub: "DeepSeek V4 Pro",   price: "¥0.042/次" },
  { name: "星核拆镜·快写", sub: "千问3.6 Flash",      price: "¥0.074/次", tag: "推荐" },
];
const IMAGE_MODELS = [
  { name: "星核绘图·标准", sub: "GPT-Image-2 · 普通", price: "¥0.03/张" },
  { name: "星核快绘·高清", sub: "GPT-Image-2 · 2K",  price: "¥0.06/张", tag: "推荐" },
  { name: "星核快绘·超清", sub: "GPT-Image-2 · 4K",  price: "¥0.06/张" },
];
const VIDEO_MODELS = [
  { name: "极速成片·高清", sub: "Seedance 2.0 Fast · 720p", price: "¥0.53/秒起", tag: "推荐" },
  { name: "质感成片·高清", sub: "Seedance 2.0 · 720p",      price: "¥0.657/秒起" },
  { name: "电影成片·高清", sub: "Seedance 2.5 · 720p",      price: "¥1.512/秒" },
];

const STYLES = ["3D二次元", "写实风格", "水墨国风", "赛博朋克", "欧美漫画"];
const RATIOS = ["16:9", "9:16", "1:1", "4:3", "3:4", "2:3"];

// ─── StoryboardPage ───────────────────────────────────────────────────
export default function StoryboardPage({ navigate }: NavType) {
  const [shots, setShots] = useState<Shot[]>(SHOTS_INIT);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeShot, setActiveShot] = useState("SB-001");
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set(["SB-001"]));
  const [assetTab, setAssetTab] = useState<"角色" | "场景" | "道具" | "音色">("角色");
  const [assetSearch, setAssetSearch] = useState("");
  const [assetFilter, setAssetFilter] = useState<"全部" | "已使用" | "未使用">("全部");

  // 项目上下文
  const [activeEpId, setActiveEpId] = useState("ep3");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assetPanelCollapsed, setAssetPanelCollapsed] = useState(false);

  // 工具栏
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("写实风格");
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBatchMenu, setShowBatchMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // 项目工具下拉
  const [showProjectToolMenu, setShowProjectToolMenu] = useState(false);

  // 弹窗
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showUnifyModal, setShowUnifyModal] = useState(false);
  const [showCostConfirm, setShowCostConfirm] = useState(false);

  // 生成锁 mock（仅团队态显示）
  const [genLock] = useState<{ holder: string; since: string } | null>(
    { holder: "林子墨", since: "3分钟前" }
  );
  const isTeamMode = true;
  const isAdmin = true;

  // 统一设置（文本/图片/视频）
  const [selectedTextModel, setSelectedTextModel] = useState("星核拆镜·快写");
  const [selectedImageModel, setSelectedImageModel] = useState("星核快绘·高清");
  const [selectedVideoModel, setSelectedVideoModel] = useState("极速成片·高清");
  const [openSection, setOpenSection] = useState<"text" | "image" | "video">("text");

  // ─── 操作 ──────────────────────────────────────────────────────────────
  const allSelected = shots.length > 0 && selected.size === shots.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(shots.map(s => s.id)));
  const toggleShot = (id: string) => setSelected(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const cycleStatus = (id: string, field: "voiceover" | "imageStatus" | "videoStatus") => {
    const cycle: ShotStatus[] = ["none", "generating", "done", "failed"];
    setShots(prev => prev.map(s => s.id === id ? { ...s, [field]: cycle[(cycle.indexOf(s[field]) + 1) % 4] } : s));
  };

  const deleteShot = (id: string) => {
    const target = shots.find(s => s.id === id);
    if (!target) return;
    if (!confirm(`确认删除第 ${target.num} 镜？此操作不可撤销。`)) return;
    setShots(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, num: i + 1 })));
  };
  const moveShot = (id: string, dir: -1 | 1) => {
    setShots(prev => {
      const idx = prev.findIndex(s => s.id === id), to = idx + dir;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev]; [next[idx], next[to]] = [next[to], next[idx]];
      return next.map((s, i) => ({ ...s, num: i + 1 }));
    });
  };
  const togglePrompts = (id: string) => setExpandedPrompts(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const addShot = () => setShots(prev => [...prev, {
    id: `SB-${String(prev.length + 1).padStart(3, "0")}`, num: prev.length + 1,
    script: "", characters: [], scene: null, props: [],
    voiceover: "none", imageStatus: "none", videoStatus: "none",
    prompts: [{ id: "p1", label: "主镜提示词", text: "" }],
  }]);

  const addAsset = (name: string) => setShots(prev => prev.map(s => {
    if (s.id !== activeShot) return s;
    if (assetTab === "角色" && !s.characters.includes(name)) return { ...s, characters: [...s.characters, name] };
    if (assetTab === "场景") return { ...s, scene: name };
    if (assetTab === "道具" && !s.props.includes(name)) return { ...s, props: [...s.props, name] };
    return s;
  }));

  const filteredAssets = () => {
    let list = ASSETS[assetTab] ?? [];
    if (assetSearch) list = list.filter(a => a.name.includes(assetSearch));
    if (assetFilter === "已使用") list = list.filter(a => a.used);
    if (assetFilter === "未使用") list = list.filter(a => !a.used);
    return list;
  };

  // ─── 状态映射 ────────────────────────────────────────────────────────
  const statusInfo = (s: ShotStatus, kind: "img" | "vid" | "voice") => ({
    none:       { color: C.sub,     bg: "transparent",         label: kind === "voice" ? "配音" : kind === "img" ? "分镜图" : "分镜视频" },
    generating: { color: "#60a5fa", bg: "rgba(96,165,250,.1)", label: "生成中…" },
    done:       { color: "#34d399", bg: "rgba(52,211,153,.1)", label: kind === "voice" ? "已完成" : kind === "img" ? "图片完成" : "视频完成" },
    failed:     { color: C.danger,  bg: "rgba(230,92,92,.1)",  label: "失败" },
  }[s]);

  // ─── 样式工具 ────────────────────────────────────────────────────────
  const btnBase = { border: "none" as const, cursor: "pointer" as const, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" };

  // ─── 渲染 ────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", fontFamily: "Inter, PingFang SC, system-ui, sans-serif", fontSize: 13,
      background: "linear-gradient(160deg, #09090D 0%, #0C0D12 55%, #090C10 100%)" }}
      onClick={() => { setShowBatchMenu(false); setShowRatioMenu(false); setShowProjectToolMenu(false); setShowExportMenu(false); }}>

      {/* ── Left sidebar（集数导航 + 本集进度） ── */}
      <div style={{ width: sidebarCollapsed ? 40 : 188, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden", transition: "width .2s ease",
        background: "rgba(11,12,16,0.85)", backdropFilter: "blur(24px) saturate(140%)",
        borderRight: "1px solid rgba(255,255,255,0.07)", position: "relative" }}>

        {/* Collapse toggle */}
        <button onClick={() => setSidebarCollapsed(v => !v)}
          style={{ position: "absolute", top: 12, right: -11, zIndex: 10, width: 22, height: 22, borderRadius: "50%", background: C.panel, border: `1px solid ${C.div}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.sub, flexShrink: 0 }}>
          <ChevronLeft style={{ width: 11, height: 11, transform: sidebarCollapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }} />
        </button>

        {sidebarCollapsed ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 48, gap: 6 }}>
            {EPISODES.map(ep => {
              const isActive = activeEpId === ep.id;
              return (
                <button key={ep.id} onClick={() => setActiveEpId(ep.id)} title={ep.label}
                  style={{ width: 24, height: 24, borderRadius: 6, border: "none", cursor: "pointer", background: isActive ? C.orange : "rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isActive ? "white" : C.sub }}>{ep.id.replace("ep", "")}</span>
                </button>
              );
            })}
          </div>
        ) : (<>
          {/* Project header */}
          <div style={{ padding: "14px 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => navigate("team-assets")}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: C.sub, fontSize: 11.5, cursor: "pointer", padding: "0 0 9px 0", transition: "color .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.text; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.sub; }}>
              <ChevronLeft style={{ width: 12, height: 12 }} />返回资产
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(255,106,26,0.15)", border: "1px solid rgba(255,106,26,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Film style={{ width: 12, height: 12, color: C.orange }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{PROJECT.name}</div>
            </div>
          </div>

          {/* Episode list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 6px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 6px", marginBottom: 5 }}>分集</div>
            {EPISODES.map(ep => {
              const isActive = activeEpId === ep.id;
              const pct = Math.round((ep.done / ep.shots) * 100);
              return (
                <button key={ep.id} onClick={() => setActiveEpId(ep.id)}
                  style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4, padding: "7px 9px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left", marginBottom: 2, transition: "all .15s",
                    background: isActive ? "rgba(255,106,26,0.12)" : "transparent",
                    outline: isActive ? "1px solid rgba(255,106,26,0.22)" : "1px solid transparent" }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11.5, fontWeight: isActive ? 600 : 400, color: isActive ? C.orange : C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>{ep.label}</span>
                    <span style={{ fontSize: 10, color: isActive ? C.orange : C.sub, flexShrink: 0 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 2, borderRadius: 1, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: isActive ? C.orange : "rgba(255,255,255,0.25)", borderRadius: 1, transition: "width .3s" }} />
                  </div>
                </button>
              );
            })}
            <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "6px 9px", borderRadius: 8, border: "1.5px dashed rgba(255,255,255,0.1)", background: "none", color: C.sub, fontSize: 11, cursor: "pointer", marginTop: 3, transition: "all .15s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,106,26,0.4)"; el.style.color = C.orange; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.1)"; el.style.color = C.sub; }}>
              <Plus style={{ width: 11, height: 11 }} />新增分集
            </button>
          </div>

          {/* Progress stats */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 10, color: C.sub, marginBottom: 6, fontWeight: 500 }}>本集进度</div>
            <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
              {[
                { v: PROJECT.storyboards.done,    c: "#34d399", label: "完成" },
                { v: PROJECT.storyboards.running, c: "#60a5fa", label: "生成" },
                { v: PROJECT.storyboards.queued,  c: C.sub,     label: "排队" },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "5px 2px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 9, color: C.sub, marginTop: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.round((PROJECT.storyboards.done / PROJECT.storyboards.total) * 100)}%`, background: `linear-gradient(90deg, ${C.orange}, #ff9d42)`, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 10, color: C.sub, marginTop: 4, textAlign: "right" }}>
              {PROJECT.storyboards.done}/{PROJECT.storyboards.total} 镜
            </div>
          </div>
        </>)}
      </div>

      {/* ── Center column ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Toolbar 56px */}
        <div style={{ height: 56, flexShrink: 0, borderBottom: `1px solid ${C.div}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 8,
          background: "rgba(255,255,255,0.02)", backdropFilter: "blur(16px)" }}>
          {/* Left: 面包屑 + 高频设置 */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, overflow: "hidden" }}>
            <button onClick={() => navigate("team-assets")}
              style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: C.sub, fontSize: 12, cursor: "pointer", padding: "0 6px 0 0", transition: "color .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.text; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.sub; }}>
              <ChevronLeft style={{ width: 12, height: 12 }} />资产
            </button>
            <span style={{ color: C.div }}>/</span>
            <span style={{ fontSize: 12, color: C.text, fontWeight: 600, whiteSpace: "nowrap" }}>{PROJECT.name}</span>
            <span style={{ color: C.div }}>/</span>
            <span style={{ fontSize: 12, color: C.text, whiteSpace: "nowrap" }}>{EPISODES.find(e => e.id === activeEpId)?.label}</span>
            <span style={{ fontSize: 11, color: C.sub, paddingLeft: 6, whiteSpace: "nowrap" }}>· {shots.length} 镜 · 已完成 {PROJECT.storyboards.done}/{PROJECT.storyboards.total}</span>

            <div style={{ width: 1, height: 18, background: C.div, margin: "0 4px" }} />

            <button onClick={e => { e.stopPropagation(); setShowStyleModal(true); }}
              style={{ ...btnBase, gap: 5, padding: "0 10px", height: 32, borderRadius: 8, border: `1px solid ${C.div}`, background: C.input, color: C.text, fontSize: 12, flexShrink: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.orange; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.div; }}>
              <span style={{ color: C.sub }}>风格：</span>{selectedStyle}
              <ChevronDown style={{ width: 11, height: 11, color: C.sub }} />
            </button>
          </div>

          {/* Right: 比例 + 导出 + 更多 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {/* Aspect ratio picker */}
            <div style={{ position: "relative" }}>
              <button onClick={e => { e.stopPropagation(); setShowRatioMenu(v => !v); }}
                style={{ ...btnBase, gap: 5, padding: "0 10px", height: 32, borderRadius: 8, border: `1px solid ${showRatioMenu ? C.orange : C.div}`, background: C.input, color: C.text, fontSize: 12, minWidth: 72 }}>
                {selectedRatio}<ChevronDown style={{ width: 11, height: 11, color: C.sub }} />
              </button>
              {showRatioMenu && (
                <div onClick={e => e.stopPropagation()}
                  style={{ position: "absolute", top: 38, right: 0, background: C.panel, border: `1px solid ${C.div}`, borderRadius: 12, padding: "6px 0", zIndex: 300, minWidth: 160, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
                  {RATIOS.map(r => {
                    const isActive = selectedRatio === r;
                    return (
                      <button key={r} onClick={() => { setSelectedRatio(r); setShowRatioMenu(false); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "8px 14px", background: isActive ? "rgba(255,140,32,.1)" : "transparent", border: "none", cursor: "pointer", transition: "background .15s" }}>
                        <div style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <div style={{ width: 20, height: 14, border: `2px solid ${isActive ? C.orange : "rgba(255,255,255,.25)"}`, borderRadius: 2, background: isActive ? "rgba(255,140,32,.12)" : "rgba(255,255,255,.04)" }} />
                        </div>
                        <span style={{ fontSize: 13, color: isActive ? C.orange : C.text, fontWeight: isActive ? 600 : 400 }}>{r}</span>
                        {isActive && <Check style={{ width: 13, height: 13, color: C.orange, marginLeft: "auto" }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Export dropdown */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button onClick={e => { e.stopPropagation(); setShowExportMenu(v => !v); }}
                style={{ ...btnBase, gap: 5, padding: "0 11px", height: 32, borderRadius: 8, border: `1px solid ${showExportMenu ? C.orange : C.div}`, background: showExportMenu ? "rgba(255,106,26,.08)" : C.input, color: showExportMenu ? C.orange : C.text, fontSize: 12 }}>
                <Download style={{ width: 12, height: 12 }} />导出
                <ChevronDown style={{ width: 10, height: 10, color: C.sub, transform: showExportMenu ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .15s" }} />
              </button>
              {showExportMenu && (
                <div onClick={e => e.stopPropagation()}
                  style={{ position: "absolute", top: 38, right: 0, zIndex: 300, background: C.panel, border: `1px solid ${C.div}`, borderRadius: 12, padding: "5px", minWidth: 168, boxShadow: "0 12px 40px rgba(0,0,0,.6)" }}>
                  {([
                    { icon: Video,    label: "导出视频", sub: "合并输出 MP4" },
                    { icon: Scissors, label: "导出剪映", sub: "导出剪映草稿包" },
                  ] as { icon: React.ElementType; label: string; sub: string }[]).map(({ icon: Icon, label, sub }) => (
                    <button key={label} onClick={() => setShowExportMenu(false)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", transition: "background .12s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.06)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,.06)", border: `1px solid ${C.div}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon style={{ width: 14, height: 14, color: C.orange }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{label}</div>
                        <div style={{ fontSize: 10.5, color: C.sub, marginTop: 1 }}>{sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 更多：撤销/重做/连续预览/生成记录 */}
            <div style={{ position: "relative" }}>
              <button onClick={e => { e.stopPropagation(); setShowMoreMenu(v => !v); }}
                style={{ ...btnBase, width: 32, height: 32, borderRadius: 8, border: `1px solid ${showMoreMenu ? C.orange : C.div}`, background: showMoreMenu ? "rgba(255,106,26,.08)" : C.input, color: showMoreMenu ? C.orange : C.sub, fontSize: 12 }}
                title="更多操作">
                <MoreHorizontal style={{ width: 14, height: 14 }} />
              </button>
              {showMoreMenu && (
                <div onClick={e => e.stopPropagation()}
                  style={{ position: "absolute", top: 38, right: 0, zIndex: 300, background: C.panel, border: `1px solid ${C.div}`, borderRadius: 12, padding: 5, minWidth: 168, boxShadow: "0 12px 40px rgba(0,0,0,.6)" }}>
                  {([
                    { Icon: Undo2,      label: "撤销",          tip: "Ctrl/Cmd + Z" },
                    { Icon: Redo2,      label: "重做",          tip: "Ctrl/Cmd + Shift + Z" },
                    { Icon: Play,       label: "连续预览",      tip: "按集连续播放分镜" },
                    { Icon: Clock,      label: "生成记录",      tip: "查看历史生成任务" },
                  ] as { Icon: React.ElementType; label: string; tip: string }[]).map(({ Icon, label, tip }) => (
                    <button key={label} onClick={() => setShowMoreMenu(false)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.06)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <Icon style={{ width: 14, height: 14, color: C.sub }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, color: C.text }}>{label}</div>
                        <div style={{ fontSize: 10.5, color: C.sub, marginTop: 1 }}>{tip}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Generation lock banner (团队模式才显示) ── */}
        {genLock && isTeamMode && (
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "7px 14px",
            background: "rgba(251,191,36,.06)", borderBottom: "1px solid rgba(251,191,36,.18)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fbbf24", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "rgba(251,191,36,.9)", flex: 1 }}>
              <strong>{genLock.holder}</strong> 正在生成 · {genLock.since} · 其他成员暂时只能查看
            </span>
            {isAdmin && (
              <button style={{ fontSize: 11, fontWeight: 600, color: "#fbbf24", background: "rgba(251,191,36,.12)",
                border: "1px solid rgba(251,191,36,.3)", padding: "3px 10px", borderRadius: 7, cursor: "pointer", whiteSpace: "nowrap" }}>
                管理员强制释放
              </button>
            )}
          </div>
        )}

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: GRID, height: 36, flexShrink: 0, borderBottom: `1px solid ${C.div}`, alignItems: "center",
          background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", borderRight: `1px solid ${C.div}`, height: "100%" }}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ accentColor: C.orange, width: 13, height: 13, cursor: "pointer" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: C.sub, letterSpacing: "0.03em" }}>镜号</span>
          </div>
          {([["剧本", true], ["出场人物", false], ["场景", false], ["道具", false], ["配音", false], ["分镜图片", true], ["分镜视频", true], ["操作", false]] as [string, boolean][]).map(([label, br]) => (
            <div key={label} style={{ padding: "0 8px", fontSize: 11, fontWeight: 600, color: C.sub, letterSpacing: "0.03em", height: "100%", display: "flex", alignItems: "center", borderRight: br ? `1px solid ${C.div}` : "none", whiteSpace: "nowrap" }}>{label}</div>
          ))}
        </div>

        {/* Shot list */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {shots.map((shot, idx) => {
            const isActive = activeShot === shot.id;
            const isSel = selected.has(shot.id);
            const vi = statusInfo(shot.voiceover, "voice");
            const ii = statusInfo(shot.imageStatus, "img");

            const isPromptsOpen = expandedPrompts.has(shot.id);
            return (
              <div key={shot.id} style={{ borderBottom: `1px solid ${C.div}`, background: isSel ? "rgba(255,106,26,.05)" : isActive ? "rgba(255,106,26,.02)" : "transparent", transition: "background .1s", cursor: "default" }}
                onClick={() => setActiveShot(shot.id)}>
                <div style={{ display: "grid", gridTemplateColumns: GRID, minHeight: 160 }}>

                  {/* Col 1: Select + num */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRight: `1px solid ${C.div}` }}>
                    <input type="checkbox" checked={isSel} onChange={e => { e.stopPropagation(); toggleShot(shot.id); }} style={{ accentColor: C.orange, width: 13, height: 13, cursor: "pointer" }} />
                    <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: isActive ? C.orange : "rgba(255,255,255,.08)", color: isActive ? "white" : C.sub, flexShrink: 0 }}>{shot.num}</div>
                    <button style={{ ...btnBase, background: "none", border: "none", color: "rgba(255,255,255,.2)", padding: 0 }}>
                      <PenLine style={{ width: 11, height: 11 }} />
                    </button>
                  </div>

                  {/* Col 2: Script + prompts toggle */}
                  <div style={{ padding: "8px 10px", borderRight: `1px solid ${C.div}`, display: "flex", flexDirection: "column", gap: 5 }}>
                    <textarea value={shot.script}
                      onChange={e => { e.stopPropagation(); setShots(prev => prev.map(s => s.id === shot.id ? { ...s, script: e.target.value } : s)); }}
                      placeholder="输入镜头剧本描述和对白…"
                      style={{ width: "100%", minHeight: 96, background: C.input, border: "1px solid transparent", borderRadius: 8, padding: "7px 9px", color: C.text, fontSize: 12.5, lineHeight: 1.6, resize: "none", outline: "none", fontFamily: "inherit", transition: "border-color .15s", boxSizing: "border-box" }}
                      onFocus={e => { e.stopPropagation(); e.currentTarget.style.borderColor = "rgba(255,106,26,.4)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "transparent"; }} />
                    <button onClick={e => { e.stopPropagation(); togglePrompts(shot.id); }}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 6, border: `1px solid ${isPromptsOpen ? "rgba(255,106,26,.45)" : "rgba(255,255,255,.1)"}`, background: isPromptsOpen ? "rgba(255,106,26,.08)" : "rgba(255,255,255,.03)", color: isPromptsOpen ? C.orange : C.sub, fontSize: 11, cursor: "pointer", transition: "all .15s", alignSelf: "flex-start" }}>
                      <Layers style={{ width: 10, height: 10 }} />
                      提示词 ({shot.prompts.length})
                      <ChevronDown style={{ width: 9, height: 9, transform: isPromptsOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .18s" }} />
                    </button>
                  </div>

                  {/* Col 3: 出场人物 */}
                  <div style={{ padding: "6px 6px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, width: "100%", alignItems: "center" }}>
                      {shot.characters.slice(0, 2).map(c => (
                        <div key={c} title={c} style={{ width: 30, height: 30, borderRadius: 8, background: charColor[c] ?? C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white" }}>{c[0]}</div>
                      ))}
                      {shot.characters.length === 0 && <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,.04)", border: "1px dashed rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "rgba(255,255,255,.15)", fontSize: 14 }}>—</span></div>}
                    </div>
                    <button style={{ width: 20, height: 20, borderRadius: 5, border: "1px dashed rgba(255,255,255,.14)", background: "transparent", color: C.sub, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.orange; el.style.color = C.orange; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,.14)"; el.style.color = C.sub; }}>+</button>
                  </div>

                  {/* Col 4: 场景 */}
                  <div style={{ padding: "6px 6px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    {shot.scene ? (
                      <div title={shot.scene} style={{ width: 30, height: 30, borderRadius: 8, background: "#1a3050", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#38bdf8" }}>景</div>
                    ) : (
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,.04)", border: "1px dashed rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "rgba(255,255,255,.15)", fontSize: 14 }}>—</span></div>
                    )}
                    {shot.scene && <span style={{ fontSize: 9, color: "#38bdf8", textAlign: "center", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shot.scene}</span>}
                    <button style={{ width: 20, height: 20, borderRadius: 5, border: "1px dashed rgba(255,255,255,.14)", background: "transparent", color: C.sub, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.orange; el.style.color = C.orange; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,.14)"; el.style.color = C.sub; }}>+</button>
                  </div>

                  {/* Col 5: 道具 */}
                  <div style={{ padding: "6px 6px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    {shot.props.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, width: "100%", alignItems: "center" }}>
                        {shot.props.slice(0, 2).map(p => (
                          <span key={p} style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, background: "rgba(255,255,255,.06)", color: C.sub, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p}</span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,.04)", border: "1px dashed rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "rgba(255,255,255,.15)", fontSize: 14 }}>—</span></div>
                    )}
                    <button style={{ width: 20, height: 20, borderRadius: 5, border: "1px dashed rgba(255,255,255,.14)", background: "transparent", color: C.sub, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.orange; el.style.color = C.orange; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,.14)"; el.style.color = C.sub; }}>+</button>
                  </div>

                  {/* Col 6: 配音 */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <button onClick={e => { e.stopPropagation(); cycleStatus(shot.id, "voiceover"); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 5px", borderRadius: 8, border: "none", background: shot.voiceover !== "none" ? vi.bg : "rgba(255,255,255,.03)", cursor: "pointer", width: 48, transition: "all .15s" }}>
                      {shot.voiceover === "generating" ? <Loader2 style={{ width: 14, height: 14, color: "#60a5fa", animation: "spin 1s linear infinite" }} /> :
                        shot.voiceover === "done" ? <CheckCircle style={{ width: 14, height: 14, color: "#34d399" }} /> :
                          shot.voiceover === "failed" ? <AlertTriangle style={{ width: 14, height: 14, color: C.danger }} /> :
                            <Mic2 style={{ width: 14, height: 14, color: C.sub }} />}
                      <span style={{ fontSize: 9, fontWeight: 500, color: vi.color, lineHeight: 1, textAlign: "center" }}>{vi.label}</span>
                    </button>
                  </div>

                  {/* Col 7: 分镜图片 */}
                  <div style={{ borderRight: `1px solid ${C.div}`, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 6px" }}>
                    {shot.imageStatus === "done" ? (
                      <button style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 7, overflow: "hidden", border: "1px solid rgba(52,211,153,.2)", background: "linear-gradient(135deg,#0d2018,#163326)", cursor: "pointer", padding: 0 }}>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#0d2018,#163326,#0a1a10)" }} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Maximize2 style={{ width: 14, height: 14, color: "rgba(255,255,255,.6)" }} />
                        </div>
                        <div style={{ position: "absolute", bottom: 3, right: 4, fontSize: 8, color: "rgba(52,211,153,.8)", fontWeight: 600 }}>预览</div>
                      </button>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); cycleStatus(shot.id, "imageStatus"); }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 5px", borderRadius: 8, border: "none", background: shot.imageStatus !== "none" ? ii.bg : "rgba(255,255,255,.03)", cursor: "pointer", width: 58, transition: "all .15s" }}>
                        {shot.imageStatus === "generating" ? <Loader2 style={{ width: 14, height: 14, color: "#60a5fa", animation: "spin 1s linear infinite" }} /> :
                          shot.imageStatus === "failed" ? <AlertTriangle style={{ width: 14, height: 14, color: C.danger }} /> :
                            <ImageIcon style={{ width: 14, height: 14, color: C.sub }} />}
                        <span style={{ fontSize: 9, fontWeight: 500, color: ii.color, lineHeight: 1, textAlign: "center" }}>
                          {shot.imageStatus === "none" ? "生成图片" : shot.imageStatus === "generating" ? "生成中…" : "失败"}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Col 8: 分镜视频 */}
                  <div style={{ borderRight: `1px solid ${C.div}`, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 10px" }}>
                    <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 8, overflow: "hidden", position: "relative",
                      background: shot.videoStatus === "done" ? "linear-gradient(135deg,#0d1a2e 0%,#1a2d4a 50%,#0a1520 100%)"
                        : shot.videoStatus === "generating" ? "rgba(96,165,250,.06)"
                          : shot.videoStatus === "failed" ? "rgba(239,68,68,.06)"
                            : "rgba(255,255,255,.04)",
                      border: `1px solid ${shot.videoStatus === "done" ? "rgba(52,211,153,.2)" : shot.videoStatus === "generating" ? "rgba(96,165,250,.2)" : shot.videoStatus === "failed" ? "rgba(239,68,68,.2)" : "rgba(255,255,255,.08)"}` }}>

                      {shot.videoStatus === "done" && <>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#0d1a2e,#1e3a5f,#0a1520)", opacity: 0.9 }} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <button style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}>
                            <Play style={{ width: 12, height: 12, color: "white", marginLeft: 1 }} />
                          </button>
                        </div>
                        <div style={{ position: "absolute", bottom: 4, right: 5, fontSize: 8.5, color: "rgba(255,255,255,.35)", fontWeight: 600 }}>00:{(shot.num * 3 + 12).toString().padStart(2, "0")}</div>
                      </>}

                      {shot.videoStatus === "generating" && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
                          <Loader2 style={{ width: 18, height: 18, color: "#60a5fa", animation: "spin 1s linear infinite" }} />
                          <span style={{ fontSize: 9, color: "#60a5fa", fontWeight: 500 }}>生成中…</span>
                        </div>
                      )}

                      {shot.videoStatus === "failed" && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
                          <AlertTriangle style={{ width: 16, height: 16, color: C.danger }} />
                          <span style={{ fontSize: 9, color: C.danger, fontWeight: 500 }}>生成失败</span>
                          <button onClick={e => { e.stopPropagation(); cycleStatus(shot.id, "videoStatus"); }}
                            style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, border: `1px solid ${C.danger}`, background: "transparent", color: C.danger, cursor: "pointer" }}>重试</button>
                        </div>
                      )}

                      {shot.videoStatus === "none" && (
                        <button onClick={e => { e.stopPropagation(); cycleStatus(shot.id, "videoStatus"); }}
                          style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, background: "none", border: "none", cursor: "pointer", width: "100%", height: "100%" }}>
                          <Film style={{ width: 16, height: 16, color: "rgba(255,255,255,.2)" }} />
                          <span style={{ fontSize: 9.5, color: "rgba(255,255,255,.3)", fontWeight: 500 }}>生成视频</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Col 9: 操作 */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    {([
                      { Icon: ArrowUp,   fn: () => moveShot(shot.id, -1), dis: idx === 0,                 tip: "上移",   danger: false, accent: false },
                      { Icon: ArrowDown, fn: () => moveShot(shot.id,  1), dis: idx === shots.length - 1,  tip: "下移",   danger: false, accent: false },
                      { Icon: Download,  fn: () => {},                     dis: false,                      tip: "导出",   danger: false, accent: true  },
                      { Icon: Trash2,    fn: () => deleteShot(shot.id),   dis: false,                      tip: "删除",   danger: true,  accent: false },
                    ]).map(({ Icon, fn, dis, tip, danger, accent }) => (
                      <button key={tip} onClick={e => { e.stopPropagation(); if (!dis) fn(); }} title={tip} disabled={dis}
                        style={{ width: 26, height: 26, borderRadius: 7, border: "none", background: "transparent",
                          color: dis ? "rgba(255,255,255,.12)" : danger ? "rgba(230,92,92,.5)" : accent ? "rgba(255,138,31,.5)" : "rgba(255,255,255,.28)",
                          cursor: dis ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
                        onMouseEnter={e => { if (!dis) { const el = e.currentTarget as HTMLElement; el.style.background = danger ? "rgba(230,92,92,.1)" : accent ? "rgba(255,138,31,.1)" : "rgba(255,255,255,.07)"; el.style.color = danger ? C.danger : accent ? C.orange : C.text; } }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = dis ? "rgba(255,255,255,.12)" : danger ? "rgba(230,92,92,.5)" : accent ? "rgba(255,138,31,.5)" : "rgba(255,255,255,.28)"; }}>
                        <Icon style={{ width: 13, height: 13 }} />
                      </button>
                    ))}
                  </div>
                </div>
                {/* Prompts expandable panel */}
                {isPromptsOpen && (
                  <div onClick={e => e.stopPropagation()}
                    style={{ borderTop: `1px solid ${C.div}`, background: "rgba(255,106,26,.025)", padding: "10px 16px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.orange, letterSpacing: "0.04em" }}>AI 生成提示词组</span>
                      <button onClick={() => {
                        const newPrompt: ShotPrompt = { id: `p${shot.prompts.length + 1}`, label: `提示词 ${shot.prompts.length + 1}`, text: "" };
                        setShots(prev => prev.map(s => s.id === shot.id ? { ...s, prompts: [...s.prompts, newPrompt] } : s));
                      }}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", fontSize: 10.5, borderRadius: 5, border: "1px solid rgba(255,106,26,.3)", background: "rgba(255,106,26,.08)", color: C.orange, cursor: "pointer" }}>
                        <Plus style={{ width: 9, height: 9 }} />新增提示词
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                      {shot.prompts.map((prompt, pi) => (
                        <div key={prompt.id} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 9, padding: "8px 10px", position: "relative" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.orange, background: "rgba(255,106,26,.12)", padding: "1px 7px", borderRadius: 4 }}>{prompt.label}</span>
                            {shot.prompts.length > 1 && (
                              <button onClick={() => setShots(prev => prev.map(s => s.id === shot.id ? { ...s, prompts: s.prompts.filter((_, i) => i !== pi) } : s))}
                                style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: 4, border: "none", background: "rgba(230,92,92,.08)", color: "rgba(230,92,92,.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <X style={{ width: 10, height: 10 }} />
                              </button>
                            )}
                          </div>
                          <textarea value={prompt.text}
                            onChange={e => setShots(prev => prev.map(s => s.id === shot.id ? { ...s, prompts: s.prompts.map((p, i) => i === pi ? { ...p, text: e.target.value } : p) } : s))}
                            placeholder="输入 AI 生成提示词…"
                            rows={3}
                            style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "rgba(255,255,255,.7)", fontSize: 11.5, lineHeight: 1.7, resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {shots.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 64, gap: 12, color: C.sub }}>
              <Film style={{ width: 38, height: 38, opacity: .25 }} />
              <span style={{ fontSize: 14 }}>暂无镜头，点击下方按钮新增</span>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{ height: 54, flexShrink: 0, borderTop: `1px solid ${C.div}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px",
          background: "rgba(255,255,255,0.02)", backdropFilter: "blur(16px)" }}>
          <button onClick={addShot}
            style={{ ...btnBase, gap: 6, padding: "0 14px", height: 34, borderRadius: 8, border: `1px solid ${C.div}`, background: "transparent", color: C.text, fontSize: 12.5 }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.orange; el.style.color = C.orange; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.div; el.style.color = C.text; }}>
            <Plus style={{ width: 13, height: 13 }} />新增镜头
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {selected.size > 0 ? (
              <>
                <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>已选 {selected.size} 镜</span>
                <button onClick={() => setSelected(new Set())}
                  style={{ fontSize: 11, color: C.sub, background: "none", border: "none", cursor: "pointer", padding: "4px 6px" }}>
                  清除选择
                </button>
              </>
            ) : (
              <span style={{ fontSize: 12, color: C.sub }}>勾选镜头后启用批量操作</span>
            )}

            <div style={{ position: "relative", display: "flex" }}>
              <button onClick={() => selected.size > 0 ? setShowCostConfirm(true) : null}
                disabled={selected.size === 0}
                style={{ ...btnBase, gap: 6, padding: "0 14px", height: 34, borderRadius: "8px 0 0 8px", border: "none",
                  background: selected.size === 0 ? "rgba(255,255,255,.06)" : `linear-gradient(135deg,${C.orange},#cc3300)`,
                  color: selected.size === 0 ? C.sub : "white", fontSize: 12.5, fontWeight: 600,
                  cursor: selected.size === 0 ? "not-allowed" : "pointer", opacity: selected.size === 0 ? 0.5 : 1 }}>
                <Zap style={{ width: 13, height: 13 }} />批量生成
              </button>
              <button onClick={e => { e.stopPropagation(); if (selected.size > 0) setShowBatchMenu(!showBatchMenu); }}
                disabled={selected.size === 0}
                style={{ ...btnBase, width: 30, height: 34, borderRadius: "0 8px 8px 0", border: "none", borderLeft: selected.size === 0 ? "1px solid rgba(255,255,255,.06)" : "1px solid rgba(255,255,255,.2)",
                  background: selected.size === 0 ? "rgba(255,255,255,.06)" : `linear-gradient(135deg,#e05510,#bb2d00)`,
                  color: selected.size === 0 ? C.sub : "white", cursor: selected.size === 0 ? "not-allowed" : "pointer", opacity: selected.size === 0 ? 0.5 : 1 }}>
                <ChevronDown style={{ width: 12, height: 12 }} />
              </button>
              {showBatchMenu && (
                <div onClick={e => e.stopPropagation()} style={{ position: "absolute", bottom: 40, right: 0, zIndex: 300, background: "#1c1d22", border: `1px solid ${C.div}`, borderRadius: 10, padding: 4, minWidth: 160, boxShadow: "0 -8px 32px rgba(0,0,0,.6)" }}>
                  {["生成全部分镜图", "生成全部配音", "生成全部视频"].map(label => (
                    <button key={label} onClick={() => { setShowBatchMenu(false); setShowCostConfirm(true); }}
                      style={{ display: "flex", width: "100%", padding: "9px 12px", borderRadius: 7, border: "none", background: "transparent", color: C.text, fontSize: 12.5, cursor: "pointer" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.06)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right asset panel 360px (可折叠) ── */}
      <div style={{ width: assetPanelCollapsed ? 44 : 360, flexShrink: 0, borderLeft: `1px solid ${C.div}`, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", transition: "width .2s ease",
        background: "rgba(22,23,28,0.75)", backdropFilter: "blur(24px) saturate(140%)" }}>

        <button onClick={() => setAssetPanelCollapsed(v => !v)} title={assetPanelCollapsed ? "展开资产库" : "折叠资产库"}
          style={{ position: "absolute", top: 12, left: -11, zIndex: 10, width: 22, height: 22, borderRadius: "50%", background: C.panel, border: `1px solid ${C.div}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.sub }}>
          <ChevronLeft style={{ width: 11, height: 11, transform: assetPanelCollapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }} />
        </button>

        {assetPanelCollapsed && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 48, gap: 8 }}>
            <Layers style={{ width: 16, height: 16, color: C.orange }} />
            <div style={{ fontSize: 11, color: C.sub, writingMode: "vertical-rl", letterSpacing: "0.1em" }}>资产库</div>
          </div>
        )}

        {!assetPanelCollapsed && (<>

        {/* Panel header: 标题 + 项目工具下拉 + 统一设置 */}
        <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.div}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>资产库</div>
          <button onClick={() => setShowUnifyModal(true)} title="统一设置"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8,
              border: `1px solid ${C.div}`, background: "rgba(255,255,255,0.04)", color: C.sub, cursor: "pointer", transition: "all .15s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.orange; el.style.color = C.orange; el.style.background = "rgba(255,106,26,.06)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.div; el.style.color = C.sub; el.style.background = "rgba(255,255,255,0.04)"; }}>
            <Layers style={{ width: 13, height: 13 }} />
          </button>
          <div style={{ position: "relative" }}>
            <button onClick={e => { e.stopPropagation(); setShowProjectToolMenu(v => !v); }} title="项目工具"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8,
                border: `1px solid ${showProjectToolMenu ? C.orange : C.div}`, background: showProjectToolMenu ? "rgba(255,106,26,.06)" : "rgba(255,255,255,0.04)",
                color: showProjectToolMenu ? C.orange : C.sub, cursor: "pointer", transition: "all .15s" }}>
              <Wrench style={{ width: 13, height: 13 }} />
            </button>
            {showProjectToolMenu && (
              <div onClick={e => e.stopPropagation()}
                style={{ position: "absolute", top: 38, right: 0, zIndex: 300, background: "#1c1d24", border: `1px solid ${C.div}`, borderRadius: 11, padding: "5px", minWidth: 180, boxShadow: "0 12px 32px rgba(0,0,0,.6)" }}>
                {[
                  { icon: Shield, label: "资产合规检查", sub: "扫描违规资产", color: "#34d399", action: () => { setShowProjectToolMenu(false); navigate("team-assets"); } },
                  { icon: AlertOctagon, label: "风险提示词", sub: "检测 3 处", color: "#fb923c", action: () => { setShowProjectToolMenu(false); setShowRiskModal(true); } },
                  { icon: CalendarClock, label: "预约自动生成", sub: "定时提交任务", color: "#60a5fa", action: () => { setShowProjectToolMenu(false); setShowScheduleModal(true); } },
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 7, border: "none", background: "transparent", color: C.text, fontSize: 13, cursor: "pointer", transition: "background .13s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.06)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <item.icon style={{ width: 14, height: 14, color: item.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5 }}>{item.label}</div>
                      <div style={{ fontSize: 10.5, color: C.sub, marginTop: 1 }}>{item.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Asset tabs */}
        <div style={{ display: "flex", alignItems: "flex-end", padding: "0 14px", borderBottom: `1px solid ${C.div}`, gap: 2 }}>
          {(["角色", "场景", "道具", "音色"] as const).map(tab => (
            <button key={tab} onClick={() => setAssetTab(tab)}
              style={{ padding: "11px 11px 10px", background: "none", border: "none", fontSize: 13, fontWeight: assetTab === tab ? 600 : 400, color: assetTab === tab ? C.orange : C.sub, borderBottom: `2px solid ${assetTab === tab ? C.orange : "transparent"}`, marginBottom: -1, cursor: "pointer", transition: "all .15s" }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Filter chips */}
        <div style={{ padding: "9px 12px", display: "flex", gap: 5, borderBottom: `1px solid ${C.div}` }}>
          {(["全部", "已使用", "未使用"] as const).map(f => (
            <button key={f} onClick={() => setAssetFilter(f)}
              style={{ padding: "0 10px", height: 26, borderRadius: 6, border: "none", background: assetFilter === f ? "rgba(255,106,26,.15)" : "rgba(255,255,255,0.05)", color: assetFilter === f ? C.orange : C.sub, fontSize: 11, cursor: "pointer", fontWeight: assetFilter === f ? 600 : 400, transition: "all .15s" }}>
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: "9px 12px", borderBottom: `1px solid ${C.div}` }}>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: C.sub, pointerEvents: "none" }} />
            <input value={assetSearch} onChange={e => setAssetSearch(e.target.value)} placeholder={`搜索${assetTab}…`}
              style={{ width: "100%", height: 34, paddingLeft: 30, paddingRight: 10, background: C.input, border: `1px solid ${C.div}`, borderRadius: 8, color: C.text, fontSize: 12, outline: "none", boxSizing: "border-box", transition: "border-color .15s" }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,106,26,.4)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = C.div; }} />
          </div>
        </div>

        {/* Asset grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {/* Create card */}
            <button style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, height: 86, borderRadius: 10, border: "1.5px dashed rgba(255,255,255,.14)", background: "transparent", color: C.sub, cursor: "pointer", fontSize: 11, transition: "all .15s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.orange; el.style.color = C.orange; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,.14)"; el.style.color = C.sub; }}>
              <Plus style={{ width: 17, height: 17 }} />
              <span style={{ fontSize: 10 }}>创建{assetTab}</span>
            </button>

            {filteredAssets().map(asset => {
              const shot = shots.find(s => s.id === activeShot);
              const isUsed = shot ? (assetTab === "角色" ? shot.characters.includes(asset.name) : assetTab === "场景" ? shot.scene === asset.name : assetTab === "道具" ? shot.props.includes(asset.name) : false) : false;
              const avatarBg = assetTab === "角色" ? (charColor[asset.name] ?? C.orange) : assetTab === "场景" ? "#1a3050" : assetTab === "道具" ? "#1a2a1a" : "#1a1a30";
              const avatarColor = assetTab === "角色" ? "white" : assetTab === "场景" ? "#38bdf8" : assetTab === "道具" ? "#4ade80" : "#a78bfa";
              return (
                <button key={asset.id} onClick={() => addAsset(asset.name)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", height: 86, borderRadius: 10, border: `1.5px solid ${isUsed ? C.orange : C.div}`, background: isUsed ? "rgba(255,106,26,.07)" : C.input, padding: "10px 6px", cursor: "pointer", gap: 7, transition: "all .15s", position: "relative" }}
                  onMouseEnter={e => { if (!isUsed) { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,106,26,.45)"; el.style.background = "rgba(255,106,26,.04)"; } }}
                  onMouseLeave={e => { if (!isUsed) { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.div; el.style.background = C.input; } }}>
                  {isUsed && <div style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: "50%", background: C.orange }} />}
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: avatarColor }}>{asset.name[0]}</div>
                  <span style={{ fontSize: 11, color: isUsed ? C.orange : C.text, fontWeight: isUsed ? 600 : 400, lineHeight: 1.3, textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        </>)}
      </div>

      {/* ── 风格选择 modal ── */}
      {showStyleModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowStyleModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 480, background: "#16171c", border: `1px solid ${C.div}`, borderRadius: 18, boxShadow: "0 32px 80px rgba(0,0,0,.7)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: `1px solid ${C.div}` }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 3 }}>选择风格</h2>
                <p style={{ fontSize: 12, color: C.sub }}>当前：{selectedStyle}</p>
              </div>
              <button onClick={() => setShowStyleModal(false)}
                style={{ ...btnBase, width: 30, height: 30, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.06)", color: C.sub }}>
                <X style={{ width: 15, height: 15 }} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
                {STYLES.map(s => {
                  const on = selectedStyle === s;
                  return (
                    <button key={s} onClick={() => { setSelectedStyle(s); setShowStyleModal(false); }}
                      style={{ ...btnBase, flexDirection: "column", gap: 8, padding: "14px 6px", borderRadius: 12, border: `1.5px solid ${on ? C.orange : C.div}`, background: on ? "rgba(255,106,26,.09)" : C.input, cursor: "pointer", transition: "all .15s" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: on ? "rgba(255,106,26,.2)" : "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                        {["🎨", "📸", "🖌️", "🌐", "💥"][STYLES.indexOf(s)]}
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: on ? 600 : 400, color: on ? C.orange : C.text, lineHeight: 1.3, textAlign: "center" }}>{s}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 风险提示词 modal ── */}
      {showRiskModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.72)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowRiskModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, background: "#16171c", border: `1px solid rgba(251,146,60,.25)`, borderRadius: 20, boxShadow: "0 32px 80px rgba(0,0,0,.7)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid rgba(251,146,60,.15)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertOctagon style={{ width: 15, height: 15, color: "#fb923c" }} />
                <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text }}>风险提示词</h2>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "rgba(248,113,113,.12)", color: "#f87171" }}>检测到 3 处</span>
              </div>
              <button onClick={() => setShowRiskModal(false)} style={{ ...btnBase, width: 30, height: 30, borderRadius: 8, border: "none", background: "rgba(255,255,255,.06)", color: C.sub }}>
                <X style={{ width: 15, height: 15 }} />
              </button>
            </div>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { shot: "镜号 03", word: "血腥暴力", level: "高风险", lc: "#f87171", lb: "rgba(248,113,113,.08)" },
                { shot: "镜号 07", word: "政治敏感", level: "中风险", lc: "#fb923c", lb: "rgba(251,146,60,.08)" },
                { shot: "镜号 11", word: "版权图案", level: "低风险", lc: "#fbbf24", lb: "rgba(251,191,36,.08)" },
              ].map(r => (
                <div key={r.shot} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 11, background: r.lb, border: `1px solid ${r.lc}30` }}>
                  <span style={{ fontSize: 11.5, color: C.sub, flexShrink: 0, minWidth: 52 }}>{r.shot}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,.8)", flex: 1 }}>「{r.word}」</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: r.lc, border: `1px solid ${r.lc}50`, padding: "2px 9px", borderRadius: 6, flexShrink: 0 }}>{r.level}</span>
                  <button style={{ fontSize: 12, color: gold, background: "none", border: "none", cursor: "pointer", flexShrink: 0, fontWeight: 500 }}>修改</button>
                </div>
              ))}
              <p style={{ fontSize: 11, color: C.sub, marginTop: 4, lineHeight: 1.7 }}>以上提示词可能导致生成失败或内容审核不通过，建议修改后重新生成。</p>
            </div>
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.div}`, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowRiskModal(false)}
                style={{ ...btnBase, padding: "0 20px", height: 34, borderRadius: 9, border: "none", background: `linear-gradient(135deg,${C.orange},#cc3300)`, color: "white", fontSize: 13, fontWeight: 600 }}>
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 预约任务 modal ── */}
      {showScheduleModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.72)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowScheduleModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, background: "#16171c", border: `1px solid ${C.div}`, borderRadius: 20, boxShadow: "0 32px 80px rgba(0,0,0,.7)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.div}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarClock style={{ width: 15, height: 15, color: "#60a5fa" }} />
                <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text }}>预约自动生成</h2>
              </div>
              <button onClick={() => setShowScheduleModal(false)} style={{ ...btnBase, width: 30, height: 30, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.06)", color: C.sub }}>
                <X style={{ width: 15, height: 15 }} />
              </button>
            </div>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: "block", marginBottom: 10, letterSpacing: "0.04em" }}>选择镜号</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {shots.map(s => {
                    const n = s.num;
                    return (
                      <button key={s.id}
                        style={{ width: 38, height: 34, borderRadius: 8, border: `1.5px solid ${C.div}`, background: "rgba(255,255,255,0.03)", color: C.sub, fontSize: 12, cursor: "pointer" }}>
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: "block", marginBottom: 10, letterSpacing: "0.04em" }}>生成时间</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.sub, marginBottom: 5 }}>日期</div>
                    <input type="date"
                      style={{ width: "100%", height: 36, padding: "0 12px", background: C.input, border: `1px solid ${C.div}`, borderRadius: 9, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box", colorScheme: "dark" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.sub, marginBottom: 5 }}>时间</div>
                    <input type="time" defaultValue="02:00"
                      style={{ width: "100%", height: 36, padding: "0 12px", background: C.input, border: `1px solid ${C.div}`, borderRadius: 9, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box", colorScheme: "dark" }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.div}` }}>
                <p style={{ fontSize: 11, color: C.sub, lineHeight: 1.7 }}>· 提交前将自动扣除星石余额，请确保余额充足<br />· 任务提交后可在「生成记录」中查看进度<br />· 可随时在记录中取消未开始的预约任务</p>
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.div}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setShowScheduleModal(false)}
                style={{ ...btnBase, padding: "0 16px", height: 34, borderRadius: 9, border: `1px solid ${C.div}`, background: "transparent", color: C.sub, fontSize: 13 }}>
                取消
              </button>
              <button onClick={() => setShowScheduleModal(false)}
                style={{ ...btnBase, padding: "0 20px", height: 34, borderRadius: 9, border: "none", background: "rgba(96,165,250,.9)", color: "white", fontSize: 13, fontWeight: 600 }}>
                <CalendarClock style={{ width: 13, height: 13 }} />确认预约
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 统一设置 modal ── */}
      {showUnifyModal && (() => {
        const SECTIONS: { key: "text" | "image" | "video"; label: string; sub: string; color: string; accent: string; models: typeof TEXT_MODELS; selected: string; setSelected: (v: string) => void }[] = [
          { key: "text",  label: "文本模型", sub: "按标准任务计价",   color: "#3b82f6", accent: "#60a5fa", models: TEXT_MODELS,  selected: selectedTextModel,  setSelected: setSelectedTextModel },
          { key: "image", label: "图片模型", sub: "按生成张数计价",   color: "#a855f7", accent: "#c084fc", models: IMAGE_MODELS, selected: selectedImageModel, setSelected: setSelectedImageModel },
          { key: "video", label: "视频模型", sub: "按输出秒数计价",   color: "#e55714", accent: "#fb923c", models: VIDEO_MODELS, selected: selectedVideoModel, setSelected: setSelectedVideoModel },
        ];
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.72)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowUnifyModal(false)}>
            <div onClick={e => e.stopPropagation()} style={{ width: 520, background: "#16171c", border: `1px solid ${C.div}`, borderRadius: 20, boxShadow: "0 32px 80px rgba(0,0,0,.7)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "88vh" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.div}`, flexShrink: 0 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text }}>统一设置</h2>
                  <p style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>为当前项目选择默认模型，可在单镜覆盖</p>
                </div>
                <button onClick={() => setShowUnifyModal(false)} style={{ ...btnBase, width: 30, height: 30, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.06)", color: C.sub }}>
                  <X style={{ width: 15, height: 15 }} />
                </button>
              </div>
              <div style={{ overflowY: "auto", flex: 1, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {SECTIONS.map(sec => {
                  const isOpen = openSection === sec.key;
                  return (
                    <div key={sec.key} style={{ border: `1px solid ${isOpen ? sec.color + "40" : C.div}`, borderRadius: 12, overflow: "hidden", transition: "border-color .18s" }}>
                      <button onClick={() => setOpenSection(isOpen ? "text" : sec.key)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: isOpen ? `${sec.color}0d` : "rgba(255,255,255,0.02)", border: "none", cursor: "pointer", transition: "background .15s" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: sec.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: isOpen ? sec.accent : C.text }}>{sec.label}</span>
                        <span style={{ fontSize: 11, color: C.sub }}>{sec.sub}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: sec.accent, background: `${sec.color}1a`, padding: "2px 8px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0 }}>{sec.selected}</span>
                        <ChevronDown style={{ width: 13, height: 13, color: C.sub, flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                      </button>
                      {isOpen && (
                        <div style={{ padding: "8px 12px 12px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {sec.models.map(m => {
                              const active = sec.selected === m.name;
                              return (
                                <button key={m.name} onClick={() => sec.setSelected(m.name)}
                                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${active ? sec.color + "70" : "rgba(255,255,255,.06)"}`, background: active ? `${sec.color}0f` : "transparent", cursor: "pointer", transition: "all .13s", textAlign: "left" }}>
                                  <div style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${active ? sec.color : "rgba(255,255,255,.18)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "border-color .13s" }}>
                                    {active && <div style={{ width: 7, height: 7, borderRadius: "50%", background: sec.color }} />}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                      <span style={{ fontSize: 12.5, fontWeight: active ? 600 : 400, color: active ? "rgba(255,255,255,.9)" : C.text }}>{m.name}</span>
                                      {(m as any).tag && <span style={{ fontSize: 9.5, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: `${sec.color}25`, color: sec.accent }}>{(m as any).tag}</span>}
                                    </div>
                                    <div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{m.sub}</div>
                                  </div>
                                  <span style={{ fontSize: 11.5, fontWeight: 700, color: active ? sec.accent : C.sub, flexShrink: 0 }}>{m.price}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.div}`, display: "flex", justifyContent: "flex-end", gap: 8, flexShrink: 0 }}>
                <button onClick={() => setShowUnifyModal(false)}
                  style={{ ...btnBase, padding: "0 16px", height: 34, borderRadius: 9, border: `1px solid ${C.div}`, background: "transparent", color: C.sub, fontSize: 13 }}>
                  取消
                </button>
                <button onClick={() => setShowUnifyModal(false)}
                  style={{ ...btnBase, padding: "0 20px", height: 34, borderRadius: 9, border: "none", background: `linear-gradient(135deg,${C.orange},#cc3300)`, color: "white", fontSize: 13, fontWeight: 600 }}>
                  应用设置
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── CostConfirm Modal（对齐 Make CostConfirmPage） ── */}
      {showCostConfirm && (
        <CostConfirmModal
          onClose={() => setShowCostConfirm(false)}
          onConfirm={() => { setShowCostConfirm(false); navigate("batch"); }}
        />
      )}
    </div>
  );
}

// ─── CostConfirmModal（独立组件） ──────────────────────────────────────
function CostConfirmModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  // 复用 Make 中 Task/User 钱包归属逻辑（mock）
  const TASK = { model: "Seedance 2.0 Fast", spec: "480p · 5秒 · 9:16 · 无声音 · 1张参考图", estimatedStars: 18.55, estimatedCNY: 1.86, priceVersion: "2026-08-21 10:00" };
  const PROJECT = { storyboards: { total: 20 } };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(12px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: "#0E0F14", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, boxShadow: "0 30px 80px rgba(0,0,0,.6)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "white" }}>生成前费用确认</h2>
          <button onClick={onClose} style={{ color: colors.textMuted, background: "none", border: "none", cursor: "pointer" }}><X style={{ width: 18, height: 18 }} /></button>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: 16 }}>
            {([
              ["任务类型", "批量视频生成"],
              ["模型", TASK.model],
              ["规格", TASK.spec],
              ["数量", `${PROJECT.storyboards.total} 条分镜`],
            ] as const).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: colors.textMuted }}>{k}</span>
                <span style={{ color: "rgba(255,255,255,.8)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(255,138,31,.07)", border: "1px solid rgba(255,138,31,.2)", borderRadius: 14, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: colors.textMuted }}>预计消耗</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: gold }}>{(TASK.estimatedStars * PROJECT.storyboards.total).toFixed(2)} 星石</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 2 }}>≈ ¥{(TASK.estimatedCNY * PROJECT.storyboards.total).toFixed(2)}</div>
              </div>
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.07)", fontSize: 10, color: "rgba(255,255,255,.25)" }}>
              价格版本：{TASK.priceVersion}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: "11px 0", borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.07)", color: colors.textSecondary }}>
              取消
            </button>
            <button onClick={onConfirm}
              style={{ flex: 2, padding: "11px 0", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", background: C.orange, border: "none", color: "black", boxShadow: "0 4px 20px rgba(255,140,32,.4)" }}>
              确认并提交
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

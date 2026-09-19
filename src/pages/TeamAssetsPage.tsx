// ═══════════════════════════════════════════════════════════════════════════════════
// TeamAssetsPage — 对齐 Figma Make TeamAssetsPage（App.tsx 内联源码）
// 两级视图：无 selProj → 项目卡片列表；有 selProj → 资产详情
// 包含：权限管理、声音配置、详情弹窗、提示词编辑器、批量操作、删除确认
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import {
  X, ChevronRight, ChevronDown, ChevronLeft, Plus, Film, Shield,
  Download, Trash2, PenLine, Mic2, ImageIcon, AlertTriangle, Loader2,
  Wand2, Check, Zap,
} from "lucide-react";
import type { PageId } from "../shared";

// ═══ Design tokens ════════════════════════════════════════════════════════════
const gold   = "#FF8A1F";
const bdr    = "rgba(255,255,255,.08)";
const dim    = "rgba(255,255,255,.45)";
const card   = "#13151C";
const green  = "#10b981";
const imgBg  = "#09090f";

// ═══ Types ════════════════════════════════════════════════════════════════════
type AssetTab  = "chars" | "scenes" | "props" | "audio";
type AssetStatus = "confirmed" | "pending" | "generating" | "failed";
type AssetItem = { id: string; name: string; desc: string; status: AssetStatus; count: number; image?: string; imageStyle?: string; historyImages?: string[] };
type Comp = "pass" | "review" | "generating" | "failed" | "empty";
type DView = "front" | "side" | "back" | "outfit" | "detail";
type VTb    = "system" | "custom";
type VGender = "男" | "女";
type VAge    = "儿童" | "少年" | "青年" | "中年" | "老年";

interface Props { navigate: (p: PageId) => void; from?: string; initialSelProj?: string; }

// ═══ Static data ════════════════════════════════════════════════════════════
const TEAM_MEMBERS = [
  { id: "u1", name: "林凯", role: "导演",   avatar: "林" },
  { id: "u2", name: "苏玫", role: "编剧",   avatar: "苏" },
  { id: "u3", name: "陈刚", role: "制片",   avatar: "陈" },
  { id: "u4", name: "王芳", role: "美术",   avatar: "王" },
  { id: "u5", name: "赵磊", role: "摄影",   avatar: "赵" },
];

const PROJECTS = [
  { id: "p1", name: "镜像",     genre: "都市悬疑", color: "#FF8A1F", date: "2026-08-28", chars: 5, scenes: 6, props: 3,  audioReady: true,  status: "active"   },
  { id: "p2", name: "星坠",     genre: "科幻冒险", color: "#a855f7", date: "2026-08-21", chars: 3, scenes: 5, props: 6,  audioReady: true,  status: "active"   },
  { id: "p3", name: "归途",     genre: "现实主义", color: "#06b6d4", date: "2026-08-14", chars: 2, scenes: 3, props: 2,  audioReady: false, status: "draft"    },
  { id: "p4", name: "长夜将尽", genre: "历史古装", color: "#10b981", date: "2026-07-30", chars: 14, scenes: 18, props: 24, audioReady: true, status: "archived" },
];

const ASSET_DATA: Record<string, Record<AssetTab, AssetItem[]>> = {
  p1: {
    chars: [
      { id: "c1", name: "陈默", desc: "女主角 · 内敛冷静 · 28岁", status: "confirmed", count: 23,
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&h=640&fit=crop&auto=format",
        historyImages: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&h=1100&fit=crop&auto=format", "https://images.unsplash.com/photo-1675726205553-4e348f24da2c?w=900&h=1100&fit=crop&auto=format"] },
      { id: "c2", name: "林凯", desc: "男主角 · 温柔执着 · 30岁", status: "confirmed", count: 18,
        image: "https://images.unsplash.com/photo-1570216601541-fa11cfaf03e5?w=480&h=640&fit=crop&auto=format",
        historyImages: ["https://images.unsplash.com/photo-1570216601541-fa11cfaf03e5?w=900&h=1100&fit=crop&auto=format"] },
      { id: "c3", name: "方远", desc: "反派 · 城府极深", status: "generating", count: 0 },
      { id: "c4", name: "警卫甲", desc: "配角 · 第3集出场", status: "pending", count: 2 },
      { id: "c5", name: "神秘来客", desc: "待定 · 尚未定义", status: "pending", count: 0 },
    ],
    scenes: [
      { id: "s1", name: "公司走廊", desc: "主要场景 · 冷色调大理石", status: "confirmed", count: 34,
        image: "https://images.unsplash.com/photo-1679212839469-fb16a48919ce?w=480&h=640&fit=crop&auto=format",
        historyImages: ["https://images.unsplash.com/photo-1679212839469-fb16a48919ce?w=1200&h=800&fit=crop&auto=format"] },
      { id: "s2", name: "天台", desc: "关键场景 · 傍晚霞光", status: "confirmed", count: 15,
        image: "https://images.unsplash.com/photo-1535391879778-3bae11d29a24?w=480&h=640&fit=crop&auto=format",
        historyImages: ["https://images.unsplash.com/photo-1535391879778-3bae11d29a24?w=1200&h=800&fit=crop&auto=format"] },
      { id: "s3", name: "审讯室", desc: "常用场景 · 室内灯光", status: "generating", count: 0 },
      { id: "s4", name: "咖啡厅", desc: "次要场景 · 暖色调", status: "pending", count: 8 },
      { id: "s5", name: "地铁站", desc: "转场场景", status: "confirmed", count: 6 },
      { id: "s6", name: "陈默公寓", desc: "生活场景 · 极简风格", status: "pending", count: 11 },
    ],
    props: [
      { id: "p1", name: "手机",   desc: "道具 · 未接来电截图", status: "confirmed", count: 31, imageStyle: "linear-gradient(145deg,#1a1a1a 0%,#2c2c2c 35%,#4a4a4a 60%,#333 100%)" },
      { id: "p2", name: "文件夹", desc: "道具 · 机密工作文件", status: "pending", count: 7 },
      { id: "p3", name: "保险箱", desc: "道具 · 关键线索", status: "failed", count: 0 },
    ],
    audio: [
      { id: "a1", name: "陈默·标准音色", desc: "女声 · 青年 · 知性冷静", status: "confirmed", count: 1 },
      { id: "a2", name: "林凯·标准音色", desc: "男声 · 青年 · 温柔低沉", status: "confirmed", count: 1 },
      { id: "a3", name: "旁白·画外音",   desc: "中性 · 叙述风格", status: "pending", count: 0 },
    ],
  },
  p2: {
    chars:    [{ id: "c1", name: "宁远",    desc: "主角·宇航员",         status: "confirmed", count: 20 }, { id: "c2", name: "AI助手", desc: "虚拟角色", status: "confirmed", count: 15 }],
    scenes:   [{ id: "s1", name: "太空舱",  desc: "主场景",             status: "confirmed", count: 40 }, { id: "s2", name: "星球表面", desc: "外景", status: "generating", count: 0 }],
    props:    [{ id: "p1", name: "量子芯片", desc: "核心道具",           status: "pending", count: 1 }, { id: "p2", name: "太空服",   desc: "主角服装", status: "confirmed", count: 8 }],
    audio:    [{ id: "a1", name: "宁远音色", desc: "男声青年", status: "confirmed", count: 1 }, { id: "a2", name: "AI合成音", desc: "机械感", status: "confirmed", count: 1 }],
  },
  p3: {
    chars:    [{ id: "c1", name: "何雨", desc: "主角", status: "confirmed", count: 12 }, { id: "c2", name: "母亲", desc: "配角", status: "pending", count: 5 }],
    scenes:   [{ id: "s1", name: "迷雾森林", desc: "主场景", status: "pending", count: 0 }, { id: "s2", name: "故乡小屋", desc: "记忆场景", status: "pending", count: 0 }],
    props:    [{ id: "p1", name: "旧信件", desc: "关键道具", status: "pending", count: 3 }],
    audio:    [],
  },
  p4: {
    chars:    [{ id: "c1", name: "张小敬", desc: "主角·不良帅", status: "confirmed", count: 55 }],
    scenes:   [{ id: "s1", name: "长安坊市", desc: "主场景", status: "confirmed", count: 80 }, { id: "s2", name: "皇宫", desc: "次要场景", status: "confirmed", count: 20 }],
    props:    [{ id: "p1", name: "烟花", desc: "关键道具", status: "confirmed", count: 8 }, { id: "p2", name: "虎符", desc: "信物", status: "confirmed", count: 4 }],
    audio:    [{ id: "a1", name: "旁白音色", desc: "男声·沉稳", status: "confirmed", count: 1 }],
  },
};

const STATUS_CFG: Record<AssetStatus, { label: string; color: string; bg: string; border: string }> = {
  confirmed:  { label: "已确认", color: green,           bg: "rgba(16,185,129,.1)",  border: "rgba(16,185,129,.25)"  },
  pending:    { label: "待确认", color: gold,           bg: "rgba(255,138,31,.1)",  border: "rgba(255,138,31,.25)"  },
  generating: { label: "生成中", color: "#60a5fa",       bg: "rgba(96,165,250,.1)",  border: "rgba(96,165,250,.25)"  },
  failed:     { label: "失败",   color: "#f87171",      bg: "rgba(248,113,113,.1)", border: "rgba(248,113,113,.25)" },
};

const compCfg: Record<Comp, { text: string; c: string; bg: string; border: string }> = {
  pass:       { text: "已确认", c: "#34d399", bg: "rgba(52,211,153,.1)",  border: "rgba(52,211,153,.25)" },
  review:     { text: "审核中", c: "#fbbf24", bg: "rgba(251,191,36,.1)",  border: "rgba(251,191,36,.25)" },
  generating: { text: "生成中", c: "#60a5fa", bg: "rgba(96,165,250,.1)",  border: "rgba(96,165,250,.25)" },
  failed:     { text: "失败",   c: "#f87171", bg: "rgba(248,113,113,.1)", border: "rgba(248,113,113,.25)" },
  empty:      { text: "待确认", c: "#71717a", bg: "rgba(113,113,122,.1)", border: "rgba(113,113,122,.25)" },
};

const SYS_VOICES = [
  { id: "sv1", name: "晓辰",   gender: "女" as VGender, age: "青年" as VAge, lang: "中文", tag: "温柔知性" },
  { id: "sv2", name: "云逸",   gender: "男" as VGender, age: "青年" as VAge, lang: "中文", tag: "沉稳大气" },
  { id: "sv3", name: "小艾",   gender: "女" as VGender, age: "少年" as VAge, lang: "中文", tag: "活泼清亮" },
  { id: "sv4", name: "Marcus", gender: "男" as VGender, age: "青年" as VAge, lang: "英文", tag: "专业播报" },
  { id: "sv5", name: "Echo",   gender: "女" as VGender, age: "青年" as VAge, lang: "英文", tag: "自然流畅" },
  { id: "sv6", name: "墨渊",   gender: "男" as VGender, age: "中年" as VAge, lang: "中文", tag: "磁性低沉" },
];
const CUSTOM_VOICES = [
  { id: "uv1", name: "林凯专属", gender: "男" as VGender, age: "青年" as VAge, lang: "中文" },
];

// ═══ Helpers ════════════════════════════════════════════════════════════════
const statusToComp = (s: AssetStatus): Comp =>
  s === "confirmed" ? "pass" : s === "pending" ? "empty" : s as Comp;

const ddSel = {
  background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "rgba(255,255,255,.8)",
  outline: "none", cursor: "pointer",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM ASSETS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function TeamAssetsPage({ navigate, from, initialSelProj }: Props) {
  const [selProj,      setSelProj]      = useState<string | null>(initialSelProj ?? null);
  const [assetTab,     setAssetTab]     = useState<AssetTab>("chars");
  const [permOpen,     setPermOpen]     = useState<string | null>(null);
  const [visibility,   setVisibility]   = useState<Record<string, Set<string>>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deletedIds,   setDeletedIds]   = useState<Set<string>>(new Set());
  const [selItem,      setSelItem]      = useState<AssetItem | null>(null);
  const [dView,        setDView]        = useState<DView>("front");
  const [histIdx,      setHistIdx]      = useState(0);
  const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set());
  const [genModel,     setGenModel]     = useState("Flux 1.1 Pro");
  const [genQuality,   setGenQuality]   = useState("高");
  const [genRes,       setGenRes]       = useState("4K");
  const [genRunning,   setGenRunning]   = useState(false);
  const [modalPrompt,   setModalPrompt]  = useState("");
  const [modalRatio,   setModalRatio]   = useState("16:9");
  const [modalStyle,   setModalStyle]   = useState("写实");
  const [_modalExpand,   setModalExpand]  = useState(false);
  const [promptEditorOpen, setPromptEditorOpen] = useState(false);
  const [modalRemark,   setModalRemark]  = useState("");
  const [voiceOpen,     setVoiceOpen]   = useState(false);
  const [voiceTarget,   setVoiceTarget]  = useState("");
  const [voiceTab,      setVoiceTab]     = useState<VTb>("system");
  const [selVoice,      setSelVoice]     = useState<string | null>(null);
  const [voiceCreating, setVoiceCreating] = useState(false);
  const [cvName,        setCvName]       = useState("");
  const [cvGender,      setCvGender]     = useState<VGender>("女");
  const [cvAge,         setCvAge]       = useState<VAge>("青年");

  const toggleSel     = (id: string)  => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll     = (ids: string[]) => setSelectedIds(prev => prev.size === ids.length ? new Set() : new Set(ids));
  const getProjVisible = (projId: string) => visibility[projId] ?? new Set(TEAM_MEMBERS.map(m => m.id));
  const toggleMember  = (projId: string, uid: string) => {
    setVisibility(prev => {
      const cur = new Set(prev[projId] ?? TEAM_MEMBERS.map(m => m.id));
      cur.has(uid) ? cur.delete(uid) : cur.add(uid);
      return { ...prev, [projId]: cur };
    });
  };

  const openVoice = (name: string) => {
    setVoiceTarget(name);
    setVoiceTab("system");
    setSelVoice(null);
    setVoiceCreating(false);
    setCvName("");
    setVoiceOpen(true);
  };

  // ═══ Project detail view ══════════════════════════════════════════════════
  if (selProj) {
    const proj  = PROJECTS.find(p => p.id === selProj)!;
    const data  = ASSET_DATA[selProj] ?? { chars: [], scenes: [], props: [], audio: [] };
    const items = data[assetTab] ?? [];
    const visible = getProjVisible(selProj);

    return (
      <div style={{ padding: "20px 32px" }}>
        {/* Back */}
        <button
          onClick={() => {
            from === "new-project"
              ? navigate("new-project")
              : (setSelProj(null), setAssetTab("chars"), setPermOpen(null));
          }}
          style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, background: "none", border: "none",
            color: dim, fontSize: 13, cursor: "pointer", padding: "4px 0", transition: "color .15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "white")}
          onMouseLeave={e => (e.currentTarget.style.color = dim)}>
          <ChevronLeft style={{ width: 15, height: 15 }} />
          {from === "new-project" ? "返回新建剧目" : "返回团队资产"}
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: proj.color }} />
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 3 }}>{proj.name}</h1>
              <div style={{ display: "flex", gap: 12, fontSize: 12, color: dim }}>
                <span>{proj.genre}</span><span>·</span><span>更新于 {proj.date}</span>
                {proj.status === "archived" && (
                  <span style={{ color: "rgba(255,255,255,.3)", background: "rgba(255,255,255,.06)", padding: "0 8px", borderRadius: 20, border: "1px solid rgba(255,255,255,.1)" }}>
                    已归档
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {([
              { l: "角色", v: data.chars.length },
              { l: "场景", v: data.scenes.length },
              { l: "道具", v: data.props.length },
              { l: "声音", v: data.audio.length },
            ]).map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: dim }}>{s.l}</div>
              </div>
            ))}
            <div style={{ width: 1, height: 36, background: "rgba(255,255,255,.08)", flexShrink: 0 }} />
            <button onClick={() => navigate("storyboard")}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, color: "black", border: "none", cursor: "pointer", flexShrink: 0, background: `linear-gradient(135deg,${gold},#FF6A1A)` }}>
              <Film style={{ width: 14, height: 14 }} />进入分镜管理
            </button>
          </div>
        </div>

        {/* Permission panel */}
        <div style={{ background: card, border: `1px solid ${bdr}`, borderRadius: 14, marginBottom: 20, overflow: "hidden" }}>
          <button onClick={() => setPermOpen(permOpen ? null : selProj)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", background: "none", border: "none", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Shield style={{ width: 14, height: 14, color: gold }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>访问权限管理</span>
              <span style={{ fontSize: 11, color: dim, marginLeft: 4 }}>仅管理员可配置</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: dim }}>{visible.size} / {TEAM_MEMBERS.length} 成员可见</span>
              <ChevronDown style={{ width: 13, height: 13, color: dim, transform: permOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .15s" }} />
            </div>
          </button>
          {permOpen && (
            <div style={{ borderTop: `1px solid ${bdr}`, padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 10 }}>
              {TEAM_MEMBERS.map(m => {
                const on = visible.has(m.id);
                return (
                  <button key={m.id} onClick={() => toggleMember(selProj, m.id)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 10, cursor: "pointer", transition: "all .15s",
                      background: on ? "rgba(255,138,31,.1)" : "rgba(255,255,255,.04)",
                      border: `1px solid ${on ? "rgba(255,138,31,.3)" : "rgba(255,255,255,.1)"}` }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, background: on ? `${gold}22` : "rgba(255,255,255,.1)", color: on ? gold : "rgba(255,255,255,.5)" }}>
                      {m.avatar}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: on ? "white" : "rgba(255,255,255,.55)" }}>{m.name}</div>
                      <div style={{ fontSize: 10.5, color: dim }}>{m.role}</div>
                    </div>
                    {on && <Check style={{ width: 12, height: 12, color: gold, flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Generation controls + tabs */}
        {(() => {
          const visibleItems = items.filter(i => !deletedIds.has(i.id));
          const allIds = visibleItems.map(i => i.id);
          const allSel = selectedIds.size === allIds.length && allIds.length > 0;

          return (
            <>
              {/* Batch generation settings */}
              <div style={{ background: card, border: `1px solid ${bdr}`, borderRadius: 14, marginBottom: 16, padding: "13px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", rowGap: 8 }}>
                  <span style={{ fontSize: 12, color: dim, whiteSpace: "nowrap", marginRight: 4 }}>批量生成设置</span>
                  <select value={genModel} onChange={e => setGenModel(e.target.value)} style={ddSel}>
                    <option value="Flux 1.1 Pro">Flux 1.1 Pro</option>
                    <option value="SDXL Turbo">SDXL Turbo</option>
                    <option value="Stable Cascade">Stable Cascade</option>
                  </select>
                  <select value={genQuality} onChange={e => setGenQuality(e.target.value)} style={ddSel}>
                    <option value="中">中画质</option>
                    <option value="高">高画质</option>
                  </select>
                  <select value={genRes} onChange={e => setGenRes(e.target.value)} style={ddSel}>
                    <option value="2K">2K</option>
                    <option value="4K">4K</option>
                  </select>
                  <div style={{ flex: 1 }} />
                  <button
                    onClick={() => { setGenRunning(true); setTimeout(() => setGenRunning(false), 3000); }}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 16px", borderRadius: 10,
                      fontSize: 13, fontWeight: 600, color: "black", border: "none", cursor: "pointer", flexShrink: 0,
                      background: `linear-gradient(135deg,${gold},#FF6A1A)` }}>
                    {genRunning
                      ? <><Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} />生成中…</>
                      : <><Zap style={{ width: 13, height: 13 }} />一键生成项目资产</>}
                  </button>
                </div>
              </div>

              {/* Asset tabs + select-all */}
              <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${bdr}`, marginBottom: 16 }}>
                <div style={{ display: "flex", flex: 1 }}>
                  {([
                    { k: "chars" as AssetTab, l: "角色",    count: data.chars.length },
                    { k: "scenes" as AssetTab, l: "场景",   count: data.scenes.length },
                    { k: "props" as AssetTab,  l: "道具",   count: data.props.length },
                    { k: "audio" as AssetTab,  l: "声音配置", count: data.audio.length },
                  ]).map(t => (
                    <button key={t.k} onClick={() => { setAssetTab(t.k); setSelectedIds(new Set()); }}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "none", border: "none",
                        borderBottom: `2px solid ${assetTab === t.k ? gold : "transparent"}`,
                        cursor: "pointer", color: assetTab === t.k ? gold : dim, fontSize: 13, fontWeight: assetTab === t.k ? 600 : 400 }}>
                      {t.l}
                      <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 20,
                        background: assetTab === t.k ? "rgba(255,138,31,.15)" : "rgba(255,255,255,.06)",
                        color: assetTab === t.k ? gold : dim }}>
                        {t.count}
                      </span>
                    </button>
                  ))}
                </div>
                <button onClick={() => toggleAll(allIds)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", marginBottom: -2,
                    fontSize: 12, color: allSel ? gold : dim, background: "none", border: "none", cursor: "pointer" }}>
                  <div style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${allSel ? gold : "rgba(255,255,255,.3)"}`,
                    background: allSel ? "rgba(255,138,31,.2)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {allSel && <Check style={{ width: 9, height: 9, color: gold }} />}
                  </div>
                  全选
                </button>
              </div>

              {/* Voice management tab */}
              {assetTab === "audio" ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>音色管理</div>
                      <div style={{ fontSize: 12, color: dim, marginTop: 2 }}>为项目角色分配或克隆专属音色</div>
                    </div>
                    <button onClick={() => openVoice("")}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10,
                        background: "rgba(255,255,255,.06)", border: `1px solid rgba(255,255,255,.1)`,
                        fontSize: 12, color: "rgba(255,255,255,.75)", cursor: "pointer" }}>
                      <Plus style={{ width: 12, height: 12 }} />克隆新音色
                    </button>
                  </div>

                  <div style={{ fontSize: 12, color: dim, fontWeight: 500, marginBottom: 8 }}>系统音色</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10, marginBottom: 20 }}>
                    {SYS_VOICES.map(v => (
                      <div key={v.id}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12,
                          background: card, border: `1px solid ${bdr}`, transition: "border-color .12s" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.15)")}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = bdr)}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                          background: v.gender === "女" ? "rgba(244,114,182,.12)" : "rgba(96,165,250,.12)" }}>
                          <Mic2 style={{ width: 16, height: 16, color: v.gender === "女" ? "#f472b6" : "#60a5fa" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: "white" }}>{v.name}</span>
                            <span style={{ fontSize: 10, color: dim, background: "rgba(255,255,255,.06)", padding: "1px 6px", borderRadius: 20 }}>{v.tag}</span>
                          </div>
                          <div style={{ fontSize: 11, color: dim }}>{v.gender} · {v.age} · {v.lang}</div>
                        </div>
                        <button onClick={() => openVoice(v.name)}
                          style={{ padding: "5px 11px", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer", flexShrink: 0,
                            background: "rgba(255,138,31,.1)", border: "1px solid rgba(255,138,31,.25)", color: gold }}>
                          分配
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 12, color: dim, fontWeight: 500, marginBottom: 8 }}>自定义音色</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {CUSTOM_VOICES.map(v => (
                      <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12,
                        background: card, border: `1px solid ${bdr}` }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,138,31,.12)" }}>
                          <Mic2 style={{ width: 16, height: 16, color: gold }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: "white", marginBottom: 2 }}>{v.name}</div>
                          <div style={{ fontSize: 11, color: dim }}>{v.gender} · {v.age} · {v.lang}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openVoice(v.name)}
                            style={{ padding: "5px 11px", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer",
                              background: "rgba(255,138,31,.1)", border: "1px solid rgba(255,138,31,.25)", color: gold }}>
                            分配
                          </button>
                          <button style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(255,255,255,.05)", border: `1px solid rgba(255,255,255,.1)`, cursor: "pointer", color: dim }}>
                            <Trash2 style={{ width: 11, height: 11 }} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => { openVoice(""); setVoiceCreating(true); setVoiceTab("custom"); }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px",
                        borderRadius: 12, border: "2px dashed rgba(255,255,255,.1)", background: "transparent",
                        color: dim, fontSize: 13, cursor: "pointer", transition: "all .15s" }}
                      onMouseEnter={e => { ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,138,31,.3)"); ((e.currentTarget as HTMLElement).style.color = gold); }}
                      onMouseLeave={e => { ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.1)"); ((e.currentTarget as HTMLElement).style.color = dim); }}>
                      <Plus style={{ width: 16, height: 16 }} />克隆新音色
                    </button>
                  </div>
                </div>
              ) : (
                /* Asset card grid */
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                  {visibleItems.map(item => {
                    const comp = statusToComp(item.status);
                    const cc = compCfg[comp];
                    const hasImg = !!(item.image || item.imageStyle);
                    const isSel = selectedIds.has(item.id);

                    return (
                      <div key={item.id}
                        style={{ border: `1px solid ${isSel ? "rgba(255,138,31,.5)" : bdr}`, borderRadius: 14, overflow: "hidden", cursor: "pointer",
                          transition: "border-color .15s,box-shadow .15s", position: "relative", background: card,
                          boxShadow: isSel ? "0 0 0 2px rgba(255,138,31,.2)" : "none" }}
                        onMouseEnter={e => { if (!isSel) ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,138,31,.35)"); }}
                        onMouseLeave={e => { if (!isSel) ((e.currentTarget as HTMLElement).style.borderColor = bdr); }}>

                        {/* 16:9 image */}
                        <div style={{ aspectRatio: "16/9", position: "relative", overflow: "hidden", background: imgBg }}
                          onClick={() => {
                            if (selectedIds.size > 0) toggleSel(item.id);
                            else { setSelItem(item); setDView("front"); setHistIdx(0); setModalPrompt(item.desc ? `${item.name}：${item.desc}` : item.name); setModalRemark(""); }
                          }}>
                          {item.image && <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                          {item.imageStyle && !item.image && <div style={{ width: "100%", height: "100%", background: item.imageStyle }} />}
                          {!hasImg && comp === "generating" && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                              <div style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid rgba(96,165,250,.2)", borderTopColor: "#60a5fa", animation: "spin 1s linear infinite" }} />
                              <span style={{ fontSize: 11, color: "#60a5fa", fontWeight: 500 }}>AI 生成中</span>
                            </div>
                          )}
                          {!hasImg && comp === "failed" && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                              <AlertTriangle style={{ width: 14, height: 14, color: "#f87171" }} />
                              <span style={{ fontSize: 11, color: "#f87171", fontWeight: 500 }}>生成失败</span>
                            </div>
                          )}
                          {!hasImg && comp === "empty" && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                              <ImageIcon style={{ width: 18, height: 18, color: "rgba(255,255,255,.18)" }} />
                              <span style={{ fontSize: 10, color: dim }}>暂无图像</span>
                            </div>
                          )}
                          {hasImg && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(9,10,14,.9) 0%,transparent 60%)", pointerEvents: "none" }} />}

                          {/* Checkbox */}
                          <div onClick={e => { e.stopPropagation(); toggleSel(item.id); }}
                            style={{ position: "absolute", top: 8, left: 8, zIndex: 3, width: 18, height: 18, borderRadius: 5,
                              border: `1.5px solid ${isSel ? gold : "rgba(255,255,255,.5)"}`,
                              background: isSel ? "rgba(255,138,31,.25)" : "rgba(0,0,0,.45)",
                              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .12s" }}>
                            {isSel && <Check style={{ width: 10, height: 10, color: gold }} />}
                          </div>

                          {/* Status badge */}
                          <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: cc.bg, color: cc.c, border: `1px solid ${cc.border}`, display: "inline-flex", alignItems: "center", gap: 3 }}>
                              {comp === "generating" && <Loader2 style={{ width: 8, height: 8 }} />}
                              {cc.text}
                            </span>
                          </div>
                        </div>

                        {/* Card footer */}
                        <div style={{ padding: "10px 14px 12px", display: "flex", alignItems: "center", gap: 8 }}
                          onClick={() => {
                            if (selectedIds.size > 0) toggleSel(item.id);
                            else { setSelItem(item); setDView("front"); setHistIdx(0); setModalPrompt(item.desc ? `${item.name}：${item.desc}` : item.name); setModalRemark(""); }
                          }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{item.desc || "（暂无描述）"}</div>
                          </div>
                          {/* Action buttons */}
                          <div style={{ display: "flex", gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                            <button title="编辑" onClick={() => { setSelItem(item); setDView("front"); setHistIdx(0); setModalPrompt(item.desc ? `${item.name}：${item.desc}` : item.name); setModalRemark(""); }}
                              style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,138,31,.08)", border: "1px solid rgba(255,138,31,.2)", cursor: "pointer", color: "rgba(255,138,31,.7)" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = gold; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,138,31,.45)"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,138,31,.7)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,138,31,.2)"; }}>
                              <PenLine style={{ width: 11, height: 11 }} />
                            </button>
                            {assetTab === "chars" && (
                              <button title="配置音色" onClick={() => openVoice(item.name)}
                                style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.06)", border: `1px solid rgba(255,255,255,.1)`, cursor: "pointer", color: dim }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f472b6"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(244,114,182,.35)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = dim; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.1)"; }}>
                                <Mic2 style={{ width: 11, height: 11 }} />
                              </button>
                            )}
                            <button title="下载" style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.06)", border: `1px solid rgba(255,255,255,.1)`, cursor: "pointer", color: dim }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "white"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = dim; }}>
                              <Download style={{ width: 11, height: 11 }} />
                            </button>
                            <button title="删除" onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                              style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.06)", border: `1px solid rgba(255,255,255,.1)`, cursor: "pointer", color: dim }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,.3)"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = dim; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.1)"; }}>
                              <Trash2 style={{ width: 11, height: 11 }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add new */}
                  <button
                    style={{ border: `2px dashed rgba(255,255,255,.1)`, borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", minHeight: 140, background: "transparent", transition: "all .15s", color: dim }}
                    onMouseEnter={e => { ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,138,31,.3)"); ((e.currentTarget as HTMLElement).style.color = gold); }}
                    onMouseLeave={e => { ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.1)"); ((e.currentTarget as HTMLElement).style.color = dim); }}>
                    <Plus style={{ width: 20, height: 20 }} />
                    <span style={{ fontSize: 12, fontWeight: 500 }}>新增{({ chars: "角色", scenes: "场景", props: "道具", audio: "声音配置" } as Record<AssetTab, string>)[assetTab]}</span>
                  </button>
                </div>
              )}

              {/* Batch action bar */}
              {selectedIds.size > 0 && (
                <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 400,
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                  background: "#1A1B26", border: "1px solid rgba(255,255,255,.16)", borderRadius: 16,
                  boxShadow: "0 8px 32px rgba(0,0,0,.7)", backdropFilter: "blur(12px)" }}>
                  <span style={{ fontSize: 13, color: "white", fontWeight: 600, marginRight: 4 }}>已选 {selectedIds.size} 项</span>
                  <button onClick={() => setSelectedIds(new Set())}
                    style={{ fontSize: 12, color: dim, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8 }}>
                    取消
                  </button>
                  <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.12)" }} />
                  <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 10,
                    fontSize: 13, fontWeight: 500, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)",
                    color: "rgba(255,255,255,.85)", cursor: "pointer" }}>
                    <Download style={{ width: 13, height: 13 }} />批量下载
                  </button>
                  <button onClick={() => {
                    setDeletedIds(prev => { const n = new Set(prev); selectedIds.forEach(id => n.add(id)); return n; });
                    setSelectedIds(new Set());
                  }}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 10,
                      fontSize: 13, fontWeight: 500, background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.3)",
                      color: "#f87171", cursor: "pointer" }}>
                    <Trash2 style={{ width: 13, height: 13 }} />批量删除
                  </button>
                </div>
              )}
            </>
          );
        })()}

        {/* Detail modal */}
        {selItem && (
          <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "stretch", background: "rgba(0,0,0,.82)", backdropFilter: "blur(20px)" }}
            onClick={e => { if (e.target === e.currentTarget) { setSelItem(null); setModalExpand(false); setPromptEditorOpen(false); } }}>
            <div style={{ margin: "auto", width: "min(1280px,98vw)", height: "min(820px,96vh)", background: "#0C0D14", border: "1px solid rgba(255,255,255,.1)", borderRadius: 22, display: "flex", overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,.9)", position: "relative" }}>

              {/* Close */}
              <button onClick={() => { setSelItem(null); setModalExpand(false); setPromptEditorOpen(false); }}
                style={{ position: "absolute", top: 14, right: 14, zIndex: 20, width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.55)", cursor: "pointer" }}>
                <X style={{ width: 14, height: 14 }} />
              </button>

              {/* Left: image column */}
              <div style={{ width: "46%", flexShrink: 0, background: imgBg, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid rgba(255,255,255,.07)" }}>
                <div style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}>
                  {selItem.image && <img src={selItem.image} alt={selItem.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                  {selItem.imageStyle && !selItem.image && <div style={{ width: "100%", height: "100%", background: selItem.imageStyle }} />}
                  {!selItem.image && !selItem.imageStyle && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <ImageIcon style={{ width: 36, height: 36, color: "rgba(255,255,255,.12)" }} />
                      <span style={{ fontSize: 13, color: dim }}>暂无图像</span>
                    </div>
                  )}
                  <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2, background: "rgba(0,0,0,.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 8, padding: "3px 10px", fontSize: 11, color: "rgba(255,255,255,.8)", fontWeight: 500 }}>
                    当前主图
                  </div>
                  {(selItem.image || selItem.imageStyle) && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 55%,rgba(9,10,14,.85) 100%)", pointerEvents: "none" }} />}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px", zIndex: 3 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: "-0.02em", textShadow: "0 2px 12px rgba(0,0,0,.8)" }}>{selItem.name}</div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.5)", marginTop: 3 }}>{selItem.desc || "（暂无描述）"}</div>
                  </div>
                </div>

                {/* History strip */}
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "rgba(0,0,0,.3)", borderTop: "1px solid rgba(255,255,255,.06)", overflowX: "auto" }}>
                  <span style={{ fontSize: 11, color: dim, flexShrink: 0 }}>历史</span>
                  {(selItem.historyImages ?? []).length > 0
                    ? (selItem.historyImages ?? []).map((src, i) => (
                        <button key={i} onClick={() => setHistIdx(i)}
                          style={{ flexShrink: 0, padding: 0, background: "none", border: `2px solid ${histIdx === i ? gold : "rgba(255,255,255,.14)"}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", transition: "border-color .12s", width: 80, height: 52 }}>
                          <img src={src} alt={`历史${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </button>
                      ))
                    : <span style={{ fontSize: 11, color: "rgba(255,255,255,.2)" }}>暂无历史版本</span>}
                </div>
              </div>

              {/* Right: detail panel */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", minHeight: 0 }}>
                  {/* Status + count */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: STATUS_CFG[selItem.status].bg, color: STATUS_CFG[selItem.status].color, border: `1px solid ${STATUS_CFG[selItem.status].border}`, fontWeight: 600 }}>
                      {STATUS_CFG[selItem.status].label}
                    </span>
                    <span style={{ fontSize: 12, color: dim }}>使用次数：<span style={{ color: gold, fontWeight: 700 }}>{selItem.count}</span></span>
                  </div>

                  {/* View tabs */}
                  <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                    {([
                      { k: "front" as DView, l: "正面" },
                      { k: "side" as DView, l: "侧面" },
                      { k: "back" as DView, l: "背面" },
                      { k: "outfit" as DView, l: "服装" },
                      { k: "detail" as DView, l: "细节" },
                    ]).map(v => (
                      <button key={v.k} onClick={() => setDView(v.k)}
                        style={{ padding: "5px 13px", borderRadius: 8, fontSize: 12, fontWeight: dView === v.k ? 600 : 400,
                          background: dView === v.k ? `${gold}15` : "rgba(255,255,255,.04)",
                          border: `1px solid ${dView === v.k ? "rgba(255,138,31,.3)" : "rgba(255,255,255,.08)"}`,
                          color: dView === v.k ? gold : dim, cursor: "pointer" }}>
                        {v.l}
                      </button>
                    ))}
                  </div>

                  {/* Prompt */}
                  <div style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${bdr}`, borderRadius: 11, padding: "12px 14px", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: dim, marginBottom: 5, fontWeight: 600 }}>生成提示词</div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.8)", lineHeight: 1.7 }}>{modalPrompt}</div>
                  </div>
                  <button onClick={() => setPromptEditorOpen(true)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: "rgba(255,138,31,.1)", border: "1px solid rgba(255,138,31,.28)", color: gold, fontSize: 12, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}>
                    <Wand2 style={{ width: 11, height: 11 }} />打开提示词编辑器
                  </button>

                  {/* Costume versions (角色特有) */}
                  {assetTab === "chars" && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: dim, fontWeight: 600, marginBottom: 8 }}>造型版本</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[{ id: "cv1", name: "日常便装", status: "done" as const }, { id: "cv2", name: "职业正装", status: "done" as const }].map(v => (
                          <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,.04)", border: `1px solid ${bdr}` }}>
                            {v.status === "done" ? <Check style={{ width: 10, height: 10, color: green }} /> : <Loader2 style={{ width: 10, height: 10, color: "#60a5fa", animation: "spin 1s linear infinite" }} />}
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,.8)" }}>{v.name}</span>
                          </div>
                        ))}
                        <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: dim, fontSize: 12, cursor: "pointer" }}>
                          <Plus style={{ width: 10, height: 10 }} />新增
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Remark */}
                  <div>
                    <div style={{ fontSize: 11, color: dim, fontWeight: 600, marginBottom: 5 }}>备注</div>
                    <textarea value={modalRemark} onChange={e => setModalRemark(e.target.value)} rows={3} placeholder="添加备注信息…"
                      style={{ width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${bdr}`, borderRadius: 9, padding: "9px 12px", fontSize: 12.5, color: "rgba(255,255,255,.8)", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6 }} />
                  </div>
                </div>

                {/* Footer actions */}
                <div style={{ padding: "14px 20px", borderTop: `1px solid ${bdr}`, display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
                  <button onClick={() => { setSelItem(null); setModalExpand(false); setPromptEditorOpen(false); }}
                    style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, cursor: "pointer", background: "rgba(255,255,255,.06)", border: `1px solid ${bdr}`, color: dim }}>
                    取消
                  </button>
                  <button onClick={() => { setSelItem(null); setModalExpand(false); setPromptEditorOpen(false); }}
                    style={{ padding: "8px 20px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "black", border: "none",
                      background: `linear-gradient(135deg,${gold},#FF6A1A)` }}>
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prompt full-screen editor */}
        {promptEditorOpen && selItem && (
          <div style={{ position: "fixed", inset: 0, zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.88)", backdropFilter: "blur(24px)" }}
            onClick={e => { if (e.target === e.currentTarget) setPromptEditorOpen(false); }}>
            <div style={{ width: "min(860px,94vw)", height: "min(600px,88vh)", background: "#0E0F16", border: "1px solid rgba(255,255,255,.12)", borderRadius: 20, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,.9)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: gold }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{selItem.name} · 提示词编辑</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 12, color: dim }}>{modalPrompt.length} 字</span>
                <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, background: "rgba(255,138,31,.1)", border: "1px solid rgba(255,138,31,.28)", cursor: "pointer", color: gold, fontSize: 12, fontWeight: 600 }}>
                  <Wand2 style={{ width: 12, height: 12 }} />AI 改写
                </button>
                <button onClick={() => setPromptEditorOpen(false)}
                  style={{ width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.55)", cursor: "pointer" }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
              <textarea value={modalPrompt} onChange={e => setModalPrompt(e.target.value)} autoFocus
                placeholder="在此输入或编辑生成提示词…"
                style={{ flex: 1, background: "transparent", border: "none", padding: "22px 26px", fontSize: 15, color: "rgba(255,255,255,.9)", outline: "none", resize: "none", lineHeight: 1.85, fontFamily: "inherit", boxSizing: "border-box" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 22px", borderTop: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
                <select value={modalRatio} onChange={e => setModalRatio(e.target.value)} style={{ ...ddSel, fontSize: 12 }}>
                  {["1:1", "4:3", "16:9", "3:4", "9:16"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={modalStyle} onChange={e => setModalStyle(e.target.value)} style={{ ...ddSel, fontSize: 12 }}>
                  {["写实", "水墨", "3D渲染", "漫画"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div style={{ flex: 1 }} />
                <button onClick={() => setPromptEditorOpen(false)}
                  style={{ padding: "8px 20px", borderRadius: 9, fontSize: 13, cursor: "pointer", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: dim }}>
                  取消
                </button>
                <button onClick={() => setPromptEditorOpen(false)}
                  style={{ padding: "8px 24px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "black", border: "none",
                    background: `linear-gradient(135deg,${gold},#FF6A1A)` }}>
                  保存并关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Voice modal */}
        {voiceOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 700, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.75)", backdropFilter: "blur(10px)" }}
            onClick={e => { if (e.target === e.currentTarget) { setVoiceOpen(false); setVoiceCreating(false); } }}>
            <div style={{ width: "min(560px,92vw)", background: "#0e0c1a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 22, padding: "24px", display: "flex", flexDirection: "column", gap: 16, maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "white", margin: 0 }}>配置音色</h3>
                  <div style={{ fontSize: 12, color: dim, marginTop: 2 }}>{voiceTarget || "音色管理"}</div>
                </div>
                <button onClick={() => { setVoiceOpen(false); setVoiceCreating(false); }} style={{ background: "none", border: "none", color: dim, cursor: "pointer", display: "flex" }}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 6 }}>
                {(["system", "custom"] as VTb[]).map(vt => (
                  <button key={vt} onClick={() => { setVoiceTab(vt); setVoiceCreating(false); setSelVoice(null); }}
                    style={{ flex: 1, padding: "8px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer",
                      background: voiceTab === vt ? "rgba(255,138,31,.12)" : "rgba(255,255,255,.05)",
                      border: `1px solid ${voiceTab === vt ? "rgba(255,138,31,.35)" : "rgba(255,255,255,.1)"}`,
                      color: voiceTab === vt ? gold : "rgba(255,255,255,.5)" }}>
                    {vt === "system" ? "系统音色" : "自定义音色"}
                  </button>
                ))}
              </div>

              {/* System voices */}
              {voiceTab === "system" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SYS_VOICES.map(v => (
                    <button key={v.id} onClick={() => setSelVoice(v.id)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                        background: selVoice === v.id ? "rgba(255,138,31,.08)" : "rgba(255,255,255,.04)",
                        border: `1px solid ${selVoice === v.id ? "rgba(255,138,31,.3)" : "rgba(255,255,255,.08)"}` }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: v.gender === "女" ? "rgba(244,114,182,.15)" : "rgba(96,165,250,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Mic2 style={{ width: 16, height: 16, color: v.gender === "女" ? "#f472b6" : "#60a5fa" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: "white" }}>{v.name}</span>
                          <span style={{ fontSize: 10.5, color: dim, background: "rgba(255,255,255,.06)", padding: "1px 7px", borderRadius: 20 }}>{v.tag}</span>
                        </div>
                        <div style={{ fontSize: 11, color: dim }}>{v.gender} · {v.age} · {v.lang}</div>
                      </div>
                      {selVoice === v.id && <Check style={{ width: 14, height: 14, color: gold, flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>
              )}

              {/* Custom voices list */}
              {voiceTab === "custom" && !voiceCreating && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {CUSTOM_VOICES.map(v => (
                    <button key={v.id} onClick={() => setSelVoice(v.id)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                        background: selVoice === v.id ? "rgba(255,138,31,.08)" : "rgba(255,255,255,.04)",
                        border: `1px solid ${selVoice === v.id ? "rgba(255,138,31,.3)" : "rgba(255,255,255,.08)"}` }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,138,31,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Mic2 style={{ width: 16, height: 16, color: gold }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "white", marginBottom: 3 }}>{v.name}</div>
                        <div style={{ fontSize: 11, color: dim }}>{v.gender} · {v.age} · {v.lang}</div>
                      </div>
                      {selVoice === v.id && <Check style={{ width: 14, height: 14, color: gold, flexShrink: 0 }} />}
                    </button>
                  ))}
                  <button onClick={() => setVoiceCreating(true)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", borderRadius: 12, background: "rgba(255,255,255,.03)", border: "2px dashed rgba(255,255,255,.1)", color: dim, fontSize: 13, cursor: "pointer" }}>
                    <Plus style={{ width: 14, height: 14 }} />克隆新音色
                  </button>
                </div>
              )}

              {/* Clone new voice form */}
              {voiceTab === "custom" && voiceCreating && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input value={cvName} onChange={e => setCvName(e.target.value)} placeholder="音色名称"
                    style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "white", outline: "none" }} />
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                    {(["男", "女"] as VGender[]).map(g => (
                      <button key={g} onClick={() => setCvGender(g)}
                        style={{ flex: 1, padding: "7px", borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: "pointer",
                          background: cvGender === g ? "rgba(255,138,31,.12)" : "rgba(255,255,255,.05)",
                          border: `1px solid ${cvGender === g ? "rgba(255,138,31,.35)" : "rgba(255,255,255,.1)"}`,
                          color: cvGender === g ? gold : "rgba(255,255,255,.5)" }}>
                        {g}
                      </button>
                    ))}
                    {(["儿童", "少年", "青年", "中年", "老年"] as VAge[]).map(a => (
                      <button key={a} onClick={() => setCvAge(a)}
                        style={{ flex: 1, padding: "7px", borderRadius: 9, fontSize: 11, fontWeight: 500, cursor: "pointer",
                          background: cvAge === a ? "rgba(255,138,31,.12)" : "rgba(255,255,255,.05)",
                          border: `1px solid ${cvAge === a ? "rgba(255,138,31,.35)" : "rgba(255,255,255,.1)"}`,
                          color: cvAge === a ? gold : "rgba(255,255,255,.5)" }}>
                        {a}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => setVoiceCreating(false)}
                      style={{ padding: "8px 16px", borderRadius: 9, fontSize: 13, cursor: "pointer", background: "rgba(255,255,255,.05)", border: `1px solid ${bdr}`, color: dim }}>
                      取消
                    </button>
                    <button disabled={!cvName.trim()}
                      style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: cvName.trim() ? "pointer" : "not-allowed",
                        background: cvName.trim() ? `linear-gradient(135deg,${gold},#FF6A1A)` : "rgba(255,138,31,.3)",
                        border: "none", color: "white", opacity: cvName.trim() ? 1 : 0.5 }}>
                      开始克隆（演示）
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {deleteTarget && (
          <div style={{ position: "fixed", inset: 0, zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.55)" }}
            onClick={() => setDeleteTarget(null)}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: "#1a1726", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: "28px 32px", width: 340, boxShadow: "0 20px 60px rgba(0,0,0,.7)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Trash2 style={{ width: 20, height: 20, color: "#f87171" }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 6 }}>确认删除</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.7, marginBottom: 22 }}>
                删除资产「{deleteTarget.name}」后不可恢复，关联的引用将会失效。确认继续？
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setDeleteTarget(null)}
                  style={{ flex: 1, padding: "9px", borderRadius: 11, fontSize: 13, fontWeight: 500, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.7)", cursor: "pointer" }}>
                  取消
                </button>
                <button onClick={() => { setDeletedIds(p => { const n = new Set(p); n.add(deleteTarget.id); return n; }); setDeleteTarget(null); }}
                  style={{ flex: 1, padding: "9px", borderRadius: 11, fontSize: 13, fontWeight: 700, background: "rgba(248,113,113,.18)", border: "1px solid rgba(248,113,113,.3)", color: "#f87171", cursor: "pointer" }}>
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══ Project list view ═════════════════════════════════════════════════════
  return (
    <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 4 }}>团队资产</h1>
          <p style={{ fontSize: 13, color: dim }}>管理团队共享资产：角色、场景、道具（共三类，独立团队钱包）</p>
        </div>
        <button
          onClick={() => navigate("new-project")}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
            background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
            backdropFilter: "blur(12px)", color: "rgba(255,255,255,.85)", cursor: "pointer" }}>
          <Plus style={{ width: 14, height: 14 }} />新建资产项目
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16 }}>
        {PROJECTS.map(proj => {
          const visible = getProjVisible(proj.id);
          const pOpen  = permOpen === proj.id;
          return (
            <div key={proj.id}
              style={{ aspectRatio: "3/4", position: "relative", borderRadius: 18, overflow: "hidden",
                cursor: "pointer", border: `1px solid ${pOpen ? "rgba(255,255,255,.2)" : bdr}`,
                background: card, transition: "border-color .15s,transform .2s", display: "flex", flexDirection: "column" }}
              onMouseEnter={e => { ((e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"); ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.18)"); }}
              onMouseLeave={e => { ((e.currentTarget as HTMLElement).style.transform = "translateY(0)"); ((e.currentTarget as HTMLElement).style.borderColor = pOpen ? "rgba(255,255,255,.2)" : bdr); }}>

              {/* Preview area */}
              <div onClick={() => { setSelProj(proj.id); setAssetTab("chars"); setPermOpen(null); }}
                style={{ flex: 1, position: "relative",
                  background: `radial-gradient(ellipse at 30% 25%, ${proj.color}2e 0%, transparent 60%), radial-gradient(ellipse at 75% 75%, ${proj.color}1a 0%, transparent 55%), ${card}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16,
                  background: `${proj.color}1c`, border: `1px solid ${proj.color}38`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 28px ${proj.color}1a` }}>
                  <Film style={{ width: 24, height: 24, color: proj.color }} />
                </div>
                <div style={{ textAlign: "center", padding: "0 14px" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 6 }}>{proj.name}</div>
                  <div style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, display: "inline-block",
                    background: `${proj.color}16`, border: `1px solid ${proj.color}32`, color: proj.color }}>
                    {proj.genre}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div onClick={() => { setSelProj(proj.id); setAssetTab("chars"); setPermOpen(null); }}
                style={{ padding: "11px 13px 12px",
                  background: "rgba(0,0,0,.32)", backdropFilter: "blur(12px)",
                  borderTop: "1px solid rgba(255,255,255,.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
                  {[
                    { l: "角色", v: proj.chars },
                    { l: "场景", v: proj.scenes },
                    { l: "道具", v: proj.props },
                  ].map(s => (
                    <div key={s.l} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "white" }}>{s.v}</div>
                      <div style={{ fontSize: 9.5, color: dim }}>{s.l}</div>
                    </div>
                  ))}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginTop: 1, color: proj.audioReady ? green : "rgba(255,255,255,.22)" }}>
                      {proj.audioReady ? "✓" : "—"}
                    </div>
                    <div style={{ fontSize: 9.5, color: dim }}>声音</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button onClick={e => { e.stopPropagation(); setPermOpen(pOpen ? null : proj.id); }}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      padding: "7px 0", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      background: pOpen ? "rgba(255,138,31,.18)" : "rgba(255,255,255,.07)",
                      border: `1px solid ${pOpen ? "rgba(255,138,31,.45)" : "rgba(255,255,255,.13)"}`,
                      color: pOpen ? gold : "rgba(255,255,255,.65)", transition: "all .15s" }}
                    onMouseEnter={e => { if (!pOpen) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.12)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.9)"; } }}
                    onMouseLeave={e => { if (!pOpen) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.07)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.65)"; } }}>
                    <Shield style={{ width: 11, height: 11 }} />访问权限
                  </button>
                  <button onClick={e => { e.stopPropagation(); setSelProj(proj.id); setAssetTab("chars"); setPermOpen(null); }}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      padding: "7px 0", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      background: `${proj.color}14`, border: `1px solid ${proj.color}35`, color: proj.color,
                      transition: "all .15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${proj.color}26`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${proj.color}14`; }}>
                    进入资产 <ChevronRight style={{ width: 11, height: 11 }} />
                  </button>
                </div>
              </div>

              {/* Permission overlay */}
              {pOpen && (
                <div onClick={e => e.stopPropagation()}
                  style={{ position: "absolute", inset: 0, zIndex: 10,
                    background: "rgba(9,10,15,0.92)", backdropFilter: "blur(18px)",
                    padding: "14px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.85)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Shield style={{ width: 12, height: 12, color: gold }} />访问权限
                    </span>
                    <button onClick={() => setPermOpen(null)}
                      style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,.5)", fontSize: 16, lineHeight: 1 }}>
                      ×
                    </button>
                  </div>
                  <div style={{ fontSize: 10, color: dim, marginBottom: 2 }}>
                    {visible.size} / {TEAM_MEMBERS.length} 成员可见
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, overflowY: "auto" }}>
                    {TEAM_MEMBERS.map(m => {
                      const on = visible.has(m.id);
                      return (
                        <button key={m.id} onClick={() => toggleMember(proj.id, m.id)}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 9, cursor: "pointer",
                            background: on ? "rgba(255,138,31,.12)" : "rgba(255,255,255,.04)",
                            border: `1px solid ${on ? "rgba(255,138,31,.3)" : "rgba(255,255,255,.08)"}` }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 700, background: on ? `${gold}22` : "rgba(255,255,255,.08)", color: on ? gold : "rgba(255,255,255,.4)" }}>
                            {m.avatar}
                          </div>
                          <div style={{ flex: 1, textAlign: "left" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: on ? "white" : "rgba(255,255,255,.55)" }}>{m.name}</div>
                            <div style={{ fontSize: 10, color: dim }}>{m.role}</div>
                          </div>
                          {on && <Check style={{ width: 10, height: 10, color: gold, flexShrink: 0 }} />}
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
    </div>
  );
}

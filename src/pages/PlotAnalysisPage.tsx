// ═══════════════════════════════════════════════════════════════════════════════════
// PlotAnalysisPage — 对齐 Figma Make PlotAnalysisPage.tsx
// 入口页（双入口卡片）+ 视频解析流程 + 小说改编流程
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import {
  ChevronRight, ChevronDown, Upload, FileText, Package, BarChart2,
  BookOpen, ListChecks, Check, Lock, Users, Film,
} from "lucide-react";
import type { Nav as NavType, PageId } from "../shared";
import { AssetsView } from "./PlotAnalysis/AssetsView";
import { ScriptView } from "./PlotAnalysis/ScriptView";
import { IA, NOVEL_ASSETS, EPS } from "./PlotAnalysis/shared";

// ═══ 设计 tokens（对齐 Make PlotAnalysisPage 内部 $） ═══════════════════════
const $ = {
  bg:   "#090A0E",
  s1:   "#0E0F14",
  s2:   "#13151C",
  s3:   "#181B24",
  bdr:  "rgba(255,255,255,0.07)",
  bdr2: "rgba(255,255,255,0.12)",
  t1:   "#F4F5F7",
  t2:   "#A4A8B3",
  t3:   "#6F7480",
  t4:   "rgba(255,255,255,0.2)",
  gold: "#FF8A1F",
  pur:  "#FF8A1F",
  teal: "#2DD4BF",
  red:  "#F87171",
  warn: "#F59E0B",
} as const;

// ═══ 视频分析场景数据（EPS 已迁移至 ./PlotAnalysis/shared） ══════════════════
const SCENES = [
  { id: "S01", time: "00:00", loc: "外·画廊门口", chars: ["林沐", "苏玫"], mood: 35 },
  { id: "S02", time: "02:14", loc: "内·展厅A",   chars: ["林沐", "苏玫", "路人"], mood: 68 },
  { id: "S03", time: "05:47", loc: "内·咖啡厅",   chars: ["林沐", "陈刚"], mood: 78 },
  { id: "S04", time: "09:12", loc: "外·街道",     chars: ["苏玫", "暗影"], mood: 85 },
  { id: "S05", time: "14:30", loc: "内·公寓",     chars: ["林沐"], mood: 31 },
];

// ═══ 资产条目类型（数据已迁移至 ./PlotAnalysis/shared） ═══════════════════════
type AEntry = {
  id: string;
  type: "角色" | "场景" | "道具";
  name: string;
  role?: "主角" | "配角" | "路人";
  prompt: string;
  ok: boolean;
  count: number;
};

// ═══ 区域图（Make 第 320-345 AreaChart） ════════════════════════════════════
function AreaChart({ vals, color, h = 72, labels }: { vals: number[]; color: string; h?: number; labels?: string[] }) {
  const W = 360; const PY = 6; const PX = 12; const LH = labels ? 14 : 0; const CH = h - PY * 2 - LH;
  const pts: [number, number][] = vals.map((v, i) => [PX + i * (W - PX * 2) / Math.max(1, vals.length - 1), PY + CH - (v / 100) * CH]);
  const tension = 0.32;
  let linePath = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension, cp1y = p1[1] + (p2[1] - p0[1]) * tension;
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension, cp2y = p2[1] - (p3[1] - p1[1]) * tension;
    linePath += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]},${PY + CH} L ${pts[0][0]},${PY + CH} Z`;
  const id = `ga${color.replace(/[^a-zA-Z0-9]/g, "")}${h}`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".18" />
          <stop offset="70%" stopColor={color} stopOpacity=".04" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 50, 100].map(v => (
        <line key={v} x1={PX} y1={PY + CH - (v / 100) * CH} x2={W - PX} y2={PY + CH - (v / 100) * CH} stroke="rgba(255,255,255,.035)" strokeWidth={0.8} />
      ))}
      <path d={areaPath} fill={`url(#${id})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={1.5} fill={$.bg} stroke={color} strokeWidth={1} />)}
      {labels && labels.map((l, i) => <text key={i} x={pts[i][0]} y={h - 1} fontSize={7.5} fill={$.t4} textAnchor="middle" fontFamily="system-ui">{l}</text>)}
    </svg>
  );
}

// ═══ 主页面：入口 + 视频解析 + 小说改编 ════════════════════════════════════
export function PlotAnalysisPage({ navigate }: NavType) {
  const [mode, setMode]     = useState<null | "video" | "novel">(null);
  const [phase, setPhase]   = useState<string>("analysis");

  // Video state
  const [vidFile, setVidFile] = useState("镜像·E01·正片.mp4");
  const [epIdx, setEpIdx]    = useState(0);
  const [sceneTab, setSceneTab] = useState<"curve" | "timeline" | "chars">("curve");
  const [assets, setAssets] = useState<AEntry[]>(IA);
  const updA = (id: string, p: Partial<AEntry>) =>
    setAssets(a => a.map(x => (x.id === id ? { ...x, ...p } : x)));
  const delA = (id: string) => setAssets(a => a.filter(x => x.id !== id));
  const addA = (type: AEntry["type"]) => {
    const e: AEntry = {
      id: `n${Date.now()}`, type, name: "新建",
      role: type === "角色" ? "配角" : undefined,
      prompt: "", ok: false, count: 0,
    };
    setAssets(a => [...a, e]);
  };

  // Novel assets (with sources tracing)
  const [noAssetsNA, setNoAssetsNA] = useState<AEntry[]>(NOVEL_ASSETS);
  const updNA = (id: string, p: Partial<AEntry>) =>
    setNoAssetsNA(a => a.map(x => (x.id === id ? { ...x, ...p } : x)));
  const delNA = (id: string) => setNoAssetsNA(a => a.filter(x => x.id !== id));
  const addNA = (type: AEntry["type"]) => {
    const e: AEntry = {
      id: `nn${Date.now()}`, type, name: "新建",
      role: type === "角色" ? "配角" : undefined,
      prompt: "", ok: false, count: 0,
    };
    setNoAssetsNA(a => [...a, e]);
  };

  // ScriptView episode rail
  const [scriptEp, setScriptEp] = useState(0);
  const [epLocked] = useState<Set<number>>(new Set([2]));

  // Novel plan state (Make phase "plan")
  const [adaptMode, setAdaptMode] = useState<"quick" | "pro">("quick");
  const [planEps, setPlanEps] = useState(24);
  const DUR = [
    { k: "short",  l: "短剧",     d: "~5分钟",  s: 300 },
    { k: "ep20",   l: "20集剧",  d: "~45分钟", s: 1200 },
    { k: "ep40",   l: "40集剧",  d: "~45分钟", s: 2400 },
    { k: "ep60",   l: "长剧",    d: "~45分钟", s: 3600 },
    { k: "custom", l: "自定义",  d: "" },
  ];
  const [durKey, setDurKey] = useState("ep20");
  const [durDrop, setDurDrop] = useState(false);
  const durSec = durKey === "custom" ? 300 : DUR.find(d => d.k === durKey)?.s ?? 1200;
  const currentDur = DUR.find(d => d.k === durKey) ?? DUR[1];
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["忠实原著"]);
  const [proFields, setProFields] = useState({
    audience: "18-35岁都市女性", fidelity: 75, rhythm: 60, conflict: 55, emotion: 70, narration: 20,
    targetWords: 1500, mustKeep: "主角林晚月", allowCut: "部分配角",
  });
  const [fidelity, setFidelity] = useState(75);

  const ep = EPS[epIdx];

  // ════════ 入口页（Make 700-799） ══════════════════════════════════════════
  if (mode === null) {
    return (
      <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", background: $.bg, overflow: "hidden" }}>
        {/* Ambient glows */}
        <div style={{ position: "absolute", inset: 0,
          background: "radial-gradient(ellipse,rgba(255,90,0,0.05) 0%,transparent 65%)", filter: "blur(100px)", pointerEvents: "none" }} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 48, padding: "0 60px", position: "relative" }}>

          <div style={{ textAlign: "center", position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 14px", borderRadius: 20,
              background: "rgba(255,138,31,.08)", border: "1px solid rgba(255,138,31,.2)", marginBottom: 18 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: $.gold, boxShadow: `0 0 6px ${$.gold}` }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", color: $.gold, textTransform: "uppercase" }}>剧情解析工作台</span>
            </div>
            <h1 style={{ fontSize: 38, fontWeight: 900, color: $.t1, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 14, whiteSpace: "nowrap" }}>
              从哪里开始你的创作？
            </h1>
            <p style={{ fontSize: 14, color: $.t3, lineHeight: 1.6 }}>已有视频或一部小说，均可直接生成可落地的分镜方案</p>
          </div>

          <div style={{ display: "flex", gap: 16, maxWidth: 820, width: "100%" }}>
            {([
              { mode: "video" as const, phase: "analysis",
                icon: Film,     color: $.gold, title: "视频解析", sub: "三步直达分镜创作",
                desc: "上传已有视频，AI 自动解析剧本结构、场景情绪与人物资产。",
                steps: ["剧情解析 — 情节曲线 · 场景 · 人物", "资产确认 — 角色 · 场景 · 道具提示词", "分镜剧本 — 编写 · 下载 · 进入工作台"],
                cta: "开始解析" },
              { mode: "novel" as const, phase: "import",
                icon: FileText, color: $.pur,  title: "小说转分镜", sub: "五步输出完整方案",
                desc: "导入原著，AI 依次完成理解·改编·分集·剧本编辑。",
                steps: ["导入·改编 — 上传原著 · 方案设定", "分集规划 — 集数 · 时长 · 锁定结构", "剧本编辑 — 逐集创作 · AI辅助", "资产确认 — 人物 · 场景 · 道具", "分镜创作 — 提示词 · 工作台"],
                cta: "开始改编" },
            ]).map(card => (
              <button key={card.mode}               onClick={() => {
                if (card.mode === "video") { setMode("video"); setPhase("analysis"); }
                else { setMode("novel"); setPhase("import"); }
              }}
                style={{ flex: 1, textAlign: "left", cursor: "pointer", transition: "all .25s cubic-bezier(.34,1.2,.64,1)",
                  borderRadius: 20, padding: "28px 26px 24px", border: `1px solid rgba(255,255,255,.08)`,
                  background: "rgba(255,255,255,.03)", backdropFilter: "blur(24px) saturate(160%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 8px 32px rgba(0,0,0,.4)",
                  position: "relative", overflow: "hidden" }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-4px)";
                  el.style.borderColor = `${card.color}45`;
                  el.style.background = `${card.color}09`;
                  el.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,.1), 0 20px 48px rgba(0,0,0,.5), 0 0 0 1px ${card.color}22`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.transform = "none";
                  el.style.borderColor = "rgba(255,255,255,.08)";
                  el.style.background = "rgba(255,255,255,.03)";
                  el.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.07), 0 8px 32px rgba(0,0,0,.4)";
                }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%",
                  background: `radial-gradient(ellipse,${card.color}14 0%,transparent 70%)`, pointerEvents: "none" }} />
                <div style={{ width: 46, height: 46, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
                  background: `${card.color}14`, border: `1px solid ${card.color}28`,
                  boxShadow: `0 4px 16px ${card.color}18` }}>
                  <card.icon style={{ width: 20, height: 20, color: card.color }} />
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 19, fontWeight: 800, color: $.t1, letterSpacing: "-0.02em" }}>{card.title}</span>
                  <span style={{ fontSize: 10.5, color: card.color, fontWeight: 600, background: `${card.color}12`,
                    padding: "1px 8px", borderRadius: 20, border: `1px solid ${card.color}25` }}>{card.sub}</span>
                </div>
                <p style={{ fontSize: 12.5, color: $.t3, lineHeight: 1.7, marginBottom: 20 }}>{card.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 22 }}>
                  {card.steps.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11.5, color: $.t4 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: card.color, minWidth: 14, marginTop: 2, opacity: 0.7 }}>{i + 1}</span>
                      {s}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: card.color, fontSize: 12.5, fontWeight: 700 }}>
                  {card.cta} <ChevronRight style={{ width: 13, height: 13 }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        </div>
    );
  }

  // ════════ 视频解析流程（Make 800-1100 部分） ══════════════════════════════
  if (mode === "video") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: $.bg, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${$.bdr}`, background: "rgba(8,8,14,.85)", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <button onClick={() => setMode(null)}
            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: $.t3, cursor: "pointer", fontSize: 12.5 }}>
            <ChevronRight style={{ width: 12, height: 12, transform: "rotate(180deg)" }} />返回解析入口
          </button>
          <span style={{ color: $.t4 }}>·</span>
          <span style={{ fontSize: 12.5, color: $.t1, fontWeight: 600 }}>镜像·S01</span>
          <span style={{ fontSize: 11, color: $.t4 }}>{vidFile}</span>
        </div>

        {/* Phase tabs */}
        <div style={{ padding: "10px 22px", borderBottom: `1px solid ${$.bdr}`, background: $.s1, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {[
            { k: "analysis", label: "剧情解析", icon: BarChart2, done: true },
            { k: "assets",   label: "资产确认", icon: Package,   done: assets.every(a => a.ok) },
            { k: "script",   label: "分镜剧本", icon: Film,      done: false },
          ].map((t) => (
            <button key={t.k} onClick={() => setPhase(t.k)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 9,
                border: `1px solid ${phase === t.k ? `${$.gold}45` : $.bdr}`,
                background: phase === t.k ? `${$.gold}10` : "rgba(255,255,255,.03)",
                cursor: "pointer", transition: "all .15s" }}>
              <t.icon style={{ width: 12, height: 12, color: phase === t.k ? $.gold : $.t4 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: phase === t.k ? $.t1 : $.t3 }}>{t.label}</span>
              {t.done && <Check style={{ width: 11, height: 11, color: $.teal }} />}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {phase === "analysis" && (
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
              {/* Left panel */}
              <div style={{ width: 180, flexShrink: 0, borderRight: `1px solid rgba(255,138,31,.1)`, display: "flex", flexDirection: "column", background: "rgba(8,8,14,.92)", backdropFilter: "blur(20px)" }}>
                <div style={{ padding: "13px 11px 10px", borderBottom: "1px solid rgba(255,138,31,.08)", flexShrink: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: $.gold, textTransform: "uppercase", marginBottom: 9, opacity: 0.65 }}>剧集列表</div>
                  <label style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 10px", borderRadius: 9, cursor: "pointer", border: "1px dashed rgba(255,138,31,.25)", background: "rgba(255,138,31,.04)", transition: "all .15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,138,31,.5)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,138,31,.25)"; }}>
                    <input type="file" accept="video/*" multiple style={{ display: "none" }} onChange={e => e.target.files?.[0] && setVidFile(e.target.files[0].name)} />
                    <Upload style={{ width: 12, height: 12, color: $.gold, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: $.gold, fontWeight: 600 }}>上传视频</span>
                  </label>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "7px" }}>
                  {EPS.map((e, i) => {
                    const active = epIdx === i;
                    const locked = epLocked.has(i);
                    return (
                      <button key={e.n} onClick={() => setEpIdx(i)}
                        style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, padding: "8px 9px", borderRadius: 10, border: `1px solid ${active ? "rgba(255,138,31,.38)" : "rgba(255,255,255,.04)"}`, background: active ? "rgba(255,138,31,.08)" : "transparent", cursor: "pointer", marginBottom: 3, textAlign: "left", transition: "all .18s", boxShadow: active ? "0 0 14px rgba(255,138,31,.14), inset 0 1px 0 rgba(255,138,31,.08)" : "none" }}
                        onMouseEnter={e2 => { if (!active) (e2.currentTarget as HTMLElement).style.background = "rgba(255,138,31,.04)"; }}
                        onMouseLeave={e2 => { if (!active) (e2.currentTarget as HTMLElement).style.background = "transparent"; }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, background: active ? "rgba(255,138,31,.22)" : "rgba(255,255,255,.05)", color: active ? $.gold : $.t4, border: `1px solid ${active ? "rgba(255,138,31,.45)" : $.bdr}` }}>
                            {i + 1 < 10 ? `0${i + 1}` : i + 1}
                          </div>
                          <span style={{ fontSize: 11.5, fontWeight: active ? 700 : 500, color: active ? $.gold : $.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{e.t}</span>
                          {locked && <Lock style={{ width: 9, height: 9, color: $.t4, flexShrink: 0 }} />}
                        </div>
                        <div style={{ fontSize: 10, color: active ? `${$.gold}88` : $.t4, paddingLeft: 22 }}>
                          {e.dur} · {e.chars.length} 角色
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Episode header */}
                <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(255,138,31,.04)", border: "1px solid rgba(255,138,31,.14)", backdropFilter: "blur(24px) saturate(150%)", boxShadow: "0 0 28px rgba(255,138,31,.07), inset 0 1px 0 rgba(255,138,31,.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                        <div style={{ width: 3, height: 16, borderRadius: 2, background: $.gold, boxShadow: `0 0 8px ${$.gold}`, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: $.gold, opacity: 0.7, textTransform: "uppercase" }}>E{String(ep.n).padStart(2, "0")}</span>
                        <span style={{ fontSize: 17, fontWeight: 900, color: $.t1, letterSpacing: "-0.02em" }}>{ep.t}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: $.t3, paddingLeft: 12, lineHeight: 1.5 }}>{ep.synopsis}</div>
                    </div>
                    <div style={{ display: "flex", gap: 14, flexShrink: 0, marginLeft: 16 }}>
                      {[["时长", ep.dur], ["场景", `${SCENES.length}`], ["角色", `${ep.chars.length}`]].map(([l, v]) => (
                        <div key={l} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 15, fontWeight: 900, color: $.gold, letterSpacing: "-0.02em", textShadow: `0 0 10px rgba(255,138,31,.4)` }}>{v}</div>
                          <div style={{ fontSize: 9.5, color: $.t4, marginTop: 1 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scene tabs */}
                <div style={{ display: "flex", gap: 4, padding: "4px 6px", background: "rgba(255,255,255,.04)", borderRadius: 10, border: `1px solid ${$.bdr}`, alignSelf: "flex-start" }}>
                  {([["curve", "情节曲线", BarChart2], ["timeline", "场景时间线", Film], ["chars", "人物群像", Users]] as const).map(([k, label, Icon]) => (
                    <button key={k} onClick={() => setSceneTab(k)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: sceneTab === k ? 700 : 400, background: sceneTab === k ? `${$.gold}15` : "transparent", color: sceneTab === k ? $.gold : $.t3, cursor: "pointer", border: "none", transition: "all .15s" }}>
                      <Icon style={{ width: 12, height: 12 }} />
                      {label}
                    </button>
                  ))}
                </div>

                {sceneTab === "curve" && (
                  <>
                    <div style={{ borderRadius: 14, padding: "16px 20px", background: "rgba(45,212,191,.04)", border: "1px solid rgba(45,212,191,.1)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: $.t1 }}>情绪曲线</div>
                        <span style={{ fontSize: 11, color: $.teal, fontWeight: 600 }}>峰值 {Math.max(...SCENES.map(s => s.mood))} · 谷值 {Math.min(...SCENES.map(s => s.mood))}</span>
                      </div>
                      <AreaChart vals={SCENES.map(s => s.mood)} color={$.teal} h={86} labels={SCENES.map(s => s.id)} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {SCENES.map(s => (
                        <div key={s.id} style={{ padding: "12px 14px", borderRadius: 11, background: "rgba(255,255,255,.025)", border: `1px solid ${$.bdr}`, display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,138,31,.1)", border: "1px solid rgba(255,138,31,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: $.gold, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.id}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 12.5, color: $.t1, fontWeight: 600 }}>{s.loc}</span>
                              <span style={{ fontSize: 11, color: $.t3 }}>{s.time}</span>
                            </div>
                            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                              {s.chars.map(c => (
                                <span key={c} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: "rgba(255,255,255,.04)", color: $.t3, border: `1px solid ${$.bdr}` }}>{c}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: s.mood >= 70 ? $.red : s.mood >= 40 ? $.gold : $.teal }}>{s.mood}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {sceneTab === "timeline" && (
                  <div style={{ padding: 24, borderRadius: 14, background: "rgba(255,255,255,.025)", border: `1px solid ${$.bdr}`, textAlign: "center", color: $.t3, fontSize: 13 }}>
                    场景时间线视图（结构骨架，时间轴布局已对齐 Make）
                  </div>
                )}

                {sceneTab === "chars" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {ep.chars.map(c => (
                      <div key={c} style={{ padding: "12px 14px", borderRadius: 11, background: "rgba(255,255,255,.025)", border: `1px solid ${$.bdr}`, display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,138,31,.1)", border: "1px solid rgba(255,138,31,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: $.gold }}>{c[0]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: $.t1 }}>{c}</div>
                          <div style={{ fontSize: 11, color: $.t3 }}>出现在 {Math.floor(Math.random() * 5) + 1} 个场景</div>
                        </div>
                        <button style={{ padding: "4px 12px", borderRadius: 7, background: "rgba(255,138,31,.1)", border: `1px solid rgba(255,138,31,.3)`, color: $.gold, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>查看轨迹</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {phase === "assets" && (
            <AssetsView
              mode={"video"}
              assets={assets}
              updA={updA}
              delA={delA}
              addA={addA}
              onNext={() => setPhase("script")}
            />
          )}
          {phase === "script" && (
            <ScriptView
              mode={"video"}
              assets={assets}
              scriptEp={scriptEp}
              setScriptEp={setScriptEp}
              onJumpToStoryboard={() => navigate("storyboard")}
            />
          )}
        </div>
      </div>
    );
  }

  // ════════ 小说改编流程（Make 1500+ 部分骨架） ═════════════════════════════

            <div style={{ flex: 1, overflowY: "auto", padding: "7px" }}>
              {EPS.map((e, i) => {
                const active = epIdx === i;
                const locked = epLocked.has(i);
                return (
                  <button key={e.n} onClick={() => setEpIdx(i)}
                    style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, padding: "8px 9px",
                      borderRadius: 10, border: `1px solid ${active ? "rgba(255,138,31,.38)" : "rgba(255,255,255,.04)"}`,
                      background: active ? "rgba(255,138,31,.08)" : "transparent",
                      cursor: "pointer", marginBottom: 3, textAlign: "left", transition: "all .18s",
                      boxShadow: active ? "0 0 14px rgba(255,138,31,.14), inset 0 1px 0 rgba(255,138,31,.08)" : "none" }}
                    onMouseEnter={e2 => { if (!active) (e2.currentTarget as HTMLElement).style.background = "rgba(255,138,31,.04)"; }}
                    onMouseLeave={e2 => { if (!active) (e2.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800,
                        background: active ? "rgba(255,138,31,.22)" : "rgba(255,255,255,.05)",
                        color: active ? $.gold : $.t4, border: `1px solid ${active ? "rgba(255,138,31,.45)" : $.bdr}` }}>
                        {i + 1 < 10 ? `0${i + 1}` : i + 1}
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: active ? 700 : 500, color: active ? $.gold : $.t2,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{e.t}</span>
                      {locked && <Lock style={{ width: 9, height: 9, color: $.t4, flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 10, color: active ? `${$.gold}88` : $.t4, paddingLeft: 22 }}>
                      {e.dur} · {e.chars.length} 角色
                    </div>
                  </button>
                );
              })}
            </div>

  // ════════ 小说改编流程（Make 1500+ 部分骨架） ═════════════════════════════
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: $.bg, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 22px", borderBottom: `1px solid ${$.bdr}`, background: "rgba(8,8,14,.85)", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <button onClick={() => setMode(null)}
          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: $.t3, cursor: "pointer", fontSize: 12.5 }}>
          <ChevronRight style={{ width: 12, height: 12, transform: "rotate(180deg)" }} />返回解析入口
        </button>
        <span style={{ color: $.t4 }}>·</span>
        <span style={{ fontSize: 12.5, color: $.t1, fontWeight: 600 }}>小说改编</span>
      </div>

      {/* Phase tabs */}
      <div style={{ padding: "10px 22px", borderBottom: `1px solid ${$.bdr}`, background: $.s1, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {[
          { k: "import",   label: "导入·改编", icon: BookOpen,   done: true },
          { k: "plan",     label: "分集规划",  icon: ListChecks, done: false },
          { k: "assets",   label: "资产确认",  icon: Package,    done: false },
          { k: "script",   label: "剧本编辑",  icon: FileText,   done: false },
        ].map(t => (
          <button key={t.k} onClick={() => setPhase(t.k)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 9,
              border: `1px solid ${phase === t.k ? `${$.pur}45` : $.bdr}`,
              background: phase === t.k ? `${$.pur}10` : "rgba(255,255,255,.03)",
              cursor: "pointer", transition: "all .15s" }}>
            <t.icon style={{ width: 12, height: 12, color: phase === t.k ? $.pur : $.t4 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: phase === t.k ? $.t1 : $.t3 }}>{t.label}</span>
            {t.done && <Check style={{ width: 11, height: 11, color: $.teal }} />}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px" }}>
        {phase === "import" && (
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ padding: 24, borderRadius: 14, background: $.s2, border: `1px solid ${$.bdr}` }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: $.t1, marginBottom: 8 }}>原著导入</h2>
              <p style={{ fontSize: 12.5, color: $.t3, lineHeight: 1.6, marginBottom: 14 }}>已上传 <span style={{ color: $.gold, fontWeight: 600 }}>镜花录·全本.txt</span> · 312 KB · 共 184 页</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ padding: "8px 16px", borderRadius: 9, background: `${$.pur}10`, border: `1px solid ${$.pur}30`, color: $.pur, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Upload style={{ width: 11, height: 11, marginRight: 5, verticalAlign: "middle" }} />重新上传
                </button>
                <button style={{ padding: "8px 16px", borderRadius: 9, background: "rgba(255,255,255,.04)", border: `1px solid ${$.bdr}`, color: $.t3, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  查看原文
                </button>
              </div>
            </div>

            <div style={{ padding: 24, borderRadius: 14, background: $.s2, border: `1px solid ${$.bdr}` }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: $.t1, marginBottom: 14 }}>改编方案</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: $.t3, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>目标受众</label>
                  <input defaultValue="18-35岁都市女性" style={{ width: "100%", background: "rgba(255,255,255,.05)", border: `1px solid ${$.bdr}`, borderRadius: 9, padding: "9px 12px", fontSize: 12.5, color: $.t1, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: $.t3, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>目标集数</label>
                  <input type="number" defaultValue={24} style={{ width: "100%", background: "rgba(255,255,255,.05)", border: `1px solid ${$.bdr}`, borderRadius: 9, padding: "9px 12px", fontSize: 12.5, color: $.t1, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: $.t3, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>核心主题</label>
                <textarea defaultValue="身份认同 · 信任的重建 · 命运的轮回" rows={2} style={{ width: "100%", background: "rgba(255,255,255,.05)", border: `1px solid ${$.bdr}`, borderRadius: 9, padding: "9px 12px", fontSize: 12.5, color: $.t1, outline: "none", boxSizing: "border-box", resize: "none", fontFamily: "inherit" }} />
              </div>
            </div>

            <button onClick={() => setPhase("plan")}
              style={{ padding: "12px 0", borderRadius: 11, fontSize: 13, fontWeight: 700, color: "black", border: "none",
                background: `linear-gradient(135deg,${$.pur},#FF6A1A)`, cursor: "pointer",
                boxShadow: "0 4px 20px rgba(255,138,31,.32)" }}>
              下一步：分集规划 →
            </button>
          </div>
        )}

        {phase === "plan" && (
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* LEFT: 改编预览 */}
            <div style={{ flex: 1, background: $.s2, borderRadius: 14, border: `1px solid ${$.bdr}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${$.bdr}`, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, background: $.pur, color: "#fff", borderRadius: 4, padding: "1px 7px", fontWeight: 700, opacity: 0.85 }}>01</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: $.t2, letterSpacing: "0.02em" }}>改编预览</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: $.t4 }}>集数锁定保护</span>
              </div>
              <div style={{ padding: "10px 14px" }}>
                {/* Stats row */}
                <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
                  {[[planEps, "总集数"], [Math.round(planEps * 3), "场景数"], [Math.round(planEps * 8), "总镜数"], [Math.round(planEps * durSec / 3600 * 10) / 10, "预估时长"]].map(([v, l]) => (
                    <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: $.t1 }}>{v}</span>
                      <span style={{ fontSize: 10.5, color: $.t4 }}>{l}</span>
                    </div>
                  ))}
                </div>
                {/* Episode list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {["第1集《序章》", "第2集《初遇》", "第3集《波澜》", "第4集《困局》", "第5集《抉择》"].map((name, i) => (
                    <div key={i} style={{
                      padding: "8px 12px", borderRadius: 9,
                      background: i === 2 ? `${$.pur}0a` : "rgba(255,255,255,.025)",
                      border: `1px solid ${i === 2 ? $.pur + "30" : $.bdr}`,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <Lock style={{ width: 9, height: 9, color: i === 2 ? $.pur : $.t4, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: i === 2 ? $.t1 : $.t3, fontWeight: i === 2 ? 600 : 400 }}>{name}</span>
                      <span style={{ fontSize: 10.5, color: $.t4, marginLeft: "auto" }}>情绪 68% · 5 场景</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: 改编参数 */}
            <div style={{ background: $.s2, borderRadius: 14, border: `1px solid ${$.bdr}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${$.bdr}`, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, background: $.pur, color: "#fff", borderRadius: 4, padding: "1px 7px", fontWeight: 700, opacity: 0.85 }}>02</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: $.t2, letterSpacing: "0.02em" }}>改编参数</span>
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", borderRadius: 7, overflow: "hidden", border: `1px solid ${$.bdr}`, background: "rgba(255,255,255,.03)" }}>
                  {([["quick", "快速"], ["pro", "专业"]] as const).map(([k, label]) => (
                    <button key={k} onClick={() => setAdaptMode(k)}
                      style={{ padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none",
                        background: adaptMode === k ? "rgba(168,85,247,0.15)" : "transparent",
                        color: adaptMode === k ? $.pur : $.t4, transition: "all .12s" }}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ padding: "0 20px" }}>
                {/* 总集数 */}
                <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "12px 0", borderBottom: `1px solid ${$.bdr}` }}>
                  <span style={{ fontSize: 12, color: $.t3, fontWeight: 500, width: 88, flexShrink: 0 }}>总集数</span>
                  <input type="range" min={6} max={120} step={2} value={planEps}
                    onChange={e => setPlanEps(+e.target.value)}
                    style={{ flex: 1, accentColor: $.pur, margin: "0 12px" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <input type="number" min={6} max={120} step={2} value={planEps}
                      onChange={e => setPlanEps(Math.max(6, Math.min(120, +e.target.value)))}
                      style={{ width: 46, background: "rgba(255,255,255,.06)", border: `1px solid ${$.bdr}`, borderRadius: 6, padding: "3px 6px", fontSize: 13, fontWeight: 700, color: $.t1, outline: "none", textAlign: "center" }} />
                    <span style={{ fontSize: 11, color: $.t4 }}>集</span>
                  </div>
                </div>
                {/* 单集时长 */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 0, padding: "12px 0", borderBottom: `1px solid ${$.bdr}` }}>
                  <span style={{ fontSize: 12, color: $.t3, fontWeight: 500, width: 88, flexShrink: 0, paddingTop: 2 }}>单集时长</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <button onClick={() => setDurDrop(p => !p)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 7, fontSize: 13, cursor: "pointer", background: "rgba(255,255,255,.05)", border: `1px solid ${$.bdr}`, color: $.t2 }}>
                        {currentDur.l}<span style={{ fontSize: 11, color: $.t4 }}>{currentDur.d}</span>
                        <ChevronDown style={{ width: 11, height: 11, opacity: 0.5, transform: durDrop ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                      </button>
                      {durDrop && (
                        <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, zIndex: 100, background: "#13151C", border: `1px solid ${$.bdr}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,.8)", minWidth: 220 }}>
                          {DUR.map(d => (
                            <button key={d.k} onClick={() => { setDurKey(d.k); setDurDrop(false); }}
                              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", background: durKey === d.k ? "rgba(168,85,247,0.08)" : "none", border: "none", color: durKey === d.k ? $.pur : $.t2, fontSize: 13, cursor: "pointer", textAlign: "left" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.05)"}
                              onMouseLeave={e => e.currentTarget.style.background = durKey === d.k ? "rgba(168,85,247,0.08)" : "none"}>
                              <span>{d.l}</span><span style={{ fontSize: 11, color: $.t4 }}>{d.d}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* 改编风格 */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 0, padding: "12px 0", borderBottom: `1px solid ${$.bdr}` }}>
                  <span style={{ fontSize: 12, color: $.t3, fontWeight: 500, width: 88, flexShrink: 0, paddingTop: 4 }}>改编风格</span>
                  <div style={{ flex: 1, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["忠实原著", "影视化", "轻松休闲", "悬疑强化", "情感升温", "商战加重"].map(s => (
                      <button key={s}
                        onClick={() => setSelectedStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                        style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                          background: selectedStyles.includes(s) ? `${$.pur}15` : "rgba(255,255,255,.05)",
                          border: `1px solid ${selectedStyles.includes(s) ? $.pur + "40" : $.bdr}`,
                          color: selectedStyles.includes(s) ? $.pur : $.t3, transition: "all .12s" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 专业模式额外字段 */}
                {adaptMode === "pro" && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "12px 0", borderBottom: `1px solid ${$.bdr}` }}>
                      <span style={{ fontSize: 12, color: $.t3, fontWeight: 500, width: 88, flexShrink: 0 }}>目标受众</span>
                      <input value={proFields.audience} onChange={e => setProFields(p => ({ ...p, audience: e.target.value }))}
                        style={{ flex: 1, background: "none", border: "none", padding: 0, fontSize: 13, color: $.t2, outline: "none", fontFamily: "inherit" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "12px 0", borderBottom: `1px solid ${$.bdr}` }}>
                      <span style={{ fontSize: 12, color: $.t3, fontWeight: 500, width: 88, flexShrink: 0 }}>原著还原度</span>
                      <input type="range" min={20} max={100} value={fidelity} onChange={e => setFidelity(+e.target.value)}
                        style={{ flex: 1, margin: "0 12px", accentColor: $.pur }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: $.t1, minWidth: 36, flexShrink: 0 }}>{fidelity}%</span>
                    </div>
                    {[["节奏强度", "rhythm", "激烈程度"], ["冲突密度", "conflict", "每集冲突点"], ["情绪浓度", "emotion", "情感饱和度"]].map(([label, key, _aux]) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: 0, padding: "12px 0", borderBottom: `1px solid ${$.bdr}` }}>
                        <span style={{ fontSize: 12, color: $.t3, fontWeight: 500, width: 88, flexShrink: 0 }}>{label}</span>
                        <input type="range" min={0} max={100}
                          value={(proFields as Record<string, number | string>)[key] as number}
                          onChange={e => setProFields(p => ({ ...p, [key]: +e.target.value }))}
                          style={{ flex: 1, margin: "0 12px", accentColor: $.pur }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: $.t1, minWidth: 36, flexShrink: 0 }}>{(proFields as Record<string, number | string>)[key]}%</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "12px 0", borderBottom: `1px solid ${$.bdr}` }}>
                      <span style={{ fontSize: 12, color: $.t3, fontWeight: 500, width: 88, flexShrink: 0 }}>旁白比例</span>
                      <input type="range" min={0} max={60} value={proFields.narration} onChange={e => setProFields(p => ({ ...p, narration: +e.target.value }))}
                        style={{ flex: 1, margin: "0 12px", accentColor: $.pur }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: $.t1, minWidth: 36, flexShrink: 0 }}>{proFields.narration}%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "12px 0" }}>
                      <span style={{ fontSize: 12, color: $.t3, fontWeight: 500, width: 88, flexShrink: 0 }}>目标字数</span>
                      <input type="range" min={500} max={5000} step={100} value={proFields.targetWords}
                        onChange={e => setProFields(p => ({ ...p, targetWords: +e.target.value }))}
                        style={{ flex: 1, margin: "0 12px", accentColor: $.pur }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: $.t1, minWidth: 52, flexShrink: 0 }}>
                        {proFields.targetWords.toLocaleString()}<span style={{ fontSize: 10, color: $.t4, fontWeight: 400 }}> 字/集</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
              {/* CTA */}
              <div style={{ padding: "14px 20px", borderTop: `1px solid ${$.bdr}`, background: "rgba(168,85,247,0.03)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11, color: $.t4, lineHeight: 1.5 }}>
                  {planEps} 集 · {currentDur.l} · {adaptMode === "quick" ? "快速" : "专业"}模式
                </div>
                <button onClick={() => setPhase("assets")}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 22px", borderRadius: 9, fontSize: 13, fontWeight: 700,
                    background: `linear-gradient(135deg,${$.pur},#C94AFF)`, border: "none", color: "#fff", cursor: "pointer",
                    boxShadow: `0 4px 16px ${$.pur}45`, letterSpacing: "0.02em" }}>
                  生成分集规划 <ChevronRight style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          </div>
          )}

        {phase === "assets" && (
          <AssetsView
            mode={"novel"}
            assets={noAssetsNA}
            updA={updNA}
            delA={delNA}
            addA={addNA}
            onNext={() => setPhase("script")}
          />
        )}

        {phase === "script" && (
          <ScriptView
            mode={"novel"}
            assets={noAssetsNA}
            scriptEp={scriptEp}
            setScriptEp={setScriptEp}
            onJumpToStoryboard={() => navigate("storyboard")}
          />
        )}
      </div>
    </div>
  );
}

// ═══ 占位 PlotAnalysisDetailPage（剧情解析详情 — 保留返回入口能力） ══════════
export function PlotAnalysisDetailPage({ navigate }: { navigate: (p: PageId) => void }) {
  return (
    <div style={{ flex: 1, padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#A4A8B3", marginBottom: 16 }}>
        <button onClick={() => navigate("plot-analysis")} style={{ background: "none", border: "none", color: "#A4A8B3", cursor: "pointer" }}>
          剧情解析
        </button>
      </div>
      <div style={{ padding: 24, borderRadius: 14, background: "#13151C", border: "1px solid rgba(255,255,255,.07)", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#A4A8B3" }}>剧情解析详情页（结构骨架，使用侧栏「解析」入口查看完整流程）</p>
      </div>
    </div>
  );
}

export default PlotAnalysisPage;

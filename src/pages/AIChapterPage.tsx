// ═══════════════════════════════════════════════════════════════════════════════════
// AIChapterPage - 改编结果（AI分集规划 + 剧本编辑）
// 设计来源：Figma Make AIChapterPage (src/app/LandingSection.tsx)
// 标记为：设计补全（非原稿还原，基于 Make 源码结构适配本地 token）
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import {
  ChevronRight, CheckCircle, Wand2, User, MapPin, Package,
  Plus, Trash2,
} from "lucide-react";
import { PROJECT, colors, gold } from "../shared";
import type { PageId } from "../shared";

interface NavType { navigate: (p: PageId) => void; }

// 本地 shared token 映射
const surface = "linear-gradient(145deg,rgba(255,255,255,.055) 0%,transparent 45%),rgba(14,11,22,.97)";
const cardShadow = "inset 0 1px 0 rgba(255,255,255,.11), 0 8px 32px rgba(0,0,0,.45)";
const bdr = "rgba(210,205,230,.14)";
const textMuted = "rgba(255,255,255,.45)";
const textDim = "rgba(255,255,255,.6)";

type Episode = {
  id: string; title: string; shots: number; secPerShot: number;
  desc: string; script: string; wordCount: number;
};

const INIT_EPISODES: Episode[] = [
  { id: "ep-01", title: "第一集", shots: 4, secPerShot: 5,
    desc: "陈默与林凯意外相遇，氛围冷淡", wordCount: 620,
    script: "第一集《相遇》\n\n公司走廊 · 白天\n\n陈默走在空旷的走廊上，脚步声在大理石地板上回响。\n\n林凯（轻声）：你昨天没接我电话。\n陈默（不停步）：开会。\n林凯：你知道那不是理由。\n\n陈默终于停下脚步，转过身，眼神疏离。" },
  { id: "ep-02", title: "第二集", shots: 5, secPerShot: 5,
    desc: "陈默独自整理文件，窗外城市", wordCount: 780,
    script: "第二集《独处》\n\n陈默办公室 · 下午\n\n落地窗外，城市在金色光线中延伸。陈默一份一份地整理文件，动作机械而精准。\n\n手机屏幕亮起：林凯。\n\n陈默盯着屏幕，直到它熄灭。" },
  { id: "ep-03", title: "第三集", shots: 6, secPerShot: 5,
    desc: "两人再次相遇，矛盾激化", wordCount: 940,
    script: "第三集《回声》\n\n天台 · 傍晚\n\n霞光将两人的影子拉得很长。\n\n林凯：你一直在逃。\n陈默：我只是不想解释。\n林凯：那就听我说。\n\n陈默转身走向楼梯口，林凯伸手——" },
  { id: "ep-04", title: "第四集", shots: 3, secPerShot: 5,
    desc: "陈默独自乘地铁，闪回记忆", wordCount: 510,
    script: "第四集《闪回》\n\n地铁站 · 夜晚\n\n人群涌动，陈默站在角落，任由车厢摇晃。\n\n记忆碎片：林凯拍她肩膀，那个她还会笑的下午。\n\n地铁报站。陈默闭上眼睛。" },
  { id: "ep-05", title: "第五集", shots: 2, secPerShot: 5,
    desc: "陈默驻足门外，没有按门铃", wordCount: 370,
    script: "第五集《门外》\n\n林凯家门口 · 深夜\n\n路灯昏黄，陈默站在门前，手悬在门铃上。\n\n许久，她放下手，转身离开。\n\n门缝里透出的灯光，慢慢熄灭。" },
];

const ENTITIES = {
  chars: [
    { name: "陈默", desc: "女主，都市职场女性，30岁", n: 16 },
    { name: "林凯", desc: "男主，温柔执着", n: 12 },
  ],
  scenes: [
    { name: "公司走廊", desc: "现代办公大楼，冷色调", n: 4 },
    { name: "天台", desc: "城市高楼，傍晚霞光", n: 6 },
  ],
  props: [
    { name: "手机", desc: "未接来电记录", n: 2 },
    { name: "文件夹", desc: "工作文件", n: 1 },
  ],
};

const TABS = [
  { k: "chars" as const, l: "人物", icon: User },
  { k: "scenes" as const, l: "场景", icon: MapPin },
  { k: "props" as const, l: "道具", icon: Package },
];

const DUR_OPTIONS = [3, 4, 5, 6, 8, 10, 12, 15];

export default function AIChapterPage({ navigate }: NavType) {
  const [episodes, setEpisodes] = useState<Episode[]>(INIT_EPISODES);
  const [activeId, setActiveId] = useState("ep-01");
  const [eTab, setETab] = useState<"chars" | "scenes" | "props">("chars");
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const activeEp = episodes.find(e => e.id === activeId)!;

  const updateScript = (val: string) => {
    setEpisodes(prev => prev.map(e => e.id === activeId
      ? { ...e, script: val, wordCount: val.replace(/\s/g, "").length }
      : e));
    setSaved(prev => ({ ...prev, [activeId]: false }));
  };

  const saveScript = () => {
    setSaved(prev => ({ ...prev, [activeId]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [activeId]: false })), 2000);
  };

  const deleteEpisode = (id: string) => {
    if (episodes.length <= 1) return;
    const nums = ["一","二","三","四","五","六","七","八","九","十"];
    const newList = episodes.filter(e => e.id !== id).map((e, i) => ({
      ...e, title: `第${nums[i] ?? i + 1}集`,
    }));
    setEpisodes(newList);
    if (activeId === id) setActiveId(newList[0].id);
  };

  const addEpisode = () => {
    const nums = ["一","二","三","四","五","六","七","八","九","十"];
    const n = episodes.length;
    const newEp: Episode = {
      id: `ep-${String(n + 1).padStart(2, "0")}`,
      title: `第${nums[n] ?? n + 1}集`,
      shots: 0, secPerShot: 5, desc: "新增集数", wordCount: 0, script: "",
    };
    setEpisodes(prev => [...prev, newEp]);
    setActiveId(newEp.id);
  };

  const totalShots = episodes.reduce((s, e) => s + e.shots, 0);
  const totalSec = episodes.reduce((s, e) => s + e.shots * e.secPerShot, 0);

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

      {/* ─── Left Panel ─── */}
      <div style={{
        width: 300, minWidth: 300, background: colors.bgSecondary,
        borderRight: `1px solid ${colors.border}`, display: "flex",
        flexDirection: "column", flexShrink: 0,
      }}>
        {/* Breadcrumb */}
        <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: textMuted }}>
            <button onClick={() => navigate("projects")}
              style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", padding: 0, fontSize: 12 }}>
              剧目创作
            </button>
            <ChevronRight style={{ width: 12, height: 12 }} />
            <span style={{ color: textDim }}>{PROJECT.name}</span>
            <ChevronRight style={{ width: 12, height: 12 }} />
            <span style={{ color: "rgba(255,255,255,.7)", fontWeight: 500 }}>改编结果</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.border}`, display: "flex", gap: 8 }}>
          {[
            { label: "集数", v: episodes.length },
            { label: "镜数", v: totalShots },
            { label: "时长", v: `${totalSec}秒` },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, padding: "8px 0", textAlign: "center",
              background: "rgba(255,255,255,.03)", borderRadius: 8,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{s.v}</div>
              <div style={{ fontSize: 10, color: textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Episode list */}
        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
          {episodes.map(ep => (
            <div key={ep.id}
              onClick={() => setActiveId(ep.id)}
              style={{
                padding: "10px 12px", borderRadius: 10, marginBottom: 6, cursor: "pointer",
                background: activeId === ep.id ? "rgba(255,138,31,.1)" : "rgba(255,255,255,.02)",
                border: `1px solid ${activeId === ep.id ? "rgba(255,138,31,.3)" : "rgba(255,255,255,.05)"}`,
                transition: "all .15s",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: activeId === ep.id ? "white" : "rgba(255,255,255,.7)" }}>
                  {ep.title}
                </span>
                {activeId === ep.id && (
                  <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); deleteEpisode(ep.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, padding: 2 }}>
                    <Trash2 style={{ width: 12, height: 12 }} />
                  </button>
                )}
              </div>
              <div style={{ fontSize: 11, color: textMuted, marginBottom: 4 }}>{ep.desc}</div>
              <div style={{ display: "flex", gap: 8, fontSize: 11, color: "rgba(255,255,255,.3)" }}>
                <span>{ep.shots} 镜</span>
                <span>{ep.secPerShot}秒/镜</span>
                <span>{ep.wordCount.toLocaleString()} 字</span>
              </div>
            </div>
          ))}
          <button onClick={addEpisode}
            style={{
              width: "100%", padding: "9px 0", borderRadius: 10, marginTop: 4,
              background: "rgba(255,255,255,.03)", border: `1px dashed ${colors.border}`,
              color: textMuted, fontSize: 12, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 6,
            }}>
            <Plus style={{ width: 13, height: 13 }} />新增集数
          </button>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Pipeline progress bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)",
          borderRadius: 12, padding: "10px 18px",
        }}>
          {([
            { label: "原著理解", desc: "角色·场景·主题提取", done: true },
            { label: "分集规划", desc: "章节拆分·镜头配置", done: true },
            { label: "进入制作", desc: "资产生成·分镜制作", done: false },
          ] as const).map((step, i) => (
            <div key={step.label} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  background: step.done ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.07)",
                  border: `1px solid ${step.done ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.1)"}`,
                  color: step.done ? "#34d399" : textMuted,
                }}>
                  {step.done
                    ? <CheckCircle style={{ width: 13, height: 13 }} />
                    : i + 1}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: step.done ? "#F4F5F7" : textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{step.label}</div>
                  <div style={{ fontSize: 10.5, color: textMuted }}>{step.desc}</div>
                </div>
              </div>
              {i < 2 && <div style={{ width: 28, flexShrink: 0, height: 1, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />}
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 16 }}>
            <button className="glass-btn" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, fontSize: 12.5, color: textDim, border: "none", background: "rgba(255,255,255,.04)", cursor: "pointer" }}>
              <Wand2 style={{ width: 13, height: 13 }} />重新改编
            </button>
            <button
              onClick={() => navigate("storyboard")}
              className="orange-btn"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, color: "black", border: "none", cursor: "pointer" }}>
              进入制作<ChevronRight style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>

        {/* Sub-header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{PROJECT.name}</h1>
            <p style={{ fontSize: 12.5, color: textMuted, marginTop: 2 }}>
              {episodes.length} 集 · {totalShots} 镜 · 目标 24 集
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 16, flex: 1 }}>

          {/* Script Editor */}
          <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, overflow: "hidden", boxShadow: cardShadow, display: "flex", flexDirection: "column", minHeight: 400 }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: textDim }}>原始剧本</span>
              <span style={{ fontSize: 12, color: textMuted }}>{activeEp.title}</span>
            </div>
            <textarea
              value={activeEp.script}
              onChange={e => updateScript(e.target.value)}
              style={{
                flex: 1, minHeight: 300, padding: "14px 16px",
                background: "transparent", border: "none", outline: "none",
                color: "rgba(255,255,255,.7)", fontSize: 12.5, lineHeight: 1.85,
                resize: "none", fontFamily: "inherit", boxSizing: "border-box",
              }}
              placeholder="在此输入或粘贴剧本…"
            />
            <div style={{ padding: "10px 16px", borderTop: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: textMuted }}>
                字数：<span style={{ color: textDim, fontWeight: 600 }}>{activeEp.wordCount.toLocaleString()}</span> 字
              </span>
              <button onClick={saveScript}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 9,
                  border: "none", fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all .2s",
                  background: saved[activeId] ? "rgba(52,211,153,.15)" : "rgba(255,138,31,.15)",
                  color: saved[activeId] ? "#34d399" : gold,
                }}>
                {saved[activeId] ? <CheckCircle style={{ width: 13, height: 13 }} /> : <span style={{ fontSize: 12 }}>💾</span>}
                {saved[activeId] ? "已保存" : "保存"}
              </button>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* 原著理解 — entity panel */}
            <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, overflow: "hidden", boxShadow: cardShadow }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: textDim }}>原著理解</span>
                  <span style={{ fontSize: 10, color: textMuted }}>角色 · 场景 · 道具</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: "rgba(52,211,153,.12)", border: "1px solid rgba(52,211,153,.2)", color: "#34d399" }}>已解析</span>
              </div>
              {/* Entity tabs */}
              <div style={{ display: "flex" }}>
                {TABS.map(t => (
                  <button key={t.k} onClick={() => setETab(t.k)}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "10px 0", fontSize: 12.5, fontWeight: 500, background: "none", border: "none",
                      cursor: "pointer", color: eTab === t.k ? gold : textMuted,
                      borderBottom: eTab === t.k ? `2px solid ${gold}` : "2px solid transparent",
                    }}>
                    <t.icon style={{ width: 13, height: 13 }} />{t.l}
                  </button>
                ))}
              </div>
              {/* Entity list */}
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
                {ENTITIES[eTab].map(e => (
                  <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,.03)", borderRadius: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,138,31,.15)", color: gold, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {e.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,.8)" }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: textMuted }}>{e.desc}</div>
                    </div>
                    <span style={{ fontSize: 11, color: textMuted, flexShrink: 0 }}>出现 {e.n} 次</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 集数镜头规划 */}
            <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, padding: 16, boxShadow: cardShadow }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 12 }}>分集镜头规划</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {episodes.map(ep => (
                  <div key={ep.id}
                    style={{
                      padding: "10px 14px", borderRadius: 10,
                      background: activeId === ep.id ? "rgba(255,138,31,.08)" : "rgba(255,255,255,.02)",
                      border: `1px solid ${activeId === ep.id ? "rgba(255,138,31,.25)" : "rgba(255,255,255,.05)"}`,
                      cursor: "pointer",
                    }}
                    onClick={() => setActiveId(ep.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: activeId === ep.id ? "white" : "rgba(255,255,255,.6)", flex: 1 }}>{ep.title}</span>
                      <span style={{ fontSize: 11, color: textMuted }}>{ep.desc}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: textMuted }}>
                        镜头：<span style={{ color: "rgba(255,255,255,.6)", fontWeight: 600 }}>{ep.shots}</span>
                      </span>
                      <span style={{ fontSize: 11, color: textMuted }}>
                        每镜：
                        <select
                          value={ep.secPerShot}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setEpisodes(prev => prev.map(x => x.id === ep.id ? { ...x, secPerShot: Number(e.target.value) } : x));
                          }}
                          style={{ background: "rgba(255,255,255,.06)", border: `1px solid ${colors.border}`, borderRadius: 5, padding: "1px 4px", fontSize: 11, color: "rgba(255,255,255,.7)", cursor: "pointer" }}>
                          {DUR_OPTIONS.map(o => <option key={o} value={o}>{o}秒</option>)}
                        </select>
                      </span>
                      <span style={{ fontSize: 11, color: gold, marginLeft: "auto" }}>
                        ≈ {ep.shots * ep.secPerShot} 秒
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(255,138,31,.06)", border: "1px solid rgba(255,138,31,.15)", fontSize: 12, color: gold }}>
                估算总时长：{totalSec} 秒（约 {Math.floor(totalSec / 60)} 分 {totalSec % 60} 秒）
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

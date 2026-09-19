// ═══ ScriptView — 分镜脚本视图 ════════════════════════════════════════════════
// 从 Figma Make PlotAnalysisPage.tsx 第 1581-1760 行移植
// 集数 rail + 镜头列表 + 角色 @提示词 tooltip + 新增/删除提示词 + 下载

import { useState } from "react";
import { createPortal } from "react-dom";
import { Download, Plus, X } from "lucide-react";
import {
  type AEntry, type ShotP, SB_SHOTS, EPS, accent,
} from "./shared";

// 主题色（与 PlotAnalysisPage.tsx 内的 $ 保持一致）
const T = {
  s1:   "#0E0F14",
  s2:   "#13151C",
  s3:   "#181B24",
  bdr:  "rgba(255,255,255,0.07)",
  t1:   "#F4F5F7",
  t2:   "#A4A8B3",
  t3:   "#6F7480",
  t4:   "rgba(255,255,255,0.2)",
  teal: "#2DD4BF",
} as const;

export function ScriptView({
  mode, assets, scriptEp, setScriptEp, onJumpToStoryboard,
}: {
  mode: "video" | "novel";
  assets: AEntry[];
  scriptEp: number;
  setScriptEp: (n: number) => void;
  onJumpToStoryboard?: () => void;
}) {
  const ACC = accent(mode);
  const ep = EPS[scriptEp];
  const [charTip, setCharTip] = useState<{ name: string; prompt: string; x: number; y: number } | null>(null);
  const [shotPMap, setShotPMap] = useState<Record<number, ShotP[]>>(
    () => Object.fromEntries(SB_SHOTS.map((s, i) => [i, s.prompts])),
  );

  const charMap = Object.fromEntries(assets.filter(a => a.type === "角色").map(a => [a.name, a]));
  const charNames = Object.keys(charMap);

  // 把 prompt 中 @角色 替换为可点击提示
  const renderPrompt = (text: string): React.ReactNode => {
    if (!charNames.length) return text;
    const re = new RegExp(`@(${charNames.join("|")})`, "g");
    const parts: React.ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(<span key={last}>{text.slice(last, m.index)}</span>);
      const nm = m[1];
      const ch = charMap[nm];
      parts.push(
        <span key={m.index}
          style={{
            color: "#FF8A1F", fontWeight: 700, cursor: "pointer",
            background: "rgba(255,138,31,.12)", borderRadius: 4, padding: "0 4px",
            borderBottom: "1px solid rgba(255,138,31,.4)",
          }}
          onClick={e => {
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setCharTip({ name: nm, prompt: ch?.prompt || "（暂无提示词）", x: r.left, y: r.bottom + 6 });
          }}>
          @{nm}
        </span>,
      );
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(<span key={last}>{text.slice(last)}</span>);
    return <>{parts}</>;
  };

  // 下载当前集数的分镜提示词
  const downloadPrompts = () => {
    const out: string[] = [`分镜提示词 — 第${ep.n}集《${ep.t}》\n${"=".repeat(40)}`];
    SB_SHOTS.forEach(shot => {
      const prompts = shotPMap[shot.shot - 1] ?? shot.prompts;
      out.push(`\n镜头 ${String(shot.shot).padStart(2, "0")} · ${shot.visual} · ${shot.frameType} · ${shot.dur}`);
      if (shot.dialogue) out.push(`台词：${shot.dialogue}`);
      prompts.forEach(p => out.push(`[${p.label}] ${p.text}`));
    });
    const blob = new Blob([out.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `分镜提示词_E${String(ep.n).padStart(2, "0")}_${ep.t}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* Episode rail */}
      <div style={{
        width: 148, flexShrink: 0, borderRight: `1px solid ${T.bdr}`,
        overflowY: "auto", background: T.s1,
      }}>
        <div style={{
          padding: "12px 14px 6px", fontSize: 10, fontWeight: 800,
          letterSpacing: "0.08em", color: T.t4,
        }}>集数</div>
        {EPS.map((e, i) => (
          <button key={e.n} onClick={() => setScriptEp(i)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8,
              padding: "9px 14px",
              background: scriptEp === i ? "rgba(255,255,255,.05)" : "transparent",
              border: "none",
              borderLeft: `2px solid ${scriptEp === i ? ACC : "transparent"}`,
              cursor: "pointer", textAlign: "left", transition: "all .12s",
            }}>
            <div style={{
              width: 20, height: 20, borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 800, flexShrink: 0,
              background: scriptEp === i ? `${ACC}20` : "rgba(255,255,255,.06)",
              color: scriptEp === i ? ACC : T.t3,
            }}>{e.n}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, color: scriptEp === i ? T.t1 : T.t3,
                fontWeight: scriptEp === i ? 600 : 400,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{e.t}</div>
              <div style={{ fontSize: 10, color: T.t4, marginTop: 1 }}>情绪 {e.emotion}%</div>
            </div>
          </button>
        ))}
      </div>

      {/* Main panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          padding: "11px 22px", borderBottom: `1px solid ${T.bdr}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.t1 }}>第{ep.n}集 · {ep.t}</span>
            <span style={{ fontSize: 12, color: T.t3, marginLeft: 12 }}>{ep.synopsis}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={downloadPrompts}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 9,
                fontSize: 12, background: "rgba(255,255,255,.05)", border: `1px solid ${T.bdr}`,
                color: T.t3, cursor: "pointer",
              }}>
              <Download style={{ width: 11, height: 11 }} />下载分镜提示词
            </button>
            {onJumpToStoryboard && (
              <button onClick={onJumpToStoryboard}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 9,
                  fontSize: 12, color: "black", border: "none", cursor: "pointer", fontWeight: 700,
                  background: `linear-gradient(135deg,${ACC},${ACC}cc)`,
                  boxShadow: `0 4px 14px ${ACC}40`,
                }}>
                打开分镜工作台 →
              </button>
            )}
          </div>
        </div>

        {/* Shot list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}
          onClick={() => setCharTip(null)}>
          {SB_SHOTS.map((shot, i) => {
            const prompts = shotPMap[i] ?? shot.prompts;
            return (
              <div key={i} style={{
                borderBottom: "1px solid rgba(255,255,255,.05)", padding: "16px 0",
              }}>
                {/* Shot meta */}
                <div style={{
                  display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10,
                }}>
                  <span style={{
                    fontSize: 12, fontWeight: 800, color: ACC,
                    background: `${ACC}12`, border: `1px solid ${ACC}25`,
                    borderRadius: 5, padding: "1px 8px", flexShrink: 0,
                  }}>
                    #{String(shot.shot).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.t1 }}>{shot.visual}</span>
                  <span style={{ fontSize: 11, color: T.t4, flexShrink: 0 }}>
                    {shot.frameType} · {shot.angle} · {shot.dur} · {shot.scene}
                  </span>
                  {shot.status === "已确认" && (
                    <span style={{
                      fontSize: 10, color: T.teal, background: `${T.teal}12`,
                      border: `1px solid ${T.teal}30`, borderRadius: 20,
                      padding: "1px 8px", flexShrink: 0, marginLeft: "auto",
                    }}>✓ 已确认</span>
                  )}
                </div>
                {/* Dialogue */}
                {shot.dialogue && (
                  <p style={{
                    fontSize: 12.5, color: T.t3, lineHeight: 1.65, margin: "0 0 8px",
                    borderLeft: "2px solid rgba(255,138,31,.3)", paddingLeft: 10,
                    fontStyle: "italic",
                  }}>
                    {shot.dialogue}
                  </p>
                )}
                {/* Prompts */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {prompts.map((p, pi) => (
                    <div key={p.id} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                    }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: ACC,
                        background: `${ACC}10`, border: `1px solid ${ACC}22`,
                        borderRadius: 4, padding: "2px 7px",
                        flexShrink: 0, marginTop: 1, minWidth: 36, textAlign: "center",
                      }}>
                        {p.label}
                      </span>
                      <p style={{
                        fontSize: 13, color: T.t2, lineHeight: 1.75, margin: 0, flex: 1,
                      }}>
                        {renderPrompt(p.text)}
                      </p>
                      {prompts.length > 1 && (
                        <button onClick={() => setShotPMap(prev => ({
                          ...prev,
                          [i]: prompts.filter((_, xi) => xi !== pi),
                        }))}
                          style={{
                            width: 18, height: 18, borderRadius: 4,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "transparent", border: "none", color: T.t4,
                            cursor: "pointer", flexShrink: 0, marginTop: 2, opacity: 0.5,
                          }}>
                          <X style={{ width: 10, height: 10 }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {/* Add prompt */}
                <button onClick={() => {
                  const np: ShotP = { id: `p${Date.now()}`, label: "补充", text: "" };
                  setShotPMap(prev => ({ ...prev, [i]: [...prompts, np] }));
                }}
                  style={{
                    marginTop: 8, display: "flex", alignItems: "center", gap: 4,
                    fontSize: 11, padding: "2px 10px", borderRadius: 6, cursor: "pointer",
                    background: "transparent", border: `1px dashed ${T.bdr}`, color: T.t4,
                  }}>
                  <Plus style={{ width: 9, height: 9 }} />新增提示词
                </button>
              </div>
            );
          })}
          <button style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 14px",
            marginTop: 4, borderRadius: 10, fontSize: 12.5,
            background: "transparent", border: `1px dashed ${T.bdr}`,
            color: T.t3, cursor: "pointer",
          }}>
            <Plus style={{ width: 11, height: 11 }} />新增分镜
          </button>
        </div>
      </div>

      {/* Character tooltip */}
      {charTip && createPortal(
        <div style={{
          position: "fixed", zIndex: 9999,
          top: charTip.y, left: Math.min(charTip.x, window.innerWidth - 280),
          width: 268, background: T.s3, border: "1px solid rgba(255,138,31,.3)",
          borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,.7)", padding: "12px 14px",
        }}
          onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: "rgba(255,138,31,.15)", border: "1px solid rgba(255,138,31,.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: "#FF8A1F",
            }}>{charTip.name[0]}</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.t1 }}>@{charTip.name}</span>
            <button onClick={() => setCharTip(null)}
              style={{
                marginLeft: "auto", background: "none", border: "none",
                color: T.t4, cursor: "pointer",
              }}>
              <X style={{ width: 12, height: 12 }} />
            </button>
          </div>
          <p style={{ fontSize: 12, color: T.t2, lineHeight: 1.75, margin: 0 }}>
            {charTip.prompt || "（暂无角色提示词，请在资产确认中补充）"}
          </p>
        </div>,
        document.body,
      )}
    </div>
  );
}

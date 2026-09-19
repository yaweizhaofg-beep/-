// ═══ AssetsView — 资产确认视图 ════════════════════════════════════════════════
// 从 Figma Make PlotAnalysisPage.tsx 第 1148-1571 行移植
// 渲染资产网格（角色/场景/道具）、分类 tab、添加、编辑 modal、装造版本、提示词导出

import { useState } from "react";
import {
  Download, Plus, X, PenLine, Wand2, Maximize2, Package, MapPin,
  Image as ImageIcon, Zap,
} from "lucide-react";
import {
  type AEntry, type ARole, RBadge, accent,
} from "./shared";

// 主题色（与 PlotAnalysisPage.tsx 内的 $ 保持一致）
const T = {
  s2: "#13151C",
  s3: "#181B24",
  bdr:  "rgba(255,255,255,0.07)",
  bdr2: "rgba(255,255,255,0.12)",
  t1:   "#F4F5F7",
  t2:   "#A4A8B3",
  t3:   "#6F7480",
  t4:   "rgba(255,255,255,0.2)",
  teal: "#2DD4BF",
  red:  "#F87171",
} as const;

// 角色/场景/道具 主题色（Make TC）
const TC: Record<string, string> = {
  "角色": "#FF8A1F",
  "场景": "#60A5FA",
  "道具": "#A78BFA",
};

// Make Costume 版本内部类型
type CostumeV = { id: string; name: string; status: "none" | "generating" | "done" };

export function AssetsView({
  mode, assets, updA, delA, addA,
  onNext,
}: {
  mode: "video" | "novel";
  assets: AEntry[];
  updA: (id: string, p: Partial<AEntry>) => void;
  delA: (id: string) => void;
  addA: (type: AEntry["type"]) => void;
  onNext: () => void;
}) {
  const ACC = accent(mode);
  const [tab, setTab] = useState<"全部" | "角色" | "场景" | "道具">("全部");
  const [editEntry, setEditEntry] = useState<AEntry | null>(null);
  const [editRemark, setEditRemark] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [editPromptExpanded, setEditPromptExpanded] = useState(false);

  const [costumeVers, setCostumeVers] = useState<CostumeV[]>([
    { id: "cv1", name: "日常便装", status: "done" },
    { id: "cv2", name: "职业正装", status: "done" },
  ]);

  const openEdit = (a: AEntry) => {
    setEditEntry(a);
    setEditRemark("");
    setEditPrompt(a.prompt);
    setCostumeVers([
      { id: "cv1", name: "日常便装", status: "done" },
      { id: "cv2", name: "职业正装", status: "done" },
    ]);
  };

  const addCostumeV = () => setCostumeVers(prev => [
    ...prev,
    { id: `cv${Date.now()}`, name: `造型 ${prev.length + 1}`, status: "none" },
  ]);

  const genCostumeV = (id: string) => {
    setCostumeVers(prev => prev.map(v => (v.id === id ? { ...v, status: "generating" } : v)));
    setTimeout(() => {
      setCostumeVers(prev => prev.map(v => (v.id === id ? { ...v, status: "done" } : v)));
    }, 2000);
  };

  const doneCount = assets.filter(a => a.ok).length;
  const pct = assets.length ? Math.round((doneCount / assets.length) * 100) : 0;
  const filtered = tab === "全部" ? assets : assets.filter(a => a.type === tab);

  const placeholder = (a: AEntry) =>
    a.type === "角色"
      ? "年龄·外貌·服装·气质·出场特点\n例：30岁都市画家，棉麻白衬衫，侧脸近景，神情内敛，黄昏逆光…"
      : a.type === "场景"
      ? "氛围·光线·时段·色彩基调\n例：玻璃幕墙，冷色调美术灯光，精英感，傍晚斜光…"
      : "外观·材质·作用\n例：米白信封，手写隶书，高潮核心道具，由陈刚递出…";

  // 下载资产提示词（TXT）
  const downloadPrompts = () => {
    const lines: string[] = ["资产提示词导出\n" + "=".repeat(32)];
    (["角色", "场景", "道具"] as AEntry["type"][]).forEach(type => {
      const items = assets.filter(a => a.type === type);
      if (!items.length) return;
      lines.push(`\n【${type}】`);
      items.forEach(a => {
        lines.push(`\n${a.name}${a.role ? " (" + a.role + ")" : ""}:`);
        lines.push(a.prompt || "(未填写)");
      });
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "资产提示词.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{
          flex: 1, overflowY: "auto", padding: "22px 28px",
          display: "flex", flexDirection: "column", gap: 14, boxSizing: "border-box",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: T.t1, letterSpacing: "-0.02em", marginBottom: 3 }}>
                资产确认
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 120, height: 3, background: "rgba(255,255,255,.07)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`,
                    background: pct === 100 ? T.teal : ACC, borderRadius: 2, transition: "width .4s",
                  }} />
                </div>
                <span style={{ fontSize: 11, color: T.t3 }}>{doneCount}/{assets.length} 已确认 · {pct}%</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <button onClick={downloadPrompts}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9,
                  fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
                  color: T.t2, transition: "all .15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.1)"; (e.currentTarget as HTMLElement).style.color = T.t1; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.06)"; (e.currentTarget as HTMLElement).style.color = T.t2; }}>
                <Download style={{ width: 12, height: 12 }} />下载资产提示词
              </button>
              <button onClick={onNext}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 9,
                  fontSize: 12.5, fontWeight: 700, color: "black", border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg,${ACC},${ACC}cc)`,
                  boxShadow: `0 4px 14px ${ACC}40`, whiteSpace: "nowrap",
                }}>
                进入分镜提示词 →
              </button>
            </div>
          </div>

          {/* Category tabs + add */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,.04)", borderRadius: 8, padding: "3px" }}>
              {(["全部", "角色", "场景", "道具"] as const).map(t => {
                const count = t === "全部" ? assets.length : assets.filter(a => a.type === t).length;
                const active = tab === t;
                return (
                  <button key={t} onClick={() => setTab(t)}
                    style={{
                      padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: active ? 700 : 400,
                      background: active ? (t === "全部" ? "rgba(255,255,255,.1)" : TC[t] + "22") : "transparent",
                      color: active ? (t === "全部" ? T.t1 : TC[t]) : T.t4,
                      transition: "all .15s", display: "flex", alignItems: "center", gap: 5,
                    }}>
                    {t}
                    <span style={{
                      fontSize: 10, padding: "1px 5px", borderRadius: 10,
                      background: active ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.06)",
                      color: active ? T.t2 : T.t4,
                    }}>{count}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["角色", "场景", "道具"] as AEntry["type"][]).map(t => (
                <button key={t} onClick={() => addA(t)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 7,
                    fontSize: 11, cursor: "pointer",
                    background: "transparent", border: `1px dashed ${T.bdr}`, color: T.t4,
                    transition: "all .15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = TC[t] + "70"; (e.currentTarget as HTMLElement).style.color = TC[t]; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.bdr; (e.currentTarget as HTMLElement).style.color = T.t4; }}>
                  <Plus style={{ width: 9, height: 9 }} />+{t}
                </button>
              ))}
            </div>
          </div>

          {/* Card grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, paddingBottom: 24 }}>
            {filtered.map(a => {
              const tc = TC[a.type];
              return (
                <div key={a.id} style={{
                  background: T.s2, borderRadius: 14,
                  border: `1.5px solid ${a.ok ? "rgba(45,212,191,.3)" : T.bdr}`,
                  display: "flex", flexDirection: "column", overflow: "hidden",
                  transition: "border-color .15s, box-shadow .15s",
                  boxShadow: a.ok
                    ? "0 0 0 1px rgba(45,212,191,.08),0 4px 16px rgba(0,0,0,.3)"
                    : "0 2px 8px rgba(0,0,0,.25)",
                }}>
                  {/* Top strip */}
                  <div style={{ height: 3, background: a.ok ? T.teal : tc, opacity: a.ok ? 1 : 0.4 }} />

                  {/* Header */}
                  <div style={{ padding: "12px 13px 8px", display: "flex", flexDirection: "column", gap: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: a.type === "角色" ? 13 : 0, fontWeight: 800,
                        background: `${tc}18`, border: `1px solid ${tc}28`, color: tc,
                      }}>
                        {a.type === "角色" ? a.name[0]
                          : a.type === "场景" ? <MapPin style={{ width: 14, height: 14 }} />
                          : <Package style={{ width: 14, height: 14 }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 700, color: T.t1,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{a.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                          <span style={{
                            fontSize: 9.5, fontWeight: 700, padding: "1px 6px", borderRadius: 20,
                            background: `${tc}15`, color: tc, border: `1px solid ${tc}25`,
                          }}>
                            {a.type === "角色" ? (a.role ?? "角色") : a.type}
                          </span>
                          {a.count > 0 && <span style={{ fontSize: 9.5, color: T.t3 }}>{a.count}次</span>}
                        </div>
                      </div>
                    </div>
                    {a.type === "角色" && (
                      <div style={{ display: "flex", gap: 3 }}>
                        {(["主角", "配角", "路人"] as ARole[]).map(r => (
                          <RBadge key={r} r={r} sel={a.role === r} on={() => updA(a.id, { role: r })} />
                        ))}
                      </div>
                    )}
                    {a.type !== "角色" && a.sources && a.sources.length > 0 && (
                      <div style={{ fontSize: 10, color: T.t4, display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {a.sources.map((s, si) => (
                          <span key={si} style={{
                            padding: "1px 6px", borderRadius: 4,
                            background: "rgba(255,255,255,.04)", border: `1px solid ${T.bdr}`,
                          }}>{s.chap}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prompt textarea */}
                  <div style={{ flex: 1, padding: "0 13px 8px" }}>
                    <textarea
                      value={a.prompt}
                      onChange={e => updA(a.id, { prompt: e.target.value })}
                      placeholder={placeholder(a)}
                      style={{
                        width: "100%", height: "100%", minHeight: 120,
                        boxSizing: "border-box",
                        background: "rgba(255,255,255,.035)",
                        border: `1px solid ${a.prompt ? T.bdr2 : T.bdr}`,
                        borderRadius: 9, padding: "9px 11px",
                        fontSize: 12, color: T.t1, lineHeight: 1.75,
                        outline: "none", resize: "none", fontFamily: "inherit",
                        transition: "border-color .15s, background .15s",
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = tc + "70"; e.currentTarget.style.background = "rgba(255,255,255,.055)"; }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = a.prompt ? T.bdr2 : T.bdr;
                        e.currentTarget.style.background = "rgba(255,255,255,.035)";
                      }}
                    />
                  </div>

                  {/* Footer */}
                  <div style={{
                    padding: "8px 13px 12px", display: "flex", alignItems: "center", gap: 6,
                    borderTop: `1px solid ${T.bdr}`,
                  }}>
                    <button onClick={() => updA(a.id, { ok: !a.ok })}
                      style={{
                        flex: 1, fontSize: 11, fontWeight: 700, padding: "5px 0", borderRadius: 8,
                        cursor: "pointer", transition: "all .12s",
                        background: a.ok ? "rgba(45,212,191,.14)" : "rgba(255,255,255,.05)",
                        border: `1px solid ${a.ok ? "rgba(45,212,191,.35)" : T.bdr}`,
                        color: a.ok ? T.teal : T.t3,
                      }}>
                      {a.ok ? "✓ 已确认" : "确认"}
                    </button>
                    <button onClick={() => openEdit(a)}
                      style={{
                        width: 26, height: 26, borderRadius: 7,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        background: `${tc}10`, border: `1px solid ${tc}30`, color: tc, cursor: "pointer",
                      }} title="编辑">
                      <PenLine style={{ width: 10, height: 10 }} />
                    </button>
                    <button onClick={() => delA(a.id)}
                      style={{
                        width: 26, height: 26, borderRadius: 7,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        background: "rgba(248,113,113,.07)", border: "1px solid rgba(248,113,113,.15)",
                        color: T.red, cursor: "pointer",
                      }}>
                      <X style={{ width: 10, height: 10 }} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div style={{
                gridColumn: "1/-1", padding: "48px 0",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: T.t3,
              }}>
                <Package style={{ width: 32, height: 32, opacity: 0.3 }} />
                <span style={{ fontSize: 13 }}>该分类暂无资产</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editEntry && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 500,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,.82)", backdropFilter: "blur(20px)",
          }}
          onClick={e => { if (e.target === e.currentTarget) setEditEntry(null); }}
        >
          <div style={{
            width: "min(1100px,96vw)", height: "min(740px,94vh)",
            background: "#0C0D14", border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 20, display: "flex", overflow: "hidden",
            boxShadow: "0 40px 120px rgba(0,0,0,.9)", position: "relative",
          }}>
            {/* Close */}
            <button onClick={() => setEditEntry(null)}
              style={{
                position: "absolute", top: 12, right: 12, zIndex: 20,
                width: 28, height: 28, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)",
                color: "rgba(255,255,255,.5)", cursor: "pointer",
              }}>
              <X style={{ width: 13, height: 13 }} />
            </button>

            {/* Left: visual */}
            <div style={{
              width: "40%", flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden",
              background: editEntry.type === "角色"
                ? "linear-gradient(160deg,#0d1a0d,#0a0d1a)"
                : editEntry.type === "场景"
                ? "linear-gradient(160deg,#0a1020,#0d1a2e)"
                : "linear-gradient(160deg,#150d20,#1a0d2e)",
              borderRight: "1px solid rgba(255,255,255,.07)",
            }}>
              <div style={{
                flex: 1, position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: 140, height: 140, borderRadius: editEntry.type === "角色" ? "50%" : "16px",
                  background: `${TC[editEntry.type]}18`, border: `2px solid ${TC[editEntry.type]}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column", gap: 10,
                }}>
                  <span style={{
                    fontSize: editEntry.type === "角色" ? 48 : 0, fontWeight: 800, color: TC[editEntry.type],
                  }}>
                    {editEntry.type === "角色" ? editEntry.name[0] : ""}
                  </span>
                  {editEntry.type !== "角色" && (
                    editEntry.type === "场景"
                      ? <MapPin style={{ width: 40, height: 40, color: TC[editEntry.type] }} />
                      : <Package style={{ width: 40, height: 40, color: TC[editEntry.type] }} />
                  )}
                </div>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom,transparent 55%,rgba(9,10,14,.9) 100%)",
                  pointerEvents: "none",
                }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 18px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
                    {editEntry.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                      background: `${TC[editEntry.type]}20`, border: `1px solid ${TC[editEntry.type]}35`,
                      color: TC[editEntry.type],
                    }}>
                      {editEntry.type === "角色" ? (editEntry.role ?? "角色") : editEntry.type}
                    </span>
                    {editEntry.count > 0 && <span style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>出现 {editEntry.count} 次</span>}
                  </div>
                </div>
              </div>
              <div style={{
                flexShrink: 0, padding: "12px 16px",
                borderTop: "1px solid rgba(255,255,255,.06)",
                background: "rgba(0,0,0,.25)",
              }}>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.35)", marginBottom: 8, fontWeight: 600 }}>
                  参考图
                </div>
                <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{
                      width: 70, height: 48, borderRadius: 7,
                      background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)",
                      flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <ImageIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,.15)" }} />
                    </div>
                  ))}
                  <button style={{
                    width: 48, height: 48, borderRadius: 7,
                    border: "1.5px dashed rgba(255,255,255,.12)",
                    background: "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "rgba(255,255,255,.3)", flexShrink: 0,
                  }}>
                    <Plus style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: edit controls */}
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              overflowY: "auto", padding: "20px 24px", gap: 14, minWidth: 0,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                  background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 10,
                }}>
                  <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.4)", fontWeight: 600, flexShrink: 0 }}>
                    {editEntry.type === "角色" ? "角色名" : editEntry.type === "场景" ? "场景名" : "道具名"}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "white" }}>{editEntry.name}</span>
                  <span style={{
                    marginLeft: 4, fontSize: 10, color: "rgba(255,255,255,.22)",
                    background: "rgba(255,255,255,.05)", padding: "1px 7px",
                    borderRadius: 20, flexShrink: 0,
                  }}>系统命名 · 不可修改</span>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
                  background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 10,
                }}>
                  <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.4)", fontWeight: 600, flexShrink: 0 }}>备注</span>
                  <input value={editRemark} onChange={e => setEditRemark(e.target.value)}
                    placeholder="添加别名、备注说明…"
                    style={{
                      flex: 1, background: "transparent", border: "none", outline: "none",
                      fontSize: 13, color: "rgba(255,255,255,.8)", fontFamily: "inherit",
                    }} />
                  {editRemark && (
                    <button onClick={() => setEditRemark("")}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.3)", padding: 0 }}>
                      <X style={{ width: 11, height: 11 }} />
                    </button>
                  )}
                </div>
                {editEntry.type === "角色" && (
                  <div style={{ display: "flex", gap: 5 }}>
                    {(["主角", "配角", "路人"] as ARole[]).map(r => (
                      <button key={r} onClick={() => updA(editEntry.id, { role: r })}
                        style={{
                          padding: "4px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                          fontWeight: editEntry.role === r ? 700 : 400,
                          background: editEntry.role === r ? `${TC["角色"]}15` : "rgba(255,255,255,.05)",
                          border: `1px solid ${editEntry.role === r ? TC["角色"] + "35" : "rgba(255,255,255,.1)"}`,
                          color: editEntry.role === r ? TC["角色"] : "rgba(255,255,255,.4)",
                        }}>
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Prompt */}
              <div style={{
                background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.09)",
                borderRadius: 12, overflow: "hidden", flexShrink: 0,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 12px 0", borderBottom: "1px solid rgba(255,255,255,.06)",
                }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 600, padding: "8px 0" }}>
                    生成提示词
                  </span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.2)" }}>{editPrompt.length} 字</span>
                  <button title="AI改写" style={{
                    width: 24, height: 24, borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${ACC}15`, border: `1px solid ${ACC}30`,
                    cursor: "pointer", color: ACC,
                  }}>
                    <Wand2 style={{ width: 10, height: 10 }} />
                  </button>
                  <button title="展开编辑" onClick={() => setEditPromptExpanded(v => !v)}
                    style={{
                      width: 24, height: 24, borderRadius: 6,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
                      cursor: "pointer", color: "rgba(255,255,255,.6)",
                    }}>
                    <Maximize2 style={{ width: 10, height: 10 }} />
                  </button>
                </div>
                <textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)}
                  placeholder={
                    editEntry.type === "角色" ? "年龄·外貌·服装·气质·出场特点…"
                    : editEntry.type === "场景" ? "氛围·光线·时段·色彩基调…"
                    : "外观·材质·作用…"}
                  style={{
                    width: "100%", background: "transparent", border: "none",
                    padding: "10px 13px", fontSize: 12.5, color: "rgba(255,255,255,.85)",
                    outline: "none", resize: "none", lineHeight: 1.8, fontFamily: "inherit",
                    boxSizing: "border-box",
                    height: editPromptExpanded ? 200 : 110,
                    display: "block", transition: "height .2s",
                  }} />
              </div>

              {/* Costume versions */}
              {editEntry.type === "角色" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 600 }}>角色装造版本</span>
                    <span style={{
                      fontSize: 10, color: "rgba(255,255,255,.2)",
                      background: "rgba(255,255,255,.05)", padding: "1px 7px", borderRadius: 20,
                    }}>{costumeVers.length}</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={addCostumeV}
                      style={{
                        display: "flex", alignItems: "center", gap: 4, padding: "3px 10px",
                        borderRadius: 7, fontSize: 11, cursor: "pointer",
                        background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
                        color: "rgba(255,255,255,.4)",
                      }}>
                      <Plus style={{ width: 10, height: 10 }} />新增装造
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
                    {costumeVers.map(cv => (
                      <div key={cv.id} style={{
                        borderRadius: 9, overflow: "hidden",
                        border: "1px solid rgba(255,255,255,.08)",
                        background: "rgba(255,255,255,.03)",
                      }}>
                        <div style={{
                          aspectRatio: "16/9", position: "relative",
                          background: cv.status === "done"
                            ? "linear-gradient(135deg,#1a1a2e,#2d1b4e,#0d0d1a)"
                            : "rgba(255,255,255,.03)",
                        }}>
                          {cv.status === "generating" && (
                            <div style={{
                              position: "absolute", inset: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <div style={{
                                width: 18, height: 18, borderRadius: "50%",
                                border: "2px solid rgba(96,165,250,.2)",
                                borderTopColor: "#60a5fa",
                                animation: "spin 1s linear infinite",
                              }} />
                            </div>
                          )}
                          {cv.status === "done" && (
                            <div style={{
                              position: "absolute", inset: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <ImageIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,.12)" }} />
                            </div>
                          )}
                          {cv.status === "none" && (
                            <div style={{
                              position: "absolute", inset: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <span style={{ fontSize: 9, color: "rgba(255,255,255,.18)" }}>未生成</span>
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 8px" }}>
                          <span style={{
                            flex: 1, fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,.7)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>{cv.name}</span>
                          <button onClick={() => genCostumeV(cv.id)} disabled={cv.status === "generating"}
                            style={{
                              display: "flex", alignItems: "center", gap: 3,
                              padding: "2px 7px", borderRadius: 5, fontSize: 9.5,
                              cursor: cv.status === "generating" ? "not-allowed" : "pointer",
                              background: cv.status === "done" ? "rgba(255,255,255,.05)" : `${ACC}15`,
                              border: `1px solid ${cv.status === "done" ? "rgba(255,255,255,.1)" : ACC + "30"}`,
                              color: cv.status === "done" ? "rgba(255,255,255,.4)" : ACC,
                            }}>
                            <Zap style={{ width: 8, height: 8 }} />
                            {cv.status === "done" ? "重生成" : "生成"}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={addCostumeV}
                      style={{
                        borderRadius: 9, border: "1.5px dashed rgba(255,255,255,.1)",
                        background: "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                        cursor: "pointer", color: "rgba(255,255,255,.25)",
                        fontSize: 11, minHeight: 60,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ACC}40`; (e.currentTarget as HTMLElement).style.color = ACC; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.1)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.25)"; }}>
                      <Plus style={{ width: 13, height: 13 }} />新增
                    </button>
                  </div>
                </div>
              )}

              <div style={{ flex: 1 }} />

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => {
                  updA(editEntry.id, { ok: !editEntry.ok, prompt: editPrompt });
                  setEditEntry(null);
                }}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 11, fontSize: 13, fontWeight: 700,
                    cursor: "pointer", color: "black", border: "none",
                    background: `linear-gradient(135deg,${ACC},${ACC}cc)`,
                  }}>
                  保存并{editEntry.ok ? "取消确认" : "确认"}
                </button>
                <button onClick={() => { updA(editEntry.id, { prompt: editPrompt }); setEditEntry(null); }}
                  style={{
                    padding: "10px 20px", borderRadius: 11, fontSize: 13, cursor: "pointer",
                    background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
                    color: "rgba(255,255,255,.6)",
                  }}>
                  仅保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt expanded overlay */}
      {editPromptExpanded && editEntry && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 600,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,.88)", backdropFilter: "blur(24px)",
          }}
          onClick={e => { if (e.target === e.currentTarget) setEditPromptExpanded(false); }}
        >
          <div style={{
            width: "min(820px,94vw)", height: "min(560px,86vh)",
            background: "#0E0F16", border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 20, display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: "0 40px 120px rgba(0,0,0,.9)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: TC[editEntry.type] }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{editEntry.name} · 提示词编辑</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{editPrompt.length} 字</span>
              <button style={{
                display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 7,
                background: `${ACC}12`, border: `1px solid ${ACC}28`,
                cursor: "pointer", color: ACC, fontSize: 11.5, fontWeight: 600,
              }}>
                <Wand2 style={{ width: 11, height: 11 }} />AI 改写
              </button>
              <button onClick={() => setEditPromptExpanded(false)}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)",
                  color: "rgba(255,255,255,.45)", cursor: "pointer",
                }}>
                <X style={{ width: 13, height: 13 }} />
              </button>
            </div>
            <textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)} autoFocus
              style={{
                flex: 1, background: "transparent", border: "none",
                padding: "20px 24px", fontSize: 14, color: "rgba(255,255,255,.88)",
                outline: "none", resize: "none", lineHeight: 1.85, fontFamily: "inherit",
              }} />
            <div style={{
              display: "flex", justifyContent: "flex-end", gap: 8,
              padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,.07)", flexShrink: 0,
            }}>
              <button onClick={() => setEditPromptExpanded(false)}
                style={{
                  padding: "7px 20px", borderRadius: 9, fontSize: 12, cursor: "pointer",
                  background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
                  color: "rgba(255,255,255,.5)",
                }}>关闭</button>
              <button onClick={() => setEditPromptExpanded(false)}
                style={{
                  padding: "7px 24px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", color: "black", border: "none",
                  background: `linear-gradient(135deg,${ACC},${ACC}cc)`,
                }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

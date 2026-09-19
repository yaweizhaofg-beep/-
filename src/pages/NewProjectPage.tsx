// ═══════════════════════════════════════════════════════════════════════════════════
// NewProjectPage — 对齐 Figma Make NewProjectPage（App.tsx line 1170-1490）
// 双栏布局：左侧模式卡/剧目名/上传/参数横排/开始；右侧 AI 对话
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState, useRef } from "react";
import {
  Upload, FileText, Layers, X, Sparkles, ChevronRight,
  ArrowUp, Flame,
} from "lucide-react";
import type { Nav as NavType } from "../shared";

export function NewProjectPage({ navigate, onStart }: NavType & { onStart?: () => void }) {
  const [name, setName]               = useState("");
  const [genre, setGenre]             = useState("都市情感");
  const [model, setModel]             = useState("fast");
  const [mode, setMode]               = useState<"novel" | "script">("novel");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [adaptStyle, setAdaptStyle]   = useState("faithful");
  const [targetEps, setTargetEps]     = useState(24);
  const [shotSec, setShotSec]         = useState(5);
  const [chatInput, setChatInput]     = useState("");
  const chatEndRef                    = useRef<HTMLDivElement>(null);

  const unitPrice = model === "fast" ? 18.55 : 45.0;
  const estStars  = Math.round(20 * unitPrice);

  type ChatMsg = { role: "ai" | "user"; text: string };
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "ai",   text: "你好！我是你的AI创作助手。请先填写剧目名称并上传文件，我来帮你规划改编方案。" },
    { role: "ai",   text: "小提示：选择「忠实原著」风格会保留更多原著对白；「商业优化」会压缩节奏，更适合短视频平台。" },
  ]);

  const sendChat = () => {
    const txt = chatInput.trim();
    if (!txt) return;
    const next: ChatMsg[] = [...messages, { role: "user", text: txt }];
    setMessages(next);
    setChatInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", text: `好的，关于「${txt}」——建议你在改编风格中选择「商业优化」，配合 ${targetEps} 集的目标，每集约 20 个分镜，首集预计消耗 ${estStars} 星石。需要调整什么参数吗？` }]);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 600);
  };

  const MODES = [
    { key: "novel"  as const, icon: FileText, label: "小说 / 剧本",  sub: "AI 自动拆章生成分镜", color: "#FF8A1F", accept: ".txt,.docx,.md", hint: "支持 .txt · .docx · .md，最大 20 MB" },
    { key: "script" as const, icon: Layers,   label: "导入分镜脚本", sub: "识别资产直接进入制作", color: "#A78BFA", accept: ".txt,.docx,.md", hint: "支持 .txt · .docx · .md，最大 20 MB" },
  ];
  const activeMode = MODES.find(m => m.key === mode)!;
  const ready = !!name && !!uploadedFile;

  const selectStyle: React.CSSProperties = {
    height: 32, padding: "0 28px 0 10px", borderRadius: 8, fontSize: 12, fontWeight: 500,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#F4F5F7", outline: "none", cursor: "pointer", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236F7480' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center",
  };

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      padding: "18px 24px", boxSizing: "border-box", overflow: "hidden",
      background: "linear-gradient(150deg,#09090D 0%,#0C0D13 60%,#08090E 100%)",
      position: "relative",
    }}>
      {/* Ambient glows */}
      <div style={{ position: "absolute", top: -40, left: "25%", width: 480, height: 240, borderRadius: "50%",
        background: "radial-gradient(ellipse,rgba(255,138,31,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, right: "5%", width: 360, height: 360, borderRadius: "50%",
        background: "radial-gradient(ellipse,rgba(167,139,250,0.04) 0%,transparent 70%)", pointerEvents: "none" }} />

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, position: "relative", flexShrink: 0 }}>
        <button onClick={() => navigate("projects")}
          style={{ background: "none", border: "none", color: "#A4A8B3", cursor: "pointer", fontSize: 13, padding: 0 }}>
          剧目创作
        </button>
        <ChevronRight style={{ width: 12, height: 12, color: "#6F7480" }} />
        <span style={{ fontSize: 13, color: "#F4F5F7", fontWeight: 500 }}>新建剧目</span>
      </div>

      {/* Main grid */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 360px", gap: 18, minHeight: 0, position: "relative" }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>

          {/* Mode selector — 2 cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0 }}>
            {MODES.map(m => {
              const active = mode === m.key;
              return (
                <button key={m.key} onClick={() => { setMode(m.key); setUploadedFile(null); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                    borderRadius: 12,
                    border: `1.5px solid ${active ? m.color + "55" : "rgba(255,255,255,0.08)"}`,
                    background: active ? `linear-gradient(135deg,${m.color}14 0%,${m.color}07 100%)` : "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(12px)", cursor: "pointer", transition: "all .2s", textAlign: "left",
                    boxShadow: active ? `0 0 0 1px ${m.color}22,0 6px 24px ${m.color}14` : "none",
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = m.color + "35"; (e.currentTarget as HTMLElement).style.background = `${m.color}08`; } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; } }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    background: active ? `${m.color}25` : "rgba(255,255,255,0.07)",
                    border: `1px solid ${active ? m.color + "40" : "rgba(255,255,255,0.1)"}`, transition: "all .2s",
                  }}>
                    <m.icon style={{ width: 15, height: 15, color: active ? m.color : "#A4A8B3" }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#F4F5F7" : "#A4A8B3" }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: active ? m.color + "bb" : "#6F7480", marginTop: 2 }}>{m.sub}</div>
                  </div>
                  {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: m.color, flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {/* Project name */}
          <div style={{ flexShrink: 0 }}>
            <label style={{ fontSize: 11, color: "#A4A8B3", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              剧目名称 <span style={{ color: "#F87171" }}>*</span>
            </label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="如：《镜像》"
              style={{ width: "100%", height: 38, padding: "0 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#F4F5F7", fontSize: 13.5, fontWeight: 500, outline: "none", boxSizing: "border-box", transition: "border-color .15s" }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,138,31,0.45)"; }}
              onBlur={e =>  { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }} />
          </div>

          {/* Upload area */}
          <div style={{
            flex: 1, minHeight: 0, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.025)", backdropFilter: "blur(20px)", overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ padding: "11px 16px 0", display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: activeMode.color }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#A4A8B3", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {mode === "novel" ? "上传剧本 / 小说" : "上传分镜脚本"}
              </span>
            </div>
            <div style={{ flex: 1, minHeight: 0, padding: "12px 16px 14px", display: "flex", flexDirection: "column" }}>
              {uploadedFile ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 10,
                  border: `1px solid ${activeMode.color}30`, background: `${activeMode.color}0a`, flexShrink: 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: `${activeMode.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <activeMode.icon style={{ width: 14, height: 14, color: activeMode.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#F4F5F7", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uploadedFile}</div>
                    <div style={{ fontSize: 11, color: activeMode.color, marginTop: 1, opacity: 0.8 }}>已选择 · 准备就绪</div>
                  </div>
                  <button onClick={() => setUploadedFile(null)}
                    style={{ color: "#A4A8B3", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer", padding: "3px 7px", display: "flex", alignItems: "center" }}>
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              ) : (
                <label style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
                  borderRadius: 10, border: "1.5px dashed rgba(255,255,255,0.09)", cursor: "pointer", transition: "all .2s", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = activeMode.color + "50"; el.style.background = `${activeMode.color}06`; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.09)"; el.style.background = "transparent"; }}>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 160, height: 100,
                    background: `radial-gradient(ellipse,${activeMode.color}10 0%,transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    background: `linear-gradient(135deg,${activeMode.color}22,${activeMode.color}0a)`,
                    border: `1px solid ${activeMode.color}30`, boxShadow: `0 0 20px ${activeMode.color}18`,
                  }}>
                    <Upload style={{ width: 18, height: 18, color: activeMode.color }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#F4F5F7", marginBottom: 3 }}>拖拽或点击上传文件</div>
                    <div style={{ fontSize: 11, color: "#6F7480" }}>{activeMode.hint}</div>
                  </div>
                  <input type="file" style={{ display: "none" }} accept={activeMode.accept}
                    onChange={e => { const f = e.target.files?.[0]; if (f) setUploadedFile(f.name); }} />
                </label>
              )}
            </div>
          </div>

          {/* Settings row */}
          <div style={{
            flexShrink: 0, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.025)", backdropFilter: "blur(12px)", padding: "11px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "nowrap" }}>

              {/* 改编风格 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: "#6F7480", fontWeight: 600, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>改编风格</span>
                <select value={adaptStyle} onChange={e => setAdaptStyle(e.target.value)} style={selectStyle}>
                  <option value="faithful">忠实原著</option>
                  <option value="creative">大胆改编</option>
                  <option value="commercial">商业优化</option>
                </select>
              </div>

              <div style={{ width: 1, height: 38, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />

              {/* 目标集数 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 120 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "#6F7480", fontWeight: 600, letterSpacing: "0.05em" }}>目标集数</span>
                  <span style={{ fontSize: 11, color: "#FF8A1F", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{targetEps} 集</span>
                </div>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <style>{`
                    .eps-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 3px; border-radius: 2px; outline: none;
                      background: linear-gradient(to right, #FF8A1F ${((targetEps - 6) / (60 - 6)) * 100}%, rgba(255,255,255,0.12) ${((targetEps - 6) / (60 - 6)) * 100}%); }
                    .eps-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #FF8A1F; border: 2px solid #0C0D13; box-shadow: 0 0 6px rgba(255,138,31,0.5); cursor: pointer; }
                  `}</style>
                  <input type="range" min={6} max={60} step={1} value={targetEps} onChange={e => setTargetEps(Number(e.target.value))} className="eps-slider" />
                </div>
              </div>

              <div style={{ width: 1, height: 38, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />

              {/* 分镜秒数 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: "#6F7480", fontWeight: 600, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>分镜秒数</span>
                <select value={shotSec} onChange={e => setShotSec(Number(e.target.value))} style={selectStyle}>
                  {[3, 4, 5, 6, 8, 10, 12, 15].map(s => <option key={s} value={s}>{s} 秒</option>)}
                </select>
              </div>

              <div style={{ width: 1, height: 38, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />

              {/* 剧情类型 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: "#6F7480", fontWeight: 600, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>剧情类型</span>
                <select value={genre} onChange={e => setGenre(e.target.value)} style={selectStyle}>
                  {["都市情感", "科幻冒险", "悬疑推理", "古风仙侠", "青春校园", "职场商战"].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div style={{ width: 1, height: 38, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />

              {/* 生成模型 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: "#6F7480", fontWeight: 600, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>生成模型</span>
                <select value={model} onChange={e => setModel(e.target.value)} style={selectStyle}>
                  <option value="fast">Fast · 18.55★/镜</option>
                  <option value="pro">Pro · 45.00★/镜</option>
                </select>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ flexShrink: 0 }}>
            <button
              disabled={!ready}
              onClick={() => { onStart?.(); navigate("team-assets"); }}
              style={{
                width: "100%", height: 44, borderRadius: 11, fontSize: 14, fontWeight: 700,
                color: ready ? "black" : "#A4A8B3",
                border: "none", cursor: ready ? "pointer" : "not-allowed", transition: "all .2s",
                background: ready ? "linear-gradient(135deg,#FF8A1F,#FF6A1A)" : "rgba(255,255,255,0.07)",
                boxShadow: ready ? "0 4px 20px rgba(255,138,31,0.32)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              <Sparkles style={{ width: 14, height: 14 }} />
              {mode === "novel" ? "开始改编" : "识别资产并进入制作"}
              {ready && (
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600,
                  background: "rgba(0,0,0,0.18)", borderRadius: 6, padding: "2px 8px", marginLeft: 4 }}>
                  <Flame style={{ width: 11, height: 11 }} />{estStars} 星石
                </span>
              )}
            </button>
            {!ready && (
              <p style={{ fontSize: 11, color: "#6F7480", textAlign: "center", marginTop: 6, marginBottom: 0 }}>
                {!name ? "请先填写剧目名称" : "请上传文件后继续"}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — AI Chat */}
        <div style={{
          display: "flex", flexDirection: "column", minHeight: 0,
          borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)", overflow: "hidden",
        }}>
          {/* Chat header */}
          <div style={{ padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: "linear-gradient(135deg,rgba(255,138,31,0.3),rgba(255,106,26,0.15))",
              border: "1px solid rgba(255,138,31,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Sparkles style={{ width: 13, height: 13, color: "#FF8A1F" }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#F4F5F7" }}>AI 创作助手</div>
              <div style={{ fontSize: 10, color: "#34D399", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34D399", display: "inline-block" }} />在线
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: "#A4A8B3", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 8px" }}>
                预计消耗 <span style={{ color: "#FF8A1F", fontWeight: 700 }}>{estStars}</span> 星石
              </span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                {msg.role === "ai" && (
                  <div style={{
                    width: 24, height: 24, borderRadius: 7,
                    background: "rgba(255,138,31,0.18)", border: "1px solid rgba(255,138,31,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                  }}>
                    <Sparkles style={{ width: 10, height: 10, color: "#FF8A1F" }} />
                  </div>
                )}
                <div style={{
                  maxWidth: "82%", padding: "9px 12px",
                  borderRadius: msg.role === "ai" ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                  fontSize: 12.5, lineHeight: 1.55, color: "#F4F5F7",
                  background: msg.role === "ai" ? "rgba(255,255,255,0.05)" : "rgba(255,138,31,0.15)",
                  border: `1px solid ${msg.role === "ai" ? "rgba(255,255,255,0.07)" : "rgba(255,138,31,0.22)"}`,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions */}
          <div style={{ padding: "6px 14px", display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
            {["推荐改编风格", "如何控制成本", "集数怎么定"].map(q => (
              <button key={q} onClick={() => setChatInput(q)}
                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#A4A8B3", cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,138,31,0.3)"; (e.currentTarget as HTMLElement).style.color = "#FF8A1F"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "#A4A8B3"; }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "8px 14px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "6px 6px 6px 12px" }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                placeholder="问问 AI 助手…"
                style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 12.5, color: "#F4F5F7", lineHeight: 1.4 }} />
              <button onClick={sendChat} disabled={!chatInput.trim()}
                style={{
                  width: 28, height: 28, borderRadius: 7, border: "none",
                  cursor: chatInput.trim() ? "pointer" : "default",
                  background: chatInput.trim() ? "linear-gradient(135deg,#FF8A1F,#FF6A1A)" : "rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s",
                }}>
                <ArrowUp style={{ width: 13, height: 13, color: chatInput.trim() ? "black" : "#A4A8B3" }} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

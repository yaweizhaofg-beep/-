// ═══════════════════════════════════════════════════════════════════════════════════
// PlotAnalysisPage - 剧情解析页
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import {
  Film, Users, MessageSquare, GitBranch, Download, ChevronLeft,
  Plus, X, CheckCircle, Loader2, Upload, Wand2,
} from "lucide-react";
import { PLOT_ANALYSES, colors } from "../shared";
import type { Nav as NavType } from "../shared";

export function PlotAnalysisPage({ navigate }: NavType) {
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = () => {
    if (!title.trim()) return;
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      setShowNew(false);
      setTitle("");
    }, 1500);
  };

  const statusColor = (s: string) => 
    s === "done" ? colors.success : s === "running" ? colors.accent : colors.textMuted;
  
  const statusLabel = (s: string) => 
    s === "done" ? "已完成" : s === "running" ? "解析中" : "排队中";

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
            剧情解析
          </h1>
          <p style={{ fontSize: 13, color: colors.textMuted }}>
            分析已有视频内容，自动提取场景、角色与剧情结构
          </p>
        </div>
        <button 
          onClick={() => setShowNew(true)}
          className="btn-primary"
          style={{ 
            padding: "10px 20px", 
            borderRadius: 12, 
            fontSize: 13, 
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "none",
          }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          新建解析
        </button>
      </div>

      {/* Guide */}
      <div style={{
        background: colors.accentDim,
        border: `1px solid ${colors.accentDim}`,
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 24,
        display: "flex",
        gap: 32,
      }}>
        {["1. 点击「新建解析」", "2. 填写标题并上传视频", "3. 点击「创建并开始」"].map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: colors.accent,
              color: "#000",
              fontSize: 11, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {i + 1}
            </div>
            <span style={{ fontSize: 12.5, color: colors.textSecondary }}>{step}</span>
          </div>
        ))}
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PLOT_ANALYSES.map(item => (
          <div
            key={item.id}
            style={{
              background: colors.bgSurface,
              border: `1px solid ${colors.border}`,
              borderRadius: 14,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: colors.accentDim,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Film style={{ width: 22, height: 22, color: colors.accent }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 4 }}>
                {item.title}
              </h3>
              <div style={{ display: "flex", gap: 12, fontSize: 11.5, color: colors.textMuted }}>
                <span>{item.id}</span>
                <span>时长 {item.duration}</span>
                {item.status === "done" && (
                  <>
                    <span>{item.scenes} 场景</span>
                    <span>{item.characters} 角色</span>
                  </>
                )}
                <span>{item.createdAt}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(item.status) }} />
              <span style={{ fontSize: 12, color: statusColor(item.status), fontWeight: 500 }}>
                {statusLabel(item.status)}
              </span>
            </div>
            {item.status === "done" && (
              <button
                onClick={() => navigate("plot-analysis-detail")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 12.5, fontWeight: 600,
                  background: colors.bgHover,
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                  cursor: "pointer",
                }}
              >
                查看详情
              </button>
            )}
            {item.status === "running" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Loader2 style={{ width: 14, height: 14, color: colors.accent, animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: 12, color: colors.textMuted }}>处理中…</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Analysis Modal */}
      {showNew && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}
        >
          <div style={{
            width: 480,
            background: colors.bgSecondary,
            border: `1px solid ${colors.borderStrong}`,
            borderRadius: 20,
            padding: 28,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>新建解析</h2>
              <button onClick={() => setShowNew(false)} style={{ background: "none", border: "none", color: colors.textMuted, cursor: "pointer" }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: colors.textMuted, marginBottom: 8 }}>
                解析标题
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="例如：《镜像》第01集剧情解析"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  fontSize: 13.5,
                  background: colors.bgSurface,
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: colors.textMuted, marginBottom: 8 }}>
                上传视频
              </label>
              <div style={{
                padding: 32,
                borderRadius: 14,
                border: `2px dashed ${colors.border}`,
                textAlign: "center",
                cursor: "pointer",
              }}>
                <Upload style={{ width: 32, height: 32, color: colors.textMuted, marginBottom: 12 }} />
                <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>点击上传视频文件</p>
                <p style={{ fontSize: 11, color: colors.textMuted }}>支持 MP4、MOV、AVI · 最大 4GB</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowNew(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  fontSize: 13.5, fontWeight: 500,
                  background: colors.bgSurface,
                  border: `1px solid ${colors.border}`,
                  color: colors.textMuted,
                  cursor: "pointer",
                }}
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || creating}
                className="btn-primary"
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: 12,
                  fontSize: 13.5, fontWeight: 700,
                  opacity: !title.trim() ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {creating && <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />}
                {creating ? "提交中…" : "创建并开始"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PlotAnalysisDetailPage ───────────────────────────────────────────────────
export function PlotAnalysisDetailPage({ navigate }: Nav) {
  const SCENES = [
    { id: "S01", time: "00:00–02:14", desc: "开场：空旷走廊，主角背光独行，奠定孤寂基调", chars: ["主角"] },
    { id: "S02", time: "02:14–05:47", desc: "回忆插叙：雨中两人对话，情感冲突爆发", chars: ["主角", "配角A"] },
    { id: "S03", time: "05:47–09:12", desc: "场景切换：办公室，陈设暗示权力关系", chars: ["配角B"] },
    { id: "S04", time: "09:12–14:30", desc: "核心转折：镜子对话隐喻内心分裂", chars: ["主角"] },
    { id: "S05", time: "14:30–18:55", desc: "高潮：屋顶对峙，台词密集，张力拉满", chars: ["主角", "配角A", "配角B"] },
    { id: "S06", time: "18:55–23:41", desc: "结尾：回到走廊，首尾呼应，留有悬念", chars: ["主角"] },
  ];

  const CHARS = [
    { name: "主角",  scenes: 5, lines: 47, mood: "压抑→觉醒" },
    { name: "配角A", scenes: 2, lines: 23, mood: "温柔→决绝" },
    { name: "配角B", scenes: 2, lines: 18, mood: "强势→动摇" },
    { name: "旁白",  scenes: 6, lines: 12, mood: "中立" },
  ];

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <button 
          onClick={() => navigate("plot-analysis")}
          style={{ 
            background: "none", 
            border: "none", 
            color: colors.textMuted, 
            fontSize: 13, 
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
          剧情解析
        </button>
        <span style={{ color: colors.textMuted, fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, color: colors.textSecondary }}>《镜像》第01集剧情解析</span>
      </div>

      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
            《镜像》第01集剧情解析
          </h1>
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ fontSize: 12, color: colors.textMuted }}>PA-001</span>
            <span style={{ fontSize: 12, color: colors.textMuted }}>时长 23:41</span>
            <span style={{ fontSize: 12, color: colors.textMuted }}>2026-08-20</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: colors.success }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.success }} />
              已完成
            </span>
          </div>
        </div>
        <button className="btn-secondary" style={{ 
          padding: "8px 16px", 
          borderRadius: 10, 
          fontSize: 12.5,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <Download style={{ width: 14, height: 14 }} />
          导出报告
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "场景数", value: "18", icon: Film },
          { label: "角色数", value: "4", icon: Users },
          { label: "对话行", value: "100", icon: MessageSquare },
          { label: "关键转折", value: "3", icon: GitBranch },
        ].map(stat => (
          <div key={stat.label} style={{
            background: colors.bgSurface,
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: colors.accentDim,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <stat.icon style={{ width: 18, height: 18, color: colors.accent }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        {/* Scene List */}
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: colors.textSecondary, marginBottom: 14 }}>
            场景分析
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SCENES.map(scene => (
              <div key={scene.id} style={{
                background: colors.bgSurface,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: 16,
              }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{
                    padding: "4px 10px",
                    background: colors.accentDim,
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    color: colors.accent,
                  }}>
                    {scene.id}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11.5, color: colors.textMuted, marginBottom: 6 }}>{scene.time}</div>
                    <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.6 }}>{scene.desc}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                      {scene.chars.map(c => (
                        <span key={c} style={{
                          fontSize: 10.5,
                          color: colors.textMuted,
                          background: colors.bgHover,
                          padding: "2px 8px",
                          borderRadius: 100,
                        }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Characters */}
          <div style={{
            background: colors.bgSurface,
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: 18,
          }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 700, color: colors.textSecondary, marginBottom: 14 }}>
              角色出场
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CHARS.map(c => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: colors.accentDim,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: colors.accent,
                  }}>
                    {c.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.textPrimary }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: colors.textMuted }}>{c.scenes}场 · {c.lines}行</span>
                    </div>
                    <div style={{ fontSize: 11, color: colors.textMuted }}>情绪弧：{c.mood}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div style={{
            background: colors.accentDim,
            border: `1px solid ${colors.accentDim}`,
            borderRadius: 14,
            padding: 18,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Wand2 style={{ width: 16, height: 16, color: colors.accent }} />
              <h2 style={{ fontSize: 13.5, fontWeight: 700, color: colors.textPrimary }}>AI 剧情摘要</h2>
            </div>
            <p style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 1.7 }}>
              本集以"走廊"作为空间隐喻贯穿始终，主角在孤寂与回忆的交织中逐渐揭示内心分裂。
              三段式结构清晰：日常→回忆→觉醒，高潮发生在屋顶对峙，
              镜子意象强化了主角的双重身份主题，结尾留有明显的第二集钩子。
            </p>
            <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
              {["孤寂", "身份认同", "记忆与现实", "对抗"].map(tag => (
                <span key={tag} style={{
                  fontSize: 10.5,
                  color: colors.accent,
                  background: colors.bgSurface,
                  padding: "3px 10px",
                  borderRadius: 100,
                  border: `1px solid ${colors.accentDim}`,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlotAnalysisPage;

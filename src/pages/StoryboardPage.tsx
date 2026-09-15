// ═══════════════════════════════════════════════════════════════════════════════════
// StoryboardPage - 分镜工作台
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import {
  Search, Grid, List, Film, Loader2, Play, Download, RefreshCw,
  Trash2, Eye, Settings, ImageIcon, Plus
} from "lucide-react";
import { STORYBOARDS, PROJECT, colors, PageId } from "../shared";

interface NavType { navigate: (p: PageId) => void; }

export default function StoryboardPage({ navigate: _navigate }: NavType) {
  const [selected, setSelected] = useState<string | null>("SB-004");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSB, setSelectedSB] = useState<string | null>(null);
  const [selectedProject, _setSelectedProject] = useState(PROJECT);

  const statusColor = (s: string) => 
    s === "done" ? colors.success : s === "running" ? colors.accent : s === "queued" ? colors.info : colors.error;
  
  const statusLabel = (s: string) => 
    s === "done" ? "已完成" : s === "running" ? "生成中" : s === "queued" ? "排队中" : "失败";

  const handleGenerateAll = () => {
    // 批量生成逻辑
    console.log("批量生成所有分镜");
  };

  const handleRegenerate = (id: string) => {
    console.log("重新生成:", id);
  };

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Left Panel - Storyboard List */}
      <div style={{
        width: 360,
        background: colors.bgSecondary,
        borderRight: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}>
        {/* Project Info */}
        <div style={{ padding: 20, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: colors.accentDim,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Film style={{ width: 22, height: 22, color: colors.accent }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>
                {selectedProject.chapter}
              </h2>
              <div style={{ fontSize: 11, color: colors.textMuted }}>{selectedProject.id}</div>
            </div>
            <button style={{
              padding: "8px 12px",
              background: colors.bgHover,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              color: colors.textMuted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}>
              <Settings style={{ width: 14, height: 14 }} />
            </button>
          </div>
          
          {/* Progress Stats */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[
              { label: "已完成", value: selectedProject.storyboards.done, color: colors.success },
              { label: "生成中", value: selectedProject.storyboards.running, color: colors.accent },
              { label: "排队", value: selectedProject.storyboards.queued, color: colors.info },
              { label: "失败", value: selectedProject.storyboards.failed, color: colors.error },
            ].map(stat => (
              <div key={stat.label} style={{
                flex: 1,
                padding: "8px 4px",
                background: colors.bgSurface,
                borderRadius: 8,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: colors.textMuted }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: colors.textMuted }}>总体进度</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: colors.textPrimary }}>
                {selectedProject.storyboards.done}/{selectedProject.storyboards.total}
              </span>
            </div>
            <div style={{ height: 6, background: colors.bgPrimary, borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                width: `${(selectedProject.storyboards.done / selectedProject.storyboards.total) * 100}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${colors.success}, ${colors.accent})`,
                borderRadius: 3,
              }} />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ 
          padding: "12px 16px", 
          display: "flex", 
          alignItems: "center", 
          gap: 10,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search style={{ 
              position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              width: 14, height: 14, color: colors.textMuted,
            }} />
            <input 
              placeholder="搜索分镜..."
              style={{
                width: "100%",
                padding: "8px 10px 8px 32px",
                background: colors.bgSurface,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                fontSize: 12,
                color: colors.textPrimary,
                outline: "none",
              }}
            />
          </div>
          <button 
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            style={{
              padding: 8,
              background: colors.bgSurface,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              color: colors.textMuted,
              cursor: "pointer",
            }}
            title={viewMode === "grid" ? "列表视图" : "网格视图"}
          >
            {viewMode === "grid" ? <List style={{ width: 16, height: 16 }} /> : <Grid style={{ width: 16, height: 16 }} />}
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.border}` }}>
          <button 
            onClick={handleGenerateAll}
            className="btn-primary"
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              border: "none",
            }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            批量提交生成
          </button>
        </div>

        {/* Storyboard List */}
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          <div style={{ 
            display: viewMode === "grid" ? "grid" : "flex",
            gridTemplateColumns: viewMode === "grid" ? "1fr 1fr" : undefined,
            flexDirection: viewMode === "list" ? "column" : undefined,
            gap: 10,
          }}>
            {STORYBOARDS.map(sb => (
              <div
                key={sb.id}
                onClick={() => { setSelected(sb.id); setSelectedSB(sb.id); }}
                style={{
                  background: selected === sb.id ? colors.bgActive : colors.bgSurface,
                  border: `1px solid ${selected === sb.id ? colors.accentDim : colors.border}`,
                  borderRadius: 12,
                  padding: 12,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted }}>{sb.id}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor(sb.status) }} />
                      <span style={{ fontSize: 10, color: statusColor(sb.status) }}>{statusLabel(sb.status)}</span>
                    </div>
                  </div>
                  {sb.status === "done" && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRegenerate(sb.id); }}
                        style={{
                          padding: 4,
                          background: "transparent",
                          border: "none",
                          color: colors.textMuted,
                          cursor: "pointer",
                        }}
                        title="重新生成"
                      >
                        <RefreshCw style={{ width: 12, height: 12 }} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); }}
                        style={{
                          padding: 4,
                          background: "transparent",
                          border: "none",
                          color: colors.textMuted,
                          cursor: "pointer",
                        }}
                        title="删除"
                      >
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  )}
                </div>
                <p style={{ 
                  fontSize: 11, 
                  color: colors.textSecondary, 
                  lineHeight: 1.5, 
                  display: "-webkit-box", 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: "vertical" as const,
                  overflow: "hidden",
                  marginBottom: 8,
                }}>
                  {sb.desc}
                </p>
                
                {/* Preview Area */}
                {sb.status === "done" && (
                  <div style={{
                    width: "100%",
                    aspectRatio: "9/16",
                    background: `linear-gradient(135deg, ${colors.bgElevated} 0%, ${colors.bgPrimary} 100%)`,
                    borderRadius: 6,
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    <ImageIcon style={{ width: 20, height: 20, color: colors.textMuted }} />
                    <div style={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: "rgba(0,0,0,0.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Eye style={{ width: 10, height: 10, color: "#fff" }} />
                    </div>
                  </div>
                )}
                
                {sb.status === "running" && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{
                      width: "100%",
                      aspectRatio: "9/16",
                      background: colors.bgPrimary,
                      borderRadius: 6,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}>
                      <Loader2 style={{ width: 20, height: 20, color: colors.accent, animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: 9, color: colors.textMuted }}>生成中...</span>
                    </div>
                  </div>
                )}
                
                {sb.status === "queued" && (
                  <div style={{
                    width: "100%",
                    aspectRatio: "9/16",
                    background: colors.bgPrimary,
                    borderRadius: 6,
                    marginBottom: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    border: `1px dashed ${colors.border}`,
                  }}>
                    <span style={{ fontSize: 9, color: colors.textMuted }}>排队中</span>
                    <span style={{ fontSize: 8, color: colors.textDisabled }}>预计等待 2分钟</span>
                  </div>
                )}
                
                {sb.status === "failed" && (
                  <div style={{
                    width: "100%",
                    aspectRatio: "9/16",
                    background: "rgba(248,113,113,0.1)",
                    borderRadius: 6,
                    marginBottom: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    border: `1px solid rgba(248,113,113,0.3)`,
                  }}>
                    <span style={{ fontSize: 9, color: colors.error }}>生成失败</span>
                    <button style={{
                      fontSize: 9,
                      color: colors.error,
                      background: "transparent",
                      border: `1px solid ${colors.error}`,
                      borderRadius: 4,
                      padding: "2px 8px",
                      cursor: "pointer",
                    }}>
                      重试
                    </button>
                  </div>
                )}
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: colors.textMuted }}>⭐ {sb.stars}</span>
                  {sb.status === "done" && (
                    <button style={{
                      padding: "4px 8px",
                      background: colors.success,
                      border: "none",
                      borderRadius: 4,
                      fontSize: 9,
                      fontWeight: 600,
                      color: "#fff",
                      cursor: "pointer",
                    }}>
                      查看
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div style={{ flex: 1, background: colors.bgPrimary, display: "flex", flexDirection: "column" }}>
        {selectedSB ? (
          <>
            {/* Video Preview Area */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div style={{
                width: "100%",
                maxWidth: 640,
                aspectRatio: "9/16",
                background: `linear-gradient(135deg, ${colors.bgSurface} 0%, ${colors.bgElevated} 100%)`,
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${colors.border}`,
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Background Effect */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle at 30% 30%, ${colors.accentDim} 0%, transparent 50%)`,
                  opacity: 0.5,
                }} />
                
                {/* Video Placeholder */}
                <Film style={{ width: 56, height: 56, color: colors.textMuted, marginBottom: 16, position: "relative" }} />
                <span style={{ fontSize: 14, color: colors.textMuted, position: "relative" }}>视频预览区域</span>
                <span style={{ fontSize: 11, color: colors.textDisabled, position: "relative", marginTop: 4 }}>
                  {STORYBOARDS.find(s => s.id === selectedSB)?.desc}
                </span>
                
                {/* Play Button Overlay */}
                <div style={{
                  position: "absolute",
                  bottom: 20,
                  right: 20,
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: colors.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: `0 4px 20px ${colors.accentDim}`,
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <Play style={{ width: 22, height: 22, color: "#000", marginLeft: 2 }} />
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div style={{ 
              padding: 20, 
              background: colors.bgSecondary,
              borderTop: `1px solid ${colors.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: statusColor(STORYBOARDS.find(s => s.id === selectedSB)?.status || ""),
                      color: "#fff",
                    }}>
                      {statusLabel(STORYBOARDS.find(s => s.id === selectedSB)?.status || "")}
                    </span>
                    <span style={{ fontSize: 12, color: colors.textMuted }}>
                      ID: {selectedSB}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, marginBottom: 4 }}>
                    {STORYBOARDS.find(s => s.id === selectedSB)?.desc}
                  </h3>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-secondary" style={{ 
                    padding: "10px 16px", 
                    borderRadius: 10, 
                    fontSize: 12.5, 
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}>
                    <Download style={{ width: 14, height: 14 }} />
                    下载
                  </button>
                  <button className="btn-primary" style={{ 
                    padding: "10px 16px", 
                    borderRadius: 10, 
                    fontSize: 12.5, 
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    border: "none",
                  }}>
                    <RefreshCw style={{ width: 14, height: 14 }} />
                    重新生成
                  </button>
                </div>
              </div>
              
              {/* Generation Info */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(4, 1fr)", 
                gap: 12,
                padding: 14,
                background: colors.bgSurface,
                borderRadius: 10,
              }}>
                <div>
                  <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 2 }}>模型</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>Seedance 2.0</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 2 }}>规格</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>480p · 5秒</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 2 }}>比例</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>9:16</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 2 }}>消耗</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.accent }}>⭐ {STORYBOARDS.find(s => s.id === selectedSB)?.stars}</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <Film style={{ width: 64, height: 64, color: colors.textMuted, marginBottom: 16, opacity: 0.5 }} />
              <p style={{ fontSize: 15, color: colors.textMuted, marginBottom: 8 }}>选择左侧分镜查看预览</p>
              <p style={{ fontSize: 12, color: colors.textDisabled }}>点击任意分镜卡片以查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
// App.tsx - 星核耀火桌面应用
// 1:1 还原 Figma 设计稿
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, type ReactNode } from "react";
import {
  Flame, Home, FolderOpen, Film, Layers, BookOpen, Users, Package, CreditCard,
  ChevronRight, Plus, Star, Zap, Clock3, Minus, Square, X
} from "lucide-react";

// Import pages
import CanvasPage from "./pages/CanvasPage";
import { PlotAnalysisPage, PlotAnalysisDetailPage } from "./pages/PlotAnalysisPage";
import StoryboardPage from "./pages/StoryboardPage";
import TeamPage from "./pages/TeamPage";
import { colors, USER } from "./shared";
import type { Nav as NavType, PageId } from "./shared";

// ─── Navigation Items ────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: PageId; icon: typeof Home; label: string; badge: number | null }[] = [
  { id: "workspace", icon: Home, label: "工作空间", badge: null },
  { id: "projects", icon: FolderOpen, label: "项目列表", badge: null },
  { id: "storyboard", icon: Film, label: "分镜工作台", badge: 4 },
  { id: "canvas", icon: Layers, label: "画布", badge: null },
  { id: "plot-analysis", icon: BookOpen, label: "剧情解析", badge: null },
  { id: "team", icon: Users, label: "团队管理", badge: null },
  { id: "assets", icon: Package, label: "素材库", badge: null },
  { id: "billing", icon: CreditCard, label: "账单", badge: null },
];

// ─── Window Frame ──────────────────────────────────────────────────────────────
function WindowFrame() {
  return (
    <div style={{
      height: 44,
      background: colors.bgSecondary,
      borderBottom: `1px solid ${colors.border}`,
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      justifyContent: "space-between",
      flexShrink: 0,
    }}>
      {/* Left: App Logo & Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Flame style={{ width: 16, height: 16, color: "#000" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
          星核耀火
        </span>
        <span style={{ fontSize: 11, color: colors.textMuted, marginLeft: 4 }}>
          v2.0
        </span>
      </div>

      {/* Center: Current Page Title */}
      <div style={{ flex: 1, textAlign: "center" }}>
        <span style={{ fontSize: 12, color: colors.textMuted }}>
          星耀漫剧工作室 · 工作空间
        </span>
      </div>

      {/* Right: Window Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button style={{
          width: 12, height: 12, borderRadius: "50%",
          background: colors.textMuted, border: "none",
          cursor: "pointer", opacity: 0.6,
        }} title="最小化" onClick={() => {}}>
          <Minus style={{ width: 8, height: 8, color: colors.bgPrimary, marginLeft: 2 }} />
        </button>
        <button style={{
          width: 12, height: 12, borderRadius: "50%",
          background: colors.textMuted, border: "none",
          cursor: "pointer", opacity: 0.6,
        }} title="最大化" onClick={() => {}}>
          <Square style={{ width: 8, height: 8, color: colors.bgPrimary }} />
        </button>
        <button style={{
          width: 12, height: 12, borderRadius: "50%",
          background: colors.error, border: "none",
          cursor: "pointer",
        }} title="关闭" onClick={() => {}}>
          <X style={{ width: 8, height: 8, color: "#fff", marginLeft: 2 }} />
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ currentPage, onNavigate }: { currentPage: PageId; onNavigate: (p: PageId) => void }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{
      width: collapsed ? 64 : 220,
      height: "100%",
      background: colors.bgSecondary,
      borderRight: `1px solid ${colors.border}`,
      display: "flex",
      flexDirection: "column",
      transition: "width 0.2s ease",
      flexShrink: 0,
    }}>
      {/* User Profile */}
      <div style={{
        padding: collapsed ? "16px 12px" : "16px 18px",
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#000",
            flexShrink: 0,
          }}>
            {USER.avatar}
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, whiteSpace: "nowrap" }}>
                {USER.name}
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted, whiteSpace: "nowrap" }}>
                {USER.plan}
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <div style={{
            marginTop: 12,
            padding: "10px 12px",
            background: colors.accentDim,
            borderRadius: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 10, color: colors.textMuted }}>星轨余额</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.accent }}>
                {USER.activeStars} ⭐
              </div>
            </div>
            <button style={{
              padding: "6px 12px",
              background: colors.accent,
              border: "none",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              color: "#000",
              cursor: "pointer",
            }}>
              充值
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "12px" : "10px 12px",
                marginBottom: 4,
                background: isActive ? colors.bgActive : "transparent",
                border: isActive ? `1px solid ${colors.accentDim}` : "1px solid transparent",
                borderRadius: 10,
                color: isActive ? colors.accent : colors.textSecondary,
                cursor: "pointer",
                transition: "all 0.15s ease",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!isActive) {
                  e.currentTarget.style.background = colors.bgHover;
                  e.currentTarget.style.color = colors.textPrimary;
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = colors.textSecondary;
                }
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
              {!collapsed && (
                <>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1, textAlign: "left" }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span style={{
                      minWidth: 20, height: 20, padding: "0 6px",
                      background: colors.accent,
                      borderRadius: 10,
                      fontSize: 11, fontWeight: 700, color: "#000",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          margin: 12,
          padding: 10,
          background: colors.bgSurface,
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          color: colors.textMuted,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <ChevronRight style={{ 
          width: 16, height: 16, 
          transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
          transition: "transform 0.2s ease",
        }} />
        {!collapsed && <span style={{ fontSize: 12 }}>收起</span>}
      </button>
    </div>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────────
function Header({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div style={{
      height: 56,
      background: colors.bgSecondary,
      borderBottom: `1px solid ${colors.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      flexShrink: 0,
    }}>
      <h1 style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>
        {title}
      </h1>
      {children}
    </div>
  );
}

// ─── Workspace Page ────────────────────────────────────────────────────────────
function WorkspacePage({ navigate }: NavType) {
  const PROJECTS = [
    { id: "PRJ-001", name: "《镜像》", chapter: "第03集《回声》", progress: 60, updated: "2小时前" },
    { id: "PRJ-002", name: "《星轨》", chapter: "第02集", progress: 35, updated: "昨天" },
    { id: "PRJ-003", name: "《回声》", chapter: "试播集", progress: 100, updated: "3天前" },
  ];

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>
          欢迎回来，{USER.name} 👋
        </h1>
        <p style={{ fontSize: 14, color: colors.textMuted }}>
          {USER.team} · {USER.plan} · 剩余 {USER.planDaysLeft} 天
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
        {[
          { label: "并发任务", value: `${USER.concurrent.used}/${USER.concurrent.total}`, icon: Zap, color: colors.accent },
          { label: "排队任务", value: USER.queue.used, icon: Clock3, color: colors.info },
          { label: "星轨余额", value: USER.activeStars, icon: Star, color: colors.warning },
          { label: "团队余额", value: USER.teamActiveStars, icon: Users, color: colors.purple },
        ].map(stat => (
          <div key={stat.label} style={{
            background: colors.bgSurface,
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: 18,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${stat.color}20`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <stat.icon style={{ width: 22, height: 22, color: stat.color }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>最近项目</h2>
          <button 
            onClick={() => navigate("projects")}
            style={{
              background: "none",
              border: "none",
              color: colors.accent,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            查看全部
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {PROJECTS.map(p => (
            <div key={p.id} style={{
              background: colors.bgSurface,
              border: `1px solid ${colors.border}`,
              borderRadius: 14,
              padding: 18,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.borderColor = colors.accentDim;
              e.currentTarget.style.background = colors.bgHover;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.background = colors.bgSurface;
            }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: colors.accentDim,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Film style={{ width: 20, height: 20, color: colors.accent }} />
                </div>
                <span style={{ fontSize: 11, color: colors.textMuted }}>{p.updated}</span>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 4 }}>
                {p.name}
              </h3>
              <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 14 }}>{p.chapter}</p>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: colors.textMuted }}>进度</span>
                  <span style={{ fontSize: 11, color: colors.textSecondary }}>{p.progress}%</span>
                </div>
                <div style={{ height: 4, background: colors.bgPrimary, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    width: `${p.progress}%`,
                    height: "100%",
                    background: p.progress === 100 ? colors.success : colors.accent,
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 16 }}>
          快速开始
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { icon: Plus, label: "新建项目", color: colors.accent, action: () => navigate("projects") },
            { icon: Package, label: "上传素材", color: colors.info, action: () => navigate("assets") },
            { icon: BookOpen, label: "剧情解析", color: colors.success, action: () => navigate("plot-analysis") },
            { icon: Film, label: "分镜工作台", color: colors.purple, action: () => navigate("storyboard") },
          ].map(action => (
            <button key={action.label} style={{
              padding: 20,
              background: colors.bgSurface,
              border: `1px solid ${colors.border}`,
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.borderColor = action.color;
              e.currentTarget.style.background = `${action.color}10`;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.background = colors.bgSurface;
            }}
            onClick={action.action}
            >
              <action.icon style={{ width: 24, height: 24, color: action.color }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: colors.textPrimary }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Projects Page ───────────────────────────────────────────────────────────────
function ProjectsPage({ navigate }: NavType) {
  const PROJECTS = [
    { id: "PRJ-20260821-014", name: "《镜像》", chapter: "第03集《回声》", status: "进行中", progress: 60, tasks: 8, done: 5 },
    { id: "PRJ-20260820-008", name: "《星轨》", chapter: "第02集", status: "进行中", progress: 35, tasks: 12, done: 4 },
    { id: "PRJ-20260818-003", name: "《回声》", chapter: "试播集", status: "已完成", progress: 100, tasks: 6, done: 6 },
  ];

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>
            项目列表
          </h1>
          <p style={{ fontSize: 13, color: colors.textMuted }}>
            共 {PROJECTS.length} 个项目
          </p>
        </div>
        <button className="btn-primary" style={{ 
          padding: "10px 20px", 
          borderRadius: 12, 
          fontSize: 13, 
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
          border: "none",
        }}>
          <Plus style={{ width: 16, height: 16 }} />
          新建项目
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PROJECTS.map(p => (
          <div key={p.id} style={{
            background: colors.bgSurface,
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: 20,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.borderColor = colors.accentDim;
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.borderColor = colors.border;
          }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>{p.name}</h3>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: p.status === "已完成" ? "rgba(34,197,94,0.15)" : colors.accentDim,
                    color: p.status === "已完成" ? colors.success : colors.accent,
                  }}>
                    {p.status}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 12 }}>
                  {p.chapter} · {p.id}
                </p>
              </div>
              <button 
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); navigate("storyboard"); }}
                className="btn-primary"
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "none",
                }}
              >
                打开项目
              </button>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: colors.textMuted }}>
                  任务进度 · {p.done}/{p.tasks} 完成
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>{p.progress}%</span>
              </div>
              <div style={{ height: 6, background: colors.bgPrimary, borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  width: `${p.progress}%`,
                  height: "100%",
                  background: p.progress === 100 ? colors.success : colors.accent,
                  borderRadius: 3,
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Assets Page ───────────────────────────────────────────────────────────────
function AssetsPage() {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <Package style={{ width: 64, height: 64, color: colors.textMuted, marginBottom: 20, opacity: 0.5 }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>
          素材库
        </h2>
        <p style={{ fontSize: 14, color: colors.textMuted }}>
          管理视频、图片、音频等素材资源
        </p>
      </div>
    </div>
  );
}

// ─── Billing Page ──────────────────────────────────────────────────────────────
function BillingPage() {
  return (
    <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>
          账单与充值
        </h1>
        <p style={{ fontSize: 13, color: colors.textMuted }}>
          查看消费记录，管理星轨余额
        </p>
      </div>

      {/* Balance Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{
          background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
          borderRadius: 16,
          padding: 24,
          color: "#000",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, marginBottom: 8 }}>
            个人钱包余额
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
            {USER.paidStars.toLocaleString()} ⭐
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            活跃星轨：{USER.activeStars}（{USER.activeStarsExpiry}）
          </div>
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.info} 100%)`,
          borderRadius: 16,
          padding: 24,
          color: "#fff",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, marginBottom: 8 }}>
            团队钱包余额
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
            {USER.teamPaidStars.toLocaleString()} ⭐
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            活跃星轨：{USER.teamActiveStars}
          </div>
        </div>
      </div>

      {/* Quick Recharge */}
      <div style={{
        background: colors.bgSurface,
        border: `1px solid ${colors.border}`,
        borderRadius: 14,
        padding: 24,
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 16 }}>
          快速充值
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[500, 1000, 2000, 5000].map(amount => (
            <button key={amount} style={{
              padding: 16,
              background: colors.bgHover,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.borderColor = colors.accent;
              e.currentTarget.style.background = colors.accentDim;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.background = colors.bgHover;
            }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: colors.accent, marginBottom: 4 }}>
                {amount} ⭐
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>
                ¥{(amount / 100).toFixed(0)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page Titles ───────────────────────────────────────────────────────────────
const PAGE_TITLES: Record<PageId, string> = {
  workspace: "工作空间",
  projects: "项目列表",
  storyboard: "分镜工作台",
  canvas: "画布",
  "plot-analysis": "剧情解析",
  "plot-analysis-detail": "剧情解析详情",
  team: "团队管理",
  assets: "素材库",
  billing: "账单",
  landing: "落地页",
  register: "注册",
  verify: "验证",
  onboarding: "引导",
  "new-project": "新建项目",
  "ai-chapter": "AI分集",
  "cost-confirm": "费用确认",
  batch: "批量操作",
  result: "结果",
  delivery: "交付",
  "user-center": "用户中心",
  "team-assets": "团队素材",
  login: "登录",
  upgrade: "升级",
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>("workspace");

  const navigate = useCallback((page: PageId) => {
    setCurrentPage(page);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "workspace": return <WorkspacePage navigate={navigate} />;
      case "projects": return <ProjectsPage navigate={navigate} />;
      case "storyboard": return <StoryboardPage navigate={navigate} />;
      case "canvas": return <CanvasPage navigate={navigate} />;
      case "plot-analysis": return <PlotAnalysisPage navigate={navigate} />;
      case "plot-analysis-detail": return <PlotAnalysisDetailPage navigate={navigate} />;
      case "team": return <TeamPage navigate={navigate} />;
      case "assets": return <AssetsPage />;
      case "billing": return <BillingPage />;
      default: return <WorkspacePage navigate={navigate} />;
    }
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: colors.bgPrimary,
      overflow: "hidden",
    }}>
      {/* Window Frame */}
      <WindowFrame />

      {/* Main Layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onNavigate={navigate} />

        {/* Content Area */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: colors.bgPrimary,
        }}>
          {/* Page Header */}
          <Header title={PAGE_TITLES[currentPage] || "工作空间"} />

          {/* Page Content */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
// TeamPage - 团队管理页
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { X, Plus, Loader2, CheckCircle, User, Settings } from "lucide-react";
import { 
  STUDIO_MEMBERS, TEAM_MEMBERS_INIT, TEAM_ROLES,
  ROLE_STYLE, TEAM_OWNER_ID, colors 
} from "../shared";
import type { Nav as NavType, TeamRole } from "../shared";

// ─── Team Page ────────────────────────────────────────────────────────────────
export default function TeamPage({ navigate: _navigate }: NavType) {
  const [showInvite, setShowInvite] = useState(false);
  const [account, setAccount] = useState("");
  const [role, setRole] = useState<TeamRole>("编剧");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<TeamRole>("编剧");

  const members = TEAM_MEMBERS_INIT;
  const onlineSet = new Set([1, 2, 3]);
  const MAX = 5;

  const handleInvite = () => {
    if (!account.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setShowInvite(false);
        setAccount("");
        setRole("编剧");
      }, 1200);
    }, 1000);
  };

  const handleRemove = (id: number) => {
    setRemoveId(null);
    console.log("移除成员:", id);
  };

  const handleRoleChange = (id: number) => {
    setEditId(null);
    console.log("修改角色:", id, editRole);
  };

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>
            团队管理
          </h1>
          <p style={{ fontSize: 13, color: colors.textMuted }}>
            星耀漫剧工作室 · {members.length} 人 · {members.filter(m => onlineSet.has(m.id)).length} 人在线
          </p>
        </div>
        {members.length < MAX && (
          <button
            onClick={() => setShowInvite(true)}
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
            邀请成员
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "总成员", value: members.length, color: colors.accent },
          { label: "在线", value: members.filter(m => onlineSet.has(m.id)).length, color: colors.success },
          { label: "管理员", value: members.filter(m => m.role === "管理员").length, color: colors.purple },
          { label: "剩余席位", value: MAX - members.length, color: colors.info },
        ].map(stat => (
          <div key={stat.label} style={{
            background: colors.bgSurface,
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: 18,
          }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: colors.textMuted }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Member Table */}
      <div style={{
        background: colors.bgSurface,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
      }}>
        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1fr 1fr 120px",
          padding: "14px 20px",
          background: colors.bgSecondary,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          {["成员", "账号", "职能", "状态", "操作"].map(h => (
            <span key={h} style={{ 
              fontSize: 11, 
              fontWeight: 600, 
              color: colors.textMuted,
              letterSpacing: "0.03em",
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {members.map((m, i) => {
          const rs = ROLE_STYLE[m.role] || { bg: colors.bgHover, color: colors.textMuted };
          const isCreator = m.id === TEAM_OWNER_ID;
          const online = onlineSet.has(m.id);

          return (
            <div key={m.id} style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 120px",
              alignItems: "center",
              padding: "16px 20px",
              borderBottom: i < members.length - 1 ? `1px solid ${colors.border}` : "none",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.bgHover)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>

              {/* Name & Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: rs.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: rs.color,
                  }}>
                    {m.avatar}
                  </div>
                  <div style={{
                    position: "absolute",
                    bottom: 0, right: 0,
                    width: 11, height: 11, borderRadius: "50%",
                    background: online ? colors.success : colors.textDisabled,
                    border: `2px solid ${colors.bgSurface}`,
                  }} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{m.name}</span>
                    {isCreator && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: colors.accent,
                        color: "#000",
                      }}>
                        创始人
                      </span>
                    )}
                  </div>
                  {m.id === members[0].id && (
                    <span style={{ fontSize: 10, color: colors.textMuted }}>（我）</span>
                  )}
                </div>
              </div>

              {/* Account */}
              <span style={{ fontSize: 12, color: colors.textMuted }}>
                {m.account}
              </span>

              {/* Role - Editable */}
              <div>
                {editId === m.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <select 
                      value={editRole} 
                      onChange={e => setEditRole(e.target.value as TeamRole)}
                      style={{
                        fontSize: 12,
                        background: colors.bgSecondary,
                        border: `1px solid ${colors.borderStrong}`,
                        color: colors.textPrimary,
                        borderRadius: 8,
                        padding: "6px 10px",
                        outline: "none",
                      }}
                    >
                      {TEAM_ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button 
                        onClick={() => handleRoleChange(m.id)}
                        style={{
                          fontSize: 11,
                          color: colors.accent,
                          background: colors.accentDim,
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 10px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        保存
                      </button>
                      <button 
                        onClick={() => setEditId(null)}
                        style={{
                          fontSize: 11,
                          color: colors.textMuted,
                          background: "transparent",
                          border: "none",
                          padding: "4px 6px",
                          cursor: "pointer",
                        }}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 100,
                      background: rs.bg,
                      color: rs.color,
                      width: "fit-content",
                    }}>
                      {m.role}
                    </span>
                    {!isCreator && (
                      <button 
                        onClick={() => { setEditId(m.id); setEditRole(m.role as TeamRole); }}
                        style={{
                          background: "none",
                          border: "none",
                          color: colors.textDisabled,
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                        }}
                        title="修改职能"
                      >
                        <Settings style={{ width: 12, height: 12 }} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Online Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ 
                  width: 8, height: 8, borderRadius: "50%", 
                  background: online ? colors.success : colors.textDisabled 
                }} />
                <span style={{ 
                  fontSize: 12, 
                  color: online ? colors.success : colors.textMuted 
                }}>
                  {online ? "在线" : "离线"}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                {!isCreator && (
                  removeId === m.id ? (
                    <>
                      <button 
                        onClick={() => handleRemove(m.id)}
                        style={{
                          fontSize: 11,
                          color: colors.error,
                          background: "rgba(248,113,113,0.1)",
                          border: `1px solid rgba(248,113,113,0.3)`,
                          padding: "5px 12px",
                          borderRadius: 8,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        确认
                      </button>
                      <button 
                        onClick={() => setRemoveId(null)}
                        style={{
                          fontSize: 11,
                          color: colors.textMuted,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        取消
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setRemoveId(m.id)}
                      style={{
                        fontSize: 11,
                        color: colors.textMuted,
                        background: "transparent",
                        border: `1px solid ${colors.border}`,
                        padding: "5px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = colors.error;
                        e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = colors.textMuted;
                        e.currentTarget.style.borderColor = colors.border;
                      }}
                    >
                      移除
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Legend */}
      <div style={{
        background: colors.bgSurface,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: 20,
      }}>
        <h4 style={{ 
          fontSize: 11, 
          fontWeight: 600, 
          color: colors.textMuted, 
          marginBottom: 14,
          letterSpacing: "0.05em",
          textTransform: "uppercase" as const,
        }}>
          职能说明
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px 24px" }}>
          {[
            { role: "管理员", desc: "可邀请成员、管理项目设置" },
            { role: "导演",   desc: "分镜审批与画面质量把控" },
            { role: "编剧",   desc: "剧本创作与剧情结构拆解" },
            { role: "制作人", desc: "统筹进度与资源调配" },
          ].map(item => {
            const rs = ROLE_STYLE[item.role];
            return (
              <div key={item.role}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 100,
                  background: rs.bg,
                  color: rs.color,
                }}>
                  {item.role}
                </span>
                <p style={{ 
                  fontSize: 11.5, 
                  color: colors.textMuted, 
                  marginTop: 6, 
                  lineHeight: 1.5 
                }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
        <p style={{ 
          fontSize: 11, 
          color: colors.textDisabled, 
          marginTop: 14,
          paddingTop: 14,
          borderTop: `1px solid ${colors.border}`,
        }}>
          * 当前版本各职能权限相同，后续版本将逐步开放细粒度权限配置。
        </p>
      </div>

      {/* Invite Modal */}
      {showInvite && (
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
          onClick={e => { if (e.target === e.currentTarget) setShowInvite(false); }}
        >
          <div style={{
            width: 460,
            background: colors.bgSecondary,
            border: `1px solid ${colors.borderStrong}`,
            borderRadius: 20,
            padding: 28,
            animation: "fade-up 0.25s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>
                  邀请成员
                </h2>
                <p style={{ fontSize: 12, color: colors.textMuted }}>
                  通过账号邀请对方加入工作室
                </p>
              </div>
              <button 
                onClick={() => setShowInvite(false)} 
                style={{ 
                  background: "none", 
                  border: "none", 
                  color: colors.textMuted, 
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 8 }}>
                账号（邮箱或用户名）
              </label>
              <div style={{ position: "relative" }}>
                <User style={{ 
                  position: "absolute", 
                  left: 14, 
                  top: "50%", 
                  transform: "translateY(-50%)",
                  width: 16, height: 16, 
                  color: colors.textMuted,
                  pointerEvents: "none",
                }} />
                <input
                  value={account}
                  onChange={e => setAccount(e.target.value)}
                  placeholder="对方注册时使用的邮箱或用户名"
                  style={{
                    width: "100%",
                    padding: "13px 14px 13px 40px",
                    borderRadius: 12,
                    fontSize: 14,
                    background: colors.bgSurface,
                    border: `1px solid ${colors.border}`,
                    color: colors.textPrimary,
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = colors.accent + "80")}
                  onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 10 }}>
                分配职能
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {TEAM_ROLES.map(r => {
                  const rs = ROLE_STYLE[r];
                  const isSelected = role === r;
                  return (
                    <button 
                      key={r} 
                      onClick={() => setRole(r)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.15s",
                        background: isSelected ? rs.bg : colors.bgSurface,
                        border: `1px solid ${isSelected ? rs.color + "60" : colors.border}`,
                      }}
                    >
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: isSelected ? rs.color : colors.textDisabled,
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: isSelected ? rs.color : colors.textSecondary,
                      }}>
                        {r}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowInvite(false)}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: 12,
                  fontSize: 14, fontWeight: 500,
                  background: colors.bgSurface,
                  border: `1px solid ${colors.border}`,
                  color: colors.textMuted,
                  cursor: "pointer",
                }}
              >
                取消
              </button>
              <button
                onClick={handleInvite}
                disabled={!account.trim() || sending || sent}
                style={{
                  flex: 2,
                  padding: "13px",
                  borderRadius: 12,
                  fontSize: 14, fontWeight: 700,
                  background: sent 
                    ? "rgba(34,197,94,0.15)" 
                    : "linear-gradient(135deg, #ff8c20, #ff6010)",
                  border: sent ? "1px solid rgba(34,197,94,0.4)" : "none",
                  color: sent ? colors.success : "#000",
                  opacity: !account.trim() ? 0.4 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: !account.trim() ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                }}
              >
                {sending && <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />}
                {sent && <CheckCircle style={{ width: 16, height: 16 }} />}
                {sending ? "发送中…" : sent ? "邀请已发送" : "发送邀请"}
              </button>
            </div>
            
            <p style={{ 
              fontSize: 11, 
              color: colors.textDisabled, 
              textAlign: "center", 
              marginTop: 16 
            }}>
              对方接受邀请后将出现在成员列表中
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

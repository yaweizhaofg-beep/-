import { useState } from "react";
import {
  X, ChevronLeft, CheckCircle, Check, Star, Plus, Loader2,
  User, Shield, Bell, CreditCard, Users, KeyRound, LogOut,
} from "lucide-react";
import {
  Nav, USER, TEAM_OWNER_ID, TEAM_MEMBERS_INIT, TEAM_ROLES, TeamRole, ROLE_STYLE,
  surface, cardShadow, textMuted, textDim, gold,
} from "../shared";

type UCTab = "account" | "stars" | "recharge" | "subscription" | "team" | "security";

const UC_TABS: { id: UCTab; label: string }[] = [
  { id: "account",      label: "账号信息" },
  { id: "stars",        label: "星石记录" },
  { id: "recharge",     label: "充值星石" },
  { id: "subscription", label: "套餐订阅" },
  { id: "team",         label: "团队管理" },
  { id: "security",     label: "安全设置" },
];

const RECHARGE_PACKS = [
  { stars: 100,   price: 10,   bonus: 0,    hot: false },
  { stars: 500,   price: 50,   bonus: 20,   hot: false },
  { stars: 1000,  price: 100,  bonus: 50,   hot: false },
  { stars: 3000,  price: 300,  bonus: 200,  hot: false },
  { stars: 6000,  price: 600,  bonus: 500,  hot: false },
  { stars: 10000, price: 1000, bonus: 1200, hot: true  },
];

const RECHARGE_LOG = [
  { date: "2026-08-20", pack: "1000 付费星石", price: "¥100.00", method: "支付宝", status: "成功" },
  { date: "2026-07-15", pack: "3000 付费星石", price: "¥300.00", method: "微信支付", status: "成功" },
  { date: "2026-06-02", pack: "500 付费星石",  price: "¥50.00",  method: "支付宝", status: "成功" },
];

const STARS_LOG = [
  { date: "2026-08-21", desc: "SB-004 · Seedance 2.0 Fast · 480p 5s",    type: "消耗", amount: -18.55 },
  { date: "2026-08-21", desc: "SB-003 · Seedance 2.0 Fast · 480p 5s",    type: "消耗", amount: -19.80 },
  { date: "2026-08-20", desc: "套餐续费 · 星轨小队 30天",                   type: "到账", amount: +3079  },
  { date: "2026-08-20", desc: "SB-011 · 任务失败退回",                     type: "退回", amount: +3.20  },
  { date: "2026-08-19", desc: "SB-002 · Seedance 2.0 Fast · 480p 5s",    type: "消耗", amount: -22.10 },
  { date: "2026-08-18", desc: "SB-001 · Seedance 2.0 Fast · 480p 5s",    type: "消耗", amount: -18.55 },
  { date: "2026-08-15", desc: "活动星石到账（注册赠送）",                   type: "活动", amount: +30    },
];

// ─── Recharge Tab ──────────────────────────────────────────────────────────────
function RechargeTab() {
  const [selected, setSelected] = useState(4);
  const [customVal, setCustomVal] = useState("");
  const [method, setMethod] = useState<"alipay" | "wechat" | "card">("alipay");
  const [done, setDone] = useState(false);

  const METHODS = [
    { id: "alipay"  as const, label: "支付宝",   icon: "💙" },
    { id: "wechat"  as const, label: "微信支付", icon: "💚" },
    { id: "card"    as const, label: "银行卡",   icon: "💳" },
  ];

  const pack = RECHARGE_PACKS[selected];
  const isCustom = selected === -1;
  const customStars = Math.floor(parseFloat(customVal || "0") * 10);
  const totalStars = isCustom ? customStars : pack.stars + pack.bonus;
  const totalPrice = isCustom ? parseFloat(customVal || "0") : pack.price;

  if (done) return (
    <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "48px 0", boxShadow: cardShadow, textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
        background: "rgba(255,140,32,.15)", boxShadow: "0 0 30px rgba(255,120,32,.3)" }}>
        <Star style={{ width: 30, height: 30, color: gold }} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 6 }}>充值成功</div>
      <div style={{ fontSize: 14, color: textMuted, marginBottom: 4 }}>
        <span style={{ color: gold, fontWeight: 700 }}>+{totalStars.toLocaleString()}</span> 付费星石已到账
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.25)", marginBottom: 28 }}>
        当前余额 {(USER.paidStars + totalStars).toLocaleString()} 付费星石
      </div>
      <button onClick={() => { setDone(false); setSelected(4); setCustomVal(""); }}
        style={{ padding: "9px 28px", borderRadius: 12, fontSize: 14, fontWeight: 600,
          background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)", cursor: "pointer" }}>
        继续充值
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Balance */}
      <div style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(255,140,32,.12), rgba(255,255,255,.03) 70%)",
        border: "1px solid rgba(255,140,32,.2)", borderRadius: 18, padding: "18px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: textMuted, marginBottom: 4 }}>当前余额</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: gold }}>{USER.paidStars.toLocaleString()}</span>
              <span style={{ fontSize: 13, color: textMuted }}>付费星石</span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.28)", marginTop: 4 }}>
              {USER.activeStars} 活动星石 · {USER.activeStarsExpiry}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: textMuted }}>汇率</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.55)" }}>1 元 = 10 星石</div>
          </div>
        </div>
      </div>

      {/* Packages */}
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px", boxShadow: cardShadow }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 16 }}>选择充值金额</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
          {RECHARGE_PACKS.map((p, i) => {
            const isSel = selected === i;
            return (
              <button key={i} onClick={() => { setSelected(i); setCustomVal(""); }}
                style={{ position: "relative", padding: "16px 14px", borderRadius: 14, textAlign: "left", cursor: "pointer",
                  border: `1px solid ${isSel ? "rgba(255,140,32,.5)" : "rgba(255,255,255,.08)"}`,
                  background: isSel ? "radial-gradient(ellipse at 30% 30%, rgba(255,120,32,.18), rgba(255,255,255,.04) 70%)" : "rgba(255,255,255,.03)",
                  transition: "all .18s",
                  boxShadow: isSel ? "0 0 0 1px rgba(255,140,32,.25)" : "none" }}>
                {p.hot && (
                  <span style={{ position: "absolute", top: -10, right: 12, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    background: "linear-gradient(90deg,#ff8c20,#ff5010)", color: "black" }}>最划算</span>
                )}
                {isSel && (
                  <span style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg,#ff8c20,#ff5010)" }}>
                    <Check style={{ width: 10, height: 10, color: "black" }} />
                  </span>
                )}
                <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 2 }}>
                  {p.stars.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, color: textMuted }}> 星石</span>
                </div>
                {p.bonus > 0 && <div style={{ fontSize: 11, color: "#34d399", fontWeight: 600, marginBottom: 4 }}>+{p.bonus} 赠送</div>}
                {p.bonus === 0 && <div style={{ marginBottom: 4 }} />}
                <div style={{ fontSize: 15, fontWeight: 700, color: isSel ? gold : "rgba(255,255,255,.6)" }}>¥{p.price}</div>
              </button>
            );
          })}
        </div>

        {/* Custom */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setSelected(-1)} style={{ flexShrink: 0, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 500,
            border: `1px solid ${selected === -1 ? "rgba(255,140,32,.4)" : "rgba(255,255,255,.08)"}`,
            background: selected === -1 ? "rgba(255,140,32,.08)" : "rgba(255,255,255,.03)",
            color: selected === -1 ? gold : textMuted, cursor: "pointer" }}>
            自定义金额
          </button>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: textMuted }}>¥</span>
            <input type="number" min="1" placeholder="输入金额（1 元 = 10 星石）" value={customVal}
              onChange={e => { setCustomVal(e.target.value); setSelected(-1); }}
              style={{ width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 12, padding: "10px 14px 10px 28px", fontSize: 13, color: "white", outline: "none", boxSizing: "border-box" }} />
            {isCustom && customVal && (
              <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: textMuted }}>
                ≈ {customStars.toLocaleString()} 星石
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>支付方式</h3>
        <div style={{ display: "flex", gap: 10 }}>
          {METHODS.map(m => {
            const isSel = method === m.id;
            return (
              <button key={m.id} onClick={() => setMethod(m.id)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                borderRadius: 12, border: `1px solid ${isSel ? "rgba(255,140,32,.4)" : "rgba(255,255,255,.08)"}`,
                background: isSel ? "rgba(255,140,32,.07)" : "rgba(255,255,255,.03)", cursor: "pointer" }}>
                <span style={{ fontSize: 18 }}>{m.icon}</span>
                <span style={{ fontSize: 13, fontWeight: isSel ? 600 : 400, color: isSel ? "rgba(255,255,255,.9)" : textMuted }}>{m.label}</span>
                {isSel && <Check style={{ width: 13, height: 13, color: gold, marginLeft: "auto" }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div style={{ background: "radial-gradient(ellipse at 80% 0%, rgba(255,120,32,.1), rgba(255,255,255,.03) 65%)",
        border: "1px solid rgba(255,140,32,.2)", borderRadius: 18, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 4 }}>本次充值</div>
            <span style={{ fontSize: 26, fontWeight: 800, color: "white" }}>+{(totalStars || 0).toLocaleString()}</span>
            <span style={{ fontSize: 13, color: textMuted, marginLeft: 6 }}>付费星石</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 4 }}>实付金额</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: gold }}>¥{totalPrice || 0}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,.35)",
          paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)", marginBottom: 16 }}>
          <span>充值后余额</span>
          <span style={{ color: "rgba(255,255,255,.55)", fontWeight: 500 }}>
            {(USER.paidStars + (totalStars || 0)).toLocaleString()} 付费星石
          </span>
        </div>
        <button disabled={!totalPrice || totalPrice <= 0} onClick={() => setDone(true)}
          style={{ width: "100%", height: 48, borderRadius: 13, fontSize: 15, fontWeight: 700,
            background: "linear-gradient(135deg,#ff8c20,#ff5010)", border: "none",
            color: "black", opacity: totalPrice > 0 ? 1 : 0.35, cursor: "pointer" }}>
          确认支付 ¥{totalPrice || 0}
        </button>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,.2)", textAlign: "center", marginTop: 10 }}>
          付费星石永久有效，不可提现或转让 · 价格含税
        </p>
      </div>

      {/* History */}
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>充值记录</h3>
        {RECHARGE_LOG.map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0",
            borderBottom: i < RECHARGE_LOG.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)", marginBottom: 2 }}>{row.pack}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{row.date} · {row.method}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: gold }}>{row.price}</span>
              <span style={{ fontSize: 11, color: "#34d399", fontWeight: 600 }}>{row.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stars Log Tab ─────────────────────────────────────────────────────────────
function StarsLogTab() {
  const typeColor = (t: string) => t === "到账" || t === "退回" || t === "活动" ? "#34d399" : t === "消耗" ? "#f87171" : "rgba(255,255,255,.4)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px" }}>
        <div style={{ fontSize: 12, color: textMuted, marginBottom: 4 }}>当前余额</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: gold }}>{USER.paidStars.toLocaleString()}</span>
          <span style={{ fontSize: 13, color: textMuted }}>付费星石</span>
        </div>
      </div>
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>全部记录</h3>
        {STARS_LOG.map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            padding: "12px 0", borderBottom: i < STARS_LOG.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.75)", marginBottom: 3 }}>{row.desc}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{row.date}</div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: typeColor(row.type), flexShrink: 0, marginLeft: 16 }}>
              {row.amount > 0 ? "+" : ""}{row.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Team Tab (Read-only) ──────────────────────────────────────────────────────
function TeamTab() {
  const localSurface = "#12101a";
  const localBdr = "rgba(255,255,255,.07)";
  return (
    <div>
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px", marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 3 }}>{USER.team}</h3>
        <p style={{ fontSize: 12, color: textMuted }}>完整团队管理请前往侧边栏「团队管理」</p>
      </div>
      <div style={{ background: localSurface, border: `1px solid ${localBdr}`, borderRadius: 16, overflow: "hidden" }}>
        {TEAM_MEMBERS_INIT.map((m, i) => {
          const rs = ROLE_STYLE[m.role] ?? ROLE_STYLE["制作人"];
          return (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px",
              borderBottom: i < TEAM_MEMBERS_INIT.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: rs.bg, color: rs.color, fontSize: 13, fontWeight: 700 }}>{m.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "white" }}>{m.name}</div>
                <div style={{ fontSize: 11, color: textMuted }}>{m.account}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 100, background: rs.bg, color: rs.color }}>{m.role}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Subscription Tab ─────────────────────────────────────────────────────────
function SubscriptionTab() {
  const PLANS = [
    { name: "星轨小队", price: 299, period: "30天", stars: 3079, members: 5, concurrent: 8, current: true },
    { name: "星芒协作", price: 99,  period: "30天", stars: 1019, members: 3, concurrent: 4, current: false },
    { name: "微光启航", price: 28,  period: "7天",  stars: 288,  members: 2, concurrent: 2, current: false },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "linear-gradient(135deg,rgba(255,138,32,.12),rgba(255,255,255,.03))",
        border: "1px solid rgba(255,138,32,.25)", borderRadius: 18, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: textMuted, marginBottom: 6 }}>当前方案</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 2 }}>星轨小队</div>
            <div style={{ fontSize: 12, color: textMuted }}>¥299 / 30天 · 剩余 21 天</div>
          </div>
          <span style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
            background: "rgba(255,138,32,.2)", color: "#ff8c20", border: "1px solid rgba(255,138,32,.3)" }}>生效中</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)" }}>
          {[["3,079", "星石"], ["5", "团队成员"], ["8", "并发任务"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: gold }}>{v}</div>
              <div style={{ fontSize: 11, color: textMuted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>其他方案</h3>
        {PLANS.filter(p => !p.current).map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0",
            borderBottom: i < PLANS.filter(x => !x.current).length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "white", marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: textMuted }}>{p.members}人 · {p.concurrent}并发</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.5)" }}>¥{p.price}</span>
              <button style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", cursor: "pointer" }}>
                升级
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Security Tab ──────────────────────────────────────────────────────────────
function SecurityTab() {
  const [editingNick, setEditingNick] = useState(false);
  const [nickname, setNickname] = useState(USER.name);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[
        { icon: User,       label: "头像与昵称",  value: USER.name,   action: "编辑", onAction: () => setEditingNick(!editingNick) },
        { icon: KeyRound,   label: "登录密码",    value: "••••••••",  action: "修改" },
        { icon: Bell,       label: "通知设置",    value: "已开启",     action: "管理" },
        { icon: CreditCard, label: "支付方式",    value: "支付宝 ·•2631", action: "管理" },
        { icon: Shield,     label: "隐私设置",    value: "正常",       action: "查看" },
      ].map((item, i) => (
        <div key={i} style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <item.icon style={{ width: 16, height: 16, color: "rgba(255,255,255,.5)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "white", marginBottom: 2 }}>{item.label}</div>
            {editingNick && item.label === "头像与昵称" ? (
              <input value={nickname} onChange={e => setNickname(e.target.value)} autoFocus
                style={{ fontSize: 13, color: textMuted, background: "transparent", border: "none", outline: "none", padding: 0, width: "100%" }} />
            ) : (
              <div style={{ fontSize: 13, color: textMuted }}>{item.value}</div>
            )}
          </div>
          <button onClick={item.onAction}
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", cursor: "pointer" }}>
            {editingNick && item.label === "头像与昵称" ? "保存" : item.action}
          </button>
        </div>
      ))}
      <button style={{ marginTop: 8, padding: "14px", borderRadius: 14, fontSize: 14, fontWeight: 600, background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.2)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <LogOut style={{ width: 16, height: 16 }} />
        退出登录
      </button>
    </div>
  );
}

// ─── Account Tab ──────────────────────────────────────────────────────────────
function AccountTab({ navigate }: Nav) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Profile card */}
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#ff8a1f,#ffad4a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "black", flexShrink: 0 }}>
            {USER.avatar}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 4 }}>{USER.name}</div>
            <div style={{ fontSize: 12, color: textMuted }}>{USER.team} · {USER.plan}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { label: "并发任务", value: `${USER.concurrent.used}/${USER.concurrent.total}` },
            { label: "排队任务", value: USER.queue.used },
            { label: "套餐剩余", value: `${USER.planDaysLeft}天` },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,.04)", borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => navigate("workspace")} style={{ padding: "13px", borderRadius: 14, fontSize: 14, fontWeight: 600,
        background: "linear-gradient(135deg,#ff8c20,#ff5010)", border: "none", color: "black", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        返回工作空间
      </button>
    </div>
  );
}

// ─── Main UserCenterPage ──────────────────────────────────────────────────────
export default function UserCenterPage({ navigate }: Nav) {
  const [tab, setTab] = useState<UCTab>("account");
  const bdr = "rgba(255,255,255,.1)";

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left sidebar tabs */}
      <div style={{ width: 200, borderRight: `1px solid ${bdr}`, padding: "20px 12px", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.3)", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 10px 10px" }}>设置</div>
        {UC_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
            background: tab === t.id ? "rgba(255,138,31,.1)" : "transparent",
            color: tab === t.id ? "#ff8a1f" : "rgba(255,255,255,.5)",
            transition: "all .15s",
          }}>
            <span style={{ fontSize: 13, fontWeight: tab === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
        <div style={{ maxWidth: 640 }}>
          {tab === "account"      && <AccountTab navigate={navigate} />}
          {tab === "stars"        && <StarsLogTab />}
          {tab === "recharge"     && <RechargeTab />}
          {tab === "subscription" && <SubscriptionTab />}
          {tab === "team"         && <TeamTab />}
          {tab === "security"     && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
// UpgradePage - 升级套餐
// 设计来源：Figma Make UpgradePage (LandingSection.tsx)
// 标记为：设计补全（非原稿还原，基于 Make 套餐规则适配本地 token）
// 真实计费规则来自 Make 源码，不自行编造价格
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { ChevronLeft, Users, User, Check } from "lucide-react";
import { USER } from "../shared";
import type { PageId } from "../shared";

interface NavType { navigate: (p: PageId) => void; }

const gold = "#ffac30";

// Make 套餐数据（直接复用，不修改价格）
// 个人套餐：仅限本人使用，不含团队成员/共享资产/项目共创
const UP_GROUP = [
  { name:"星尘试用", price:0,    period:"7天",  stars:30,    note:"活动星石", members:1,  concurrent:1,  queue:50,    hot:false, tag:"免费",  perks:["体验全创作模式","1人使用","1并发","全模型访问"] },
  { name:"微光启航", price:28,   period:"7天",  stars:250,   note:"套餐星石", members:1,  concurrent:2,  queue:100,   hot:false, tag:null,   perks:["全创作模式","1人使用","2并发","全模型访问"] },
  { name:"星芒个人", price:99,   period:"30天", stars:900,   note:"套餐星石", members:1,  concurrent:4,  queue:300,   hot:false, tag:null,   perks:["全创作模式","1人使用","4并发","全模型访问"] },
];
// 团队套餐：从299元起，含团队成员/团队资产库/项目共创，独立团队钱包
const UP_TEAM = [
  { name:"星轨小队", price:299,  period:"30天", stars:2500,  note:"套餐星石", members:5,  concurrent:8,  queue:1000,  hot:true,  tag:"推荐",  perks:["全创作模式","5人协作","8并发","团队资产库"] },
  { name:"星核轻量", price:599,  period:"30天", stars:5000,  note:"套餐星石", members:10, concurrent:12, queue:3000,  hot:false, tag:null,   perks:["全创作模式","10人","12并发","API访问"] },
  { name:"星核基础", price:999,  period:"30天", stars:8000,  note:"套餐星石", members:20, concurrent:20, queue:10000, hot:false, tag:null,   perks:["全创作模式","20人","20并发","API+回调"] },
  { name:"星核高级", price:1999, period:"30天", stars:16000, note:"套餐星石", members:30, concurrent:25, queue:30000, hot:false, tag:null,   perks:["全创作模式","30人","25并发","专属SLA"] },
  { name:"超级新星", price:-1,   period:"定制", stars:0,     note:"",         members:0,  concurrent:0,  queue:0,     hot:false, tag:"商务", perks:["私有工作流","专属模型","API深度集成","KA服务"] },
];

export default function UpgradePage({ navigate }: NavType) {
  const [tab, setTab] = useState<"group"|"team">("team");
  const plans = tab === "group" ? UP_GROUP : UP_TEAM;
  const CURRENT = USER.plan; // "星轨小队"

  return (
    <div style={{ minHeight: "100vh", background: "#090A0E", color: "white", position: "relative" }}>

      {/* Ambient blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "8%", left: "12%", width: 600, height: 400, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(255,138,31,.07) 0%,transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "8%", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(168,85,247,.05) 0%,transparent 68%)", filter: "blur(100px)" }} />
      </div>

      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(9,10,14,.9)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,.07)", padding: "0 32px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("user-center")}
            style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,.45)",
              background: "none", border: "none", cursor: "pointer", padding: "4px 0",
            }}>
            <ChevronLeft style={{ width: 14, height: 14 }} />
            个人中心
          </button>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,.1)" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>升级套餐</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.4)" }}>
            <span>当前套餐：</span>
            <span style={{ color: gold, fontWeight: 600 }}>{CURRENT}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "48px 32px 80px" }}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: 10 }}>
            选择创作能量等级
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.38)", marginBottom: 28 }}>
            从双人灵感实验，到30人规模生产 · 随时升降级 · 按日期结算差价
          </p>

          {/* Tab toggle */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "inline-flex", background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.09)", borderRadius: 12, padding: 4, gap: 4,
            }}>
              {([["group","个人套餐"],["team","团队套餐"]] as const).map(([k, label]) => (
                <button key={k} onClick={() => setTab(k)}
                  style={{
                    padding: "7px 24px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                    cursor: "pointer", transition: "all .18s", border: "none",
                    ...(tab === k
                      ? { background: gold, color: "black", boxShadow: `0 2px 12px rgba(255,138,31,.35)` }
                      : { background: "transparent", color: "rgba(255,255,255,.5)" }),
                  }}>
                  {label}
                </button>
              ))}
            </div>
            {tab === "team" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.4)" }}>
                <Users style={{ width: 12, height: 12, color: "#a78bfa" }} />
                <span>团队会员从 <strong style={{ color: "#a78bfa" }}>¥299</strong> 起 · 包含团队成员、团队资产库和项目共创 · 个人钱包与团队钱包独立不串账</span>
              </div>
            )}
            {tab === "group" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.4)" }}>
                <User style={{ width: 12, height: 12, color: "#60a5fa" }} />
                <span>个人会员仅限本人使用，不含团队成员、共享资产和项目共创功能</span>
              </div>
            )}
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display: "grid", gridTemplateColumns: tab === "group" ? "repeat(3,1fr)" : "repeat(4,1fr)", gap: 16, alignItems: "stretch" }}>
          {plans.map(plan => {
            const isCurrent = plan.name === CURRENT;
            const isCustom = plan.price === -1;
            return (
              <div key={plan.name}
                style={{
                  position: "relative", borderRadius: 16, padding: "24px 20px 20px",
                  display: "flex", flexDirection: "column", boxSizing: "border-box",
                  transition: "transform .2s, box-shadow .2s",
                  ...(plan.hot ? {
                    background: "radial-gradient(ellipse at 50% 0%,rgba(255,138,31,.14),rgba(255,255,255,.03) 68%)",
                    border: "1px solid rgba(255,138,31,.3)", boxShadow: "0 0 48px rgba(255,100,20,.1)",
                  } : isCurrent ? {
                    background: "rgba(255,138,31,.04)",
                    border: "1px solid rgba(255,138,31,.18)",
                  } : {
                    background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)",
                  }),
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = plan.hot ? "0 8px 48px rgba(255,100,20,.18)" : "0 8px 32px rgba(0,0,0,.4)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "none";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = plan.hot ? "0 0 48px rgba(255,100,20,.1)" : "none";
                }}>

                {/* Hot / Tag badge */}
                {plan.tag && (
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20, whiteSpace: "nowrap",
                    ...(plan.tag === "推荐" ? { background: gold, color: "black" }
                      : plan.tag === "商务" ? { background: "rgba(168,85,247,.25)", border: "1px solid rgba(168,85,247,.4)", color: "#c084fc" }
                      : plan.tag === "免费" ? { background: "rgba(52,211,153,.2)", border: "1px solid rgba(52,211,153,.4)", color: "#34d399" }
                      : { background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.65)" }),
                  }}>
                    {plan.tag}
                  </div>
                )}
                {isCurrent && (
                  <div style={{
                    position: "absolute", top: -13, right: 16,
                    fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20,
                    background: "rgba(255,138,31,.18)", border: "1px solid rgba(255,138,31,.3)", color: gold,
                  }}>
                    当前套餐
                  </div>
                )}

                {/* Plan name */}
                <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 8 }}>{plan.name}</div>

                {/* Price */}
                <div style={{ marginBottom: 12 }}>
                  {isCustom ? (
                    <span style={{ fontSize: 22, fontWeight: 700, color: "white" }}>联系商务</span>
                  ) : (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontSize: 30, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
                        {plan.price === 0 ? "免费" : `¥${plan.price}`}
                      </span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>/{plan.period}</span>
                    </div>
                  )}
                </div>

                {/* Stars bonus */}
                {plan.stars > 0 && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5, marginBottom: 14,
                    padding: "6px 10px", borderRadius: 8,
                    background: "rgba(255,138,31,.07)", border: "1px solid rgba(255,138,31,.15)",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
                      <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9.5,11 6,9 2.5,11 3.5,7.5 1,5 4.5,4.5" fill={gold} />
                    </svg>
                    <span style={{ fontSize: 13, color: gold, fontWeight: 700 }}>{plan.stars.toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,138,31,.6)" }}>{plan.note}</span>
                  </div>
                )}

                {/* Key stats */}
                {!isCustom && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                    {([
                      ["成员", `${plan.members}人`],
                      ["并发", `${plan.concurrent}路`],
                    ] as const).map(([l, v]) => (
                      <div key={l} style={{ background: "rgba(255,255,255,.04)", borderRadius: 8, padding: "7px 10px" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Perks */}
                <div style={{ flex: 1, marginBottom: 18 }}>
                  {plan.perks.map(p => (
                    <div key={p} style={{
                      display: "flex", alignItems: "center", gap: 7, fontSize: 12,
                      color: "rgba(255,255,255,.5)", marginBottom: 7,
                    }}>
                      <Check style={{ width: 12, height: 12, flexShrink: 0, color: plan.hot ? gold : "rgba(255,255,255,.3)" }} />
                      {p}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  disabled={isCurrent}
                  onClick={() => !isCurrent && navigate("user-center")}
                  style={{
                    width: "100%", padding: "10px 0", borderRadius: 11, fontSize: 13, fontWeight: 700,
                    cursor: isCurrent ? "default" : "pointer", transition: "all .18s", border: "none",
                    ...(isCurrent
                      ? { background: "rgba(255,138,31,.1)", color: "rgba(255,138,31,.5)" }
                      : isCustom
                        ? { background: "rgba(168,85,247,.15)", border: "1px solid rgba(168,85,247,.3)", color: "#c084fc" }
                        : plan.hot
                          ? { background: gold, color: "black", boxShadow: `0 4px 20px rgba(255,138,31,.4)` }
                          : { background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.75)" }),
                  }}>
                  {isCurrent ? "当前套餐" : isCustom ? "联系商务" : "立即升级"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Upgrade formula */}
        <div style={{
          marginTop: 32, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)",
          borderRadius: 16, padding: "20px 28px",
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.45)",
            letterSpacing: "0.05em", marginBottom: 12, textTransform: "uppercase",
          }}>
            套餐升级计算公式
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.9 }}>
              <div><span style={{ color: gold, fontWeight: 600 }}>补款</span> = (新套餐价格 − 旧套餐价格) × 剩余天数 ÷ 30</div>
              <div><span style={{ color: "#34d399", fontWeight: 600 }}>补发星石</span> = (新套餐星石 − 旧套餐星石) × 剩余天数 ÷ 30</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 6 }}>到期日不变 · 成员上限和并发立即生效</div>
            </div>
            <div style={{
              background: "rgba(255,138,31,.06)", border: "1px solid rgba(255,138,31,.15)",
              borderRadius: 10, padding: "12px 16px", fontSize: 12, color: "rgba(255,255,255,.5)", lineHeight: 1.9,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: gold, marginBottom: 6 }}>示例：¥599 升级 ¥999，剩余 10 天</div>
              <div>补款：(999 − 599) × 10 ÷ 30 = <span style={{ color: gold, fontWeight: 600 }}>¥133.33</span></div>
              <div>补发：(8000 − 5000) × 10 ÷ 30 = <span style={{ color: "#34d399", fontWeight: 600 }}>1,000 星石</span></div>
              <div>成员上限 10 → 20 人 · 并发 12 → 20 路</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import {
  Eye, EyeOff, Check, ChevronRight, ChevronLeft, Play, Download,
  Shield, Star, Zap, Users, Film, Lock, Loader2, X, Sparkles, Home,
  BookOpen, Layers,
} from "lucide-react";
import { Nav } from "../shared";

// ─── Plans ─────────────────────────────────────────────────────────────────────
const PLANS_PERSONAL = [
  { name: "星尘试用", price: 0,   period: "7天",  stars: 30,    members: 1, concurrent: 1, queue: 50,    hot: false, tag: null, perks: ["指定体验模型", "1人并发", "免费体验"] },
  { name: "微光启航", price: 28,  period: "7天",  stars: 288,   members: 2, concurrent: 2, queue: 100,   hot: false, tag: null, perks: ["全创作模式", "2人并发"] },
  { name: "星芒协作", price: 99,  period: "30天", stars: 1019,  members: 3, concurrent: 4, queue: 300,   hot: false, tag: null, perks: ["全创作模式", "3人", "4并发"] },
  { name: "星轨小队", price: 299, period: "30天", stars: 3079,  members: 5, concurrent: 8, queue: 1000,  hot: true,  tag: "主推", perks: ["全创作模式", "5人", "8并发"] },
];
const PLANS_TEAM = [
  { name: "星核轻量", price: 599,  period: "30天", stars: 6169,  members: 10, concurrent: 12, queue: 3000,  hot: false, tag: null,   perks: ["全创作模式", "10人", "12并发"] },
  { name: "星核基础", price: 999,  period: "30天", stars: 10289, members: 20, concurrent: 20, queue: 10000, hot: true,  tag: "主推",  perks: ["全创作模式", "20人", "20并发"] },
  { name: "星核高级", price: 1999, period: "30天", stars: 20589, members: 30, concurrent: 20, queue: 30000, hot: false, tag: null,   perks: ["全创作模式", "30人", "并发可扩展25"] },
  { name: "超级新星", price: -1,   period: "定制", stars: 0,     members: 0,  concurrent: 0,  queue: 0,     hot: false, tag: "商务", perks: ["API与回调", "私有工作流", "专属SLA"] },
];

// ─── Aurora Canvas ──────────────────────────────────────────────────────────────
function AuroraCanvas({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, px: 0, py: 0, active: false, strength: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frameId = 0, width = 0, height = 0, t = 0;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; life: number; maxLife: number; hue: number; tw: number }[] = [];

    const resize = () => {
      const r2 = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = r2.width; height = r2.height;
      canvas.width  = width  * dpr;
      canvas.height = height * dpr;
      canvas.style.width  = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (pointer.current.x === 0) { pointer.current.x = pointer.current.px = width / 2; pointer.current.y = pointer.current.py = height / 2; }
    };
    resize();
    new ResizeObserver(resize).observe(container);

    const spawn = () => {
      const m = pointer.current;
      const a = Math.random() * Math.PI * 2;
      const spread = 60 + Math.random() * 120;
      const life = 60 + Math.random() * 90;
      particles.push({ x: m.x + Math.cos(a) * spread, y: m.y + Math.sin(a) * spread * 0.7, vx: Math.cos(a) * (0.3 + Math.random() * 1.2), vy: Math.sin(a) * (0.3 + Math.random() * 1.2) + (m.y - m.py) * 0.02, r: 0.4 + Math.random() * 1.8, life, maxLife: life, hue: 12 + Math.random() * 32, tw: Math.random() * Math.PI * 2 });
      if (particles.length > 180) particles.splice(0, particles.length - 180);
    };

    const loop = () => {
      t++;
      const m = pointer.current;
      m.strength += ((m.active ? 1 : 0) - m.strength) * 0.075;
      ctx.clearRect(0, 0, width, height);
      if (m.active) { const mv = Math.hypot(m.x - m.px, m.y - m.py); for (let i = 0; i < Math.min(5, Math.max(1, Math.round(mv * 0.14))); i++) spawn(); }
      particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.vy = p.vy * 0.985 - 0.003; p.life -= 1; p.tw += 0.12; });
      particles.filter(p => p.life > 0).forEach(p => {
        const prog = p.life / p.maxLife;
        const fadeIn = Math.min(1, (1 - prog) * 5);
        const alpha = prog * fadeIn * (0.65 + Math.sin(p.tw) * 0.35) * 0.5;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5.5);
        g.addColorStop(0,    `hsla(${p.hue},100%,94%,${alpha})`);
        g.addColorStop(0.18, `hsla(${p.hue},100%,68%,${alpha * 0.82})`);
        g.addColorStop(0.5,  `hsla(${p.hue},100%,52%,${alpha * 0.35})`);
        g.addColorStop(1,    `hsla(${p.hue},100%,45%,0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,245,215,${alpha})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.58, 0, Math.PI * 2); ctx.fill();
      });
      if (m.strength > 0.01) {
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 290);
        glow.addColorStop(0,    `rgba(255,225,155,${0.24 * m.strength})`);
        glow.addColorStop(0.18, `rgba(255,135,30,${0.20 * m.strength})`);
        glow.addColorStop(0.48, `rgba(255,55,0,${0.12 * m.strength})`);
        glow.addColorStop(0.75, `rgba(110,20,0,${0.05 * m.strength})`);
        glow.addColorStop(1,    "rgba(0,0,0,0)");
        ctx.fillStyle = glow; ctx.fillRect(m.x - 320, m.y - 320, 640, 640);
        for (let layer = 0; layer < 3; layer++) {
          const hue = 18 + layer * 7, amp = 24 + layer * 13, vy = (layer - 1) * 27;
          ctx.beginPath();
          for (let x = -210; x <= 210; x += 6) {
            const y = m.y + vy + Math.sin(x * 0.025 + t * 0.018 + layer * 1.3) * amp + Math.sin(x * 0.012 - t * 0.012 + layer) * 18;
            x === -210 ? ctx.moveTo(m.x + x, y) : ctx.lineTo(m.x + x, y);
          }
          ctx.strokeStyle = `hsla(${hue},100%,62%,${(0.055 + layer * 0.017) * m.strength})`;
          ctx.lineWidth = 34 - layer * 7; ctx.lineCap = "round"; ctx.lineJoin = "round";
          ctx.shadowBlur = 30; ctx.shadowColor = `hsla(${hue},100%,62%,${0.38 * m.strength})`;
          ctx.stroke();
        }
        const core = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 42);
        core.addColorStop(0,   `rgba(255,245,210,${0.17 * m.strength})`);
        core.addColorStop(0.25,`rgba(255,170,65,${0.12 * m.strength})`);
        core.addColorStop(1,   "rgba(255,70,0,0)");
        ctx.fillStyle = core; ctx.beginPath(); ctx.arc(m.x, m.y, 42, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      m.px += (m.x - m.px) * 0.35; m.py += (m.y - m.py) * 0.35;
      frameId = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(frameId); };
  }, []);

  return (
    <div ref={containerRef}
      onPointerEnter={e => { const b = e.currentTarget.getBoundingClientRect(); pointer.current.x = e.clientX - b.left; pointer.current.y = e.clientY - b.top; pointer.current.active = true; }}
      onPointerMove={e => { const b = e.currentTarget.getBoundingClientRect(); pointer.current.x = e.clientX - b.left; pointer.current.y = e.clientY - b.top; }}
      onPointerLeave={() => { pointer.current.active = false; }}
      style={{ position: "relative", overflow: "hidden", isolation: "isolate", ...style }}>
      <canvas ref={canvasRef} aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, width: "100%", height: "100%", pointerEvents: "none", mixBlendMode: "screen" }} />
      <div style={{ position: "relative", zIndex: 1, minHeight: "inherit" }}>{children}</div>
    </div>
  );
}

// ─── Login Modal ────────────────────────────────────────────────────────────────
function LoginModal({ onClose, onSwitch, onLogin }: { onClose: () => void; onSwitch: () => void; onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !pw) { setErr("请填写邮箱和密码"); return; }
    setLoading(true); setErr("");
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,.8)", backdropFilter: "blur(12px)" }}>
      <div style={{ width: 420, background: "#14111f", border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, padding: "32px 32px 28px", boxShadow: "0 40px 100px rgba(0,0,0,.7)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 3 }}>登录星核耀火</h2>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.4)" }}>AI 视频创作平台</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,.35)", cursor: "none", display: "flex" }}><X style={{ width: 18, height: 18 }} /></button>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", marginBottom: 7 }}>邮箱</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14, background: "rgba(255,255,255,.06)", border: `1px solid ${err && !email ? "rgba(248,113,113,.5)" : "rgba(255,255,255,.1)"}`, color: "white", outline: "none", boxSizing: "border-box" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,138,31,.5)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.1)")} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", marginBottom: 7 }}>密码</label>
          <div style={{ position: "relative" }}>
            <input value={pw} onChange={e => setPw(e.target.value)} type={showPw ? "text" : "password"} placeholder="••••••••"
              style={{ width: "100%", padding: "11px 42px 11px 14px", borderRadius: 12, fontSize: 14, background: "rgba(255,255,255,.06)", border: `1px solid ${err && !pw ? "rgba(248,113,113,.5)" : "rgba(255,255,255,.1)"}`, color: "white", outline: "none", boxSizing: "border-box" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,138,31,.5)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.1)")} />
            <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,.35)", cursor: "none", display: "flex" }}>
              {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </div>
        </div>
        {err && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 14 }}>{err}</p>}
        <button onClick={handleLogin} disabled={loading}
          style={{ width: "100%", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, background: loading ? "rgba(255,138,31,.6)" : "linear-gradient(135deg,#ff8c20,#ff5010)", border: "none", color: "black", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "none" }}>
          {loading && <Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />}
          {loading ? "登录中…" : "登录"}
        </button>
        <p style={{ textAlign: "center", fontSize: 12.5, color: "rgba(255,255,255,.38)", marginTop: 16 }}>
          没有账号？<button onClick={onSwitch} style={{ background: "none", border: "none", color: "#ff8c20", cursor: "none", fontSize: 12.5, fontWeight: 600 }}>立即注册</button>
        </p>
      </div>
    </div>
  );
}

// ─── Register Modal ──────────────────────────────────────────────────────────────
function RegisterModal({ onClose, onSwitch }: { onClose: () => void; onSwitch: () => void }) {
  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");

  const handleSendCode = () => {
    if (!email.trim()) { setErr("请输入邮箱"); return; }
    setSent(true); setErr("");
  };

  const handleVerify = () => {
    if (code.length < 4) { setErr("请输入4位验证码"); return; }
    setStep("verify");
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,.8)", backdropFilter: "blur(12px)" }}>
      <div style={{ width: 440, background: "#14111f", border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, padding: "32px 32px 28px", boxShadow: "0 40px 100px rgba(0,0,0,.7)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 3 }}>{step === "form" ? "注册账号" : "验证邮箱"}</h2>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.4)" }}>{step === "form" ? "创建你的创作空间" : `验证码已发送至 ${email}`}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,.35)", cursor: "none", display: "flex" }}><X style={{ width: 18, height: 18 }} /></button>
        </div>

        {step === "form" ? (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", marginBottom: 7 }}>邮箱</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  style={{ flex: 1, padding: "11px 14px", borderRadius: 12, fontSize: 14, background: "rgba(255,255,255,.06)", border: `1px solid rgba(255,255,255,.1)`, color: "white", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,138,31,.5)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.1)")} />
                <button onClick={handleSendCode} disabled={sent}
                  style={{ padding: "11px 16px", borderRadius: 12, fontSize: 12.5, fontWeight: 600, background: sent ? "rgba(34,197,94,.15)" : "rgba(255,255,255,.07)", border: `1px solid ${sent ? "rgba(34,197,94,.3)" : "rgba(255,255,255,.1)"}`, color: sent ? "#34d399" : "rgba(255,255,255,.6)", cursor: "none", whiteSpace: "nowrap" }}>
                  {sent ? <><Check style={{ width: 12, height: 12, display: "inline", marginRight: 4 }} />已发送</> : "获取验证码"}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", marginBottom: 7 }}>验证码</label>
              <input value={code} onChange={e => setCode(e.target.value)} placeholder="请输入4位验证码" maxLength={6}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "white", outline: "none", boxSizing: "border-box", letterSpacing: "0.3em" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,138,31,.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.1)")} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", marginBottom: 7 }}>设置密码</label>
              <div style={{ position: "relative" }}>
                <input value={pw} onChange={e => setPw(e.target.value)} type={showPw ? "text" : "password"} placeholder="至少8位，包含字母和数字"
                  style={{ width: "100%", padding: "11px 42px 11px 14px", borderRadius: 12, fontSize: 14, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "white", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,138,31,.5)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.1)")} />
                <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,.35)", cursor: "none", display: "flex" }}>
                  {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 20 }}>
              <button onClick={() => setAgree(!agree)} style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                background: agree ? "#ff8c20" : "transparent",
                border: `1px solid ${agree ? "#ff8c20" : "rgba(255,255,255,.2)"}`, cursor: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {agree && <Check style={{ width: 11, height: 11, color: "black" }} />}
              </button>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.6 }}>
                我已阅读并同意<a href="#" style={{ color: "#ff8c20" }}>《用户协议》</a>和<a href="#" style={{ color: "#ff8c20" }}>《隐私政策》</a>
              </span>
            </div>
            {err && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 12 }}>{err}</p>}
            <button onClick={() => { if (!agree) { setErr("请先同意用户协议"); return; } handleVerify(); }} disabled={!sent}
              style={{ width: "100%", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, background: !agree || !sent ? "rgba(255,138,31,.4)" : "linear-gradient(135deg,#ff8c20,#ff5010)", border: "none", color: "black", cursor: "none" }}>
              注册
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", padding: "24px 0 20px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,138,31,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Check style={{ width: 28, height: 28, color: "#ff8c20" }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8 }}>邮箱验证通过</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.6 }}>账号创建成功！30枚活动星石已到账。<br />正在跳转工作空间…</p>
            </div>
          </>
        )}
        <p style={{ textAlign: "center", fontSize: 12.5, color: "rgba(255,255,255,.38)", marginTop: 16 }}>
          已有账号？<button onClick={onSwitch} style={{ background: "none", border: "none", color: "#ff8c20", cursor: "none", fontSize: 12.5, fontWeight: 600 }}>立即登录</button>
        </p>
      </div>
    </div>
  );
}

// ─── Onboarding Modal ───────────────────────────────────────────────────────────
function OnboardingModal({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const STEPS = [
    { icon: Sparkles, title: "星核耀火是什么？", desc: "AI 视频创作平台，融合剧本解析、分镜规划、批量生图，帮你高效完成视频内容创作。", color: "#ff8c20" },
    { icon: Film, title: "怎么开始创作？", desc: "从剧本导入或剧情解析开始，AI 自动拆解分镜，批量生成视频素材。", color: "#a78bfa" },
    { icon: Users, title: "可以团队协作吗？", desc: "支持多人团队，邀请成员、分配职能、共享项目和资产，协同更高效。", color: "#34d399" },
  ];
  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onDone();
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,.85)", backdropFilter: "blur(16px)" }}>
      <div style={{ width: 480, textAlign: "center" }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center", gap: 8 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 4, borderRadius: 2, background: i === step ? "#ff8c20" : "rgba(255,255,255,.2)", transition: "all .3s" }} />
          ))}
        </div>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: `${STEPS[step].color}22`, border: `1px solid ${STEPS[step].color}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <STEPS[step].icon style={{ width: 36, height: 36, color: STEPS[step].color } as React.CSSProperties} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 12 }}>{STEPS[step].title}</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.7, marginBottom: 36 }}>{STEPS[step].desc}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{ padding: "11px 28px", borderRadius: 12, fontSize: 14, fontWeight: 500, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", cursor: "none" }}>
              上一步
            </button>
          )}
          <button onClick={handleNext} style={{ padding: "11px 36px", borderRadius: 12, fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,#ff8c20,#ff5010)", border: "none", color: "black", cursor: "none" }}>
            {step < STEPS.length - 1 ? "下一步" : "开始创作"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Accordion ─────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const FAQS = [
    { q: "注册的30活动星石怎么用？", a: "实名认证完成后自动到账，7天有效，仅限指定体验模型，优先于付费星石消耗。" },
    { q: "1元等于多少星石？", a: "1元=10付费星石。实际任务价格由模型、规格和参数决定，生成前完整展示。" },
    { q: "参考图为什么影响费用？", a: "参考图需额外图像分析处理，数量和分辨率越高费用越大，提交前明细可见。" },
    { q: "任务失败如何处理？", a: "因技术原因失败时，按实际消耗处理退回，账单逐笔可查。" },
  ];
  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "60px 32px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "white", textAlign: "center", marginBottom: 32 }}>常见问题</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FAQS.map((f, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", background: "none", border: "none", cursor: "none", textAlign: "left"
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.85)" }}>{f.q}</span>
              <ChevronRight style={{ width: 16, height: 16, color: "rgba(255,255,255,.35)", transform: open === i ? "rotate(90deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
            </button>
            {open === i && (
              <div style={{ padding: "0 20px 16px" }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.7 }}>{f.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, selected, onSelect }: { plan: typeof PLANS_PERSONAL[number]; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} style={{
      padding: "20px 18px", borderRadius: 16, textAlign: "left", cursor: "none",
      background: selected ? "rgba(255,138,31,.08)" : "rgba(255,255,255,.04)",
      border: `1px solid ${selected ? "rgba(255,138,31,.4)" : "rgba(255,255,255,.08)"}`,
      transition: "all .2s", width: "100%", display: "block",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 2 }}>{plan.name}</div>
          {plan.tag && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: plan.tag === "主推" ? "rgba(255,138,31,.2)" : "rgba(99,102,241,.2)", color: plan.tag === "主推" ? "#ff8c20" : "#818cf8", border: `1px solid ${plan.tag === "主推" ? "rgba(255,138,31,.3)" : "rgba(99,102,241,.3)"}` }}>
              {plan.tag}
            </span>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          {plan.price > 0 ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#ff8c20" }}>¥{plan.price}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>/ {plan.period}</div>
            </>
          ) : plan.price === 0 ? (
            <div style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>免费</div>
          ) : (
            <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>商务定价</div>
          )}
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#ff8c20", marginBottom: 12 }}>{plan.stars.toLocaleString()} 星石 / {plan.members}人 / {plan.concurrent}并发</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {plan.perks.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Check style={{ width: 12, height: 12, color: "#22c55e", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{p}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

// ─── Main Landing Page ──────────────────────────────────────────────────────────
export function LandingPage({ navigate }: Nav) {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(3); // 星轨小队
  const [planTab, setPlanTab] = useState<"personal" | "team">("personal");

  const handleLogin = () => { setShowLogin(false); setShowOnboarding(true); };

  const BANNER = { title: "Seedance 2.0 Fast", sub: "最高30秒 · 50个参考素材支持", label: "模型接入", color1: "#ea6020", color2: "#b45309" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0912", overflow: "auto" }}>
      {/* ─── Nav ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(10,9,18,.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#ff8c20,#ff5010)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles style={{ width: 16, height: 16, color: "black" }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>星核耀火</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowLogin(true)} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.7)", cursor: "none" }}>登录</button>
          <button onClick={() => setShowRegister(true)} className="btn-primary" style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", color: "black", cursor: "none" }}>立即注册</button>
        </div>
      </nav>

      {/* ─── Hero ── */}
      <AuroraCanvas style={{ paddingTop: 64, minHeight: "100vh" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px 60px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 100, background: "rgba(255,138,31,.1)", border: "1px solid rgba(255,138,31,.25)", marginBottom: 24 }}>
              <Star style={{ width: 12, height: 12, color: "#ff8c20" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#ff8c20" }}>注册即送30枚活动星石</span>
            </div>
            <h1 style={{ fontSize: 48, fontWeight: 800, color: "white", lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.02em" }}>
              AI 视频创作<br />
              <span style={{ background: "linear-gradient(135deg,#ff8c20,#ffad4a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>从剧本到成片</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.5)", lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
              剧本智能解析、AI分镜规划、批量视频生成，一站式完成你的影视创作。接入 Seedance 2.0，效率提升 10 倍。
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowRegister(true)} className="btn-primary" style={{ padding: "13px 28px", borderRadius: 14, fontSize: 15, fontWeight: 700, border: "none", color: "black", cursor: "none", display: "flex", alignItems: "center", gap: 8 }}>
                <Zap style={{ width: 16, height: 16 }} />
                免费开始
              </button>
              <button onClick={() => {}} style={{ padding: "13px 28px", borderRadius: 14, fontSize: 15, fontWeight: 500, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.7)", cursor: "none", display: "flex", alignItems: "center", gap: 8 }}>
                <Play style={{ width: 16, height: 16 }} />
                观看演示
              </button>
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 32 }}>
              {[["10x", "创作效率"], ["500+", "活跃创作者"], ["50+", "参考素材"]].map((stat) => {
                const v = stat[0];
                const l = stat[1];
                return (
                  <div key={l}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>{v}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{l}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hero Right: Mini feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { icon: BookOpen, label: "剧情解析",    sub: "AI 提取场景与角色",       color: "#ff8c20" },
              { icon: Layers,   label: "分镜规划",    sub: "自动拆解镜头脚本",       color: "#a78bfa" },
              { icon: Film,     label: "批量生图",    sub: "Seedance 2.0 支持",     color: "#06b6d4" },
              { icon: Users,    label: "团队协作",    sub: "多人共享项目资产",       color: "#34d399" },
            ].map(f => (
              <div key={f.label} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 20, backdropFilter: "blur(10px)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${f.color}22`, border: `1px solid ${f.color}44`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <f.icon style={{ width: 20, height: 20, color: f.color }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{f.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Feature Banner ── */}
        <div style={{ maxWidth: 720, margin: "0 auto 60px", padding: "0 32px" }}>
          <div style={{ borderRadius: 20, overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,.08)", cursor: "pointer" }}
            onClick={() => setShowRegister(true)}>
            <div style={{ height: 180, background: `radial-gradient(ellipse at 20% 50%, ${BANNER.color1}55, ${BANNER.color2}33 60%, #0a0508 100%)`, display: "flex", alignItems: "center", padding: "0 40px" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, background: `${BANNER.color1}40`, border: `1px solid ${BANNER.color1}60`, color: "white", display: "inline-block", marginBottom: 12 }}>{BANNER.label}</span>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8 }}>{BANNER.title}</h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)" }}>{BANNER.sub}</p>
              </div>
              <div style={{ width: 120, height: 120, borderRadius: "50%", background: `${BANNER.color1}33`, filter: "blur(40px)" }} />
            </div>
          </div>
        </div>

        {/* ─── Features ── */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 80px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "white", textAlign: "center", marginBottom: 48 }}>全链路 AI 创作平台</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { icon: BookOpen, title: "剧情智能解析", desc: "上传视频或剧本，AI 自动提取场景、角色、情绪曲线，生成结构化剧情分析报告。", color: "#ff8c20", accent: "rgba(255,138,32,.1)" },
              { icon: Layers,   title: "AI 分镜规划", desc: "基于剧情分析，自动拆解分镜脚本，包含镜头类型、景别、运镜方式和时长预估。", color: "#a78bfa", accent: "rgba(167,139,250,.1)" },
              { icon: Film,     title: "批量视频生成", desc: "接入 Seedance 2.0，支持参考图、角色一致性控制，一次提交多个分镜任务。", color: "#06b6d4", accent: "rgba(6,182,212,.1)" },
              { icon: Shield,   title: "费用透明预览", desc: "生成前完整展示星石消耗明细，无隐藏费用，支持充值和团队钱包管理。", color: "#22c55e", accent: "rgba(34,197,94,.1)" },
              { icon: Users,    title: "团队协作空间", desc: "多人项目共享、成员角色管理、权限控制和操作日志，协同创作更高效。", color: "#f59e0b", accent: "rgba(245,158,11,.1)" },
              { icon: Star,     title: "资产库管理",  desc: "统一管理参考图、角色素材、分镜资产，支持版本管理和标签分类。", color: "#ec4899", accent: "rgba(236,72,153,.1)" },
            ].map(f => (
              <div key={f.title} style={{ background: f.accent, border: `1px solid ${f.color}22`, borderRadius: 18, padding: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${f.color}22`, border: `1px solid ${f.color}44`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <f.icon style={{ width: 22, height: 22, color: f.color }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Pricing ── */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px 80px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "white", textAlign: "center", marginBottom: 12 }}>选择适合你的方案</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", textAlign: "center", marginBottom: 32 }}>所有方案均支持随时升级，团队版可按需扩展席位</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 24, justifyContent: "center" }}>
            {(["personal", "team"] as const).map((k) => {
              const labelMap = { personal: "个人版", team: "团队版" };
              return (
                <button key={k} onClick={() => setPlanTab(k)} style={{
                  padding: "8px 24px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "none",
                  background: planTab === k ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.04)",
                  border: `1px solid ${planTab === k ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.06)"}`,
                  color: planTab === k ? "white" : "rgba(255,255,255,.4)",
                }}>{labelMap[k]}</button>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {(planTab === "personal" ? PLANS_PERSONAL : PLANS_TEAM).map((p, i) => (
              <PlanCard key={i} plan={p} selected={selectedPlan === i} onSelect={() => setSelectedPlan(i)} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button onClick={() => setShowRegister(true)} className="btn-primary" style={{ padding: "12px 36px", borderRadius: 14, fontSize: 14, fontWeight: 700, border: "none", color: "black", cursor: "none" }}>
              立即开通 · {planTab === "personal" ? PLANS_PERSONAL[selectedPlan].name : PLANS_TEAM[selectedPlan].name}
            </button>
          </div>
        </section>

        <FAQSection />

        {/* ─── CTA ── */}
        <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 32px 100px", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "white", marginBottom: 12 }}>开始你的创作之旅</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", marginBottom: 28 }}>注册即送 30 枚活动星石，无门槛体验核心功能</p>
          <button onClick={() => setShowRegister(true)} className="btn-primary" style={{ padding: "14px 40px", borderRadius: 16, fontSize: 15, fontWeight: 700, border: "none", color: "black", cursor: "none" }}>
            免费注册
          </button>
        </section>

        {/* ─── Footer ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#ff8c20,#ff5010)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles style={{ width: 12, height: 12, color: "black" }} />
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>星核耀火 · 2026</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["用户协议", "隐私政策", "联系我们"].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,.3)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </footer>
      </AuroraCanvas>

      {/* ─── Modals ── */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSwitch={() => { setShowLogin(false); setShowRegister(true); }} onLogin={handleLogin} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onSwitch={() => { setShowRegister(false); setShowLogin(true); }} />}
      {showOnboarding && <OnboardingModal onDone={() => { setShowOnboarding(false); navigate("workspace"); }} />}
    </div>
  );
}

export default LandingPage;

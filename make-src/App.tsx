import { useState, useEffect, useRef, useCallback } from "react";
import { PlotAnalysisPage } from "./PlotAnalysisPage";
import { StoryboardPage } from "./StoryboardPage";
import { CanvasPage } from "./CanvasPage";
import { LandingPage, RegisterPage, VerifyPage, OnboardingPage } from "./LandingSection";
import {
  Flame, X, ChevronRight, ChevronDown, ChevronUp,
  Eye, EyeOff, RefreshCw, Shield, Lock, Clock, Check,
  Film, Mic2, ImageIcon, Search, PenLine, Layers, Sparkles,
  Plus, AlertTriangle, CheckCircle, Loader2,
  CreditCard, Users, User, Headphones, HelpCircle,
  Bell, Upload, FileText, Package, MapPin, Star,
  Download, MoreHorizontal, Play, Scissors, Wand2, RotateCcw,
  Home, Zap, ChevronLeft, Maximize2,
  MousePointer, Move, GitBranch, PlusCircle, Type,
  Trash2, ArrowUp, ArrowDown, Undo2, Redo2,
  Wrench, CalendarClock, AlertOctagon,
  MessageSquare, BookOpen
} from "lucide-react";
import { Input } from "./components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────
type PageId =
  | "landing" | "register" | "verify" | "onboarding" | "upgrade"
  | "workspace" | "projects" | "new-project" | "ai-chapter"
  | "assets" | "storyboard" | "cost-confirm"
  | "batch" | "result" | "delivery" | "billing"
  | "canvas" | "user-center"
  | "plot-analysis"
  | "team" | "team-assets";
interface Nav { navigate: (p: PageId) => void; }

// ─── Mock Data ────────────────────────────────────────────────────────────────
const USER = {
  name: "赵雅薇", avatar: "赵", team: "星耀漫剧工作室",
  plan: "星轨小队", planDaysLeft: 21,
  concurrent: { used: 6, total: 8 }, queue: { used: 47, total: 1000 },
  // 个人钱包
  paidStars: 2486.0, activeStars: 59.0,
  activeStarsExpiry: "12天后（29颗即将过期）",
  // 团队钱包（独立，不与个人串账）
  teamPaidStars: 8250.0, teamActiveStars: 120.0,
  // 当前工作空间：personal | team
  currentSpace: "team" as "personal" | "team",
};
const STUDIO_MEMBERS = [
  { avatar: "赵", name: "赵雅薇", role: "创始人",   online: true  },
  { avatar: "李", name: "李明浩", role: "主创编剧",  online: true  },
  { avatar: "陈", name: "陈思雨", role: "视觉导演",  online: true  },
  { avatar: "王", name: "王浩然", role: "AI调度师",  online: false },
  { avatar: "张", name: "张晓琳", role: "剪辑后期",  online: false },
];
const PLOT_ANALYSES = [
  { id: "PA-001", title: "《镜像》第01集剧情解析", status: "done",    createdAt: "2026-08-20", duration: "23:41", scenes: 18, characters: 4 },
  { id: "PA-002", title: "《回声》试播片段分析",   status: "done",    createdAt: "2026-08-18", duration: "12:08", scenes: 9,  characters: 3 },
  { id: "PA-003", title: "《星轨》第02集解析",     status: "running", createdAt: "2026-08-22", duration: "25:30", scenes: 0,  characters: 0 },
];
const PROJECT = {
  name: "《镜像》", id: "PRJ-20260821-014", chapter: "第03集《回声》",
  storyboards: { total: 20, done: 12, running: 3, queued: 4, failed: 1 },
};
const TASK = {
  id: "TASK-20260821-1048", model: "Seedance 2.0 Fast",
  spec: "480p · 5秒 · 9:16 · 无声音 · 1张参考图",
  estimatedStars: 18.55, estimatedCNY: 1.86, priceVersion: "2026-08-21 10:00",
};
const STORYBOARDS = [
  { id: "SB-001", desc: "镜头1：主角站在空旷的走廊，背光，缓慢转身", status: "done",    stars: 18.55 },
  { id: "SB-002", desc: "镜头2：特写，眼神迷离，光线从窗缝透入",     status: "done",    stars: 22.10 },
  { id: "SB-003", desc: "镜头3：两人对话，景深虚化，低调光效",       status: "done",    stars: 19.80 },
  { id: "SB-004", desc: "镜头4：俯拍城市街道，雨后反光",             status: "running", stars: 18.55 },
  { id: "SB-005", desc: "镜头5：手持镜头，快速穿越人群",             status: "running", stars: 24.00 },
  { id: "SB-006", desc: "镜头6：主角独坐，窗外车流",                 status: "running", stars: 18.55 },
  { id: "SB-007", desc: "镜头7：两人分离，背影渐远",                 status: "queued",  stars: 18.55 },
  { id: "SB-008", desc: "镜头8：闪回，温暖色调，笑声",               status: "queued",  stars: 20.30 },
  { id: "SB-009", desc: "镜头9：回到当下，对比冷色调",               status: "queued",  stars: 18.55 },
  { id: "SB-010", desc: "镜头10：结尾长镜头，主角走向远处",           status: "queued",  stars: 22.00 },
  { id: "SB-011", desc: "镜头11：叠化转场，时间跳跃",                status: "failed",  stars: 0     },
];

// ─── Global Styles ────────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255,138,31,0.4); border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255,138,31,0.65); }

      @keyframes glow-pulse {
        0%,100% { opacity:.4; transform:scale(1); }
        50%      { opacity:.65; transform:scale(1.08); }
      }
      @keyframes glow-slow {
        0%,100% { opacity:.2; transform:scale(1) rotate(0deg); }
        50%      { opacity:.38; transform:scale(1.12) rotate(3deg); }
      }
      @keyframes ring-cw  { from{transform:rotate(0)}   to{transform:rotate(360deg)}  }
      @keyframes ring-ccw { from{transform:rotate(0)}   to{transform:rotate(-360deg)} }
      @keyframes shimmer  {
        0%   { background-position:-200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes ticker {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes fade-up {
        from { opacity:0; transform:translateY(20px); }
        to   { opacity:1; transform:translateY(0);    }
      }
      @keyframes beam-pulse {
        0%,100% { opacity:.3; }
        50%      { opacity:.55; }
      }
      @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes typing-dot {
        0%,60%,100% { opacity:.2; transform:scale(1); }
        30% { opacity:1; transform:scale(1.3); }
      }
      @keyframes slide-in-right {
        from { transform: translateX(100%); opacity: 0; }
        to   { transform: translateX(0);    opacity: 1; }
      }
      .fade-up-2 { animation: fade-up .55s .2s ease-out both; }
      .fade-up-3 { animation: fade-up .55s .3s ease-out both; }
      .fade-up-4 { animation: fade-up .55s .4s ease-out both; }

      .gradient-text {
        background: linear-gradient(120deg,#FF8A1F 0%,#FFAD4A 40%,#FF8A1F 80%);
        background-size:200% auto;
        -webkit-background-clip:text; background-clip:text;
        -webkit-text-fill-color:transparent;
        animation:shimmer 4s linear infinite;
      }
      .glass-btn {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        transition: background .18s, border-color .18s, transform .15s;
      }
      .glass-btn:hover {
        background: rgba(255,255,255,0.1);
        border-color: rgba(255,255,255,0.18);
        transform: translateY(-1px);
      }
      .orange-btn {
        background: #FF8A1F;
        transition: background .18s, opacity .15s, transform .15s;
      }
      .orange-btn:hover {
        background: #FF9D42;
        transform: translateY(-1px);
        opacity: 0.95;
      }
      .orange-btn:disabled {
        opacity: 0.4;
        transform: none;
      }
      .glass-btn {
        background: linear-gradient(160deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%);
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.16) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.22),
          inset 0 -1px 0 rgba(0,0,0,0.06),
          0 2px 10px rgba(0,0,0,0.18);
        transition: all .2s cubic-bezier(.4,0,.2,1);
      }
      .glass-btn:hover {
        background: linear-gradient(160deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.09) 100%);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.32),
          inset 0 -1px 0 rgba(0,0,0,0.06),
          0 6px 20px rgba(0,0,0,0.22);
        transform: translateY(-1px);
      }
      .glass-btn:active {
        transform: translateY(0px);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.16),
          0 1px 4px rgba(0,0,0,0.18);
      }
      .beam  { animation: beam-pulse 3s ease-in-out infinite; }
      .beam2 { animation: beam-pulse 4s .8s ease-in-out infinite; }
      .beam3 { animation: beam-pulse 3.5s .4s ease-in-out infinite; }
      .beam4 { animation: beam-pulse 4.5s 1.2s ease-in-out infinite; }
      .glow-a { animation: glow-pulse 4s ease-in-out infinite; }
      .glow-b { animation: glow-slow  6s ease-in-out infinite; }
      .ring-cw  { animation: ring-cw  14s linear infinite; }
      .ring-ccw { animation: ring-ccw 20s linear infinite; }
      .ticker   { animation: ticker 22s linear infinite; }
      .ticker:hover { animation-play-state: paused; }
      .fade-up   { animation: fade-up .55s ease-out both; }
      .fade-up-1 { animation: fade-up .55s .1s ease-out both; }
      .tilt-card { transform-style: preserve-3d; will-change: transform; transition: transform .12s ease-out; }
      .ai-drawer { animation: slide-in-right 0.2s cubic-bezier(0.16,1,0.3,1) both; }
    `}</style>
  );
}

// ─── 3-D Tilt Card ────────────────────────────────────────────────────────────
function TiltCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width  - .5;
    const ny = (e.clientY - r.top)  / r.height - .5;
    ref.current.style.transform = `perspective(900px) rotateY(${nx * 14}deg) rotateX(${-ny * 10}deg) scale(1.025)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "perspective(900px) rotateY(0) rotateX(0) scale(1)"; };
  return (
    <div ref={ref} className={`tilt-card ${className}`} style={style} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────
const SIDEBAR_NAV = [
  { id: "workspace"     as PageId | null, label: "创作",   icon: Home       },
  { id: "plot-analysis" as PageId | null, label: "解析",   icon: Film       },
  { id: "canvas"        as PageId | null, label: "画布",   icon: PenLine    },
  { id: "team-assets"   as PageId | null, label: "资产",   icon: Package    },
  { id: "billing"       as PageId | null, label: "账单",   icon: CreditCard },
  { id: "team"          as PageId | null, label: "团队",   icon: Users      },
  { id: null,                             label: "工具",   icon: Wrench     },
];

function QRModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#13151C", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 18, padding: "28px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, boxShadow: "0 32px 80px rgba(0,0,0,0.7)", minWidth: 240 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#F4F5F7", marginBottom: 4 }}>专属客服</div>
          <div style={{ fontSize: 12, color: "#6F7480" }}>扫码添加微信，7×12小时在线</div>
        </div>
        {/* QR Code SVG */}
        <svg width="148" height="148" viewBox="0 0 148 148" style={{ display: "block", borderRadius: 10 }}>
          <rect width="148" height="148" fill="#ffffff" rx="8"/>
          {/* TL finder */}
          <rect x="10" y="10" width="42" height="42" fill="#111" rx="4"/>
          <rect x="16" y="16" width="30" height="30" fill="#fff" rx="2"/>
          <rect x="22" y="22" width="18" height="18" fill="#111" rx="1"/>
          {/* TR finder */}
          <rect x="96" y="10" width="42" height="42" fill="#111" rx="4"/>
          <rect x="102" y="16" width="30" height="30" fill="#fff" rx="2"/>
          <rect x="108" y="22" width="18" height="18" fill="#111" rx="1"/>
          {/* BL finder */}
          <rect x="10" y="96" width="42" height="42" fill="#111" rx="4"/>
          <rect x="16" y="102" width="30" height="30" fill="#fff" rx="2"/>
          <rect x="22" y="108" width="18" height="18" fill="#111" rx="1"/>
          {/* Data modules */}
          {[
            [60,10],[66,10],[72,10],[78,10],[84,10],[90,10],
            [60,16],[72,16],[84,16],
            [60,22],[66,22],[78,22],[90,22],
            [60,28],[72,28],[84,28],
            [60,34],[66,34],[72,34],[78,34],[84,34],[90,34],
            [10,60],[16,60],[22,60],[28,60],[34,60],[40,60],[46,60],[52,60],
            [10,66],[22,66],[34,66],[52,66],
            [10,72],[28,72],[46,72],[52,72],
            [10,78],[16,78],[22,78],[40,78],[52,78],
            [10,84],[34,84],[40,84],[52,84],
            [10,90],[16,90],[22,90],[28,90],[34,90],[40,90],[46,90],[52,90],
            [60,60],[72,60],[78,60],[90,60],[96,60],[102,60],[108,60],[120,60],[132,60],
            [60,66],[72,66],[84,66],[96,66],[108,66],[120,66],[132,66],
            [60,72],[66,72],[78,72],[90,72],[102,72],[114,72],[126,72],[132,72],
            [60,78],[72,78],[84,78],[96,78],[108,78],[120,78],
            [60,84],[66,84],[78,84],[90,84],[96,84],[102,84],[108,84],[114,84],[120,84],[132,84],
            [60,90],[72,90],[84,90],[96,90],[120,90],[132,90],
            [60,96],[66,96],[72,96],[78,96],[90,96],[96,96],[108,96],[120,96],
            [66,102],[78,102],[84,102],[90,102],[96,102],[108,102],[114,102],[132,102],
            [60,108],[66,108],[78,108],[84,108],[102,108],[108,108],[114,108],[120,108],[132,108],
            [60,114],[72,114],[84,114],[90,114],[96,114],[102,114],[114,114],[126,114],[132,114],
            [60,120],[66,120],[78,120],[90,120],[96,120],[108,120],[120,120],
            [66,126],[72,126],[78,126],[84,126],[96,126],[108,126],[114,126],[120,126],[132,126],
            [60,132],[66,132],[84,132],[90,132],[102,132],[114,132],[126,132],[132,132],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="5" height="5" fill="#111" rx="0.5"/>
          ))}
        </svg>
        <div style={{ fontSize: 11, color: "#6F7480", textAlign: "center", lineHeight: 1.6 }}>
          工作日 9:00–21:00<br/>节假日 10:00–18:00
        </div>
        <button onClick={onClose} style={{ padding: "7px 28px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", color: "#A4A8B3", fontSize: 12, cursor: "pointer" }}>
          关闭
        </button>
      </div>
    </div>
  );
}

function AppLayout({ children, currentPage, navigate }: {
  children: React.ReactNode; currentPage: PageId; navigate: (p: PageId) => void;
}) {
  const [serviceOpen, setServiceOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<"task"|"invoice"|"activity"|"error">("task");
  const [helpOpen, setHelpOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"bug"|"suggest"|"other">("bug");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  // ── 工作空间切换 ────────────────────────────────────────────────────────────
  const [currentSpace, setCurrentSpace] = useState<"personal"|"team">(USER.currentSpace);
  const [showSpacePicker, setShowSpacePicker] = useState(false);
  const [pendingNav, setPendingNav] = useState<PageId|null>(null);
  const openSpacePicker = (dest?: PageId) => { setPendingNav(dest ?? null); setShowSpacePicker(true); };
  const confirmSpace = (space: "personal"|"team") => { setCurrentSpace(space); setShowSpacePicker(false); if (pendingNav) { navigate(pendingNav); setPendingNav(null); } };

  /* ── Notification data ── */
  const NOTIFS: Record<"task"|"invoice"|"activity"|"error", { id:string; title:string; body:string; time:string; read:boolean; level?:"info"|"warn"|"error" }[]> = {
    task: [
      { id:"t1", title:"批量生成完成", body:"项目「星际孤途」第1-6集资产已全部生成完毕，共生成 148 张图像。", time:"2分钟前", read:false },
      { id:"t2", title:"脚本解析完成", body:"《隐秘角落》上传文件解析成功，识别到 12 个场景、8 名角色。", time:"15分钟前", read:false },
      { id:"t3", title:"音频合成中", body:"林凯·标准音色正在合成，预计完成时间 3 分钟。", time:"23分钟前", read:true },
      { id:"t4", title:"导出任务完成", body:"分集剧本 EP01-EP06 已打包完成，点击下载。", time:"1小时前", read:true },
    ],
    invoice: [
      { id:"i1", title:"发票申请待审核", body:"您于 2026-08-30 申请的 ¥299.00 增值税普通发票正在审核中，预计 3 个工作日内完成。", time:"2天前", read:false },
      { id:"i2", title:"发票已开具", body:"¥99.00 电子发票已开具，发票号 044031900115，已发送至注册邮箱。", time:"7天前", read:true },
      { id:"i3", title:"发票申请成功", body:"¥599.00 年度套餐发票申请已提交，税号已验证。", time:"14天前", read:true },
    ],
    activity: [
      { id:"a1", title:"限时活动 · 双倍星石", body:"9月1日-9月7日充值享双倍星石奖励，活动剩余 5 天！", time:"刚刚", read:false, level:"info" },
      { id:"a2", title:"新功能上线 · AI改写", body:"提示词编辑器新增 AI 智能改写功能，一键优化生成效果。", time:"3天前", read:false, level:"info" },
      { id:"a3", title:"套餐即将到期", body:"您的星芒个人套餐将于 9月15日 到期，续费可保留所有历史数据。", time:"5天前", read:false, level:"warn" },
      { id:"a4", title:"系统维护通知", body:"2026-09-05 02:00-04:00 进行系统维护，期间服务暂停。", time:"6天前", read:true, level:"info" },
    ],
    error: [
      { id:"e1", title:"生成失败 · 保险箱", body:"资产「保险箱」生成超时，Flux 1.1 Pro 服务异常，已自动重试 3 次。请稍后手动重试。", time:"30分钟前", read:false, level:"error" },
      { id:"e2", title:"上传失败", body:"文件「剧本_最终版v3.docx」上传失败，文件大小超过 50MB 限制。", time:"2小时前", read:false, level:"error" },
      { id:"e3", title:"支付异常", body:"订单 #2026083112 支付结果异常，若已扣款请联系客服处理。", time:"1天前", read:true, level:"warn" },
    ],
  };

  const notifTabCfg: { k:"task"|"invoice"|"activity"|"error"; label:string; icon:string }[] = [
    { k:"task",     label:"任务",   icon:"📋" },
    { k:"invoice",  label:"开票",   icon:"🧾" },
    { k:"activity", label:"活动",   icon:"🎉" },
    { k:"error",    label:"报错",   icon:"⚠️" },
  ];

  const unreadCount = Object.values(NOTIFS).flat().filter(n=>!n.read).length;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#090A0E" }}>
      <GlobalStyles />
      {serviceOpen && <QRModal onClose={() => setServiceOpen(false)} />}
      {/* Notification backdrop close */}
      {notifOpen && <div style={{position:"fixed",inset:0,zIndex:198}} onClick={()=>setNotifOpen(false)}/>}

      {/* ── 工作空间选择弹窗 ── */}
      {showSpacePicker && (
        <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,.72)", backdropFilter: "blur(12px)" }}
          onClick={() => { setShowSpacePicker(false); setPendingNav(null); }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: 480, background: "#13141B", borderRadius: 24, border: "1px solid rgba(255,255,255,.08)",
              boxShadow: "0 32px 80px rgba(0,0,0,.8)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "28px 32px 0", textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FF8A1F", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Flame style={{ width: 18, height: 18, color: "black" }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 6 }}>
                {pendingNav ? "选择归属空间" : "切换工作空间"}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.6 }}>
                {pendingNav
                  ? <>新剧目的生成费用和作品归属<br/>将与所选空间绑定</>
                  : <>切换后，后续生成任务和作品<br/>归属将随之改变</>}
              </div>
            </div>

            {/* Cards */}
            <div style={{ display: "flex", gap: 14, padding: "24px 28px 28px" }}>
              {/* 个人空间 */}
              <button onClick={() => confirmSpace("personal")}
                style={{ flex: 1, padding: "22px 18px", borderRadius: 16, cursor: "pointer", textAlign: "left",
                  border: `2px solid ${currentSpace === "personal" ? "#60a5fa" : "rgba(255,255,255,.08)"}`,
                  background: currentSpace === "personal" ? "rgba(96,165,250,.08)" : "rgba(255,255,255,.03)",
                  transition: "all .15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
                onMouseEnter={e => { if (currentSpace !== "personal") { (e.currentTarget as HTMLElement).style.borderColor = "rgba(96,165,250,.4)"; (e.currentTarget as HTMLElement).style.background = "rgba(96,165,250,.04)"; } }}
                onMouseLeave={e => { if (currentSpace !== "personal") { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.08)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.03)"; } }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(96,165,250,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User style={{ width: 22, height: 22, color: "#60a5fa" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "white", marginBottom: 4 }}>个人空间</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", lineHeight: 1.5 }}>{USER.name}<br/>{USER.paidStars.toLocaleString()} 星石（个人钱包）</div>
                </div>
                {currentSpace === "personal" && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", background: "rgba(96,165,250,.12)", borderRadius: 100, padding: "3px 10px" }}>当前空间</div>
                )}
              </button>

              {/* 团队空间 */}
              <button onClick={() => confirmSpace("team")}
                style={{ flex: 1, padding: "22px 18px", borderRadius: 16, cursor: "pointer", textAlign: "left",
                  border: `2px solid ${currentSpace === "team" ? "#a78bfa" : "rgba(255,255,255,.08)"}`,
                  background: currentSpace === "team" ? "rgba(139,92,246,.08)" : "rgba(255,255,255,.03)",
                  transition: "all .15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
                onMouseEnter={e => { if (currentSpace !== "team") { (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,.4)"; (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,.04)"; } }}
                onMouseLeave={e => { if (currentSpace !== "team") { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.08)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.03)"; } }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(139,92,246,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#a78bfa" }}>
                  {USER.team[0]}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "white", marginBottom: 4 }}>{USER.team}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", lineHeight: 1.5 }}>团队空间<br/>{USER.teamPaidStars.toLocaleString()} 星石（团队钱包）</div>
                </div>
                {currentSpace === "team" && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", background: "rgba(139,92,246,.12)", borderRadius: 100, padding: "3px 10px" }}>当前空间</div>
                )}
              </button>
            </div>

            {/* Footer note */}
            <div style={{ padding: "0 28px 22px", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.2)" }}>
              两个空间的余额独立，互不影响 · 点击外部关闭
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: 68, flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        background: "#0E0F14",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
      }}>

        {/* Logo — click to return home */}
        <button onClick={() => navigate("landing")} title="返回首页"
          style={{ width: "100%", display: "flex", justifyContent: "center", padding: "18px 0 14px",
            background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => { (e.currentTarget.firstElementChild as HTMLElement).style.opacity = "0.8"; }}
          onMouseLeave={e => { (e.currentTarget.firstElementChild as HTMLElement).style.opacity = "1"; }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#FF8A1F", transition: "opacity .15s",
          }}>
            <Flame style={{ width: 15, height: 15, color: "black" }} />
          </div>
        </button>

        {/* ── 空间切换器（点击打开居中弹窗） ── */}
        <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <button
            onClick={() => openSpacePicker()}
            title={currentSpace === "team" ? `团队空间：${USER.team}` : "个人空间"}
            style={{
              width: 40, height: 40, borderRadius: 11, border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
              background: currentSpace === "team" ? "rgba(139,92,246,.15)" : "rgba(96,165,250,.12)",
              transition: "background .15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = currentSpace === "team" ? "rgba(139,92,246,.25)" : "rgba(96,165,250,.22)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = currentSpace === "team" ? "rgba(139,92,246,.15)" : "rgba(96,165,250,.12)"; }}>
            {currentSpace === "team"
              ? <Users style={{ width: 14, height: 14, color: "#a78bfa" }} />
              : <User  style={{ width: 14, height: 14, color: "#60a5fa" }} />}
            <span style={{ fontSize: 8, fontWeight: 700, color: currentSpace === "team" ? "#a78bfa" : "#60a5fa", letterSpacing: "0.02em" }}>
              {currentSpace === "team" ? "团队" : "个人"}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 8 }} />

        {/* Nav */}
        <nav style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "0 8px", overflowY: "auto" }}>
          {SIDEBAR_NAV.map(item => {
            const active = !!(item.id && currentPage === item.id);
            const clickable = !!item.id;
            return (
              <button key={item.label} onClick={() => item.id && navigate(item.id as PageId)}
                title={item.label}
                style={{
                  width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 4, padding: "9px 0", borderRadius: 8,
                  border: "none", cursor: clickable ? "pointer" : "default",
                  transition: "background .15s",
                  background: active ? "rgba(255,138,31,0.10)" : "transparent",
                  position: "relative",
                  opacity: clickable ? 1 : 0.35,
                }}
                onMouseEnter={e => { if (!active && clickable) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = active ? "rgba(255,138,31,0.10)" : "transparent"; }}>

                {/* Active left strip */}
                {active && (
                  <span style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 2, height: 20, background: "#FF8A1F", borderRadius: "0 2px 2px 0",
                  }} />
                )}

                <item.icon style={{
                  width: 17, height: 17,
                  strokeWidth: active ? 2 : 1.5,
                  color: active ? "#FF8A1F" : "rgba(255,255,255,0.28)",
                  transition: "color .15s",
                }} />
                <span style={{
                  fontSize: 10, lineHeight: 1,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#F4F5F7" : "rgba(255,255,255,0.35)",
                  letterSpacing: "0.01em",
                  transition: "color .15s",
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "8px 8px 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>

          {/* Bell / 消息 */}
          <button title="消息通知" onClick={()=>setNotifOpen(v=>!v)}
            style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 0", borderRadius: 8, background: notifOpen?"rgba(255,138,31,0.08)":"none", border: notifOpen?"1px solid rgba(255,138,31,0.2)":"1px solid transparent", cursor: "pointer", transition: "background .15s", position: "relative" }}
            onMouseEnter={e => { if(!notifOpen) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={e => { if(!notifOpen) e.currentTarget.style.background = "none"; }}>
            <div style={{ position: "relative" }}>
              <Bell style={{ width: 15, height: 15, color: notifOpen?"rgba(255,138,31,0.9)":"rgba(255,255,255,0.28)", strokeWidth: 1.5 }} />
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: -3, right: -4, minWidth: 14, height: 14, borderRadius: 7, background: "#EF4444", border: "1.5px solid #0E0F14", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 8, fontWeight:700, color:"white", padding:"0 2px" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, color: notifOpen?"rgba(255,138,31,0.8)":"rgba(255,255,255,0.25)", lineHeight: 1 }}>消息</span>
          </button>

          {/* Notification panel */}
          {notifOpen && (
            <div style={{position:"fixed",left:72,bottom:12,zIndex:199,width:360,maxHeight:520,background:"#111218",border:"1px solid rgba(255,255,255,.1)",borderRadius:18,boxShadow:"0 24px 80px rgba(0,0,0,.8)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
              {/* Header */}
              <div style={{display:"flex",alignItems:"center",padding:"14px 16px 0",gap:8,flexShrink:0}}>
                <span style={{fontSize:14,fontWeight:800,color:"white",flex:1}}>消息通知</span>
                {unreadCount>0&&<span style={{fontSize:11,color:"rgba(255,255,255,.35)",fontWeight:500}}>{unreadCount} 条未读</span>}
                <button onClick={()=>setNotifOpen(false)} style={{width:24,height:24,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.4)",cursor:"pointer"}}>
                  <X style={{width:11,height:11}}/>
                </button>
              </div>

              {/* Tabs */}
              <div style={{display:"flex",gap:4,padding:"10px 12px 0",flexShrink:0}}>
                {notifTabCfg.map(t=>{
                  const cnt = NOTIFS[t.k].filter(n=>!n.read).length;
                  return (
                    <button key={t.k} onClick={()=>setNotifTab(t.k)}
                      style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:"6px 4px",borderRadius:9,fontSize:11,fontWeight:notifTab===t.k?700:400,cursor:"pointer",
                        background:notifTab===t.k?"rgba(255,138,31,.12)":"rgba(255,255,255,.04)",
                        border:`1px solid ${notifTab===t.k?"rgba(255,138,31,.3)":"rgba(255,255,255,.07)"}`,
                        color:notifTab===t.k?"rgba(255,138,31,.95)":"rgba(255,255,255,.4)"}}>
                      <span style={{fontSize:12}}>{t.icon}</span>
                      {t.label}
                      {cnt>0&&<span style={{minWidth:14,height:14,borderRadius:7,background:"#EF4444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"white",padding:"0 2px"}}>{cnt}</span>}
                    </button>
                  );
                })}
              </div>

              {/* List */}
              <div style={{flex:1,overflowY:"auto",padding:"8px 10px 10px",display:"flex",flexDirection:"column",gap:5,marginTop:4}}>
                {NOTIFS[notifTab].length===0
                  ? <div style={{textAlign:"center",padding:"32px 0",fontSize:13,color:"rgba(255,255,255,.2)"}}>暂无消息</div>
                  : NOTIFS[notifTab].map(n=>{
                    const accentColor =
                      n.level==="error" ? "#EF4444" :
                      n.level==="warn"  ? "#F59E0B" :
                      notifTab==="invoice" ? "#60A5FA" :
                      notifTab==="activity" ? "rgba(255,138,31,.9)" :
                      "rgba(255,255,255,.55)";
                    return (
                      <div key={n.id} style={{padding:"10px 12px",borderRadius:11,
                        background:n.read?"rgba(255,255,255,.025)":"rgba(255,255,255,.055)",
                        border:`1px solid ${n.read?"rgba(255,255,255,.06)":"rgba(255,255,255,.1)"}`,
                        position:"relative",cursor:"pointer",transition:"background .12s"}}
                        onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,.075)")}
                        onMouseLeave={e=>(e.currentTarget.style.background=n.read?"rgba(255,255,255,.025)":"rgba(255,255,255,.055)")}>
                        {!n.read&&<span style={{position:"absolute",top:10,right:10,width:6,height:6,borderRadius:"50%",background:accentColor}}/>}
                        <div style={{fontSize:12.5,fontWeight:n.read?500:700,color:n.read?"rgba(255,255,255,.6)":"rgba(255,255,255,.92)",marginBottom:4,paddingRight:12}}>{n.title}</div>
                        <div style={{fontSize:11.5,color:"rgba(255,255,255,.38)",lineHeight:1.65}}>{n.body}</div>
                        <div style={{fontSize:10.5,color:"rgba(255,255,255,.22)",marginTop:5}}>{n.time}</div>
                      </div>
                    );
                  })
                }
              </div>

              {/* Footer */}
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
                <button style={{flex:1,padding:"7px 0",borderRadius:9,fontSize:12,cursor:"pointer",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",color:"rgba(255,255,255,.45)"}}>
                  全部标记已读
                </button>
                <button style={{flex:1,padding:"7px 0",borderRadius:9,fontSize:12,cursor:"pointer",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",color:"rgba(255,255,255,.45)"}}>
                  查看全部消息
                </button>
              </div>
            </div>
          )}

          {/* Help */}
          <button title="帮助中心" onClick={()=>{ setHelpOpen(v=>!v); setNotifOpen(false); }}
            style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 0", borderRadius: 8, background: helpOpen?"rgba(255,255,255,0.07)":"none", border: helpOpen?"1px solid rgba(255,255,255,0.1)":"1px solid transparent", cursor: "pointer", transition: "background .15s" }}
            onMouseEnter={e => { if(!helpOpen) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={e => { if(!helpOpen) e.currentTarget.style.background = helpOpen?"rgba(255,255,255,0.07)":"none"; }}>
            <HelpCircle style={{ width: 15, height: 15, color: helpOpen?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.2)", strokeWidth: 1.5 }} />
            <span style={{ fontSize: 10, color: helpOpen?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.22)", lineHeight: 1 }}>帮助</span>
          </button>

          {/* Help popup */}
          {helpOpen && <>
            <div style={{position:"fixed",inset:0,zIndex:198}} onClick={()=>setHelpOpen(false)}/>
            <div style={{position:"fixed",left:72,bottom:60,zIndex:199,width:280,background:"#111218",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,boxShadow:"0 20px 60px rgba(0,0,0,.8)",overflow:"hidden"}}>
              {/* Header */}
              <div style={{padding:"14px 16px 12px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                <div style={{fontSize:13,fontWeight:700,color:"white",marginBottom:2}}>帮助中心</div>
                <div style={{fontSize:11.5,color:"rgba(255,255,255,.3)"}}>遇到问题？我们来帮你</div>
              </div>

              {/* Contact customer service */}
              <button onClick={()=>{ setHelpOpen(false); setServiceOpen(true); }}
                style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left",transition:"background .12s"}}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,.04)")}
                onMouseLeave={e=>(e.currentTarget.style.background="none")}>
                <div style={{width:36,height:36,borderRadius:10,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Headphones style={{width:16,height:16,color:"#22C55E"}}/>
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.85)"}}>联系客服</div>
                  <div style={{fontSize:11.5,color:"rgba(255,255,255,.35)",marginTop:1}}>扫码添加专属客服微信</div>
                </div>
                <ChevronRight style={{width:14,height:14,color:"rgba(255,255,255,.2)",marginLeft:"auto"}}/>
              </button>

              <div style={{height:1,background:"rgba(255,255,255,.05)",margin:"0 14px"}}/>

              {/* Submit feedback */}
              <button onClick={()=>{ setHelpOpen(false); setFeedbackOpen(true); setFeedbackSent(false); setFeedbackText(""); }}
                style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left",transition:"background .12s"}}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,.04)")}
                onMouseLeave={e=>(e.currentTarget.style.background="none")}>
                <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,138,31,.1)",border:"1px solid rgba(255,138,31,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <MessageSquare style={{width:16,height:16,color:"rgba(255,138,31,.9)"}}/>
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.85)"}}>提交问题 · 申请反馈</div>
                  <div style={{fontSize:11.5,color:"rgba(255,255,255,.35)",marginTop:1}}>报告 Bug 或提交功能建议</div>
                </div>
                <ChevronRight style={{width:14,height:14,color:"rgba(255,255,255,.2)",marginLeft:"auto"}}/>
              </button>

              {/* Docs link row */}
              <div style={{display:"flex",borderTop:"1px solid rgba(255,255,255,.06)"}}>
                <button style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"10px 0",background:"none",border:"none",cursor:"pointer",fontSize:11.5,color:"rgba(255,255,255,.3)",transition:"color .12s"}}
                  onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,.6)")}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,.3)")}>
                  <BookOpen style={{width:12,height:12}}/>使用文档
                </button>
                <div style={{width:1,background:"rgba(255,255,255,.06)"}}/>
                <button style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"10px 0",background:"none",border:"none",cursor:"pointer",fontSize:11.5,color:"rgba(255,255,255,.3)",transition:"color .12s"}}
                  onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,.6)")}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,.3)")}>
                  <FileText style={{width:12,height:12}}/>更新日志
                </button>
              </div>
            </div>
          </>}

          {/* Feedback modal */}
          {feedbackOpen && (
            <div style={{position:"fixed",inset:0,zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.75)",backdropFilter:"blur(16px)"}}
              onClick={e=>{if(e.target===e.currentTarget)setFeedbackOpen(false);}}>
              <div style={{width:"min(480px,94vw)",background:"#111218",border:"1px solid rgba(255,255,255,.1)",borderRadius:20,overflow:"hidden",boxShadow:"0 30px 80px rgba(0,0,0,.85)"}}>
                {/* Header */}
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"18px 20px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
                  <MessageSquare style={{width:16,height:16,color:"rgba(255,138,31,.8)"}}/>
                  <span style={{fontSize:14,fontWeight:700,color:"white",flex:1}}>提交问题 · 申请反馈</span>
                  <button onClick={()=>setFeedbackOpen(false)} style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.45)",cursor:"pointer"}}>
                    <X style={{width:13,height:13}}/>
                  </button>
                </div>

                {feedbackSent
                  ? <div style={{padding:"40px 24px",textAlign:"center"}}>
                      <div style={{fontSize:36,marginBottom:12}}>✅</div>
                      <div style={{fontSize:15,fontWeight:700,color:"white",marginBottom:6}}>反馈已提交</div>
                      <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:20}}>感谢你的反馈，我们会尽快跟进处理！</div>
                      <button onClick={()=>setFeedbackOpen(false)} style={{padding:"8px 28px",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.6)"}}>
                        关闭
                      </button>
                    </div>
                  : <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:14}}>
                      {/* Type selector */}
                      <div>
                        <div style={{fontSize:11.5,color:"rgba(255,255,255,.4)",fontWeight:600,marginBottom:8}}>反馈类型</div>
                        <div style={{display:"flex",gap:6}}>
                          {([["bug","🐛","报告 Bug"],["suggest","💡","功能建议"],["other","💬","其他问题"]] as const).map(([k,emoji,label])=>(
                            <button key={k} onClick={()=>setFeedbackType(k)}
                              style={{flex:1,padding:"7px 4px",borderRadius:9,fontSize:12,cursor:"pointer",fontWeight:feedbackType===k?700:400,
                                background:feedbackType===k?"rgba(255,138,31,.1)":"rgba(255,255,255,.04)",
                                border:`1px solid ${feedbackType===k?"rgba(255,138,31,.3)":"rgba(255,255,255,.08)"}`,
                                color:feedbackType===k?"rgba(255,138,31,.95)":"rgba(255,255,255,.4)"}}>
                              {emoji} {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Textarea */}
                      <div>
                        <div style={{fontSize:11.5,color:"rgba(255,255,255,.4)",fontWeight:600,marginBottom:8}}>
                          {feedbackType==="bug"?"问题描述（请尽量详细）":feedbackType==="suggest"?"建议内容":"反馈内容"}
                        </div>
                        <textarea value={feedbackText} onChange={e=>setFeedbackText(e.target.value)}
                          autoFocus
                          placeholder={feedbackType==="bug"?"请描述问题出现的步骤、页面位置及现象…":feedbackType==="suggest"?"请描述你希望实现的功能或改进方向…":"请填写你的问题或意见…"}
                          style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:11,padding:"12px 14px",fontSize:13,color:"rgba(255,255,255,.85)",outline:"none",resize:"none",lineHeight:1.75,fontFamily:"inherit",boxSizing:"border-box",height:130,display:"block"}}/>
                        <div style={{textAlign:"right",fontSize:11,color:"rgba(255,255,255,.2)",marginTop:4}}>{feedbackText.length} / 500</div>
                      </div>

                      {/* Contact */}
                      <div>
                        <div style={{fontSize:11.5,color:"rgba(255,255,255,.4)",fontWeight:600,marginBottom:8}}>联系方式（选填）</div>
                        <input placeholder="邮箱或手机号，方便我们回复你"
                          style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:10,padding:"9px 13px",fontSize:13,color:"rgba(255,255,255,.8)",outline:"none",boxSizing:"border-box"}}/>
                      </div>

                      {/* Actions */}
                      <div style={{display:"flex",gap:8,paddingTop:2}}>
                        <button onClick={()=>setFeedbackOpen(false)}
                          style={{flex:1,padding:"10px 0",borderRadius:11,fontSize:13,cursor:"pointer",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",color:"rgba(255,255,255,.45)"}}>
                          取消
                        </button>
                        <button onClick={()=>{ if(feedbackText.trim()) setFeedbackSent(true); }}
                          disabled={!feedbackText.trim()}
                          style={{flex:2,padding:"10px 0",borderRadius:11,fontSize:13,fontWeight:700,cursor:feedbackText.trim()?"pointer":"not-allowed",
                            background:feedbackText.trim()?"linear-gradient(135deg,#FF8A1F,#FF5A1F)":"rgba(255,255,255,.06)",
                            border:"none",color:feedbackText.trim()?"black":"rgba(255,255,255,.2)"}}>
                          提交反馈
                        </button>
                      </div>
                    </div>
                }
              </div>
            </div>
          )}

          {/* User avatar */}
          <button onClick={() => navigate("user-center")} title={USER.name}
            style={{ width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,138,31,0.12)", color: "#FF8A1F", fontSize: 11, fontWeight: 700, marginTop: 4, transition: "background .15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,138,31,0.22)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,138,31,0.12)")}>
            {USER.avatar}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
        {/* ── Header ── */}
        <header style={{
          height: (currentPage === "plot-analysis") ? 0 : 60,
          display: (currentPage === "plot-analysis") ? "none" : "flex",
          alignItems: "center",
          padding: "0 20px", gap: 8, flexShrink: 0,
          background: "#090A0E",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>

          {/* Unified status strip */}
          <div style={{
            display: "flex", alignItems: "center", gap: 7, flexShrink: 0,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8, padding: "0 14px", height: 30,
            whiteSpace: "nowrap",
          }}>
            {/* 当前空间（可点击切换） */}
            <button onClick={() => openSpacePicker()}
              style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              {currentSpace === "team"
                ? <Users style={{ width: 10, height: 10, color: "#a78bfa", flexShrink: 0 }} />
                : <User style={{ width: 10, height: 10, color: "#60a5fa", flexShrink: 0 }} />}
              <span style={{ fontSize: 11, fontWeight: 600, color: currentSpace === "team" ? "#a78bfa" : "#60a5fa" }}>
                {currentSpace === "team" ? "团队空间" : "个人空间"}
              </span>
              <ChevronDown style={{ width: 9, height: 9, color: currentSpace === "team" ? "rgba(167,139,250,.6)" : "rgba(96,165,250,.6)" }} />
            </button>

            <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />

            {/* 套餐剩余 */}
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>套餐剩余</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#F4F5F7" }}>{USER.planDaysLeft} 天</span>

            <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />

            {/* 并发 */}
            <Zap style={{ width: 10, height: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>并发</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#F4F5F7" }}>
              {USER.concurrent.used}<span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>/{USER.concurrent.total}</span>
            </span>

            <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />

            {/* 钱包星石（对应当前空间） */}
            <Star style={{ width: 10, height: 10, color: "#FF8A1F", flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#FF8A1F" }}>
              {(currentSpace === "team" ? USER.teamPaidStars : USER.paidStars).toLocaleString()}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
              {currentSpace === "team" ? "团队钱包" : "个人钱包"}
            </span>
          </div>

          <div style={{ flex: 1 }} />

          {/* 会员积分 */}
          <button onClick={() => navigate("user-center")}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 8px", height: 28,
              background: "none", border: "none",
              color: "#FF8A1F", fontSize: 11.5, fontWeight: 500, cursor: "pointer", opacity: 0.85, transition: "opacity .15s", flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}>
            <Sparkles style={{ width: 11, height: 11 }} />
            会员积分
          </button>

          {/* 客服 */}
          <button onClick={() => setServiceOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 8px", height: 28,
              background: "none", border: "none",
              color: "rgba(255,255,255,0.38)", fontSize: 11.5, cursor: "pointer", transition: "color .15s", flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.38)"; }}>
            <Headphones style={{ width: 11, height: 11 }} />
            客服
          </button>

        </header>
        <main className={`flex-1 ${(currentPage === "plot-analysis") ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}>{children}</main>
      </div>
    </div>
  );
}


// ─── Shared app-page tokens ───────────────────────────────────────────────────
const surface    = "#13151C";
const bdr        = "rgba(255,255,255,0.07)";
const cardShadow = "0 1px 3px rgba(0,0,0,0.35)";
const textMuted  = "#A4A8B3";
const textDim    = "#F4F5F7";
const gold       = "#FF8A1F";

// ─── WorkspacePage ────────────────────────────────────────────────────────────
function WorkspacePage({ navigate }: Nav) {
  const [newOpen, setNewOpen] = useState(false);
  const [ccTab, setCcTab]     = useState<"all"|"project"|"canvas">("all");

  const CANVASES = [
    { id:"cv1", name:"星耀制作流程画布", nodes:7, edges:6, updated:"今天 14:30", storageDays: 5  },
    { id:"cv2", name:"《星坠》宣传物料", nodes:3, edges:2, updated:"昨天 09:15", storageDays: 19 },
  ];
  // storageDays: days until auto-purge
  const PROJECT_STORAGE_DAYS = 5;

  const showProject = ccTab === "all" || ccTab === "project";
  const showCanvas  = ccTab === "all" || ccTab === "canvas";

  // Storage countdown styling helper
  const storageTier = (days: number) =>
    days <= 7  ? { color: "#F87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.25)", label: `${days}天后清除`, urgent: true  } :
    days <= 14 ? { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)",  label: `${days}天后清除`, urgent: false } :
                 { color: "#6F7480", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", label: `${days}天后清除`, urgent: false };

  return (
    <div style={{ padding: "24px 28px", width: "100%", boxSizing: "border-box" }} onClick={() => setNewOpen(false)}>

      {/* ── Welcome + CTA ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F4F5F7", letterSpacing: "-0.03em", margin: 0, lineHeight: 1.15 }}>
          早上好，{USER.name}
        </h1>

        <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
          <button onClick={() => setNewOpen(o => !o)} className="glass-btn"
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#F4F5F7", border: "none", cursor: "pointer" }}>
            <Plus style={{ width: 13, height: 13, color: "rgba(255,255,255,0.65)" }} />
            开始创作
            <ChevronDown style={{ width: 11, height: 11, color: "rgba(255,255,255,0.4)", transition: "transform .15s", transform: newOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>
          {newOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200, background: "#181B24", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.65)", padding: "6px 0", minWidth: 220 }}>
              {[
                { label: "剧目创作",  sub: "剧本 → 分集 → 资产 → 分镜", icon: Film,    color: gold,      action: () => { navigate("new-project"); setNewOpen(false); } },
                { label: "无限画布", sub: "节点编排 · 自由创作",         icon: PenLine, color: "#A78BFA", action: () => { navigate("canvas");      setNewOpen(false); } },
              ].map(opt => (
                <button key={opt.label} onClick={opt.action}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left", transition: "background .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${opt.color}14`, border: `1px solid ${opt.color}22`, flexShrink: 0 }}>
                    <opt.icon style={{ width: 13, height: 13, color: opt.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#F4F5F7" }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: "#6F7480", marginTop: 1 }}>{opt.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={{ display: "flex", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 0", marginBottom: 28, gap: 0, flexWrap: "nowrap" }}>
        {([
          { value: "148",   unit: "条", label: "本月视频", color: "#FF8A1F" },
          { value: "3,241", unit: "颗", label: "星石消耗", color: "#FFB84D" },
          { value: "12",    unit: "个", label: "剧目总数", color: "#34D399" },
        ] as const).map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {i > 0 && <div style={{ width: 1, height: 26, background: "rgba(255,255,255,0.07)", flexShrink: 0, margin: "0 20px" }} />}
            <div style={{ whiteSpace: "nowrap" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 1 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 10, color: textMuted }}>{s.unit}</span>
                <span style={{ fontSize: 10, color: "#6F7480", marginLeft: 2 }}>{s.label}</span>
              </div>
            </div>
          </div>
        ))}

        <div style={{ flex: 1 }} />
      </div>

      {/* ── 继续创作 header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#6F7480", textTransform: "uppercase", letterSpacing: "0.09em" }}>继续创作</span>
          <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "2px" }}>
            {([["all","全部"],["project","剧目"],["canvas","画布"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setCcTab(id)}
                style={{ fontSize: 11, padding: "3px 10px", borderRadius: 5, border: "none", cursor: "pointer", transition: "all .15s",
                  background: ccTab === id ? "rgba(255,138,31,0.15)" : "transparent",
                  color: ccTab === id ? gold : textMuted, fontWeight: ccTab === id ? 500 : 400 }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => navigate("projects")}
          style={{ fontSize: 11.5, color: gold, display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", opacity: 0.7 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}>
          全部剧目<ChevronRight style={{ width: 11, height: 11 }} />
        </button>
      </div>

      {/* ── 3:4 Portrait card grid — fills available width ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16 }}>

        {showProject && (() => {
          const tier = storageTier(PROJECT_STORAGE_DAYS);
          return (
            <div onClick={() => navigate("storyboard")}
              style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer",
                background: "#13151C",
                border: tier.urgent ? "1px solid rgba(248,113,113,0.22)" : "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.35)", transition: "transform .2s, box-shadow .2s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 12px 36px rgba(0,0,0,0.5)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "none"; el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.35)"; }}>
              {/* Preview — 3:4 */}
              <div style={{ width: "100%", aspectRatio: "3/4", background: "linear-gradient(160deg,#1A1108 0%,#120C04 40%,#0D0A06 100%)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,138,31,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
                {/* Center */}
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,138,31,0.12)", border: "1px solid rgba(255,138,31,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Film style={{ width: 18, height: 18, color: gold }} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#F4F5F7", letterSpacing: "-0.02em" }}>{PROJECT.name}</span>
                </div>
                {/* Status badge */}
                <div style={{ position: "absolute", top: 9, right: 9 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 20, background: "rgba(96,165,250,0.15)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.25)", backdropFilter: "blur(4px)" }}>生成中</span>
                </div>
                {/* Storage urgency overlay — bottom gradient */}
                {tier.urgent && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 48, background: "linear-gradient(to top, rgba(248,113,113,0.15), transparent)", pointerEvents: "none" }} />
                )}
                {/* Progress bar */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.07)" }}>
                  <div style={{ height: "100%", background: gold, width: `${(PROJECT.storyboards.done / PROJECT.storyboards.total) * 100}%` }} />
                </div>
              </div>
              {/* Footer */}
              <div style={{ padding: "12px 14px 13px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#F4F5F7", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{PROJECT.chapter}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#6F7480", whiteSpace: "nowrap" }}>{PROJECT.storyboards.done}/{PROJECT.storyboards.total} 镜</span>
                  {/* Storage countdown */}
                  <button onClick={e => e.stopPropagation()}
                    title="立即导出，防止丢失"
                    style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, padding: "2px 7px", borderRadius: 20, cursor: "pointer",
                      background: tier.bg, border: `1px solid ${tier.border}`, color: tier.color,
                      fontWeight: tier.urgent ? 700 : 400, transition: "all .15s", whiteSpace: "nowrap", flexShrink: 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
                    {tier.urgent && <Download style={{ width: 9, height: 9, flexShrink: 0 }} />}
                    {tier.label}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {showCanvas && CANVASES.map(cv => {
          const tier = storageTier(cv.storageDays);
          return (
            <div key={cv.id} onClick={() => navigate("canvas")}
              style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer",
                background: "#13151C",
                border: tier.urgent ? "1px solid rgba(248,113,113,0.22)" : "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.35)", transition: "transform .2s, box-shadow .2s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 12px 36px rgba(0,0,0,0.5)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "none"; el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.35)"; }}>
              {/* Preview — 3:4 */}
              <div style={{ width: "100%", aspectRatio: "3/4", background: "linear-gradient(160deg,#0E0A14 0%,#090610 40%,#07050D 100%)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(167,139,250,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
                {/* Node dots */}
                {[[30,35],[50,55],[70,40],[40,68],[60,72]].map(([x,y],i) => (
                  <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 4, height: 4, borderRadius: "50%", background: i === 0 ? "#A78BFA" : "rgba(167,139,250,0.35)", transform: "translate(-50%,-50%)" }} />
                ))}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
                  {([[30,35,50,55],[50,55,70,40],[50,55,40,68],[50,55,60,72]] as [number,number,number,number][]).map(([x1,y1,x2,y2],i) => (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(167,139,250,0.18)" strokeWidth="0.8"/>
                  ))}
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PenLine style={{ width: 18, height: 18, color: "#A78BFA" }} />
                  </div>
                </div>
                <div style={{ position: "absolute", top: 9, right: 9 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 20, background: "rgba(167,139,250,0.12)", color: "#A78BFA", border: "1px solid rgba(167,139,250,0.22)", backdropFilter: "blur(4px)" }}>画布</span>
                </div>
                {tier.urgent && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 48, background: "linear-gradient(to top, rgba(248,113,113,0.15), transparent)", pointerEvents: "none" }} />
                )}
              </div>
              {/* Footer */}
              <div style={{ padding: "12px 14px 13px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#F4F5F7", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cv.name}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#6F7480", whiteSpace: "nowrap" }}>{cv.nodes} 节点 · {cv.updated}</span>
                  <button onClick={e => e.stopPropagation()}
                    title="立即导出"
                    style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, padding: "2px 7px", borderRadius: 20, cursor: "pointer",
                      background: tier.bg, border: `1px solid ${tier.border}`, color: tier.color,
                      fontWeight: tier.urgent ? 700 : 400, transition: "all .15s", whiteSpace: "nowrap", flexShrink: 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
                    {tier.urgent && <Download style={{ width: 9, height: 9, flexShrink: 0 }} />}
                    {tier.label}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ProjectListPage ──────────────────────────────────────────────────────────
function ProjectListPage({ navigate }: Nav) {
  const [q, setQ] = useState("");
  const projects = [
    { name: "《镜像》", genre: "都市情感", ep: "第03集《回声》", done: 12, running: 3, queued: 4, failed: 1, total: 20, updated: "今天 10:48", status: "active" },
    { name: "《星坠》", genre: "科幻冒险", ep: "第06集《归零》", done: 18, running: 0, queued: 0, failed: 0, total: 18, updated: "昨天 16:22", status: "done" },
    { name: "《归途》", genre: "悬疑推理", ep: "第01集《迷雾》", done: 0, running: 0, queued: 0, failed: 0, total: 24, updated: "07-25", status: "draft" },
  ].filter(p => p.name.includes(q) || p.genre.includes(q));
  const sb: Record<string, { label: string; cs: string; cb: string }> = {
    active: { label: "生成中", cs: "#60a5fa", cb: "rgba(59,130,246,.15)" },
    done:   { label: "已完成", cs: "#34d399", cb: "rgba(52,211,153,.12)" },
    draft:  { label: "草稿",   cs: textMuted, cb: surface },
  };

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate("workspace")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: textMuted, cursor: "pointer", fontSize: 13, padding: 0 }}>
            <ChevronLeft style={{ width: 14, height: 14 }} />工作台
          </button>
          <span style={{ fontSize: 13, color: "#6F7480" }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#F4F5F7" }}>全部剧目</span>
          <span style={{ fontSize: 12, color: textMuted }}>共 3 个</span>
        </div>
        <button onClick={() => openSpacePicker("new-project")} className="orange-btn" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: 500, color: "black", border: "none" }}>
          <Plus style={{ width: 14, height: 14 }} />新建剧目
        </button>
      </div>
      <div style={{ position: "relative", marginBottom: 16, maxWidth: 360 }}>
        <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: textMuted }} />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="搜索剧目" className="bg-white/5 border-white/10 text-white placeholder:text-white/25 pl-8" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {projects.map(p => {
          const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
          const s = sb[p.status];
          return (
            <div key={p.name} onClick={() => navigate("storyboard")}
              style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 10, padding: "14px 18px", cursor: "pointer", transition: "border-color .15s, background .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,138,31,0.2)"; (e.currentTarget as HTMLElement).style.background = "#181B24"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = bdr; (e.currentTarget as HTMLElement).style.background = surface; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(255,138,31,0.1)", border: "1px solid rgba(255,138,31,0.16)" }}>
                  <Film style={{ width: 16, height: 16, color: gold }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#F4F5F7" }}>{p.name}</span>
                    <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 4, background: s.cb, color: s.cs, border: `1px solid ${s.cb}` }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: textMuted }}>{p.genre} · {p.ep}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[{ v: p.done, c: "#34D399" }, { v: p.running, c: "#60A5FA" }, { v: p.queued, c: textMuted }, { v: p.failed, c: "#F87171" }].filter(x => x.v > 0).map((x, i) => (
                      <span key={i} style={{ fontSize: 12, color: x.c, fontVariantNumeric: "tabular-nums" }}>{x.v}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: textMuted, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
                  <span style={{ fontSize: 11, color: "#6F7480" }}>{p.updated}</span>
                  <button style={{ padding: 4, borderRadius: 6, background: "none", border: "none", color: textMuted, cursor: "pointer" }} onClick={e => e.stopPropagation()}>
                    <MoreHorizontal style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 10, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: p.status === "done" ? "#34D399" : gold, borderRadius: 2, transition: "width .3s" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── NewProjectPage ───────────────────────────────────────────────────────────
function NewProjectPage({ navigate, onStart }: Nav & { onStart?: () => void }) {
  const [name, setName]               = useState("");
  const [genre, setGenre]             = useState("都市情感");
  const [model, setModel]             = useState("fast");
  const [mode, setMode]               = useState<"novel"|"script">("novel");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [adaptStyle, setAdaptStyle]   = useState("faithful");
  const [targetEps, setTargetEps]     = useState(24);
  const [shotSec, setShotSec]         = useState(5);
  const [chatInput, setChatInput]     = useState("");
  const chatEndRef                    = useRef<HTMLDivElement>(null);

  const unitPrice = model === "fast" ? 18.55 : 45.0;
  const estStars  = Math.round(20 * unitPrice);

  type ChatMsg = { role: "ai"|"user"; text: string };
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
    { key: "novel"  as const, icon: FileText, label: "小说 / 剧本", sub: "AI 自动拆章生成分镜", color: "#FF8A1F", accept: ".txt,.docx,.md", hint: "支持 .txt · .docx · .md，最大 20 MB" },
    { key: "script" as const, icon: Layers,   label: "导入分镜脚本", sub: "识别资产直接进入制作", color: "#A78BFA", accept: ".txt,.docx,.md", hint: "支持 .txt · .docx · .md，最大 20 MB" },
  ];
  const activeMode = MODES.find(m => m.key === mode)!;
  const ready = !!name && (mode === "novel" ? !!uploadedFile : !!uploadedFile);

  const selectStyle: React.CSSProperties = {
    height: 32, padding: "0 28px 0 10px", borderRadius: 8, fontSize: 12, fontWeight: 500,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#F4F5F7", outline: "none", cursor: "pointer", appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236F7480' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center",
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "18px 24px", boxSizing: "border-box", overflow: "hidden",
      background: "linear-gradient(150deg,#09090D 0%,#0C0D13 60%,#08090E 100%)", position: "relative" }}>

      {/* Ambient glows */}
      <div style={{ position: "absolute", top: -40, left: "25%", width: 480, height: 240, borderRadius: "50%",
        background: "radial-gradient(ellipse,rgba(255,138,31,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, right: "5%", width: 360, height: 360, borderRadius: "50%",
        background: "radial-gradient(ellipse,rgba(167,139,250,0.04) 0%,transparent 70%)", pointerEvents: "none" }} />

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, position: "relative", flexShrink: 0 }}>
        <button onClick={() => navigate("projects")} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", fontSize: 13, padding: 0 }}>剧目创作</button>
        <ChevronRight style={{ width: 12, height: 12, color: "#6F7480" }} />
        <span style={{ fontSize: 13, color: "#F4F5F7", fontWeight: 500 }}>新建剧目</span>
      </div>

      {/* Main grid — fills remaining height */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 360px", gap: 18, minHeight: 0, position: "relative" }}>

        {/* ══ LEFT COLUMN ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>

          {/* Mode selector — 2 cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0 }}>
            {MODES.map(m => {
              const active = mode === m.key;
              return (
                <button key={m.key} onClick={() => { setMode(m.key); setUploadedFile(null); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                    borderRadius: 12, border: `1.5px solid ${active ? m.color + "55" : "rgba(255,255,255,0.08)"}`,
                    background: active ? `linear-gradient(135deg,${m.color}14 0%,${m.color}07 100%)` : "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(12px)", cursor: "pointer", transition: "all .2s", textAlign: "left",
                    boxShadow: active ? `0 0 0 1px ${m.color}22,0 6px 24px ${m.color}14` : "none" }}
                  onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.borderColor = m.color + "35"; el.style.background = `${m.color}08`; } }}
                  onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.08)"; el.style.background = "rgba(255,255,255,0.03)"; } }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    background: active ? `${m.color}25` : "rgba(255,255,255,0.07)",
                    border: `1px solid ${active ? m.color + "40" : "rgba(255,255,255,0.1)"}`, transition: "all .2s" }}>
                    <m.icon style={{ width: 15, height: 15, color: active ? m.color : textMuted }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#F4F5F7" : textMuted }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: active ? m.color + "bb" : "#6F7480", marginTop: 2 }}>{m.sub}</div>
                  </div>
                  {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: m.color, flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {/* Project name */}
          <div style={{ flexShrink: 0 }}>
            <label style={{ fontSize: 11, color: textMuted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              剧目名称 <span style={{ color: "#F87171" }}>*</span>
            </label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="如：《镜像》"
              style={{ width: "100%", height: 38, padding: "0 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#F4F5F7", fontSize: 13.5, fontWeight: 500, outline: "none", boxSizing: "border-box", transition: "border-color .15s" }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,138,31,0.45)"; }}
              onBlur={e =>  { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }} />
          </div>

          {/* Upload area — flex-grow to fill remaining space */}
          <div style={{ flex: 1, minHeight: 0, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.025)", backdropFilter: "blur(20px)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "11px 16px 0", display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: activeMode.color }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
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
                  <button onClick={() => setUploadedFile(null)} style={{ color: textMuted, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer", padding: "3px 7px", display: "flex", alignItems: "center" }}>
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
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    background: `linear-gradient(135deg,${activeMode.color}22,${activeMode.color}0a)`,
                    border: `1px solid ${activeMode.color}30`, boxShadow: `0 0 20px ${activeMode.color}18` }}>
                    <Upload style={{ width: 18, height: 18, color: activeMode.color }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#F4F5F7", marginBottom: 3 }}>拖拽或点击上传文件</div>
                    <div style={{ fontSize: 11, color: "#6F7480" }}>{activeMode.hint}</div>
                  </div>
                  <input type="file" style={{ display: "none" }} accept={activeMode.accept} onChange={e => { const f = e.target.files?.[0]; if (f) setUploadedFile(f.name); }} />
                </label>
              )}
            </div>
          </div>

          {/* ── Settings row — all dropdowns + slider in one line ── */}
          <div style={{ flexShrink: 0, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.025)", backdropFilter: "blur(12px)", padding: "11px 14px" }}>
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

              {/* 目标集数 slider */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 120 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "#6F7480", fontWeight: 600, letterSpacing: "0.05em" }}>目标集数</span>
                  <span style={{ fontSize: 11, color: gold, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{targetEps} 集</span>
                </div>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <style>{`
                    .eps-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 3px; border-radius: 2px; outline: none; background: linear-gradient(to right, #FF8A1F ${((targetEps-6)/(60-6))*100}%, rgba(255,255,255,0.12) ${((targetEps-6)/(60-6))*100}%); }
                    .eps-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #FF8A1F; border: 2px solid #0C0D13; box-shadow: 0 0 6px rgba(255,138,31,0.5); cursor: pointer; }
                    .eps-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #FF8A1F; border: 2px solid #0C0D13; cursor: pointer; }
                  `}</style>
                  <input type="range" min={6} max={60} step={1} value={targetEps} onChange={e => setTargetEps(Number(e.target.value))} className="eps-slider" />
                </div>
              </div>

              <div style={{ width: 1, height: 38, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />

              {/* 分镜秒数 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: "#6F7480", fontWeight: 600, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>分镜秒数</span>
                <select value={shotSec} onChange={e => setShotSec(Number(e.target.value))} style={selectStyle}>
                  {[3,4,5,6,8,10,12,15].map(s => <option key={s} value={s}>{s} 秒</option>)}
                </select>
              </div>

              <div style={{ width: 1, height: 38, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />

              {/* 剧情类型 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: "#6F7480", fontWeight: 600, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>剧情类型</span>
                <select value={genre} onChange={e => setGenre(e.target.value)} style={selectStyle}>
                  {["都市情感","科幻冒险","悬疑推理","古风仙侠","青春校园","职场商战"].map(g => <option key={g} value={g}>{g}</option>)}
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
              style={{ width: "100%", height: 44, borderRadius: 11, fontSize: 14, fontWeight: 700, color: ready ? "black" : textMuted,
                border: "none", cursor: ready ? "pointer" : "not-allowed", transition: "all .2s",
                background: ready ? `linear-gradient(135deg,${gold},#FF6A1A)` : "rgba(255,255,255,0.07)",
                boxShadow: ready ? "0 4px 20px rgba(255,138,31,0.32)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
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

        {/* ══ RIGHT COLUMN — AI Chat ══ */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0,
          borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)", overflow: "hidden" }}>

          {/* Chat header */}
          <div style={{ padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,rgba(255,138,31,0.3),rgba(255,106,26,0.15))", border: "1px solid rgba(255,138,31,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Sparkles style={{ width: 13, height: 13, color: gold }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#F4F5F7" }}>AI 创作助手</div>
              <div style={{ fontSize: 10, color: "#34D399", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34D399", display: "inline-block" }} />在线
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: textMuted, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 8px" }}>
                预计消耗 <span style={{ color: gold, fontWeight: 700 }}>{estStars}</span> 星石
              </span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                {msg.role === "ai" && (
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(255,138,31,0.18)", border: "1px solid rgba(255,138,31,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Sparkles style={{ width: 10, height: 10, color: gold }} />
                  </div>
                )}
                <div style={{ maxWidth: "82%", padding: "9px 12px", borderRadius: msg.role === "ai" ? "4px 12px 12px 12px" : "12px 4px 12px 12px", fontSize: 12.5, lineHeight: 1.55, color: "#F4F5F7",
                  background: msg.role === "ai" ? "rgba(255,255,255,0.05)" : "rgba(255,138,31,0.15)",
                  border: `1px solid ${msg.role === "ai" ? "rgba(255,255,255,0.07)" : "rgba(255,138,31,0.22)"}` }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions */}
          <div style={{ padding: "6px 14px", display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
            {["推荐改编风格","如何控制成本","集数怎么定"].map(q => (
              <button key={q} onClick={() => { setChatInput(q); }}
                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: textMuted, cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,138,31,0.3)"; (e.currentTarget as HTMLElement).style.color = gold; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = textMuted; }}>
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
                style={{ width: 28, height: 28, borderRadius: 7, border: "none", cursor: chatInput.trim() ? "pointer" : "default",
                  background: chatInput.trim() ? `linear-gradient(135deg,${gold},#FF6A1A)` : "rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                <ArrowUp style={{ width: 13, height: 13, color: chatInput.trim() ? "black" : textMuted }} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── AIChapterPage ────────────────────────────────────────────────────────────
function AIChapterPage({ navigate }: Nav) {
  type Episode = { id: string; title: string; shots: number; secPerShot: number; desc: string; script: string; wordCount: number };

  const INIT_EPISODES: Episode[] = [
    { id: "ep-01", title: "第一集", shots: 4, secPerShot: 5, desc: "陈默与林凯意外相遇，氛围冷淡", wordCount: 620,
      script: "第一集《相遇》\n\n公司走廊 · 白天\n\n陈默走在空旷的走廊上，脚步声在大理石地板上回响。\n\n林凯（轻声）：你昨天没接我电话。\n陈默（不停步）：开会。\n林凯：你知道那不是理由。\n\n陈默终于停下脚步，转过身，眼神疏离。" },
    { id: "ep-02", title: "第二集", shots: 5, secPerShot: 5, desc: "陈默独自整理文件，窗外城市", wordCount: 780,
      script: "第二集《独处》\n\n陈默办公室 · 下午\n\n落地窗外，城市在金色光线中延伸。陈默一份一份地整理文件，动作机械而精准。\n\n手机屏幕亮起：林凯。\n\n陈默盯着屏幕，直到它熄灭。" },
    { id: "ep-03", title: "第三集", shots: 6, secPerShot: 5, desc: "两人再次相遇，矛盾激化", wordCount: 940,
      script: "第三集《回声》\n\n天台 · 傍晚\n\n霞光将两人的影子拉得很长。\n\n林凯：你一直在逃。\n陈默：我只是不想解释。\n林凯：那就听我说。\n\n陈默转身走向楼梯口，林凯伸手——" },
    { id: "ep-04", title: "第四集", shots: 3, secPerShot: 5, desc: "陈默独自乘地铁，闪回记忆", wordCount: 510,
      script: "第四集《闪回》\n\n地铁站 · 夜晚\n\n人群涌动，陈默站在角落，任由车厢摇晃。\n\n记忆碎片：林凯拍她肩膀，那个她还会笑的下午。\n\n地铁报站。陈默闭上眼睛。" },
    { id: "ep-05", title: "第五集", shots: 2, secPerShot: 5, desc: "陈默驻足门外，没有按门铃", wordCount: 370,
      script: "第五集《门外》\n\n林凯家门口 · 深夜\n\n路灯昏黄，陈默站在门前，手悬在门铃上。\n\n许久，她放下手，转身离开。\n\n门缝里透出的灯光，慢慢熄灭。" },
  ];

  const [episodes, setEpisodes] = useState<Episode[]>(INIT_EPISODES);
  const [activeId, setActiveId] = useState("ep-01");
  const [eTab, setETab] = useState<"chars"|"scenes"|"props">("chars");
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [editingShots, setEditingShots] = useState<string | null>(null);
  const [showDurMenu, setShowDurMenu] = useState<string | null>(null);
  const DUR_OPTIONS = [3, 4, 5, 6, 8, 10, 12, 15];

  const activeEp = episodes.find(e => e.id === activeId)!;

  const updateScript = (val: string) => {
    setEpisodes(prev => prev.map(e => e.id === activeId ? { ...e, script: val, wordCount: val.replace(/\s/g, "").length } : e));
    setSaved(prev => ({ ...prev, [activeId]: false }));
  };

  const saveScript = () => {
    setSaved(prev => ({ ...prev, [activeId]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [activeId]: false })), 2000);
  };

  const deleteEpisode = (id: string) => {
    if (episodes.length <= 1) return;
    const newList = episodes.filter(e => e.id !== id).map((e, i) => ({ ...e, title: `第${["一","二","三","四","五","六","七","八","九","十"][i]}集` }));
    setEpisodes(newList);
    if (activeId === id) setActiveId(newList[0].id);
  };

  const addEpisode = () => {
    const nums = ["一","二","三","四","五","六","七","八","九","十"];
    const n = episodes.length;
    const newEp: Episode = {
      id: `ep-${String(n + 1).padStart(2, "0")}`, title: `第${nums[n] ?? n + 1}集`,
      shots: 0, secPerShot: 5, desc: "新增集数", wordCount: 0, script: "",
    };
    setEpisodes(prev => [...prev, newEp]);
    setActiveId(newEp.id);
  };

  const entities = {
    chars:  [{ name: "陈默", desc: "女主，都市职场女性，30岁", n: 16 }, { name: "林凯", desc: "男主，温柔执着", n: 12 }],
    scenes: [{ name: "公司走廊", desc: "现代办公大楼，冷色调", n: 4 }, { name: "天台", desc: "城市高楼，傍晚霞光", n: 6 }],
    props:  [{ name: "手机", desc: "未接来电记录", n: 2 }, { name: "文件夹", desc: "工作文件", n: 1 }],
  };
  const tabs = [{ k: "chars" as const, l: "人物", icon: User }, { k: "scenes" as const, l: "场景", icon: MapPin }, { k: "props" as const, l: "道具", icon: Package }];

  return (
    <div style={{ padding: "20px 28px" }} onClick={() => setShowDurMenu(null)}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: textMuted, marginBottom: 16 }}>
        <button onClick={() => navigate("projects")} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer" }}>剧目创作</button>
        <ChevronRight style={{ width: 13, height: 13 }} /><span style={{ color: textDim }}>{PROJECT.name}</span>
        <ChevronRight style={{ width: 13, height: 13 }} /><span style={{ color: "rgba(255,255,255,.7)", fontWeight: 500 }}>改编结果</span>
      </div>

      {/* Pipeline progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 22, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 18px" }}>
        {[
          { label: "原著理解", desc: "角色·场景·主题提取", done: true  },
          { label: "分集规划", desc: "章节拆分·镜头配置",  done: true  },
          { label: "进入制作", desc: "资产生成·分镜制作",  done: false },
        ].map((step, i) => (
          <div key={step.label} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                background: step.done ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.07)",
                border: `1px solid ${step.done ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: step.done ? "#34d399" : textMuted }}>
                {step.done ? <CheckCircle style={{ width: 13, height: 13 }} /> : i + 1}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: step.done ? "#F4F5F7" : textMuted, whiteSpace: "nowrap" }}>{step.label}</div>
                <div style={{ fontSize: 10.5, color: textMuted, whiteSpace: "nowrap" }}>{step.desc}</div>
              </div>
            </div>
            {i < 2 && <div style={{ width: 28, flexShrink: 0, height: 1, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />}
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 16 }}>
          <button className="glass-btn" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, fontSize: 12.5, color: textDim, border: "none" }}>
            <Wand2 style={{ width: 13, height: 13 }} />重新改编
          </button>
          <button onClick={() => navigate("team-assets")} className="orange-btn" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, color: "black", border: "none" }}>
            进入制作<ChevronRight style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>

      {/* Sub-header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{PROJECT.name}</h1>
          <p style={{ fontSize: 12.5, color: textMuted, marginTop: 2 }}>{episodes.length} 集 · {episodes.reduce((s, e) => s + e.shots, 0)} 镜 · 目标 24 集</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 16 }}>

        {/* Left: script editor */}
        <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, overflow: "hidden", boxShadow: cardShadow, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: textDim }}>原始剧本</span>
            <span style={{ fontSize: 12, color: textMuted }}>{activeEp.title}</span>
          </div>
          <textarea
            value={activeEp.script}
            onChange={e => updateScript(e.target.value)}
            style={{ flex: 1, minHeight: 300, padding: "14px 16px", background: "transparent", border: "none", outline: "none", color: "rgba(255,255,255,.7)", fontSize: 12.5, lineHeight: 1.85, resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            placeholder="在此输入或粘贴剧本…"
          />
          {/* Footer: word count + save */}
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: textMuted }}>字数：<span style={{ color: textDim, fontWeight: 600 }}>{activeEp.wordCount.toLocaleString()}</span> 字</span>
            <button onClick={saveScript}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 9, border: "none", fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all .2s",
                background: saved[activeId] ? "rgba(52,211,153,.15)" : "rgba(255,138,31,.15)",
                color: saved[activeId] ? "#34d399" : gold }}>
              {saved[activeId] ? <CheckCircle style={{ width: 13, height: 13 }} /> : <Download style={{ width: 13, height: 13 }} />}
              {saved[activeId] ? "已保存" : "保存"}
            </button>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* 原著理解 — entity panel (moved to top) */}
          <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, overflow: "hidden", boxShadow: cardShadow }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: textDim }}>原著理解</span>
                <span style={{ fontSize: 10, color: textMuted }}>角色 · 场景 · 道具</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: "rgba(52,211,153,.12)", border: "1px solid rgba(52,211,153,.2)", color: "#34d399" }}>已解析</span>
            </div>
            <div style={{ display: "flex", borderBottom: `1px solid ${bdr}` }}>
              {tabs.map(t => (
                <button key={t.k} onClick={() => setETab(t.k)}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", fontSize: 12.5, fontWeight: 500, background: "none", border: "none", cursor: "pointer",
                    color: eTab === t.k ? gold : textMuted, borderBottom: eTab === t.k ? `2px solid ${gold}` : "2px solid transparent" }}>
                  <t.icon style={{ width: 13, height: 13 }} />{t.l}
                </button>
              ))}
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
              {entities[eTab].map(e => (
                <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,.03)", borderRadius: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,138,31,.15)", color: gold, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{e.name[0]}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,.8)" }}>{e.name}</div><div style={{ fontSize: 11, color: textMuted }}>{e.desc}</div></div>
                  <span style={{ fontSize: 11, color: textMuted, flexShrink: 0 }}>出现 {e.n} 次</span>
                </div>
              ))}
            </div>
          </div>

          {/* 分集规划 — episode list */}
          <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, overflow: "hidden", boxShadow: cardShadow }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: textDim }}>分集规划</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: "rgba(52,211,153,.12)", border: "1px solid rgba(52,211,153,.2)", color: "#34d399" }}>AI 已拆章</span>
            </div>

            {episodes.map((ep, idx) => {
              const isActive = ep.id === activeId;
              return (
                <div key={ep.id} style={{ borderBottom: `1px solid rgba(255,255,255,.04)`, background: isActive ? "rgba(255,138,31,.05)" : "transparent", transition: "background .15s" }}>
                  <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10 }}>
                    {/* Episode label — click to select & load script */}
                    <button onClick={() => setActiveId(ep.id)}
                      style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", textAlign: "left", cursor: "pointer" }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                        background: isActive ? "rgba(255,138,31,.2)" : "rgba(255,255,255,.06)",
                        color: isActive ? gold : textMuted }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? gold : textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ep.title}</div>
                        <div style={{ fontSize: 11, color: textMuted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ep.desc}</div>
                      </div>
                    </button>

                    {/* Shot count — click to edit */}
                    <button onClick={() => setEditingShots(editingShots === ep.id ? null : ep.id)}
                      title="点击编辑镜头数"
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, border: `1px solid ${editingShots === ep.id ? "rgba(255,138,31,.4)" : "rgba(255,255,255,.08)"}`, background: "transparent", color: editingShots === ep.id ? gold : textMuted, fontSize: 12, cursor: "pointer", flexShrink: 0, transition: "all .15s" }}>
                      <PenLine style={{ width: 11, height: 11 }} />
                      {editingShots === ep.id ? (
                        <input type="number" min={0} value={ep.shots}
                          onChange={e => setEpisodes(prev => prev.map(x => x.id === ep.id ? { ...x, shots: parseInt(e.target.value) || 0 } : x))}
                          style={{ width: 36, background: "transparent", border: "none", outline: "none", color: gold, fontSize: 12, fontWeight: 600 }}
                          onClick={e => e.stopPropagation()} />
                      ) : (
                        <span>{ep.shots} 镜</span>
                      )}
                    </button>

                    {/* Seconds per shot dropdown */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <button onClick={e => { e.stopPropagation(); setShowDurMenu(showDurMenu === ep.id ? null : ep.id); }}
                        title="每镜时长"
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 8, border: `1px solid ${showDurMenu === ep.id ? "rgba(99,179,237,.5)" : "rgba(255,255,255,.08)"}`, background: "transparent", color: showDurMenu === ep.id ? "#63b3ed" : textMuted, fontSize: 12, cursor: "pointer", transition: "all .15s" }}>
                        <Clock style={{ width: 11, height: 11 }} />
                        {ep.secPerShot}s
                        <ChevronDown style={{ width: 10, height: 10 }} />
                      </button>
                      {showDurMenu === ep.id && (
                        <div onClick={e => e.stopPropagation()}
                          style={{ position: "absolute", top: 34, right: 0, background: "#181B24", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "4px 0", zIndex: 300, minWidth: 90, boxShadow: "0 8px 24px rgba(0,0,0,.6)" }}>
                          {DUR_OPTIONS.map(s => {
                            const active = ep.secPerShot === s;
                            return (
                              <button key={s} onClick={() => { setEpisodes(prev => prev.map(x => x.id === ep.id ? { ...x, secPerShot: s } : x)); setShowDurMenu(null); }}
                                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: active ? "rgba(99,179,237,.1)" : "transparent", border: "none", cursor: "pointer", fontSize: 12, color: active ? "#63b3ed" : "rgba(255,255,255,.6)", fontWeight: active ? 600 : 400 }}
                                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.05)"; }}
                                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                                <span>{s} 秒</span>
                                {active && <Check style={{ width: 11, height: 11 }} />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Delete */}
                    <button onClick={() => deleteEpisode(ep.id)} title="删除此集"
                      style={{ width: 26, height: 26, borderRadius: 7, border: "none", background: "transparent", color: "rgba(255,255,255,.2)", cursor: episodes.length <= 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: episodes.length <= 1 ? 0.3 : 1, transition: "all .15s", flexShrink: 0 }}
                      disabled={episodes.length <= 1}
                      onMouseEnter={e => { if (episodes.length > 1) (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.2)"; }}>
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add episode */}
            <button onClick={addEpisode}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", background: "none", border: "none", color: textMuted, fontSize: 13, cursor: "pointer", transition: "color .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = gold; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = textMuted; }}>
              <Plus style={{ width: 14, height: 14 }} />新增集数
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── CostConfirmPage ──────────────────────────────────────────────────────────
function CostConfirmPage({ navigate }: Nav) {
  const [exp, setExp] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(12px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <TiltCard style={{ width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ background: "#0E0F14", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, boxShadow: "0 30px 80px rgba(0,0,0,.6)" }}>
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "white" }}>生成前费用确认</h2>
            <button onClick={() => navigate("storyboard")} style={{ color: textMuted, background: "none", border: "none" }}><X style={{ width: 18, height: 18 }} /></button>
          </div>
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${bdr}`, borderRadius: 14, padding: 16 }}>
              {[["任务类型","批量视频生成（7条）"],["模型",TASK.model],["规格",TASK.spec],["数量","7 条分镜"]].map(([k,v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                  <span style={{ color: textMuted }}>{k}</span><span style={{ color: "rgba(255,255,255,.8)", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            {/* 钱包归属 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10,
              background: USER.currentSpace === "team" ? "rgba(139,92,246,.07)" : "rgba(96,165,250,.07)",
              border: `1px solid ${USER.currentSpace === "team" ? "rgba(139,92,246,.2)" : "rgba(96,165,250,.2)"}` }}>
              {USER.currentSpace === "team"
                ? <Users style={{ width: 13, height: 13, color: "#a78bfa", flexShrink: 0 }} />
                : <User style={{ width: 13, height: 13, color: "#60a5fa", flexShrink: 0 }} />}
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", flex: 1 }}>
                当前为 <strong style={{ color: USER.currentSpace === "team" ? "#a78bfa" : "#60a5fa" }}>
                  {USER.currentSpace === "team" ? "团队空间" : "个人空间"}
                </strong>，费用将从 <strong style={{ color: USER.currentSpace === "team" ? "#a78bfa" : "#60a5fa" }}>
                  {USER.currentSpace === "team" ? "团队钱包" : "个人钱包"}
                </strong> 扣除
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)", flexShrink: 0 }}>
                余额 {(USER.currentSpace === "team" ? USER.teamPaidStars : USER.paidStars).toLocaleString()} 星石
              </span>
            </div>

            <div style={{ background: "rgba(255,138,31,.07)", border: "1px solid rgba(255,138,31,.2)", borderRadius: 14, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <span style={{ fontSize: 13, color: textMuted }}>预计消耗</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: gold }}>{(TASK.estimatedStars * 7).toFixed(2)} 星石</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 2 }}>≈ ¥{(TASK.estimatedCNY * 7).toFixed(2)}</div>
                </div>
              </div>
              {USER.currentSpace === "team"
                ? [["优先消耗团队活动星石",`${USER.teamActiveStars} 可用`],["不足部分从团队付费星石扣除",`${USER.teamPaidStars.toLocaleString()} 可用`]].map(([k,v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 6 }}>
                      <span>{k}</span><span>{v}</span>
                    </div>
                  ))
                : [["优先消耗活动星石",`${USER.activeStars} 可用`],["不足部分从付费星石扣除",`${USER.paidStars.toLocaleString()} 可用`]].map(([k,v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 6 }}>
                      <span>{k}</span><span>{v}</span>
                    </div>
                  ))
              }
              <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(248,113,113,.06)", border: "1px solid rgba(248,113,113,.12)", fontSize: 11, color: "rgba(248,113,113,.7)" }}>
                余额不足时任务提交失败，{USER.currentSpace === "team" ? "不自动扣个人余额" : "请充值后重试"}
              </div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid rgba(255,255,255,.07)`, fontSize: 10, color: "rgba(255,255,255,.25)" }}>价格版本：{TASK.priceVersion}</div>
            </div>
            <div style={{ borderRadius: 13, overflow: "hidden", border: `1px solid ${bdr}` }}>
              <button onClick={() => setExp(!exp)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", background: "none", border: "none", fontSize: 13, color: textMuted }}>
                <span>为什么价格会变化？</span>{exp ? <ChevronUp style={{ width: 15, height: 15 }} /> : <ChevronDown style={{ width: 15, height: 15 }} />}
              </button>
              {exp && <div style={{ padding: "0 16px 14px", fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.7, borderTop: `1px solid rgba(255,255,255,.05)`, paddingTop: 12 }}>实际消耗受参考图数量、分辨率、时长、声音、后处理等影响。差异在任务完成后退回或追扣。</div>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigate("storyboard")} className="glass-btn" style={{ flex: 1, height: 44, borderRadius: 12, fontSize: 14, color: textDim, border: "none" }}>返回修改</button>
              <button onClick={() => navigate("batch")} className="orange-btn" style={{ flex: 1, height: 44, borderRadius: 12, fontSize: 14, fontWeight: 700, color: "black", border: "none" }}>确认并提交生成</button>
            </div>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}

// ─── BatchPage ────────────────────────────────────────────────────────────────
function BatchPage({ navigate }: Nav) {
  const ss: Record<string, { c: string; bg: string; label: string }> = {
    done:    { c: "#34d399", bg: "rgba(52,211,153,.12)", label: "成功" },
    running: { c: "#60a5fa", bg: "rgba(96,165,250,.12)", label: "生成中" },
    queued:  { c: textMuted, bg: "rgba(255,255,255,.06)", label: "排队中" },
    failed:  { c: "#f87171", bg: "rgba(248,113,113,.12)", label: "失败" },
  };
  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div><h1 style={{ fontSize: 18, fontWeight: 700, color: "white" }}>批量生成进度</h1><p style={{ fontSize: 13, color: textMuted, marginTop: 3 }}>{PROJECT.name} · {PROJECT.chapter}</p></div>
        <button onClick={() => navigate("storyboard")} className="glass-btn" style={{ padding: "8px 16px", borderRadius: 11, fontSize: 13, color: textDim, border: "none" }}>返回分镜</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {[{ label: "已完成", v: PROJECT.storyboards.done, c: "#34d399" }, { label: "生成中", v: PROJECT.storyboards.running, c: "#60a5fa" }, { label: "排队中", v: PROJECT.storyboards.queued, c: textMuted }, { label: "失败", v: PROJECT.storyboards.failed, c: "#f87171" }].map(s => (
          <TiltCard key={s.label}><div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 14, padding: 18, textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 12, color: textMuted, marginTop: 6 }}>{s.label}</div>
          </div></TiltCard>
        ))}
      </div>
      {PROJECT.storyboards.failed > 0 && (
        <div style={{ background: "rgba(248,113,113,.07)", border: "1px solid rgba(248,113,113,.18)", borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><AlertTriangle style={{ width: 15, height: 15, color: "#f87171" }} /><span style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>{PROJECT.storyboards.failed} 条任务失败，星石已按实际消耗处理</span></div>
          <button onClick={() => navigate("cost-confirm")} style={{ padding: "6px 14px", borderRadius: 9, fontSize: 12, color: "#f87171", background: "rgba(248,113,113,.15)", border: "1px solid rgba(248,113,113,.2)" }}>批量重试</button>
        </div>
      )}
      <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 16, overflow: "hidden", boxShadow: cardShadow }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "rgba(255,255,255,.02)", borderBottom: `1px solid ${bdr}` }}>
            <tr>{["任务ID","分镜描述","模型","状态","预计","实耗","操作"].map(h => <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 500, color: textMuted }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {STORYBOARDS.map((sb, i) => {
              const s = ss[sb.status];
              return (
                <tr key={sb.id} style={{ borderBottom: `1px solid rgba(255,255,255,.03)` }}>
                  <td style={{ padding: "11px 14px", fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,.3)" }}>TSK-{String(i+1).padStart(3,"0")}</td>
                  <td style={{ padding: "11px 14px", color: "rgba(255,255,255,.6)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sb.desc}</td>
                  <td style={{ padding: "11px 14px", color: textMuted }}>Seedance 2.0</td>
                  <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: s.bg, color: s.c }}>{s.label}</span></td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: gold }}>{sb.stars > 0 ? sb.stars : "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: textMuted }}>{sb.status === "done" ? (sb.stars * .98).toFixed(2) : sb.status === "failed" ? "已退回" : "—"}</td>
                  <td style={{ padding: "11px 14px" }}>
                    {sb.status === "done"   && <button onClick={() => navigate("result")} style={{ fontSize: 12, color: "#60a5fa", background: "none", border: "none" }}>查看</button>}
                    {sb.status === "failed" && <button onClick={() => navigate("cost-confirm")} style={{ fontSize: 12, color: "#f87171", background: "none", border: "none" }}>重试</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ResultPage ───────────────────────────────────────────────────────────────
function ResultPage({ navigate }: Nav) {
  const [av, setAv] = useState(0);
  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: textMuted, marginBottom: 16 }}>
        <button onClick={() => navigate("storyboard")} style={{ background: "none", border: "none", color: textMuted }}>分镜管理</button>
        <ChevronRight style={{ width: 13, height: 13 }} />
        <button onClick={() => navigate("batch")} style={{ background: "none", border: "none", color: textMuted }}>批量生成</button>
        <ChevronRight style={{ width: 13, height: 13 }} /><span style={{ color: "rgba(255,255,255,.7)", fontWeight: 500 }}>结果详情</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div><h1 style={{ fontSize: 18, fontWeight: 700, color: "white" }}>SB-001 · 结果详情</h1><p style={{ fontSize: 13, color: textMuted, marginTop: 3 }}>{PROJECT.name} · {PROJECT.chapter}</p></div>
        <button onClick={() => navigate("delivery")} style={{ padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#34d399", background: "rgba(52,211,153,.12)", border: "1px solid rgba(52,211,153,.2)" }}>加入交付清单</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div>
          <div style={{ background: "#090A0E", border: `1px solid ${bdr}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "9/16", maxHeight: 480 }}>
            <div style={{ textAlign: "center" }}><Play style={{ width: 48, height: 48, color: "rgba(255,255,255,.12)", margin: "0 auto 8px" }} /><div style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>版本 {String.fromCharCode(65+av)}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,.2)", marginTop: 4 }}>480p · 5秒 · 9:16</div></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            {["版本 A（主采用）","版本 B","版本 C"].map((v, i) => (
              <button key={v} onClick={() => setAv(i)} style={{ flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 12, fontWeight: 500, border: "none", transition: "all .2s",
                ...(av === i ? { background: "rgba(255,138,31,.12)", border: "1px solid rgba(255,138,31,.3)", color: gold } : { background: surface, border: `1px solid ${bdr}`, color: textMuted }) }}>{v}</button>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 8 }}>后处理（确认费用后执行）</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ icon: Scissors, l: "字幕擦除" }, { icon: Sparkles, l: "画质增强" }, { icon: Play, l: "抽取帧" }, { icon: RotateCcw, l: "重新生成" }].map(b => (
                <button key={b.l} onClick={() => navigate("cost-confirm")} className="glass-btn"
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 10, fontSize: 12, color: textDim, border: "none" }}>
                  <b.icon style={{ width: 13, height: 13 }} />{b.l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 16, padding: 18, boxShadow: cardShadow }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>任务信息</div>
            {[["任务ID",TASK.id],["模型",TASK.model],["规格",TASK.spec],["价格版本",TASK.priceVersion]].map(([k,v]) => (
              <div key={k} style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: textMuted, marginBottom: 3 }}>{k}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,.75)", fontWeight: 500 }}>{v}</div></div>
            ))}
          </div>
          <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 16, padding: 18, boxShadow: cardShadow }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>费用明细</div>
            {[["预计冻结",`${TASK.estimatedStars} 星石`,""],["实际结算",`${(TASK.estimatedStars*.98).toFixed(2)} 星石`,""],["退回",`+${(TASK.estimatedStars*.02).toFixed(2)} 星石`,"#34d399"]].map(([k,v,c]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 9, fontSize: 13 }}>
                <span style={{ color: textMuted }}>{k}</span><span style={{ color: (c as string) || "rgba(255,255,255,.75)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <button className="glass-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 0", borderRadius: 12, fontSize: 13, color: textDim, border: "none" }}>
            <Download style={{ width: 15, height: 15 }} />下载当前版本
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DeliveryPage ─────────────────────────────────────────────────────────────
function DeliveryPage({ navigate }: Nav) {
  const files = STORYBOARDS.filter(s => s.status === "done").map(s => ({ id: s.id, name: `${s.id}_v1.mp4`, size: "24.6 MB", expiry: "2026-09-20", stars: s.stars }));
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: textMuted, marginBottom: 16 }}>
        <button onClick={() => navigate("storyboard")} style={{ background: "none", border: "none", color: textMuted }}>分镜管理</button>
        <ChevronRight style={{ width: 13, height: 13 }} />
        <button onClick={() => navigate("batch")} style={{ background: "none", border: "none", color: textMuted }}>批量生成</button>
        <ChevronRight style={{ width: 13, height: 13 }} />
        <button onClick={() => navigate("result")} style={{ background: "none", border: "none", color: textMuted }}>结果详情</button>
        <ChevronRight style={{ width: 13, height: 13 }} /><span style={{ color: "rgba(255,255,255,.7)", fontWeight: 500 }}>下载交付</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div><h1 style={{ fontSize: 18, fontWeight: 700, color: "white" }}>下载交付</h1><p style={{ fontSize: 13, color: textMuted, marginTop: 3 }}>{PROJECT.name} · {files.length} 个文件</p></div>
        <button onClick={() => navigate("billing")} className="orange-btn" style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "black", border: "none" }}><Download style={{ width: 15, height: 15 }} />打包下载</button>
      </div>
      <div style={{ background: "rgba(251,191,36,.06)", border: "1px solid rgba(251,191,36,.15)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 8, marginBottom: 16 }}>
        <AlertTriangle style={{ width: 14, height: 14, color: "#fbbf24", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: "rgba(255,255,255,.45)", lineHeight: 1.6 }}>文件为短期缓存，到期后无法下载。请及时下载或配置自有对象存储。</p>
      </div>
      <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 16, overflow: "hidden", boxShadow: cardShadow }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "11px 16px", borderBottom: `1px solid ${bdr}`, fontSize: 12, color: textMuted, background: "rgba(255,255,255,.02)" }}>
          <span>文件名</span><span>大小</span><span>星石</span><span>缓存到期</span>
        </div>
        {files.map(f => (
          <div key={f.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: `1px solid rgba(255,255,255,.03)`, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Play style={{ width: 14, height: 14, color: textMuted, flexShrink: 0 }} /><span style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>{f.name}</span></div>
            <span style={{ fontSize: 12, color: textMuted }}>{f.size}</span>
            <span style={{ fontSize: 12, color: gold }}>{f.stars}</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(251,191,36,.65)" }}>{f.expiry}</span>
              <button style={{ fontSize: 12, color: "#60a5fa", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none" }}><Download style={{ width: 13, height: 13 }} />下载</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── UpgradePage ──────────────────────────────────────────────────────────────
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

function UpgradePage({ navigate }: Nav) {
  const [tab, setTab] = useState<"group"|"team">("team");
  const plans = tab === "group" ? UP_GROUP : UP_TEAM;
  const CURRENT = "星轨小队";

  const buyPlan = (name: string) => {
    if (name === "超级新星") return;
    navigate("user-center");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#090A0E", color: "white", position: "relative" }}>
      {/* Ambient blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "8%", left: "12%", width: 600, height: 400, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(255,138,31,.07) 0%,transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "8%", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(168,85,247,.05) 0%,transparent 68%)", filter: "blur(100px)" }} />
      </div>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 50,
        background: "rgba(9,10,14,.9)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,.07)", padding: "0 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("user-center")}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,.45)",
              background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,.75)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.45)"}>
            <ChevronLeft style={{ width: 14, height: 14 }} />个人中心
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
            <div style={{ display: "inline-flex", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 12, padding: 4, gap: 4 }}>
              {([["group","个人套餐"],["team","团队套餐"]] as const).map(([k, label]) => (
                <button key={k} onClick={() => setTab(k)}
                  style={{ padding: "7px 24px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    transition: "all .18s", border: "none",
                    ...(tab === k
                      ? { background: gold, color: "black", boxShadow: `0 2px 12px rgba(255,138,31,.35)` }
                      : { background: "transparent", color: "rgba(255,255,255,.5)" }) }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, alignItems: "stretch" }}>
          {plans.map(plan => {
            const isCurrent = plan.name === CURRENT;
            const isCustom = plan.price === -1;
            return (
              <div key={plan.name} style={{ position: "relative", borderRadius: 16,
                padding: "24px 20px 20px", display: "flex", flexDirection: "column", boxSizing: "border-box",
                transition: "transform .2s, box-shadow .2s",
                ...(plan.hot ? {
                  background: "radial-gradient(ellipse at 50% 0%,rgba(255,138,31,.14),rgba(255,255,255,.03) 68%)",
                  border: "1px solid rgba(255,138,31,.3)", boxShadow: "0 0 48px rgba(255,100,20,.1)"
                } : isCurrent ? {
                  background: "rgba(255,138,31,.04)",
                  border: "1px solid rgba(255,138,31,.18)"
                } : {
                  background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)"
                }) }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = plan.hot ? "0 8px 48px rgba(255,100,20,.18)" : "0 8px 32px rgba(0,0,0,.4)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = plan.hot ? "0 0 48px rgba(255,100,20,.1)" : "none"; }}>
                {/* Tag badge */}
                {plan.tag && (
                  <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20, whiteSpace: "nowrap",
                    ...(plan.hot ? { background: gold, color: "black" }
                      : plan.tag === "商务" ? { background: "rgba(168,85,247,.25)", border: "1px solid rgba(168,85,247,.4)", color: "#c084fc" }
                      : { background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.65)" }) }}>
                    {plan.tag}
                  </div>
                )}
                {isCurrent && (
                  <div style={{ position: "absolute", top: -13, right: 16,
                    fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20,
                    background: "rgba(255,138,31,.18)", border: "1px solid rgba(255,138,31,.3)", color: gold }}>
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
                      <span style={{ fontSize: 30, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>¥{plan.price}</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>/{plan.period}</span>
                    </div>
                  )}
                </div>

                {/* Stars */}
                {plan.stars > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 14,
                    padding: "6px 10px", borderRadius: 8, background: "rgba(255,138,31,.07)", border: "1px solid rgba(255,138,31,.15)" }}>
                    <Flame style={{ width: 12, height: 12, color: gold, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: gold, fontWeight: 700 }}>{plan.stars.toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,138,31,.6)" }}>{plan.note}</span>
                  </div>
                )}

                {/* Key stats row */}
                {!isCustom && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                    {[["成员", `${plan.members}人`], ["并发", `${plan.concurrent}路`]].map(([l, v]) => (
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
                    <div key={p} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12,
                      color: "rgba(255,255,255,.5)", marginBottom: 7 }}>
                      <Check style={{ width: 12, height: 12, flexShrink: 0, color: plan.hot ? gold : "rgba(255,255,255,.3)" }} />
                      {p}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button onClick={() => buyPlan(plan.name)}
                  disabled={isCurrent}
                  style={{ width: "100%", padding: "10px 0", borderRadius: 11, fontSize: 13, fontWeight: 700,
                    cursor: isCurrent ? "default" : "pointer", transition: "all .18s", border: "none",
                    ...(isCurrent
                      ? { background: "rgba(255,138,31,.1)", color: "rgba(255,138,31,.5)" }
                      : isCustom
                        ? { background: "rgba(168,85,247,.15)", border: "1px solid rgba(168,85,247,.3)", color: "#c084fc" }
                        : plan.hot
                          ? { background: gold, color: "black", boxShadow: `0 4px 20px rgba(255,138,31,.4)` }
                          : { background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.75)" }) }}>
                  {isCurrent ? "当前套餐" : isCustom ? "联系商务" : "立即升级"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Upgrade formula */}
        <div style={{ marginTop: 32, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "20px 28px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.45)", letterSpacing: "0.05em", marginBottom: 12, textTransform: "uppercase" as const }}>套餐升级计算公式</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.9 }}>
              <div><span style={{ color: gold, fontWeight: 600 }}>补款</span> = (新套餐价格 − 旧套餐价格) × 剩余天数 ÷ 30</div>
              <div><span style={{ color: "#34d399", fontWeight: 600 }}>补发星石</span> = (新套餐星石 − 旧套餐星石) × 剩余天数 ÷ 30</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 6 }}>到期日不变 · 成员上限和并发立即生效</div>
            </div>
            <div style={{ background: "rgba(255,138,31,.06)", border: "1px solid rgba(255,138,31,.15)", borderRadius: 10, padding: "12px 16px", fontSize: 12, color: "rgba(255,255,255,.5)", lineHeight: 1.9 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: gold, marginBottom: 6 }}>示例：¥599 升级 ¥999，剩余 10 天</div>
              <div>补款：(999 − 599) × 10 ÷ 30 = <span style={{ color: gold, fontWeight: 600 }}>¥133.33</span></div>
              <div>补发：(8000 − 5000) × 10 ÷ 30 = <span style={{ color: "#34d399", fontWeight: 600 }}>1,000 星石</span></div>
              <div>成员上限 10 → 20 人 · 并发 12 → 20 路</div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "rgba(255,255,255,.25)", lineHeight: 1.8 }}>
          升级后，差价按剩余天数折算 · 付费星石不过期，随账号永久保留<br />
          所有套餐均含全创作模式访问权限 · 如需发票请在账单页申请
        </div>
      </div>
    </div>
  );
}

// ─── BillingPage ──────────────────────────────────────────────────────────────
function BillingPage({ navigate }: Nav) {
  type BillRecord = { id: string; type: string; model: string; frozen: number; actual: number; refund: number; balance: number; time: string; amount?: number };
  const [tab, setTab] = useState("全部");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [invoiceTax, setInvoiceTax] = useState("");
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [invoiceDone, setInvoiceDone] = useState(false);

  const ALL_RECORDS: BillRecord[] = [
    { id: TASK.id,               type: "视频生成", model: TASK.model,          frozen: 18.55, actual: 18.22, refund: 0.33, balance: 2486.0,  time: "2026-08-21 10:52" },
    { id: "TASK-20260821-1045",  type: "视频生成", model: "Seedance 2.0 Fast", frozen: 22.10, actual: 22.10, refund: 0,    balance: 2504.22, time: "2026-08-21 10:45" },
    { id: "TASK-20260821-1032",  type: "视频生成", model: "Seedance 2.0 Fast", frozen: 19.80, actual: 19.40, refund: 0.40, balance: 2526.32, time: "2026-08-21 10:32" },
    { id: "ORDER-20260821-001",  type: "套餐购买", model: "星轨小队",          frozen: 0,     actual: 0,     refund: 0,    balance: 2545.72, time: "2026-08-21 09:00", amount: 299 },
    { id: "ORDER-20260715-003",  type: "套餐购买", model: "星轨入门",          frozen: 0,     actual: 0,     refund: 0,    balance: 5624.72, time: "2026-07-15 14:30", amount: 99  },
    { id: "ORDER-20260601-011",  type: "星石充值", model: "自定义充值",         frozen: 0,     actual: 0,     refund: 0,    balance: 5524.72, time: "2026-06-01 10:00", amount: 200 },
    { id: "TASK-20260820-2240",  type: "视频生成", model: "Wan 2.1 I2V",          frozen: 15.60, actual: 15.60, refund: 0,    balance: 5324.72, time: "2026-08-20 22:40" },
    { id: "TASK-20260820-1818",  type: "图片生成", model: "Flux 1.1 Pro",          frozen: 4.20,  actual: 4.00,  refund: 0.20, balance: 5340.32, time: "2026-08-20 18:18" },
    { id: "TASK-20260819-0955",  type: "视频生成", model: "Seedance 2.0 Fast",    frozen: 21.30, actual: 21.30, refund: 0,    balance: 5344.32, time: "2026-08-19 09:55" },
  ];

  const isOrder = (r: BillRecord) => r.id.startsWith("ORDER");
  const filtered = ALL_RECORDS.filter(r => {
    if (tab === "实际消耗")  return !isOrder(r);
    if (tab === "充值与订单") return isOrder(r);
    if (tab === "退回")      return r.refund > 0;
    return true;
  });
  const orderRows = filtered.filter(isOrder);
  const allOrderIds = orderRows.map(r => r.id);
  const selectedOrders = allOrderIds.filter(id => selectedIds.has(id));
  const invoiceAmount = ALL_RECORDS.filter(r => selectedIds.has(r.id)).reduce((s, r) => s + (r.amount ?? 0), 0);
  const showCheckbox = tab === "充值与订单" || tab === "全部";

  const toggleRow = (id: string) => setSelectedIds(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const toggleAll = () => {
    if (selectedOrders.length === allOrderIds.length) {
      setSelectedIds(prev => { const n = new Set(prev); allOrderIds.forEach(id => n.delete(id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); allOrderIds.forEach(id => n.add(id)); return n; });
    }
  };

  const exportCSV = () => {
    const headers = ["ID","类型","模型/套餐","预计冻结","实际结算","退回","余额","时间","金额(元)"];
    const rows = filtered.map(r => [r.id, r.type, r.model, r.frozen || "—", r.actual || "—", r.refund || "—", r.balance, r.time, r.amount ?? "—"].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = `账单_${tab}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const submitInvoice = () => setInvoiceDone(true);

  const iStyle = { width: "100%", background: "rgba(255,255,255,.05)", border: `1px solid ${bdr}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "white", outline: "none", fontFamily: "inherit", boxSizing: "border-box" } as const;
  const labelS = { fontSize: 11, color: textMuted, marginBottom: 4, display: "block" } as const;

  return (
    <div style={{ padding: 24, maxWidth: 1080, margin: "0 auto", position: "relative" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: textMuted, marginBottom: 16 }}>
        <button onClick={() => navigate("delivery")} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer" }}>下载交付</button>
        <ChevronRight style={{ width: 13, height: 13 }} />
        <span style={{ color: "rgba(255,255,255,.7)", fontWeight: 500 }}>消耗账单</span>
      </div>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 20 }}>账单与消耗</h1>

      {/* Compact summary row: stars + 7-day sparkline */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: surface, border: `1px solid ${bdr}`, borderRadius: 12, padding: "14px 20px", marginBottom: 16, boxShadow: cardShadow }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: gold }}>{USER.paidStars.toLocaleString()}</span>
          <span style={{ fontSize: 11, color: textMuted }}>付费星石</span>
        </div>
        <div style={{ width: 1, height: 20, background: bdr }} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,138,31,.55)" }}>{USER.activeStars}</span>
          <span style={{ fontSize: 11, color: textMuted }}>活动星石</span>
          <span style={{ fontSize: 10, color: "rgba(251,191,36,.65)", marginLeft: 2 }}>{USER.activeStarsExpiry}</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: textMuted, marginRight: 6 }}>近7天消耗</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32 }}>
          {[320,480,240,560,380,420,291].map((v, i) => (
            <div key={i} style={{ width: 16, borderRadius: 3, background: i === 3 ? gold : "rgba(255,138,31,0.2)", height: `${(v/560)*28}px` }} />
          ))}
        </div>
      </div>

      {/* Tabs + toolbar */}
      <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${bdr}`, marginBottom: 0 }}>
        <div style={{ display: "flex", flex: 1 }}>
          {["全部","实际消耗","充值与订单","退回"].map(t => (
            <button key={t} onClick={() => { setTab(t); setSelectedIds(new Set()); }} style={{ padding: "10px 18px", fontSize: 13, background: "none", border: "none", cursor: "pointer", transition: "all .2s",
              ...(tab === t ? { borderBottom: `2px solid ${gold}`, color: gold, fontWeight: 600 } : { color: textMuted }) }}>{t}</button>
          ))}
        </div>
        {/* Toolbar: invoice + export */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8 }}>
          {selectedOrders.length > 0 && (
            <span style={{ fontSize: 12, color: textMuted }}>已选 <b style={{ color: gold }}>{selectedOrders.length}</b> 条</span>
          )}
          <button onClick={() => { setInvoiceDone(false); setInvoiceOpen(true); }}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: "rgba(255,138,31,.10)", border: "1px solid rgba(255,138,31,.28)", color: gold }}>
            <FileText style={{ width: 12, height: 12 }} />开具发票
          </button>
          <button onClick={exportCSV}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 13px", borderRadius: 7, fontSize: 12, cursor: "pointer",
              background: "rgba(255,255,255,.05)", border: `1px solid ${bdr}`, color: textMuted }}>
            <Download style={{ width: 11, height: 11 }} />导出
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: surface, border: `1px solid ${bdr}`, borderTop: "none", borderRadius: "0 0 16px 16px", overflow: "hidden", boxShadow: cardShadow }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "rgba(255,255,255,.02)", borderBottom: `1px solid ${bdr}` }}>
            <tr>
              {showCheckbox && (
                <th style={{ padding: "11px 14px", width: 36 }}>
                  <input type="checkbox" checked={allOrderIds.length > 0 && selectedOrders.length === allOrderIds.length}
                    ref={(el: HTMLInputElement | null) => { if (el) el.indeterminate = selectedOrders.length > 0 && selectedOrders.length < allOrderIds.length; }}
                    onChange={toggleAll} style={{ cursor: "pointer", accentColor: gold, width: 14, height: 14 }} />
                </th>
              )}
              {["任务/订单ID","类型","模型/套餐","预计冻结","实际结算","退回","余额","时间","金额"].map(h => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 500, color: textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const selectable = isOrder(r) && showCheckbox;
              const checked = selectedIds.has(r.id);
              return (
                <tr key={r.id} onClick={() => selectable && toggleRow(r.id)}
                  style={{ borderBottom: `1px solid rgba(255,255,255,.03)`, cursor: selectable ? "pointer" : "default",
                    background: checked ? "rgba(255,138,31,.04)" : "transparent", transition: "background .1s" }}>
                  {showCheckbox && (
                    <td style={{ padding: "11px 14px" }}>
                      {selectable && <input type="checkbox" checked={checked} onChange={() => toggleRow(r.id)}
                        onClick={e => e.stopPropagation()} style={{ cursor: "pointer", accentColor: gold, width: 14, height: 14 }} />}
                    </td>
                  )}
                  <td style={{ padding: "11px 14px" }}>
                    <button onClick={e => { e.stopPropagation(); if (!isOrder(r)) navigate("result"); }}
                      style={{ fontSize: 11, fontFamily: "monospace", color: isOrder(r) ? textMuted : "#60a5fa", background: "none", border: "none", cursor: isOrder(r) ? "default" : "pointer" }}>{r.id}</button>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: textDim }}>{r.type}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: textMuted }}>{r.model}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: textMuted }}>{r.frozen > 0 ? r.frozen : "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "rgba(255,255,255,.75)" }}>{r.actual > 0 ? r.actual : r.actual < 0 ? <span style={{ color: "#34d399" }}>+{Math.abs(r.actual)}</span> : "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "#34d399" }}>{r.refund > 0 ? `+${r.refund}` : "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "rgba(255,255,255,.65)" }}>{r.balance.toLocaleString()}</td>
                  <td style={{ padding: "11px 14px", fontSize: 11, color: textMuted }}>{r.time}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: r.amount ? gold : textMuted, fontWeight: r.amount ? 600 : 400 }}>
                    {r.amount ? `¥${r.amount}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Invoice modal ───────────────────────────────────────────────────── */}
      {invoiceOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)" }}
          onClick={() => setInvoiceOpen(false)}>
          <div style={{ width: 480, background: "#111318", border: `1px solid ${bdr}`, borderRadius: 16,
            boxShadow: "0 32px 96px rgba(0,0,0,.8)", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>开具发票</div>
                <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>已选 {selectedOrders.length} 笔订单 · 开票金额 <span style={{ color: gold, fontWeight: 700 }}>¥{invoiceAmount}</span></div>
              </div>
              <button onClick={() => setInvoiceOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, padding: 4 }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {invoiceDone ? (
              /* Success state */
              <div style={{ padding: "48px 32px", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(52,211,153,.12)", border: "1px solid rgba(52,211,153,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Check style={{ width: 24, height: 24, color: "#34d399" }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 6 }}>申请已提交</div>
                <div style={{ fontSize: 13, color: textMuted, lineHeight: 1.7, marginBottom: 24 }}>
                  发票将在 3-5 个工作日内发送至<br /><span style={{ color: textDim }}>{invoiceEmail || "您的邮箱"}</span>
                </div>
                <button onClick={() => setInvoiceOpen(false)}
                  style={{ padding: "8px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: "rgba(255,255,255,.06)", border: `1px solid ${bdr}`, color: textDim }}>关闭</button>
              </div>
            ) : (
              /* Form */
              <div style={{ padding: "22px 22px 0" }}>
                {/* Invoice type — 增值税普通发票 only */}
                <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: gold, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,.75)", fontWeight: 500 }}>增值税普通发票</span>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelS}>发票抬头 <span style={{ color: "#f87171" }}>*</span></label>
                  <input value={invoiceTitle} onChange={e => setInvoiceTitle(e.target.value)} placeholder="公司名称或个人姓名" style={iStyle} />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelS}>接收邮箱 <span style={{ color: "#f87171" }}>*</span></label>
                  <input value={invoiceEmail} onChange={e => setInvoiceEmail(e.target.value)} placeholder="发票将发送至此邮箱" style={iStyle} />
                </div>

                {/* Selected order summary */}
                <div style={{ background: "rgba(255,255,255,.025)", border: `1px solid ${bdr}`, borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: textMuted, marginBottom: 8, fontWeight: 600 }}>开票明细</div>
                  {ALL_RECORDS.filter(r => selectedIds.has(r.id)).map(r => (
                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: `1px solid rgba(255,255,255,.04)` }}>
                      <span style={{ color: textDim }}>{r.model} <span style={{ color: textMuted, fontSize: 11 }}>({r.time.slice(0,10)})</span></span>
                      <span style={{ color: gold, fontWeight: 600 }}>¥{r.amount}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingTop: 8, marginTop: 2 }}>
                    <span style={{ color: textDim, fontWeight: 600 }}>合计</span>
                    <span style={{ color: gold, fontWeight: 700 }}>¥{invoiceAmount}</span>
                  </div>
                </div>

                <div style={{ padding: "0 0 22px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => setInvoiceOpen(false)}
                    style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "rgba(255,255,255,.05)", border: `1px solid ${bdr}`, color: textMuted }}>取消</button>
                  <button onClick={submitInvoice} disabled={!invoiceTitle || !invoiceEmail}
                    style={{ padding: "9px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                      background: !invoiceTitle || !invoiceEmail ? "rgba(255,138,31,.3)" : `linear-gradient(135deg,${gold},#FF6A1A)`,
                      border: "none", color: "white", opacity: !invoiceTitle || !invoiceEmail ? .5 : 1 }}>
                    提交申请
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ─── TeamAssetsPage ───────────────────────────────────────────────────────────
function TeamAssetsPage({ navigate, from, initialSelProj }: Nav & { from?: PageId; initialSelProj?: string }) {
  type AssetTab = "chars"|"scenes"|"props"|"audio";

  const [selProj,     setSelProj]     = useState<string|null>(initialSelProj ?? null);
  const [assetTab,    setAssetTab]    = useState<AssetTab>("chars");
  const [permOpen,    setPermOpen]    = useState<string|null>(null);
  const [visibility,  setVisibility]  = useState<Record<string,Set<string>>>({});
  const [editMenuId,  setEditMenuId]  = useState<string|null>(null);
  const [deleteTarget,setDeleteTarget]= useState<{id:string;name:string}|null>(null);
  const [deletedIds,  setDeletedIds]  = useState<Set<string>>(new Set());
  const [editItem,    setEditItem]    = useState<{id:string;name:string;desc:string}|null>(null);
  const [editName,    setEditName]    = useState("");
  const [editDesc,    setEditDesc]    = useState("");

  type Comp = "pass"|"review"|"generating"|"failed"|"empty";
  type DView = "front"|"side"|"back"|"outfit"|"detail";
  const [selItem, setSelItem] = useState<AssetItem|null>(null);
  const [dView, setDView] = useState<DView>("front");
  const [histIdx, setHistIdx] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [genModel, setGenModel] = useState("Flux 1.1 Pro");
  const [genQuality, setGenQuality] = useState("高");
  const [genRes, setGenRes] = useState("4K");
  const [genRunning, setGenRunning] = useState(false);
  const [modalPrompt, setModalPrompt] = useState("");
  const [modalRatio, setModalRatio] = useState("16:9");
  const [modalStyle, setModalStyle] = useState("写实");
  const [modalExpand, setModalExpand] = useState(false);
  const [promptEditorOpen, setPromptEditorOpen] = useState(false);
  const [modalRemark, setModalRemark] = useState("");
  type CostumeVersion = { id: string; name: string; status: "none"|"generating"|"done"; thumb?: string };
  const [costumeVersions, setCostumeVersions] = useState<CostumeVersion[]>([
    { id:"cv1", name:"日常便装", status:"done" },
    { id:"cv2", name:"职业正装", status:"done" },
  ]);
  const addCostumeVersion = () => {
    const id = `cv${Date.now()}`;
    setCostumeVersions(prev => [...prev, { id, name:`造型 ${prev.length+1}`, status:"none" }]);
  };
  const genCostumeVersion = (id: string) => {
    setCostumeVersions(prev => prev.map(v => v.id===id ? { ...v, status:"generating" } : v));
    setTimeout(() => setCostumeVersions(prev => prev.map(v => v.id===id ? { ...v, status:"done" } : v)), 2000);
  };
  const toggleSel = (id:string) => setSelectedIds(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll = (ids:string[]) => setSelectedIds(prev=>prev.size===ids.length?new Set():new Set(ids));
  const ddSel = {background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,padding:"5px 10px",fontSize:12,color:"rgba(255,255,255,.8)",outline:"none",cursor:"pointer"} as const;

  const gold  = "#FF8A1F";
  const bdr   = "rgba(255,255,255,.08)";
  const dim   = "rgba(255,255,255,.45)";
  const card  = "#13151C";
  const green = "#10b981";

  const TEAM_MEMBERS = [
    { id:"u1", name:"林凯", role:"导演",   avatar:"林" },
    { id:"u2", name:"苏玫", role:"编剧",   avatar:"苏" },
    { id:"u3", name:"陈刚", role:"制片",   avatar:"陈" },
    { id:"u4", name:"王芳", role:"美术",   avatar:"王" },
    { id:"u5", name:"赵磊", role:"摄影",   avatar:"赵" },
  ];

  const PROJECTS = [
    { id:"p1", name:"镜像",       genre:"都市悬疑", color:"#FF8A1F", date:"2026-08-28", chars:5,  scenes:6,  props:3,  audioReady:true,  status:"active"   },
    { id:"p2", name:"星坠",       genre:"科幻冒险", color:"#a855f7", date:"2026-08-21", chars:3,  scenes:5,  props:6,  audioReady:true,  status:"active"   },
    { id:"p3", name:"归途",       genre:"现实主义", color:"#06b6d4", date:"2026-08-14", chars:2,  scenes:3,  props:2,  audioReady:false, status:"draft"    },
    { id:"p4", name:"长夜将尽",   genre:"历史古装", color:"#10b981", date:"2026-07-30", chars:14, scenes:18, props:24, audioReady:true,  status:"archived" },
  ];

  type AssetItem = { id:string; name:string; desc:string; status:"confirmed"|"pending"|"generating"|"failed"; count:number; image?:string; imageStyle?:string; historyImages?:string[] };
  const ASSET_DATA: Record<string, Record<AssetTab, AssetItem[]>> = {
    p1: {
      chars:[
        {id:"c1",name:"陈默",  desc:"女主角 · 内敛冷静 · 28岁",   status:"confirmed",  count:23, image:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&h=640&fit=crop&auto=format", historyImages:["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&h=1100&fit=crop&auto=format","https://images.unsplash.com/photo-1675726205553-4e348f24da2c?w=900&h=1100&fit=crop&auto=format"]},
        {id:"c2",name:"林凯",  desc:"男主角 · 温柔执着 · 30岁",   status:"confirmed",  count:18, image:"https://images.unsplash.com/photo-1570216601541-fa11cfaf03e5?w=480&h=640&fit=crop&auto=format", historyImages:["https://images.unsplash.com/photo-1570216601541-fa11cfaf03e5?w=900&h=1100&fit=crop&auto=format"]},
        {id:"c3",name:"方远",  desc:"反派 · 城府极深",             status:"generating", count:0 },
        {id:"c4",name:"警卫甲",desc:"配角 · 第3集出场",            status:"pending",    count:2 },
        {id:"c5",name:"神秘来客",desc:"待定 · 尚未定义",           status:"pending",    count:0 },
      ],
      scenes:[
        {id:"s1",name:"公司走廊",desc:"主要场景 · 冷色调大理石",   status:"confirmed",  count:34, image:"https://images.unsplash.com/photo-1679212839469-fb16a48919ce?w=480&h=640&fit=crop&auto=format", historyImages:["https://images.unsplash.com/photo-1679212839469-fb16a48919ce?w=1200&h=800&fit=crop&auto=format"]},
        {id:"s2",name:"天台",    desc:"关键场景 · 傍晚霞光",       status:"confirmed",  count:15, image:"https://images.unsplash.com/photo-1535391879778-3bae11d29a24?w=480&h=640&fit=crop&auto=format", historyImages:["https://images.unsplash.com/photo-1535391879778-3bae11d29a24?w=1200&h=800&fit=crop&auto=format"]},
        {id:"s3",name:"审讯室",  desc:"常用场景 · 室内灯光",       status:"generating", count:0 },
        {id:"s4",name:"咖啡厅",  desc:"次要场景 · 暖色调",         status:"pending",    count:8 },
        {id:"s5",name:"地铁站",  desc:"转场场景",                   status:"confirmed",  count:6 },
        {id:"s6",name:"陈默公寓",desc:"生活场景 · 极简风格",       status:"pending",    count:11},
      ],
      props:[
        {id:"p1",name:"手机",  desc:"道具 · 未接来电截图",         status:"confirmed",  count:31, imageStyle:"linear-gradient(145deg,#1a1a1a 0%,#2c2c2c 35%,#4a4a4a 60%,#333 100%)"},
        {id:"p2",name:"文件夹",desc:"道具 · 机密工作文件",         status:"pending",    count:7 },
        {id:"p3",name:"保险箱",desc:"道具 · 关键线索",             status:"failed",     count:0 },
      ],
      audio:[
        {id:"a1",name:"陈默·标准音色",desc:"女声 · 青年 · 知性冷静",  status:"confirmed",  count:1},
        {id:"a2",name:"林凯·标准音色",desc:"男声 · 青年 · 温柔低沉",  status:"confirmed",  count:1},
        {id:"a3",name:"旁白·画外音",  desc:"中性 · 叙述风格",          status:"pending",    count:0},
      ],
    },
    p2:{
      chars:[{id:"c1",name:"宁远",desc:"主角·宇航员",status:"confirmed",count:20},{id:"c2",name:"AI助手",desc:"虚拟角色",status:"confirmed",count:15}],
      scenes:[{id:"s1",name:"太空舱",desc:"主场景",status:"confirmed",count:40},{id:"s2",name:"星球表面",desc:"外景",status:"generating",count:0}],
      props:[{id:"p1",name:"量子芯片",desc:"核心道具",status:"pending",count:1},{id:"p2",name:"太空服",desc:"主角服装",status:"confirmed",count:8}],
      audio:[{id:"a1",name:"宁远音色",desc:"男声青年",status:"confirmed",count:1},{id:"a2",name:"AI合成音",desc:"机械感",status:"confirmed",count:1}],
    },
    p3:{
      chars:[{id:"c1",name:"何雨",desc:"主角",status:"confirmed",count:12},{id:"c2",name:"母亲",desc:"配角",status:"pending",count:5}],
      scenes:[{id:"s1",name:"迷雾森林",desc:"主场景",status:"pending",count:0},{id:"s2",name:"故乡小屋",desc:"记忆场景",status:"pending",count:0}],
      props:[{id:"p1",name:"旧信件",desc:"关键道具",status:"pending",count:3}],
      audio:[],
    },
    p4:{
      chars:[{id:"c1",name:"张小敬",desc:"主角·不良帅",status:"confirmed",count:55}],
      scenes:[{id:"s1",name:"长安坊市",desc:"主场景",status:"confirmed",count:80},{id:"s2",name:"皇宫",desc:"次要场景",status:"confirmed",count:20}],
      props:[{id:"p1",name:"烟花",desc:"关键道具",status:"confirmed",count:8},{id:"p2",name:"虎符",desc:"信物",status:"confirmed",count:4}],
      audio:[{id:"a1",name:"旁白音色",desc:"男声·沉稳",status:"confirmed",count:1}],
    },
  };

  const STATUS_CFG = {
    confirmed:  { label:"已确认", color:green,     bg:"rgba(16,185,129,.1)",  border:"rgba(16,185,129,.25)"  },
    pending:    { label:"待确认", color:gold,      bg:"rgba(255,138,31,.1)",  border:"rgba(255,138,31,.25)"  },
    generating: { label:"生成中", color:"#60a5fa", bg:"rgba(96,165,250,.1)",  border:"rgba(96,165,250,.25)"  },
    failed:     { label:"失败",   color:"#f87171", bg:"rgba(248,113,113,.1)", border:"rgba(248,113,113,.25)" },
  };

  const statusToComp = (s: AssetItem["status"]): Comp =>
    s==="confirmed"?"pass":s==="pending"?"empty":s;
  const compCfg: Record<Comp,{text:string;c:string;bg:string;border:string}> = {
    pass:       {text:"已确认",c:"#34d399",bg:"rgba(52,211,153,.1)",border:"rgba(52,211,153,.25)"},
    review:     {text:"审核中",c:"#fbbf24",bg:"rgba(251,191,36,.1)",border:"rgba(251,191,36,.25)"},
    generating: {text:"生成中",c:"#60a5fa",bg:"rgba(96,165,250,.1)",border:"rgba(96,165,250,.25)"},
    failed:     {text:"失败",  c:"#f87171",bg:"rgba(248,113,113,.1)",border:"rgba(248,113,113,.25)"},
    empty:      {text:"待确认",c:"#71717a",bg:"rgba(113,113,122,.1)",border:"rgba(113,113,122,.25)"},
  };
  const viewTabs = [{k:"front" as DView,l:"正面"},{k:"side" as DView,l:"侧面"},{k:"back" as DView,l:"背面"},{k:"outfit" as DView,l:"服装"},{k:"detail" as DView,l:"细节"}];
  const imgBg = "#09090f";

  // ── Voice / audio state ───────────────────────────────────────────────────
  type VTb = "system"|"custom";
  type VAge = "儿童"|"少年"|"青年"|"中年"|"老年";
  type VGender = "男"|"女";
  const [voiceOpen,    setVoiceOpen]    = useState(false);
  const [voiceTarget,  setVoiceTarget]  = useState("");
  const [voiceTab,     setVoiceTab]     = useState<VTb>("system");
  const [selVoice,     setSelVoice]     = useState<string|null>(null);
  const [voiceCreating,setVoiceCreating]= useState(false);
  const [cvName,       setCvName]       = useState("");
  const [cvGender,     setCvGender]     = useState<VGender>("女");
  const [cvAge,        setCvAge]        = useState<VAge>("青年");
  const [cvFile,       setCvFile]       = useState<string|null>(null);
  const [cvTraining,   setCvTraining]   = useState(false);
  const SYS_VOICES = [
    {id:"sv1",name:"晓辰", gender:"女" as VGender,age:"青年" as VAge,lang:"中文",tag:"温柔知性"},
    {id:"sv2",name:"云逸", gender:"男" as VGender,age:"青年" as VAge,lang:"中文",tag:"沉稳大气"},
    {id:"sv3",name:"小艾", gender:"女" as VGender,age:"少年" as VAge,lang:"中文",tag:"活泼清亮"},
    {id:"sv4",name:"Marcus",gender:"男" as VGender,age:"青年" as VAge,lang:"英文",tag:"专业播报"},
    {id:"sv5",name:"Echo", gender:"女" as VGender,age:"青年" as VAge,lang:"英文",tag:"自然流畅"},
    {id:"sv6",name:"墨渊", gender:"男" as VGender,age:"中年" as VAge,lang:"中文",tag:"磁性低沉"},
  ];
  const CUSTOM_VOICES = [
    {id:"uv1",name:"林凯专属",gender:"男" as VGender,age:"青年" as VAge,lang:"中文"},
  ];
  const AGE_OPTS_V: VAge[] = ["儿童","少年","青年","中年","老年"];
  const openVoice = (name:string) => {
    setVoiceTarget(name); setVoiceTab("system"); setSelVoice(null);
    setVoiceCreating(false); setCvName(""); setCvFile(null); setCvTraining(false);
    setVoiceOpen(true);
  };

  const toggleMember = (projId:string, uid:string) => {
    setVisibility(prev => {
      const cur = new Set(prev[projId] ?? TEAM_MEMBERS.map(m=>m.id));
      cur.has(uid) ? cur.delete(uid) : cur.add(uid);
      return { ...prev, [projId]: cur };
    });
  };
  const getProjVisible = (projId:string) => visibility[projId] ?? new Set(TEAM_MEMBERS.map(m=>m.id));

  // ─── PROJECT DETAIL VIEW ──────────────────────────────────────────────────
  if (selProj) {
    const proj  = PROJECTS.find(p=>p.id===selProj)!;
    const data  = ASSET_DATA[selProj] ?? { chars:[], scenes:[], props:[], audio:[] };
    const items = data[assetTab] ?? [];
    const visible = getProjVisible(selProj);

    return (
      <div style={{ padding:"20px 32px" }}>
        {/* Back */}
        <button
          onClick={()=>{ from === "new-project" ? navigate("new-project") : (setSelProj(null), setAssetTab("chars"), setPermOpen(null)); }}
          style={{ display:"flex",alignItems:"center",gap:6,marginBottom:20,background:"none",border:"none",
            color:dim,fontSize:13,cursor:"pointer",padding:"4px 0",transition:"color .15s" }}
          onMouseEnter={e=>e.currentTarget.style.color="white"}
          onMouseLeave={e=>e.currentTarget.style.color=dim}>
          <ChevronLeft style={{ width:15,height:15 }} />{from === "new-project" ? "返回新建剧目" : "返回团队资产"}
        </button>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:10,height:10,borderRadius:"50%",background:proj.color }} />
            <div>
              <h1 style={{ fontSize:20,fontWeight:800,color:"white",marginBottom:3 }}>{proj.name}</h1>
              <div style={{ display:"flex",gap:12,fontSize:12,color:dim }}>
                <span>{proj.genre}</span><span>·</span><span>更新于 {proj.date}</span>
                {proj.status==="archived"&&<span style={{ color:"rgba(255,255,255,.3)",background:"rgba(255,255,255,.06)",padding:"0 8px",borderRadius:20,border:"1px solid rgba(255,255,255,.1)" }}>已归档</span>}
              </div>
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:20 }}>
            {[{l:"角色",v:data.chars.length},{l:"场景",v:data.scenes.length},{l:"道具",v:data.props.length},{l:"声音",v:data.audio.length}].map(s=>(
              <div key={s.l} style={{ textAlign:"center" }}>
                <div style={{ fontSize:20,fontWeight:800,color:"white" }}>{s.v}</div>
                <div style={{ fontSize:11,color:dim }}>{s.l}</div>
              </div>
            ))}
            <div style={{ width:1,height:36,background:"rgba(255,255,255,.08)",flexShrink:0 }}/>
            <button onClick={()=>navigate("storyboard")} className="orange-btn"
              style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:11,fontSize:13,fontWeight:700,color:"black",border:"none",cursor:"pointer",flexShrink:0 }}>
              <Film style={{ width:14,height:14 }}/>
              进入分镜管理
            </button>
          </div>
        </div>

        {/* Permission panel */}
        <div style={{ background:card,border:`1px solid ${bdr}`,borderRadius:14,marginBottom:20,overflow:"hidden" }}>
          <button onClick={()=>setPermOpen(permOpen?null:selProj)}
            style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 18px",background:"none",border:"none",cursor:"pointer" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <Shield style={{ width:14,height:14,color:gold }} />
              <span style={{ fontSize:13,fontWeight:600,color:"rgba(255,255,255,.8)" }}>访问权限管理</span>
              <span style={{ fontSize:11,color:dim,marginLeft:4 }}>仅管理员可配置</span>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:12,color:dim }}>{visible.size} / {TEAM_MEMBERS.length} 成员可见</span>
              <ChevronDown style={{ width:13,height:13,color:dim,transform:permOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform .15s" }} />
            </div>
          </button>
          {permOpen && (
            <div style={{ borderTop:`1px solid ${bdr}`,padding:"14px 18px",display:"flex",flexWrap:"wrap",gap:10 }}>
              {TEAM_MEMBERS.map(m=>{
                const on = visible.has(m.id);
                return (
                  <button key={m.id} onClick={()=>toggleMember(selProj,m.id)}
                    style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:10,cursor:"pointer",transition:"all .15s",
                      background:on?"rgba(255,138,31,.1)":"rgba(255,255,255,.04)",
                      border:`1px solid ${on?"rgba(255,138,31,.3)":"rgba(255,255,255,.1)"}` }}>
                    <div style={{ width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:11,fontWeight:700,background:on?`${gold}22`:"rgba(255,255,255,.1)",color:on?gold:"rgba(255,255,255,.5)" }}>
                      {m.avatar}
                    </div>
                    <div style={{ textAlign:"left" }}>
                      <div style={{ fontSize:12.5,fontWeight:600,color:on?"white":"rgba(255,255,255,.55)" }}>{m.name}</div>
                      <div style={{ fontSize:10.5,color:dim }}>{m.role}</div>
                    </div>
                    {on&&<Check style={{ width:12,height:12,color:gold,flexShrink:0 }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Generation controls */}
        {(()=>{
          const visibleItems = items.filter(i=>!deletedIds.has(i.id));
          const allIds = visibleItems.map(i=>i.id);
          const allSel = selectedIds.size===allIds.length && allIds.length>0;
          return (<>
            <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:14,marginBottom:16,padding:"13px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" as const,rowGap:8}}>
                <span style={{fontSize:12,color:dim,whiteSpace:"nowrap" as const,marginRight:4}}>批量生成设置</span>
                <select value={genModel} onChange={e=>setGenModel(e.target.value)} style={ddSel}>
                  <option value="Flux 1.1 Pro">Flux 1.1 Pro</option>
                  <option value="SDXL Turbo">SDXL Turbo</option>
                  <option value="Stable Cascade">Stable Cascade</option>
                </select>
                <select value={genQuality} onChange={e=>setGenQuality(e.target.value)} style={ddSel}>
                  <option value="中">中画质</option>
                  <option value="高">高画质</option>
                </select>
                <select value={genRes} onChange={e=>setGenRes(e.target.value)} style={ddSel}>
                  <option value="2K">2K</option>
                  <option value="4K">4K</option>
                </select>
                <div style={{flex:1}}/>
                <button onClick={()=>{setGenRunning(true);setTimeout(()=>setGenRunning(false),3000);}}
                  className="orange-btn"
                  style={{display:"flex",alignItems:"center",gap:7,padding:"7px 16px",borderRadius:10,
                    fontSize:13,fontWeight:600,color:"black",border:"none",cursor:"pointer",flexShrink:0}}>
                  {genRunning
                    ?<><Loader2 style={{width:13,height:13,animation:"spin 1s linear infinite"}}/>生成中…</>
                    :<><Zap style={{width:13,height:13}}/>一键生成项目资产</>}
                </button>
              </div>
            </div>

            {/* Asset tabs + select-all row */}
            <div style={{display:"flex",alignItems:"center",borderBottom:`1px solid ${bdr}`,marginBottom:16}}>
              <div style={{display:"flex",flex:1}}>
                {([
                  {k:"chars"  as AssetTab,l:"角色",count:data.chars.length},
                  {k:"scenes" as AssetTab,l:"场景",count:data.scenes.length},
                  {k:"props"  as AssetTab,l:"道具",count:data.props.length},
                  {k:"audio"  as AssetTab,l:"声音配置",count:data.audio.length},
                ]).map(t=>(
                  <button key={t.k} onClick={()=>{setAssetTab(t.k);setSelectedIds(new Set());}}
                    style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",background:"none",border:"none",
                      borderBottom:`2px solid ${assetTab===t.k?gold:"transparent"}`,cursor:"pointer",
                      color:assetTab===t.k?gold:dim,fontSize:13,fontWeight:assetTab===t.k?600:400}}>
                    {t.l}
                    <span style={{fontSize:11,padding:"1px 7px",borderRadius:20,
                      background:assetTab===t.k?"rgba(255,138,31,.15)":"rgba(255,255,255,.06)",
                      color:assetTab===t.k?gold:dim}}>{t.count}</span>
                  </button>
                ))}
              </div>
              {/* Select all */}
              <button onClick={()=>toggleAll(allIds)}
                style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",marginBottom:-2,
                  fontSize:12,color:allSel?gold:dim,background:"none",border:"none",cursor:"pointer"}}>
                <div style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${allSel?gold:"rgba(255,255,255,.3)"}`,
                  background:allSel?"rgba(255,138,31,.2)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {allSel&&<Check style={{width:9,height:9,color:gold}}/>}
                </div>
                全选
              </button>
            </div>

            {/* ── Voice management tab ── */}
            {assetTab==="audio" ? (
              <div>
                {/* Section header */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:"white"}}>音色管理</div>
                    <div style={{fontSize:12,color:dim,marginTop:2}}>为项目角色分配或克隆专属音色</div>
                  </div>
                  <button onClick={()=>openVoice("")}
                    style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:10,
                      background:"rgba(255,255,255,.06)",border:`1px solid rgba(255,255,255,.1)`,
                      fontSize:12,color:"rgba(255,255,255,.75)",cursor:"pointer"}}>
                    <Plus style={{width:12,height:12}}/>克隆新音色
                  </button>
                </div>

                {/* System voices */}
                <div style={{fontSize:12,color:dim,fontWeight:500,marginBottom:8}}>系统音色</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10,marginBottom:20}}>
                  {SYS_VOICES.map(v=>(
                    <div key={v.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,
                      background:card,border:`1px solid ${bdr}`,transition:"border-color .12s"}}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,.15)"}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=bdr}>
                      <div style={{width:38,height:38,borderRadius:10,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                        background:v.gender==="女"?"rgba(244,114,182,.12)":"rgba(96,165,250,.12)"}}>
                        <Mic2 style={{width:16,height:16,color:v.gender==="女"?"#f472b6":"#60a5fa"}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                          <span style={{fontSize:13.5,fontWeight:600,color:"white"}}>{v.name}</span>
                          <span style={{fontSize:10,color:dim,background:"rgba(255,255,255,.06)",padding:"1px 6px",borderRadius:20}}>{v.tag}</span>
                        </div>
                        <div style={{fontSize:11,color:dim}}>{v.gender} · {v.age} · {v.lang}</div>
                      </div>
                      <button onClick={()=>openVoice(v.name)}
                        style={{padding:"5px 11px",borderRadius:8,fontSize:11,fontWeight:500,cursor:"pointer",flexShrink:0,
                          background:"rgba(255,138,31,.1)",border:"1px solid rgba(255,138,31,.25)",color:gold}}>
                        分配
                      </button>
                    </div>
                  ))}
                </div>

                {/* Custom voices */}
                <div style={{fontSize:12,color:dim,fontWeight:500,marginBottom:8}}>自定义音色</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {CUSTOM_VOICES.map(v=>(
                    <div key={v.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,
                      background:card,border:`1px solid ${bdr}`}}>
                      <div style={{width:38,height:38,borderRadius:10,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,138,31,.12)"}}>
                        <Mic2 style={{width:16,height:16,color:gold}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13.5,fontWeight:600,color:"white",marginBottom:2}}>{v.name}</div>
                        <div style={{fontSize:11,color:dim}}>{v.gender} · {v.age} · {v.lang}</div>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>openVoice(v.name)}
                          style={{padding:"5px 11px",borderRadius:8,fontSize:11,fontWeight:500,cursor:"pointer",
                            background:"rgba(255,138,31,.1)",border:"1px solid rgba(255,138,31,.25)",color:gold}}>
                          分配
                        </button>
                        <button style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",
                          background:"rgba(255,255,255,.05)",border:`1px solid rgba(255,255,255,.1)`,cursor:"pointer",color:dim}}>
                          <Trash2 style={{width:11,height:11}}/>
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>{openVoice("");setVoiceCreating(true);setVoiceTab("custom");}}
                    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"14px",
                      borderRadius:12,border:"2px dashed rgba(255,255,255,.1)",background:"transparent",
                      color:dim,fontSize:13,cursor:"pointer",transition:"all .15s"}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,138,31,.3)";(e.currentTarget as HTMLElement).style.color=gold;}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,.1)";(e.currentTarget as HTMLElement).style.color=dim;}}>
                    <Plus style={{width:16,height:16}}/>克隆新音色
                  </button>
                </div>
              </div>
            ) : (
            /* Asset card grid — 16:9 */
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
              {visibleItems.map(item=>{
                const comp = statusToComp(item.status);
                const cc = compCfg[comp];
                const hasImg = !!(item.image||item.imageStyle);
                const isSel = selectedIds.has(item.id);
                return (
                  <div key={item.id}
                    style={{border:`1px solid ${isSel?"rgba(255,138,31,.5)":bdr}`,borderRadius:14,overflow:"hidden",cursor:"pointer",
                      transition:"border-color .15s,box-shadow .15s",position:"relative",background:card,
                      boxShadow:isSel?"0 0 0 2px rgba(255,138,31,.2)":"none"}}
                    onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.borderColor="rgba(255,138,31,.35)";}}
                    onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.borderColor=bdr;}}>

                    {/* 16:9 image area */}
                    <div style={{aspectRatio:"16/9",position:"relative",overflow:"hidden",background:imgBg}}
                      onClick={()=>{if(selectedIds.size>0){toggleSel(item.id);}else{setSelItem(item);setDView("front");setHistIdx(0);setModalPrompt(item.desc?`${item.name}：${item.desc}`:item.name);setModalRemark("");}}}>
                      {item.image&&<img src={item.image} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>}
                      {item.imageStyle&&!item.image&&<div style={{width:"100%",height:"100%",background:item.imageStyle}}/>}
                      {!hasImg&&comp==="generating"&&(
                        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
                          <div style={{width:30,height:30,borderRadius:"50%",border:"2px solid rgba(96,165,250,.2)",borderTopColor:"#60a5fa",animation:"spin 1s linear infinite"}}/>
                          <span style={{fontSize:11,color:"#60a5fa",fontWeight:500}}>AI 生成中</span>
                        </div>
                      )}
                      {!hasImg&&comp==="failed"&&(
                        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
                          <AlertTriangle style={{width:14,height:14,color:"#f87171"}}/>
                          <span style={{fontSize:11,color:"#f87171",fontWeight:500}}>生成失败</span>
                        </div>
                      )}
                      {!hasImg&&comp==="empty"&&(
                        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                          <ImageIcon style={{width:18,height:18,color:"rgba(255,255,255,.18)"}}/>
                          <span style={{fontSize:10,color:dim}}>暂无图像</span>
                        </div>
                      )}
                      {hasImg&&<div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(9,10,14,.9) 0%,transparent 60%)",pointerEvents:"none"}}/>}

                      {/* Checkbox top-left */}
                      <div onClick={e=>{e.stopPropagation();toggleSel(item.id);}}
                        style={{position:"absolute",top:8,left:8,zIndex:3,width:18,height:18,borderRadius:5,
                          border:`1.5px solid ${isSel?gold:"rgba(255,255,255,.5)"}`,
                          background:isSel?"rgba(255,138,31,.25)":"rgba(0,0,0,.45)",
                          display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
                          transition:"all .12s"}}>
                        {isSel&&<Check style={{width:10,height:10,color:gold}}/>}
                      </div>

                      {/* Status badge top-right */}
                      <div style={{position:"absolute",top:8,right:8,zIndex:2}}>
                        <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:20,background:cc.bg,color:cc.c,border:`1px solid ${cc.border}`,display:"inline-flex",alignItems:"center",gap:3}}>
                          {comp==="generating"&&<Loader2 style={{width:8,height:8}}/>}
                          {cc.text}
                        </span>
                      </div>
                    </div>

                    {/* Card footer */}
                    <div style={{padding:"10px 14px 12px",display:"flex",alignItems:"center",gap:8}}
                      onClick={()=>{if(selectedIds.size>0){toggleSel(item.id);}else{setSelItem(item);setDView("front");setHistIdx(0);setModalPrompt(item.desc?`${item.name}：${item.desc}`:item.name);setModalRemark("");}}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:"white",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                        <div style={{fontSize:11,color:dim,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:2}}>{item.desc||"（暂无描述）"}</div>
                      </div>
                      {/* Individual actions */}
                      <div style={{display:"flex",gap:4,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                        {/* Edit button */}
                        <button title="编辑" onClick={()=>{setSelItem(item);setDView("front");setHistIdx(0);setModalPrompt(item.desc?`${item.name}：${item.desc}`:item.name);setModalRemark("");}}
                          style={{width:26,height:26,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,138,31,.08)",border:"1px solid rgba(255,138,31,.2)",cursor:"pointer",color:"rgba(255,138,31,.7)"}}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=gold;(e.currentTarget as HTMLElement).style.borderColor="rgba(255,138,31,.45)";}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color="rgba(255,138,31,.7)";(e.currentTarget as HTMLElement).style.borderColor="rgba(255,138,31,.2)";}}>
                          <PenLine style={{width:11,height:11}}/>
                        </button>
                        {assetTab==="chars"&&(
                          <button title="配置音色" onClick={()=>openVoice(item.name)}
                            style={{width:26,height:26,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,.06)",border:`1px solid rgba(255,255,255,.1)`,cursor:"pointer",color:dim}}
                            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color="#f472b6";(e.currentTarget as HTMLElement).style.borderColor="rgba(244,114,182,.35)";}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=dim;(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,.1)";}}>
                            <Mic2 style={{width:11,height:11}}/>
                          </button>
                        )}
                        <button title="下载"
                          style={{width:26,height:26,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,.06)",border:`1px solid rgba(255,255,255,.1)`,cursor:"pointer",color:dim}}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color="white";}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=dim;}}>
                          <Download style={{width:11,height:11}}/>
                        </button>
                        <button title="删除" onClick={()=>setDeleteTarget({id:item.id,name:item.name})}
                          style={{width:26,height:26,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,.06)",border:`1px solid rgba(255,255,255,.1)`,cursor:"pointer",color:dim}}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color="#f87171";(e.currentTarget as HTMLElement).style.borderColor="rgba(248,113,113,.3)";}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=dim;(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,.1)";}}>
                          <Trash2 style={{width:11,height:11}}/>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Add new */}
              <button
                style={{border:`2px dashed rgba(255,255,255,.1)`,borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",minHeight:140,background:"transparent",transition:"all .15s",color:dim}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,138,31,.3)";(e.currentTarget as HTMLElement).style.color=gold;}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,.1)";(e.currentTarget as HTMLElement).style.color=dim;}}>
                <Plus style={{width:20,height:20}}/>
                <span style={{fontSize:12,fontWeight:500}}>新增{{chars:"角色",scenes:"场景",props:"道具",audio:"声音配置"}[assetTab]}</span>
              </button>
            </div>
            )}

            {/* Batch action bar */}
            {selectedIds.size>0&&(
              <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",zIndex:400,
                display:"flex",alignItems:"center",gap:10,padding:"10px 16px",
                background:"#1A1B26",border:"1px solid rgba(255,255,255,.16)",borderRadius:16,
                boxShadow:"0 8px 32px rgba(0,0,0,.7)",backdropFilter:"blur(12px)"}}>
                <span style={{fontSize:13,color:"white",fontWeight:600,marginRight:4}}>已选 {selectedIds.size} 项</span>
                <button onClick={()=>setSelectedIds(new Set())}
                  style={{fontSize:12,color:dim,background:"none",border:"none",cursor:"pointer",padding:"4px 8px",borderRadius:8}}>
                  取消
                </button>
                <div style={{width:1,height:20,background:"rgba(255,255,255,.12)"}}/>
                <button style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:10,
                  fontSize:13,fontWeight:500,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.14)",
                  color:"rgba(255,255,255,.85)",cursor:"pointer"}}>
                  <Download style={{width:13,height:13}}/>批量下载
                </button>
                <button onClick={()=>{
                  setDeletedIds(prev=>{const n=new Set(prev);selectedIds.forEach(id=>n.add(id));return n;});
                  setSelectedIds(new Set());
                }} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:10,
                  fontSize:13,fontWeight:500,background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",
                  color:"#f87171",cursor:"pointer"}}>
                  <Trash2 style={{width:13,height:13}}/>批量删除
                </button>
              </div>
            )}
          </>);
        })()}

        {/* Detail modal */}
        {selItem&&(
          <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"stretch",background:"rgba(0,0,0,.82)",backdropFilter:"blur(20px)"}}
            onClick={e=>{if(e.target===e.currentTarget){setSelItem(null);setModalExpand(false);setPromptEditorOpen(false);}}}>
            <div style={{margin:"auto",width:"min(1280px,98vw)",height:"min(820px,96vh)",background:"#0C0D14",border:"1px solid rgba(255,255,255,.1)",borderRadius:22,display:"flex",overflow:"hidden",boxShadow:"0 40px 120px rgba(0,0,0,.9)",position:"relative"}}>

              {/* Close */}
              <button onClick={()=>{setSelItem(null);setModalExpand(false);setPromptEditorOpen(false);}}
                style={{position:"absolute",top:14,right:14,zIndex:20,width:30,height:30,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.55)",cursor:"pointer"}}>
                <X style={{width:14,height:14}}/>
              </button>

              {/* Left: image column — fills full height */}
              <div style={{width:"46%",flexShrink:0,background:imgBg,display:"flex",flexDirection:"column",overflow:"hidden",borderRight:"1px solid rgba(255,255,255,.07)"}}>
                {/* Main image — fills remaining space */}
                <div style={{flex:1,position:"relative",overflow:"hidden",minHeight:0}}>
                  {selItem.image&&<img src={selItem.image} alt={selItem.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>}
                  {selItem.imageStyle&&!selItem.image&&<div style={{width:"100%",height:"100%",background:selItem.imageStyle}}/>}
                  {!selItem.image&&!selItem.imageStyle&&(
                    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
                      <ImageIcon style={{width:36,height:36,color:"rgba(255,255,255,.12)"}}/>
                      <span style={{fontSize:13,color:dim}}>暂无图像</span>
                    </div>
                  )}
                  <div style={{position:"absolute",top:12,left:12,zIndex:2,background:"rgba(0,0,0,.55)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.14)",borderRadius:8,padding:"3px 10px",fontSize:11,color:"rgba(255,255,255,.8)",fontWeight:500}}>
                    当前主图
                  </div>
                  {(selItem.image||selItem.imageStyle)&&<div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 55%,rgba(9,10,14,.85) 100%)",pointerEvents:"none"}}/>}
                  {/* Name overlay at bottom */}
                  <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px 18px",zIndex:3}}>
                    <div style={{fontSize:22,fontWeight:800,color:"white",letterSpacing:"-0.02em",textShadow:"0 2px 12px rgba(0,0,0,.8)"}}>{selItem.name}</div>
                    <div style={{fontSize:12.5,color:"rgba(255,255,255,.5)",marginTop:3}}>{selItem.desc||"（暂无描述）"}</div>
                  </div>
                </div>

                {/* History strip */}
                <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:8,padding:"12px 16px",background:"rgba(0,0,0,.3)",borderTop:"1px solid rgba(255,255,255,.06)",overflowX:"auto"}}>
                  <span style={{fontSize:11,color:dim,flexShrink:0}}>历史</span>
                  {(selItem.historyImages??[]).length>0
                    ? (selItem.historyImages??[]).map((src,i)=>(
                        <button key={i} onClick={()=>setHistIdx(i)}
                          style={{flexShrink:0,padding:0,background:"none",border:`2px solid ${histIdx===i?gold:"rgba(255,255,255,.14)"}`,borderRadius:8,overflow:"hidden",cursor:"pointer",transition:"border-color .12s",width:80,height:52}}>
                          <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                        </button>
                      ))
                    : <span style={{fontSize:11,color:"rgba(255,255,255,.18)"}}>暂无历史记录</span>
                  }
                  <button style={{flexShrink:0,width:52,height:52,borderRadius:8,border:"1.5px dashed rgba(255,255,255,.14)",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:dim}}>
                    <Plus style={{width:14,height:14}}/>
                  </button>
                </div>
              </div>

              {/* Right: controls */}
              <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",padding:"24px 26px",gap:16,minWidth:0}}>

                {/* 人物命名 */}
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {/* Fixed system name — read-only */}
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"9px 12px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10}}>
                      <span style={{fontSize:10.5,color:dim,fontWeight:600,flexShrink:0}}>角色名</span>
                      <span style={{fontSize:14,fontWeight:800,color:"white",letterSpacing:"-0.01em"}}>{selItem.name}</span>
                      <span style={{marginLeft:4,fontSize:10,color:"rgba(255,255,255,.25)",background:"rgba(255,255,255,.06)",padding:"1px 7px",borderRadius:20,flexShrink:0}}>系统命名 · 不可修改</span>
                    </div>
                    <span style={{fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:20,flexShrink:0,
                      background:compCfg[statusToComp(selItem.status)].bg,
                      color:compCfg[statusToComp(selItem.status)].c,
                      border:`1px solid ${compCfg[statusToComp(selItem.status)].border}`}}>
                      {compCfg[statusToComp(selItem.status)].text}
                    </span>
                  </div>
                  {/* Editable remark */}
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10}}>
                    <span style={{fontSize:10.5,color:dim,fontWeight:600,flexShrink:0}}>备注</span>
                    <input value={modalRemark} onChange={e=>setModalRemark(e.target.value)}
                      placeholder="添加角色备注，如别名、简介…"
                      style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:13,color:"rgba(255,255,255,.8)",fontFamily:"inherit"}}/>
                    {modalRemark&&<button onClick={()=>setModalRemark("")} style={{background:"none",border:"none",cursor:"pointer",color:dim,padding:0}}>
                      <X style={{width:12,height:12}}/>
                    </button>}
                  </div>
                </div>

                {/* Prompt editor card */}
                <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.09)",borderRadius:14,overflow:"hidden",flexShrink:0}}>
                  <div style={{padding:"4px 12px 0",display:"flex",alignItems:"center",gap:6,borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                    <span style={{fontSize:11,color:dim,fontWeight:600,padding:"8px 0"}}>生成提示词</span>
                    <div style={{flex:1}}/>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.22)"}}>{modalPrompt.length} 字</span>
                    <button title="AI改写" style={{width:26,height:26,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,138,31,.1)",border:"1px solid rgba(255,138,31,.25)",cursor:"pointer",color:gold}}>
                      <Wand2 style={{width:11,height:11}}/>
                    </button>
                    <button title="展开编辑" onClick={()=>setPromptEditorOpen(true)}
                      style={{width:26,height:26,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",cursor:"pointer",color:"rgba(255,255,255,.7)"}}>
                      <Maximize2 style={{width:11,height:11}}/>
                    </button>
                  </div>
                  <textarea value={modalPrompt} onChange={e=>setModalPrompt(e.target.value)}
                    style={{width:"100%",background:"transparent",border:"none",padding:"12px 14px",fontSize:13,color:"rgba(255,255,255,.85)",outline:"none",resize:"none",lineHeight:1.8,fontFamily:"inherit",boxSizing:"border-box",height:140,display:"block"}}/>
                </div>

                {/* Reference images */}
                <div>
                  <div style={{fontSize:11.5,color:dim,fontWeight:600,marginBottom:8}}>参考图</div>
                  <div style={{display:"flex",gap:8,overflowX:"auto"}}>
                    {(selItem.historyImages??[]).length>0
                      ? (selItem.historyImages??[]).map((src,i)=>(
                          <img key={i} src={src} alt="" style={{width:80,height:54,borderRadius:8,objectFit:"cover",flexShrink:0,border:"1px solid rgba(255,255,255,.08)"}}/>
                        ))
                      : <div style={{height:54,display:"flex",alignItems:"center",fontSize:12,color:"rgba(255,255,255,.2)"}}>暂无参考图</div>
                    }
                    <button style={{width:54,height:54,borderRadius:8,flexShrink:0,border:"1.5px dashed rgba(255,255,255,.12)",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:dim}}>
                      <Plus style={{width:14,height:14}}/>
                    </button>
                  </div>
                </div>

                {/* 角色装造版本 */}
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontSize:11.5,color:dim,fontWeight:600}}>角色装造版本</span>
                    <span style={{fontSize:10.5,color:"rgba(255,255,255,.2)",background:"rgba(255,255,255,.05)",padding:"1px 8px",borderRadius:20}}>{costumeVersions.length}</span>
                    <div style={{flex:1}}/>
                    <button onClick={addCostumeVersion}
                      style={{display:"flex",alignItems:"center",gap:5,padding:"4px 11px",borderRadius:8,fontSize:11.5,cursor:"pointer",
                        background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:dim,transition:"all .12s"}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,138,31,.3)";(e.currentTarget as HTMLElement).style.color=gold;}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,.1)";(e.currentTarget as HTMLElement).style.color=dim;}}>
                      <Plus style={{width:11,height:11}}/>新增装造
                    </button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {costumeVersions.map(cv=>(
                      <div key={cv.id} style={{borderRadius:11,overflow:"hidden",border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.03)",position:"relative"}}>
                        {/* Thumbnail area — 16:9 */}
                        <div style={{aspectRatio:"16/9",position:"relative",overflow:"hidden",
                          background:cv.status==="done"
                            ? "linear-gradient(135deg,#1a1a2e,#2d1b4e,#1a1a2e)"
                            : "rgba(255,255,255,.03)"}}>
                          {cv.status==="done"&&(
                            <>
                              <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#1a1a2e,#2d1b4e,#0d0d1a)",opacity:.9}}/>
                              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <ImageIcon style={{width:18,height:18,color:"rgba(255,255,255,.15)"}}/>
                              </div>
                            </>
                          )}
                          {cv.status==="generating"&&(
                            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                              <div style={{width:22,height:22,borderRadius:"50%",border:"2px solid rgba(96,165,250,.2)",borderTopColor:"#60a5fa",animation:"spin 1s linear infinite"}}/>
                              <span style={{fontSize:9.5,color:"#60a5fa"}}>生成中…</span>
                            </div>
                          )}
                          {cv.status==="none"&&(
                            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}>
                              <ImageIcon style={{width:16,height:16,color:"rgba(255,255,255,.12)"}}/>
                              <span style={{fontSize:9.5,color:"rgba(255,255,255,.2)"}}>未生成</span>
                            </div>
                          )}
                          {/* Status badge */}
                          {cv.status==="done"&&(
                            <div style={{position:"absolute",top:5,left:6,fontSize:8.5,fontWeight:600,color:"rgba(52,211,153,.8)",background:"rgba(0,0,0,.4)",padding:"1px 6px",borderRadius:4}}>已生成</div>
                          )}
                        </div>
                        {/* Bottom bar */}
                        <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 9px"}}>
                          <span style={{flex:1,fontSize:11.5,fontWeight:600,color:"rgba(255,255,255,.8)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cv.name}</span>
                          <button onClick={()=>genCostumeVersion(cv.id)}
                            disabled={cv.status==="generating"}
                            style={{display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:7,fontSize:10.5,cursor:cv.status==="generating"?"not-allowed":"pointer",flexShrink:0,
                              background:cv.status==="done"?"rgba(255,255,255,.05)":"rgba(255,138,31,.1)",
                              border:`1px solid ${cv.status==="done"?"rgba(255,255,255,.1)":"rgba(255,138,31,.25)"}`,
                              color:cv.status==="done"?dim:gold}}>
                            <Zap style={{width:9,height:9}}/>
                            {cv.status==="done"?"重新生成":"生成"}
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Add slot */}
                    <button onClick={addCostumeVersion}
                      style={{aspectRatio:"auto",minHeight:80,borderRadius:11,border:"1.5px dashed rgba(255,255,255,.1)",background:"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,cursor:"pointer",color:dim,transition:"all .12s"}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,138,31,.3)";(e.currentTarget as HTMLElement).style.color=gold;}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,.1)";(e.currentTarget as HTMLElement).style.color=dim;}}>
                      <Plus style={{width:16,height:16}}/>
                      <span style={{fontSize:11}}>新增装造</span>
                    </button>
                  </div>
                </div>

                {/* Gen settings */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  <div>
                    <div style={{fontSize:10.5,color:dim,marginBottom:4,fontWeight:500}}>模型</div>
                    <select value={genModel} onChange={e=>setGenModel(e.target.value)} style={{...ddSel,width:"100%"}}>
                      <option value="Flux 1.1 Pro">Flux 1.1 Pro</option>
                      <option value="SDXL Turbo">SDXL Turbo</option>
                      <option value="Stable Cascade">Stable Cascade</option>
                    </select>
                  </div>
                  <div>
                    <div style={{fontSize:10.5,color:dim,marginBottom:4,fontWeight:500}}>画质</div>
                    <select value={genQuality} onChange={e=>setGenQuality(e.target.value)} style={{...ddSel,width:"100%"}}>
                      <option value="中">中画质</option>
                      <option value="高">高画质</option>
                    </select>
                  </div>
                  <div>
                    <div style={{fontSize:10.5,color:dim,marginBottom:4,fontWeight:500}}>分辨率</div>
                    <select value={genRes} onChange={e=>setGenRes(e.target.value)} style={{...ddSel,width:"100%"}}>
                      <option value="2K">2K</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                </div>

                <div style={{display:"flex",gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10.5,color:dim,marginBottom:4,fontWeight:500}}>比例</div>
                    <select value={modalRatio} onChange={e=>setModalRatio(e.target.value)} style={{...ddSel,width:"100%"}}>
                      {["1:1","4:3","16:9","3:4","9:16"].map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10.5,color:dim,marginBottom:4,fontWeight:500}}>风格</div>
                    <select value={modalStyle} onChange={e=>setModalStyle(e.target.value)} style={{...ddSel,width:"100%"}}>
                      {["写实","水墨","3D渲染","漫画"].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{flex:1}}/>

                {/* Generate button */}
                <button className="orange-btn"
                  style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                    padding:"13px",borderRadius:12,fontSize:14,fontWeight:700,color:"black",border:"none",cursor:"pointer",flexShrink:0}}>
                  <Zap style={{width:16,height:16}}/>
                  立即生成
                  <span style={{fontSize:12,fontWeight:400,opacity:.65,marginLeft:2}}>· 约 20 星石</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prompt full-screen editor */}
        {promptEditorOpen&&selItem&&(
          <div style={{position:"fixed",inset:0,zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.88)",backdropFilter:"blur(24px)"}}
            onClick={e=>{if(e.target===e.currentTarget)setPromptEditorOpen(false);}}>
            <div style={{width:"min(860px,94vw)",height:"min(600px,88vh)",background:"#0E0F16",border:"1px solid rgba(255,255,255,.12)",borderRadius:20,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 40px 120px rgba(0,0,0,.9)"}}>
              {/* Header */}
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 22px",borderBottom:"1px solid rgba(255,255,255,.07)",flexShrink:0}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:gold}}/>
                <span style={{fontSize:14,fontWeight:700,color:"white"}}>{selItem.name} · 提示词编辑</span>
                <div style={{flex:1}}/>
                <span style={{fontSize:12,color:dim}}>{modalPrompt.length} 字</span>
                <button title="AI改写" style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:8,background:"rgba(255,138,31,.1)",border:"1px solid rgba(255,138,31,.28)",cursor:"pointer",color:gold,fontSize:12,fontWeight:600}}>
                  <Wand2 style={{width:12,height:12}}/>AI 改写
                </button>
                <button onClick={()=>setPromptEditorOpen(false)}
                  style={{width:30,height:30,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.55)",cursor:"pointer"}}>
                  <X style={{width:14,height:14}}/>
                </button>
              </div>
              {/* Textarea */}
              <textarea value={modalPrompt} onChange={e=>setModalPrompt(e.target.value)}
                autoFocus
                placeholder="在此输入或编辑生成提示词…"
                style={{flex:1,background:"transparent",border:"none",padding:"22px 26px",fontSize:15,color:"rgba(255,255,255,.9)",outline:"none",resize:"none",lineHeight:1.85,fontFamily:"inherit",boxSizing:"border-box"}}/>
              {/* Footer */}
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 22px",borderTop:"1px solid rgba(255,255,255,.07)",flexShrink:0}}>
                <select value={modalRatio} onChange={e=>setModalRatio(e.target.value)} style={{...ddSel,fontSize:12}}>
                  {["1:1","4:3","16:9","3:4","9:16"].map(r=><option key={r} value={r}>{r}</option>)}
                </select>
                <select value={modalStyle} onChange={e=>setModalStyle(e.target.value)} style={{...ddSel,fontSize:12}}>
                  {["写实","水墨","3D渲染","漫画"].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <div style={{flex:1}}/>
                <button onClick={()=>setPromptEditorOpen(false)}
                  style={{padding:"8px 20px",borderRadius:9,fontSize:13,cursor:"pointer",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",color:dim}}>
                  取消
                </button>
                <button onClick={()=>setPromptEditorOpen(false)} className="orange-btn"
                  style={{padding:"8px 24px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",color:"black",border:"none"}}>
                  保存并关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Voice modal */}
        {voiceOpen&&(
          <div style={{position:"fixed",inset:0,zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.75)",backdropFilter:"blur(10px)"}}
            onClick={e=>{if(e.target===e.currentTarget){setVoiceOpen(false);setVoiceCreating(false);}}}>
            <div style={{width:"min(560px,92vw)",background:"#0e0c1a",border:"1px solid rgba(255,255,255,.1)",borderRadius:22,padding:"24px",display:"flex",flexDirection:"column",gap:16,maxHeight:"80vh",overflowY:"auto"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <h3 style={{fontSize:15,fontWeight:700,color:"white",margin:0}}>配置音色</h3>
                  <div style={{fontSize:12,color:dim,marginTop:2}}>{voiceTarget||"音色管理"}</div>
                </div>
                <button onClick={()=>{setVoiceOpen(false);setVoiceCreating(false);}}
                  style={{background:"none",border:"none",color:dim,cursor:"pointer",display:"flex"}}>
                  <X style={{width:16,height:16}}/>
                </button>
              </div>
              {/* Tabs */}
              <div style={{display:"flex",gap:6}}>
                {(["system","custom"] as VTb[]).map(vt=>(
                  <button key={vt} onClick={()=>{setVoiceTab(vt);setVoiceCreating(false);setSelVoice(null);}}
                    style={{flex:1,padding:"8px",borderRadius:10,fontSize:13,fontWeight:500,cursor:"pointer",
                      background:voiceTab===vt?"rgba(255,138,31,.12)":"rgba(255,255,255,.05)",
                      border:`1px solid ${voiceTab===vt?"rgba(255,138,31,.35)":"rgba(255,255,255,.1)"}`,
                      color:voiceTab===vt?gold:"rgba(255,255,255,.5)"}}>
                    {vt==="system"?"系统音色":"自定义音色"}
                  </button>
                ))}
              </div>
              {/* System voices */}
              {voiceTab==="system"&&(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {SYS_VOICES.map(v=>(
                    <button key={v.id} onClick={()=>setSelVoice(v.id)}
                      style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,cursor:"pointer",textAlign:"left",
                        background:selVoice===v.id?"rgba(255,138,31,.08)":"rgba(255,255,255,.04)",
                        border:`1px solid ${selVoice===v.id?"rgba(255,138,31,.3)":"rgba(255,255,255,.08)"}`}}>
                      <div style={{width:36,height:36,borderRadius:10,background:v.gender==="女"?"rgba(244,114,182,.15)":"rgba(96,165,250,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Mic2 style={{width:16,height:16,color:v.gender==="女"?"#f472b6":"#60a5fa"}}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                          <span style={{fontSize:13.5,fontWeight:600,color:"white"}}>{v.name}</span>
                          <span style={{fontSize:10.5,color:dim,background:"rgba(255,255,255,.06)",padding:"1px 7px",borderRadius:20}}>{v.tag}</span>
                        </div>
                        <div style={{fontSize:11,color:dim}}>{v.gender} · {v.age} · {v.lang}</div>
                      </div>
                      {selVoice===v.id&&<Check style={{width:14,height:14,color:gold,flexShrink:0}}/>}
                    </button>
                  ))}
                </div>
              )}
              {/* Custom voices list */}
              {voiceTab==="custom"&&!voiceCreating&&(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {CUSTOM_VOICES.map(v=>(
                    <button key={v.id} onClick={()=>setSelVoice(v.id)}
                      style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,cursor:"pointer",textAlign:"left",
                        background:selVoice===v.id?"rgba(255,138,31,.08)":"rgba(255,255,255,.04)",
                        border:`1px solid ${selVoice===v.id?"rgba(255,138,31,.3)":"rgba(255,255,255,.08)"}`}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,138,31,.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Mic2 style={{width:16,height:16,color:gold}}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13.5,fontWeight:600,color:"white",marginBottom:3}}>{v.name}</div>
                        <div style={{fontSize:11,color:dim}}>{v.gender} · {v.age} · {v.lang}</div>
                      </div>
                      {selVoice===v.id&&<Check style={{width:14,height:14,color:gold,flexShrink:0}}/>}
                    </button>
                  ))}
                  <button onClick={()=>setVoiceCreating(true)}
                    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"10px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"2px dashed rgba(255,255,255,.1)",color:dim,fontSize:13,cursor:"pointer"}}>
                    <Plus style={{width:14,height:14}}/>克隆新音色
                  </button>
                </div>
              )}
              {/* Clone new voice form */}
              {voiceTab==="custom"&&voiceCreating&&(
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <input value={cvName} onChange={e=>setCvName(e.target.value)} placeholder="音色名称"
                    style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"9px 12px",fontSize:13,color:"white",outline:"none"}}/>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
                    {(["男","女"] as VGender[]).map(g=>(
                      <button key={g} onClick={()=>setCvGender(g)}
                        style={{flex:1,padding:"7px",borderRadius:9,fontSize:13,fontWeight:500,cursor:"pointer",
                          background:cvGender===g?"rgba(255,138,31,.12)":"rgba(255,255,255,.05)",
                          border:`1px solid ${cvGender===g?"rgba(255,138,31,.35)":"rgba(255,255,255,.1)"}`,
                          color:cvGender===g?gold:"rgba(255,255,255,.5)"}}>
                        {g}
                      </button>
                    ))}
                    {AGE_OPTS_V.map(a=>(
                      <button key={a} onClick={()=>setCvAge(a)}
                        style={{flex:1,padding:"7px",borderRadius:9,fontSize:11,fontWeight:500,cursor:"pointer",
                          background:cvAge===a?"rgba(255,138,31,.12)":"rgba(255,255,255,.05)",
                          border:`1px solid ${cvAge===a?"rgba(255,138,31,.35)":"rgba(255,255,255,.1)"}`,
                          color:cvAge===a?gold:"rgba(255,255,255,.5)"}}>
                        {a}
                      </button>
                    ))}
                  </div>
                  <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"24px",borderRadius:12,cursor:"pointer",
                    background:"rgba(255,255,255,.03)",border:`2px dashed ${cvFile?"rgba(255,138,31,.4)":"rgba(255,255,255,.1)"}`,color:cvFile?gold:dim,fontSize:13}}>
                    <input type="file" accept="audio/*" style={{display:"none"}} onChange={e=>setCvFile(e.target.files?.[0]?.name??null)}/>
                    <Mic2 style={{width:16,height:16}}/>
                    {cvFile?cvFile:"上传音频样本（10–60 秒）"}
                  </label>
                  {cvTraining&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#60a5fa"}}>
                      <Loader2 style={{width:14,height:14,animation:"spin 1s linear infinite"}}/>训练中，约需 2 分钟…
                    </div>
                  )}
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setVoiceCreating(false)}
                      style={{flex:1,padding:"9px",borderRadius:10,fontSize:13,color:dim,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",cursor:"pointer"}}>
                      取消
                    </button>
                    <button onClick={()=>{if(cvFile&&cvName)setCvTraining(true);}} disabled={!cvFile||!cvName}
                      className="orange-btn"
                      style={{flex:2,padding:"9px",borderRadius:10,fontSize:13,fontWeight:600,color:"black",border:"none",cursor:"pointer",opacity:cvFile&&cvName?1:.4}}>
                      开始克隆
                    </button>
                  </div>
                </div>
              )}
              {/* Apply */}
              {!voiceCreating&&(
                <button onClick={()=>{setVoiceOpen(false);setVoiceCreating(false);}} disabled={!selVoice}
                  className="orange-btn"
                  style={{padding:"11px",borderRadius:12,fontSize:14,fontWeight:600,color:"black",border:"none",cursor:"pointer",opacity:selVoice?1:.4}}>
                  应用音色
                </button>
              )}
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {deleteTarget&&(
          <div style={{position:"fixed",inset:0,zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.55)"}}
            onClick={()=>setDeleteTarget(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:"#1a1726",border:"1px solid rgba(255,255,255,.12)",borderRadius:18,padding:"28px 32px",width:340,boxShadow:"0 20px 60px rgba(0,0,0,.7)"}}>
              <div style={{width:44,height:44,borderRadius:12,background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.2)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
                <Trash2 style={{width:20,height:20,color:"#f87171"}}/>
              </div>
              <h3 style={{fontSize:16,fontWeight:700,color:"white",marginBottom:6}}>确认删除</h3>
              <p style={{fontSize:13,color:"rgba(255,255,255,.55)",lineHeight:1.7,marginBottom:22}}>
                删除资产「{deleteTarget.name}」后不可恢复，关联的引用将会失效。确认继续？
              </p>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setDeleteTarget(null)}
                  style={{flex:1,padding:"9px",borderRadius:11,fontSize:13,fontWeight:500,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.7)",cursor:"pointer"}}>
                  取消
                </button>
                <button onClick={()=>{setDeletedIds(p=>{const n=new Set(p);n.add(deleteTarget.id);return n;});setDeleteTarget(null);}}
                  style={{flex:1,padding:"9px",borderRadius:11,fontSize:13,fontWeight:700,background:"rgba(248,113,113,.18)",border:"1px solid rgba(248,113,113,.3)",color:"#f87171",cursor:"pointer"}}>
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── PROJECT LIST VIEW ────────────────────────────────────────────────────
  return (
    <div style={{ padding:"24px 28px", maxWidth:1100, margin:"0 auto" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:20,fontWeight:800,color:"white",marginBottom:4 }}>团队资产</h1>
          <p style={{ fontSize:13,color:dim }}>管理团队共享资产：角色、场景、道具（共三类，独立团队钱包）</p>
        </div>
        <button
          style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:12,fontSize:13,fontWeight:600,
            background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",
            backdropFilter:"blur(12px)",color:"rgba(255,255,255,.85)",cursor:"pointer" }}>
          <Plus style={{ width:14,height:14 }} />新建资产项目
        </button>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(210px, 1fr))",gap:16 }}>
        {PROJECTS.map(proj=>{
          const visible = getProjVisible(proj.id);
          const pOpen   = permOpen===proj.id;
          return (
            <div key={proj.id}
              style={{ aspectRatio:"3/4",position:"relative",borderRadius:18,overflow:"hidden",
                cursor:"pointer",border:`1px solid ${pOpen?"rgba(255,255,255,.2)":bdr}`,
                background:card,transition:"border-color .15s,transform .2s",display:"flex",flexDirection:"column" }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="translateY(-3px)";(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,.18)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="translateY(0)";(e.currentTarget as HTMLElement).style.borderColor=pOpen?"rgba(255,255,255,.2)":bdr;}}>

              {/* Preview area */}
              <div onClick={()=>{ setSelProj(proj.id); setAssetTab("chars"); setPermOpen(null); }}
                style={{ flex:1,position:"relative",
                  background:`radial-gradient(ellipse at 30% 25%, ${proj.color}2e 0%, transparent 60%), radial-gradient(ellipse at 75% 75%, ${proj.color}1a 0%, transparent 55%), ${card}`,
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12 }}>


                {/* Project icon */}
                <div style={{ width:56,height:56,borderRadius:16,
                  background:`${proj.color}1c`,border:`1px solid ${proj.color}38`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:`0 0 28px ${proj.color}1a` }}>
                  <Film style={{ width:24,height:24,color:proj.color }} />
                </div>
                <div style={{ textAlign:"center",padding:"0 14px" }}>
                  <div style={{ fontSize:18,fontWeight:800,color:"white",marginBottom:6 }}>{proj.name}</div>
                  <div style={{ fontSize:11,padding:"2px 10px",borderRadius:20,display:"inline-block",
                    background:`${proj.color}16`,border:`1px solid ${proj.color}32`,color:proj.color }}>
                    {proj.genre}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div onClick={()=>{ setSelProj(proj.id); setAssetTab("chars"); setPermOpen(null); }}
                style={{ padding:"11px 13px 12px",
                  background:"rgba(0,0,0,.32)",backdropFilter:"blur(12px)",
                  borderTop:"1px solid rgba(255,255,255,.07)" }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:9 }}>
                  {[{l:"角色",v:proj.chars},{l:"场景",v:proj.scenes},{l:"道具",v:proj.props}].map(s=>(
                    <div key={s.l} style={{ textAlign:"center" }}>
                      <div style={{ fontSize:15,fontWeight:800,color:"white" }}>{s.v}</div>
                      <div style={{ fontSize:9.5,color:dim }}>{s.l}</div>
                    </div>
                  ))}
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:13,fontWeight:700,marginTop:1,color:proj.audioReady?green:"rgba(255,255,255,.22)" }}>
                      {proj.audioReady?"✓":"—"}
                    </div>
                    <div style={{ fontSize:9.5,color:dim }}>声音</div>
                  </div>
                </div>
                <div style={{ display:"flex",gap:7 }}>
                  <button onClick={e=>{e.stopPropagation();setPermOpen(pOpen?null:proj.id);}}
                    style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                      padding:"7px 0",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",
                      background:pOpen?"rgba(255,138,31,.18)":"rgba(255,255,255,.07)",
                      border:`1px solid ${pOpen?"rgba(255,138,31,.45)":"rgba(255,255,255,.13)"}`,
                      color:pOpen?gold:"rgba(255,255,255,.65)",transition:"all .15s" }}
                    onMouseEnter={e=>{if(!pOpen){(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,.12)";(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,.9)";}}}
                    onMouseLeave={e=>{if(!pOpen){(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,.07)";(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,.65)";}}}>
                    <Shield style={{ width:11,height:11 }} />访问权限
                  </button>
                  <button onClick={e=>{e.stopPropagation(); setSelProj(proj.id); setAssetTab("chars"); setPermOpen(null);}}
                    style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                      padding:"7px 0",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",
                      background:`${proj.color}14`,border:`1px solid ${proj.color}35`,color:proj.color,
                      transition:"all .15s" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=`${proj.color}26`;}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=`${proj.color}14`;}}>
                    进入资产 <ChevronRight style={{ width:11,height:11 }} />
                  </button>
                </div>
              </div>

              {/* Permission overlay */}
              {pOpen && (
                <div onClick={e=>e.stopPropagation()}
                  style={{ position:"absolute",inset:0,zIndex:10,
                    background:"rgba(9,10,15,0.92)",backdropFilter:"blur(18px)",
                    padding:"14px",display:"flex",flexDirection:"column",gap:8 }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2 }}>
                    <span style={{ fontSize:12,fontWeight:700,color:"rgba(255,255,255,.85)",display:"flex",alignItems:"center",gap:6 }}>
                      <Shield style={{ width:12,height:12,color:gold }} />访问权限
                    </span>
                    <button onClick={()=>setPermOpen(null)}
                      style={{ width:22,height:22,borderRadius:6,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",
                        display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"rgba(255,255,255,.5)",fontSize:16,lineHeight:1 }}>
                      ×
                    </button>
                  </div>
                  <div style={{ fontSize:10,color:dim,marginBottom:2 }}>
                    {visible.size} / {TEAM_MEMBERS.length} 成员可见
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:5,overflowY:"auto" }}>
                    {TEAM_MEMBERS.map(m=>{
                      const on = visible.has(m.id);
                      return (
                        <button key={m.id} onClick={()=>toggleMember(proj.id,m.id)}
                          style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 9px",borderRadius:9,cursor:"pointer",transition:"all .15s",
                            background:on?"rgba(255,138,31,.1)":"rgba(255,255,255,.04)",
                            border:`1px solid ${on?"rgba(255,138,31,.3)":"rgba(255,255,255,.08)"}` }}>
                          <div style={{ width:24,height:24,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:10,fontWeight:700,background:on?`${gold}22`:"rgba(255,255,255,.1)",color:on?gold:"rgba(255,255,255,.4)" }}>
                            {m.avatar}
                          </div>
                          <div style={{ flex:1,textAlign:"left" }}>
                            <div style={{ fontSize:11.5,fontWeight:600,color:on?"white":"rgba(255,255,255,.55)" }}>{m.name}</div>
                            <div style={{ fontSize:9.5,color:dim }}>{m.role}</div>
                          </div>
                          {on&&<Check style={{ width:11,height:11,color:gold,flexShrink:0 }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


const APP_PAGES: PageId[] = ["workspace","projects","new-project","ai-chapter","assets","storyboard","batch","result","delivery","billing","canvas","user-center","plot-analysis","team","team-assets"];

// ─── UserCenterPage ───────────────────────────────────────────────────────────
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
  { stars: 100,   price: 10,   bonus: 0,   label: null },
  { stars: 500,   price: 50,   bonus: 20,  label: "赠 20" },
  { stars: 1000,  price: 100,  bonus: 50,  label: "赠 50" },
  { stars: 3000,  price: 300,  bonus: 200, label: "赠 200" },
  { stars: 6000,  price: 600,  bonus: 500, label: "赠 500" },
  { stars: 10000, price: 1000, bonus: 1200,label: "赠 1200 · 最划算" },
];

const RECHARGE_LOG = [
  { date: "2026-08-20", pack: "1000 付费星石", price: "¥100.00", method: "支付宝", status: "成功" },
  { date: "2026-07-15", pack: "3000 付费星石", price: "¥300.00", method: "微信支付", status: "成功" },
  { date: "2026-06-02", pack: "500 付费星石",  price: "¥50.00",  method: "支付宝", status: "成功" },
];

const STARS_LOG = [
  { date: "2026-08-21", desc: "SB-004 · Seedance 2.0 Fast · 480p 5s",    type: "消耗", amount: -18.55, bal: 2486.0 },
  { date: "2026-08-21", desc: "SB-003 · Seedance 2.0 Fast · 480p 5s",    type: "消耗", amount: -19.80, bal: 2504.55 },
  { date: "2026-08-20", desc: "套餐续费 · 星轨小队 30天",                   type: "到账", amount: +2500,  bal: 2524.35 },
  { date: "2026-08-20", desc: "SB-011 · 任务失败退回",                     type: "退回", amount: +3.20,  bal: -554.65 },
  { date: "2026-08-19", desc: "SB-002 · Seedance 2.0 Fast · 480p 5s",    type: "消耗", amount: -22.10, bal: -557.85 },
  { date: "2026-08-18", desc: "SB-001 · Seedance 2.0 Fast · 480p 5s",    type: "消耗", amount: -18.55, bal: -535.75 },
  { date: "2026-08-15", desc: "活动星石到账（注册赠送）",                   type: "活动", amount: +30,    bal: -517.20 },
];

const TEAM_OWNER_ID = 1; /* 当前工作室创建者 ID */
const TEAM_MEMBERS_INIT = [
  { id: 1, name: "赵雅薇", account: "zhao@xingyao.ai", role: "管理员", avatar: "赵", joined: "2026-06-01" },
  { id: 2, name: "林子墨", account: "lin@xingyao.ai",  role: "管理员", avatar: "林", joined: "2026-06-03" },
  { id: 3, name: "陈晓悦", account: "chen@xingyao.ai", role: "导演",   avatar: "陈", joined: "2026-07-12" },
  { id: 4, name: "吴诗涵", account: "wu@xingyao.ai",   role: "编剧",   avatar: "吴", joined: "2026-07-28" },
  { id: 5, name: "孙轩宇", account: "sun@xingyao.ai",  role: "制作人", avatar: "孙", joined: "2026-08-05" },
];

// ─── RechargeTab ──────────────────────────────────────────────────────────────
function RechargeTab() {
  const [selected, setSelected] = useState(2);          // default: 1000颗
  const [method, setMethod] = useState<"alipay" | "wechat" | "card">("alipay");
  const [done, setDone] = useState(false);

  const pack = RECHARGE_PACKS[selected];
  const totalStars = pack.stars + pack.bonus;
  const totalPrice = pack.price;

  const METHODS = [
    { id: "alipay"  as const, label: "支付宝",   icon: "💙" },
    { id: "wechat"  as const, label: "微信支付", icon: "💚" },
    { id: "card"    as const, label: "银行卡",   icon: "💳" },
  ];

  if (done) return (
    <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, padding: "48px 0", boxShadow: cardShadow, textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
        background: "rgba(255,138,31,.15)", boxShadow: "0 0 30px rgba(255,138,31,.3)" }}>
        <Star style={{ width: 30, height: 30, color: gold }} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 6 }}>充值成功</div>
      <div style={{ fontSize: 14, color: textMuted, marginBottom: 4 }}>
        <span style={{ color: gold, fontWeight: 700 }}>+{totalStars.toLocaleString()}</span> 付费星石已到账
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.25)", marginBottom: 28 }}>当前余额 {(USER.paidStars + totalStars).toLocaleString()} 付费星石</div>
      <button onClick={() => { setDone(false); setSelected(2); }}
        style={{ padding: "9px 28px", borderRadius: 12, fontSize: 14, fontWeight: 600,
          background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)" }}>
        继续充值
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Balance banner */}
      <div style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(255,138,31,.12), rgba(255,255,255,.03) 70%)",
        border: "1px solid rgba(255,138,31,.2)", borderRadius: 12, padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: cardShadow }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 4, letterSpacing: "0.04em" }}>当前余额</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: gold }}>{USER.paidStars.toLocaleString()}</span>
            <span style={{ fontSize: 13, color: textMuted }}>付费星石</span>
            <span style={{ width: 1, height: 16, background: "rgba(255,255,255,.1)", margin: "0 4px" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.4)" }}>{USER.activeStars}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.25)" }}>活动星石</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.28)", marginTop: 4 }}>活动星石 {USER.activeStarsExpiry}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 4 }}>汇率参考</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.55)" }}>1 元 = 10 付费星石</div>
        </div>
      </div>

      {/* Package grid */}
      <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, padding: "20px 24px", boxShadow: cardShadow }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 16 }}>选择充值金额</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
          {RECHARGE_PACKS.map((p, i) => {
            const isHot = i === 5;
            const isSel = selected === i;
            return (
              <button key={i} onClick={() => setSelected(i)}
                style={{
                  position: "relative", padding: "16px 14px", borderRadius: 14, textAlign: "left",
                  border: `1px solid ${isSel ? "rgba(255,138,31,.5)" : "rgba(255,255,255,.08)"}`,
                  background: isSel
                    ? "radial-gradient(ellipse at 30% 30%, rgba(255,138,31,.18), rgba(255,255,255,.04) 70%)"
                    : "rgba(255,255,255,.03)",
                  transition: "all .18s", cursor: "none",
                  boxShadow: isSel ? "0 0 0 1px rgba(255,138,31,.25), 0 4px 20px rgba(255,100,20,.12)" : "none",
                }}>
                {/* hot label */}
                {isHot && (
                  <span style={{ position: "absolute", top: -10, right: 12, fontSize: 9, fontWeight: 700,
                    padding: "2px 8px", borderRadius: 20, background: "#FF8A1F", color: "black" }}>
                    最划算
                  </span>
                )}
                {/* Selected indicator */}
                {isSel && (
                  <span style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "#FF8A1F" }}>
                    <Check style={{ width: 10, height: 10, color: "black" }} />
                  </span>
                )}
                <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 2 }}>
                  {p.stars.toLocaleString()}
                  <span style={{ fontSize: 12, fontWeight: 400, color: textMuted, marginLeft: 4 }}>星石</span>
                </div>
                {p.bonus > 0 && (
                  <div style={{ fontSize: 11, color: "#34d399", fontWeight: 600, marginBottom: 6 }}>
                    +{p.bonus} 赠送
                  </div>
                )}
                {p.bonus === 0 && <div style={{ marginBottom: 6, height: 17 }} />}
                <div style={{ fontSize: 15, fontWeight: 700, color: isSel ? gold : "rgba(255,255,255,.6)" }}>
                  ¥{p.price}
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Payment method */}
      <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, padding: "20px 24px", boxShadow: cardShadow }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>支付方式</h3>
        <div style={{ display: "flex", gap: 10 }}>
          {METHODS.map(m => {
            const isSel = method === m.id;
            return (
              <button key={m.id} onClick={() => setMethod(m.id)}
                style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                  borderRadius: 12, border: `1px solid ${isSel ? "rgba(255,138,31,.4)" : "rgba(255,255,255,.08)"}`,
                  background: isSel ? "rgba(255,138,31,.07)" : "rgba(255,255,255,.03)",
                  transition: "all .18s", cursor: "none" }}>
                <span style={{ fontSize: 18 }}>{m.icon}</span>
                <span style={{ fontSize: 13, fontWeight: isSel ? 600 : 400,
                  color: isSel ? "rgba(255,255,255,.9)" : textMuted }}>{m.label}</span>
                {isSel && <Check style={{ width: 13, height: 13, color: gold, marginLeft: "auto" }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Order summary + confirm */}
      <div style={{ background: "radial-gradient(ellipse at 80% 0%, rgba(255,138,31,.1), rgba(255,255,255,.03) 65%)",
        border: "1px solid rgba(255,138,31,.2)", borderRadius: 12, padding: "20px 24px", boxShadow: cardShadow }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 6 }}>本次充值</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: "white" }}>
                +{(totalStars || 0).toLocaleString()}
              </span>
              <span style={{ fontSize: 13, color: textMuted }}>付费星石</span>
            </div>
            {pack.bonus > 0 && (
              <div style={{ fontSize: 12, color: "#34d399", marginTop: 4, fontWeight: 500 }}>
                含赠送 {pack.bonus} 星石（共 {pack.stars + pack.bonus} 颗）
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 4 }}>实付金额</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: gold }}>¥{totalPrice || 0}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 2 }}>
              {METHODS.find(m => m.id === method)?.label}
            </div>
          </div>
        </div>

        {/* Row: after recharge balance */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,.35)",
          padding: "10px 0", borderTop: "1px solid rgba(255,255,255,.06)", marginBottom: 14 }}>
          <span>充值后余额</span>
          <span style={{ color: "rgba(255,255,255,.55)", fontWeight: 500 }}>
            {(USER.paidStars + (totalStars || 0)).toLocaleString()} 付费星石
          </span>
        </div>

        <button
          disabled={!totalPrice || totalPrice <= 0}
          onClick={() => setDone(true)}
          className="orange-btn"
          style={{ width: "100%", height: 48, borderRadius: 13, fontSize: 15, fontWeight: 700,
            color: "black", border: "none",
            opacity: totalPrice > 0 ? 1 : 0.35 }}>
          确认支付 ¥{totalPrice || 0}
        </button>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,.2)", textAlign: "center", marginTop: 10 }}>
          付费星石永久有效，不可提现或转让 · 价格含税
        </p>
      </div>

      {/* Recharge history */}
      <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, padding: "20px 24px", boxShadow: cardShadow }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>充值记录</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {RECHARGE_LOG.map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 0", borderBottom: i < RECHARGE_LOG.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
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
    </div>
  );
}

// ─── TeamTabReadonly (用户中心版，仅移除，无邀请) ────────────────────────────
function TeamTabReadonly() {
  type Member = typeof TEAM_MEMBERS_INIT[number];
  const [members, setMembers] = useState<Member[]>([...TEAM_MEMBERS_INIT]);
  const [removeId, setRemoveId] = useState<number | null>(null);
  const surface = "#13151C";
  const bdr = "rgba(255,255,255,0.07)";
  const textMuted = "#A4A8B3";

  const handleRemove = (id: number) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setRemoveId(null);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 3 }}>工作室成员</h3>
          <p style={{ fontSize: 12, color: textMuted }}>{members.length} 位成员 · 在侧边栏「团队」页可邀请新成员</p>
        </div>
      </div>
      <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 16, overflow: "hidden" }}>
        {members.map((m, i) => {
          const rs = ROLE_STYLE[m.role] ?? ROLE_STYLE["制作人"];
          const isCreator = m.id === TEAM_OWNER_ID;
          return (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12,
              padding: "13px 18px",
              borderBottom: i < members.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: rs.bg, color: rs.color, fontSize: 13, fontWeight: 700 }}>
                {m.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "white" }}>{m.name}</div>
                <div style={{ fontSize: 11, color: textMuted, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.account}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 100,
                background: rs.bg, color: rs.color, flexShrink: 0 }}>{m.role}</span>
              {!isCreator && (
                removeId === m.id ? (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => handleRemove(m.id)}
                      style={{ fontSize: 11, color: "#f87171", background: "rgba(248,113,113,.1)",
                        border: "1px solid rgba(248,113,113,.25)", padding: "4px 10px",
                        borderRadius: 8, fontWeight: 600, cursor: "none" }}>确认</button>
                    <button onClick={() => setRemoveId(null)}
                      style={{ fontSize: 11, color: textMuted, background: "none",
                        border: "none", cursor: "none" }}>取消</button>
                  </div>
                ) : (
                  <button onClick={() => setRemoveId(m.id)}
                    style={{ fontSize: 11, color: textMuted, background: "none",
                      border: "1px solid rgba(255,255,255,.08)", padding: "5px 12px",
                      borderRadius: 8, cursor: "none", flexShrink: 0, transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; }}>
                    移除
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 10 }}>
        * 完整团队管理（邀请、角色编辑）请前往侧边栏「团队」页面。
      </p>
    </div>
  );
}

function UserCenterPage({ navigate }: Nav) {
  const [tab, setTab] = useState<UCTab>("account");
  const [editName, setEditName] = useState(false);
  const [displayName, setDisplayName] = useState(USER.name);
  const [tmpName, setTmpName] = useState(USER.name);

  return (
    <div style={{ padding: "24px 24px 48px", maxWidth: 860, margin: "0 auto" }}>
      {/* Back breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: textMuted, marginBottom: 20 }}>
        <button onClick={() => navigate("workspace")} style={{ background: "none", border: "none", color: textMuted, display: "flex", alignItems: "center", gap: 4 }}>
          <ChevronLeft style={{ width: 14, height: 14 }} />工作台
        </button>
        <span style={{ color: "rgba(255,255,255,.15)" }}>·</span>
        <span style={{ color: textDim, fontWeight: 500 }}>用户中心</span>
      </div>

      {/* Header card */}
      <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 20, padding: "22px 24px", boxShadow: cardShadow, marginBottom: 20, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          background: "rgba(255,138,31,0.12)", border: "1px solid rgba(255,138,31,0.22)",
          fontSize: 20, fontWeight: 700, color: gold }}>
          {USER.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "white", marginBottom: 3 }}>{displayName}</div>
          <div style={{ fontSize: 12, color: textMuted }}>{USER.team} · {USER.plan} · 剩余 {USER.planDaysLeft} 天</div>
        </div>
        {/* Stars summary */}
        <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
          {[
            { label: "付费星石", val: USER.paidStars.toLocaleString(), c: gold },
            { label: "活动星石", val: `${USER.activeStars}（${USER.activeStarsExpiry}）`, c: "rgba(255,255,255,.45)" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "right" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: s.c }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, padding: "4px", borderRadius: 14,
        background: "rgba(255,255,255,.04)", border: `1px solid ${bdr}`, width: "fit-content" }}>
        {UC_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              border: "none", transition: "all .18s",
              background: tab === t.id ? "rgba(255,255,255,.1)" : "transparent",
              color: tab === t.id ? "white" : "rgba(255,255,255,.38)",
              boxShadow: tab === t.id ? "0 0 0 1px rgba(255,255,255,.1)" : "none",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 账号信息 ── */}
      {tab === "account" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, padding: "20px 24px", boxShadow: cardShadow }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 18 }}>基本信息</h3>
            {[
              { label: "昵称", content: editName ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input value={tmpName} onChange={e => setTmpName(e.target.value)}
                    style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,138,31,.35)", borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "white", outline: "none" }} />
                  <button onClick={() => { setDisplayName(tmpName); setEditName(false); }}
                    style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#FF8A1F", color: "black", border: "none" }}>保存</button>
                  <button onClick={() => { setTmpName(displayName); setEditName(false); }}
                    style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, background: "rgba(255,255,255,.07)", color: textMuted, border: "none" }}>取消</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "white", fontSize: 13 }}>{displayName}</span>
                  <button onClick={() => { setTmpName(displayName); setEditName(true); }}
                    style={{ fontSize: 11, color: gold, background: "none", border: "none", fontWeight: 500 }}>修改</button>
                </div>
              )},
              { label: "账号",     content: <span style={{ color: "white", fontSize: 13 }}>zhaoyawei_2026</span> },
              { label: "手机",     content: <span style={{ color: "white", fontSize: 13 }}>138 **** 6791 <button style={{ fontSize: 11, color: gold, background: "none", border: "none", marginLeft: 8 }}>更换</button></span> },
              { label: "实名认证", content: <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#34d399", fontWeight: 600 }}><CheckCircle style={{ width: 13, height: 13 }} />已认证</span> },
              { label: "注册时间", content: <span style={{ color: textMuted, fontSize: 13 }}>2026-08-21</span> },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0",
                borderBottom: i < 4 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                <span style={{ fontSize: 13, color: textMuted, width: 80, flexShrink: 0 }}>{row.label}</span>
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>{row.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 星石记录 ── */}
      {tab === "stars" && (
        <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, padding: "20px 24px", boxShadow: cardShadow }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim }}>消耗与到账明细</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: textMuted }}>当前余额</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: gold }}>{USER.paidStars.toLocaleString()} 付费</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)" }}>+</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.5)" }}>{USER.activeStars} 活动</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STARS_LOG.map((row, i) => {
              const typeColor = row.type === "消耗" ? "#f87171" : row.type === "退回" ? "#60a5fa" : row.type === "活动" ? "#a78bfa" : "#34d399";
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr 60px 100px", gap: 12, alignItems: "center",
                  padding: "13px 0", borderBottom: i < STARS_LOG.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{row.date}</span>
                  <span style={{ fontSize: 12, color: textMuted }}>{row.desc}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, textAlign: "center",
                    background: `${typeColor}18`, color: typeColor }}>{row.type}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, textAlign: "right",
                    color: row.amount > 0 ? "#34d399" : "#f87171" }}>
                    {row.amount > 0 ? "+" : ""}{row.amount.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 充值星石 ── */}
      {tab === "recharge" && <RechargeTab />}

      {/* ── 套餐订阅 ── */}
      {tab === "subscription" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(255,138,31,.12),rgba(255,255,255,.03) 70%)",
            border: "1px solid rgba(255,138,31,.25)", borderRadius: 12, padding: "20px 24px", boxShadow: cardShadow }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, color: gold, fontWeight: 600, marginBottom: 6, letterSpacing: "0.04em" }}>当前套餐</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 4 }}>{USER.plan}</div>
                <div style={{ fontSize: 13, color: textMuted }}>¥299 / 30天 · 剩余 <span style={{ color: "white", fontWeight: 600 }}>{USER.planDaysLeft} 天</span></div>
              </div>
              <button onClick={() => navigate("upgrade")} className="orange-btn"
                style={{ padding: "9px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "black", border: "none" }}>
                升级套餐
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 20 }}>
              {[
                { label: "成员席位",  val: `${USER.concurrent.used}/${5}人` },
                { label: "并发任务",  val: `${USER.concurrent.used}/${USER.concurrent.total}` },
                { label: "队列容量",  val: `${USER.queue.used}/${USER.queue.total.toLocaleString()}` },
                { label: "套餐星石",  val: "3,079 / 月" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: textMuted, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Model price table */}
          <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, padding: "20px 24px", boxShadow: cardShadow }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>按创作类型查看模型原价格</h3>
              <span style={{ fontSize: 11, color: textMuted }}>2026年8月22日 更新</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {/* 文本模型 */}
              <div style={{ background: "rgba(59,130,246,.06)", border: "1px solid rgba(59,130,246,.2)", borderRadius: 14, padding: "18px 16px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#60a5fa", marginBottom: 4 }}>文本模型</div>
                <div style={{ fontSize: 11, color: textMuted, marginBottom: 16 }}>按标准任务计价</div>
                {[
                  { name: "星核拆镜·极速", sub: "DeepSeek V4 Flash",           price: "¥0.014/次" },
                  { name: "星核拆镜·深度", sub: "DeepSeek V4 Pro",             price: "¥0.042/次" },
                  { name: "星核拆镜·快写", sub: "千问3.6 Flash",               price: "¥0.074/次", tag: "推荐" },
                  { name: "星核长篇·标准", sub: "千问3.7 Plus",                price: "¥0.076/次" },
                  { name: "星核长篇·专业", sub: "千问3.7 Max",                 price: "¥0.134/次" },
                  { name: "星核推演·旗舰", sub: "Claude Opus 4.6/4.7/4.8",    price: "¥0.315/次" },
                ].map((m, i, arr) => (
                  <div key={m.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: i < arr.length - 1 ? 10 : 0, marginBottom: i < arr.length - 1 ? 10 : 0, borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,.8)" }}>{m.name}</span>
                        {m.tag && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "rgba(59,130,246,.2)", color: "#60a5fa" }}>{m.tag}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: textMuted, marginTop: 1 }}>{m.sub}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", flexShrink: 0 }}>{m.price}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "8px 10px", background: "rgba(59,130,246,.06)", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: textMuted, lineHeight: 1.6 }}>1 次 = 输入约 1 万 Token + 输出约 2 千 Token</div>
                  <div style={{ fontSize: 10, color: textMuted, lineHeight: 1.6 }}>实际价格会随文本长度变化</div>
                </div>
              </div>

              {/* 图片模型 */}
              <div style={{ background: "rgba(168,85,247,.06)", border: "1px solid rgba(168,85,247,.2)", borderRadius: 14, padding: "18px 16px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#c084fc", marginBottom: 4 }}>图片模型</div>
                <div style={{ fontSize: 11, color: textMuted, marginBottom: 16 }}>按生成张数计价</div>
                {[
                  { name: "星核绘图·标准", sub: "GPT-Image-2 · 普通",          price: "¥0.03/张" },
                  { name: "星核快绘·高清", sub: "GPT-Image-2 · 2K",           price: "¥0.06/张", tag: "推荐" },
                  { name: "星核快绘·超清", sub: "GPT-Image-2 · 4K",           price: "¥0.06/张" },
                  { name: "星核快绘·专业", sub: "S-GPT-Image-2",              price: "¥0.12/张" },
                  { name: "星核质感·智能", sub: "Nano Banana 2",              price: "¥0.13/张" },
                  { name: "星核质感·旗舰", sub: "Nano Banana Pro · 1K/2K/4K", price: "¥0.18/张起" },
                ].map((m, i, arr) => (
                  <div key={m.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: i < arr.length - 1 ? 10 : 0, marginBottom: i < arr.length - 1 ? 10 : 0, borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,.8)" }}>{m.name}</span>
                        {m.tag && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "rgba(168,85,247,.2)", color: "#c084fc" }}>{m.tag}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: textMuted, marginTop: 1 }}>{m.sub}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#c084fc", flexShrink: 0 }}>{m.price}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "8px 10px", background: "rgba(168,85,247,.06)", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: textMuted, lineHeight: 1.6 }}>清晰度、参考图、高清修复与生成张数变化时</div>
                  <div style={{ fontSize: 10, color: textMuted, lineHeight: 1.6 }}>预计价格会同步更新</div>
                </div>
              </div>

              {/* 视频模型 */}
              <div style={{ background: "rgba(229,87,20,.06)", border: "1px solid rgba(229,87,20,.2)", borderRadius: 14, padding: "18px 16px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fb923c", marginBottom: 4 }}>视频模型</div>
                <div style={{ fontSize: 11, color: textMuted, marginBottom: 16 }}>按视频输出秒数计价</div>
                {[
                  { name: "轻量成片·流畅", sub: "Seedance Mini · 480p",      price: "¥0.092/秒" },
                  { name: "创意快片·高清", sub: "Grok Imagine · 720p",       price: "¥0.10/秒" },
                  { name: "极速成片·高清", sub: "Seedance 2.0 Fast · 720p",  price: "¥0.53/秒起", tag: "推荐" },
                  { name: "质感成片·高清", sub: "Seedance 2.0 · 720p",       price: "¥0.657/秒起" },
                  { name: "电影成片·高清", sub: "Seedance 2.5 · 720p",       price: "¥1.512/秒" },
                ].map((m, i, arr) => (
                  <div key={m.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: i < arr.length - 1 ? 10 : 0, marginBottom: i < arr.length - 1 ? 10 : 0, borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,.8)" }}>{m.name}</span>
                        {m.tag && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "rgba(229,87,20,.2)", color: "#fb923c" }}>{m.tag}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: textMuted, marginTop: 1 }}>{m.sub}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fb923c", flexShrink: 0 }}>{m.price}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "8px 10px", background: "rgba(229,87,20,.06)", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: textMuted, lineHeight: 1.6 }}>"起"价仅限指定清晰度、声音与线路；时长、</div>
                  <div style={{ fontSize: 10, color: textMuted, lineHeight: 1.6 }}>参考素材和后处理会影响预计价格</div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 10, color: textMuted, marginTop: 14 }}>价格仅作参考，规格或参数变化时，以任务提交前展示为准</p>
          </div>

          <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, padding: "18px 24px", boxShadow: cardShadow }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>历史账单</h3>
            {[
              { date: "2026-08-20", desc: "星轨小队 30天续费",  amount: "¥299.00", status: "已支付" },
              { date: "2026-07-21", desc: "星轨小队 30天续费",  amount: "¥299.00", status: "已支付" },
              { date: "2026-06-21", desc: "星芒个人 → 星轨小队升级", amount: "¥200.00", status: "已支付" },
            ].map((row, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                <div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)", marginBottom: 2 }}>{row.desc}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{row.date}</div>
                </div>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{row.amount}</span>
                  <span style={{ fontSize: 11, color: "#34d399", fontWeight: 600 }}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 团队管理（用户中心版：仅移除，无邀请） ── */}
      {tab === "team" && <TeamTabReadonly />}

      {/* ── 安全设置 ── */}
      {tab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, padding: "20px 24px", boxShadow: cardShadow }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 18 }}>登录安全</h3>
            {[
              { title: "登录密码", desc: "上次修改：2026-08-01", action: "修改" },
              { title: "手机验证", desc: "138 **** 6791 · 已绑定", action: "更换" },
              { title: "登录设备", desc: "最近活跃：MacBook Pro · 今天 10:48", action: "管理" },
            ].map((row, i, arr) => (
              <div key={row.title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "13px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.8)", marginBottom: 2 }}>{row.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{row.desc}</div>
                </div>
                <button style={{ fontSize: 12, color: gold, background: "none", border: "none", fontWeight: 500 }}>{row.action}</button>
              </div>
            ))}
          </div>
          <div style={{ background: surface, border: "1px solid rgba(248,113,113,.15)", borderRadius: 12, padding: "20px 24px", boxShadow: cardShadow }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#f87171", marginBottom: 14 }}>危险操作</h3>
            {[
              { title: "退出登录",    desc: "退出当前账号的所有设备登录状态",  btnLabel: "退出登录",    color: textMuted },
              { title: "注销账号",    desc: "永久删除账号及全部数据，不可恢复",  btnLabel: "申请注销",    color: "#f87171" },
            ].map((row, i) => (
              <div key={row.title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0", borderBottom: i < 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.75)", marginBottom: 2 }}>{row.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.28)" }}>{row.desc}</div>
                </div>
                <button onClick={row.title === "退出登录" ? () => navigate("landing") : undefined}
                  style={{ fontSize: 12, color: row.color, background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.15)",
                    padding: "6px 14px", borderRadius: 9, fontWeight: 600 }}>
                  {row.btnLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TeamPage (侧边栏团队，完整功能) ──────────────────────────────────────────
function TeamPage({ navigate }: Nav) {
  type Member = typeof TEAM_MEMBERS_INIT[number];
  const [members, setMembers] = useState<Member[]>([...TEAM_MEMBERS_INIT]);
  const [showInvite, setShowInvite] = useState(false);
  const [account, setAccount] = useState("");
  const [role, setRole] = useState<TeamRole>("编剧");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<TeamRole>("编剧");

  const MAX = 5;
  const surface  = "#13151C";
  const bdr      = "rgba(255,255,255,.07)";
  const textMuted = "#A4A8B3";
  const gold     = "#FF8A1F";

  const handleInvite = () => {
    if (!account.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false); setSent(true);
      setTimeout(() => {
        if (members.length < MAX) {
          const name = account.split("@")[0];
          setMembers(prev => [...prev, {
            id: Date.now(), name, account: account.trim(), role,
            avatar: name[0]?.toUpperCase() ?? "?",
            joined: new Date().toISOString().slice(0, 10),
          }]);
        }
        setSent(false); setShowInvite(false); setAccount(""); setRole("编剧");
      }, 1200);
    }, 1000);
  };

  const handleRemove = (id: number) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setRemoveId(null);
  };

  const handleRoleChange = (id: number) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: editRole } : m));
    setEditId(null);
  };

  const onlineSet = new Set([1, 2, 3]); /* mock: IDs that are online */

  return (
    <div style={{ padding: "28px 32px", maxWidth: 860, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 4 }}>团队管理</h1>
          <p style={{ fontSize: 13, color: textMuted }}>
            {USER.team} · {members.length}/{MAX} 人 · {members.filter(m => onlineSet.has(m.id)).length} 人在线
          </p>
        </div>
        {members.length < MAX && (
          <button onClick={() => setShowInvite(true)}
            className="orange-btn"
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 20px",
              borderRadius: 12, fontSize: 13.5, fontWeight: 600, color: "black", border: "none", flexShrink: 0 }}>
            <Plus style={{ width: 15, height: 15 }} />
            邀请成员
          </button>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "总成员",  value: members.length,                                        color: gold },
          { label: "在线",    value: members.filter(m => onlineSet.has(m.id)).length,       color: "#22c55e" },
          { label: "管理员",  value: members.filter(m => m.role === "管理员").length,        color: "#a78bfa" },
          { label: "剩余席位", value: MAX - members.length,                                  color: "#38bdf8" },
        ].map(stat => (
          <div key={stat.label} style={{ background: surface, border: `1px solid ${bdr}`,
            borderRadius: 14, padding: "14px 18px" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, marginBottom: 2 }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: textMuted }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Member table */}
      <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 120px",
          padding: "10px 20px", background: "rgba(255,255,255,.03)",
          borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          {["成员", "账号", "职能", "状态", "操作"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.3)",
              letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {members.map((m, i) => {
          const rs = ROLE_STYLE[m.role] ?? ROLE_STYLE["制作人"];
          const isCreator = m.id === TEAM_OWNER_ID;
          const online = onlineSet.has(m.id);
          return (
            <div key={m.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 120px",
              alignItems: "center", padding: "14px 20px",
              borderBottom: i < members.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none",
              transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.02)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>

              {/* Name + avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: rs.bg, color: rs.color, fontSize: 13, fontWeight: 700 }}>
                    {m.avatar}
                  </div>
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9,
                    borderRadius: "50%", background: online ? "#22c55e" : "rgba(255,255,255,.2)",
                    border: "1.5px solid #090A0E" }} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "white" }}>{m.name}</div>
                  {m.id === members[0].id && (
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>（我）</div>
                  )}
                </div>
              </div>

              {/* Account */}
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.38)", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.account}</span>

              {/* Role — editable for non-creator */}
              <div>
                {editId === m.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <select value={editRole} onChange={e => setEditRole(e.target.value as TeamRole)}
                      style={{ fontSize: 12, background: "#181B24", border: "1px solid rgba(255,255,255,.15)",
                        color: "white", borderRadius: 8, padding: "4px 8px", outline: "none" }}>
                      {TEAM_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => handleRoleChange(m.id)}
                        style={{ fontSize: 10, color: gold, background: "rgba(255,138,31,.1)",
                          border: "none", borderRadius: 6, padding: "2px 8px", cursor: "none" }}>保存</button>
                      <button onClick={() => setEditId(null)}
                        style={{ fontSize: 10, color: textMuted, background: "none",
                          border: "none", padding: "2px 4px", cursor: "none" }}>取消</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 100,
                      background: rs.bg, color: rs.color }}>{m.role}</span>
                    {!isCreator && (
                      <button onClick={() => { setEditId(m.id); setEditRole(m.role as TeamRole); }}
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,.2)",
                          cursor: "none", display: "flex", padding: 0 }}>
                        <PenLine style={{ width: 11, height: 11 }} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Online status */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%",
                  background: online ? "#22c55e" : "rgba(255,255,255,.2)" }} />
                <span style={{ fontSize: 12, color: online ? "#22c55e" : "rgba(255,255,255,.3)" }}>
                  {online ? "在线" : "离线"}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                {!isCreator && (
                  removeId === m.id ? (
                    <>
                      <button onClick={() => handleRemove(m.id)}
                        style={{ fontSize: 11, color: "#f87171", background: "rgba(248,113,113,.1)",
                          border: "1px solid rgba(248,113,113,.25)", padding: "4px 10px",
                          borderRadius: 8, fontWeight: 600, cursor: "none" }}>确认</button>
                      <button onClick={() => setRemoveId(null)}
                        style={{ fontSize: 11, color: textMuted, background: "none",
                          border: "none", cursor: "none" }}>取消</button>
                    </>
                  ) : (
                    <button onClick={() => setRemoveId(m.id)}
                      style={{ fontSize: 11, color: "rgba(255,255,255,.3)", background: "none",
                        border: "1px solid rgba(255,255,255,.08)", padding: "5px 12px",
                        borderRadius: 8, cursor: "none", transition: "all .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; }}>
                      移除
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role permission matrix */}
      <div style={{ background: surface, border: `1px solid ${bdr}`, borderRadius: 16, padding: "16px 20px" }}>
        <h4 style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.35)", marginBottom: 14,
          letterSpacing: "0.05em", textTransform: "uppercase" as const }}>角色权限</h4>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "5px 8px", color: "rgba(255,255,255,.28)", fontWeight: 600, fontSize: 10.5, borderBottom: "1px solid rgba(255,255,255,.06)", width: "42%" }}>权限</th>
              {(["所有者","管理员","制作人"] as const).map(r => {
                const rs = r === "所有者" ? { bg: "rgba(255,138,31,.18)", color: "#FF8A1F" } : ROLE_STYLE[r] ?? ROLE_STYLE["制作人"];
                return (
                  <th key={r} style={{ textAlign: "center", padding: "5px 6px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 100, background: rs.bg, color: rs.color }}>{r}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {[
              { perm: "使用团队资产",         owner: true,  admin: true,  maker: true  },
              { perm: "进入和共创团队项目",   owner: true,  admin: true,  maker: true  },
              { perm: "发起内容生成",         owner: true,  admin: true,  maker: true  },
              { perm: "新增、删除团队资产",   owner: true,  admin: true,  maker: false },
              { perm: "邀请、移除成员",       owner: true,  admin: true,  maker: false },
              { perm: "调整成员身份",         owner: true,  admin: true,  maker: false },
              { perm: "充值、升级套餐",       owner: true,  admin: true,  maker: false },
              { perm: "强制释放生成锁",       owner: true,  admin: true,  maker: false },
              { perm: "解散团队/转移所有权",  owner: true,  admin: false, maker: false },
            ].map((row) => (
              <tr key={row.perm} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                <td style={{ padding: "7px 8px", color: "rgba(255,255,255,.45)", fontSize: 11 }}>{row.perm}</td>
                {[row.owner, row.admin, row.maker].map((has, j) => (
                  <td key={j} style={{ textAlign: "center", padding: "7px 6px" }}>
                    {has
                      ? <span style={{ fontSize: 12, color: "#34d399" }}>✓</span>
                      : <span style={{ fontSize: 12, color: "rgba(255,255,255,.1)" }}>—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: 10.5, color: "rgba(255,255,255,.18)", marginTop: 10, lineHeight: 1.6 }}>
          * 导演/编剧权限与制作人相同 · 团队余额不足时任务失败，不自动扣个人余额
        </p>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,.65)", backdropFilter: "blur(8px)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowInvite(false); }}>
          <div style={{ width: 440, background: "#181B24", border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 20, padding: "28px 28px 24px", boxShadow: "0 32px 80px rgba(0,0,0,.7)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 3 }}>邀请成员</h2>
                <p style={{ fontSize: 12, color: textMuted }}>通过账号邀请对方加入工作室</p>
              </div>
              <button onClick={() => setShowInvite(false)}
                style={{ background: "none", border: "none", color: textMuted, cursor: "none" }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600,
                color: "rgba(255,255,255,.5)", marginBottom: 7 }}>账号（邮箱或用户名）</label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  width: 14, height: 14, color: "rgba(255,255,255,.3)", pointerEvents: "none" }} />
                <input value={account} onChange={e => setAccount(e.target.value)}
                  placeholder="对方注册时使用的邮箱或用户名"
                  style={{ width: "100%", padding: "11px 12px 11px 34px", borderRadius: 12, fontSize: 13.5,
                    background: "rgba(255,255,255,.06)", border: `1px solid ${bdr}`, color: "white",
                    outline: "none", boxSizing: "border-box", transition: "border-color .15s" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,138,31,.5)")}
                  onBlur={e => (e.currentTarget.style.borderColor = bdr)} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600,
                color: "rgba(255,255,255,.5)", marginBottom: 10 }}>分配职能</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {TEAM_ROLES.map(r => {
                  const rs = ROLE_STYLE[r];
                  const selected = role === r;
                  return (
                    <button key={r} onClick={() => setRole(r)}
                      style={{ padding: "10px 14px", borderRadius: 12, cursor: "none",
                        display: "flex", alignItems: "center", gap: 8, transition: "all .15s",
                        background: selected ? rs.bg : "rgba(255,255,255,.04)",
                        border: `1px solid ${selected ? rs.color + "55" : "rgba(255,255,255,.08)"}` }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%",
                        background: selected ? rs.color : "rgba(255,255,255,.2)", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600,
                        color: selected ? rs.color : "rgba(255,255,255,.6)" }}>{r}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowInvite(false)}
                style={{ flex: 1, padding: "11px", borderRadius: 12, fontSize: 13.5, fontWeight: 500,
                  background: "rgba(255,255,255,.06)", border: `1px solid ${bdr}`,
                  color: textMuted, cursor: "none" }}>取消</button>
              <button onClick={handleInvite} disabled={!account.trim() || sending || sent}
                style={{ flex: 2, padding: "11px", borderRadius: 12, fontSize: 13.5, fontWeight: 700,
                  background: sent ? "rgba(34,197,94,.15)" : "#FF8A1F",
                  border: sent ? "1px solid rgba(34,197,94,.3)" : "none",
                  color: sent ? "#34d399" : "black", opacity: !account.trim() ? 0.4 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  cursor: "none", transition: "all .3s" }}>
                {sending && <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />}
                {sent && <CheckCircle style={{ width: 14, height: 14 }} />}
                {sending ? "发送中…" : sent ? "邀请已发送" : "发送邀请"}
              </button>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.25)", textAlign: "center", marginTop: 14 }}>
              对方接受邀请后将出现在成员列表中
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<PageId>("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const prevPageRef         = useRef<PageId>("landing");
  const teamAssetsFromRef   = useRef<PageId>("workspace");
  const teamAssetsInitProj  = useRef<string | null>(null);
  const navigate = useCallback((p: PageId) => {
    const prev = prevPageRef.current;
    if (p === "team-assets") {
      teamAssetsFromRef.current = prev;
      if (prev !== "new-project") teamAssetsInitProj.current = null;
    }
    prevPageRef.current = p;
    setPage(p);
    window.scrollTo(0, 0);
    // 从注册/引导流回到首页，或进入任意工作台页面，视为已登录
    const authFlow: PageId[] = ["register", "verify", "onboarding"];
    if (p === "workspace" || (p === "landing" && authFlow.includes(prev))) {
      setIsLoggedIn(true);
    }
  }, []);
  const showCostConfirm = page === "cost-confirm";
  const activePage: PageId = showCostConfirm ? "storyboard" : page;
  const isAppPage = APP_PAGES.includes(page) || showCostConfirm;

  if (!isAppPage) return (
    <>
      <GlobalStyles />
      {page === "landing"    && <LandingPage    navigate={navigate} isLoggedIn={isLoggedIn} />}
      {page === "register"   && <RegisterPage   navigate={navigate} />}
      {page === "verify"     && <VerifyPage     navigate={navigate} />}
      {page === "onboarding" && <OnboardingPage navigate={navigate} />}
      {page === "upgrade"    && <UpgradePage    navigate={navigate} />}
    </>
  );

  // Canvas renders full-screen (no sidebar/topbar)
  if (activePage === "canvas") return (
    <>
      <GlobalStyles />
      <div style={{ width:"100vw", height:"100vh", overflow:"hidden", position:"relative" }}>
        <CanvasPage navigate={navigate} />
      </div>
    </>
  );

  return (
    <AppLayout currentPage={activePage} navigate={navigate}>
      {activePage === "workspace"   && <WorkspacePage   navigate={navigate} />}
      {activePage === "projects"    && <ProjectListPage navigate={navigate} />}
      {activePage === "new-project" && <NewProjectPage  navigate={navigate} onStart={() => { teamAssetsFromRef.current = "new-project"; teamAssetsInitProj.current = "p1"; }} />}
      {activePage === "ai-chapter"  && <AIChapterPage   navigate={navigate} />}
      {activePage === "assets"      && <TeamAssetsPage   navigate={navigate} from={teamAssetsFromRef.current} initialSelProj={teamAssetsInitProj.current ?? undefined} />}
      {activePage === "storyboard"  && <StoryboardPage  navigate={navigate} />}
      {activePage === "batch"       && <BatchPage       navigate={navigate} />}
      {activePage === "result"      && <ResultPage      navigate={navigate} />}
      {activePage === "delivery"    && <DeliveryPage    navigate={navigate} />}
      {activePage === "billing"     && <BillingPage     navigate={navigate} />}
      {activePage === "user-center"          && <UserCenterPage        navigate={navigate} />}
      {activePage === "team"                 && <TeamPage               navigate={navigate} />}
      {activePage === "team-assets"          && <TeamAssetsPage          navigate={navigate} from={teamAssetsFromRef.current} initialSelProj={teamAssetsInitProj.current ?? undefined} />}
      {(activePage === "plot-analysis") && <PlotAnalysisPage navigate={navigate} />}
      {showCostConfirm && <CostConfirmPage navigate={navigate} />}
    </AppLayout>
  );
}

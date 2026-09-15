// ═══════════════════════════════════════════════════════════════════════════════════
// CanvasPage - 画布编辑器
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState, useRef, useCallback } from "react";
import {
  FileText, Users, ImageIcon, Layers, Zap, CheckCircle, Download,
  MousePointer, Move, GitBranch, PlusCircle, Type,
} from "lucide-react";
import { Nav } from "../shared";

interface CanvasNode {
  id: string; label: string; sub: string; x: number; y: number;
  w: number; h: number; color: string; icon: React.ElementType;
  badge?: string;
}
interface CanvasEdge { from: string; to: string; }

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INIT_NODES: CanvasNode[] = [
  { id: "script",     label: "剧本导入",    sub: "上传或粘贴剧本文稿",   x: 80,  y: 80,  w: 200, h: 110, color: "#ff8c20", icon: FileText },
  { id: "char",       label: "角色设计",    sub: "AI 生成角色参考图",    x: 380, y: 40,  w: 200, h: 110, color: "#a855f7", icon: Users },
  { id: "scene",      label: "场景素材",    sub: "背景/道具资产库",      x: 680, y: 80,  w: 200, h: 110, color: "#06b6d4", icon: ImageIcon },
  { id: "storyboard", label: "分镜规划",    sub: "AI 自动拆帧分镜",     x: 230, y: 260, w: 200, h: 110, color: "#f59e0b", icon: Layers },
  { id: "gen",        label: "AI 批量生图", sub: "Seedance 2.0 生图",  x: 530, y: 260, w: 200, h: 110, color: "#10b981", icon: Zap, badge: "生成中" },
  { id: "review",     label: "结果审核",    sub: "逐帧检查 / 重绘",    x: 380, y: 460, w: 200, h: 110, color: "#3b82f6", icon: CheckCircle },
  { id: "export",     label: "导出交付",    sub: "视频 / 分镜图集打包", x: 380, y: 640, w: 200, h: 110, color: "#ff6b6b", icon: Download },
];
const INIT_EDGES: CanvasEdge[] = [
  { from: "script",     to: "storyboard" },
  { from: "char",       to: "storyboard" },
  { from: "scene",      to: "gen" },
  { from: "storyboard", to: "gen" },
  { from: "gen",        to: "review" },
  { from: "review",     to: "export" },
];

// ─── Animated Edge ────────────────────────────────────────────────────────────
function ElectricEdge({ from, to, nodes, idx }: { from: string; to: string; nodes: CanvasNode[]; idx: number }) {
  const a = nodes.find(n => n.id === from);
  const b = nodes.find(n => n.id === to);
  if (!a || !b) return null;

  const ax = a.x + a.w;
  const ay = a.y + a.h / 2;
  const bx = b.x;
  const by = b.y + b.h / 2;

  const belowThreshold = b.y > a.y + a.h * 0.8;
  let d: string;
  if (belowThreshold) {
    const ax2 = a.x + a.w / 2;
    const ay2 = a.y + a.h;
    const bx2 = b.x + b.w / 2;
    const by2 = b.y;
    const midY = (ay2 + by2) / 2;
    d = `M ${ax2} ${ay2} C ${ax2} ${midY} ${bx2} ${midY} ${bx2} ${by2}`;
  } else {
    const midX = (ax + bx) / 2;
    d = `M ${ax} ${ay} C ${midX} ${ay} ${midX} ${by} ${bx} ${by}`;
  }

  const glowColor = a.color;
  const dur = 1.8 + (idx % 3) * 0.4;
  const delay = (idx * 0.35) % 2;

  return (
    <g>
      <path d={d} fill="none" stroke={glowColor} strokeWidth={2} strokeOpacity={0.18} />
      <path d={d} fill="none" stroke={glowColor} strokeWidth={6} strokeOpacity={0.08} style={{ filter: `blur(3px)` }} />
      <path d={d} fill="none" stroke={glowColor} strokeWidth={2.5} strokeOpacity={0.9}
        strokeDasharray="18 60"
        style={{ filter: `drop-shadow(0 0 4px ${glowColor}) drop-shadow(0 0 10px ${glowColor})`, animation: `dash-flow-${idx % 4} ${dur}s linear ${delay}s infinite` }} />
      <path d={d} fill="none" stroke="white" strokeWidth={1.5} strokeOpacity={0.7}
        strokeDasharray="4 74"
        style={{ filter: `drop-shadow(0 0 6px white)`, animation: `dash-flow-${idx % 4} ${dur}s linear ${delay}s infinite` }} />
      <circle cx={belowThreshold ? a.x + a.w / 2 : ax} cy={belowThreshold ? a.y + a.h : ay}
        r={4.5} fill={glowColor} stroke="rgba(0,0,0,.6)" strokeWidth={1.5}
        style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }} />
      <circle cx={belowThreshold ? b.x + b.w / 2 : bx} cy={belowThreshold ? b.y : by}
        r={4.5} fill={glowColor} stroke="rgba(0,0,0,.6)" strokeWidth={1.5}
        style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }} />
    </g>
  );
}

// ─── Canvas Page ──────────────────────────────────────────────────────────────
export default function CanvasPage({ navigate: _navigate }: Nav) {
  const [nodes, setNodes] = useState<CanvasNode[]>(INIT_NODES);
  const [pan, setPan] = useState({ x: 60, y: 40 });
  const [zoom, setZoom] = useState(1);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOrigin, setPanOrigin] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const minX = Math.min(...nodes.map(n => n.x)) - 120;
  const minY = Math.min(...nodes.map(n => n.y)) - 120;
  const maxX = Math.max(...nodes.map(n => n.x + n.w)) + 120;
  const maxY = Math.max(...nodes.map(n => n.y + n.h)) + 120;
  const svgW = maxX - minX;
  const svgH = maxY - minY;

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(2.5, Math.max(0.25, z - e.deltaY * 0.001)));
  }, []);

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.altKey) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setPanOrigin({ ...pan });
    }
  };
  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: panOrigin.x + (e.clientX - panStart.x), y: panOrigin.y + (e.clientY - panStart.y) });
    }
    if (draggingNode) {
      setNodes(prev => prev.map(n =>
        n.id === draggingNode
          ? { ...n, x: (e.clientX - dragOffset.x - pan.x) / zoom, y: (e.clientY - dragOffset.y - pan.y) / zoom }
          : n
      ));
    }
  };
  const onCanvasMouseUp = () => { setIsPanning(false); setDraggingNode(null); };

  const onNodeMouseDown = (e: React.MouseEvent, node: CanvasNode) => {
    e.stopPropagation();
    setDraggingNode(node.id);
    setDragOffset({ x: e.clientX - (node.x * zoom + pan.x), y: e.clientY - (node.y * zoom + pan.y) });
  };

  return (
    <div ref={containerRef} style={{
      width: "100%", height: "100%", position: "relative", overflow: "hidden",
      background: "#060409", userSelect: "none", cursor: isPanning ? "grabbing" : "default"
    }}
      onWheel={onWheel} onMouseDown={onCanvasMouseDown}
      onMouseMove={onCanvasMouseMove} onMouseUp={onCanvasMouseUp} onMouseLeave={onCanvasMouseUp}>

      {/* Dot-grid background */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs>
          <pattern id="dots" x={pan.x % (20 * zoom)} y={pan.y % (20 * zoom)}
            width={20 * zoom} height={20 * zoom} patternUnits="userSpaceOnUse">
            <circle cx={1} cy={1} r={0.8} fill="rgba(255,255,255,.08)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Keyframes */}
      <style>{`
        @keyframes dash-flow-0 { to { stroke-dashoffset: -78; } }
        @keyframes dash-flow-1 { to { stroke-dashoffset: -78; } }
        @keyframes dash-flow-2 { to { stroke-dashoffset: -78; } }
        @keyframes dash-flow-3 { to { stroke-dashoffset: -78; } }
      `}</style>

      {/* Transformed canvas */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
        transformOrigin: "0 0"
      }}>

        {/* SVG layer: edges */}
        <svg style={{
          position: "absolute", left: minX, top: minY, width: svgW, height: svgH,
          overflow: "visible", pointerEvents: "none"
        }} viewBox={`${minX} ${minY} ${svgW} ${svgH}`}>
          {INIT_EDGES.map((e, i) => (
            <ElectricEdge key={`${e.from}-${e.to}`} from={e.from} to={e.to} nodes={nodes} idx={i} />
          ))}
        </svg>

        {/* Node cards */}
        {nodes.map(node => (
          <div key={node.id}
            onMouseDown={e => onNodeMouseDown(e, node)}
            style={{
              position: "absolute", left: node.x, top: node.y, width: node.w, height: node.h,
              borderRadius: 16, cursor: "grab",
              background: "linear-gradient(145deg,rgba(255,255,255,.07) 0%,transparent 50%),rgba(12,9,20,.97)",
              border: `1px solid ${node.color}44`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,.1), 0 0 0 1px ${node.color}18, 0 8px 32px rgba(0,0,0,.6)`,
              padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6,
            }}>
            {/* Top accent line */}
            <div style={{
              position: "absolute", top: 0, left: 16, right: 16, height: 2, borderRadius: 2,
              background: `linear-gradient(90deg,transparent,${node.color},transparent)`,
              filter: `drop-shadow(0 0 6px ${node.color})`
            }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${node.color}22`, border: `1px solid ${node.color}44`
                }}>
                  <node.icon style={{ width: 14, height: 14, color: node.color }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.9)" }}>{node.label}</span>
              </div>
              {node.badge && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 100,
                  background: `${node.color}30`, border: `1px solid ${node.color}60`, color: node.color
                }}>
                  {node.badge}
                </span>
              )}
            </div>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,.38)", margin: 0 }}>{node.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar overlay */}
      <div style={{
        position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 100,
        background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
        backdropFilter: "blur(20px)", zIndex: 20
      }}>
        {[
          { label: "选择", icon: MousePointer },
          { label: "移动", icon: Move },
          { label: "连线", icon: GitBranch },
          { label: "节点", icon: PlusCircle },
          { label: "文本", icon: Type },
        ].map((t, i) => (
          <button key={t.label} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
            borderRadius: 100, border: "none", fontSize: 12, fontWeight: 500,
            background: i === 0 ? "rgba(255,140,32,.2)" : "transparent",
            color: i === 0 ? "#ffac30" : "rgba(255,255,255,.4)",
          }}>
            <t.icon style={{ width: 13, height: 13, strokeWidth: 1.7 }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Zoom controls */}
      <div style={{ position: "absolute", bottom: 20, right: 20, display: "flex", flexDirection: "column", gap: 4, zIndex: 20 }}>
        {[{ label: "+", delta: 0.15 }, { label: "−", delta: -0.15 }].map(btn => (
          <button key={btn.label} onClick={() => setZoom(z => Math.min(2.5, Math.max(0.25, z + btn.delta)))}
            style={{
              width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)",
              color: "rgba(255,255,255,.6)", fontSize: 18, backdropFilter: "blur(12px)", fontWeight: 300
            }}>
            {btn.label}
          </button>
        ))}
        <button onClick={() => { setZoom(1); setPan({ x: 60, y: 40 }); }}
          style={{
            width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
            backdropFilter: "blur(12px)", color: "rgba(255,255,255,.4)", fontSize: 10, fontWeight: 600
          }}>
          1:1
        </button>
      </div>

      {/* Mini legend */}
      <div style={{ position: "absolute", bottom: 20, left: 20, fontSize: 11,
        color: "rgba(255,255,255,.25)", zIndex: 20, lineHeight: 1.7 }}>
        <div>Alt + 拖拽 / 中键 — 平移</div>
        <div>滚轮 — 缩放</div>
        <div>拖拽节点 — 移动</div>
      </div>
    </div>
  );
}

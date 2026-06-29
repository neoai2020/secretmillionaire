"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface Node {
  id: number;
  x: number;
  y: number;
  delay: number;
}

const NODES: Node[] = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: 10 + ((i * 37) % 80),
  y: 15 + ((i * 23 + i * i) % 65),
  delay: (i % 5) * 0.4,
}));

interface Connection {
  id: string;
  a: Node;
  b: Node;
  length: number;
}

/** Link nearby nodes so the field reads as one live network, not scattered dots. */
function buildConnections(nodes: Node[]): Connection[] {
  const conns: Connection[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const length = Math.hypot(dx, dy);
      if (length < 24) {
        conns.push({ id: `${i}-${j}`, a: nodes[i], b: nodes[j], length });
      }
    }
  }
  return conns.sort((p, q) => p.length - q.length).slice(0, 16);
}

export function GlobalNetworkMap({ active }: { active: boolean }) {
  const nodes = useMemo(() => NODES, []);
  const connections = useMemo(() => buildConnections(NODES), []);
  // A few links carry a travelling "data packet" to imply live extraction.
  const packets = useMemo(() => connections.filter((_, i) => i % 3 === 0).slice(0, 5), [connections]);
  // Hub nodes (anchors of the most links) emit radar ripples.
  const hubs = useMemo(() => [nodes[2], nodes[7], nodes[12]].filter(Boolean), [nodes]);

  return (
    <div className="relative w-full min-h-[200px] sm:min-h-[240px] aspect-[4/3] sm:aspect-[16/9] max-h-[280px] sm:max-h-[340px] rounded-2xl border border-[#45A29E]/20 bg-[#08090d] overflow-hidden">
      {/* Grid + glow backdrop */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(69,162,158,0.15) 0%, transparent 60%), linear-gradient(rgba(69,162,158,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(69,162,158,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        }}
      />

      {/* Rotating radar sweep (active only) */}
      {active && (
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] aspect-square rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(69,162,158,0.18) 28deg, rgba(69,162,158,0.04) 56deg, transparent 70deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Connection lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {connections.map((c, i) => (
          <motion.line
            key={c.id}
            x1={c.a.x}
            y1={c.a.y}
            x2={c.b.x}
            y2={c.b.y}
            stroke={active ? "#45A29E" : "#2a2f3a"}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0 }}
            animate={
              active
                ? { opacity: [0.08, 0.32, 0.08] }
                : { opacity: 0.08 }
            }
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: (i % 5) * 0.3 }}
          />
        ))}
      </svg>

      {/* Travelling data packets (active only) */}
      {active &&
        packets.map((c, i) => (
          <motion.div
            key={`packet-${c.id}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#7fe3df]"
            style={{ boxShadow: "0 0 8px rgba(127,227,223,0.9)", marginLeft: "-3px", marginTop: "-3px" }}
            initial={{ left: `${c.a.x}%`, top: `${c.a.y}%`, opacity: 0 }}
            animate={{
              left: [`${c.a.x}%`, `${c.b.x}%`],
              top: [`${c.a.y}%`, `${c.b.y}%`],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2.4 + (i % 3) * 0.6,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* Radar ripples from hub nodes (active only) */}
      {active &&
        hubs.map((node, i) => (
          <motion.div
            key={`ripple-${node.id}`}
            className="absolute rounded-full border border-[#45A29E]/40"
            style={{ left: `${node.x}%`, top: `${node.y}%`, width: 8, height: 8, marginLeft: -4, marginTop: -4 }}
            animate={{ scale: [1, 6], opacity: [0.5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.9, ease: "easeOut" }}
          />
        ))}

      {/* Nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            marginLeft: "-4px",
            marginTop: "-4px",
            backgroundColor: active ? "#45A29E" : "#3a3f4b",
            boxShadow: active ? "0 0 12px rgba(69,162,158,0.8)" : "none",
          }}
          animate={active ? { opacity: [0.4, 1, 0.4], scale: [1, 1.35, 1] } : { opacity: 0.3 }}
          transition={{ duration: 2 + node.delay, repeat: Infinity, delay: node.delay }}
        />
      ))}

      {/* Scanning bar while not yet connected */}
      {!active && (
        <motion.div
          aria-hidden
          className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#45A29E]/50 to-transparent"
          animate={{ left: ["0%", "100%"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 flex flex-col sm:flex-row sm:justify-between gap-1 text-[9px] sm:text-[10px] text-[#6b7280] uppercase tracking-widest">
        <span>Global Wi-Fi Signals</span>
        <motion.span
          className={active ? "text-[#45A29E]" : ""}
          animate={active ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          {active ? "Private Node Linked" : "Scanning frequencies..."}
        </motion.span>
      </div>
    </div>
  );
}

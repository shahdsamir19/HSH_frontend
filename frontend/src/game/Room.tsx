import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import roomImg from "../assets/room.png";
import { HOTSPOTS, CLUE_META, REQUIRED_CLUES } from "./data";
import { useGame, fmtTime } from "./state";
import { Laptop, Phone, Notebook, Drawer } from "./devices";

type Open = null | "laptop" | "phone" | "notebook" | "drawer";

export function Room() {
  const { setPhase, status, setStatus, clues, progress, toasts, elapsedMs, addClue, opponent, activeGame } = useGame();
  const [open, setOpen] = useState<Open>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [lampHue, setLampHue] = useState(280);
  const [chairAngle, setChairAngle] = useState(0);
  const ready = REQUIRED_CLUES.every((c) => clues.has(c));

  const onHotspotClick = (id: string) => {
    const h = HOTSPOTS.find((x) => x.id === id)!;
    if (h.status.busy) setStatus(h.status.busy);
    else setStatus(h.status.searching);
    if (id === "laptop")   return setOpen("laptop");
    if (id === "phone")    return setOpen("phone");
    if (id === "notebook") return setOpen("notebook");
    if (id === "drawer")   return setOpen("drawer");
    if (id === "lamp")     return setLampHue((h) => (h + 40) % 360);
    if (id === "chair")    return setChairAngle((a) => a + 12);
    if (id === "trash")    return;
    if (id === "backpack") return;
    if (id === "shelf")    return;
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* Room scene */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            <img src={roomImg} alt="Youssef's bedroom" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" />
            {/* Subtle lamp tint that responds to RGB lamp clicks */}
            <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40"
                 style={{ background: `radial-gradient(circle at 50% 35%, oklch(0.6 0.25 ${lampHue} / 0.6), transparent 50%)` }} />
            {/* Hotspot layer */}
            <div className="absolute inset-0">
              {HOTSPOTS.map((h) => (
                <button key={h.id}
                  onMouseEnter={() => setHover(h.id)}
                  onMouseLeave={() => setHover((cur) => cur === h.id ? null : cur)}
                  onClick={() => onHotspotClick(h.id)}
                  className={`absolute rounded-lg transition-all cursor-pointer outline-none ${hover === h.id ? "hotspot-glow" : "bg-transparent"}`}
                  style={{
                    left: `${h.x}%`, top: `${h.y}%`,
                    width: `${h.w}%`, height: `${h.h}%`,
                    transform: h.id === "chair" ? `rotate(${chairAngle * 0.5}deg)` : undefined,
                    transformOrigin: "center",
                  }}
                  aria-label={h.label}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* HUD */}
      <div className="absolute top-3 left-3 z-20 panel rounded-lg px-3 py-2">
        <div className="text-[10px] uppercase tracking-widest text-[oklch(0.78_0.18_235)]">Case 001</div>
        <div className="text-sm font-semibold">The Stolen Game Developer</div>
      </div>

      <div className="absolute top-3 right-3 z-20 panel rounded-lg px-3 py-2 font-mono">
        <div className="text-[10px] uppercase tracking-widest text-[oklch(0.78_0.18_235)]">Time</div>
        <div className="text-lg leading-none">{fmtTime(elapsedMs)}</div>
      </div>

      {/* Hotspot tooltip */}
      {hover && (
        <div className="absolute z-20 px-2 py-1 rounded bg-black/70 text-xs pointer-events-none"
          style={{ left: `${HOTSPOTS.find((h) => h.id === hover)!.x + HOTSPOTS.find((h) => h.id === hover)!.w / 2}%`,
                   top: `${HOTSPOTS.find((h) => h.id === hover)!.y - 2}%`,
                   transform: "translate(-50%, -100%)" }}>
          {HOTSPOTS.find((h) => h.id === hover)!.label}
        </div>
      )}

      {/* Right panel - opponent live status */}
      <div className="absolute right-3 top-20 z-20 w-64 panel rounded-lg p-3 space-y-3 hidden md:block">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[oklch(0.7_0.2_245)] to-[oklch(0.6_0.22_300)] grid place-items-center font-bold">Y</div>
          <div className="text-xs">
            <div className="font-semibold">You</div>
            <div className="text-white/60">{status}</div>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Investigation Progress</div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[oklch(0.7_0.2_235)] to-[oklch(0.7_0.2_295)] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-[10px] mt-1 text-white/60">{Array.from(clues).filter((c) => REQUIRED_CLUES.includes(c)).length} / {REQUIRED_CLUES.length} clues</div>
        </div>
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 grid place-items-center font-bold text-[10px]">
                {(opponent?.username || "R")[0].toUpperCase()}
              </div>
              <span className="font-semibold text-white/80">{opponent?.username || "Opponent"}</span>
            </div>
            <span className="text-white/60">{activeGame?.opponentScore || 0}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-1">
            <div className="h-full bg-rose-500" style={{ width: `${activeGame?.opponentScore || 0}%` }} />
          </div>
          <div className="text-[10px] text-right text-white/50">
            {Math.round((activeGame?.opponentScore || 0) / 20)} / 5 Clues Found
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-3 left-3 z-20 panel rounded-lg px-3 py-2 flex items-center gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[oklch(0.78_0.18_235)]">Evidence</div>
          <div className="text-sm font-semibold font-mono">{Array.from(clues).filter((c) => REQUIRED_CLUES.includes(c)).length} / {REQUIRED_CLUES.length}</div>
        </div>
        <div className="flex gap-1">
          {REQUIRED_CLUES.map((c) => (
            <div key={c} title={clues.has(c) ? CLUE_META[c].title : "Undiscovered Evidence"}
              className={`w-7 h-7 rounded text-sm grid place-items-center ${clues.has(c) ? "bg-[oklch(0.45_0.2_235)] text-white glow-neon-soft" : "bg-white/10 text-white/30 font-bold"}`}>
              {clues.has(c) ? CLUE_META[c].emoji : "?"}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-3 right-3 z-20">
        <button disabled={!ready} onClick={() => setPhase("board")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            ready ? "bg-gradient-to-r from-[oklch(0.7_0.2_235)] to-[oklch(0.7_0.2_295)] text-white pulse-ring glow-neon" : "bg-white/10 text-white/40 cursor-not-allowed"
          }`}>
          🧩 Solve Case
        </button>
      </div>

      {/* Toasts */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ y: -20, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className={`px-4 py-2 rounded-lg shadow-2xl text-sm font-semibold ${
                t.tone === "clue" ? "bg-[oklch(0.45_0.2_235)] text-white glow-neon" : "bg-black/70 text-white"
              }`}>
              <div>{t.text}</div>
              {t.sub && <div className="text-xs opacity-80 font-normal">{t.sub}</div>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Device overlays */}
      <AnimatePresence>
        {open === "laptop"   && <Laptop   onClose={() => { setOpen(null); setStatus("Searching the room"); }} />}
        {open === "phone"    && <Phone    onClose={() => { setOpen(null); setStatus("Searching the room"); }} />}
        {open === "notebook" && <Notebook onClose={() => { setOpen(null); setStatus("Searching the room"); }} />}
        {open === "drawer"   && <Drawer   onClose={() => { setOpen(null); setStatus("Searching the room"); }} />}
      </AnimatePresence>

      {/* Dev shortcut hidden: unused but keeps addClue typed */}
      <button onClick={() => addClue("fake-domain")} className="hidden" />
    </div>
  );
}

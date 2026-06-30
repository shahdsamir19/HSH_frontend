import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGame, fmtTime } from "./state";

export function Intro({ onStart }: { onStart: () => void }) {
  const [typed, setTyped] = useState("");
  const text = [
    "CYBER DETECTIVE — CASE 001",
    "THE STOLEN GAME DEVELOPER",
    "",
    "Victim:     Youssef",
    "Age:        14",
    "Role:       Young Game Developer",
    "Incident:   Developer account stolen.",
    "            Game project disappeared.",
    "",
    "Objective:  Find out what happened —",
    "            before your opponent does.",
  ].join("\n");

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i += 2;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [text]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 grid place-items-center p-6"
         style={{ background: "radial-gradient(circle at 50% 30%, oklch(0.25 0.1 270 / 0.7), transparent 60%), oklch(0.08 0.03 265)" }}>
      <div className="max-w-2xl w-full panel rounded-2xl p-6 scanlines relative glow-neon">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[oklch(0.78_0.18_235)]">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" /> Classified · Police Case File
        </div>
        <pre className="mt-4 font-mono text-sm whitespace-pre-wrap leading-relaxed text-white/90">{typed}<span className="animate-pulse">▌</span></pre>
        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-white/50">Both players must press start.</div>
          <button onClick={onStart} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[oklch(0.7_0.2_235)] to-[oklch(0.7_0.2_295)] text-white font-semibold glow-neon">
            ▶ Start Investigation
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function Countdown({ onGo }: { onGo: () => void }) {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (n === 0) { const t = setTimeout(onGo, 600); return () => clearTimeout(t); }
    const t = setTimeout(() => setN((x) => x - 1), 900);
    return () => clearTimeout(t);
  }, [n, onGo]);
  return (
    <div className="fixed inset-0 grid place-items-center bg-black text-white">
      <motion.div key={n} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 2, opacity: 0 }}
        className="text-9xl font-black text-glow">
        {n === 0 ? "GO" : n}
      </motion.div>
    </div>
  );
}

export function Result() {
  const { timelineScore, attackScore, preventionScore, elapsedMs, clues, setPhase } = useGame();
  const evidenceFound = clues.size;
  const overall = Math.round(
    timelineScore * 0.35 + attackScore * 0.2 + preventionScore * 0.2 + (evidenceFound / 5) * 100 * 0.15 + 100 * 0.1
  );
  const won = overall >= 70;

  return (
    <div className="fixed inset-0 overflow-auto grid place-items-center p-6 text-white"
         style={{ background: "radial-gradient(circle at 50% 40%, oklch(0.3 0.2 240 / 0.55), transparent 60%), oklch(0.08 0.03 265)" }}>
      <div className="max-w-2xl w-full panel rounded-2xl p-8 text-center glow-neon">
        <div className="text-[10px] uppercase tracking-widest text-[oklch(0.78_0.18_235)]">Match Result</div>
        <h1 className="text-4xl font-black mt-1 text-glow">{won ? "MISSION SUCCESS" : "Investigation Complete"}</h1>
        <p className="mt-2 text-white/70">{won ? "Case solved. Great work, detective." : "Your opponent solved the case first — keep practicing."}</p>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
          <Stat label="Overall" value={`${overall}%`} highlight />
          <Stat label="Timeline" value={`${timelineScore}%`} />
          <Stat label="Attack ID" value={`${attackScore}%`} />
          <Stat label="Prevention" value={`${preventionScore}%`} />
          <Stat label="Evidence" value={`${evidenceFound}/5`} />
          <Stat label="Time" value={fmtTime(elapsedMs)} />
        </div>

        <div className="mt-6 panel rounded-xl p-4 text-left">
          <div className="text-xs uppercase tracking-widest text-[oklch(0.78_0.18_235)] mb-2">What you learned</div>
          <ul className="text-sm space-y-1 text-white/90">
            <li>✔ Always verify email domains carefully.</li>
            <li>✔ Never download unknown executable files.</li>
            <li>✔ Never write passwords in plain text.</li>
            <li>✔ Enable Two-Factor Authentication.</li>
            <li>✔ Keep your antivirus enabled.</li>
            <li>✔ Report phishing instead of ignoring it.</li>
          </ul>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
          <Reward label="XP" value={won ? "+250" : "+120"} />
          <Reward label="Coins" value={won ? "+100" : "+40"} />
          <Reward label="Badge" value={won ? "Digital Detective" : "Investigator"} />
        </div>

        <button onClick={() => { window.location.reload(); }} className="mt-8 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[oklch(0.7_0.2_235)] to-[oklch(0.7_0.2_295)] font-semibold glow-neon">
          Play Again
        </button>
        <button onClick={() => setPhase("board")} className="ml-3 text-xs text-white/60 hover:text-white">← Back to board</button>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? "bg-[oklch(0.45_0.2_235)]/30 glow-neon-soft" : "bg-white/5"}`}>
      <div className="text-[10px] uppercase tracking-widest text-white/60">{label}</div>
      <div className="text-lg font-bold font-mono">{value}</div>
    </div>
  );
}

function Reward({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3 bg-white/5">
      <div className="text-[10px] uppercase tracking-widest text-white/60">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

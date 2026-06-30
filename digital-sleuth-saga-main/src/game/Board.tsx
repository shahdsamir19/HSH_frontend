import { motion } from "framer-motion";
import { useState } from "react";
import { useGame, fmtTime } from "./state";
import { CLUE_META, TIMELINE_CORRECT, ATTACK_TYPES, PREVENTION, REQUIRED_CLUES, type ClueId } from "./data";

export function Board() {
  const { clues, setPhase, setBoardScores, elapsedMs, pushToast } = useGame();
  const collected = Array.from(clues).filter((c) => REQUIRED_CLUES.includes(c));
  const [order, setOrder] = useState<ClueId[]>([]); // user-built timeline
  const [attacks, setAttacks] = useState<Set<string>>(new Set());
  const [prev, setPrev] = useState<Set<string>>(new Set());

  const move = (id: ClueId, dir: -1 | 1) => {
    setOrder((arr) => {
      const idx = arr.indexOf(id);
      const ni = idx + dir;
      if (idx < 0 || ni < 0 || ni >= arr.length) return arr;
      const cp = [...arr];
      [cp[idx], cp[ni]] = [cp[ni], cp[idx]];
      return cp;
    });
  };
  const add = (id: ClueId) => setOrder((arr) => arr.includes(id) ? arr : [...arr, id]);
  const remove = (id: ClueId) => setOrder((arr) => arr.filter((x) => x !== id));

  const toggle = (set: Set<string>, setSet: (s: Set<string>) => void, id: string) => {
    const n = new Set(set);
    n.has(id) ? n.delete(id) : n.add(id);
    setSet(n);
  };

  const submit = () => {
    // Timeline score: items in correct position
    const correctSlots = order.reduce((acc, id, i) => acc + (TIMELINE_CORRECT[i] === id ? 1 : 0), 0);
    const timeline = Math.round((correctSlots / TIMELINE_CORRECT.length) * 100);

    const correctAttacks = ATTACK_TYPES.filter((a) => a.correct).map((a) => a.id);
    const tpA = correctAttacks.filter((id) => attacks.has(id)).length;
    const fpA = Array.from(attacks).filter((id) => !correctAttacks.includes(id)).length;
    const attack = Math.max(0, Math.round(((tpA - fpA) / correctAttacks.length) * 100));

    const correctPrev = PREVENTION.filter((a) => a.correct).map((a) => a.id);
    const tpP = correctPrev.filter((id) => prev.has(id)).length;
    const fpP = Array.from(prev).filter((id) => !correctPrev.includes(id)).length;
    const prevention = Math.max(0, Math.round(((tpP - fpP) / correctPrev.length) * 100));

    setBoardScores({ timeline, attack, prevention });
    pushToast({ tone: "info", text: "Investigation submitted", sub: "Beginning recovery..." });
    setPhase("recovery");
  };

  const canSubmit = order.length === TIMELINE_CORRECT.length && attacks.size > 0 && prev.size > 0;

  return (
    <div className="fixed inset-0 overflow-auto p-6 text-white"
         style={{ background: "radial-gradient(circle at 20% 10%, oklch(0.25 0.1 270 / 0.6), transparent 60%), radial-gradient(circle at 80% 90%, oklch(0.2 0.1 230 / 0.6), transparent 60%), oklch(0.1 0.04 265)" }}>
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[oklch(0.78_0.18_235)]">Investigation Board</div>
            <h1 className="text-2xl font-bold">Case 001 — Reconstruct the Incident</h1>
          </div>
          <div className="panel rounded-lg px-3 py-2 font-mono text-sm">{fmtTime(elapsedMs)}</div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Evidence library */}
          <section className="panel rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-3 text-[oklch(0.78_0.18_235)]">📁 Evidence Library</h2>
            <ul className="space-y-2">
              {collected.map((c) => {
                const m = CLUE_META[c];
                const inTimeline = order.includes(c);
                return (
                  <li key={c} className="p-2 rounded border border-white/10 bg-white/5 flex items-center gap-2">
                    <span className="text-lg">{m.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{m.title}</div>
                      <div className="text-[10px] text-white/60">Found in: {m.where}</div>
                    </div>
                    <button onClick={() => inTimeline ? remove(c) : add(c)}
                      className={`text-[10px] px-2 py-1 rounded ${inTimeline ? "bg-rose-500/30 text-rose-200" : "bg-[oklch(0.45_0.2_235)] text-white"}`}>
                      {inTimeline ? "Remove" : "+ Timeline"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Timeline */}
          <section className="panel rounded-xl p-4 lg:col-span-2">
            <h2 className="text-sm font-semibold mb-3 text-[oklch(0.78_0.18_235)]">🧵 Timeline Reconstruction</h2>
            {order.length === 0 ? (
              <div className="text-sm text-white/50 italic">Add evidence from the library and place it in the correct chronological order.</div>
            ) : (
              <ol className="space-y-2">
                {order.map((id, i) => {
                  const m = CLUE_META[id];
                  return (
                    <li key={id} className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/10">
                      <span className="w-7 h-7 rounded-full bg-[oklch(0.45_0.2_235)] grid place-items-center text-xs font-bold">{i + 1}</span>
                      <span className="text-lg">{m.emoji}</span>
                      <span className="flex-1 text-sm">{m.title}</span>
                      <button onClick={() => move(id, -1)} className="px-2 py-1 rounded bg-white/10 text-xs">↑</button>
                      <button onClick={() => move(id, 1)} className="px-2 py-1 rounded bg-white/10 text-xs">↓</button>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          {/* Attack type */}
          <section className="panel rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-3 text-[oklch(0.78_0.18_235)]">⚠ Attack Type</h2>
            <p className="text-xs text-white/60 mb-3">Select every category that applies.</p>
            <div className="grid grid-cols-1 gap-2">
              {ATTACK_TYPES.map((a) => (
                <Chip key={a.id} active={attacks.has(a.id)} onClick={() => toggle(attacks, setAttacks, a.id)}>{a.label}</Chip>
              ))}
            </div>
          </section>

          {/* Prevention */}
          <section className="panel rounded-xl p-4 lg:col-span-2">
            <h2 className="text-sm font-semibold mb-3 text-[oklch(0.78_0.18_235)]">🛡 Preventive Actions</h2>
            <p className="text-xs text-white/60 mb-3">Build a checklist of how this attack could have been prevented.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PREVENTION.map((a) => (
                <Chip key={a.id} active={prev.has(a.id)} onClick={() => toggle(prev, setPrev, a.id)}>{a.label}</Chip>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button onClick={() => setPhase("room")} className="text-sm text-white/60 hover:text-white">← Back to room</button>
          <motion.button whileHover={{ scale: canSubmit ? 1.03 : 1 }} disabled={!canSubmit} onClick={submit}
            className={`px-6 py-3 rounded-lg font-semibold ${canSubmit ? "bg-gradient-to-r from-[oklch(0.7_0.2_235)] to-[oklch(0.7_0.2_295)] glow-neon" : "bg-white/10 text-white/40 cursor-not-allowed"}`}>
            Submit Investigation →
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`text-left text-sm px-3 py-2 rounded-lg border transition-all ${
        active ? "bg-[oklch(0.45_0.2_235)]/30 border-[oklch(0.7_0.2_235)] text-white glow-neon-soft" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
      }`}>
      <span className="mr-2">{active ? "☑" : "☐"}</span>{children}
    </button>
  );
}

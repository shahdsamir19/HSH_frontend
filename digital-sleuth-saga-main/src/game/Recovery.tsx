import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useGame } from "./state";

const PIECES = ["Cyber", "Fox", "Game", "Hero", "Blue", "2026", "#", "!", "@", "$", "9", "Star"];

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 5);
}

export function Recovery() {
  const { setPhase, recoveryDone, markRecovery, pushToast } = useGame();
  const [pw, setPw] = useState<string[]>([]);
  const [twofa, setTwofa] = useState(false);
  const [malwareDeleted, setMalwareDeleted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanned, setScanned] = useState(false);
  const [reported, setReported] = useState(false);

  const pwStr = pw.join("");
  const pwScore = strength(pwStr);

  const acceptPw = () => {
    if (pwScore < 4) return pushToast({ tone: "warn", text: "Password too weak — try adding length and symbols." });
    markRecovery("password");
    pushToast({ tone: "clue", text: "✔ Strong password set", sub: "Long passwords with symbols resist cracking." });
  };
  const acceptTwofa = () => {
    setTwofa(true);
    markRecovery("2fa");
    pushToast({ tone: "clue", text: "✔ 2FA enabled", sub: "Adds a layer even if a password leaks." });
  };
  const deleteMalware = () => {
    setMalwareDeleted(true);
    markRecovery("malware");
    pushToast({ tone: "clue", text: "✔ Malware quarantined" });
  };
  const runScan = () => {
    if (scanning || scanned) return;
    setScanning(true);
    const t = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) { clearInterval(t); setScanning(false); setScanned(true); markRecovery("scan"); pushToast({ tone: "clue", text: "✔ System scan complete" }); return 100; }
        return p + 8;
      });
    }, 120);
  };
  const reportPhish = () => {
    setReported(true);
    markRecovery("report");
    pushToast({ tone: "clue", text: "✔ Phishing reported", sub: "Helps protect other users." });
  };

  const total = 5;
  const done = recoveryDone.size;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="fixed inset-0 overflow-auto p-6 text-white"
         style={{ background: "radial-gradient(circle at 80% 20%, oklch(0.3 0.18 230 / 0.5), transparent 60%), oklch(0.12 0.04 265)" }}>
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <div className="text-[10px] uppercase tracking-widest text-[oklch(0.78_0.18_235)]">Phase 3</div>
          <h1 className="text-2xl font-bold">Recovery Mission — Secure Youssef's Computer</h1>
          <div className="mt-4 h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[oklch(0.7_0.2_235)] to-[oklch(0.7_0.2_295)] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-xs text-white/60 mt-1">{done} / {total} tasks complete</div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Task n={1} title="Create a strong password" done={recoveryDone.has("password")}>
            <div className="flex flex-wrap gap-2 mb-3">
              {PIECES.map((p, i) => (
                <button key={i} onClick={() => setPw((x) => [...x, p])}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono">{p}</button>
              ))}
            </div>
            <div className="font-mono text-sm bg-black/40 rounded p-2 min-h-9">{pwStr || <span className="text-white/40">build a password...</span>}</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full transition-all" style={{ width: `${(pwScore / 5) * 100}%`, background: pwScore >= 4 ? "oklch(0.7 0.2 150)" : pwScore >= 2 ? "oklch(0.75 0.18 80)" : "oklch(0.65 0.22 25)" }} />
              </div>
              <button onClick={() => setPw([])} className="text-xs text-white/60">Clear</button>
              <button onClick={acceptPw} disabled={recoveryDone.has("password")} className="text-xs px-3 py-1 rounded bg-[oklch(0.45_0.2_235)] disabled:opacity-40">Save</button>
            </div>
          </Task>

          <Task n={2} title="Enable Two-Factor Authentication" done={recoveryDone.has("2fa")}>
            <div className="flex items-center justify-between p-3 rounded bg-black/30">
              <div>
                <div className="text-sm font-semibold">2FA</div>
                <div className="text-xs text-white/60">SMS code on sign-in</div>
              </div>
              <button onClick={acceptTwofa} className={`relative w-14 h-7 rounded-full transition-colors ${twofa ? "bg-[oklch(0.7_0.2_150)]" : "bg-white/15"}`}>
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${twofa ? "left-7" : "left-0.5"}`} />
              </button>
            </div>
          </Task>

          <Task n={3} title="Remove the malicious file" done={recoveryDone.has("malware")}>
            <div className="space-y-1">
              {["Homework.pdf", "HolidayPhoto.png", "FastRender.exe", "Presentation.pptx"].map((f) => (
                <div key={f} className={`flex items-center justify-between px-2 py-1.5 rounded ${f === "FastRender.exe" && !malwareDeleted ? "bg-rose-500/15" : "bg-white/5"}`}>
                  <span className="text-sm font-mono">{f === "FastRender.exe" && malwareDeleted ? <s className="opacity-50">{f}</s> : f}</span>
                  {f === "FastRender.exe" && !malwareDeleted && (
                    <button onClick={deleteMalware} className="text-xs px-2 py-1 rounded bg-rose-500/40">Delete</button>
                  )}
                </div>
              ))}
            </div>
          </Task>

          <Task n={4} title="Run a full antivirus scan" done={recoveryDone.has("scan")}>
            <div className="p-3 rounded bg-black/30">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm">Windows Defender</div>
                <div className={`text-xs ${scanned ? "text-emerald-300" : "text-rose-300"}`}>{scanned ? "Protected" : "Off"}</div>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                <div className="h-full bg-emerald-400 transition-all" style={{ width: `${scanProgress}%` }} />
              </div>
              <button onClick={runScan} disabled={scanning || scanned} className="text-xs px-3 py-1 rounded bg-[oklch(0.45_0.2_235)] disabled:opacity-40">
                {scanned ? "Scan complete" : scanning ? `Scanning ${scanProgress}%` : "Run Full Scan"}
              </button>
            </div>
          </Task>

          <Task n={5} title="Report the phishing email" done={recoveryDone.has("report")}>
            <div className="p-3 rounded bg-black/30">
              <div className="text-sm font-semibold">⚠ Unusual login attempt</div>
              <div className="text-xs text-white/60 font-mono">security@gma1l.com</div>
              <button onClick={reportPhish} disabled={reported} className="mt-3 text-xs px-3 py-1 rounded bg-amber-500/70 disabled:opacity-40">
                {reported ? "Reported ✓" : "Report Phishing"}
              </button>
            </div>
          </Task>
        </div>

        <div className="mt-8 flex justify-end">
          <motion.button whileHover={{ scale: done === total ? 1.04 : 1 }} disabled={done < total} onClick={() => setPhase("result")}
            className={`px-6 py-3 rounded-lg font-semibold ${done === total ? "bg-gradient-to-r from-[oklch(0.7_0.2_150)] to-[oklch(0.7_0.2_235)] glow-neon" : "bg-white/10 text-white/40 cursor-not-allowed"}`}>
            Finish Mission →
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function Task({ n, title, done, children }: { n: number; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <section className={`panel rounded-xl p-4 transition-all ${done ? "ring-1 ring-emerald-400/40" : ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${done ? "bg-emerald-400 text-black" : "bg-[oklch(0.45_0.2_235)] text-white"}`}>{done ? "✓" : n}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

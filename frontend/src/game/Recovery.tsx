import { motion } from "framer-motion";
import { useState } from "react";
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

// URLs the player must choose between (Task 4 — Safe Browsing)
const BROWSER_URLS = [
  { url: "game-dev-secure-login.net", safe: false },
  { url: "gamedeveloper.com",         safe: true  },
  { url: "g4medeveloper.com",         safe: false },
  { url: "gamedeveloper.net",         safe: false },
];

export function Recovery() {
  const { setPhase, recoveryDone, markRecovery, pushToast, finishRecovery } = useGame();

  // Task 1 — Strong Password
  const [pw, setPw] = useState<string[]>([]);
  const pwStr = pw.join("");
  const pwScore = strength(pwStr);

  // Task 2 — 2FA
  const [twofa, setTwofa] = useState(false);

  // Task 3 — Identify phishing email
  const [emailChoice, setEmailChoice] = useState<string | null>(null);

  // Task 4 — Safe Browsing
  const [urlChoice, setUrlChoice] = useState<string | null>(null);

  const acceptPw = () => {
    if (pwScore < 4) return pushToast({ tone: "warn", text: "Password too weak — try adding length and symbols." });
    markRecovery("password");
    pushToast({ tone: "clue", text: "✔ Strong password set", sub: "Long passwords with symbols resist cracking." });
  };

  const acceptTwofa = () => {
    setTwofa(true);
    markRecovery("2fa");
    pushToast({ tone: "clue", text: "✔ 2FA enabled", sub: "Adds a second layer of protection even if your password leaks." });
  };

  const pickEmail = (id: string, isPhishing: boolean) => {
    if (recoveryDone.has("phishing")) return;
    setEmailChoice(id);
    if (isPhishing) {
      markRecovery("phishing");
      pushToast({ tone: "clue", text: "✔ Phishing email identified!", sub: "Fake sender, urgent language, suspicious link — classic phishing." });
    } else {
      pushToast({ tone: "warn", text: "That's a real email — look for the suspicious one." });
    }
  };

  const pickUrl = (url: string, safe: boolean) => {
    if (recoveryDone.has("safe-browse")) return;
    setUrlChoice(url);
    if (safe) {
      markRecovery("safe-browse");
      pushToast({ tone: "clue", text: "✔ Correct! Official website selected", sub: "Always verify the exact URL before you log in." });
    } else {
      pushToast({ tone: "warn", text: "That looks like a fake domain! Find the real one." });
    }
  };

  const total = 4;
  const done = recoveryDone.size;
  const pct = Math.round((done / total) * 100);

  const FAKE_EMAILS = [
    { id: "e1", from: "noreply@discord.com",   subject: "Welcome to Pixel Pals server!", isPhishing: false },
    { id: "e2", from: "support@steampowered.com", subject: "Your weekly wishlist sale",   isPhishing: false },
    { id: "e3", from: "accounts@garne-developer-support.com", subject: "⚠️ Your account will be SUSPENDED", isPhishing: true },
    { id: "e4", from: "team@unity.com",        subject: "New tutorial: Lighting in Unity", isPhishing: false },
  ];

  return (
    <div className="fixed inset-0 overflow-auto p-6 text-white"
         style={{ background: "radial-gradient(circle at 80% 20%, oklch(0.3 0.18 230 / 0.5), transparent 60%), oklch(0.12 0.04 265)" }}>
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <div className="text-[10px] uppercase tracking-widest text-[oklch(0.78_0.18_235)]">Phase 3 — Recovery Mission</div>
          <h1 className="text-2xl font-bold">Secure Youssef's Account</h1>
          <p className="text-sm text-white/60 mt-1">Apply the four Level 1 cybersecurity fixes to protect the account.</p>
          <div className="mt-4 h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[oklch(0.7_0.2_235)] to-[oklch(0.7_0.2_295)] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-xs text-white/60 mt-1">{done} / {total} tasks complete</div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Task 1 — Strong Password */}
          <Task n={1} title="Create a strong password" done={recoveryDone.has("password")}
                lesson="A strong password is long (12+ chars), uses uppercase, numbers, and symbols.">
            <p className="text-xs text-white/60 mb-2">Youssef's password was <code className="text-rose-300">123456</code>. Build a strong one:</p>
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
              <span className="text-xs text-white/50">{["Very weak","Weak","Fair","Good","Strong","Very strong"][pwScore]}</span>
              <button onClick={() => setPw([])} className="text-xs text-white/60">Clear</button>
              <button onClick={acceptPw} disabled={recoveryDone.has("password")} className="text-xs px-3 py-1 rounded bg-[oklch(0.45_0.2_235)] disabled:opacity-40">Save</button>
            </div>
          </Task>

          {/* Task 2 — Enable 2FA */}
          <Task n={2} title="Enable Two-Factor Authentication" done={recoveryDone.has("2fa")}
                lesson="2FA sends a code to your phone so that even if your password is stolen, the attacker cannot log in.">
            <p className="text-xs text-white/60 mb-3">2FA was turned off in Youssef's account settings. Enable it now:</p>
            <div className="flex items-center justify-between p-3 rounded bg-black/30">
              <div>
                <div className="text-sm font-semibold">Two-Factor Authentication</div>
                <div className="text-xs text-white/60">{twofa ? "SMS code required on every sign-in ✓" : "Currently disabled — vulnerable!"}</div>
              </div>
              <button onClick={acceptTwofa} disabled={recoveryDone.has("2fa")}
                className={`relative w-14 h-7 rounded-full transition-colors disabled:cursor-not-allowed ${twofa ? "bg-[oklch(0.7_0.2_150)]" : "bg-white/15"}`}>
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${twofa ? "left-7" : "left-0.5"}`} />
              </button>
            </div>
          </Task>

          {/* Task 3 — Identify the phishing email */}
          <Task n={3} title="Identify the phishing email" done={recoveryDone.has("phishing")}
                lesson="Phishing emails use fake senders, urgent threats, and suspicious links to steal your password.">
            <p className="text-xs text-white/60 mb-2">One of these emails is a phishing attempt. Tap it to report it:</p>
            <div className="space-y-2">
              {FAKE_EMAILS.map((e) => {
                const picked = emailChoice === e.id;
                const correct = picked && e.isPhishing;
                const wrong   = picked && !e.isPhishing;
                return (
                  <button key={e.id} onClick={() => pickEmail(e.id, e.isPhishing)} disabled={recoveryDone.has("phishing")}
                    className={`w-full text-left p-2 rounded border text-xs transition-all disabled:cursor-default ${
                      correct ? "bg-rose-500/20 border-rose-400 text-rose-200" :
                      wrong   ? "bg-yellow-500/10 border-yellow-400/40 text-yellow-200" :
                                "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}>
                    <div className="font-mono text-white/60">{e.from}</div>
                    <div className="font-semibold mt-0.5">{e.subject}</div>
                    {correct && <div className="mt-1 text-[10px] text-rose-300">⚠ Phishing detected — fake sender & suspicious link!</div>}
                  </button>
                );
              })}
            </div>
          </Task>

          {/* Task 4 — Safe Browsing */}
          <Task n={4} title="Navigate only to the legitimate website" done={recoveryDone.has("safe-browse")}
                lesson="Always check the exact URL. Attackers create lookalike domains (e.g. game-dev-secure-login.net vs gamedeveloper.com).">
            <p className="text-xs text-white/60 mb-2">Youssef wants to log into the Game Developer portal. Which URL is the real one?</p>
            <div className="space-y-2">
              {BROWSER_URLS.map((u) => {
                const picked = urlChoice === u.url;
                const correct = picked && u.safe;
                const wrong   = picked && !u.safe;
                return (
                  <button key={u.url} onClick={() => pickUrl(u.url, u.safe)} disabled={recoveryDone.has("safe-browse")}
                    className={`w-full text-left px-3 py-2 rounded border font-mono text-sm transition-all disabled:cursor-default ${
                      correct ? "bg-emerald-500/20 border-emerald-400 text-emerald-200" :
                      wrong   ? "bg-rose-500/15 border-rose-400/40 text-rose-200" :
                                "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}>
                    {u.url}
                    {correct && <span className="ml-2 text-[10px] text-emerald-300">✓ Official domain</span>}
                    {wrong   && <span className="ml-2 text-[10px] text-rose-300">⚠ Fake / suspicious domain</span>}
                  </button>
                );
              })}
            </div>
          </Task>
        </div>

        <div className="mt-8 flex justify-end">
          <motion.button whileHover={{ scale: done === total ? 1.04 : 1 }} disabled={done < total} onClick={() => {
            if (finishRecovery) finishRecovery(pct);
            setPhase("result");
          }}
            className={`px-6 py-3 rounded-lg font-semibold ${done === total ? "bg-gradient-to-r from-[oklch(0.7_0.2_150)] to-[oklch(0.7_0.2_235)] glow-neon" : "bg-white/10 text-white/40 cursor-not-allowed"}`}>
            Finish Mission →
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function Task({ n, title, done, lesson, children }: { n: number; title: string; done: boolean; lesson: string; children: React.ReactNode }) {
  return (
    <section className={`panel rounded-xl p-4 transition-all ${done ? "ring-1 ring-emerald-400/40" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold shrink-0 ${done ? "bg-emerald-400 text-black" : "bg-[oklch(0.45_0.2_235)] text-white"}`}>{done ? "✓" : n}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-[10px] text-[oklch(0.78_0.18_235)] mb-3 pl-9">💡 {lesson}</p>
      {children}
    </section>
  );
}

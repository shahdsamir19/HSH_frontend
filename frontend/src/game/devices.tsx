import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import {
  BROWSER_HISTORY, EMAILS, DOWNLOADS,
  WHATSAPP_CHATS, NOTEBOOK_PAGES, DRAWER_ITEMS,
  ACCOUNT_SETTINGS, type ClueId,
} from "./data";
import { useGame } from "./state";

/* ---------------- Shared shell ---------------- */
function DeviceShell({ children, onClose, label }: { children: ReactNode; onClose: () => void; label: string }) {
  return (
    <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
      className="absolute inset-0 z-30 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl aspect-[16/10] rounded-xl panel glow-neon scanlines overflow-hidden">
        <div className="absolute top-2 left-3 z-10 text-xs uppercase tracking-widest text-[oklch(0.78_0.18_235)]">{label}</div>
        <button onClick={onClose} className="absolute top-2 right-3 z-10 text-xs px-2 py-1 rounded border border-white/20 text-white/80 hover:bg-white/10">Close ✕</button>
        <div className="absolute inset-6 top-9">{children}</div>
      </div>
    </motion.div>
  );
}

/* ---------------- Laptop ---------------- */
type App = null | "browser" | "history" | "email" | "downloads" | "discord" | "documents" | "security" | "recycle" | "settings";

export function Laptop({ onClose }: { onClose: () => void }) {
  const { addClue, setStatus } = useGame();
  const [app, setApp] = useState<App>(null);
  const [openEmail, setOpenEmail] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <DeviceShell onClose={onClose} label="Youssef's Laptop">
      <div className="absolute inset-0 rounded-md overflow-hidden text-white"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, oklch(0.4 0.2 280 / 0.7), transparent 60%), radial-gradient(circle at 80% 80%, oklch(0.4 0.2 230 / 0.7), transparent 60%), oklch(0.18 0.07 270)",
        }}
      >
        {!booted ? (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <div className="mt-3 text-sm opacity-70">Booting Youssef-PC...</div>
            </div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 p-6 grid grid-cols-4 sm:grid-cols-6 gap-3 content-start">
              {[
                { id: "browser", label: "Browser", icon: "🌐" },
                { id: "email", label: "Email", icon: "📧" },
                { id: "discord", label: "Discord", icon: "💬" },
                { id: "downloads", label: "Downloads", icon: "📂" },
                { id: "documents", label: "Documents", icon: "📁" },
                { id: "security", label: "Security", icon: "🛡" },
                { id: "recycle", label: "Recycle Bin", icon: "🗑" },
                { id: "settings", label: "Settings", icon: "⚙" },
              ].map((i) => (
                <button key={i.id} onClick={() => { setApp(i.id as App); setStatus(`Inspecting ${i.label}`); }}
                  className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 transition">
                  <span className="text-3xl drop-shadow">{i.icon}</span>
                  <span className="text-xs">{i.label}</span>
                </button>
              ))}
            </div>

            <div className="absolute left-0 right-0 bottom-0 h-8 bg-black/60 backdrop-blur flex items-center px-3 text-xs text-white/80 border-t border-white/10">
              <span>⊞</span>
              <span className="ml-2">Youssef-PC</span>
              <span className="ml-auto">{new Date().toLocaleTimeString().slice(0, 5)}</span>
            </div>

            <AnimatePresence>
              {app && (
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-4 sm:inset-8 rounded-lg overflow-hidden flex flex-col bg-[oklch(0.96_0.01_250)] text-slate-900 shadow-2xl">
                  <div className="h-8 bg-slate-200 flex items-center px-3 text-xs gap-2 border-b border-slate-300">
                    <span className="font-semibold capitalize">{app}</span>
                    <button onClick={() => { setApp(null); setOpenEmail(null); }} className="ml-auto w-5 h-5 grid place-items-center rounded hover:bg-red-500 hover:text-white">×</button>
                  </div>
                  <div className="flex-1 overflow-auto p-4 text-sm">
                    {app === "browser" && (
                      <BrowserApp onOpenHistory={() => setApp("history")} />
                    )}
                    {app === "history" && (
                      <div>
                        <div className="text-xs text-slate-500 mb-2">Recent history</div>
                        <ul className="divide-y">
                          {BROWSER_HISTORY.map((h) => (
                            <li key={h.url}>
                              <button onClick={() => { if (!h.safe && h.clue) addClue(h.clue); }}
                                className="w-full text-left py-1.5 px-2 hover:bg-blue-50 flex items-center gap-2">
                                <span>🔗</span>
                                <span className="font-mono">{h.url}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {app === "email" && (
                      openEmail ? (() => {
                        const e = EMAILS.find((x) => x.id === openEmail)!;
                        return (
                          <div>
                            <button onClick={() => setOpenEmail(null)} className="text-xs text-blue-600 mb-2">← Inbox</button>
                            <div className="font-semibold text-base">{e.subject}</div>
                            <div className="text-xs text-slate-500 mb-3">From: <span className="font-mono">{e.from}</span></div>
                            <p className="leading-relaxed whitespace-pre-wrap">{e.body}</p>
                            {e.clue && (
                              <button onClick={() => addClue(e.clue!)} className="mt-4 text-xs px-3 py-1.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                🔍 Inspect sender domain
                              </button>
                            )}
                          </div>
                        );
                      })() : (
                        <ul className="divide-y">
                          {EMAILS.map((e) => (
                            <li key={e.id}>
                              <button onClick={() => setOpenEmail(e.id)} className="w-full text-left py-2 px-2 hover:bg-blue-50">
                                <div className="font-semibold">{e.subject}</div>
                                <div className="text-xs text-slate-500 font-mono">{e.from}</div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )
                    )}
                    {app === "downloads" && (
                      <ul className="grid grid-cols-2 gap-2">
                        {DOWNLOADS.map((d) => (
                          <li key={d.name}>
                            <button onClick={() => { if (d.clue) addClue(d.clue); }}
                              className="w-full flex items-center gap-2 p-2 rounded hover:bg-blue-50 border border-slate-200">
                              <span className="text-xl">{d.icon}</span>
                              <span className="text-sm font-mono">{d.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {app === "discord" && <div className="text-slate-600">#general · Pixel Pals server. Nothing unusual here today.</div>}
                    {app === "documents" && <div className="text-slate-600">Homework, sketches, school projects. Nothing suspicious.</div>}
                    {app === "security" && (
                      <div className="space-y-2">
                        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800">🛡 Windows Defender: <b>OFF</b></div>
                        <p className="text-xs text-slate-500">You'll need this later during Recovery.</p>
                      </div>
                    )}
                    {app === "recycle" && <div className="text-slate-600">Empty. Looks like the bin was just cleared.</div>}
                    {app === "settings" && (
                      <div className="space-y-4">
                        <div className="text-slate-600">Display, sound, network... regular settings.</div>
                        <div className="p-3 rounded border border-slate-200">
                          <h4 className="font-semibold text-sm mb-2">Account Security</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm">Two-Factor Authentication</div>
                              <div className="text-xs text-rose-600 font-semibold">Status: Disabled</div>
                            </div>
                            <button onClick={() => addClue(ACCOUNT_SETTINGS.clue)} className="text-xs px-3 py-1.5 rounded bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200">
                              🔍 Inspect
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </DeviceShell>
  );
}

function BrowserApp({ onOpenHistory }: { onOpenHistory: () => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 p-2 rounded bg-slate-100 border border-slate-200">
        <span className="text-slate-400">◀ ▶ ↻</span>
        <span className="flex-1 px-2 py-1 rounded bg-white border border-slate-200 text-xs font-mono text-slate-500">https://newtab</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <button onClick={onOpenHistory} className="p-3 rounded border border-slate-200 hover:bg-blue-50 text-left">
          <div className="font-semibold">🕘 History</div>
          <div className="text-xs text-slate-500">Recently visited sites</div>
        </button>
        <div className="p-3 rounded border border-slate-200 opacity-60"><div className="font-semibold">⭐ Bookmarks</div></div>
        <div className="p-3 rounded border border-slate-200 opacity-60"><div className="font-semibold">⬇ Downloads</div></div>
        <div className="p-3 rounded border border-slate-200 opacity-60"><div className="font-semibold">⚙ Settings</div></div>
      </div>
    </div>
  );
}

/* ---------------- Phone ---------------- */
type PhoneScreen = "lock" | "home" | "whatsapp" | "discord" | "gallery" | "browser" | "notes" | "settings";

export function Phone({ onClose }: { onClose: () => void }) {
  const { addClue } = useGame();
  const [screen, setScreen] = useState<PhoneScreen>("lock");
  const [chat, setChat] = useState<string | null>(null);

  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[320px] h-[640px] rounded-[42px] bg-black border-8 border-neutral-800 shadow-2xl glow-neon overflow-hidden">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-10" />
        <button onClick={onClose} className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white text-black text-sm">✕</button>
        <div className="absolute inset-0 rounded-[34px] overflow-hidden"
          style={{ background: "linear-gradient(160deg, oklch(0.35 0.2 270), oklch(0.25 0.18 230))" }}>
          {screen === "lock" && (
            <button onClick={() => setScreen("home")} className="w-full h-full grid place-items-center text-white">
              <div className="text-center">
                <div className="text-5xl font-light">{new Date().toLocaleTimeString().slice(0, 5)}</div>
                <div className="text-xs opacity-70 mt-1">Tuesday · 3 notifications</div>
                <div className="mt-8 text-xs px-3 py-1 rounded-full bg-white/10 inline-block">tap to unlock</div>
              </div>
            </button>
          )}
          {screen === "home" && (
            <div className="p-4 grid grid-cols-3 gap-3 pt-10 text-white">
              {([
                ["whatsapp", "WhatsApp", "💬"],
                ["discord", "Discord", "🎮"],
                ["gallery", "Gallery", "🖼"],
                ["browser", "Browser", "🌐"],
                ["notes", "Notes", "📝"],
                ["settings", "Settings", "⚙"],
              ] as const).map(([id, label, icon]) => (
                <button key={id} onClick={() => setScreen(id)} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 grid place-items-center text-2xl backdrop-blur">{icon}</div>
                  <div className="text-[10px]">{label}</div>
                </button>
              ))}
            </div>
          )}
          {screen === "whatsapp" && (
            <PhoneApp title="WhatsApp" onBack={() => { setScreen("home"); setChat(null); }}>
              {chat ? (() => {
                const c = WHATSAPP_CHATS.find((x) => x.id === chat)!;
                return (
                  <div className="flex flex-col h-full">
                    <button onClick={() => setChat(null)} className="text-xs text-white/70 mb-2">← Chats</button>
                    <div className="font-semibold text-white mb-2">{c.name}</div>
                    <div className="flex-1 space-y-2 overflow-auto">
                      {c.messages.map((m, i) => {
                        const file = (m as { isFile?: boolean; clue?: ClueId });
                        return (
                          <div key={i} className={`max-w-[80%] rounded-lg px-2 py-1.5 text-xs ${m.from === "Me" ? "ml-auto bg-emerald-500/80" : "bg-white/15"} text-white`}>
                            {file.isFile ? (
                              <button onClick={() => file.clue && addClue(file.clue)} className="flex items-center gap-2 underline">
                                📎 {m.text}
                              </button>
                            ) : m.text}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })() : (
                <ul className="space-y-1">
                  {WHATSAPP_CHATS.map((c) => (
                    <li key={c.id}>
                      <button onClick={() => setChat(c.id)} className="w-full text-left px-2 py-2 rounded hover:bg-white/10 text-white">
                        <div className="text-sm font-semibold">{c.name}</div>
                        <div className="text-xs text-white/60 truncate">{c.last}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </PhoneApp>
          )}
          {screen === "discord" && <PhoneApp title="Discord" onBack={() => setScreen("home")}><p className="text-white/80 text-sm">#general — gaming chatter. Nothing suspicious here.</p></PhoneApp>}
          {screen === "gallery" && (
            <PhoneApp title="Gallery" onBack={() => setScreen("home")}>
              <div className="grid grid-cols-3 gap-2">
                {["🌅", "🎮", "🐶", "🍕", "🎂", "🏖"].map((e, i) => <div key={i} className="aspect-square rounded bg-white/10 grid place-items-center text-2xl">{e}</div>)}
              </div>
            </PhoneApp>
          )}
          {screen === "browser" && <PhoneApp title="Browser" onBack={() => setScreen("home")}><p className="text-white/80 text-sm">YouTube · Scratch · Unity tutorials. Recent activity looks normal.</p></PhoneApp>}
          {screen === "notes" && (
            <PhoneApp title="Notes" onBack={() => setScreen("home")}>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>• Game idea: time-loop puzzle</li>
                <li>• Buy birthday gift for Sara</li>
                <li>• Practice keyboard shortcuts</li>
              </ul>
            </PhoneApp>
          )}
          {screen === "settings" && <PhoneApp title="Settings" onBack={() => setScreen("home")}><p className="text-white/80 text-sm">Wi-Fi, Display, About phone...</p></PhoneApp>}
        </div>
      </div>
    </motion.div>
  );
}

function PhoneApp({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  return (
    <div className="flex flex-col h-full pt-8">
      <div className="px-3 pb-2 flex items-center gap-2 border-b border-white/10">
        <button onClick={onBack} className="text-white text-lg">‹</button>
        <div className="text-white text-sm font-semibold">{title}</div>
      </div>
      <div className="flex-1 overflow-auto p-3">{children}</div>
    </div>
  );
}

/* ---------------- Notebook ---------------- */
export function Notebook({ onClose }: { onClose: () => void }) {
  const { addClue } = useGame();
  const [page, setPage] = useState(0);
  const p = NOTEBOOK_PAGES[page];
  return (
    <DeviceShell onClose={onClose} label="Notebook">
      <div className="absolute inset-0 grid grid-cols-2 gap-4 p-6 rounded-md text-[oklch(0.25_0.06_265)]"
        style={{
          background: "oklch(0.95 0.04 85)",
          backgroundImage: "repeating-linear-gradient(180deg, transparent 0 28px, oklch(0.85 0.05 235 / 0.4) 28px 29px)",
        }}>
        <div>
          <div className="text-xs uppercase tracking-widest opacity-60">Page {page + 1}</div>
          <h3 className="text-2xl font-bold mt-1 italic" style={{ fontFamily: "ui-serif, Georgia, serif" }}>{p.title}</h3>
          <ul className="mt-4 space-y-3" style={{ fontFamily: "ui-serif, Georgia, serif" }}>
            {p.lines.map((l, i) => (
              <li key={i}>
                {p.cluePage ? (
                  <button onClick={() => p.clue && addClue(p.clue)} className="text-left hover:text-[oklch(0.55_0.2_25)] underline-offset-4 hover:underline">{l}</button>
                ) : l}
              </li>
            ))}
          </ul>
          {p.cluePage && <div className="mt-6 text-xs opacity-60">(written in pen, easy to read...)</div>}
        </div>
        <div className="flex flex-col">
          <div className="text-xs uppercase tracking-widest opacity-60">Sketch</div>
          <div className="mt-2 flex-1 rounded border border-dashed border-[oklch(0.6_0.05_265)] grid place-items-center opacity-60">doodle</div>
          <div className="flex justify-between mt-4">
            <button onClick={() => setPage((x) => Math.max(0, x - 1))} disabled={page === 0} className="px-3 py-1 rounded bg-[oklch(0.85_0.05_265)] disabled:opacity-30">← Prev</button>
            <div className="text-xs opacity-60 self-center">{page + 1} / {NOTEBOOK_PAGES.length}</div>
            <button onClick={() => setPage((x) => Math.min(NOTEBOOK_PAGES.length - 1, x + 1))} disabled={page === NOTEBOOK_PAGES.length - 1} className="px-3 py-1 rounded bg-[oklch(0.85_0.05_265)] disabled:opacity-30">Next →</button>
          </div>
        </div>
      </div>
    </DeviceShell>
  );
}

/* ---------------- Drawer ---------------- */
export function Drawer({ onClose }: { onClose: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const item = DRAWER_ITEMS.find((x) => x.id === picked);
  return (
    <DeviceShell onClose={onClose} label="Drawer">
      <div className="absolute inset-0 rounded-md p-6"
        style={{ background: "linear-gradient(180deg, oklch(0.45 0.04 60), oklch(0.3 0.03 60))" }}>
        <div className="grid grid-cols-5 gap-3">
          {DRAWER_ITEMS.map((it) => (
            <button key={it.id} onClick={() => setPicked(it.id)} className="aspect-square rounded-lg bg-[oklch(0.55_0.04_60)] hover:bg-[oklch(0.6_0.04_60)] grid place-items-center text-3xl shadow">
              {it.emoji}
            </button>
          ))}
        </div>
        {item && (
          <div className="mt-6 panel rounded-lg p-4">
            <div className="text-sm font-semibold text-white">{item.label}</div>
            <div className="text-xs text-white/70 mt-1">{item.note}</div>
          </div>
        )}
      </div>
    </DeviceShell>
  );
}

// Case 001 data — Level 1 Learning Objectives only:
//   1. Strong Password
//   2. Two-Factor Authentication (2FA)
//   3. Phishing Spotter
//   4. Safe Browsing

export type ClueId =
  | "weak-password"
  | "no-2fa"
  | "phishing-email"
  | "unsafe-site";

export const REQUIRED_CLUES: ClueId[] = [
  "weak-password",
  "no-2fa",
  "phishing-email",
  "unsafe-site",
];

export const CLUE_META: Record<ClueId, { title: string; where: string; emoji: string; xp: number }> = {
  "weak-password":  { title: "Weak Password Found",         where: "Notebook — Passwords page",   emoji: "🔑", xp: 250 },
  "no-2fa":         { title: "Two-Factor Auth Disabled",    where: "Account Settings",             emoji: "🔒", xp: 250 },
  "phishing-email": { title: "Phishing Email Detected",     where: "Email Inbox",                  emoji: "📧", xp: 250 },
  "unsafe-site":    { title: "Fake Website Visited",        where: "Browser History",              emoji: "🌐", xp: 250 },
};

// Hotspots are % of the background image (1536x1024).
export type Hotspot = {
  id: string;
  label: string;
  // bounding box in percent
  x: number; y: number; w: number; h: number;
  kind: "laptop" | "phone" | "notebook" | "drawer" | "trash" | "backpack" | "shelf" | "lamp" | "chair" | "cup" | "plant";
  status: { searching: string; busy?: string };
};

export const HOTSPOTS: Hotspot[] = [
  { id: "laptop",   label: "Laptop",       x: 29, y: 30, w: 10, h: 22, kind: "laptop",
    status: { searching: "Looking at the laptop", busy: "Inspecting Laptop" } },
  { id: "phone",    label: "Smartphone",   x: 35, y: 53, w: 3,  h: 9,  kind: "phone",
    status: { searching: "Reaching for the phone", busy: "Investigating Phone" } },
  { id: "notebook", label: "Notebook",     x: 25,   y: 54, w: 8, h: 11, kind: "notebook",
    status: { searching: "Opening the notebook", busy: "Reading Notebook" } },
  { id: "drawer",   label: "Drawer",       x: 17,   y: 64, w: 14, h: 17, kind: "drawer",
    status: { searching: "Pulling the drawer", busy: "Searching Drawer" } },
  { id: "trash",    label: "Trash Bin",    x: 17,   y: 80, w: 8,  h: 16, kind: "trash",
    status: { searching: "Checking the trash" } },
  { id: "backpack", label: "Backpack",     x: 3.5,  y: 42, w: 7,  h: 18, kind: "backpack",
    status: { searching: "Checking the backpack" } },
  { id: "shelf",    label: "Bookshelf",    x: 64,   y: 6,  w: 19, h: 52, kind: "shelf",
    status: { searching: "Browsing the shelf" } },
  { id: "lamp",     label: "RGB Lamp",     x: 49,   y: 30, w: 5,  h: 9,  kind: "lamp",
    status: { searching: "Touching the lamp" } },
  { id: "chair",    label: "Gaming Chair", x: 38,   y: 50, w: 17, h: 39, kind: "chair",
    status: { searching: "Spinning the chair" } },
  { id: "cup",      label: "Juice Cup",    x: 19,   y: 49, w: 5,  h: 7,  kind: "cup",
    status: { searching: "Smelling the juice" } },
  { id: "plant",    label: "Plant",        x: 10,   y: 64, w: 8,  h: 14, kind: "plant",
    status: { searching: "Watering the plant" } },
];

// Browser history — one fake lookalike domain is the clue.
export const BROWSER_HISTORY = [
  { url: "google.com",                  safe: true },
  { url: "youtube.com",                 safe: true },
  { url: "github.com",                  safe: true },
  { url: "scratch.mit.edu",             safe: true },
  { url: "unity.com",                   safe: true },
  { url: "stackoverflow.com",           safe: true },
  { url: "itch.io",                     safe: true },
  { url: "minecraft.net",               safe: true },
  { url: "gmail.com",                   safe: true },
  { url: "game-dev-secure-login.net",   safe: false, clue: "unsafe-site" as const },
  { url: "spotify.com",                 safe: true },
  { url: "roblox.com",                  safe: true },
  { url: "docs.google.com",            safe: true },
  { url: "godotengine.org",            safe: true },
  { url: "gamedeveloper.com",           safe: true },
];

// Email inbox — one phishing email is the clue.
export const EMAILS = [
  { id: "e1", from: "noreply@discord.com",   subject: "Welcome to Pixel Pals server!", body: "You're now a member of Pixel Pals. Say hi in #intro!" },
  { id: "e2", from: "support@steampowered.com", subject: "Your weekly wishlist", body: "5 games on sale this week from your wishlist." },
  { id: "e3", from: "teacher@school.edu",    subject: "Math homework reminder",   body: "Don't forget to submit chapter 7 by Friday." },
  { id: "e4", from: "team@unity.com",        subject: "New tutorial: Lighting",   body: "Learn how to bake lightmaps in 10 minutes." },
  {
    id: "e5",
    from: "accounts@garne-developer-support.com",
    subject: "⚠️ Your Game Developer account will be SUSPENDED",
    body: `Dear User,

We have detected suspicious actibity on your Game Developer account.
Your account will be suspended in 24 hours unless you VERIFY NOW.

Click the link bellow to confirm your identity:
  👉 http://game-dev-secure-login.net/verify

Failure to verify will result in permanent account termination.

— Game Developer Security Team`,
    clue: "phishing-email" as const
  },
];

// Downloads folder — no malicious executables in Level 1.
export const DOWNLOADS = [
  { name: "Homework.pdf",      icon: "📄" },
  { name: "HolidayPhoto.png",  icon: "🖼" },
  { name: "MinecraftSkin.png", icon: "🖼" },
  { name: "Presentation.pptx", icon: "📊" },
  { name: "Notes.docx",        icon: "📝" },
  { name: "GameDesign.docx",   icon: "📝" },
];

// Chat messages — friendly conversations only; no file sharing clue in Level 1.
export const WHATSAPP_CHATS = [
  { id: "mom",   name: "Mom",   last: "Dinner at 7 ❤️", messages: [
    { from: "Mom", text: "Don't forget to clean your room." },
    { from: "Me",  text: "Doing it after this build 🛠" },
  ]},
  { id: "sara",  name: "Sara",  last: "Lol that boss was hard", messages: [
    { from: "Sara", text: "Did you finish level 4?" },
    { from: "Me",   text: "Yeah barely 😭" },
  ]},
  { id: "karim", name: "Karim", last: "Did you get that email?", messages: [
    { from: "Karim", text: "Hey! Did you get a weird email from Game Developer support?" },
    { from: "Me",    text: "Yeah... it looked kind of suspicious 🤔" },
    { from: "Karim", text: "Don't click anything! It's probably fake." },
  ]},
];

// Notebook — the password page reveals weak passwords (the clue).
export const NOTEBOOK_PAGES = [
  { title: "Math homework", lines: ["Ch.7 problems 1-12", "Geometry quiz Friday", "Ask Sara about #8"] },
  { title: "Game ideas",    lines: ["Boss: shadow dragon", "Level 5 = ice cave", "Combo system?"] },
  { title: "Bug fixes",     lines: ["Player falls through floor at spawn", "Mute button overlap", "Save file overwrite bug"] },
  {
    title: "Passwords",
    lines: ["Steam: 123456", "Discord: password123", "Developer Portal: Youssef2005"],
    cluePage: true,
    clue: "weak-password" as const
  },
];

// Laptop account settings — 2FA disabled (the clue).
// This is read by the Laptop device in devices.tsx.
export const ACCOUNT_SETTINGS = {
  twoFAEnabled: false,
  clue: "no-2fa" as const,
};

export const DRAWER_ITEMS = [
  { id: "pens",   label: "Pens",    emoji: "🖊", note: "Just pens." },
  { id: "usb",    label: "USB Stick", emoji: "💾", note: "Empty. Nothing on it." },
  { id: "keys",   label: "Keys",    emoji: "🔑", note: "House keys." },
  { id: "candy",  label: "Candy",   emoji: "🍬", note: "Cherry flavor." },
  { id: "bills",  label: "Bills",   emoji: "💵", note: "Lunch money." },
];

// Timeline correct order (chronological sequence of the attack).
// 1. Victim receives phishing email
// 2. Clicks link → visits fake website
// 3. Enters weak password on fake site (account stolen because no 2FA to stop it)
// 4. Account compromised — 2FA was not there to block unauthorized access
export const TIMELINE_CORRECT: ClueId[] = [
  "phishing-email",
  "unsafe-site",
  "weak-password",
  "no-2fa",
];

// Attack type selection — Level 1 only: Phishing and Account Theft.
export const ATTACK_TYPES = [
  { id: "phishing",  label: "Phishing",       correct: true },
  { id: "id-theft",  label: "Account Theft",  correct: true },
  { id: "malware",   label: "Malware / Virus", correct: false },
  { id: "ransom",    label: "Ransomware",      correct: false },
  { id: "ddos",      label: "DDoS Attack",     correct: false },
];

// Preventive Actions — Level 1 only: strong passwords, 2FA, verify URLs, avoid suspicious links.
export const PREVENTION = [
  { id: "strong-pw",   label: "Create a strong password",          correct: true },
  { id: "2fa",         label: "Enable Two-Factor Authentication",   correct: true },
  { id: "verify-url",  label: "Always verify the website URL before logging in", correct: true },
  { id: "no-links",    label: "Never click links in suspicious emails", correct: true },
  { id: "av",          label: "Install antivirus software",         correct: false },
  { id: "vpn",         label: "Always use a VPN",                  correct: false },
  { id: "share-pw",    label: "Share passwords with trusted friends", correct: false },
];

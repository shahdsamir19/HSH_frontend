// Case 001 data: clues, hotspots, app content.
export type ClueId =
  | "fake-domain"
  | "fake-email"
  | "exe-download"
  | "discord-file"
  | "plain-password";

export const REQUIRED_CLUES: ClueId[] = [
  "fake-domain",
  "fake-email",
  "exe-download",
  "discord-file",
  "plain-password",
];

export const CLUE_META: Record<ClueId, { title: string; where: string; emoji: string; xp: number }> = {
  "fake-domain":   { title: "Fake Website Visited",    where: "Browser History",  emoji: "🌐", xp: 200 },
  "fake-email":    { title: "Phishing Email",          where: "Email Inbox",      emoji: "📧", xp: 200 },
  "exe-download":  { title: "Suspicious Executable",   where: "Downloads",        emoji: "📂", xp: 200 },
  "discord-file":  { title: "Unsafe File Sharing",     where: "WhatsApp / Karim", emoji: "💬", xp: 200 },
  "plain-password":{ title: "Plain Text Password",     where: "Notebook page 4",  emoji: "📒", xp: 200 },
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
  { id: "laptop",   label: "Laptop",       x: 22.5, y: 36, w: 18, h: 22, kind: "laptop",
    status: { searching: "Looking at the laptop", busy: "Inspecting Laptop" } },
  { id: "phone",    label: "Smartphone",   x: 35.5, y: 53, w: 7,  h: 9,  kind: "phone",
    status: { searching: "Reaching for the phone", busy: "Investigating Phone" } },
  { id: "notebook", label: "Notebook",     x: 22,   y: 54, w: 13, h: 11, kind: "notebook",
    status: { searching: "Opening the notebook", busy: "Reading Notebook" } },
  { id: "drawer",   label: "Drawer",       x: 17,   y: 64, w: 14, h: 17, kind: "drawer",
    status: { searching: "Pulling the drawer", busy: "Searching Drawer" } },
  { id: "trash",    label: "Trash Bin",    x: 13,   y: 68, w: 6,  h: 14, kind: "trash",
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

// Browser history (one is the dangerous lookalike domain).
export const BROWSER_HISTORY = [
  { url: "google.com",          safe: true },
  { url: "youtube.com",         safe: true },
  { url: "github.com",          safe: true },
  { url: "scratch.mit.edu",     safe: true },
  { url: "unity.com",           safe: true },
  { url: "stackoverflow.com",   safe: true },
  { url: "itch.io",             safe: true },
  { url: "minecraft.net",       safe: true },
  { url: "gmail.com",           safe: true },
  { url: "gma1-security.com",   safe: false, clue: "fake-domain" as const },
  { url: "spotify.com",         safe: true },
  { url: "roblox.com",          safe: true },
  { url: "docs.google.com",     safe: true },
  { url: "godotengine.org",     safe: true },
  { url: "blender.org",         safe: true },
];

export const EMAILS = [
  { id: "e1", from: "noreply@discord.com",   subject: "Welcome to Pixel Pals server!", body: "You're now a member of Pixel Pals. Say hi in #intro!" },
  { id: "e2", from: "support@steampowered.com", subject: "Your weekly wishlist", body: "5 games on sale this week from your wishlist." },
  { id: "e3", from: "teacher@school.edu",    subject: "Math homework reminder",   body: "Don't forget to submit chapter 7 by Friday." },
  { id: "e4", from: "team@unity.com",        subject: "New tutorial: Lighting",   body: "Learn how to bake lightmaps in 10 minutes." },
  { id: "e5", from: "security@gma1l.com",    subject: "⚠ Unusual login attempt",  body: "We noticed a sign-in from an unknown device. Click here to secure your account immediately: https://gma1-security.com/verify",
    clue: "fake-email" as const },
];

export const DOWNLOADS = [
  { name: "Homework.pdf",      icon: "📄" },
  { name: "HolidayPhoto.png",  icon: "🖼" },
  { name: "MinecraftSkin.png", icon: "🖼" },
  { name: "Presentation.pptx", icon: "📊" },
  { name: "FastRender.exe",    icon: "⚙",  clue: "exe-download" as const },
  { name: "Notes.docx",        icon: "📝" },
];

export const WHATSAPP_CHATS = [
  { id: "mom",   name: "Mom",   last: "Dinner at 7 ❤️", messages: [
    { from: "Mom", text: "Don't forget to clean your room." },
    { from: "Me",  text: "Doing it after this build 🛠" },
  ]},
  { id: "sara",  name: "Sara",  last: "Lol that boss was hard", messages: [
    { from: "Sara", text: "Did you finish level 4?" },
    { from: "Me",   text: "Yeah barely 😭" },
  ]},
  { id: "karim", name: "Karim", last: "Try this — it's amazing!", messages: [
    { from: "Karim", text: "Hey!" },
    { from: "Karim", text: "I found this amazing tool, makes game dev WAY faster." },
    { from: "Karim", text: "Try this 👇" },
    { from: "Karim", text: "FastRender.exe", isFile: true, clue: "discord-file" as const },
  ]},
];

export const NOTEBOOK_PAGES = [
  { title: "Math homework", lines: ["Ch.7 problems 1-12", "Geometry quiz Friday", "Ask Sara about #8"] },
  { title: "Game ideas",    lines: ["Boss: shadow dragon", "Level 5 = ice cave", "Combo system?"] },
  { title: "Bug fixes",     lines: ["Player falls through floor at spawn", "Mute button overlap", "Save file overwrite bug"] },
  { title: "Passwords",     lines: ["Steam: Dragon2026", "Discord: PixelPal!", "Developer Portal: MySecretPassword2026"],
    cluePage: true, clue: "plain-password" as const },
];

export const DRAWER_ITEMS = [
  { id: "pens",   label: "Pens",    emoji: "🖊", note: "Just pens." },
  { id: "usb",    label: "USB Stick", emoji: "💾", note: "Empty. Nothing on it." },
  { id: "keys",   label: "Keys",    emoji: "🔑", note: "House keys." },
  { id: "candy",  label: "Candy",   emoji: "🍬", note: "Cherry flavor." },
  { id: "bills",  label: "Bills",   emoji: "💵", note: "Lunch money." },
];

// Timeline correct order
export const TIMELINE_CORRECT: ClueId[] = [
  "discord-file",
  "exe-download",
  "fake-email",
  "fake-domain",
  "plain-password",
];

export const ATTACK_TYPES = [
  { id: "phishing", label: "Phishing",        correct: true },
  { id: "malware",  label: "Malware / Trojan", correct: true },
  { id: "ransom",   label: "Ransomware",      correct: false },
  { id: "id-theft", label: "Account Theft",   correct: true },
  { id: "ddos",     label: "DDoS Attack",     correct: false },
  { id: "weak-pw",  label: "Password Exposure", correct: true },
];

export const PREVENTION = [
  { id: "2fa",     label: "Enable Two-Factor Authentication", correct: true },
  { id: "no-pt",   label: "Never store passwords in plain text", correct: true },
  { id: "verify",  label: "Verify email domains carefully", correct: true },
  { id: "trusted", label: "Download software only from trusted sources", correct: true },
  { id: "av",      label: "Keep antivirus enabled", correct: true },
  { id: "vpn",     label: "Always use a VPN", correct: false },
  { id: "share",   label: "Share your password with friends you trust", correct: false },
];

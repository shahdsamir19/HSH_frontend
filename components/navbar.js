/**
 * ============================================================
 *  HACK-SHIELD HEROES — UNIFIED NAVIGATION BAR
 *  navbar.js — Drop into any HTML page for consistent nav.
 * ============================================================
 *
 *  USAGE:
 *    <link rel="stylesheet" href="components/navbar.css">   (optional — styles are inlined)
 *    <script src="components/navbar.js"></script>
 *
 *  The script auto-detects whether it's loaded from root or
 *  a subdirectory (e.g. levels/) and adjusts asset paths.
 * ============================================================
 */
(function () {
  'use strict';
  const fa = document.createElement("link");

fa.rel = "stylesheet";

fa.href =
"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css";

document.head.appendChild(fa);

  /* ── PATH DETECTION & LANG DETECTION ──────────────────── */
  // Determine if we are in a subdirectory (e.g., levels/, signin-signup/)
  const scripts = document.querySelectorAll('script[src]');
  let basePath = '';
  for (const s of scripts) {
    const src = s.getAttribute('src');
    if (src && src.includes('navbar.js')) {
      // If src starts with "../", we are in a subdirectory
      if (src.startsWith('../')) {
        basePath = '../';
      } else if (src.startsWith('./components/') || src.startsWith('components/')) {
        basePath = '';
      }
      break;
    }
  }

  const isArabic = window.location.pathname.includes('-ar.html') || window.location.pathname.includes('-ar');
  if (isArabic) {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    const arFont = document.createElement("link");
    arFont.rel = "stylesheet";
    arFont.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap";
    document.head.appendChild(arFont);
  }

  /* ── API SERVICE LAYER ────────────────────────────────── */
  const BASE_URL = 'https://hsh-backend.vercel.app';

  window.hshApi = {
    getToken() {
      return localStorage.getItem('hsh_token');
    },
    setToken(token) {
      localStorage.setItem('hsh_token', token);
    },
    clearToken() {
      localStorage.removeItem('hsh_token');
      localStorage.removeItem('hsh_user');
      localStorage.removeItem('hsh_progress');
    },
    async request(endpoint, options = {}) {
      const token = this.getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      if (response.status === 401) {
        this.clearToken();
        const loginUrl = window.location.pathname.includes('/levels/') 
          ? '../signin-signup/index.html' 
          : '../signin-signup/index.html';
        window.location.href = loginUrl;
        throw new Error('Unauthorized');
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    },
    login(email, password) {
      return this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    register(firstName, lastName, email, password) {
      return this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
    },
    verifyOtp(email, otp) {
      return this.request('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
    },
    getProgress() {
      return this.request('/api/progress');
    },
    submitProgress(levelId, score, completionTime) {
      return this.request('/api/progress/submit', {
        method: 'POST',
        body: JSON.stringify({ levelId, score, completionTime }),
      });
    },
    getOneLevelProgress(levelId) {
      return this.request(`/api/progress/${levelId}`);
    },
    getLeaderboard() {
      return this.request('/api/arena/leaderboard').catch(err => {
        console.warn("Leaderboard API failed, returning fallback mock data:", err);
        return [
          { username: "shadowfox", xp: 950, rank: "CYBER CADET" },
          { username: "cyber_sentinel", xp: 850, rank: "CYBER AGENT" },
          { username: "firewall_pro", xp: 720, rank: "CYBER GUARDIAN" },
          { username: "crypto_master", xp: 610, rank: "CYBER AGENT" },
          { username: "binary_hero", xp: 480, rank: "CYBER RECRUIT" }
        ];
      });
    }
  };

  window.api = window.hshApi;

  // Load cached progress synchronously
  try {
    window.hshProgress = JSON.parse(localStorage.getItem('hsh_progress'));
  } catch (e) {
    window.hshProgress = null;
  }

  /* ── ROUTING AND AUTH CHECK ───────────────────────────── */
  const path = window.location.pathname;
  const isPublicPage = 
    path.endsWith('landingPage.html') || 
    path.endsWith('landingPage-ar.html') || 
    (path.endsWith('index.html') && path.includes('signin-signup')) ||
    (path.endsWith('index-ar.html') && path.includes('signin-signup')) ||
    path === '/' ||
    path.endsWith('/') ||
    path.endsWith('\\');

  if (!isPublicPage) {
    const token = window.hshApi.getToken();
    if (!token) {
      const loginUrl = path.includes('/levels/') 
        ? (isArabic ? '../signin-signup/index-ar.html' : '../signin-signup/index.html') 
        : (isArabic ? 'signin-signup/index-ar.html' : 'signin-signup/index.html');
      window.location.href = loginUrl;
    } else {
      window.hshApi.getProgress().then(res => {
        if (res.success && res.data) {
          localStorage.setItem('hsh_progress', JSON.stringify(res.data));
          window.hshProgress = res.data;
          document.dispatchEvent(new CustomEvent('hshProgressUpdated', { detail: res.data }));
        }
      }).catch(err => {
        console.error("Auth check progress fetch failed:", err);
      });
    }
  }

  /* ── NAV LINKS CONFIG ───────────────────────────────────── */
  const navLinks = isArabic ? [
    { label: 'الرئيسية', href: basePath + 'landingPage-ar.html' },
    { label: 'الخريطة', href: basePath + 'map-ar.html' },
    { label: 'لوحة الصدارة', href: basePath + 'leaderboard-ar.html' },
    { label: 'الساحة السيبرانية', href: basePath + 'arena.html#/' },
    { label: 'النادي السيبراني', href: basePath + 'arena.html#/club' },
    { label: 'الأصدقاء', href: basePath + 'arena.html#/friends' },
    { label: 'من نحن', href: '#' },
    { label: 'اتصل بنا', href: '#' },
  ] : [
    { label: 'Home', href: basePath + 'landingPage.html' },
    { label: 'Map', href: basePath + 'map.html' },
    { label: 'Leaderboard', href: basePath + 'leaderboard.html' },
    { label: 'Cyber Arena', href: basePath + 'arena.html#/' },
    { label: 'Cyber Club', href: basePath + 'arena.html#/club' },
    { label: 'Friends', href: basePath + 'arena.html#/friends' },
    { label: 'About Us', href: '#' },
    { label: 'Contact Us', href: '#' },
  ];

  const sidebarLinks = isArabic ? [
    { label: 'الرئيسية', href: basePath + 'landingPage-ar.html' },
    { label: 'الخريطة', href: basePath + 'map-ar.html' },
    { label: 'لوحة الصدارة', href: basePath + 'leaderboard-ar.html' },
    { label: 'الساحة السيبرانية', href: basePath + 'arena.html#/' },
    { label: 'النادي السيبراني', href: basePath + 'arena.html#/club' },
    { label: 'الأصدقاء', href: basePath + 'arena.html#/friends' },
    { label: 'الملف الشخصي', href: basePath + 'profile-ar.html' },
    { label: 'من نحن', href: '#' },
    { label: 'اتصل بنا', href: '#' },
    { label: 'تسجيل الخروج', href: '#', isLogout: true }
  ] : [
    { label: 'Home', href: basePath + 'landingPage.html' },
    { label: 'Map', href: basePath + 'map.html' },
    { label: 'Leaderboard', href: basePath + 'leaderboard.html' },
    { label: 'Cyber Arena', href: basePath + 'arena.html#/' },
    { label: 'Cyber Club', href: basePath + 'arena.html#/club' },
    { label: 'Friends', href: basePath + 'arena.html#/friends' },
    { label: 'Profile', href: basePath + 'profile.html' },
    { label: 'About Us', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Logout', href: '#', isLogout: true }
  ];

  /* ── INJECT STYLES ──────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    /* ===== UNIFIED NAVBAR ===== */
    .hsh-nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 80px;
      padding: 0 40px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #12214C;
      z-index: 9990;
      box-shadow: 0 2px 20px rgba(0,0,0,0.5);
      border-bottom: 1px solid rgba(0, 212, 255, 0.15);
    }

    .hsh-nav-img {
      width: 100px;
      flex-shrink: 0;
    }

    .hsh-nav-img img {
      width: 100%;
      display: block;
      user-select: none;
    }

    .hsh-nav-menu {
      display: flex;
      align-items: center;
    }

    .hsh-nav-list {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
      align-items: center;
    }

    .hsh-nav-list li {
      margin: 0 10px;
      padding: 5px;
      position: relative;
      transition: all 0.3s;
    }

    .hsh-nav-list li::after {
      content: "";
      width: 90%;
      height: 3px;
      background: linear-gradient(90deg, #f95156, #7483D4);
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%) scaleX(0);
      transition: 0.3s;
    }

    .hsh-nav-list li:hover::after {
      transform: translateX(-50%) scaleX(1);
    }

    .hsh-nav-list li a {
      font-family: 'BalsamiqSans', 'Poppins', sans-serif;
      color: #8b9cc7;
      font-size: 16px;
      text-decoration: none;
      transition: 0.3s;
      white-space: nowrap;
    }

    .hsh-nav-list li:hover a {
      color: #f95156;
    }

    .hsh-nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .hsh-profile-btn {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f95156, #7483D4);
      border: 2px solid rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      color: white;
      font-size: 18px;
      flex-shrink: 0;
    }

    .hsh-profile-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 0 15px rgba(249, 81, 86, 0.5);
      border-color: rgba(255,255,255,0.5);
    }

    .hsh-sidebar-toggle {
      padding: 10px;
      border-radius: 100px;
      background-image: linear-gradient(60deg, #f95156, #7483D4);
      display: flex;
      justify-content: center;
      align-items: center;
      border: 0;
      transition: 0.3s;
      color: white;
      cursor: pointer;
      font-size: 16px;
    }

    .hsh-sidebar-toggle:hover {
      transform: scale(1.05);
      box-shadow: 0 0 12px rgba(116, 131, 212, 0.6);
    }

    /* ===== SIDEBAR ===== */
    .hsh-sidebar {
      background-image: linear-gradient(160deg, #12214C, #2a1654);
      width: 300px;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      z-index: 99999;
      transform: translateX(400px);
      transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 1px solid rgba(0, 212, 255, 0.2);
      box-shadow: -10px 0 40px rgba(0,0,0,0.6);
    }

    .hsh-sidebar.hsh-sidebar-open {
      transform: translateX(0);
    }

    .hsh-sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 99998;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }

    .hsh-sidebar-overlay.hsh-sidebar-open {
      opacity: 1;
      pointer-events: all;
    }

    .hsh-sidebar ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .hsh-sidebar .hsh-side-list li {
      padding: 12px 16px;
      transition: 0.3s;
      border-radius: 8px;
      width: 90%;
      margin: 4px auto;
    }

    .hsh-sidebar .hsh-side-list li:hover {
      transform: translateX(6px);
      background-color: rgba(0, 212, 255, 0.1);
    }

    .hsh-sidebar .hsh-side-list li a {
      color: #a8c0e8;
      text-decoration: none;
      font-size: 16px;
      transition: 0.3s;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .hsh-sidebar .hsh-side-list li:hover a {
      color: #fff;
    }

    .hsh-close-side {
      border: 0;
      background-color: transparent;
      position: absolute;
      top: 14px;
      left: 14px;
      color: #f95156;
      font-size: 22px;
      border-radius: 6px;
      transition: 0.3s;
      cursor: pointer;
      padding: 4px 8px;
    }

    .hsh-close-side:hover {
      color: #fff;
      background-color: rgba(249, 81, 86, 0.2);
    }

    .hsh-side-footer {
      margin: 10px;
      text-align: center;
    }

    .hsh-side-footer .hsh-social-btns {
      display: flex;
      justify-content: center;
      padding: 0;
      margin: 0 0 10px 0;
      list-style: none;
      gap: 8px;
    }

    .hsh-side-footer .hsh-social-btns button {
      margin: 0;
      padding: 10px;
      border-radius: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid rgba(0, 212, 255, 0.3);
      background-color: rgba(0, 212, 255, 0.1);
      transition: 0.3s;
      color: #64b5f6;
      cursor: pointer;
      width: 40px;
      height: 40px;
    }

    .hsh-side-footer .hsh-social-btns button:hover {
      background-color: rgba(0, 212, 255, 0.25);
      color: #fff;
    }

    .hsh-side-footer p {
      color: #5a6a8a;
      font-size: 13px;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 900px) {
      .hsh-nav-menu {
        display: none !important;
      }
      .hsh-nav-bar {
        padding: 0 16px;
      }
      .hsh-nav-img {
        width: 70px;
      }
    }

    @media (min-width: 901px) {
      .hsh-sidebar-toggle {
        /* Still show on desktop for sidebar access */
      }
    }

    /* ===== LANG TOGGLE ===== */
    .hsh-lang-toggle {
      font-family: inherit;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(0, 212, 255, 0.3);
      color: #00d4ff;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
      font-size: 13px;
    }
    .hsh-lang-toggle:hover {
      background: rgba(0, 212, 255, 0.25) !important;
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
      transform: scale(1.05);
    }

    /* ===== RTL LAYOUT ADJUSTMENTS ===== */
    [dir="rtl"] {
      font-family: 'Cairo', 'Poppins', sans-serif !important;
    }
    [dir="rtl"] .font-display,
    [dir="rtl"] .main-font,
    [dir="rtl"] .main-font-2,
    [dir="rtl"] h1, [dir="rtl"] h2, [dir="rtl"] h3 {
      font-family: 'Cairo', sans-serif !important;
    }
    [dir="rtl"] .hsh-nav-bar {
      flex-direction: row-reverse;
    }
    [dir="rtl"] .hsh-nav-list {
      flex-direction: row-reverse;
    }
    [dir="rtl"] .hsh-nav-actions {
      flex-direction: row-reverse;
    }
    [dir="rtl"] .hsh-sidebar {
      right: auto;
      left: 0;
      transform: translateX(-400px);
      border-left: none;
      border-right: 1px solid rgba(0, 212, 255, 0.2);
      box-shadow: 10px 0 40px rgba(0,0,0,0.6);
    }
    [dir="rtl"] .hsh-sidebar.hsh-sidebar-open {
      transform: translateX(0);
    }
    [dir="rtl"] .hsh-close-side {
      left: auto;
      right: 14px;
    }
    [dir="rtl"] .hsh-sidebar .hsh-side-list li:hover {
      transform: translateX(-6px);
    }
    [dir="rtl"] .hsh-sidebar .hsh-side-list li a {
      flex-direction: row-reverse;
      text-align: right;
    }
  `;
  document.head.appendChild(style);

  /* ── BUILD NAV HTML ─────────────────────────────────────── */
  function buildNavbar() {
    const logoPath = basePath + 'images/hackshield-logo.png';
    const profilePath = isArabic ? basePath + 'profile-ar.html' : basePath + 'profile.html';
    const homePath = isArabic ? basePath + 'landingPage-ar.html' : basePath + 'landingPage.html';

    const navLinksHTML = navLinks.map(l =>
      `<li><a href="${l.href}">${l.label}</a></li>`
    ).join('');

    const sideLinksHTML = sidebarLinks.map(l => {
      let icon = 'fa-solid fa-link';
      const labelText = l.label;
      if (labelText === 'Home' || labelText === 'الرئيسية') icon = 'fa-solid fa-house';
      else if (labelText === 'Map' || labelText === 'الخريطة') icon = 'fa-solid fa-map';
      else if (labelText === 'Leaderboard' || labelText === 'لوحة الصدارة') icon = 'fa-solid fa-trophy';
      else if (labelText === 'Profile' || labelText === 'الملف الشخصي') icon = 'fa-solid fa-user';
      else if (labelText === 'About Us' || labelText === 'من نحن') icon = 'fa-solid fa-info-circle';
      else if (labelText === 'Contact Us' || labelText === 'اتصل بنا') icon = 'fa-solid fa-envelope';
      else if (labelText === 'Logout' || labelText === 'تسجيل الخروج') icon = 'fa-solid fa-right-from-bracket';
      const idAttr = l.isLogout ? 'id="hsh-logout-btn"' : '';
      return `<li ${idAttr}><a href="${l.href}"><i class="${icon}"></i> ${l.label}</a></li>`;
    }).join('');

    return `
      <nav id="hsh-navbar">
        <div class="hsh-nav-bar">
          <div class="hsh-nav-img">
            <a href="${homePath}">
              <img src="${logoPath}" alt="HackShield Heroes Logo">
            </a>
          </div>
          <div class="hsh-nav-menu">
            <ul class="hsh-nav-list">
              ${navLinksHTML}
            </ul>
          </div>
          <div class="hsh-nav-actions">
            <button class="hsh-lang-toggle" id="hsh-lang-toggle-btn" title="${isArabic ? 'English' : 'العربية'}">${isArabic ? 'EN' : 'AR'}</button>
            <a href="${profilePath}" class="hsh-profile-btn" title="${isArabic ? 'الملف الشخصي' : 'Profile'}" id="hsh-profile-icon">
              <i class="fa-solid fa-user"></i>
            </a>
            <button class="hsh-sidebar-toggle" id="hsh-sidebar-open-btn" aria-label="Open menu">
              <i class="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
      </nav>
      <div class="hsh-sidebar-overlay" id="hsh-sidebar-overlay"></div>
      <div class="hsh-sidebar" id="hsh-sidebar">
        <div>
          <button class="hsh-close-side" id="hsh-sidebar-close-btn" aria-label="Close menu">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <ul class="hsh-side-list" style="margin-top: 50px;">
            ${sideLinksHTML}
          </ul>
        </div>
        <div class="hsh-side-footer">
          <ul class="hsh-social-btns">
            <li><button><i class="fa-brands fa-facebook-f"></i></button></li>
            <li><button><i class="fa-brands fa-linkedin-in"></i></button></li>
            <li><button><i class="fa-brands fa-x-twitter"></i></button></li>
          </ul>
          <p>&copy; ${isArabic ? 'حقوق النشر ٢٠٢٥ أبطال حماية الاختراق' : 'Copyright 2025 HackShield Heroes'}</p>
        </div>
      </div>
    `;
  }

  /* ── INJECT ─────────────────────────────────────────────── */
  function init() {
    // Don't inject navbar on the sign-in/sign-up page
    const path = window.location.pathname;
    if (path.includes('signin-signup')) {
      return;
    }

    // Inject at the very beginning of body
    const container = document.createElement('div');
    container.innerHTML = buildNavbar();

    // Insert all children at the beginning of body
    while (container.firstChild) {
      document.body.insertBefore(container.firstChild, document.body.firstChild);
    }

    // Ensure body has padding-top for fixed navbar
    document.body.style.paddingTop = '80px';

    // Event listeners
    const openBtn = document.getElementById('hsh-sidebar-open-btn');
    const closeBtn = document.getElementById('hsh-sidebar-close-btn');
    const sidebar = document.getElementById('hsh-sidebar');
    const overlay = document.getElementById('hsh-sidebar-overlay');
    const langBtn = document.getElementById('hsh-lang-toggle-btn');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        sidebar.classList.add('hsh-sidebar-open');
        overlay.classList.add('hsh-sidebar-open');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('hsh-sidebar-open');
        overlay.classList.remove('hsh-sidebar-open');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('hsh-sidebar-open');
        overlay.classList.remove('hsh-sidebar-open');
      });
    }

    if (langBtn) {
      langBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentUrl = window.location.href;
        let newUrl = currentUrl;
        if (isArabic) {
          if (currentUrl.includes('-ar.html')) {
            newUrl = currentUrl.replace('-ar.html', '.html');
          } else if (currentUrl.includes('-ar')) {
            newUrl = currentUrl.replace('-ar', '');
          }
        } else {
          if (currentUrl.includes('.html')) {
            newUrl = currentUrl.replace('.html', '-ar.html');
          } else if (currentUrl.endsWith('/')) {
            newUrl = currentUrl + 'landingPage-ar.html';
          } else if (currentUrl.includes('/signin-signup/')) {
            newUrl = currentUrl.replace('/signin-signup/', '/signin-signup/index-ar.html');
          } else {
            newUrl = currentUrl + '-ar.html';
          }
        }
        window.location.href = newUrl;
      });
    }

    // Logout listener
    const logoutBtn = document.getElementById('hsh-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.hshApi.clearToken();
        window.location.href = basePath + (isArabic ? 'landingPage-ar.html' : 'landingPage.html');
      });
    }

    // Also provide global functions for backward compatibility
    window.showSideBar = function () {
      sidebar.classList.add('hsh-sidebar-open');
      overlay.classList.add('hsh-sidebar-open');
    };
    window.hideSideBar = function () {
      sidebar.classList.remove('hsh-sidebar-open');
      overlay.classList.remove('hsh-sidebar-open');
    };
  }


  /* ── BOOT ───────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

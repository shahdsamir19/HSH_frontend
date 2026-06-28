/**
 * ============================================================
 *  HACK-SHIELD HEROES — CYBER MENTOR CHATBOT WIDGET
 *  chatbot.js — Drop into any HTML page. Zero configuration.
 * ============================================================
 *
 *  USAGE:
 *    <link rel="stylesheet" href="chatbot.css">
 *    <script src="chatbot.js"></script>
 *
 *  LEVEL CONTEXT:
 *    <body data-level="phishing">
 *
 *  BACKEND:
 *    POST /api/chat
 *    { message: "...", level: "phishing" }
 *
 *  VOICE-TO-TEXT:
 *    Uses Web Speech API (Chrome/Edge) or third-party service.
 *    Falls back gracefully if unsupported.
 * ============================================================
 */

(function () {
  'use strict';

  const isArabic = window.location.pathname.includes('-ar.html') || window.location.pathname.includes('-ar');

  /* ── CONFIG ────────────────────────────────────────────── */
  const CB_CONFIG = {
    // ⚙️  Backend API endpoint — will be implemented by the backend team
    apiEndpoint: 'https://hsh-backend.vercel.app/api/chat/message',

    // Storage key for chat history
    storageKey: 'hackshield_chat_history',

    // Max messages to save in localStorage
    maxHistory: 50,

    // Bot name
    botName: isArabic ? 'المرشد السيبراني' : 'CYBER MENTOR',

    // Bot emoji/avatar
    botEmoji: '🤖',
    userEmoji: '🧑‍💻',

    // Welcome message (shown once per level)
    getWelcomeMessage(level) {
      if (isArabic) {
        const levelGreetings = {
          phishing:      "🎣 أهلاً بك يا بطل المستقبل! أنا مرشدك السيبراني. هذا المستوى يدور حول **هجمات التصيد الاحتيالي**. يحاول المخادعون خداعك للحصول على معلوماتك! اسألني عن أي شيء - أنا هنا للمساعدة! 🛡️",
          firewall:      "🔥 مرحبًا بك في مستوى جدار الحماية! أنا مرشدك السيبراني. جدران الحماية تشبه الحراس الرقميين الذين يحمون جهاز الكمبيوتر الخاص بك. هل لديك أسئلة؟ ابدأ بطرحها! 🛡️",
          password:      "🔑 مرحبًا يا بطل! مستوى كلمة المرور - هذا هو المكان الذي تنقذ فيه كلمات المرور القوية الموقف! اسألني كيف تنشئ كلمة مرور غير قابلة للاختراق! 💪",
          malware:       "🦠 تنبيه برمجيات ضارة! أنا مرشدك السيبراني. البرمجيات الضارة هي برامج خبيثة يمكن أن تلحق الضرر بجهازك. دعنا نهزمها معًا! 🛡️",
          privacy:       "🔒 الخصوصية هي قوتك الخارقة! أنا مرشدك السيبراني. دعنا نتعلم كيف تحمي معلوماتك الشخصية على الإنترنت! 🦸",
          'safe-browsing': "🌐 تم تفعيل وضع التصفح الآمن! أنا مرشدك السيبراني. دعنا نستكشف الإنترنت بأمان معًا! 🛡️",
          social:        "💬 مستوى الهندسة الاجتماعية! أنا مرشدك السيبراني. تعلم كيف تكتشف عندما يحاول شخص ما خداعك! 🎭",
          default:       "👋 أهلاً بك يا بطل الأمن السيبراني! أنا **المرشد السيبراني** - دليلك الذكي خلال مغامرة أبطال حماية الاختراق! أنا هنا لمساعدتك في تعلم الأمن الرقمي. ماذا تريد أن تعرف؟ 🛡️✨",
        };
        return levelGreetings[level] || levelGreetings.default;
      }

      const levelGreetings = {
        phishing:      "🎣 Hey there, young hacker! I'm your Cyber Mentor. This level is about **phishing attacks**. Scammers try to trick you into giving away your info! Ask me anything — I'm here to help! 🛡️",
        firewall:      "🔥 Welcome to the Firewall level! I'm your Cyber Mentor. Firewalls are like digital guards that protect your computer. Got questions? Fire away! 🛡️",
        password:      "🔑 Hey hero! Password level — this is where strong passwords save the day! Ask me how to create an unbreakable password! 💪",
        malware:       "🦠 Malware alert! I'm your Cyber Mentor. Malware is sneaky software that can harm your device. Let's defeat it together! 🛡️",
        privacy:       "🔒 Privacy is your superpower! I'm your Cyber Mentor. Let's learn how to protect your personal info online! 🦸",
        'safe-browsing': "🌐 Safe browsing mode activated! I'm your Cyber Mentor. Let's explore the internet safely together! 🛡️",
        social:        "💬 Social engineering level! I'm your Cyber Mentor. Learn how to spot when someone is trying to trick you! 🎭",
        default:       "👋 Hey there, cyber hero! I'm your **Cyber Mentor** — your AI guide through the Hack-Shield Heroes adventure! I'm here to help you learn cybersecurity. What would you like to know? 🛡️✨",
      };
      return levelGreetings[level] || levelGreetings.default;
    },

    // Quick actions per level
    getQuickActions(level) {
      if (isArabic) {
        const base = [
          { label: '💡 أعطني تلميحاً',     message: 'Give me a hint for this level!' },
          { label: '🔄 اشرح لي ثانية', message: 'Can you explain the main concept of this level again in simple words?' },
          { label: '⚡ نصيحة سيبرانية',     message: 'Give me an amazing cybersecurity tip!' },
          { label: '🆘 ساعدني',       message: "I'm stuck. Can you help me understand what to do?" },
        ];

        const levelActions = {
          phishing: [
            { label: '🎣 ما هو التصيد؟', message: 'What is phishing and how does it work?' },
            { label: '⚠️ كشف بريد مزيف', message: 'How can I spot a fake phishing email?' },
            { label: '🛡️ ابقَ آمنًا',         message: 'How do I stay safe from phishing attacks?' },
            { label: '✅ هل هذا آمن؟',      message: 'How do I check if a link or email is safe?' },
          ],
          firewall: [
            { label: '🔥 ما هو جدار الحماية؟', message: 'What is a firewall and what does it do?' },
            { label: '🚪 كيف يعمل جدار الحماية',   message: 'How does a firewall block bad traffic?' },
            { label: '💡 أعطني تلميحاً',            message: 'Give me a hint for this level!' },
            { label: '🆘 ساعدني',              message: "I'm stuck on the firewall level, help!" },
          ],
          password: [
            { label: '🔑 نصائح لكلمة مرور قوية', message: 'How do I create a super strong password?' },
            { label: '🚫 الأخطاء الشائعة',      message: 'What are the most common password mistakes?' },
            { label: '🔐 مدير كلمات المرور',     message: 'What is a password manager and should I use one?' },
            { label: '💡 أعطني تلميحاً',            message: 'Give me a hint for this level!' },
          ],
          malware: [
            { label: '🦠 ما هي البرمجيات الضارة؟', message: 'What is malware and how does it spread?' },
            { label: '🛡️ احمِ جهازي',   message: 'How can I protect my computer from malware?' },
            { label: '🔍 اكتشاف البرمجيات الضارة',      message: 'How can I tell if my device has malware?' },
            { label: '💡 أعطني تلميحاً',         message: 'Give me a hint for this level!' },
          ],
          privacy: [
            { label: '🔒 حماية الخصوصية', message: 'How do I protect my privacy online?' },
            { label: '📱 صلاحيات التطبيقات', message: 'Should I worry about app permissions?' },
            { label: '🌐 التصفح الخفي', message: 'What is private browsing and does it keep me safe?' },
            { label: '💡 أعطني تلميحاً',        message: 'Give me a hint for this level!' },
          ],
        };

        return levelActions[level] || base;
      }

      const base = [
        { label: '💡 Give Hint',     message: 'Give me a hint for this level!' },
        { label: '🔄 Explain Again', message: 'Can you explain the main concept of this level again in simple words?' },
        { label: '⚡ Cyber Tip',     message: 'Give me an amazing cybersecurity tip!' },
        { label: '🆘 Help Me',       message: "I'm stuck. Can you help me understand what to do?" },
      ];

      const levelActions = {
        phishing: [
          { label: '🎣 What is Phishing?', message: 'What is phishing and how does it work?' },
          { label: '⚠️ Spot a Fake Email', message: 'How can I spot a fake phishing email?' },
          { label: '🛡️ Stay Safe',         message: 'How do I stay safe from phishing attacks?' },
          { label: '✅ Is This Safe?',      message: 'How do I check if a link or email is safe?' },
        ],
        firewall: [
          { label: '🔥 What is a Firewall?', message: 'What is a firewall and what does it do?' },
          { label: '🚪 How Firewalls Work',   message: 'How does a firewall block bad traffic?' },
          { label: '💡 Give Hint',            message: 'Give me a hint for this level!' },
          { label: '🆘 Help Me',              message: "I'm stuck on the firewall level, help!" },
        ],
        password: [
          { label: '🔑 Strong Password Tips', message: 'How do I create a super strong password?' },
          { label: '🚫 Common Mistakes',      message: 'What are the most common password mistakes?' },
          { label: '🔐 Password Manager',     message: 'What is a password manager and should I use one?' },
          { label: '💡 Give Hint',            message: 'Give me a hint for this level!' },
        ],
        malware: [
          { label: '🦠 What is Malware?', message: 'What is malware and how does it spread?' },
          { label: '🛡️ Protect Myself',   message: 'How can I protect my computer from malware?' },
          { label: '🔍 Spot Malware',      message: 'How can I tell if my device has malware?' },
          { label: '💡 Give Hint',         message: 'Give me a hint for this level!' },
        ],
        privacy: [
          { label: '🔒 Protect Privacy', message: 'How do I protect my privacy online?' },
          { label: '📱 App Permissions', message: 'Should I worry about app permissions?' },
          { label: '🌐 Private Browsing', message: 'What is private browsing and does it keep me safe?' },
          { label: '💡 Give Hint',        message: 'Give me a hint for this level!' },
        ],
      };

      return levelActions[level] || base;
    },
  };

  /* ── STATE ─────────────────────────────────────────────── */
  const state = {
    isOpen:    false,
    isLoading: false,
    level:     document.body.dataset.level || 'general',
    messages:  [],
    initialized: false,
    isRecording: false,
  };

  /* ── DOM REFS ───────────────────────────────────────────── */
  let els = {};

  /* ── VOICE-TO-TEXT (Web Speech API) ─────────────────────── */
  let recognition = null;
  let voiceSupported = false;

  function initVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      voiceSupported = true;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = isArabic ? 'ar-SA' : 'en-US';

      recognition.onstart = function () {
        state.isRecording = true;
        if (els.micBtn) {
          els.micBtn.classList.add('cb-mic-recording');
          els.micBtn.title = isArabic ? 'جاري التسجيل... اضغط للإيقاف' : 'Recording… Click to stop';
        }
      };

      recognition.onresult = function (event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Show interim results in the input field
        if (finalTranscript) {
          els.input.value = finalTranscript;
        } else if (interimTranscript) {
          els.input.value = interimTranscript;
        }
      };

      recognition.onerror = function (event) {
        console.warn('Speech recognition error:', event.error);
        stopRecording();

        if (event.error === 'not-allowed') {
          renderSystemMessage(isArabic ? '🎤 تم رفض الوصول للميكروفون. يرجى تفعيل صلاحية الميكروفون في إعدادات المتصفح.' : '🎤 Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          renderSystemMessage(isArabic ? '🎤 لم يتم الكشف عن صوت. يرجى المحاولة مرة أخرى.' : '🎤 No speech detected. Please try again.');
        }
      };

      recognition.onend = function () {
        stopRecording();
        // If we have text, don't auto-send — let user review it first
        if (els.input.value.trim()) {
          els.input.focus();
        }
      };
    } else {
      voiceSupported = false;
    }
  }

  function startRecording() {
    if (!recognition || state.isRecording) return;
    try {
      els.input.value = '';
      els.input.placeholder = isArabic ? '🎤 جاري الاستماع...' : '🎤 Listening...';
      recognition.start();
    } catch (e) {
      console.warn('Could not start recording:', e);
    }
  }

  function stopRecording() {
    state.isRecording = false;
    if (els.micBtn) {
      els.micBtn.classList.remove('cb-mic-recording');
      els.micBtn.title = isArabic ? 'إدخال صوتي' : 'Voice input';
    }
    if (els.input) {
      els.input.placeholder = isArabic ? 'اسأل مرشدك السيبراني...' : 'Ask your Cyber Mentor...';
    }
    try {
      if (recognition) recognition.stop();
    } catch (e) { /* already stopped */ }
  }

  function toggleRecording() {
    if (state.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  /* ── HTML TEMPLATE ──────────────────────────────────────── */
  function buildHTML() {
    const levelLabel = state.level !== 'general'
      ? state.level.toUpperCase()
      : (isArabic ? 'عام' : 'GENERAL');

    const micBtnClass = voiceSupported ? '' : 'cb-mic-hidden';
    
    const statusText = isArabic ? 'متصل وجاهز' : 'ONLINE & READY';
    const clearTitle = isArabic ? 'حذف المحادثة' : 'Clear Chat';
    const placeholderText = isArabic ? 'اسأل مرشدك السيبراني...' : 'Ask your Cyber Mentor...';
    const typeAria = isArabic ? 'اكتب رسالتك' : 'Type your message';
    const voiceTitle = isArabic ? 'إدخال صوتي' : 'Voice input';
    const sendTitle = isArabic ? 'إرسال' : 'Send';
    const toggleAria = isArabic ? 'فتح دردشة المرشد السيبراني' : 'Open Cyber Mentor Chat';
    const toggleTooltip = isArabic ? 'اسأل المرشد السيبراني!' : 'Ask Cyber Mentor!';

    return `
      <div id="cb-widget" ${isArabic ? 'dir="rtl"' : ''}>

        <!-- Chat Panel -->
        <div id="cb-panel" role="dialog" aria-label="Cyber Mentor Chat" aria-hidden="true">

          <!-- Header -->
          <div id="cb-header">
            <div class="cb-avatar" aria-hidden="true">${CB_CONFIG.botEmoji}</div>
            <div class="cb-header-info">
              <div class="cb-header-name">${CB_CONFIG.botName}</div>
              <div class="cb-header-status">${statusText}</div>
            </div>
            <div class="cb-header-level" title="${isArabic ? 'المستوى الحالي' : 'Current Level'}: ${levelLabel}">${levelLabel}</div>
            <button id="cb-clear-btn" title="${clearTitle}" aria-label="${clearTitle}">🗑️</button>
          </div>

          <!-- Messages -->
          <div id="cb-messages" role="log" aria-live="polite" aria-label="Chat messages">
          </div>

          <!-- Typing indicator -->
          <div id="cb-typing" role="status" aria-label="Cyber Mentor is typing">
            <div class="cb-msg-avatar" aria-hidden="true">${CB_CONFIG.botEmoji}</div>
            <div class="cb-typing-bubble">
              <div class="cb-typing-dot"></div>
              <div class="cb-typing-dot"></div>
              <div class="cb-typing-dot"></div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div id="cb-quick-actions" role="toolbar" aria-label="Quick action buttons">
          </div>

          <!-- Input -->
          <div id="cb-input-area">
            <input
              type="text"
              id="cb-input"
              placeholder="${placeholderText}"
              maxlength="500"
              autocomplete="off"
              aria-label="${typeAria}"
            />
            <button id="cb-mic-btn" class="${micBtnClass}" aria-label="${voiceTitle}" title="${voiceTitle}">
              🎤
            </button>
            <button id="cb-send-btn" aria-label="${sendTitle}" title="${sendTitle}">
              ➤
            </button>
          </div>

        </div>

        <!-- Toggle Button -->
        <button
          id="cb-toggle-btn"
          aria-label="${toggleAria}"
          aria-expanded="false"
          data-tooltip="${toggleTooltip}"
        >
          <span class="cb-bot-icon" aria-hidden="true">🤖</span>
          <span class="cb-close-icon" aria-hidden="true">✕</span>
          <span id="cb-badge" class="cb-hidden" aria-label="New message">1</span>
        </button>

      </div>
    `;
  }

  /* ── QUICK ACTIONS BUILDER ──────────────────────────────── */
  function buildQuickActions() {
    const actions = CB_CONFIG.getQuickActions(state.level);
    els.quickActions.innerHTML = '';
    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.className = 'cb-quick-btn';
      btn.textContent = action.label;
      btn.setAttribute('aria-label', action.message);
      btn.addEventListener('click', () => {
        if (!state.isLoading) sendMessage(action.message);
      });
      els.quickActions.appendChild(btn);
    });
  }

  /* ── STORAGE ────────────────────────────────────────────── */
  function loadHistory() {
    try {
      const key  = `${CB_CONFIG.storageKey}_${state.level}`;
      const raw  = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function saveHistory() {
    try {
      const key = `${CB_CONFIG.storageKey}_${state.level}`;
      const limited = state.messages.slice(-CB_CONFIG.maxHistory);
      localStorage.setItem(key, JSON.stringify(limited));
    } catch { /* quota exceeded */ }
  }

  function clearHistory() {
    try {
      const key = `${CB_CONFIG.storageKey}_${state.level}`;
      localStorage.removeItem(key);
    } catch {}
  }

  /* ── RENDER MESSAGE ─────────────────────────────────────── */
  function renderMessage(msg) {
    const wrapper = document.createElement('div');
    wrapper.className = `cb-msg cb-msg-${msg.role}`;

    const avatar = document.createElement('div');
    avatar.className = 'cb-msg-avatar';
    avatar.textContent = msg.role === 'bot' ? CB_CONFIG.botEmoji : CB_CONFIG.userEmoji;
    avatar.setAttribute('aria-hidden', 'true');

    const bubble = document.createElement('div');
    bubble.className = `cb-bubble${msg.error ? ' cb-error-bubble' : ''}`;

    // Simple markdown: **bold**, *italic*, `code`, line breaks
    bubble.innerHTML = formatText(msg.text);

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    els.messages.appendChild(wrapper);
    scrollToBottom();
  }

  function renderSystemMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'cb-msg cb-msg-system';
    const bubble = document.createElement('div');
    bubble.className = 'cb-bubble';
    bubble.innerHTML = formatText(text);
    wrapper.appendChild(bubble);
    els.messages.appendChild(wrapper);
    scrollToBottom();
  }

  function formatText(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(0,212,255,0.1);padding:1px 6px;border-radius:4px;font-family:monospace;font-size:12px;color:#00d4ff">$1</code>')
      .replace(/\n/g, '<br>');
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      els.messages.scrollTop = els.messages.scrollHeight;
    });
  }

  /* ── TYPING INDICATOR ───────────────────────────────────── */
  function showTyping()  {
    els.typing.classList.add('cb-show');
    els.messages.appendChild(els.typing);
    scrollToBottom();
  }

  function hideTyping()  {
    els.typing.classList.remove('cb-show');
  }

  /* ── SEND MESSAGE ───────────────────────────────────────── */
  async function sendMessage(text) {
    const trimmed = (text || els.input.value).trim();
    if (!trimmed || state.isLoading) return;

    // Stop any active recording
    if (state.isRecording) stopRecording();

    // Clear input
    els.input.value = '';
    els.input.focus();

    // Add user message to state + DOM
    const userMsg = { role: 'user', text: trimmed, timestamp: Date.now() };
    state.messages.push(userMsg);
    renderMessage(userMsg);
    saveHistory();

    // Hide badge if open
    hideBadge();

    // Show loading state
    state.isLoading = true;
    setInputDisabled(true);
    showTyping();

    try {
      const response = await fetchBotResponse(trimmed);
      hideTyping();

      const botMsg = { role: 'bot', text: response, timestamp: Date.now() };
      state.messages.push(botMsg);
      renderMessage(botMsg);
      saveHistory();

      // Show badge if chat is closed
      if (!state.isOpen) showBadge();

    } catch (err) {
      hideTyping();
      const errText = err.userMessage || "⚠️ Connection lost! Check your internet and try again, hero! 🛡️";
      const errMsg  = { role: 'bot', text: errText, error: true, timestamp: Date.now() };
      state.messages.push(errMsg);
      renderMessage(errMsg);
    } finally {
      state.isLoading = false;
      setInputDisabled(false);
    }
  }

  /* ── API CALL ───────────────────────────────────────────── */
  async function fetchBotResponse(message) {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 30000);

    // Build request payload
    const payload = {
      message,
      level: state.level,
    };

    // Add auth token if available (for future backend integration)
    const headers = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(CB_CONFIG.apiEndpoint, {
        method:  'POST',
        headers,
        body:    JSON.stringify(payload),
        signal:  controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const e = new Error(`HTTP ${res.status}`);
        e.userMessage = errBody.message
          || (res.status === 429 ? "⏳ Whoa! Too many questions at once. Try again in a moment! 😊"
            : res.status === 401 ? "🔒 Please sign in to chat with Cyber Mentor!"
            : res.status >= 500 ? "🔧 Our servers are recharging. Back soon, hero! ⚡"
            : "❌ Something went wrong. Try again!");
        throw e;
      }

      const data = await res.json();

      // Support multiple response shapes
      return data.reply
          || data.message
          || data.response
          || data.answer
          || data.text
          || "🤔 I got your message but couldn't form a reply. Try asking again!";

    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        const e = new Error('Timeout');
        e.userMessage = "⏰ That took too long! Check your connection and try again.";
        throw e;
      }
      throw err;
    }
  }

  /* ── AUTH TOKEN (for future backend integration) ────────── */
  function getAuthToken() {
    try {
      // Check for token in localStorage (will be set by login flow)
      return localStorage.getItem('hackshield_auth_token') || null;
    } catch {
      return null;
    }
  }

  /* ── TOGGLE ─────────────────────────────────────────────── */
  function toggleChat() {
    state.isOpen = !state.isOpen;
    const widget = els.widget;
    const panel  = els.panel;
    const toggleBtn = els.toggleBtn;

    if (state.isOpen) {
      widget.classList.add('cb-open');
      panel.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Close Cyber Mentor Chat');
      hideBadge();
      setTimeout(() => els.input.focus(), 350);
    } else {
      widget.classList.remove('cb-open');
      panel.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Open Cyber Mentor Chat');
      // Stop recording when closing
      if (state.isRecording) stopRecording();
    }
  }

  /* ── BADGE ──────────────────────────────────────────────── */
  function showBadge() {
    if (els.badge) {
      els.badge.classList.remove('cb-hidden');
    }
  }

  function hideBadge() {
    if (els.badge) {
      els.badge.classList.add('cb-hidden');
    }
  }

  /* ── INPUT HELPERS ──────────────────────────────────────── */
  function setInputDisabled(disabled) {
    els.input.disabled   = disabled;
    els.sendBtn.disabled = disabled;
    if (els.micBtn) els.micBtn.disabled = disabled;
    const qBtns = els.quickActions.querySelectorAll('.cb-quick-btn');
    qBtns.forEach(b => b.disabled = disabled);
  }

  /* ── INIT ───────────────────────────────────────────────── */
  function init() {
    if (state.initialized) return;
    state.initialized = true;

    // Initialize voice recognition
    initVoice();

    // Inject HTML
    const container = document.createElement('div');
    container.innerHTML = buildHTML();
    document.body.appendChild(container.firstElementChild);

    // Cache DOM refs
    els = {
      widget:       document.getElementById('cb-widget'),
      panel:        document.getElementById('cb-panel'),
      toggleBtn:    document.getElementById('cb-toggle-btn'),
      messages:     document.getElementById('cb-messages'),
      typing:       document.getElementById('cb-typing'),
      input:        document.getElementById('cb-input'),
      sendBtn:      document.getElementById('cb-send-btn'),
      micBtn:       document.getElementById('cb-mic-btn'),
      quickActions: document.getElementById('cb-quick-actions'),
      clearBtn:     document.getElementById('cb-clear-btn'),
      badge:        document.getElementById('cb-badge'),
    };

    // Build quick actions
    buildQuickActions();

    // Load history from localStorage
    const history = loadHistory();
    if (history.length > 0) {
      state.messages = history;
      history.forEach(msg => {
        if (msg.role === 'system') {
          renderSystemMessage(msg.text);
        } else {
          renderMessage(msg);
        }
      });
    } else {
      // Show welcome message
      const welcome = CB_CONFIG.getWelcomeMessage(state.level);
      const welcomeMsg = { role: 'bot', text: welcome, timestamp: Date.now() };
      state.messages.push(welcomeMsg);
      renderMessage(welcomeMsg);
      saveHistory();
    }

    // Show badge after 3s to invite user
    setTimeout(() => {
      if (!state.isOpen) showBadge();
    }, 3000);

    /* ── Events ── */
    els.toggleBtn.addEventListener('click', toggleChat);

    els.sendBtn.addEventListener('click', () => sendMessage());

    els.input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Mic button
    if (els.micBtn && voiceSupported) {
      els.micBtn.addEventListener('click', toggleRecording);
    }

    els.clearBtn.addEventListener('click', () => {
      if (confirm('Clear chat history for this level? 🗑️')) {
        state.messages = [];
        clearHistory();
        els.messages.innerHTML = '';
        // Re-show welcome
        const welcome    = CB_CONFIG.getWelcomeMessage(state.level);
        const welcomeMsg = { role: 'bot', text: welcome, timestamp: Date.now() };
        state.messages.push(welcomeMsg);
        renderMessage(welcomeMsg);
        saveHistory();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && state.isOpen) toggleChat();
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (
        state.isOpen &&
        !els.widget.contains(e.target)
      ) {
        toggleChat();
      }
    });

    console.log(
      `%c🤖 Hack-Shield Cyber Mentor loaded! Level: ${state.level}`,
      'color:#00d4ff;font-family:monospace;font-size:13px;background:#080c18;padding:6px 12px;border-radius:6px;border:1px solid #00d4ff;'
    );
  }

  /* ── PUBLIC API (optional) ──────────────────────────────── */
  window.CyberMentor = {
    open:    () => { if (!state.isOpen) toggleChat(); },
    close:   () => { if (state.isOpen)  toggleChat(); },
    toggle:  toggleChat,
    send:    text => sendMessage(text),
    setEndpoint: url => { CB_CONFIG.apiEndpoint = url; },
    getLevel: () => state.level,
    clearHistory,
  };

  /* ── BOOT ───────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

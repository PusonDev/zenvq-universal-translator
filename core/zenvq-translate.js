/**
 * ZenVQ Universal Live Translator v1.0.0
 * Zero-Server-Load, React-Safe, Live DOM Text-Node Translation Engine
 * Powered by ZenVQ Agency (https://tools.zenvq.com)
 */
(function (window, document) {
  "use strict";
  if (window.__ZENVQ_TRANSLATOR_LOADED__) return;
  window.__ZENVQ_TRANSLATOR_LOADED__ = true;

  // 1. React 18 / Next.js Virtual DOM Safety Patch (Guard against unmount/hydration collisions)
  if (typeof Node === "function" && Node.prototype) {
    const origRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
      if (child.parentNode !== this) return child;
      return origRemoveChild.apply(this, arguments);
    };
    const origInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, referenceNode) {
      if (referenceNode && referenceNode.parentNode !== this) {
        return origInsertBefore.apply(this, [newNode, null]);
      }
      return origInsertBefore.apply(this, arguments);
    };
  }

    // 13 Mandatory Global Market Languages (Unified Ecosystem Sequence)
  const LANGUAGES = [
    // 1. Core Primary Hubs (Global Standard, Native Hub, Middle East & GCC)
    { code: "en", name: "English", native: "English", region: "Global / US / UK", dir: "ltr", badge: "EN" },
    { code: "bn", name: "Bengali", native: "বাংলা", region: "Bangladesh Hub", dir: "ltr", badge: "বাং" },
    { code: "ar", name: "Arabic", native: "العربية", region: "UAE / KSA / GCC", dir: "rtl", badge: "ع" },

    // 2. High-Ticket European & Western Enterprise Markets
    { code: "de", name: "German", native: "Deutsch", region: "Germany / DACH", dir: "ltr", badge: "DE" },
    { code: "fr", name: "French", native: "Français", region: "France / EU", dir: "ltr", badge: "FR" },
    { code: "es", name: "Spanish", native: "Español", region: "Americas / Spain", dir: "ltr", badge: "ES" },
    { code: "it", name: "Italian", native: "Italiano", region: "Italy / EU Luxury", dir: "ltr", badge: "IT" },
    { code: "nl", name: "Dutch", native: "Nederlands", region: "Netherlands Tech", dir: "ltr", badge: "NL" },
    { code: "pt", name: "Portuguese", native: "Português", region: "EU / Brazil", dir: "ltr", badge: "PT" },

    // 3. Premier East Asian Technology & Design Markets
    { code: "ja", name: "Japanese", native: "日本語", region: "Japan Tech & Design", dir: "ltr", badge: "日" },
    { code: "zh-CN", name: "Chinese", native: "简体中文", region: "Asia Pacific", dir: "ltr", badge: "中" },

    // 4. Regional South Asian & GCC Diaspora Markets
    { code: "ur", name: "Urdu", native: "اردو", region: "South Asia / GCC", dir: "rtl", badge: "ار" },
    { code: "hi", name: "Hindi", native: "हिन्दी", region: "South Asia", dir: "ltr", badge: "हि" }
  ];

  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG", "PATH",
    "TEXTAREA", "INPUT", "SELECT", "OPTION", "IFRAME", "CANVAS"
  ]);

  const PROTECTED_PATTERNS = /^(\d+[%$€£¥+-]*|[+$€£¥]\d[\d,.]*|https?:\/\/\S+|\S+@\S+\.\S+|\+?[\d\s()-]{7,}|ZenVQ|ZVQP|zvqultra)$/i;

  const originalTextMap = new WeakMap();

  function matchSupportedLanguage(localeStr) {
    if (!localeStr || typeof localeStr !== "string") return null;
    const clean = localeStr.toLowerCase().trim();
    if (clean.startsWith("bn")) return "bn";
    if (clean.startsWith("ar")) return "ar";
    if (clean.startsWith("de")) return "de";
    if (clean.startsWith("fr")) return "fr";
    if (clean.startsWith("es")) return "es";
    if (clean.startsWith("it")) return "it";
    if (clean.startsWith("nl")) return "nl";
    if (clean.startsWith("pt")) return "pt";
    if (clean.startsWith("ja")) return "ja";
    if (clean.startsWith("zh")) return "zh-CN";
    if (clean.startsWith("ur")) return "ur";
    if (clean.startsWith("hi")) return "hi";
    if (clean.startsWith("en")) return "en";
    return null;
  }

  function detectInitialLanguage() {
    try {
      // 1. URL Query Parameter Override (?lang=ar or ?lang=de)
      if (typeof window !== "undefined" && window.location && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get("lang");
        if (urlLang) {
          const matched = matchSupportedLanguage(urlLang);
          if (matched) {
            localStorage.setItem("zenvq_live_lang", matched);
            return matched;
          }
        }
      }

      // 2. Saved User Preference (from earlier manual selection or visit)
      const saved = localStorage.getItem("zenvq_live_lang");
      if (saved && LANGUAGES.some(function (l) { return l.code === saved; })) {
        return saved;
      }

      // 3. Auto-Detect Browser and OS Native Language Preferences
      const candidates = [];
      if (typeof navigator !== "undefined") {
        if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
          for (let i = 0; i < navigator.languages.length; i++) {
            candidates.push(navigator.languages[i]);
          }
        }
        if (navigator.language) candidates.push(navigator.language);
        if (navigator.userLanguage) candidates.push(navigator.userLanguage);
      }
      try {
        const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
        if (intlLocale) candidates.push(intlLocale);
      } catch (e) {}

      for (let i = 0; i < candidates.length; i++) {
        const match = matchSupportedLanguage(candidates[i]);
        if (match) {
          return match;
        }
      }
    } catch (e) {}

    return "en";
  }

  let currentLang = detectInitialLanguage();
  let isMutating = false;
  let observerTimer = null;

  function getCache(lang) {
    try {
      return JSON.parse(localStorage.getItem("zenvq_tx_v2_" + lang) || "{}");
    } catch {
      return {};
    }
  }

  function saveCache(lang, cacheObj) {
    try {
      localStorage.setItem("zenvq_tx_v2_" + lang, JSON.stringify(cacheObj));
    } catch {}
  }

  function isSkippableNode(node) {
    let parent = node.parentElement;
    while (parent) {
      if (SKIP_TAGS.has(parent.tagName)) return true;
      if (
        parent.getAttribute("translate") === "no" ||
        parent.classList.contains("notranslate") ||
        parent.hasAttribute("data-zenvq-ignore")
      ) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  function isHighPriorityNode(node) {
    let parent = node.parentElement;
    let depth = 0;
    while (parent && depth < 5) {
      const tag = parent.tagName;
      if (tag === "HEADER" || tag === "NAV" || tag === "H1" || tag === "H2" || tag === "BUTTON") {
        return true;
      }
      if (
        parent.hasAttribute("data-priority") ||
        parent.classList.contains("hero") ||
        parent.classList.contains("header")
      ) {
        return true;
      }
      parent = parent.parentElement;
      depth++;
    }
    return false;
  }

  function collectTranslatableNodes(root) {
    const targetRoot = root || document.body;
    if (!targetRoot) return [];
    const priorityNodes = [];
    const normalNodes = [];
    const walker = document.createTreeWalker(targetRoot, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const raw = node.nodeValue;
        if (!raw || !raw.trim()) return NodeFilter.FILTER_REJECT;
        const trimmed = raw.trim();
        if (trimmed.length < 2 || PROTECTED_PATTERNS.test(trimmed)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (isSkippableNode(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let current;
    while ((current = walker.nextNode())) {
      if (!originalTextMap.has(current)) {
        originalTextMap.set(current, current.nodeValue);
      }
      if (isHighPriorityNode(current)) {
        priorityNodes.push(current);
      } else {
        normalNodes.push(current);
      }
    }
    // Return high-priority nodes first so header & hero translate in sub-300ms
    return priorityNodes.concat(normalNodes);
  }

  async function fetchSingleString(str, targetLang) {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=auto&tl=" +
      encodeURIComponent(targetLang) +
      "&dt=t&q=" +
      encodeURIComponent(str);
    try {
      const res = await fetch(url);
      if (!res.ok) return str;
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        return data[0].map((part) => part[0]).join("").trim();
      }
    } catch {
      // Return original on error
    }
    return str;
  }

  async function fetchBatchTranslation(strings, targetLang) {
    const delimiter = "\n=====\n";
    const chunks = [];
    let currentChunk = [];
    let currentLen = 0;

    // Compact chunking (max 8 items or max 600 chars) guarantees delimiters are never mangled
    for (const str of strings) {
      if ((currentChunk.length >= 8 || currentLen + str.length > 600) && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentLen = 0;
      }
      currentChunk.push(str);
      currentLen += str.length + delimiter.length;
    }
    if (currentChunk.length > 0) chunks.push(currentChunk);

    const results = {};
    await Promise.all(
      chunks.map(async (chunk) => {
        const joined = chunk.join(delimiter);
        const url =
          "https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=auto&tl=" +
          encodeURIComponent(targetLang) +
          "&dt=t&q=" +
          encodeURIComponent(joined);
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && Array.isArray(data[0])) {
              const fullTranslated = data[0].map((part) => part[0]).join("");
              const splitParts = fullTranslated.split(/\s*=====\s*/);
              if (splitParts.length === chunk.length) {
                chunk.forEach((orig, idx) => {
                  results[orig] = (splitParts[idx] || orig).trim();
                });
                return;
              }
            }
          }
        } catch (err) {
          console.warn("[ZenVQ Translate] Batch failed, falling back to individual items:", err);
        }

        // Fallback: translate items individually if batch delimiter mismatch occurred
        await Promise.all(
          chunk.map(async (str) => {
            const trans = await fetchSingleString(str, targetLang);
            if (trans) {
              results[str] = trans;
            }
          })
        );
      })
    );
    return results;
  }

  async function applyLanguage(targetLang, root, isManual) {
    const targetRoot = root || document.body;
    if (!targetRoot) return;
    currentLang = targetLang;
    localStorage.setItem("zenvq_live_lang", targetLang);
    if (isManual) {
      localStorage.setItem("zenvq_lang_user_selected", "true");
    }

    const langMeta = LANGUAGES.find((l) => l.code === targetLang) || LANGUAGES[0];
    document.documentElement.setAttribute("lang", targetLang);
    document.documentElement.setAttribute("dir", langMeta.dir);

    const nodes = collectTranslatableNodes(targetRoot);

    // Instant Restore for Default English
    if (targetLang === "en") {
      isMutating = true;
      for (const node of nodes) {
        const orig = originalTextMap.get(node);
        if (orig && node.nodeValue !== orig) {
          node.nodeValue = orig;
        }
      }
      isMutating = false;
      window.dispatchEvent(new CustomEvent("zenvq-lang-changed", { detail: { lang: "en" } }));
      return;
    }

    const cache = getCache(targetLang);
    const missingSet = new Set();

    for (const node of nodes) {
      const orig = (originalTextMap.get(node) || node.nodeValue).trim();
      if (orig && !cache[orig]) {
        missingSet.add(orig);
      }
    }

    // Apply already-cached strings immediately (0ms perceived latency)
    isMutating = true;
    for (const node of nodes) {
      const rawOrig = originalTextMap.get(node) || node.nodeValue;
      const trimmedOrig = rawOrig.trim();
      if (cache[trimmedOrig]) {
        const leadingSpace = rawOrig.match(/^\s*/)[0];
        const trailingSpace = rawOrig.match(/\s*$/)[0];
        node.nodeValue = leadingSpace + cache[trimmedOrig] + trailingSpace;
      }
    }
    isMutating = false;

    // Fetch missing strings
    if (missingSet.size > 0) {
      const fetched = await fetchBatchTranslation(Array.from(missingSet), targetLang);
      Object.assign(cache, fetched);
      saveCache(targetLang, cache);

      isMutating = true;
      for (const node of nodes) {
        const rawOrig = originalTextMap.get(node) || node.nodeValue;
        const trimmedOrig = rawOrig.trim();
        if (cache[trimmedOrig]) {
          const leadingSpace = rawOrig.match(/^\s*/)[0];
          const trailingSpace = rawOrig.match(/\s*$/)[0];
          node.nodeValue = leadingSpace + cache[trimmedOrig] + trailingSpace;
        }
      }
      isMutating = false;
    }

    window.dispatchEvent(new CustomEvent("zenvq-lang-changed", { detail: { lang: targetLang } }));
  }

  function setupMutationObserver() {
    const obs = new MutationObserver(() => {
      if (isMutating || currentLang === "en") return;
      clearTimeout(observerTimer);
      observerTimer = setTimeout(() => {
        applyLanguage(currentLang, document.body);
      }, 90);
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // Zero-Displacement UI Law: Ensure language switchers & docks stay physically anchored
  function injectStableLocationStyles() {
    if (document.getElementById("zenvq-stable-location-styles")) return;
    const style = document.createElement("style");
    style.id = "zenvq-stable-location-styles";
    style.textContent = `
      /* Universal Stability Law: Switcher location NEVER jumps on RTL or language change */
      [data-zenvq-dock],
      .notranslate[data-zenvq-dock],
      [data-zenvq-stable="true"],
      .zenvq-lang-dock,
      #zenvq-auto-widget-pill {
        direction: ltr !important;
        text-align: left !important;
        unicode-bidi: isolate !important;
      }
      #zenvq-auto-widget-pill {
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        left: auto !important;
        z-index: 999999 !important;
        direction: ltr !important;
      }
      /* Automatic Dark & Light Mode Support for Floating Unified Capsule */
      #zenvq-auto-widget-pill .zvq-capsule {
        display: inline-flex;
        align-items: center;
        padding: 3px;
        border-radius: 9999px;
        background: rgba(20, 20, 24, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.14);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: #ffffff;
        transition: all 0.2s ease;
      }
      #zenvq-auto-widget-pill .zvq-lang-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 8px 5px 10px;
        border-radius: 9999px;
        border: none;
        background: transparent;
        color: #f4f4f5;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        font-family: system-ui, -apple-system, sans-serif;
      }
      #zenvq-auto-widget-pill .zvq-lang-btn:hover {
        background: rgba(255, 255, 255, 0.08);
      }
      #zenvq-auto-widget-pill .zvq-divider {
        width: 1px;
        height: 14px;
        background: rgba(255, 255, 255, 0.14);
        margin: 0 2px;
      }
      #zenvq-auto-widget-pill .zvq-theme-btn {
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        border: none;
        background: transparent;
        color: #d4d4d8;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      #zenvq-auto-widget-pill .zvq-theme-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }
      #zenvq-auto-widget-pill .zvq-menu {
        display: none;
        position: absolute;
        bottom: 48px;
        right: 0;
        width: 280px;
        max-width: calc(100vw - 24px);
        background: #111114;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 16px;
        padding: 12px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85);
        color: #ffffff;
      }
      #zenvq-auto-widget-pill .zvq-theme-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 10px;
        margin-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 11px;
        color: #a1a1aa;
      }
      #zenvq-auto-widget-pill .zvq-theme-seg {
        display: inline-flex;
        padding: 2px;
        border-radius: 8px;
        background: #18181c;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      #zenvq-auto-widget-pill .zvq-theme-opt {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: #a1a1aa;
        font-size: 11px;
        cursor: pointer;
      }
      #zenvq-auto-widget-pill .zvq-theme-opt.active {
        background: #27272a;
        color: #ffffff;
        font-weight: 600;
      }
      #zenvq-auto-widget-pill .zvq-list {
        max-height: 250px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      #zenvq-auto-widget-pill .zvq-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 7px 10px;
        border: 1px solid transparent;
        background: transparent;
        color: #e4e4e7;
        font-size: 12px;
        text-align: left;
        border-radius: 10px;
        cursor: pointer;
      }
      #zenvq-auto-widget-pill .zvq-item:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #ffffff;
      }
      #zenvq-auto-widget-pill .zvq-item.active {
        background: rgba(255, 255, 255, 0.09);
        border-color: rgba(255, 255, 255, 0.15);
        color: #ffffff;
        font-weight: 600;
      }
      /* Light Mode Overrides */
      html.light #zenvq-auto-widget-pill .zvq-capsule,
      body.light #zenvq-auto-widget-pill .zvq-capsule,
      html[data-theme="light"] #zenvq-auto-widget-pill .zvq-capsule,
      html[data-theme="purple"] #zenvq-auto-widget-pill .zvq-capsule {
        background: rgba(255, 255, 255, 0.96) !important;
        border-color: rgba(15, 23, 42, 0.14) !important;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12) !important;
        color: #0f172a !important;
      }
      html.light #zenvq-auto-widget-pill .zvq-lang-btn,
      body.light #zenvq-auto-widget-pill .zvq-lang-btn,
      html[data-theme="light"] #zenvq-auto-widget-pill .zvq-lang-btn,
      html[data-theme="purple"] #zenvq-auto-widget-pill .zvq-lang-btn {
        color: #0f172a !important;
      }
      html.light #zenvq-auto-widget-pill .zvq-lang-btn:hover,
      html[data-theme="light"] #zenvq-auto-widget-pill .zvq-lang-btn:hover {
        background: rgba(15, 23, 42, 0.05) !important;
      }
      html.light #zenvq-auto-widget-pill .zvq-divider,
      html[data-theme="light"] #zenvq-auto-widget-pill .zvq-divider,
      html[data-theme="purple"] #zenvq-auto-widget-pill .zvq-divider {
        background: rgba(15, 23, 42, 0.12) !important;
      }
      html.light #zenvq-auto-widget-pill .zvq-theme-btn,
      html[data-theme="light"] #zenvq-auto-widget-pill .zvq-theme-btn,
      html[data-theme="purple"] #zenvq-auto-widget-pill .zvq-theme-btn {
        color: #475569 !important;
      }
      html.light #zenvq-auto-widget-pill .zvq-menu,
      html[data-theme="light"] #zenvq-auto-widget-pill .zvq-menu,
      html[data-theme="purple"] #zenvq-auto-widget-pill .zvq-menu {
        background: #ffffff !important;
        border-color: rgba(15, 23, 42, 0.14) !important;
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.16) !important;
        color: #0f172a !important;
      }
      html.light #zenvq-auto-widget-pill .zvq-theme-strip,
      html[data-theme="light"] #zenvq-auto-widget-pill .zvq-theme-strip {
        border-bottom-color: rgba(15, 23, 42, 0.08) !important;
        color: #64748b !important;
      }
      html.light #zenvq-auto-widget-pill .zvq-theme-seg,
      html[data-theme="light"] #zenvq-auto-widget-pill .zvq-theme-seg {
        background: #f1f5f9 !important;
        border-color: rgba(15, 23, 42, 0.1) !important;
      }
      html.light #zenvq-auto-widget-pill .zvq-theme-opt,
      html[data-theme="light"] #zenvq-auto-widget-pill .zvq-theme-opt {
        color: #64748b !important;
      }
      html.light #zenvq-auto-widget-pill .zvq-theme-opt.active,
      html[data-theme="light"] #zenvq-auto-widget-pill .zvq-theme-opt.active {
        background: #ffffff !important;
        color: #0f172a !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
      }
      html.light #zenvq-auto-widget-pill .zvq-item,
      html[data-theme="light"] #zenvq-auto-widget-pill .zvq-item {
        color: #334155 !important;
      }
      html.light #zenvq-auto-widget-pill .zvq-item:hover,
      html[data-theme="light"] #zenvq-auto-widget-pill .zvq-item:hover {
        background: #f8fafc !important;
        color: #0f172a !important;
      }
      html.light #zenvq-auto-widget-pill .zvq-item.active,
      html[data-theme="light"] #zenvq-auto-widget-pill .zvq-item.active {
        background: #f1f5f9 !important;
        border-color: #cbd5e1 !important;
        color: #0f172a !important;
      }
      header[data-zenvq-nav-anchor],
      nav[data-zenvq-nav-anchor] {
        direction: ltr !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function detectActiveThemeMode() {
    try {
      const root = document.documentElement;
      if (root.classList.contains("light")) return "light";
      if (root.classList.contains("dark")) return "dark";
      const attr = root.getAttribute("data-theme") || root.getAttribute("data-mode");
      if (attr === "light" || attr === "purple") return "light";
      if (attr === "dark") return "dark";
      const stored = localStorage.getItem("zenvq_theme") || localStorage.getItem("zenvq-theme") || localStorage.getItem("theme");
      if (stored === "light" || stored === "purple") return "light";
      if (stored === "dark") return "dark";
    } catch {}
    return "dark";
  }

  function applyGlobalThemeMode(targetMode) {
    try {
      const root = document.documentElement;
      const body = document.body;
      root.classList.remove("dark", "light", "dark-theme", "light-theme");
      root.classList.add(targetMode);
      root.setAttribute("data-theme", targetMode);
      root.setAttribute("data-mode", targetMode);
      if (body) {
        body.classList.remove("dark", "light", "dark-theme", "light-theme");
        body.classList.add(targetMode);
      }
      localStorage.setItem("theme", targetMode);
      localStorage.setItem("zenvq_theme", targetMode);
      localStorage.setItem("zenvq-theme", targetMode);
      localStorage.setItem("saif-portfolio-theme", targetMode);
      localStorage.setItem("zenvq_tools_theme", targetMode);
      localStorage.setItem("ni-theme", targetMode);
      localStorage.setItem("theme-preference", targetMode);
      window.dispatchEvent(new CustomEvent("zenvq-theme-changed", { detail: { theme: targetMode } }));
    } catch {}
  }

  // Self-contained Unified Language & Theme Pill for non-React websites with data-auto-widget="true"
  function injectAutoWidgetIfNeeded() {
    const currentScript = document.currentScript || document.querySelector('script[src*="zenvq-translate"], script[src*="loader.js"], script[data-auto-widget="true"]');
    if (!currentScript || currentScript.getAttribute("data-auto-widget") !== "true") return;

    if (document.getElementById("zenvq-auto-widget-pill")) return;

    // Do not inject floating widget if a ZenVQ Language Dock already exists in the DOM
    if (document.querySelector('[data-zenvq-dock="true"]') || document.querySelector('.zenvq-lang-dock')) {
      return;
    }

    const widget = document.createElement("div");
    widget.id = "zenvq-auto-widget-pill";
    widget.className = "notranslate";
    widget.setAttribute("translate", "no");
    widget.setAttribute("dir", "ltr");

    const capsule = document.createElement("div");
    capsule.className = "zvq-capsule";

    const activeMeta = LANGUAGES.find(function (l) { return l.code === currentLang; }) || LANGUAGES[0];
    const langBtn = document.createElement("button");
    langBtn.type = "button";
    langBtn.className = "zvq-lang-btn";
    langBtn.innerHTML = '<svg style="width:14px;height:14px;color:#00E599;flex-shrink:0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg><span id="zvq-widget-label">' + activeMeta.native + '</span> <span style="opacity:0.6;font-size:10px;font-family:monospace;">(' + activeMeta.badge + ')</span>';

    const divider = document.createElement("div");
    divider.className = "zvq-divider";

    const themeBtn = document.createElement("button");
    themeBtn.type = "button";
    themeBtn.className = "zvq-theme-btn";
    themeBtn.setAttribute("aria-label", "Toggle Dark and Light theme");

    const moonSvg = '<svg style="width:14px;height:14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    const sunSvg = '<svg style="width:14px;height:14px;color:#f59e0b;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/></svg>';

    const menu = document.createElement("div");
    menu.className = "zvq-menu";

    // Display Theme Strip
    const strip = document.createElement("div");
    strip.className = "zvq-theme-strip";
    strip.innerHTML = '<span style="font-family:monospace;text-transform:uppercase;letter-spacing:0.06em;">Display Theme</span>';
    const seg = document.createElement("div");
    seg.className = "zvq-theme-seg";
    const darkOpt = document.createElement("button");
    darkOpt.type = "button";
    darkOpt.className = "zvq-theme-opt";
    darkOpt.innerHTML = moonSvg + '<span>Dark</span>';
    const lightOpt = document.createElement("button");
    lightOpt.type = "button";
    lightOpt.className = "zvq-theme-opt";
    lightOpt.innerHTML = sunSvg + '<span>Light</span>';
    seg.appendChild(darkOpt);
    seg.appendChild(lightOpt);
    strip.appendChild(seg);
    menu.appendChild(strip);

    function syncWidgetThemeUI() {
      const m = detectActiveThemeMode();
      themeBtn.innerHTML = m === "light" ? sunSvg : moonSvg;
      darkOpt.className = "zvq-theme-opt" + (m === "dark" ? " active" : "");
      lightOpt.className = "zvq-theme-opt" + (m === "light" ? " active" : "");
    }
    syncWidgetThemeUI();

    themeBtn.onclick = function (e) {
      e.stopPropagation();
      const next = detectActiveThemeMode() === "dark" ? "light" : "dark";
      applyGlobalThemeMode(next);
      syncWidgetThemeUI();
    };
    darkOpt.onclick = function (e) {
      e.stopPropagation();
      applyGlobalThemeMode("dark");
      syncWidgetThemeUI();
    };
    lightOpt.onclick = function (e) {
      e.stopPropagation();
      applyGlobalThemeMode("light");
      syncWidgetThemeUI();
    };
    window.addEventListener("zenvq-theme-changed", syncWidgetThemeUI);

    // Language List
    const listWrap = document.createElement("div");
    listWrap.className = "zvq-list";
    const itemButtons = {};

    LANGUAGES.forEach(function (l) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "zvq-item" + (l.code === currentLang ? " active" : "");
      item.innerHTML = '<span><strong style="font-family:monospace;font-size:10px;margin-right:6px;color:#00E599;">' + l.badge + '</strong>' + l.native + ' <small style="opacity:0.6;font-size:10px;">(' + l.name + ')</small></span>' + (l.code === currentLang ? '<span style="color:#00E599;font-size:11px;">✓</span>' : '');
      item.onclick = function () {
        applyLanguage(l.code, document.body, true);
        langBtn.innerHTML = '<svg style="width:14px;height:14px;color:#00E599;flex-shrink:0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg><span id="zvq-widget-label">' + l.native + '</span> <span style="opacity:0.6;font-size:10px;font-family:monospace;">(' + l.badge + ')</span>';
        Object.keys(itemButtons).forEach(function (k) {
          itemButtons[k].className = "zvq-item" + (k === l.code ? " active" : "");
        });
        menu.style.display = "none";
      };
      itemButtons[l.code] = item;
      listWrap.appendChild(item);
    });
    menu.appendChild(listWrap);

    langBtn.onclick = function (e) {
      e.stopPropagation();
      syncWidgetThemeUI();
      menu.style.display = menu.style.display === "none" ? "block" : "none";
    };

    document.addEventListener("click", function () {
      menu.style.display = "none";
    });

    capsule.appendChild(langBtn);
    capsule.appendChild(divider);
    capsule.appendChild(themeBtn);
    widget.appendChild(capsule);
    widget.appendChild(menu);
    document.body.appendChild(widget);
  }

  // Expose Global API for React Components & External Scripts
  window.ZenVQTranslate = {
    languages: LANGUAGES,
    getCurrentLanguage: function () { return currentLang; },
    getDetectedLanguage: function () { return detectInitialLanguage(); },
    setLanguage: function (langCode) { return applyLanguage(langCode, document.body, true); },
    refresh: function () { return applyLanguage(currentLang, document.body, false); }
  };

  function init() {
    injectStableLocationStyles();
    setupMutationObserver();
    injectAutoWidgetIfNeeded();
    if (currentLang && currentLang !== "en") {
      setTimeout(function () { applyLanguage(currentLang, document.body); }, 120);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);

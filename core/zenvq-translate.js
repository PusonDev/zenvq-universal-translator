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
      header[data-zenvq-nav-anchor],
      nav[data-zenvq-nav-anchor] {
        direction: ltr !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  // Self-contained Floating Pill for non-React websites with data-auto-widget="true"
  function injectAutoWidgetIfNeeded() {
    const currentScript = document.currentScript || document.querySelector('script[src*="zenvq-translate"]');
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
    widget.style.cssText = "position:fixed !important;bottom:24px !important;right:24px !important;left:auto !important;z-index:999999 !important;direction:ltr !important;font-family:system-ui,-apple-system,sans-serif;";

    const btn = document.createElement("button");
    btn.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:9999px;background:#09090b;color:#ffffff;border:1px solid rgba(255,255,255,0.2);box-shadow:0 10px 30px rgba(0,0,0,0.5);cursor:pointer;font-size:12px;font-weight:600;";
    btn.innerHTML = '🌐 <span id="zvq-widget-label">English</span>';

    const menu = document.createElement("div");
    menu.style.cssText = "display:none;position:absolute;bottom:48px;right:0;width:240px;max-height:300px;overflow-y:auto;background:#09090b;border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:6px;box-shadow:0 20px 40px rgba(0,0,0,0.8);";

    LANGUAGES.forEach(function (l) {
      const item = document.createElement("button");
      item.style.cssText = "display:flex;align-items:center;justify-content:space-between;width:100%;padding:8px 12px;border:none;background:transparent;color:#f4f4f5;font-size:12px;text-align:left;border-radius:8px;cursor:pointer;";
      item.innerHTML = '<span>' + l.native + ' <small style="opacity:0.6;font-size:10px;">(' + l.name + ')</small></span><span style="opacity:0.5;font-size:10px;">' + l.badge + '</span>';
      item.onmouseover = function () { item.style.background = "rgba(255,255,255,0.1)"; };
      item.onmouseout = function () { item.style.background = "transparent"; };
      item.onclick = function () {
        applyLanguage(l.code, document.body, true);
        const widgetLabel = document.getElementById("zvq-widget-label");
        if (widgetLabel) widgetLabel.textContent = l.native;
        menu.style.display = "none";
      };
      menu.appendChild(item);
    });

    btn.onclick = function (e) {
      e.stopPropagation();
      menu.style.display = menu.style.display === "none" ? "block" : "none";
    };

    document.addEventListener("click", function () {
      menu.style.display = "none";
    });

    widget.appendChild(btn);
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

---
name: auto translate zenvq
description: Universal zero-server-load live DOM translation engine and language dock for any ZenVQ or client website. Triggered whenever the user invokes "auto translate zenvq" or asks for website translation.
trigger: model_decision
---

# 🌐 MASTER RULE: `auto translate zenvq` (UNIVERSAL LIVE TRANSLATOR)

Whenever the user asks to apply **"auto translate zenvq"** or add multi-language translation to any website or project (Next.js App Router, React, Vite, HTML, WordPress or Shopify), execute the following exact architecture:

## 1. CORE ARCHITECTURAL LAWS
- **NEVER generate separate static routes per language** (no `/fr`, `/ar`, `/bn` folder bloat) and **NEVER rely on incomplete static JSON dictionaries** that leave cards or dynamic text untranslated.
- **ALWAYS use the ZenVQ Live DOM Text-Node Engine (`zenvq-translate.js`)** which traverses all DOM text nodes via `TreeWalker`, protects brand tokens (`ZenVQ`, phone numbers, prices, `<code>`, `.notranslate`), caches translations in `localStorage` for 0ms repeat switching, watches dynamic modals via `MutationObserver` and patches `Node.prototype.removeChild` / `insertBefore` so React 18 never throws hydration errors.
- **Zero Server Load:** All translation requests execute purely on the client edge with local caching.
- **Canonical Central Hub Source:** The single source of truth for this tool is located at:
  `D:\All coding installation tools\All My Main Project in real world\all extra rules, scripts, task etc for long hold\all sites translations all things`

## 2. MANDATORY 13 TARGET MARKET LANGUAGES (UNIFIED ECOSYSTEM SEQUENCE)
Always enforce the identical 13 core languages in this exact logical order across all sites:
1. `en` — English (US / UK / Global Default, `dir="ltr"`, Badge: `EN`)
2. `bn` — বাংলা (Bengali - Bangladesh / Local Hub, `dir="ltr"`, Badge: `বাং`)
3. `ar` — العربية (Arabic - UAE / KSA / GCC Diaspora, `dir="rtl"`, Badge: `ع`)
4. `de` — Deutsch (German - Germany / DACH Enterprise, `dir="ltr"`, Badge: `DE`)
5. `fr` — Français (French - France / EU / Canada, `dir="ltr"`, Badge: `FR`)
6. `es` — Español (Spanish - USA / Spain / LatAm, `dir="ltr"`, Badge: `ES`)
7. `it` — Italiano (Italian - Italy / EU Luxury & Design, `dir="ltr"`, Badge: `IT`)
8. `nl` — Nederlands (Dutch - Netherlands / Benelux Tech Hub, `dir="ltr"`, Badge: `NL`)
9. `pt` — Português (Portuguese - Portugal / Brazil, `dir="ltr"`, Badge: `PT`)
10. `ja` — 日本語 (Japanese - Japan Tech & Design, `dir="ltr"`, Badge: `日`)
11. `zh-CN` — 简体中文 (Chinese - East Asia / Global Commerce, `dir="ltr"`, Badge: `中`)
12. `ur` — اردو (Urdu - Pakistan / South Asia & GCC, `dir="rtl"`, Badge: `ار`)
13. `hi` — हिन्दी (Hindi - India / South Asia, `dir="ltr"`, Badge: `हि`)

## 3. ZERO-DISPLACEMENT UX LAW (STABLE BUTTON LOCATION RULE)
- **STRICT PERMANENT PROHIBITION:** Regardless of whether the active language is LTR or RTL (`ar` Arabic, `ur` Urdu, etc.), the language switcher dock, button, floating pill and header action controls MUST NEVER shift their physical coordinates or flip sides across the screen.
- **Why this law exists:** If the switcher jumps from the right side of the navbar to the left when a user selects Arabic or Urdu, a user who does not understand that language loses orientation and finds it almost impossible to find the button and switch back to English or their native language.
- **Enforcement Rules:**
  1. The language dock component and floating auto-widget MUST strictly enforce `dir="ltr"` and `style={{ direction: "ltr" }}` (`direction: ltr !important; unicode-bidi: isolate !important;`).
  2. The navigation header bar or action container housing the language switcher MUST be marked with `dir="ltr"` (`data-zenvq-nav-anchor="true"`) so action buttons stay anchored at the top-right / fixed location without jumping.
  3. The standalone floating widget (`#zenvq-auto-widget-pill`) MUST be hard-locked to `position: fixed !important; bottom: 24px !important; right: 24px !important; left: auto !important; direction: ltr !important;`.

## 4. ONE-STEP IMPLEMENTATION CHECKLIST FOR ANY PROJECT
1. Copy `zenvq-translate.js` to `/public/lib/zenvq-translate.js` and inject `<script src="/lib/zenvq-translate.js" defer></script>` into root `app/layout.tsx` or `index.html`.
2. Mount `<ZenVQLanguageDock/>` inside the main navigation header (with `translate="no"`, `dir="ltr"` and `className="notranslate"` on the switcher itself so language names stay in their native script).
3. Ensure the parent navbar or action container has `dir="ltr"` and `data-zenvq-nav-anchor="true"` so it remains physically stable.
4. Add `translate="no"` / `className="notranslate"` to brand logos, code snippets and PIN inputs.
5. Alternatively, run the universal install script:
   `powershell -ExecutionPolicy Bypass -File "D:\All coding installation tools\All My Main Project in real world\all extra rules, scripts, task etc for long hold\all sites translations all things\scripts\install-translator.ps1" -TargetProject "<project-path>"`

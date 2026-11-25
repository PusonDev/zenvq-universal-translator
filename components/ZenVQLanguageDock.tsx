"use client";

import React, { useState, useEffect, useRef } from "react";

export interface LanguageItem {
  code: string;
  name: string;
  native: string;
  region: string;
  dir: "ltr" | "rtl";
  badge: string;
}

export const ZENVQ_LANGUAGES: LanguageItem[] = [
  // 1. Core Primary Hubs
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

// Universal Inline SVGs (Zero external package dependencies)
function GlobeIcon({ className = "w-3.5 h-3.5", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function MoonIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function SunIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
    </svg>
  );
}

function CheckIcon({ className = "w-3.5 h-3.5", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

interface ZenVQLanguageDockProps {
  variant?: "header" | "mobile" | "standalone";
  theme?: "engineering" | "creative" | "auto" | "botanical";
  className?: string;
  dropDirection?: "down" | "up";
}

export function ZenVQLanguageDock({
  variant = "header",
  theme = "engineering",
  className = "",
  dropDirection = "down"
}: ZenVQLanguageDockProps) {
  const [currentCode, setCurrentCode] = useState<string>("en");
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [mode, setMode] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);
  const [isCreative, setIsCreative] = useState(theme === "creative");
  const dockRef = useRef<HTMLDivElement>(null);

  const detectCurrentMode = (): "dark" | "light" => {
    try {
      if (typeof window === "undefined") return "dark";
      const root = document.documentElement;
      const body = document.body;

      // 1. Root DOM classes & data-theme attributes
      if (root.classList.contains("light")) return "light";
      if (root.classList.contains("dark")) return "dark";

      const attrTheme = root.getAttribute("data-theme") || root.getAttribute("data-mode");
      if (attrTheme === "light" || attrTheme === "purple") return "light";
      if (attrTheme === "dark") return "dark";

      if (body && body.classList.contains("light")) return "light";
      if (body && body.classList.contains("dark")) return "dark";

      // 2. Stored user preference across ecosystem keys
      const stored =
        localStorage.getItem("zenvq_theme") ||
        localStorage.getItem("zenvq-theme") ||
        localStorage.getItem("theme") ||
        localStorage.getItem("saif-portfolio-theme") ||
        localStorage.getItem("zenvq_tools_theme") ||
        localStorage.getItem("ni-theme") ||
        localStorage.getItem("theme-preference");

      if (stored === "light" || stored === "purple") return "light";
      if (stored === "dark") return "dark";

      // 3. System OS fallback
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light";
      }
    } catch {}
    return "dark";
  };

  // Sync theme with documentElement, body and localStorage without clobbering on initial mount
  const applyThemeMode = (targetMode: "dark" | "light") => {
    setMode(targetMode);
    if (typeof window === "undefined") return;

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

    try {
      localStorage.setItem("theme", targetMode);
      localStorage.setItem("zenvq_theme", targetMode);
      localStorage.setItem("zenvq-theme", targetMode);
      localStorage.setItem("saif-portfolio-theme", targetMode);
      localStorage.setItem("zenvq_tools_theme", targetMode);
      localStorage.setItem("ni-theme", targetMode);
      localStorage.setItem("theme-preference", targetMode);
    } catch {}

    window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme: targetMode } }));
    window.dispatchEvent(new CustomEvent("zenvq-theme-changed", { detail: { theme: targetMode } }));
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    // Read active page theme cleanly without overwriting existing site theme (e.g. Suggests purple)
    setMode(detectCurrentMode());

    const observer = new MutationObserver(() => {
      setMode(detectCurrentMode());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-mode"]
    });

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class", "data-theme"]
      });
    }

    const handleExternalTheme = () => setMode(detectCurrentMode());
    window.addEventListener("zenvq-theme-changed", handleExternalTheme);
    window.addEventListener("theme-change", handleExternalTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("zenvq-theme-changed", handleExternalTheme);
      window.removeEventListener("theme-change", handleExternalTheme);
    };
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMode = mode === "dark" ? "light" : "dark";
    applyThemeMode(nextMode);
  };

  const setThemeExplicit = (targetMode: "dark" | "light") => {
    applyThemeMode(targetMode);
  };

  // Detect route for dynamic theme accent
  useEffect(() => {
    if (theme === "creative") {
      setIsCreative(true);
    } else if (theme === "engineering") {
      setIsCreative(false);
    } else if (typeof window !== "undefined") {
      const p = window.location.pathname;
      const s = window.location.search;
      setIsCreative(p.includes("/creative") || s.includes("tab=creative"));
    }
  }, [theme]);

  // Helper to match browser locale to supported languages
  const matchSupportedLanguage = (localeStr: string): string | null => {
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
  };

  const detectClientLanguage = (): string => {
    try {
      if (typeof window !== "undefined") {
        if (window.location && window.location.search) {
          const params = new URLSearchParams(window.location.search);
          const urlLang = params.get("lang");
          if (urlLang) {
            const matched = matchSupportedLanguage(urlLang);
            if (matched) return matched;
          }
        }
        const saved = localStorage.getItem("zenvq_live_lang");
        if (saved && ZENVQ_LANGUAGES.some((l) => l.code === saved)) {
          return saved;
        }
        const candidates: string[] = [];
        if (Array.isArray(navigator.languages)) {
          candidates.push(...navigator.languages);
        }
        if (navigator.language) candidates.push(navigator.language);
        try {
          const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
          if (intlLocale) candidates.push(intlLocale);
        } catch {}
        for (const cand of candidates) {
          const matched = matchSupportedLanguage(cand);
          if (matched) return matched;
        }
      }
    } catch {}
    return "en";
  };

  // Sync active language from translator engine or browser detection on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const translator = (window as unknown as {
        ZenVQTranslate?: { getCurrentLanguage?: () => string };
      }).ZenVQTranslate;

      let initial = "en";
      if (translator && typeof translator.getCurrentLanguage === "function") {
        initial = translator.getCurrentLanguage();
      } else {
        initial = detectClientLanguage();
      }
      setCurrentCode(initial);

      const handleLangChange = (e: Event) => {
        const customEvent = e as CustomEvent<{ lang: string }>;
        if (customEvent.detail && customEvent.detail.lang) {
          setCurrentCode(customEvent.detail.lang);
          setIsTranslating(false);
        }
      };

      window.addEventListener("zenvq-lang-changed", handleLangChange);
      return () => window.removeEventListener("zenvq-lang-changed", handleLangChange);
    }
  }, []);

  // Handle outside clicks and keyboard escape
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selectLanguage = async (code: string) => {
    if (code === currentCode) {
      setIsOpen(false);
      return;
    }

    setCurrentCode(code);
    setIsOpen(false);
    setIsTranslating(true);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("zenvq_live_lang", code);
        localStorage.setItem("zenvq_lang_user_selected", "true");

        const translator = (window as unknown as {
          ZenVQTranslate?: { setLanguage: (c: string) => Promise<void> | void };
        }).ZenVQTranslate;

        if (translator && typeof translator.setLanguage === "function") {
          await translator.setLanguage(code);
        } else {
          const meta = ZENVQ_LANGUAGES.find((l) => l.code === code) || ZENVQ_LANGUAGES[0];
          document.documentElement.setAttribute("lang", code);
          document.documentElement.setAttribute("dir", meta.dir);
        }
      }
    } catch (err) {
      console.warn("Language transition error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const activeMeta = ZENVQ_LANGUAGES.find((l) => l.code === currentCode) || ZENVQ_LANGUAGES[0];
  const isBotanical = theme === "botanical";
  const accentColor = isCreative ? "#A855F7" : isBotanical ? "#10B981" : "#00E599";
  const isLight = mounted ? mode === "light" : false;

  return (
    <div
      ref={dockRef}
      data-zenvq-dock="true"
      data-zenvq-stable="true"
      translate="no"
      dir="ltr"
      style={{ direction: "ltr", unicodeBidi: "isolate" }}
      className={`notranslate relative inline-block text-left select-none ${className}`}
    >
      {/* 
        ========================================================================
        UNIFIED DUAL-FEATURE CAPSULE BUTTON (Language Selector + Theme Toggle)
        ========================================================================
      */}
      <div
        className={`inline-flex items-center rounded-full border p-0.5 shadow-sm transition-all duration-200 ${
          isLight
            ? "border-slate-200/90 bg-white/95 text-slate-900 shadow-slate-100 hover:border-slate-300"
            : "border-white/10 bg-[#141418]/90 text-white hover:border-white/20"
        }`}
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)"
        }}
      >
        {/* Left Sub-Control: Language Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Select translation language"
          className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer ${
            isLight
              ? "text-slate-800 hover:bg-slate-100/80"
              : "text-zinc-200 hover:bg-white/[0.06]"
          }`}
        >
          {isTranslating ? (
            <span
              className="h-2 w-2 rounded-full animate-ping shrink-0"
              style={{ backgroundColor: accentColor }}
            />
          ) : (
            <GlobeIcon className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
          )}

          {/* Primary Language Name — Native script for instant recognition */}
          <span className={`font-sans font-medium text-xs ${isLight ? "text-slate-900" : "text-white"}`}>
            {activeMeta.native}
          </span>

          {/* Badge Label */}
          <span className={`text-[10px] font-mono uppercase tracking-wider hidden sm:inline ${
            isLight ? "text-slate-500" : "text-zinc-400"
          }`}>
            ({activeMeta.badge})
          </span>

          <ChevronDownIcon
            className={`w-3 h-3 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            } ${isLight ? "text-slate-500" : "text-zinc-400"}`}
          />
        </button>

        {/* 1px Hairline Divider Between Features */}
        <div className={`w-px h-3.5 mx-0.5 shrink-0 ${isLight ? "bg-slate-200" : "bg-white/10"}`} />

        {/* Right Sub-Control: Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Dark and Light theme"
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              : "text-zinc-300 hover:text-white hover:bg-white/[0.08]"
          }`}
        >
          {isLight ? (
            <SunIcon className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <MoonIcon className="w-3.5 h-3.5 text-zinc-300" />
          )}
        </button>
      </div>

      {/* 
        ========================================================================
        POPOVER PALETTE: 100% Solid Opaque Background (Zero Transparency Bug)
        ========================================================================
      */}
      {isOpen && (
        <div
          data-zenvq-stable="true"
          dir="ltr"
          style={{
            direction: "ltr",
            unicodeBidi: "isolate"
          }}
          className={`notranslate absolute ${
            dropDirection === "up"
              ? "bottom-full mb-2.5 right-0 w-[min(20rem,calc(100vw-1.5rem))]"
              : "top-full mt-2.5 right-0 w-[min(20rem,calc(100vw-1.5rem))]"
          } rounded-2xl border p-3.5 z-[9999] animate-in fade-in zoom-in-95 duration-150 shadow-2xl ${
            isLight
              ? "border-slate-200 bg-white text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.14)]"
              : "border-white/10 bg-[#111114] text-white shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
          }`}
        >
          {/* Section 1: Quick Theme Mode Switcher Strip */}
          <div className={`pb-2.5 mb-2.5 border-b flex items-center justify-between ${
            isLight ? "border-slate-100" : "border-white/[0.08]"
          }`}>
            <span className={`text-[11px] font-mono uppercase tracking-wider ${
              isLight ? "text-slate-500" : "text-zinc-400"
            }`}>
              Display Theme
            </span>
            <div className={`inline-flex rounded-lg border p-0.5 text-xs font-mono ${
              isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-[#18181C]"
            }`}>
              <button
                type="button"
                onClick={() => setThemeExplicit("dark")}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  !isLight
                    ? "bg-[#27272A] text-white font-medium shadow-xs border border-white/10"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <MoonIcon className="w-3 h-3 text-zinc-300" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setThemeExplicit("light")}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isLight
                    ? "bg-white text-slate-900 font-medium shadow-xs border border-slate-200"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <SunIcon className="w-3 h-3 text-amber-500" />
                <span>Light</span>
              </button>
            </div>
          </div>

          {/* Section 2: Header of Language List */}
          <div className={`px-1 pb-2 flex items-center justify-between text-[11px] font-mono ${
            isLight ? "text-slate-500" : "text-zinc-400"
          }`}>
            <span className="uppercase tracking-wider">Live DOM Translator</span>
            <span
              style={{ color: accentColor }}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                isLight ? "bg-slate-100 border-slate-200" : "bg-[#18181B] border-white/10"
              }`}
            >
              13 Languages
            </span>
          </div>

          {/* Grid of Languages with Custom Scrollbar */}
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scroll">
            {ZENVQ_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => selectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? "bg-slate-100 text-slate-900 font-semibold border border-slate-200 shadow-xs"
                        : "bg-white/[0.08] text-white font-semibold border border-white/15 shadow-xs"
                      : isLight
                      ? "text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                      : "text-zinc-300 hover:text-white hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      style={{ color: isSelected ? accentColor : undefined }}
                      className={`font-mono text-[11px] w-6 shrink-0 font-semibold ${
                        isSelected ? "" : isLight ? "text-slate-400" : "text-zinc-500"
                      }`}
                    >
                      {lang.badge}
                    </span>
                    <div className="min-w-0">
                      <div className={`font-sans font-medium flex items-center gap-1.5 ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}>
                        <span>{lang.native}</span>
                        {lang.native !== lang.name && (
                          <span className={`text-[10px] font-normal ${
                            isLight ? "text-slate-500" : "text-zinc-400"
                          }`}>
                            ({lang.name})
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] font-mono truncate ${
                        isLight ? "text-slate-500" : "text-zinc-400"
                      }`}>
                        {lang.region}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckIcon className="w-3.5 h-3.5 shrink-0 ml-2" style={{ color: accentColor }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footnote on Zero Server Load & Edge Caching */}
          <div className={`mt-2.5 pt-2 border-t px-1 flex items-center justify-between text-[10px] font-mono ${
            isLight ? "border-slate-100 text-slate-400" : "border-white/[0.06] text-zinc-500"
          }`}>
            <span>Zero Server Load</span>
            <span style={{ color: accentColor }}>Edge Cached</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ZenVQLanguageDock;

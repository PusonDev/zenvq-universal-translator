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

interface ZenVQLanguageDockProps {
  variant?: "header" | "mobile" | "standalone";
  theme?: "engineering" | "creative" | "auto" | "botanical";
  isLightMode?: boolean;
  className?: string;
}

export function ZenVQLanguageDock({
  variant = "header",
  theme = "engineering",
  isLightMode = false,
  className = ""
}: ZenVQLanguageDockProps) {
  const [currentCode, setCurrentCode] = useState<string>("en");
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCreative, setIsCreative] = useState(theme === "creative");
  const dockRef = useRef<HTMLDivElement>(null);

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

  // Sync active language from localStorage and custom event on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zenvq_live_lang");
      if (saved && ZENVQ_LANGUAGES.some((l) => l.code === saved)) {
        setCurrentCode(saved);
      }

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
    setCurrentCode(code);
    setIsOpen(false);
    setIsTranslating(true);

    try {
      if (typeof window !== "undefined") {
        const translator = (window as unknown as {
          ZenVQTranslate?: { setLanguage: (c: string) => Promise<void> | void };
        }).ZenVQTranslate;

        if (translator && typeof translator.setLanguage === "function") {
          await translator.setLanguage(code);
        } else {
          localStorage.setItem("zenvq_live_lang", code);
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
      {/* Trigger Button: Fixed LTR physical anchor to prevent displacement */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select translation language"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono transition-all border cursor-pointer ${
          isLightMode
            ? isOpen
              ? "bg-slate-200 text-slate-900 border-slate-300 shadow-sm"
              : "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border-slate-200"
            : isOpen
            ? "bg-white/[0.12] text-white border-white/20 shadow-sm"
            : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border-white/[0.10]"
        }`}
      >
        {isTranslating ? (
          <span
            className="h-2 w-2 rounded-full animate-ping shrink-0"
            style={{ backgroundColor: accentColor }}
          />
        ) : (
          <svg
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: accentColor }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        )}
        <span
          className={`font-sans font-medium text-xs ${
            isLightMode ? "text-slate-800" : "text-[#F4F4F5]"
          }`}
        >
          {activeMeta.native}
        </span>
        <span
          className={`text-[10px] uppercase tracking-wider hidden sm:inline ${
            isLightMode ? "text-slate-500" : "text-[#A1A1AA]"
          }`}
        >
          ({activeMeta.badge})
        </span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${isLightMode ? "text-slate-500" : "text-[#71717A]"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover Language Palette: 12 Mandatory Market Languages */}
      {isOpen && (
        <div
          data-zenvq-stable="true"
          dir="ltr"
          style={{ direction: "ltr", unicodeBidi: "isolate" }}
          className={`notranslate absolute ${
            variant === "mobile"
              ? "bottom-full mb-2 left-0 right-0 w-full"
              : "top-full mt-2.5 right-0 w-72 sm:w-80"
          } rounded-xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl ${
            isLightMode
              ? "border-slate-200 bg-white/95 text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.14)]"
              : "border-[#27272A] bg-[#111114]/95 text-white shadow-[0_16px_48px_rgba(0,0,0,0.85)]"
          }`}
        >
          {/* Header of Dock */}
          <div
            className={`px-2.5 py-1.5 border-b mb-1.5 flex items-center justify-between text-[11px] font-mono ${
              isLightMode ? "border-slate-100" : "border-[#1F1F23]"
            }`}
          >
            <span
              className={`uppercase tracking-wider ${
                isLightMode ? "text-slate-500" : "text-[#A1A1AA]"
              }`}
            >
              Live DOM Translator
            </span>
            <span
              style={{ color: accentColor }}
              className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${
                isLightMode
                  ? "bg-slate-100 border-slate-200"
                  : "bg-[#18181B] border-[#27272A]"
              }`}
            >
              13 Languages
            </span>
          </div>

          {/* Grid of Languages */}
          <div className="max-h-72 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
            {ZENVQ_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => selectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? isLightMode
                        ? "bg-slate-100 text-slate-900 font-semibold border border-slate-200"
                        : "bg-white/[0.10] text-white font-semibold border border-white/[0.10]"
                      : isLightMode
                      ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      style={{ color: isSelected ? accentColor : undefined }}
                      className={`font-mono text-[11px] w-6 shrink-0 font-semibold ${
                        isSelected ? "" : isLightMode ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      {lang.badge}
                    </span>
                    <div className="min-w-0">
                      <div
                        className={`font-sans font-medium flex items-center gap-1.5 ${
                          isLightMode ? "text-slate-900" : "text-slate-100"
                        }`}
                      >
                        <span>{lang.native}</span>
                        {lang.native !== lang.name && (
                          <span
                            className={`text-[10px] font-normal ${
                              isLightMode ? "text-slate-500" : "text-slate-400"
                            }`}
                          >
                            ({lang.name})
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10px] font-mono truncate ${
                          isLightMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {lang.region}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <svg
                      className="w-3.5 h-3.5 shrink-0 ml-2"
                      style={{ color: accentColor }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footnote on Zero-Server Load & Client-Edge Caching */}
          <div
            className={`mt-2 pt-2 border-t px-2.5 flex items-center justify-between text-[10px] font-mono ${
              isLightMode
                ? "border-slate-100 text-slate-500"
                : "border-[#1F1F23] text-[#A1A1AA]"
            }`}
          >
            <span>Client-Edge Cached</span>
            <span style={{ color: accentColor }}>0ms Repeat</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ZenVQLanguageDock;

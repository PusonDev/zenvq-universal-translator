"use client";

import React, { useEffect, useState } from "react";
import { ZenVQLanguageDock } from "./ZenVQLanguageDock";

interface ZenVQTranslatorProps {
  variant?: "header" | "mobile" | "standalone";
  theme?: "engineering" | "creative" | "auto";
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "inline";
  scriptSrc?: string;
  className?: string;
}

/**
 * ZenVQ Universal 1-Component Translator
 * Drop this single component into any Next.js RootLayout or React root:
 * <ZenVQTranslator />
 */
export function ZenVQTranslator({
  variant = "standalone",
  theme = "engineering",
  position = "bottom-right",
  scriptSrc = "/lib/zenvq-translate.js",
  className = ""
}: ZenVQTranslatorProps) {
  const [isScriptReady, setIsScriptReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if script already exists or is loaded
    if ((window as unknown as { __ZENVQ_TRANSLATOR_LOADED__?: boolean }).__ZENVQ_TRANSLATOR_LOADED__) {
      setIsScriptReady(true);
      return;
    }

    const existingScript = document.querySelector(`script[src*="zenvq-translate"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsScriptReady(true));
      setIsScriptReady(true);
      return;
    }

    // Inject engine script dynamically
    const script = document.createElement("script");
    script.src = scriptSrc;
    script.defer = true;
    script.onload = () => setIsScriptReady(true);
    script.onerror = () => {
      // Fallback to tools CDN if local script is missing
      const cdnScript = document.createElement("script");
      cdnScript.src = "https://tools.zenvq.com/lib/zenvq-translate.js";
      cdnScript.defer = true;
      cdnScript.onload = () => setIsScriptReady(true);
      document.head.appendChild(cdnScript);
    };
    document.head.appendChild(script);
  }, [scriptSrc]);

  if (position === "inline") {
    return (
      <div
        data-zenvq-dock="true"
        data-zenvq-stable="true"
        dir="ltr"
        style={{ direction: "ltr", unicodeBidi: "isolate" }}
        className={`notranslate ${className}`}
      >
        <ZenVQLanguageDock variant={variant} theme={theme} />
      </div>
    );
  }

  const positionStyles: Record<string, string> = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6"
  };

  const posClass = positionStyles[position] || "bottom-6 right-6";

  return (
    <div
      id="zenvq-auto-widget-pill"
      data-zenvq-dock="true"
      data-zenvq-stable="true"
      dir="ltr"
      translate="no"
      style={{
        position: "fixed",
        zIndex: 999999,
        direction: "ltr",
        unicodeBidi: "isolate"
      }}
      className={`notranslate fixed ${posClass} ${className}`}
    >
      <ZenVQLanguageDock variant="header" theme={theme} />
    </div>
  );
}

export default ZenVQTranslator;

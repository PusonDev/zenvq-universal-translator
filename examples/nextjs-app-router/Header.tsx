"use client";

import React from "react";
import Link from "next/link";
import { ZenVQLanguageDock } from "@/components/ZenVQLanguageDock";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo with translate="no" to protect token */}
        <Link
          href="/"
          translate="no"
          className="notranslate text-base font-bold font-mono tracking-tight text-white hover:text-[#00E599] transition-colors"
        >
          ZenVQ
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <Link href="#services" className="hover:text-white transition-colors">Services</Link>
          <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
          <Link href="#about" className="hover:text-white transition-colors">About</Link>
        </nav>

        {/* Action Pod: Hard-locked LTR anchor ensures dock never jumps across screen */}
        <div
          dir="ltr"
          data-zenvq-nav-anchor="true"
          style={{ direction: "ltr", unicodeBidi: "isolate" }}
          className="flex items-center gap-3 shrink-0"
        >
          <ZenVQLanguageDock variant="header" theme="engineering" />
          <Link
            href="#contact"
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#00E599] text-zinc-950 hover:bg-[#00D2B4] transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;

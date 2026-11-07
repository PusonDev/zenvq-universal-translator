# 🌐 ZenVQ Universal Live Translation Tool & Architecture Hub

> **The Central Single Source of Truth for Live DOM Translation across all ZenVQ Ecosystem Platforms, Client Sites and Future Projects.**

---

## 📌 বাংলা সংক্ষিপ্ত বিবরণ (Bengali Executive Summary)

এই রিপোজিটরিটি হলো আমাদের সম্পূর্ণ ইকোসিস্টেমের **সেন্ট্রাল মাস্টার ট্রান্সলেশন হাব (Single Source of Truth & Universal Edge API)**। 
এখন থেকে আপনার যেকোনো ওয়েবসাইটে **মাত্র একটি স্ক্রিপ্ট ট্যাগ / API কল** যুক্ত করেই পুরো ট্রান্সলেশন সিস্টেম অ্যাক্টিভ করা যাবে।

**মূল আর্কিটেকচার ও সুবিধাসমূহ:**
- **১টি API / স্ক্রিপ্ট কলে ফুল ইন্টিগ্রেশন:** ওয়েবসাইটে শুধু ১টি স্ক্রিপ্ট ট্যাগ বসালেই লাইভ ইঞ্জিন, জিরো-ডিসপ্লেসমেন্ট ল্যাঙ্গুয়েজ ডক এবং ক্যাশিং চালু হয়ে যায়।
- **ক্লাউডফ্লেয়ার এজ ওয়াকার API (`cloudflare-worker/`):** হাই-পারফরম্যান্স CDN স্ক্রিপ্ট ডেলিভারি (`GET /v1/loader.js`) এবং প্রোগ্রামেটিক REST API (`POST /v1/translate`) সাপোর্ট।
- **জিরো সার্ভার লোড:** ব্রাউজারের ক্লায়েন্ট-এজে ইনস্ট্যান্ট ট্রান্সলেশন হয়, কোনো ক্লাউড সার্ভার খরচ নেই।
- **জিরো ডিসপ্লেসমেন্ট আরটিএল ল (RTL Law):** আরবি বা উর্দু সিলেক্ট করলেও সুইচ বোতাম স্ক্রিনের ডানে ফিক্সড থাকে, কোনো জাম্প করে না।
- **রিঅ্যাক্ট ১৮ ও নেক্সট.জেএস হাইড্রেশন সেফটি প্যাচ:** `removeChild` এবং `insertBefore` এর সেফটি গার্ড থাকায় কোনো রিঅ্যাক্ট ক্র্যাশ হয় না।
- **১২টি স্ট্র্যাটেজিক ওয়ার্ল্ড ল্যাঙ্গুয়েজ:** ইংরেজি, বাংলা, আরবি, স্প্যানিশ, ফ্রেঞ্চ, জার্মান, ডাচ, ইতালিয়ান, পর্তুগিজ, হিন্দি, উর্দু এবং চাইনিজ।
- **০ মিলিসেকেন্ড রিপিট ক্যাশ:** লোকাল স্টোরেজে ক্যাশ থাকায় একবার ট্রান্সলেট হওয়া টেক্সট মুহূর্তের মধ্যে লোড হয়।

---

## ⚡ 1-Call Integration Matrix (১টি কলে ইন্টিগ্রেশন)

### Option 1: Any Website / WordPress / Shopify / Static HTML (1 Script Tag)
যেকোনো ওয়েবসাইটে `</body>` বা `<head>` এর ভেতরে শুধু নিচের ১টি লাইন বসিয়ে দিন:

```html
<!-- ZenVQ Universal Live Translation: 1-Line Edge Integration -->
<script
  src="https://tools.zenvq.com/lib/zenvq-translate.js"
  data-auto-widget="true"
  defer
></script>
```

বা আপনার ডেডিকেটেড এজ ক্লাউডফ্লেয়ার ওয়ার্কার ডেপ্লয় করার পর:
```html
<script
  src="https://translate-api.zenvq.com/v1/loader.js"
  data-auto-widget="true"
  defer
></script>
```

### Option 2: Next.js / React (1 Single Component)
Next.js App Router প্রজেক্টের `app/layout.tsx` এ শুধু কম্পোনেন্টটি ড্রপ করুন:

```tsx
import { ZenVQTranslator } from "@/components/ZenVQTranslator";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* 1-Line Drop-in Translation Pod */}
        <ZenVQTranslator position="bottom-right" theme="engineering" />
      </body>
    </html>
  );
}
```

### Option 3: REST API Endpoint (Programmatic JSON Translation)
সার্ভার সাইড বা অটোমেশন স্ক্রিপ্টের জন্য ডাইরেক্ট API কল:

```bash
# POST /v1/translate
curl -X POST "https://translate-api.zenvq.com/v1/translate" \
  -H "Content-Type: application/json" \
  -d '{"strings": ["Welcome to ZenVQ", "High-Performance Cloud"], "target": "bn"}'
```

Response:
```json
{
  "success": true,
  "target": "bn",
  "count": 2,
  "translations": {
    "Welcome to ZenVQ": "ZenVQ-তে স্বাগতম",
    "High-Performance Cloud": "উচ্চ-কার্যক্ষমতাসম্পন্ন ক্লাউড"
  }
}
```

---

## 🚀 1-Click Ecosystem Auto-Deployer

আপনার পিসির সব প্রজেক্টে (`ZenVQ-EcoSystem`, `ZenVQ-Agency`, `ZenVQ-Tools`, `Puson-Dev`, `templetes.zenvq.com` ইত্যাদি) এক ক্লিকে ট্রান্সলেশন ইঞ্জিন ও রুলস ইনজেক্ট করতে রান করুন:

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\inject-all-sites.ps1"
```

নির্দিষ্ট কোনো একক প্রজেক্টে ইনস্টল করতে:
```powershell
powershell -ExecutionPolicy Bypass -File "scripts\install-translator.ps1" -TargetProject "<path-to-target-project>"
```

---

## 📂 Repository Architecture

```text
all sites translations all things/
├── core/
│   └── zenvq-translate.js               # Master Live DOM Text-Node Translation Engine (v2)
├── components/
│   ├── ZenVQTranslator.tsx              # Universal 1-component drop-in wrapper
│   ├── ZenVQLanguageDock.tsx            # Universal Next.js / React client dock component
│   └── ZenVQLanguageDock.standalone.html# Vanilla HTML/JS dropdown & floating pill snippet
├── cloudflare-worker/                   # Serverless Edge API & CDN Loader Service
│   ├── src/index.js                     # Edge API routes (/v1/loader.js, /v1/translate)
│   ├── wrangler.jsonc                   # Cloudflare Worker configuration
│   └── package.json                     # Worker dependencies
├── rules/
│   ├── auto-translate-zenvq.md          # Global agent rule definition
│   └── TRANSLATION_MASTER_TECH_SPEC.md  # Comprehensive A-Z technical direction & architecture
├── scripts/
│   ├── inject-all-sites.ps1             # 1-click auto-deployer across all ecosystem sites
│   ├── install-translator.ps1           # 1-click installer for any single target project
│   └── verify-translator.ps1            # Codebase health and audit verification script
├── examples/
│   ├── nextjs-app-router/               # layout.tsx and Header.tsx integration reference
│   └── static-html/                     # index.html standalone browser test reference
└── README.md                            # Central documentation & user manual
```

---

## 🌍 The 12 Mandatory Market Languages

| Code | Language | Native Script | Direction | Strategic Geography |
| :--- | :--- | :--- | :--- | :--- |
| `en` | English | English | `ltr` | Global Default / USA / UK |
| `bn` | Bengali | বাংলা | `ltr` | Bangladesh Hub / Regional Base |
| `ar` | Arabic | العربية | `rtl` | UAE / KSA / GCC Diaspora |
| `es` | Spanish | Español | `ltr` | USA / Spain / Latin America |
| `fr` | French | Français | `ltr` | France / Canada / EU |
| `de` | German | Deutsch | `ltr` | Germany / DACH Enterprise |
| `nl` | Dutch | Nederlands | `ltr` | Netherlands / Benelux Tech Hub |
| `it` | Italian | Italiano | `ltr` | Italy / Southern Europe |
| `pt` | Portuguese | Português | `ltr` | Portugal / Brazil |
| `hi` | Hindi | हिन्दी | `ltr` | India / South Asia |
| `ur` | Urdu | اردو | `rtl` | Pakistan / GCC Diaspora |
| `zh-CN` | Chinese | 简体中文 | `ltr` | East Asia / Greater China |

---

## 🛡️ Core Architectural Laws

1. **TreeWalker Text-Node Traversal:** Bypasses route duplication and static JSON file bloat.
2. **React 18 Virtual DOM Safety Patch:** Overrides `removeChild` and `insertBefore` to eliminate hydration collisions.
3. **Strict Zero-Displacement RTL Law:** Anchors switcher coordinates so controls NEVER jump across the monitor.
4. **Token Protection:** Automatically protects brand names (`ZenVQ`), phone numbers, email addresses, prices and code blocks.
5. **0ms Repeat Caching:** Client edge LocalStorage caching guarantees sub-millisecond switching.

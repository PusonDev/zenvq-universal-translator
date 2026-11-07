import { ENGINE_SCRIPT } from "./engineCode.js";

const LANGUAGES = [
  { code: "en", name: "English", native: "English", region: "Global Default", dir: "ltr", badge: "EN" },
  { code: "bn", name: "Bengali", native: "বাংলা", region: "Bangladesh Hub", dir: "ltr", badge: "বাং" },
  { code: "ar", name: "Arabic", native: "العربية", region: "UAE / KSA / GCC", dir: "rtl", badge: "ع" },
  { code: "es", name: "Spanish", native: "Español", region: "USA / Spain", dir: "ltr", badge: "ES" },
  { code: "fr", name: "French", native: "Français", region: "France / EU", dir: "ltr", badge: "FR" },
  { code: "de", name: "German", native: "Deutsch", region: "Germany / DACH", dir: "ltr", badge: "DE" },
  { code: "nl", name: "Dutch", native: "Nederlands", region: "Netherlands", dir: "ltr", badge: "NL" },
  { code: "it", name: "Italian", native: "Italiano", region: "Italy / EU", dir: "ltr", badge: "IT" },
  { code: "pt", name: "Portuguese", native: "Português", region: "EU / Brazil", dir: "ltr", badge: "PT" },
  { code: "hi", name: "Hindi", native: "हिन्दी", region: "South Asia", dir: "ltr", badge: "हि" },
  { code: "ur", name: "Urdu", native: "اردو", region: "South Asia / GCC", dir: "rtl", badge: "ار" },
  { code: "zh-CN", name: "Chinese", native: "简体中文", region: "Asia Pacific", dir: "ltr", badge: "中" }
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

async function handleTranslation(strings, targetLang) {
  if (!Array.isArray(strings) || strings.length === 0) {
    return {};
  }

  const delimiter = "\n=====\n";
  const chunks = [];
  let currentChunk = [];
  let currentLen = 0;

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
        // Fallback to single string fetch
      }

      // Fallback
      await Promise.all(
        chunk.map(async (str) => {
          const singleUrl =
            "https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=auto&tl=" +
            encodeURIComponent(targetLang) +
            "&dt=t&q=" +
            encodeURIComponent(str);
          try {
            const singleRes = await fetch(singleUrl);
            if (singleRes.ok) {
              const singleData = await singleRes.json();
              if (Array.isArray(singleData) && Array.isArray(singleData[0])) {
                results[str] = singleData[0].map((p) => p[0]).join("").trim();
                return;
              }
            }
          } catch {}
          results[str] = str;
        })
      );
    })
  );

  return results;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // 1. Unified Script CDN Endpoint
    if (path === "/v1/loader.js" || path === "/translate.js" || path === "/loader.js") {
      return new Response(ENGINE_SCRIPT, {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
        }
      });
    }

    // 2. Languages Metadata Endpoint
    if (path === "/v1/languages" || path === "/languages") {
      return new Response(
        JSON.stringify({
          success: true,
          total: LANGUAGES.length,
          languages: LANGUAGES
        }, null, 2),
        {
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=86400"
          }
        }
      );
    }

    // 3. Batch Translate REST API Endpoint
    if (path === "/v1/translate" || path === "/translate") {
      if (request.method === "POST") {
        try {
          const body = await request.json();
          const strings = body.strings || body.texts || [];
          const target = body.target || body.targetLang || "bn";

          if (!Array.isArray(strings) || strings.length === 0) {
            return new Response(
              JSON.stringify({ success: false, error: "strings array is required" }),
              { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
            );
          }

          const translations = await handleTranslation(strings, target);
          return new Response(
            JSON.stringify({
              success: true,
              target,
              count: Object.keys(translations).length,
              translations
            }),
            {
              headers: {
                ...CORS_HEADERS,
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "public, max-age=3600"
              }
            }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }
      }

      if (request.method === "GET") {
        const text = url.searchParams.get("text") || url.searchParams.get("q");
        const target = url.searchParams.get("target") || url.searchParams.get("tl") || "bn";
        if (!text) {
          return new Response(
            JSON.stringify({ success: false, error: "text parameter is required" }),
            { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }

        const translations = await handleTranslation([text], target);
        return new Response(
          JSON.stringify({
            success: true,
            target,
            original: text,
            translated: translations[text] || text
          }),
          {
            headers: {
              ...CORS_HEADERS,
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "public, max-age=3600"
            }
          }
        );
      }
    }

    // 4. Service Health and Discovery Endpoint
    return new Response(
      JSON.stringify({
        status: "online",
        service: "ZenVQ Universal Translation Edge API",
        version: "2.0.0",
        endpoints: {
          cdn_loader: "/v1/loader.js",
          languages: "/v1/languages",
          batch_translate_post: "/v1/translate",
          single_translate_get: "/v1/translate?text=Hello&target=bn"
        },
        usage_example: '<script src="https://translate-api.zenvq.com/v1/loader.js" data-auto-widget="true" defer></script>'
      }, null, 2),
      {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  }
};

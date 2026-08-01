const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const helpers = `
    const round3 = (x) => {
      const n = Math.round((Number(x) || 0) * 1000) / 1000;
      return isNaN(n) ? 0 : n;
    };

    const formatTND = (x) => round3(x).toFixed(3).replace(".", ",");

    const parseMoney = (raw) => {
      if (raw == null) return { value: 0, bad: false };
      let s = String(raw).trim();
      s = s.replace(/DT|TND|د\\.?ت\\.?|دينار|\\$|€|\\s|\\u00A0/g, "");
      if (s === "") return { value: 0, bad: false };
      
      if (s.includes(",") && s.includes(".")) {
        const firstComma = s.indexOf(",");
        const firstDot = s.indexOf(".");
        if (firstComma < firstDot) {
          s = s.replace(/,/g, "");
        } else {
          s = s.replace(/\\./g, "").replace(/,/g, ".");
        }
      } else if (s.includes(",")) {
        const lastComma = s.lastIndexOf(",");
        const afterComma = s.substring(lastComma + 1);
        if (afterComma.length >= 1 && afterComma.length <= 3) {
          s = s.substring(0, lastComma).replace(/,/g, "") + "." + afterComma;
        } else {
          s = s.replace(/,/g, "");
        }
      }
      
      const n = Number(s.replace(/[^0-9.\\-]/g, ""));
      if (!isFinite(n) || isNaN(n)) return { value: 0, bad: true };
      return { value: round3(n), bad: false };
    };

    const normalizeCity = (raw) => {
      if (!raw) return "";
      return String(raw)
        .normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "")
        .toLowerCase()
        .replace(/[.,/#!$%\\^&\\*;:{}=\\-_~()]/g, "")
        .replace(/\\s+/g, " ")
        .trim();
    };

    const GOV_ALIASES = {
      "GRAND_TUNIS.TUNIS": ["tunis", "tunez", "tunes", "تونس", "تونس المدينة", "la marsa", "المرسى", "marsa", "carthage", "قرطاج", "le bardo", "باردو", "bardo", "sidi hassine", "el omrane", "ettadhamen", "hrairia", "jebel jelloud", "el kabaria", "sidi el bechir", "bab bhar", "bab souika", "la goulette", "حلق الوادي", "goulette", "kram", "الكرم", "sidi bou said", "سيدي بوسعيد"],
      "GRAND_TUNIS.ARIANA": ["ariana", "أريانة", "aryanah", "arianah", "la soukra", "السوكرة", "soukra", "raoued", "رواد", "روّاد", "kalaat el andalous", "sidi thabet", "mnihla", "المنيهلة", "اريانة المدينة", "ariana ville", "ariana medina"],
      "GRAND_TUNIS.BEN_AROUS": ["ben arous", "بن عروس", "بنعرس", "el mourouj", "المروج", "mourouj", "hammam-lif", "hammam lif", "حمام الانف", "hammam chott", "ezzahra", "rades", "رادس", "megrine", "megarine", "mornag", "fouchana", "mohamedia", "bou mhel el bassatine"],
      "GRAND_TUNIS.MANNOUBA": ["mannouba", "manouba", "la manouba", "منوبة", "المنوبة", "oued ellil", "وادي الليل", "mornaguia", "borj el amri", "douar hicher", "el batan", "tebourba", "طبربة", "jedaida", "الجديدة"]
    };

    const REVERSE_GOV = new Map();
    for (const [id, aliases] of Object.entries(GOV_ALIASES)) {
      for (const alias of aliases) {
        REVERSE_GOV.set(normalizeCity(alias), id);
      }
    }

    const resolveGov = (raw) => {
      const norm = normalizeCity(raw);
      if (!norm) return { canonical: "OTHER", isGrandTunis: false, unknown: false, raw: raw };
      const id = REVERSE_GOV.get(norm);
      return { 
        canonical: id ?? "OTHER", 
        isGrandTunis: !!id && id.startsWith("GRAND_TUNIS"), 
        unknown: id == null,
        raw: raw
      };
    };

    const statusBucket = (codeOrLabel) => {
      const s = String(codeOrLabel).trim().toLowerCase();
      if (["5000", "livre", "livré", "delivered", "تم التسليم", "مسلم", "مسلّم"].includes(s)) return "delivered";
      if (["6900", "retourne", "retourné", "returned", "retour reçu", "مسترجع", "مرتجع", "تم الارجاع"].includes(s)) return "returned";
      if (["1100", "1101", "1102", "9000", "9001", "9002", "9003", "9004", "annule", "annulé", "cancelled", "ملغى", "ملغي"].includes(s)) return "cancelled";
      if (["6500", "exchange", "تبادل"].includes(s)) return "exchange";
      if (["6000", "6001", "3201", "return_in_progress"].includes(s)) return "return_in_progress";
      return "in_progress";
    };
`;

html = html.replace("const { useState, useCallback, useMemo, useRef, useEffect } = React;", "const { useState, useCallback, useMemo, useRef, useEffect } = React;\n" + helpers);

fs.writeFileSync('index.html', html);

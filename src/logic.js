/* =========================================================================
 * THE PARLOR  ·  logic.js
 * Pure, DOM-free helpers shared by the games. Kept separate so they can be
 * unit-tested in Node (see tests/). Attaches to window.P.Logic.
 * ========================================================================= */
(function (root) {
  const P = (root.P = root.P || {});
  const L = (P.Logic = {});

  /* ---------- Word Lock (Wordle-style) scoring ----------
   * Returns an array of "g" (right letter, right spot), "y" (in the word,
   * other spot) or "x" (not in the word). Handles repeated letters the way
   * players expect: greens are claimed first, then yellows left-to-right. */
  L.scoreGuess = function (guess, answer) {
    guess = String(guess).toLowerCase();
    answer = String(answer).toLowerCase();
    const res = new Array(guess.length).fill("x");
    const left = {};
    for (let i = 0; i < answer.length; i++) {
      if (guess[i] === answer[i]) res[i] = "g";
      else left[answer[i]] = (left[answer[i]] || 0) + 1;
    }
    for (let i = 0; i < guess.length; i++) {
      if (res[i] === "g") continue;
      const c = guess[i];
      if (left[c] > 0) { res[i] = "y"; left[c]--; }
    }
    return res;
  };

  /* Best known state of each letter for colouring the on-screen keyboard. */
  L.keyStates = function (rows) {
    const rank = { x: 1, y: 2, g: 3 };
    const out = {};
    rows.forEach(({ guess, fb }) => {
      for (let i = 0; i < guess.length; i++) {
        const c = guess[i], s = fb[i];
        if (!out[c] || rank[s] > rank[out[c]]) out[c] = s;
      }
    });
    return out;
  };

  /* ---------- Speech matching ----------
   * Speech recognition is unreliable on disordered speech, so matching is
   * deliberately lenient and ONLY ever used to confirm success, never to mark
   * an attempt wrong. */
  L.normalize = function (s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  L.levenshtein = function (a, b) {
    a = String(a); b = String(b);
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let prev = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j++) prev[j] = j;
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      prev = cur;
    }
    return prev[b.length];
  };

  L.similarity = function (a, b) {
    a = L.normalize(a); b = L.normalize(b);
    const len = Math.max(a.length, b.length);
    if (!len) return 1;
    return 1 - L.levenshtein(a, b) / len;
  };

  // Words that recognisers commonly return for the same spoken form.
  const HOMOPHONES = [
    ["two", "to", "too", "2"], ["four", "for", "fore", "4"], ["one", "won", "1"],
    ["eight", "ate", "8"], ["tea", "tee", "t"], ["bee", "be", "b"], ["sea", "see", "c"],
    ["pea", "pee", "p"], ["pear", "pair", "pare"], ["bear", "bare"], ["no", "know"],
    ["nose", "knows"], ["red", "read"], ["knight", "night"], ["hear", "here"],
    ["meat", "meet"], ["flower", "flour"], ["son", "sun"], ["whale", "wail"],
    ["deer", "dear"], ["hair", "hare"], ["ant", "aunt"], ["tail", "tale"],
    ["wood", "would"], ["write", "right"], ["rose", "rows"], ["toe", "tow"],
    ["bow", "bough"], ["ring", "wring"], ["mail", "male"], ["plane", "plain"],
    ["wed", "wet"], ["dough", "doe", "d o"], ["eye", "i", "aye"], ["you", "u", "ewe"],
    ["okay", "ok"], ["tv", "t v", "television"], ["mom", "mum", "mam"],
  ];
  const HMAP = {};
  HOMOPHONES.forEach((set) => set.forEach((w) => (HMAP[w] = set)));

  function variants(word) {
    const n = L.normalize(word);
    const out = new Set([n]);
    if (HMAP[n]) HMAP[n].forEach((w) => out.add(w));
    // simple plural / article tolerance
    out.add(n.replace(/^(a|an|the) /, ""));
    if (n.endsWith("s")) out.add(n.slice(0, -1));
    else out.add(n + "s");
    return [...out].filter(Boolean);
  }

  /* Does any recogniser alternative contain one of the target phrases?
   * targets: array of acceptable strings. alternatives: array of strings.
   * Returns { match, heard, score }. */
  L.matchSpeech = function (alternatives, targets, opts) {
    const threshold = (opts && opts.threshold) || 0.72;
    const alts = (alternatives || []).map(L.normalize).filter(Boolean);
    const tgs = [];
    (targets || []).forEach((t) => variants(t).forEach((v) => tgs.push(v)));
    let best = { match: false, heard: alts[0] || "", score: 0 };
    for (const alt of alts) {
      const words = alt.split(" ");
      for (const t of tgs) {
        if (!t) continue;
        const tw = t.split(" ").length;
        if ((" " + alt + " ").includes(" " + t + " ")) {
          return { match: true, heard: alt, score: 1 };
        }
        // compare every window of the same word-length
        for (let i = 0; i + tw <= words.length; i++) {
          const chunk = words.slice(i, i + tw).join(" ");
          const s = L.similarity(chunk, t);
          if (s > best.score) best = { match: false, heard: alt, score: s };
        }
        const whole = L.similarity(alt, t);
        if (whole > best.score) best = { match: false, heard: alt, score: whole };
      }
    }
    // Short words are too easy to fuzz; demand more similarity for them.
    const shortest = Math.min(...tgs.map((t) => t.length), 99);
    const need = shortest <= 3 ? Math.max(threshold, 0.66) : threshold;
    if (best.score >= need && shortest > 2) best.match = true;
    return best;
  };

  /* ---------- Loudness envelope analysis (mic games) ---------- */

  /* Count syllable-like loudness peaks. env: array of RMS values sampled every
   * stepMs. Hysteresis avoids double counting. */
  L.countPeaks = function (env, stepMs, opts) {
    opts = opts || {};
    if (!env || !env.length) return { count: 0, onsets: [] };
    const sorted = [...env].sort((a, b) => a - b);
    const floor = sorted[Math.floor(sorted.length * 0.15)] || 0;
    const peak = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const span = Math.max(peak - floor, opts.minSpan || 0.01);
    const hi = floor + span * (opts.hi || 0.45);
    const lo = floor + span * (opts.lo || 0.25);
    const minGap = opts.minGapMs || 70;
    const onsets = [];
    let above = false;
    let lastOn = -1e9;
    for (let i = 0; i < env.length; i++) {
      const t = i * stepMs;
      if (!above && env[i] >= hi && t - lastOn >= minGap) {
        above = true; lastOn = t; onsets.push(t);
      } else if (above && env[i] <= lo) {
        above = false;
      }
    }
    return { count: onsets.length, onsets };
  };

  /* Steadiness 0..100 from onset times: 100 = perfectly even rhythm. */
  L.steadiness = function (onsets) {
    if (!onsets || onsets.length < 3) return 0;
    const gaps = [];
    for (let i = 1; i < onsets.length; i++) gaps.push(onsets[i] - onsets[i - 1]);
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    if (!mean) return 0;
    const sd = Math.sqrt(gaps.reduce((a, g) => a + (g - mean) * (g - mean), 0) / gaps.length);
    const cv = sd / mean;
    return Math.max(0, Math.min(100, Math.round(100 - cv * 150)));
  };

  /* Voice-onset rise time: ms from first crossing 10% of the peak to 80%.
   * Gentle ("easy") onsets rise slowly; hard onsets jump. */
  L.onsetRise = function (env, stepMs) {
    if (!env || env.length < 3) return null;
    const floor = Math.min(...env.slice(0, Math.max(3, Math.floor(env.length * 0.1))));
    const peak = Math.max(...env);
    const span = peak - floor;
    if (span < 0.01) return null;
    let i10 = -1, i80 = -1;
    for (let i = 0; i < env.length; i++) {
      const v = (env[i] - floor) / span;
      if (i10 < 0 && v >= 0.1) i10 = i;
      if (i10 >= 0 && v >= 0.8) { i80 = i; break; }
    }
    if (i10 < 0 || i80 < 0) return null;
    return (i80 - i10) * stepMs;
  };

  /* ---------- Session maths ---------- */
  L.stars = function (independent, total) {
    if (!total) return 0;
    const r = independent / total;
    return r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1; // always at least one star for practising
  };

  /* Should the drill move up or down a step? recent: array of booleans. */
  L.adapt = function (recent, up, down) {
    up = up == null ? 0.8 : up;
    down = down == null ? 0.5 : down;
    if (!recent || recent.length < 10) return 0;
    const last = recent.slice(-10);
    const r = last.filter(Boolean).length / last.length;
    return r >= up ? 1 : r < down ? -1 : 0;
  };

  L.csvCell = function (v) {
    const s = v == null ? "" : String(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  L.toCSV = function (rows, cols) {
    const head = cols.map(L.csvCell).join(",");
    return [head].concat(rows.map((r) => cols.map((c) => L.csvCell(r[c])).join(","))).join("\r\n");
  };

  L.dayKey = function (ts) {
    const d = new Date(ts);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };

  /* Consecutive practice days ending today (or yesterday). */
  L.streak = function (dayKeys, todayTs) {
    const set = new Set(dayKeys);
    let ts = todayTs || Date.now();
    let n = 0;
    if (!set.has(L.dayKey(ts))) ts -= 864e5; // allow streak to survive until end of today
    while (set.has(L.dayKey(ts))) { n++; ts -= 864e5; }
    return n;
  };

  L.shuffle = function (arr, rnd) {
    const a = arr.slice();
    rnd = rnd || Math.random;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
})(typeof window !== "undefined" ? window : globalThis);

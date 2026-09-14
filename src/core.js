/* =========================================================================
 * THE PARLOR  ·  core.js
 * Shared platform services:
 *   P.store     defensive localStorage
 *   P.Settings  player / clinician preferences (applied to <html>)
 *   P.Sound     synthesised Web Audio effects — no audio files
 *   P.Voice     text-to-speech models (Web Speech synthesis)
 *   P.Ear       speech recognition, lenient and confirm-only
 *   P.Mic       live microphone loudness (works without recognition)
 *   P.Log       per-trial clinical log (local only)
 *   UI helpers  el, toast, overlay, confetti, burst
 * Patterns adapted from Common Ground (narrate.js, audio.js, sitrep.js).
 * ========================================================================= */
(function () {
  const P = (window.P = window.P || {});
  const L = P.Logic;

  /* ------------------------------------------------------------------ *
   * DOM + utility helpers
   * ------------------------------------------------------------------ */
  P.$ = (sel, root) => (root || document).querySelector(sel);
  P.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  P.el = function (tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  P.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  P.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  P.shuffle = (arr) => L.shuffle(arr);
  P.sample = (arr, n, exclude) => L.shuffle(arr.filter((x) => !exclude || !exclude(x))).slice(0, n);
  P.wait = (ms) => new Promise((r) => setTimeout(r, ms));
  P.button = function (label, cls, onClick, attrs) {
    const b = P.el("button", "btn " + (cls || ""), label);
    b.type = "button";
    if (attrs) Object.keys(attrs).forEach((k) => b.setAttribute(k, attrs[k]));
    b.addEventListener("click", (e) => { P.Sound.play("tap"); onClick && onClick(e); });
    return b;
  };

  /* ------------------------------------------------------------------ *
   * Storage (never throws: private windows / blocked storage still play)
   * ------------------------------------------------------------------ */
  const PREFIX = "parlor_";
  P.store = function (key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(PREFIX + key) || "null");
      localStorage.setItem(PREFIX + key, JSON.stringify(val));
      return val;
    } catch (e) {
      return val === undefined ? null : val;
    }
  };

  /* ------------------------------------------------------------------ *
   * Settings
   * ------------------------------------------------------------------ */
  const DEFAULTS = {
    name: "",
    theme: "sunny",       // sunny | parlor | night
    contrast: false,
    reduceMotion: false,
    textSize: 1,          // 1, 1.15, 1.3
    spacing: 0,           // extra letter spacing (em)
    sfx: true,
    autoSpeak: true,      // speak prompts and word models automatically
    rate: 0.85,           // voice speed
    voiceName: "",
    mic: true,            // allow speech recognition / microphone
    support: "hint",      // errorless | hint | try
    goal: 50,             // trials per day
    roundLen: 8,
    timers: false,        // time pressure is opt-in
    polly: true,
  };
  const S = (P.Settings = { data: Object.assign({}, DEFAULTS, P.store("settings") || {}) });
  S.get = (k) => S.data[k];
  S.set = function (k, v) { S.data[k] = v; P.store("settings", S.data); S.apply(); };
  S.reset = function () { S.data = Object.assign({}, DEFAULTS); P.store("settings", S.data); S.apply(); };
  S.apply = function () {
    const d = S.data, html = document.documentElement;
    html.dataset.theme = d.theme;
    html.classList.toggle("hc", !!d.contrast);
    const sysReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    html.classList.toggle("calm-motion", !!d.reduceMotion || sysReduce);
    html.style.setProperty("--text-scale", d.textSize);
    html.style.setProperty("--extra-spacing", d.spacing + "em");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = d.theme === "night" ? "#17132b" : d.theme === "parlor" ? "#2e4a3f" : "#ff7a59";
  };
  P.tone = () => (S.data.theme === "parlor" ? "calm" : "playful");

  /* ------------------------------------------------------------------ *
   * Sound — every effect is synthesised (bell + soft tones, no buzzers)
   * ------------------------------------------------------------------ */
  const Sound = (P.Sound = {});
  let ctx = null, master = null, verb = null;
  function ensure() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
    verb = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 1.6);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = ir.getChannelData(c);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    verb.buffer = ir;
    const vg = ctx.createGain(); vg.gain.value = 0.35;
    verb.connect(vg); vg.connect(master);
    return ctx;
  }
  Sound.ctx = () => ensure();
  function osc(f, t, dur, type, peak, glide) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); g.connect(verb);
    o.start(t); o.stop(t + dur + 0.05);
  }
  // FM glockenspiel bell (from Common Ground's audio.js)
  function bell(f, t, dur, peak) {
    const car = ctx.createOscillator(), mod = ctx.createOscillator();
    const mg = ctx.createGain(), g = ctx.createGain();
    car.frequency.value = f; mod.frequency.value = f * 3.5;
    mg.gain.setValueAtTime(f * 1.2, t); mg.gain.exponentialRampToValueAtTime(1, t + dur);
    mod.connect(mg); mg.connect(car.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    car.connect(g); g.connect(master); g.connect(verb);
    car.start(t); mod.start(t); car.stop(t + dur + 0.05); mod.stop(t + dur + 0.05);
  }
  function noise(t, dur, peak, freq) {
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq || 1200;
    const g = ctx.createGain(); g.gain.value = peak;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t);
  }
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];
  const FX = {
    tap: (t) => osc(660, t, 0.07, "triangle", 0.07),
    pop: (t) => osc(420, t, 0.12, "sine", 0.18, 900),
    key: (t) => osc(880, t, 0.05, "square", 0.025),
    good: (t) => { bell(783.99, t, 0.7, 0.16); bell(1046.5, t + 0.1, 0.9, 0.14); },
    great: (t) => { PENTA.forEach((f, i) => bell(f, t + i * 0.07, 0.8, 0.11)); [523.25, 659.25, 783.99].forEach((f) => osc(f, t + 0.6, 1.2, "triangle", 0.05)); },
    gentle: (t) => { osc(392, t, 0.25, "sine", 0.1); osc(349.23, t + 0.18, 0.35, "sine", 0.08); },
    gem: (t) => { bell(1318.5, t, 0.5, 0.12); bell(1760, t + 0.06, 0.6, 0.08); },
    flipG: (t, i) => bell(PENTA[(i || 0) % 5], t, 0.8, 0.14),
    flipY: (t, i) => bell(PENTA[(i || 0) % 5] * 0.75, t, 0.5, 0.09),
    flipX: (t, i) => osc(180 + (i || 0) * 8, t, 0.1, "triangle", 0.08),
    drum: (t) => { osc(150, t, 0.25, "sine", 0.45, 50); noise(t, 0.06, 0.12, 2500); },
    tick: (t) => osc(1400, t, 0.04, "square", 0.04),
    whoosh: (t) => noise(t, 0.35, 0.18, 800),
    bloom: (t) => [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => bell(f, t + i * 0.09, 0.9, 0.09)),
    hint: (t) => { bell(987.77, t, 0.4, 0.07); bell(1174.66, t + 0.08, 0.5, 0.06); },
  };
  Sound.play = function (name, arg) {
    if (!S.data.sfx) return;
    if (!ensure() || !FX[name]) return;
    try { FX[name](ctx.currentTime + 0.01, arg); } catch (e) { /* ignore */ }
  };
  // A pitched sung note for melodic intonation (not gated by SFX setting).
  Sound.note = function (freq, dur, when) {
    if (!ensure()) return;
    const t = ctx.currentTime + (when || 0) + 0.01;
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400;
    o.type = "triangle"; o2.type = "sine";
    o.frequency.value = freq; o2.frequency.value = freq * 2;
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    vib.frequency.value = 5; vg.gain.value = 3;
    vib.connect(vg); vg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.06);
    g.gain.setValueAtTime(0.22, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const g2 = ctx.createGain(); g2.gain.value = 0.15;
    o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(master); g.connect(verb);
    [o, o2, vib].forEach((x) => { x.start(t); x.stop(t + dur + 0.05); });
  };
  Sound.unlock = () => ensure();

  /* ------------------------------------------------------------------ *
   * Voice — text-to-speech models (adapted from Common Ground narrate.js)
   * ------------------------------------------------------------------ */
  const Voice = (P.Voice = {});
  const ttsOK = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  let voices = [], chosen = null;
  const PREFERRED = [
    "Microsoft Aria Online (Natural) - English (United States)",
    "Microsoft Jenny Online (Natural) - English (United States)",
    "Google US English", "Samantha",
    "Microsoft Libby Online (Natural) - English (United Kingdom)",
    "Google UK English Female", "Microsoft Zira - English (United States)",
  ];
  function loadVoices() {
    if (!ttsOK) return;
    voices = (speechSynthesis.getVoices() || []).filter((v) => /^en/i.test(v.lang));
    chosen = null;
    if (S.data.voiceName) chosen = voices.find((v) => v.name === S.data.voiceName) || null;
    if (!chosen) for (const n of PREFERRED) { chosen = voices.find((v) => v.name === n); if (chosen) break; }
    if (!chosen) chosen = voices.find((v) => /en[-_]US/i.test(v.lang)) || voices[0] || null;
  }
  if (ttsOK) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  Voice.supported = () => ttsOK;
  Voice.list = () => { loadVoices(); return voices; };
  Voice.reload = loadVoices;
  Voice.stop = () => { if (ttsOK) try { speechSynthesis.cancel(); } catch (e) {} };
  Voice.speak = function (text, opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      let done = false;
      const fin = () => { if (!done) { done = true; opts.onend && opts.onend(); resolve(); } };
      const t = String(text || "").replace(/<[^>]*>/g, " ").replace(/_{2,}/g, " blank ").replace(/\s+/g, " ").trim();
      if (!ttsOK || !t) return fin();
      try {
        speechSynthesis.cancel();
        if (!chosen) loadVoices();
        const u = new SpeechSynthesisUtterance(t);
        if (chosen) { u.voice = chosen; u.lang = chosen.lang; } else u.lang = "en-US";
        u.rate = (opts.rate || 1) * S.data.rate;
        u.pitch = opts.pitch || 1;
        u.onend = fin; u.onerror = fin;
        speechSynthesis.speak(u);
        // Safety net: some engines never fire onend.
        setTimeout(fin, 1500 + t.length * 140 / Math.max(0.4, u.rate));
      } catch (e) { fin(); }
    });
  };
  Voice.auto = (text, opts) => (S.data.autoSpeak ? Voice.speak(text, opts) : Promise.resolve());

  /* ------------------------------------------------------------------ *
   * Ear — speech recognition. Used ONLY to celebrate a match; a miss is
   * never scored as wrong (recognisers struggle with disordered speech).
   * ------------------------------------------------------------------ */
  const Ear = (P.Ear = {});
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let active = null;
  Ear.supported = () => !!SR;
  Ear.enabled = () => !!SR && S.data.mic;
  Ear.stop = () => { if (active) { try { active.abort(); } catch (e) {} active = null; } };
  /* opts: { targets:[...], onInterim(text), onResult({match, heard, score}), onEnd(), onError(code) } */
  Ear.listen = function (opts) {
    Ear.stop();
    if (!SR) { opts.onError && opts.onError("unsupported"); opts.onEnd && opts.onEnd(); return null; }
    Voice.stop();
    const rec = new SR();
    active = rec;
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.maxAlternatives = 5;
    rec.continuous = false;
    let finished = false, gotFinal = false, lastInterim = "";
    rec.onresult = (ev) => {
      const alts = [];
      let finalNow = false;
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        for (let j = 0; j < r.length; j++) alts.push(r[j].transcript);
        if (r.isFinal) finalNow = true;
      }
      lastInterim = alts[0] || lastInterim;
      if (!finalNow) {
        opts.onInterim && opts.onInterim(alts[0] || "");
        const m = L.matchSpeech(alts, opts.targets);
        if (m.match) { gotFinal = true; opts.onResult && opts.onResult(m); try { rec.stop(); } catch (e) {} }
        return;
      }
      if (gotFinal) return;
      gotFinal = true;
      opts.onResult && opts.onResult(L.matchSpeech(alts, opts.targets));
    };
    rec.onerror = (e) => { opts.onError && opts.onError(e.error || "error"); };
    rec.onend = () => {
      if (finished) return;
      finished = true;
      if (active === rec) active = null;
      if (!gotFinal && lastInterim) { gotFinal = true; opts.onResult && opts.onResult(L.matchSpeech([lastInterim], opts.targets)); }
      opts.onEnd && opts.onEnd();
    };
    try { rec.start(); } catch (e) { opts.onError && opts.onError("start"); opts.onEnd && opts.onEnd(); return null; }
    return rec;
  };

  /* ------------------------------------------------------------------ *
   * Mic — loudness meter (no speech-to-text, no audio ever leaves device)
   * ------------------------------------------------------------------ */
  const Mic = (P.Mic = {});
  let stream = null, analyser = null, buf = null, micSrc = null, smooth = 0;
  Mic.available = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && S.data.mic;
  Mic.start = async function () {
    if (analyser) return true;
    if (!Mic.available()) return false;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false } });
      ensure();
      micSrc = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      buf = new Float32Array(analyser.fftSize);
      micSrc.connect(analyser);
      return true;
    } catch (e) {
      Mic.stop();
      return false;
    }
  };
  /* RMS loudness 0..~1 (lightly smoothed). */
  Mic.level = function () {
    if (!analyser) return 0;
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length);
    smooth = smooth * 0.5 + rms * 0.5;
    return smooth;
  };
  Mic.stop = function () {
    try { micSrc && micSrc.disconnect(); } catch (e) {}
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = analyser = micSrc = null; smooth = 0;
  };
  Mic.on = () => !!analyser;
  /* Record a loudness envelope. opts: { ms, step, onFrame(level, t, env), stopWhen(env, t) }
   * Returns { promise, stop() }. The promise resolves to the envelope array. */
  Mic.record = function (opts) {
    const step = opts.step || 20;
    const env = [];
    let timer = null, done = false, resolveFn;
    const promise = new Promise((res) => (resolveFn = res));
    const t0 = performance.now();
    const finish = () => { if (done) return; done = true; clearInterval(timer); resolveFn(env); };
    timer = setInterval(() => {
      const t = performance.now() - t0;
      const v = Mic.level();
      env.push(v);
      opts.onFrame && opts.onFrame(v, t, env);
      if (t >= opts.ms || !analyser || (opts.stopWhen && opts.stopWhen(env, t))) finish();
    }, step);
    return { promise, stop: finish, step };
  };

  /* ------------------------------------------------------------------ *
   * Log — every trial is recorded locally for the progress dashboard
   * ------------------------------------------------------------------ */
  const Log = (P.Log = {});
  const MAX = 20000;
  let trials = P.store("trials") || [];
  Log.session = { start: Date.now(), count: 0 };
  /* t: { game, item, level, result: correct|cued|notyet|skip, cues, heard, sr, detail } */
  Log.add = function (t) {
    const row = Object.assign({ ts: Date.now(), player: S.data.name || "" }, t);
    trials.push(row);
    if (trials.length > MAX) trials = trials.slice(-MAX);
    P.store("trials", trials);
    if (row.result === "correct" || row.result === "cued") Log.session.count++;
    document.dispatchEvent(new CustomEvent("parlor:trial", { detail: row }));
    return row;
  };
  Log.all = () => trials;
  Log.clear = () => { trials = []; P.store("trials", trials); };
  Log.today = () => {
    const k = L.dayKey(Date.now());
    return trials.filter((t) => L.dayKey(t.ts) === k && (t.result === "correct" || t.result === "cued")).length;
  };
  Log.streak = () => L.streak([...new Set(trials.map((t) => L.dayKey(t.ts)))]);
  Log.best = (key, val) => {
    const all = P.store("bests") || {};
    if (val === undefined) return all[key];
    if (all[key] == null || val > all[key]) { all[key] = val; P.store("bests", all); return true; }
    return false;
  };

  /* ------------------------------------------------------------------ *
   * UI: toast, overlay, confetti, burst, Polly the parrot
   * ------------------------------------------------------------------ */
  P.toast = function (msg, kind) {
    let area = P.$("#toasts");
    if (!area) { area = P.el("div", "toast-area"); area.id = "toasts"; area.setAttribute("aria-live", "polite"); document.body.appendChild(area); }
    const t = P.el("div", "toast " + (kind || ""), msg);
    area.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 350); }, 2800);
    while (area.children.length > 3) area.removeChild(area.firstChild);
  };

  let openOver = null;
  P.overlay = function (inner, opts) {
    P.closeOverlay();
    opts = opts || {};
    const over = P.el("div", "overlay");
    over.setAttribute("role", "dialog");
    over.setAttribute("aria-modal", "true");
    const card = P.el("div", "modal " + (opts.cls || ""));
    if (typeof inner === "string") card.innerHTML = inner; else card.appendChild(inner);
    over.appendChild(card);
    over.addEventListener("click", (e) => { if (e.target === over && !opts.stay) P.closeOverlay(); });
    document.body.appendChild(over);
    openOver = over;
    requestAnimationFrame(() => over.classList.add("show"));
    const f = card.querySelector(".btn-primary, button");
    if (f) setTimeout(() => f.focus({ preventScroll: true }), 60);
    return card;
  };
  P.closeOverlay = function () {
    if (!openOver) return;
    const o = openOver; openOver = null;
    o.classList.remove("show");
    setTimeout(() => o.remove(), 250);
  };
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && openOver) P.closeOverlay(); });

  const CONFETTI = ["#ff6b6b", "#ffa94d", "#ffd43b", "#51cf66", "#22b8cf", "#5c7cfa", "#b197fc", "#f783ac"];
  function fxLayer() {
    let fx = P.$("#fx");
    if (!fx) { fx = P.el("div", "fx-layer"); fx.id = "fx"; document.body.appendChild(fx); }
    return fx;
  }
  const calm = () => document.documentElement.classList.contains("calm-motion");
  P.confetti = function (n) {
    if (calm()) return;
    const fx = fxLayer(), W = innerWidth, H = innerHeight;
    for (let i = 0; i < (n || 80); i++) {
      const p = P.el("span", "confetti" + (i % 3 === 0 ? " round" : ""));
      p.style.background = CONFETTI[i % CONFETTI.length];
      p.style.left = Math.random() * W + "px";
      fx.appendChild(p);
      const dx = (Math.random() - 0.5) * 200, rot = (Math.random() - 0.5) * 1080;
      p.animate(
        [{ transform: "translate(0,-20px) rotate(0)", opacity: 1 }, { transform: `translate(${dx}px, ${H + 40}px) rotate(${rot}deg)`, opacity: 0.9 }],
        { duration: 1800 + Math.random() * 1800, delay: Math.random() * 500, easing: "cubic-bezier(.25,.1,.55,1)", fill: "forwards" }
      );
      setTimeout(() => p.remove(), 4200);
    }
  };
  P.burst = function (node, emoji, n) {
    if (calm() || !node) return;
    const r = node.getBoundingClientRect(), fx = fxLayer();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < (n || 14); i++) {
      const s = P.el("span", "spark", emoji ? P.pick([].concat(emoji)) : "");
      if (!emoji) s.style.background = CONFETTI[i % CONFETTI.length];
      s.style.left = cx + "px"; s.style.top = cy + "px";
      fx.appendChild(s);
      const a = (Math.PI * 2 * i) / (n || 14) + Math.random() * 0.4, d = 60 + Math.random() * 90;
      s.animate(
        [{ transform: "translate(-50%,-50%) scale(.4)", opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(1)`, opacity: 0 }],
        { duration: 700 + Math.random() * 300, easing: "cubic-bezier(.2,.8,.3,1)", fill: "forwards" }
      );
      setTimeout(() => s.remove(), 1100);
    }
  };
  P.praise = function () { return P.pick(P.DATA.praise[P.tone()]); };
  P.retryLine = function () { return P.pick(P.DATA.praise.retry); };

  /* Polly the parrot: the Parlor's friendly host (speech bubble). */
  P.polly = function (msg, mood) {
    if (!S.data.polly) return;
    let p = P.$("#polly");
    if (!p) {
      p = P.el("div", "polly", '<div class="polly-bird" aria-hidden="true">🦜</div><div class="polly-say" aria-live="polite"></div>');
      p.id = "polly";
      p.addEventListener("click", () => p.classList.remove("show"));
      document.body.appendChild(p);
    }
    p.querySelector(".polly-say").textContent = msg;
    p.dataset.mood = mood || "";
    p.classList.remove("show"); void p.offsetWidth; p.classList.add("show");
    clearTimeout(p._t);
    p._t = setTimeout(() => p.classList.remove("show"), 3600);
  };

  S.apply();
})();

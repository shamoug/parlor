/* =========================================================================
 * THE PARLOR  ·  Smooth Sailing  (fluency tools and voice loudness)
 *   Level 1  Easy Start   — gentle voice onsets; the boat glides on the wave
 *   Level 2  Stretch      — prolonged, paced speech following glowing dots
 *   Level 3  Loud & Proud — lift the balloon over the "loud and clear" line
 * Uses the microphone LOUDNESS meter only; no audio leaves the device and no
 * speech-to-text is needed. Disfluencies are never counted or judged.
 * ========================================================================= */
(function () {
  const P = window.P;
  const { el, esc } = P;

  P.registerGame({
    id: "sailing",
    title: "Smooth Sailing",
    emoji: "⛵",
    color: ["#15aabf", "#4dabf7"],
    tagline: "Practise gentle starts, stretchy speech and a strong voice.",
    skill: "Fluency-shaping tools, voice loudness",
    tags: ["Stuttering", "Parkinson's", "Voice", "Teens & adults"],
    how: [
      "Easy Start: breathe, then start your voice softly, like a wave rolling in.",
      "Stretch: glide through the phrase, one glowing dot per syllable.",
      "Loud & Proud: take a big breath and lift the balloon over the line.",
      "After each try, tell us how it felt. There's no wrong answer!",
    ],
    evidence: "<b>Easy onset</b> and <b>prolonged speech</b> are core <b>fluency-shaping</b> techniques. In the Camperdown Program they start at slow rates (about 70 syllables a minute) and use self-rating. Rise time from the loudness meter is a practice cue for gentle onsets. <b>Loud &amp; Proud</b> is inspired by the single “think loud” focus of <b>LSVT LOUD</b> for hypokinetic dysarthria in Parkinson's. Nothing here counts or penalizes stuttering. Frame these as tools the speaker chooses to use.",
    levels: [
      { name: "Easy Start", desc: "Gentle voice onsets" },
      { name: "Stretch", desc: "Slow, smooth, paced phrases" },
      { name: "Loud & Proud", desc: "A strong, clear voice" },
    ],
    defaults: { pace: 90 },
    setup(box, cfg, level) {
      if (level !== 1) return;
      const f = el("div", "seg-field", "<span>Stretch pace</span>");
      const s = el("div", "seg");
      [[60, "🐢 Very slow"], [90, "🐌 Slow"], [120, "🚶 Gentle"], [160, "🏃 Natural"]].forEach(([v, l]) => {
        const b = el("button", cfg.pace == v ? "on" : "", l);
        b.type = "button";
        b.addEventListener("click", () => { cfg.pace = v; P.$$("button", s).forEach((x) => x.classList.toggle("on", x === b)); P.Sound.play("tap"); });
        s.appendChild(b);
      });
      f.appendChild(s);
      box.appendChild(f);
    },
    prepare(ctx) {
      const n = Math.min(P.Settings.data.roundLen, 8);
      const src = [P.DATA.easyStarts, P.DATA.stretchPhrases, P.DATA.loudPhrases][ctx.level];
      let list = P.sample(src, n);
      if (ctx.level === 2) list = ["Ahhh"].concat(list.filter((x) => x !== "Ahhh")).slice(0, n);
      return list.map((t) => ({ key: t, text: t }));
    },
    render(ctx, item) {
      [easyStart, stretch, loud][ctx.level](ctx, item);
    },
  });

  /* ---------- shared scene + graph ---------- */
  function scene(kind) {
    const s = el("div", "sea " + kind);
    s.innerHTML = `
      <div class="sea-sun" aria-hidden="true">☀️</div>
      ${kind === "loud" ? '<div class="loud-line"><span>loud &amp; clear</span></div><div class="balloon" aria-hidden="true">🎈</div>' : '<div class="boat" aria-hidden="true">⛵</div>'}
      <div class="wave w1"></div><div class="wave w2"></div><div class="wave w3"></div>`;
    return s;
  }
  function graph() {
    const c = el("canvas", "env-graph");
    c.width = 640; c.height = 120;
    c.setAttribute("aria-hidden", "true");
    return c;
  }
  function draw(canvas, env, maxFrames, line) {
    const g = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
    g.clearRect(0, 0, W, H);
    const max = Math.max(0.05, ...env, line || 0) * 1.15;
    if (line) {
      g.strokeStyle = "rgba(255,120,80,.8)"; g.setLineDash([8, 6]); g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, H - (line / max) * H); g.lineTo(W, H - (line / max) * H); g.stroke(); g.setLineDash([]);
    }
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(34,184,207,.85)"); grad.addColorStop(1, "rgba(76,110,245,.15)");
    g.fillStyle = grad;
    g.beginPath(); g.moveTo(0, H);
    env.forEach((v, i) => g.lineTo((i / maxFrames) * W, H - (v / max) * H));
    g.lineTo((env.length / maxFrames) * W, H); g.closePath(); g.fill();
  }
  function feelings(ctx, onPick) {
    const box = el("div", "feel");
    box.innerHTML = `<p>How did that feel?</p>`;
    const row = el("div", "tool-row center");
    [["smooth", "😌", "Smooth"], ["bumps", "🙂", "A few bumps"], ["bumpy", "😕", "Bumpy"]].forEach(([v, e, l]) => {
      row.appendChild(P.button(`<span class="bi">${e}</span><span>${l}</span>`, "btn-score neutral", () => onPick(v)));
    });
    box.appendChild(row);
    return box;
  }
  function voicedBounds(env) {
    const sorted = [...env].sort((a, b) => a - b);
    const floor = sorted[Math.floor(sorted.length * 0.1)] || 0, peak = sorted[sorted.length - 1] || 0;
    const thr = floor + (peak - floor) * 0.18;
    const first = env.findIndex((v) => v > thr);
    let last = -1;
    for (let i = env.length - 1; i >= 0; i--) if (env[i] > thr) { last = i; break; }
    return { first, last, thr, floor, peak };
  }

  /* ---------- Easy Start ---------- */
  function easyStart(ctx, item) {
    const wrap = el("div", "sail");
    const sea = scene("easy");
    const canvas = graph();
    wrap.innerHTML = `<div class="sail-card"><small>Start gently</small><div class="sail-text">${esc(item.text)}</div><p class="sail-hint">🌬️ Breathe in… let a little air flow… then let your voice roll in softly, like a wave.</p></div>`;
    wrap.append(sea, canvas);
    const msg = el("p", "sail-msg"); msg.setAttribute("aria-live", "polite");
    const tools = el("div", "tool-row center");
    const after = el("div", "sail-after");
    wrap.append(msg, tools, after);
    ctx.stage.appendChild(wrap);
    const boat = P.$(".boat", sea);
    let rise = null, attempts = 0;

    tools.appendChild(P.button('<span class="bi">🔊</span><span>Hear it softly</span>', "btn-big btn-sky", () => P.Voice.speak(item.text, { rate: 0.7, pitch: 0.95 })));
    const go = P.button('<span class="bi">🎤</span><span>Start</span>', "btn-big btn-primary", start);
    tools.appendChild(go);
    ctx.cleanup(() => P.Mic.stop());

    async function start() {
      go.disabled = true; after.replaceChildren();
      const ok = await P.Mic.start();
      if (!ctx.alive()) return;
      if (!ok) return noMic();
      msg.textContent = "Breathe in… now say it gently.";
      sea.classList.add("breathe");
      let spoke = -1;
      const maxMs = 5000, step = 20;
      const rec = P.Mic.record({
        ms: maxMs, step,
        onFrame: (v, t, env) => {
          draw(canvas, env, maxMs / step);
          boat.style.transform = `translateY(${-Math.min(70, v * 500)}px) rotate(${Math.sin(t / 300) * 4}deg)`;
          if (spoke < 0 && v > 0.03) spoke = env.length;
        },
        stopWhen: (env) => spoke > 0 && env.length - spoke > 40 && env.slice(-25).every((x) => x < 0.02),
      });
      const env = await rec.promise;
      P.Mic.stop();
      sea.classList.remove("breathe");
      boat.style.transform = "";
      if (!ctx.alive()) return;
      attempts++;
      const b = voicedBounds(env);
      if (b.first < 0 || b.peak < 0.01) {
        msg.textContent = "I couldn't hear your voice. Try again a little closer to the microphone.";
        go.disabled = false;
        return;
      }
      rise = P.Logic.onsetRise(env.slice(Math.max(0, b.first - 10)), step);
      if (rise == null) rise = 0;
      if (rise >= 140) { msg.innerHTML = "🌊 <b>Smooth, gentle start!</b> Your voice rolled in like a wave."; P.Sound.play("good"); P.burst(boat, ["🌊", "✨"], 10); }
      else if (rise >= 70) { msg.innerHTML = "⛵ <b>Nice start.</b> You can make it even softer and slower."; P.Sound.play("pop"); }
      else { msg.innerHTML = "💨 <b>That started quickly.</b> Try a soft sigh of air just before the word."; P.Sound.play("gentle"); }
      msg.insertAdjacentHTML("beforeend", ` <span class="muted small">(rise ${Math.round(rise)} ms)</span>`);
      go.disabled = false;
      go.querySelector("span:last-child").textContent = "Try again";
      after.replaceChildren(feelings(ctx, (feel) => finish(feel)));
    }
    function noMic() {
      canvas.hidden = true;
      msg.innerHTML = "No microphone here, so we'll practise with a breathing guide.";
      sea.classList.add("breathe");
      ctx.later(() => { msg.innerHTML = "Breathe in… 🌬️"; }, 400);
      ctx.later(() => { msg.innerHTML = `Now say <b>${esc(item.text)}</b> softly, letting it grow…`; }, 3000);
      ctx.later(() => { sea.classList.remove("breathe"); go.disabled = false; after.replaceChildren(feelings(ctx, (feel) => finish(feel))); }, 5500);
    }
    function finish(feel) {
      ctx.complete("correct", { item: item.text, emoji: feel === "smooth" ? "😌" : feel === "bumps" ? "🙂" : "😕", detail: `easy_onset;rise_ms=${rise == null ? "" : Math.round(rise)};feel=${feel};tries=${attempts}` });
    }
    ctx.skipHandler = () => ctx.complete("skip", { item: item.text, delay: 50 });
  }

  /* ---------- Stretch (prolonged, paced speech) ---------- */
  function syllables(word) {
    const w = word.toLowerCase().replace(/[^a-z]/g, "");
    if (!w) return 0;
    let m = (w.match(/[aeiouy]+/g) || []).length;
    if (/[^aeiou]e$/.test(w) && m > 1 && !/le$/.test(w)) m--;
    return Math.max(1, m);
  }
  function stretch(ctx, item) {
    const pace = ctx.cfg.pace || 90;
    const words = item.text.split(/\s+/);
    const sylCounts = words.map(syllables);
    const total = sylCounts.reduce((a, b) => a + b, 0);
    const wrap = el("div", "sail");
    const canvas = graph();
    wrap.innerHTML = `
      <div class="sail-card"><small>Stretch and glide · ${pace} syllables a minute</small>
        <div class="glide">${words.map((w, i) => `<span class="gw"><span class="gdots">${Array.from({ length: sylCounts[i] }, () => '<i class="gd"></i>').join("")}</span><span class="gword">${esc(w)}</span></span>`).join("")}</div>
        <p class="sail-hint">Keep your voice flowing from dot to dot. Stretch the vowels: “Gooood moooorning”.</p>
      </div>`;
    wrap.appendChild(canvas);
    const msg = el("p", "sail-msg"); msg.setAttribute("aria-live", "polite");
    const tools = el("div", "tool-row center");
    const after = el("div", "sail-after");
    wrap.append(msg, tools, after);
    ctx.stage.appendChild(wrap);
    const dots = P.$$(".gd", wrap);
    let flow = null, attempts = 0;

    tools.appendChild(P.button('<span class="bi">🔊</span><span>Hear it stretched</span>', "btn-big btn-sky", () => P.Voice.speak(item.text, { rate: Math.max(0.5, pace / 220) })));
    const go = P.button('<span class="bi">▶</span><span>Glide</span>', "btn-big btn-primary", start);
    tools.appendChild(go);
    ctx.cleanup(() => P.Mic.stop());

    async function start() {
      go.disabled = true; after.replaceChildren(); dots.forEach((d) => d.classList.remove("on"));
      const micOK = await P.Mic.start();
      if (!ctx.alive()) return;
      canvas.hidden = !micOK;
      for (const n of ["3", "2", "1"]) { msg.textContent = `Ready… ${n}`; P.Sound.play("tick"); await P.wait(600); if (!ctx.alive()) return; }
      msg.textContent = "Glide…";
      const gap = 60000 / pace;
      const dur = total * gap + 600;
      let rec = null;
      if (micOK) rec = P.Mic.record({ ms: dur, onFrame: (v, t, env) => draw(canvas, env, dur / 20) });
      for (let i = 0; i < dots.length; i++) {
        dots[i].classList.add("on");
        P.Sound.play("tick");
        await P.wait(gap);
        if (!ctx.alive()) return;
      }
      attempts++;
      if (rec) {
        const env = await rec.promise;
        P.Mic.stop();
        if (!ctx.alive()) return;
        const b = voicedBounds(env);
        if (b.first >= 0 && b.last > b.first) {
          const span = env.slice(b.first, b.last + 1);
          flow = Math.round((span.filter((v) => v > b.thr).length / span.length) * 100);
          msg.innerHTML = flow >= 80 ? `🌊 <b>Beautiful glide!</b> Your voice kept flowing ${flow}% of the time.` : `⛵ Your voice flowed ${flow}% of the time. Try linking the words together, like one long word.`;
          P.Sound.play(flow >= 80 ? "good" : "pop");
        } else msg.textContent = "I couldn't hear your voice clearly. That's okay — how did it feel?";
      } else msg.textContent = "Nice gliding! How did it feel?";
      go.disabled = false;
      go.querySelector("span:last-child").textContent = "Glide again";
      after.replaceChildren(feelings(ctx, (feel) => ctx.complete("correct", { item: item.text, emoji: feel === "smooth" ? "😌" : feel === "bumps" ? "🙂" : "😕", detail: `stretch;pace=${pace};flow=${flow == null ? "" : flow};feel=${feel};tries=${attempts}` })));
    }
    ctx.skipHandler = () => ctx.complete("skip", { item: item.text, delay: 50 });
  }

  /* ---------- Loud & Proud ---------- */
  function loud(ctx, item) {
    const wrap = el("div", "sail");
    const sea = scene("loud");
    const canvas = graph();
    const isAh = /^ah+$/i.test(item.text);
    wrap.innerHTML = `<div class="sail-card"><small>${isAh ? "Hold a big, strong “ahh”" : "Say it loud and proud"}</small><div class="sail-text">${esc(item.text)}</div><p class="sail-hint">💪 Big breath in… <b>think LOUD</b>… and use your strong voice. No shouting or straining!</p></div>`;
    wrap.append(sea, canvas);
    const msg = el("p", "sail-msg"); msg.setAttribute("aria-live", "polite");
    const tools = el("div", "tool-row center");
    wrap.append(msg, tools);
    ctx.stage.appendChild(wrap);
    const balloon = P.$(".balloon", sea), lineEl = P.$(".loud-line", sea);
    ctx.cleanup(() => P.Mic.stop());
    const go = P.button('<span class="bi">🎤</span><span>' + (ctx.loud ? "Go!" : "Set my everyday voice") + "</span>", "btn-big btn-primary", () => (ctx.loud ? attempt() : calibrate()));
    tools.appendChild(go);
    if (!ctx.loud) msg.innerHTML = "First, let's hear your <b>everyday</b> voice. Say “ahh” normally for 2 seconds.";

    async function calibrate() {
      go.disabled = true;
      const ok = await P.Mic.start();
      if (!ctx.alive()) return;
      if (!ok) return noMic();
      msg.textContent = "Say “ahh” in your everyday voice…";
      const rec = P.Mic.record({ ms: 2500, onFrame: (v, t, env) => draw(canvas, env, 125) });
      const env = await rec.promise;
      P.Mic.stop();
      if (!ctx.alive()) return;
      const voiced = env.filter((v) => v > 0.01).sort((a, b) => a - b);
      const base = voiced.length > 10 ? voiced[Math.floor(voiced.length * 0.6)] : 0.03;
      ctx.loud = { base, target: Math.min(0.5, base * 1.8) };
      msg.innerHTML = "Got it! Now lift the balloon over the <b>loud &amp; clear</b> line.";
      go.disabled = false;
      go.querySelector("span:last-child").textContent = "Go!";
      placeLine();
    }
    function placeLine() { lineEl.style.bottom = "62%"; }
    if (ctx.loud) placeLine();

    async function attempt() {
      go.disabled = true;
      const ok = await P.Mic.start();
      if (!ctx.alive()) return;
      if (!ok) return noMic();
      const target = ctx.loud.target;
      const ms = isAh ? 8000 : 4000;
      let holdStart = -1, bestHold = 0, framesOver = 0;
      msg.textContent = isAh ? "Big breath… AHHHH! Hold it above the line!" : "Big breath… and say it LOUD!";
      const rec = P.Mic.record({
        ms,
        onFrame: (v, t, env) => {
          draw(canvas, env, ms / 20, target);
          const ratio = Math.min(1.25, v / target);
          balloon.style.bottom = `${8 + ratio * 54}%`;
          balloon.classList.toggle("over", v >= target);
          if (v >= target) { framesOver++; if (holdStart < 0) holdStart = t; bestHold = Math.max(bestHold, t - holdStart); }
          else holdStart = -1;
        },
      });
      await rec.promise;
      P.Mic.stop();
      if (!ctx.alive()) return;
      const secs = bestHold / 1000;
      let success;
      if (isAh) {
        success = secs >= 2;
        const isBest = P.Log.best("loud_ah", secs);
        msg.innerHTML = success ? `📣 <b>${secs.toFixed(1)} seconds</b> above the line! ${isBest ? "🏆 New best!" : ""}` : `You held it for ${secs.toFixed(1)} s. Big breath and <b>think loud</b> — aim for 2 seconds!`;
      } else {
        success = framesOver >= 4;
        msg.innerHTML = success ? `📣 <b>Loud and clear!</b> ${esc(P.praise())}` : "Nearly! Take a bigger breath and <b>think LOUD</b>.";
      }
      P.Sound.play(success ? "great" : "gentle");
      if (success) { P.burst(balloon, ["🎈", "✨", "🎉"], 14); }
      ctx.log({ item: item.text, result: success ? "correct" : "notyet", detail: `loud;hold_s=${secs.toFixed(1)};frames_over=${framesOver}` });
      tools.replaceChildren();
      tools.appendChild(P.button('<span class="bi">🔁</span><span>Try again</span>', "btn-big btn-sky", () => { tools.replaceChildren(go); go.disabled = false; attempt(); }));
      tools.appendChild(P.button('<span class="bi">➜</span><span>Next</span>', "btn-big btn-primary", () => ctx.complete(success ? "correct" : "cued", { item: item.text, emoji: "🎈", nolog: true, delay: 50 })));
    }
    function noMic() {
      canvas.hidden = true;
      msg.innerHTML = "No microphone here. Say it in your <b>big, strong voice</b>, then tell us how it went.";
      tools.replaceChildren();
      tools.appendChild(P.button('<span class="bi">👍</span><span>I used my strong voice</span>', "btn-score good", () => ctx.complete("correct", { item: item.text, emoji: "🎈", detail: "loud;self_rated" })));
      tools.appendChild(P.button('<span class="bi">🔁</span><span>Once more</span>', "btn-score notyet", () => { P.Voice.speak(item.text, { rate: 0.9 }); }));
    }
    ctx.skipHandler = () => ctx.complete("skip", { item: item.text, delay: 50 });
  }
})();

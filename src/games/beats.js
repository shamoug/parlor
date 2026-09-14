/* =========================================================================
 * THE PARLOR  ·  Beat Keeper  (rhythm, melody and speech motor practice)
 *   Level 1  Syllable Drum — tap once per syllable, then say it to the beat
 *   Level 2  Sing-Song     — melodic-intonation style phrases on two notes
 *   Level 3  Drum Roll     — pa / ta / ka / pa-ta-ka repetitions (DDK),
 *                            counted from microphone loudness peaks
 * ========================================================================= */
(function () {
  const P = window.P;
  const { el, esc } = P;
  const HIGH = 349.23, LOW = 293.66; // F4 / D4 — a comfortable minor third

  P.registerGame({
    id: "beats",
    title: "Beat Keeper",
    emoji: "🥁",
    color: ["#fab005", "#fd7e14"],
    tagline: "Tap, sing and drum your words into rhythm.",
    skill: "Syllables, speech rhythm, motor planning, speed",
    tags: ["Apraxia", "Aphasia", "Dysarthria", "Kids"],
    how: [
      "Syllable Drum: tap the drum once for each part of the word, then say it to the beat.",
      "Sing-Song: listen to the tune, sing along while tapping, then try it on your own.",
      "Drum Roll: say pa-pa-pa (or pa-ta-ka) as quickly and evenly as you can for 5 seconds.",
      "Beat your own best. There's no one else to compete with!",
    ],
    evidence: "<b>Syllable tapping</b> supports word shape and pacing. <b>Sing-Song</b> is modelled on <b>Melodic Intonation Therapy</b>, which intones phrases on two pitches with rhythmic hand-tapping for non-fluent aphasia and apraxia of speech; support fades from unison to independent. <b>Drum Roll</b> practises <b>diadochokinetic (DDK)</b> repetitions (pa, ta, ka, pa-ta-ka) and reports rate and steadiness as practice feedback only, not a clinical measurement.",
    levels: [
      { name: "Syllable Drum", desc: "Tap the beats in a word, then say it" },
      { name: "Sing-Song", desc: "Sing everyday phrases on a gentle tune" },
      { name: "Drum Roll", desc: "pa · ta · ka speed and steadiness" },
    ],
    prepare(ctx) {
      const n = P.Settings.data.roundLen;
      if (ctx.level === 0) {
        const pool = P.DATA.beatWords.slice();
        return P.sample(pool, Math.min(n, pool.length)).sort((a, b) => a[0].split("·").length - b[0].split("·").length)
          .map(([w, e]) => ({ key: w.replace(/·/g, ""), parts: w.split("·"), emoji: e }));
      }
      if (ctx.level === 1) {
        return P.sample(P.DATA.singPhrases, Math.min(n, 8)).sort((a, b) => a.p.length - b.p.length)
          .map((s) => ({ key: s.t.replace(/-/g, ""), syl: s.t.split(/[\s-]+/), pitch: s.p, emoji: s.e }));
      }
      return P.DATA.ddk.map((d) => Object.assign({ key: d.label }, d));
    },
    render(ctx, item) {
      if (ctx.level === 0) drumWord(ctx, item);
      else if (ctx.level === 1) singSong(ctx, item);
      else drumRoll(ctx, item);
    },
  });

  /* ---------------- Syllable Drum ---------------- */
  function drumWord(ctx, item) {
    const wrap = el("div", "beat");
    wrap.innerHTML = `
      <div class="beat-pic" aria-hidden="true">${item.emoji}</div>
      <div class="beat-bubbles">${item.parts.map((p, i) => `<span class="bub" style="--i:${i}">${esc(p)}</span>`).join("")}</div>
      <p class="beat-msg" aria-live="polite">Tap the drum once for each beat.</p>
      <div class="beat-drum-row">
        <button type="button" class="drum big" aria-label="Drum"><span aria-hidden="true">🥁</span></button>
      </div>
      <div class="tool-row center beat-tools"></div>
      <div class="beat-say"></div>`;
    ctx.stage.appendChild(wrap);
    const bubs = P.$$(".bub", wrap), drum = P.$(".drum", wrap), msg = P.$(".beat-msg", wrap);
    let lit = 0, listened = false;
    const tools = P.$(".beat-tools", wrap);
    tools.appendChild(P.button('<span class="bi">🔊</span><span>Listen to the beats</span>', "btn-big btn-sky", () => { listened = true; model(); }));
    tools.appendChild(P.button('<span class="bi">↺</span><span>Start over</span>', "btn-ghost", () => { lit = 0; bubs.forEach((b) => b.classList.remove("on")); P.$(".beat-say", wrap).replaceChildren(); drum.disabled = false; }));

    async function model() {
      bubs.forEach((b) => b.classList.remove("on", "flash"));
      for (let i = 0; i < bubs.length; i++) {
        if (!ctx.alive()) return;
        bubs[i].classList.add("flash");
        P.Sound.play("drum");
        await P.wait(560);
        bubs[i].classList.remove("flash");
      }
      await P.Voice.speak(item.parts.join(" "), { rate: 0.7 });
      bubs.forEach((b, i) => b.classList.toggle("on", i < lit));
    }
    drum.addEventListener("click", () => {
      if (lit >= bubs.length) return;
      P.Sound.play("drum");
      drum.classList.remove("hit"); void drum.offsetWidth; drum.classList.add("hit");
      bubs[lit].classList.add("on");
      lit++;
      if (lit === bubs.length) {
        drum.disabled = true;
        msg.innerHTML = `<b>${bubs.length} ${bubs.length === 1 ? "beat" : "beats"}!</b> ${esc(P.praise())}`;
        P.burst(P.$(".beat-bubbles", wrap), ["🎵", "🎶", "✨"], 12);
        ctx.later(say, 700);
      }
    });
    function say() {
      const s = P.SayIt({
        text: item.key, say: item.parts.join(" … "), emoji: "", prompt: "Now say it to the beat!", noAutoModel: true,
        targets: [item.key],
        onAttempt: (r, info) => { if (r === "notyet") ctx.log({ item: item.key, result: "notyet", heard: info.heard }); },
        onDone: (res) => ctx.complete(res.result, { item: item.key, emoji: item.emoji, cues: listened ? 1 : 0, heard: res.heard, sr: res.sr, detail: `syllables=${item.parts.length}` }),
      });
      P.$(".beat-say", wrap).replaceChildren(s);
      ctx.skipHandler = () => s.skip();
      s.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    ctx.later(() => P.Voice.auto(item.key), 400);
  }

  /* ---------------- Sing-Song (melodic intonation) ---------------- */
  function singSong(ctx, item) {
    const wrap = el("div", "sing");
    wrap.innerHTML = `
      <div class="sing-emoji" aria-hidden="true">${item.emoji}</div>
      <div class="sing-staff" aria-label="Phrase tune">
        ${item.syl.map((s, i) => `<span class="note ${item.pitch[i] === "H" ? "hi" : "lo"}" style="--i:${i}">${esc(s)}</span>`).join("")}
      </div>
      <div class="sing-steps">
        <button type="button" class="sstep on" data-s="0"><span class="ss-n">1</span><span>🎵 Listen</span></button>
        <button type="button" class="sstep" data-s="1" disabled><span class="ss-n">2</span><span>👏 Sing together</span></button>
        <button type="button" class="sstep" data-s="2" ${P.Settings.data.support === "try" ? "" : "disabled"}><span class="ss-n">3</span><span>🎤 Your turn</span></button>
      </div>
      <div class="sing-pad-row"><button type="button" class="hand-pad" aria-label="Tap along">✋</button><p class="sing-msg" aria-live="polite">Tap <b>Listen</b> to hear the tune.</p></div>
      <div class="sing-say"></div>`;
    ctx.stage.appendChild(wrap);
    const notes = P.$$(".note", wrap), steps = P.$$(".sstep", wrap), msg = P.$(".sing-msg", wrap), pad = P.$(".hand-pad", wrap);
    let playing = false, together = false;
    pad.addEventListener("click", () => { P.Sound.play("tick"); pad.classList.remove("hit"); void pad.offsetWidth; pad.classList.add("hit"); });

    async function melody(gap, speak) {
      playing = true;
      for (let i = 0; i < notes.length; i++) {
        if (!ctx.alive()) return;
        notes[i].classList.add("sing-on");
        pad.classList.remove("hit"); void pad.offsetWidth; pad.classList.add("hit");
        P.Sound.note(item.pitch[i] === "H" ? HIGH : LOW, gap / 1000 * 0.85);
        await P.wait(gap);
        notes[i].classList.remove("sing-on");
      }
      if (speak) await P.Voice.speak(item.syl.join(" "), { rate: 0.7 });
      playing = false;
    }
    steps[0].addEventListener("click", async () => {
      if (playing) return;
      msg.textContent = "Listen to the tune…";
      await melody(650, true);
      steps[1].disabled = false; steps[1].classList.add("on");
      msg.innerHTML = "Now <b>sing together</b>. Tap the hand on each note!";
    });
    steps[1].addEventListener("click", async () => {
      if (playing) return;
      together = true;
      msg.textContent = "Sing along with me, and tap the hand…";
      await melody(850, false);
      await melody(850, false);
      steps[2].disabled = false; steps[2].classList.add("on");
      msg.innerHTML = "Lovely! Now it's <b>your turn</b>.";
    });
    steps[2].addEventListener("click", () => {
      if (playing) return;
      msg.textContent = "Sing it or say it on your own. Tap the hand as you go.";
      const s = P.SayIt({
        text: item.key, say: item.syl.join(" "), prompt: "Your turn — sing it or say it!", noAutoModel: true,
        targets: [item.key],
        onAttempt: (r, info) => { if (r === "notyet") ctx.log({ item: item.key, result: "notyet", heard: info.heard }); },
        onDone: (res) => ctx.complete(res.result, { item: item.key, emoji: item.emoji, heard: res.heard, sr: res.sr, detail: together ? "sang_together" : "direct" }),
      });
      P.$(".sing-say", wrap).replaceChildren(s);
      ctx.skipHandler = () => s.skip();
      s.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    if (P.Settings.data.autoSpeak) ctx.later(() => steps[0].click(), 600);
  }

  /* ---------------- Drum Roll (DDK) ---------------- */
  function drumRoll(ctx, item) {
    const SECS = 5;
    const wrap = el("div", "roll");
    const best = P.Log.best("ddk_" + item.id);
    wrap.innerHTML = `
      <div class="roll-card">
        <div class="roll-emoji" aria-hidden="true">${item.e}</div>
        <div class="roll-syl">${esc(item.label)}</div>
        <div class="roll-tip">${esc(item.tip)}</div>
        ${best ? `<div class="roll-best">🏆 Your best: <b>${best.toFixed(1)}</b> per second</div>` : ""}
      </div>
      <div class="roll-stage">
        <button type="button" class="drum big" aria-label="Drum"><span aria-hidden="true">🥁</span></button>
        <div class="roll-timer"><span></span></div>
        <div class="roll-count" aria-live="polite"><b>0</b><small>beats</small></div>
      </div>
      <p class="roll-msg" aria-live="polite">Say <b>${esc(item.label)}</b> again and again, as quickly and evenly as you can.</p>
      <div class="tool-row center roll-tools"></div>
      <div class="roll-result"></div>`;
    ctx.stage.appendChild(wrap);
    const drum = P.$(".drum", wrap), countEl = P.$(".roll-count b", wrap), timer = P.$(".roll-timer span", wrap), msg = P.$(".roll-msg", wrap), tools = P.$(".roll-tools", wrap), result = P.$(".roll-result", wrap);
    let running = false, tries = 0, taps = [];
    const hit = () => { drum.classList.remove("hit"); void drum.offsetWidth; drum.classList.add("hit"); };
    const hear = P.button('<span class="bi">🔊</span><span>Hear it</span>', "btn-big btn-sky", () => P.Voice.speak(Array(6).fill(item.say).join(", "), { rate: 1.1 }));
    const go = P.button(`<span class="bi">▶</span><span>Go! (${SECS} seconds)</span>`, "btn-big btn-primary", start);
    tools.append(hear, go);
    drum.addEventListener("click", () => {
      if (!running || P.Mic.on()) return;
      taps.push(performance.now()); P.Sound.play("drum"); hit();
      countEl.textContent = taps.length;
    });
    ctx.cleanup(() => P.Mic.stop());

    async function start() {
      if (running) return;
      running = true; go.disabled = true; hear.disabled = true; result.replaceChildren();
      const micOK = await P.Mic.start();
      if (!ctx.alive()) return;
      msg.innerHTML = micOK ? "Get ready…" : "No microphone — <b>tap the drum</b> each time you say it. Get ready…";
      for (const n of [3, 2, 1]) {
        countEl.textContent = n; P.Sound.play("tick");
        await P.wait(700);
        if (!ctx.alive()) return;
      }
      countEl.textContent = 0;
      msg.innerHTML = `Go! <b>${esc(item.label)}, ${esc(item.label)}, ${esc(item.label)}…</b>`;
      P.Sound.play("pop");
      taps = [];
      let onsetsLive = 0, above = false, peak = 0.02;
      const t0 = performance.now();
      if (micOK) {
        const rec = P.Mic.record({
          ms: SECS * 1000,
          onFrame: (v, t) => {
            timer.style.width = Math.min(100, (t / (SECS * 1000)) * 100) + "%";
            peak = Math.max(peak * 0.995, v);
            if (!above && v > Math.max(0.015, peak * 0.45)) { above = true; onsetsLive++; countEl.textContent = onsetsLive; hit(); }
            else if (above && v < peak * 0.25) above = false;
          },
        });
        const env = await rec.promise;
        P.Mic.stop();
        if (!ctx.alive()) return;
        const { count, onsets } = P.Logic.countPeaks(env, rec.step);
        finish(count, onsets, "mic");
      } else {
        const iv = setInterval(() => { timer.style.width = Math.min(100, ((performance.now() - t0) / (SECS * 1000)) * 100) + "%"; }, 50);
        ctx.cleanup(() => clearInterval(iv));
        await P.wait(SECS * 1000);
        clearInterval(iv);
        if (!ctx.alive()) return;
        finish(taps.length, taps.map((t) => t - t0), "tap");
      }
    }
    function finish(count, onsets, mode) {
      running = false; tries++;
      timer.style.width = "100%";
      countEl.textContent = count;
      const perSec = count / SECS;
      const steady = P.Logic.steadiness(onsets);
      const isBest = count > 2 && P.Log.best("ddk_" + item.id, perSec);
      P.Sound.play(isBest ? "great" : "good");
      if (isBest) P.confetti(60);
      ctx.log({ item: item.label, result: "correct", detail: `ddk;rate=${perSec.toFixed(2)};steadiness=${steady};mode=${mode}` });
      result.innerHTML = `
        <div class="roll-stats">
          <div class="rs"><b>${count}</b><small>beats</small></div>
          <div class="rs"><b>${perSec.toFixed(1)}</b><small>per second</small></div>
          <div class="rs"><b>${steady}%</b><small>steadiness</small><div class="meter"><span style="width:${steady}%"></span></div></div>
        </div>
        ${isBest ? '<div class="roll-badge">🏆 New personal best!</div>' : ""}
        <p class="muted small">${mode === "mic" ? "Counted from loudness peaks. Treat it as practice feedback, not a clinical score." : "Counted from your drum taps."}</p>`;
      msg.innerHTML = count ? esc(P.praise()) : "I didn't pick up any beats. Try speaking a bit louder, or tap the drum.";
      tools.replaceChildren();
      tools.appendChild(P.button('<span class="bi">🔁</span><span>Try again</span>', "btn-big btn-sky", () => { tools.replaceChildren(hear, go); go.disabled = false; hear.disabled = false; start(); }));
      tools.appendChild(P.button('<span class="bi">➜</span><span>Next</span>', "btn-big btn-primary", () => ctx.complete("correct", { item: item.label, emoji: item.e, delay: 50, nolog: true })));
    }
    ctx.skipHandler = () => ctx.complete("skip", { item: item.label, emoji: item.e, delay: 50 });
  }
})();

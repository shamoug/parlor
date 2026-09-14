/* =========================================================================
 * THE PARLOR  ·  Pair Up  (minimal pairs · phonological contrasts)
 * Listening: hear a word, tap the matching picture.
 * Speaking: tell Polly the parrot which picture to fly to. If the sound
 * slips (key → "tea"), Polly lands on the other picture — a natural,
 * playful communication breakdown that motivates repair.
 * ========================================================================= */
(function () {
  const P = window.P;
  const { el, esc } = P;

  P.registerGame({
    id: "pairup",
    title: "Pair Up",
    emoji: "🦜",
    color: ["#20c997", "#94d82d"],
    tagline: "Help Polly the parrot fly to the right picture.",
    skill: "Speech sounds and contrasts, clear speech",
    tags: ["Kids", "Articulation", "Phonology", "Clear speech"],
    how: [
      "Two pictures sound almost the same, like key and tea.",
      "Listening level: hear a word, then tap its picture.",
      "Speaking levels: say the starred word. Polly flies to what she heard!",
      "No microphone? A helper taps the word they heard.",
      "If Polly lands on the wrong one, try the tip and say it again.",
    ],
    evidence: "Uses <b>minimal pair contrast therapy</b> for phonological disorders. A slipped sound (fronting, stopping, final consonant deletion, gliding, voicing or cluster reduction) changes the meaning, so the child sees why the sound matters. Hearing the contrast first, then producing it, follows the discrimination-to-production sequence of Hodson's Cycles and contrast approaches. Choose one error pattern at a time.",
    levels: [
      { name: "Listen", desc: "Hear it, tap the picture" },
      { name: "Say it", desc: "Say the word so Polly flies to it" },
      { name: "Say it in a phrase", desc: "“I see a …” carrier phrase" },
    ],
    defaults: { pattern: "fronting" },
    setup(box, cfg) {
      box.innerHTML = `<h3>Sound pattern to practise</h3>`;
      const row = el("div", "chips");
      Object.entries(P.DATA.patterns).forEach(([k, p]) => {
        const b = el("button", "chip " + (cfg.pattern === k ? "on" : ""), `<span aria-hidden="true">${p.icon}</span> <b>${esc(p.name)}</b> <small>${esc(p.sub)}</small>`);
        b.type = "button";
        b.addEventListener("click", () => { cfg.pattern = k; P.$$(".chip", row).forEach((x) => x.classList.toggle("on", x === b)); P.Sound.play("tap"); });
        row.appendChild(b);
      });
      box.appendChild(row);
    },
    prepare(ctx) {
      const pat = P.DATA.patterns[ctx.cfg.pattern] || P.DATA.patterns.fronting;
      const n = Math.min(P.Settings.data.roundLen, 10);
      const list = [];
      while (list.length < n) P.shuffle(pat.pairs).forEach((p) => list.length < n && list.push(p));
      return list.map(([t, te, f, fe]) => ({ key: t, target: t, te, foil: f, fe, askFoil: ctx.level === 0 && Math.random() < 0.4 }));
    },
    summaryExtra: (ctx) => `with ${P.DATA.patterns[ctx.cfg.pattern].name.toLowerCase()} pairs`,
    render(ctx, item) {
      const pat = P.DATA.patterns[ctx.cfg.pattern] || P.DATA.patterns.fronting;
      if (ctx.level === 0) listen(ctx, item);
      else speak(ctx, item, pat, ctx.level === 2);
    },
  });

  function cards(item, flip) {
    const a = { w: item.target, e: item.te }, b = { w: item.foil, e: item.fe };
    return flip ? [b, a] : [a, b];
  }

  function listen(ctx, item) {
    const ask = item.askFoil ? item.foil : item.target;
    const wrap = el("div", "pair");
    wrap.innerHTML = `
      <div class="pair-ask"><span class="pair-polly" aria-hidden="true">🦜</span><div><small>Listen carefully</small><b>Which one did you hear?</b></div></div>
      <div class="pair-cards"></div>
      <div class="tool-row center pair-tools"></div>`;
    ctx.stage.appendChild(wrap);
    let misses = 0;
    const box = P.$(".pair-cards", wrap);
    cards(item, Math.random() < 0.5).forEach((c) => {
      const b = el("button", "pcard", `<span class="pc-emoji" aria-hidden="true">${c.e}</span><span class="pc-word">${esc(c.w)}</span>`);
      b.type = "button";
      b.addEventListener("click", () => {
        if (box.classList.contains("locked")) return;
        if (c.w === ask) {
          box.classList.add("locked");
          b.classList.add("right");
          P.Sound.play("good");
          P.burst(b, ["⭐", "✨", "🪶"], 12);
          P.Voice.speak(c.w);
          ctx.complete(misses ? "cued" : "correct", { item: `${ask} (vs ${ask === item.target ? item.foil : item.target})`, emoji: c.e, cues: misses, detail: "listen" });
        } else {
          misses++;
          b.classList.add("wrong");
          P.Sound.play("gentle");
          ctx.later(() => b.classList.remove("wrong"), 700);
          ctx.later(() => P.Voice.speak(`Listen again. ${ask}`), 500);
        }
      });
      box.appendChild(b);
    });
    const tools = P.$(".pair-tools", wrap);
    tools.appendChild(P.button('<span class="bi">🔊</span><span>Hear it again</span>', "btn-big btn-sky", () => P.Voice.speak(ask, { rate: 0.85 })));
    ctx.later(() => P.Voice.speak(ask, { rate: 0.9 }), 500);
  }

  function speak(ctx, item, pat, phrase) {
    const say = phrase ? `I see a ${item.target}` : item.target;
    const wrap = el("div", "pair speak");
    wrap.innerHTML = `
      <div class="pair-ask"><span class="pair-polly" aria-hidden="true">🦜</span><div><small>${phrase ? "Say the whole phrase" : "Your turn to talk"}</small><b>Tell Polly: “${esc(say)}”</b></div></div>
      <div class="pair-cards"></div>
      <div class="pair-heard" aria-live="polite"></div>
      <div class="tool-row center pair-tools"></div>
      <div class="pair-judge"><span>Helper: which word did you hear?</span><div class="tool-row center"></div></div>`;
    ctx.stage.appendChild(wrap);
    const box = P.$(".pair-cards", wrap), heardEl = P.$(".pair-heard", wrap);
    const bird = el("div", "flying-polly", "🦜");
    bird.setAttribute("aria-hidden", "true");
    wrap.appendChild(bird);
    let attempts = 0, modelled = false, done = false;
    const cardEls = {};
    cards(item, Math.random() < 0.5).forEach((c) => {
      const b = el("div", "pcard" + (c.w === item.target ? " star" : ""), `${c.w === item.target ? '<span class="pc-star" aria-hidden="true">⭐</span>' : ""}<span class="pc-emoji" aria-hidden="true">${c.e}</span><span class="pc-word">${esc(c.w)}</span>`);
      cardEls[c.w] = b;
      box.appendChild(b);
    });

    function fly(word) {
      const target = cardEls[word];
      const wr = wrap.getBoundingClientRect(), r = target.getBoundingClientRect();
      bird.style.left = r.left - wr.left + r.width / 2 + "px";
      bird.style.top = r.top - wr.top + 10 + "px";
      bird.classList.add("go");
      P.Sound.play("whoosh");
    }
    function outcome(word, bySR) {
      if (done) return;
      attempts++;
      fly(word);
      if (word === item.target) {
        done = true;
        ctx.later(() => {
          cardEls[word].classList.add("right");
          P.Sound.play("good");
          P.burst(cardEls[word], ["⭐", "✨", "🪶"], 14);
          heardEl.innerHTML = `<span class="yay">Polly heard “${esc(word)}”! ${esc(P.praise())}</span>`;
          const res = attempts === 1 && !modelled ? "correct" : "cued";
          ctx.complete(res, { item: `${item.target} (vs ${item.foil})`, emoji: item.te, cues: attempts - 1 + (modelled ? 1 : 0), sr: bySR, detail: `${ctx.cfg.pattern};${phrase ? "phrase" : "word"}` });
        }, 700);
      } else {
        ctx.log({ item: `${item.target} (vs ${item.foil})`, result: "notyet", heard: word, detail: ctx.cfg.pattern });
        ctx.later(() => {
          cardEls[word].classList.add("oops");
          P.Sound.play("gentle");
          heardEl.innerHTML = `Oops! Polly heard <b>“${esc(word)}”</b> ${item.fe}. <br><span class="tip">💡 ${esc(pat.tip)}</span>`;
          ctx.later(() => { cardEls[word].classList.remove("oops"); bird.classList.remove("go"); }, 1600);
        }, 700);
      }
    }

    const tools = P.$(".pair-tools", wrap);
    tools.appendChild(P.button('<span class="bi">🔊</span><span>Hear it</span>', "btn-big btn-sky", () => { modelled = true; P.Voice.speak(say, { rate: 0.85 }); }));
    tools.appendChild(P.button('<span class="bi">👂</span><span>Hear the difference</span>', "btn-big btn-violet", async () => {
      modelled = true;
      cardEls[item.target].classList.add("pulse");
      await P.Voice.speak(item.target, { rate: 0.8 });
      cardEls[item.target].classList.remove("pulse");
      await P.wait(250);
      cardEls[item.foil].classList.add("pulse");
      await P.Voice.speak(item.foil, { rate: 0.8 });
      cardEls[item.foil].classList.remove("pulse");
    }));
    if (P.Ear.enabled()) {
      const mic = P.button('<span class="bi">🎤</span><span>Tap &amp; speak</span>', "btn-big btn-coral mic", () => {
        if (mic.classList.contains("on")) { P.Ear.stop(); return; }
        mic.classList.add("on");
        heardEl.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
        P.Ear.listen({
          targets: [item.target, say],
          onInterim: (t) => { heardEl.innerHTML = `<span class="muted">Polly is listening:</span> “${esc(t)}”`; },
          onResult: (m) => {
            if (m.match) return outcome(item.target, true);
            const f = P.Logic.matchSpeech([m.heard], [item.foil, `I see a ${item.foil}`]);
            if (f.match) return outcome(item.foil, true);
            heardEl.innerHTML = m.heard ? `Polly heard “${esc(m.heard)}” and is confused! Try again, or a helper can tap below.` : "Polly didn't catch that. Try again!";
          },
          onError: (c) => { if (c === "not-allowed") heardEl.textContent = "Microphone blocked — a helper can tap the word they heard below."; },
          onEnd: () => mic.classList.remove("on"),
        });
      });
      tools.appendChild(mic);
    }
    const judge = P.$(".pair-judge .tool-row", wrap);
    [item.target, item.foil].sort().forEach((w) => {
      judge.appendChild(P.button(`<span class="bi">${w === item.target ? item.te : item.fe}</span><span>${esc(w)}</span>`, "btn-score neutral", () => outcome(w, false)));
    });
    ctx.later(() => {
      const sup = P.Settings.data.support;
      if (sup === "errorless") { modelled = true; P.Voice.speak(say, { rate: 0.85 }); }
      else if (sup === "hint") P.Voice.auto(`Tell Polly: ${say}`);
      else P.Voice.auto("Your turn. Tell Polly the starred word.");
    }, 500);
  }
})();

/* =========================================================================
 * THE PARLOR  ·  Feature Garden  (Semantic Feature Analysis)
 * Grow a flower by filling each petal with a meaning feature of the picture
 * (group, use, action, looks, place, link), then name the picture aloud.
 * ========================================================================= */
(function () {
  const P = window.P;
  const { el, esc } = P;

  P.registerGame({
    id: "garden",
    title: "Feature Garden",
    emoji: "🌸",
    color: ["#f06595", "#cc5de8"],
    tagline: "Grow a flower from everything you know about a word.",
    skill: "Word finding through meaning (semantic networks)",
    tags: ["Aphasia", "Word finding", "Brain injury", "Language disorder"],
    how: [
      "Look at the picture in the middle of the flower.",
      "Answer each petal question: its group, use, action, looks, place and link.",
      "Every right answer makes a petal bloom.",
      "When the flower is full, say the word out loud.",
    ],
    evidence: "Based on <b>Semantic Feature Analysis (SFA)</b>. A 2018 systematic review (JSLHR, 21 studies) found SFA improved naming of treated words for most participants with aphasia, with some spread to untreated words. Talking through features strengthens the word's meaning network before retrieval. Ask the player to say each feature aloud for extra spoken practice.",
    levels: [
      { name: "Two choices", desc: "Word shown, 2 options per petal" },
      { name: "Three choices", desc: "Word shown, 3 options per petal" },
      { name: "Name it", desc: "Picture only, 4 options, name it at the end" },
    ],
    prepare(ctx) {
      const n = Math.min(P.Settings.data.roundLen, 6);
      return P.sample(P.DATA.garden, n).map(([w, e, f]) => ({ key: w, word: w, emoji: e, feat: f }));
    },
    render(ctx, item) {
      const petals = P.DATA.petals;
      const nChoices = [2, 3, 4][ctx.level];
      const hideWord = ctx.level === 2;
      let pi = 0, misses = 0;

      const wrap = el("div", "garden");
      wrap.innerHTML = `
        <div class="flower" aria-label="Feature flower">
          ${petals.map((p, i) => `<button type="button" class="petal" style="--a:${i * 60}deg;--i:${i}" data-i="${i}" aria-label="${p.label}"><span class="pt-icon" aria-hidden="true">${p.icon}</span><span class="pt-text">${p.label}</span></button>`).join("")}
          <div class="flower-core"><span class="core-emoji" aria-hidden="true">${item.emoji}</span><span class="core-word">${hideWord ? "?" : esc(item.word)}</span></div>
        </div>
        <div class="petal-q"></div>`;
      ctx.stage.appendChild(wrap);
      const q = P.$(".petal-q", wrap);
      const petalEls = P.$$(".petal", wrap);
      petalEls.forEach((b) => b.addEventListener("click", () => { const i = +b.dataset.i; if (!b.classList.contains("filled")) ask(i); }));

      function ask(i) {
        pi = i;
        petalEls.forEach((b, j) => b.classList.toggle("active", j === i));
        const p = petals[i];
        const right = item.feat[p.key];
        const pool = P.DATA.garden.map((g) => g[2][p.key]).filter((v) => v && v !== right);
        const foils = P.sample([...new Set(pool)], nChoices - 1);
        const opts = P.shuffle([{ label: right, correct: true }].concat(foils.map((f) => ({ label: f }))));
        q.replaceChildren();
        const head = el("div", "pq-head", `<span class="pq-icon" aria-hidden="true">${p.icon}</span><div><small>${esc(p.label)}</small><b>${esc(p.q)}</b></div>`);
        const say = P.button("🔊", "btn-round", () => P.Voice.speak(p.q));
        say.setAttribute("aria-label", "Read question");
        head.appendChild(say);
        q.appendChild(head);
        let missedHere = false;
        q.appendChild(P.choices(opts, (it) => {
          if (!it.correct) { misses++; missedHere = true; return false; }
          fill(i, right, missedHere);
          return true;
        }, { errorless: P.Settings.data.support === "errorless", cls: "choices-text" }));
        P.Voice.auto(p.q);
      }
      function fill(i, text, wasMissed) {
        const b = petalEls[i];
        b.classList.add("filled");
        b.classList.toggle("helped", wasMissed);
        b.classList.remove("active");
        P.$(".pt-text", b).textContent = text;
        P.Voice.speak(sentence(petals[i].key, text));
        const nextI = petalEls.findIndex((x) => !x.classList.contains("filled"));
        if (nextI < 0) ctx.later(bloom, 1400);
        else ctx.later(() => ask(nextI), 1300);
      }
      function sentence(key, text) {
        const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        if (key === "group") return `It is ${text}.`;
        if (key === "use") return /^(to|for) /.test(text) ? `It is used ${text}.` : /^(a|an) /.test(text) ? `It is ${text}.` : `It ${text}.`;
        if (key === "action") return cap(text) + ".";
        if (key === "looks") return /^has /.test(text) ? `It ${text}.` : /^(two|four|six|a) /.test(text) ? `It has ${text}.` : `It looks ${text}.`;
        if (key === "place") return `You find it ${text}.`;
        return `It goes with ${text}.`;
      }
      function bloom() {
        wrap.classList.add("bloom");
        P.Sound.play("bloom");
        P.burst(P.$(".flower-core", wrap), ["🌸", "🌼", "🌷", "✨"], 18);
        q.replaceChildren();
        const s = P.SayIt({
          text: item.word, emoji: item.emoji, hideText: hideWord,
          prompt: hideWord ? "What is it? Say its name!" : "Your flower bloomed! Now say the word.",
          noAutoModel: hideWord,
          onAttempt: (r, info) => { if (r === "notyet") ctx.log({ item: item.word, result: "notyet", heard: info.heard }); },
          onDone: (res) => {
            P.$(".core-word", wrap).textContent = item.word;
            ctx.complete(res.result, { item: item.word, emoji: item.emoji, cues: res.cued ? 1 : 0, heard: res.heard, sr: res.sr, detail: `petal_misses=${misses}` });
          },
        });
        q.appendChild(s);
        ctx.skipHandler = () => s.skip();
      }
      ctx.later(() => ask(0), 300);
    },
  });
})();

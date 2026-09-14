/* =========================================================================
 * THE PARLOR  ·  Finish the Line  (sentence completion → sentence building)
 * Levels move from automatic speech (counting, songs) to word pairs, to
 * everyday sentences, to "Who does it?" verb-network sentence building.
 * The player always finishes by saying the WHOLE phrase aloud.
 * ========================================================================= */
(function () {
  const P = window.P;
  const { el, esc } = P;

  P.registerGame({
    id: "finishline",
    title: "Finish the Line",
    emoji: "🧩",
    color: ["#7950f2", "#4c6ef5"],
    tagline: "Complete familiar phrases, then say them with pride.",
    skill: "Word finding in context, phrases and sentences",
    tags: ["Aphasia", "Sentences", "Language disorder", "All ages"],
    how: [
      "Read or listen to the start of the phrase.",
      "Tap the picture that finishes it.",
      "Say the whole phrase out loud.",
      "Level 4: pick who does the action and what they do it to, then say the sentence.",
    ],
    evidence: "Sentence completion uses the strong context of <b>automatic and overlearned speech</b> (counting, songs, common word pairs) to trigger retrieval. That helps even in more severe aphasia. Level 4 is a simplified <b>Verb Network Strengthening Treatment (VNeST)</b> (Edmonds): building who-does-what around a verb, which has generalized to untrained sentences. Picture choices keep it errorless-friendly, and the spoken phrase adds production practice.",
    levels: [
      { name: "Automatic", desc: "Counting, rhymes and songs" },
      { name: "Word pairs", desc: "Salt and … pepper" },
      { name: "Everyday sentences", desc: "I sleep in a … bed" },
      { name: "Who does it?", desc: "Build a sentence around an action" },
    ],
    prepare(ctx) {
      const n = Math.min(P.Settings.data.roundLen, 10);
      if (ctx.level === 3) return P.sample(P.DATA.verbs, n).map((v) => Object.assign({ key: v.v }, v));
      return P.sample(P.DATA.lines[ctx.level + 1], n).map((l) => Object.assign({ key: l.a[0] }, l));
    },
    render(ctx, item) {
      if (ctx.level === 3) verb(ctx, item);
      else line(ctx, item);
    },
  });

  function line(ctx, item) {
    const wrap = el("div", "fl");
    const parts = item.s.split("___");
    wrap.innerHTML = `
      <div class="fl-card">
        <div class="fl-stem"><span>${esc(parts[0])}</span><span class="fl-blank" aria-label="blank">?</span><span>${esc(parts[1] || "")}</span></div>
        <button type="button" class="btn-round fl-say" aria-label="Read aloud">🔊</button>
      </div>
      <div class="fl-choices"></div>
      <div class="fl-sayit"></div>`;
    ctx.stage.appendChild(wrap);
    const stemSpeech = item.s.replace("___", "…");
    P.$(".fl-say", wrap).addEventListener("click", () => P.Voice.speak(stemSpeech, { rate: 0.9 }));
    ctx.later(() => P.Voice.auto(stemSpeech, { rate: 0.9 }), 400);
    let misses = 0;
    const opts = P.shuffle([{ label: item.a[0], emoji: item.a[1], correct: true }].concat(item.f.map(([w, e]) => ({ label: w, emoji: e }))));
    P.$(".fl-choices", wrap).appendChild(P.choices(opts, (it) => {
      if (!it.correct) { misses++; return false; }
      const blank = P.$(".fl-blank", wrap);
      blank.textContent = item.a[0];
      blank.classList.add("filled");
      const full = item.s.replace("___", item.a[0]);
      P.Voice.speak(full, { rate: 0.9 });
      ctx.later(() => say(full), 1300);
      return true;
    }, { errorless: P.Settings.data.support === "errorless" }));

    function say(full) {
      const s = P.SayIt({
        text: full, emoji: item.a[1], prompt: "Now say the whole line!", noAutoModel: true, cued: misses > 0,
        targets: [full, item.a[0]],
        onAttempt: (r, info) => { if (r === "notyet") ctx.log({ item: full, result: "notyet", heard: info.heard }); },
        onDone: (res) => ctx.complete(res.result, { item: full, emoji: item.a[1], cues: misses, heard: res.heard, sr: res.sr, detail: `choice_misses=${misses}` }),
      });
      P.$(".fl-sayit", wrap).replaceChildren(s);
      ctx.skipHandler = () => s.skip();
      s.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function verb(ctx, item) {
    const wrap = el("div", "vn");
    wrap.innerHTML = `
      <div class="vn-builder">
        <div class="vn-slot who"><small>Who?</small><div class="vn-fill">?</div></div>
        <div class="vn-slot verb"><small>Action</small><div class="vn-fill"><span aria-hidden="true">${item.e}</span> ${esc(item.v)}</div></div>
        <div class="vn-slot what"><small>What?</small><div class="vn-fill">?</div></div>
      </div>
      <div class="vn-q"></div>`;
    ctx.stage.appendChild(wrap);
    const q = P.$(".vn-q", wrap);
    let misses = 0;

    function head(text) {
      const h = el("div", "pq-head", `<span class="pq-icon" aria-hidden="true">${item.e}</span><div><small>Who does it?</small><b>${esc(text)}</b></div>`);
      const b = P.button("🔊", "btn-round", () => P.Voice.speak(text));
      b.setAttribute("aria-label", "Read aloud");
      h.appendChild(b);
      q.replaceChildren(h);
      P.Voice.auto(text);
    }
    function askWho() {
      head(`Who can ${item.v}?`);
      const opts = P.shuffle(item.pairs.map((p) => ({ label: p[0], emoji: p[1], correct: true, pair: p })).concat(P.sample(item.no, 1).map(([w, e]) => ({ label: w, emoji: e }))));
      q.appendChild(P.choices(opts, (it) => {
        if (!it.correct) { misses++; P.toast(`Hmm, can a ${it.label} ${item.v}? Try another!`); return false; }
        fillSlot(".who", it.emoji + " " + it.label);
        ctx.later(() => askWhat(it.pair), 900);
        return true;
      }, { errorless: P.Settings.data.support === "errorless" }));
    }
    function askWhat(pair) {
      const who = pair[0];
      const subject = ["mom", "dad", "grandma", "grandpa"].includes(who) ? who.charAt(0).toUpperCase() + who.slice(1) : "the " + who;
      head(`What ${/s$/.test(who) ? "do" : "does"} ${subject} ${item.v}?`);
      const opts = P.shuffle([{ label: pair[2], emoji: pair[3], correct: true }].concat(item.noWhat.map(([w, e]) => ({ label: w, emoji: e }))));
      q.appendChild(P.choices(opts, (it) => {
        if (!it.correct) { misses++; return false; }
        fillSlot(".what", it.emoji + " " + it.label);
        wrap.classList.add("built");
        P.Voice.speak(pair[4], { rate: 0.9 });
        ctx.later(() => say(pair), 1500);
        return true;
      }, { errorless: P.Settings.data.support === "errorless" }));
    }
    function fillSlot(sel, text) {
      const f = P.$(sel + " .vn-fill", wrap);
      f.textContent = text;
      f.parentElement.classList.add("filled");
      P.burst(f, ["✨"], 8);
    }
    function say(pair) {
      const s = P.SayIt({
        text: pair[4], emoji: "", prompt: "Say your sentence!", noAutoModel: true, cued: misses > 0,
        targets: [pair[4], `${pair[0]} ${item.v}`],
        onAttempt: (r, info) => { if (r === "notyet") ctx.log({ item: pair[4], result: "notyet", heard: info.heard }); },
        onDone: (res) => ctx.complete(res.result, { item: pair[4], emoji: item.e, cues: misses, heard: res.heard, sr: res.sr, detail: `verb=${item.v}` }),
      });
      q.replaceChildren(s);
      ctx.skipHandler = () => s.skip();
    }
    ctx.later(askWho, 300);
  }
})();

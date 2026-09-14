/* =========================================================================
 * THE PARLOR  ·  Hundred Club  (high-repetition speech-sound practice)
 * Pick target sounds and a word position, set a trial goal (20–100), and
 * fill the gem jar. The drill climbs the articulation ladder automatically:
 * sound → syllable → word → phrase → sentence, moving up at 80% accuracy
 * over the last 10 tries and gently stepping back below 50%.
 * ========================================================================= */
(function () {
  const P = window.P;
  const { el, esc } = P;
  const STEPS = ["Sounds", "Syllables", "Words", "Phrases", "Sentences"];
  const STICKERS = ["🐶", "🐱", "🦊", "🐼", "🐨", "🦁", "🐯", "🐸", "🐙", "🦄", "🐢", "🦋", "🐳", "🦉", "🐝"];
  const VOWELS = ["a", "ee", "o", "oo"];

  P.registerGame({
    id: "hundred",
    title: "Hundred Club",
    emoji: "💎",
    color: ["#12b886", "#228be6"],
    tagline: "Fill the gem jar with lots and lots of great sounds.",
    skill: "Speech sounds (articulation) with high repetition",
    tags: ["Articulation", "Apraxia", "Kids", "Dysarthria"],
    how: [
      "Pick your sounds and how many tries to aim for.",
      "Listen, then say each sound, syllable, word or sentence.",
      "Every good try drops a gem in your jar 💎.",
      "Do well and the game moves you up a step on its own.",
      "Collect a new animal sticker every 10 gems!",
    ],
    evidence: "Built for <b>dose</b>: research on speech-sound disorders links better outcomes to more trials per session (Williams: 50–100+; motor-based work 100–150). The ladder follows a <b>traditional articulation hierarchy</b> with an <b>80%/10-trial</b> advance rule. Practice can be <b>blocked</b> (one sound at a time, best for new skills) or <b>random</b> (mixed, better for carry-over), following <b>principles of motor learning</b> used in Sound Production Treatment. Sound groups follow Shriberg's Early, Middle and Late 8.",
    levels: STEPS.map((s, i) => ({ name: s, desc: ["Just the sound: sss", "Sound + vowel: sa, see", "Picture words", "Short phrases: my sun", "Whole sentences"][i] })),
    defaults: { sounds: ["k"], position: "initial", trials: 20, order: "blocked" },
    setup(box, cfg) {
      const D = P.DATA.sounds;
      box.innerHTML = `<h3>Target sounds <small class="muted">(pick one or more)</small></h3>`;
      ["Early", "Middle", "Late"].forEach((grp) => {
        const row = el("div", "chips sound-chips");
        row.innerHTML = `<span class="chip-group">${grp} sounds</span>`;
        Object.keys(D).filter((k) => D[k].group === grp).forEach((k) => {
          const b = el("button", "chip snd " + (cfg.sounds.includes(k) ? "on" : ""), `/${k}/`);
          b.type = "button";
          b.setAttribute("aria-pressed", cfg.sounds.includes(k));
          b.addEventListener("click", () => {
            const on = cfg.sounds.includes(k);
            if (on && cfg.sounds.length === 1) return P.toast("Keep at least one sound");
            cfg.sounds = on ? cfg.sounds.filter((x) => x !== k) : cfg.sounds.concat(k);
            b.classList.toggle("on", !on); b.setAttribute("aria-pressed", !on);
            P.Sound.play("tap");
          });
          row.appendChild(b);
        });
        box.appendChild(row);
      });
      const opts = el("div", "setup-row");
      opts.appendChild(seg("Position", "position", [["initial", "Start of word"], ["final", "End of word"]]));
      opts.appendChild(seg("Tries", "trials", [[20, "20"], [50, "50"], [100, "💯 100"]]));
      opts.appendChild(seg("Order", "order", [["blocked", "One at a time"], ["random", "Mixed up"]]));
      box.appendChild(opts);
      function seg(label, key, vals) {
        const f = el("div", "seg-field", `<span>${label}</span>`);
        const s = el("div", "seg");
        vals.forEach(([v, l]) => {
          const b = el("button", cfg[key] == v ? "on" : "", l);
          b.type = "button";
          b.addEventListener("click", () => { cfg[key] = v; P.$$("button", s).forEach((x) => x.classList.toggle("on", x === b)); P.Sound.play("tap"); });
          s.appendChild(b);
        });
        f.appendChild(s);
        return f;
      }
    },
    prepare(ctx) {
      ctx.hc = { step: ctx.level, recent: [], gems: 0, stickers: [], last: "" };
      return Array.from({ length: ctx.cfg.trials || 20 }, () => ({ key: "" }));
    },
    summaryExtra: (ctx) => `and earned ${ctx.hc.stickers.length} ${ctx.hc.stickers.length === 1 ? "sticker" : "stickers"} ${ctx.hc.stickers.join("")}`,
    render(ctx, item, index) {
      const st = ctx.hc, cfg = ctx.cfg, D = P.DATA;
      const sounds = cfg.sounds.filter((k) => D.sounds[k]);
      const n = ctx.items.length;
      const sk = cfg.order === "random" ? P.pick(sounds) : sounds[Math.floor(index / Math.ceil(n / sounds.length)) % sounds.length];
      const snd = D.sounds[sk];
      const pos = cfg.position === "final" ? "final" : "initial";
      // stimulus for the current step (avoid immediate repeats)
      let text, say, emoji = "", word = null;
      for (let tries = 0; tries < 6; tries++) {
        word = P.pick(snd[pos]);
        if (st.step === 0) { text = `/${sk}/`; say = snd.iso; emoji = "👄"; }
        else if (st.step === 1) { text = pos === "initial" ? P.pick(snd.syl) : P.pick(VOWELS) + sk; say = text; emoji = "🔤"; }
        else if (st.step === 2) { text = word[0]; say = text; emoji = word[1]; }
        else if (st.step === 3) { text = P.pick(D.carriers.phrase).replace("___", word[0]); say = text; emoji = word[1]; }
        else { text = P.pick(D.carriers.sentence).replace("___", word[0]); say = text; emoji = word[1]; }
        if (text !== st.last || st.step === 0) break;
      }
      st.last = text;
      item.key = text;

      const wrap = el("div", "hc");
      wrap.innerHTML = `
        <div class="hc-top">
          <div class="jar" aria-label="${st.gems} of ${n} gems">
            <div class="jar-fill" style="height:${(index / n) * 100}%"></div>
            <div class="jar-count"><b>${st.gems}</b><small>/ ${n}</small></div>
            <div class="jar-lid"></div>
          </div>
          <div class="hc-info">
            <div class="ladder" aria-label="Practice step">${STEPS.map((s, i) => `<span class="rung ${i === st.step ? "on" : i < st.step ? "past" : ""}">${s}</span>`).join("")}</div>
            <div class="hc-tip"><span class="hc-snd">/${esc(sk)}/</span><span>${esc(snd.tip)}</span></div>
            <div class="stickers" aria-label="Stickers">${st.stickers.map((s) => `<span>${s}</span>`).join("") || '<span class="muted small">Stickers appear every 10 gems</span>'}</div>
          </div>
        </div>
        <div class="hc-say"></div>`;
      ctx.stage.appendChild(wrap);

      const s = P.SayIt({
        text, say, emoji,
        prompt: st.step === 0 ? "Make the sound" : st.step === 1 ? "Say the syllable" : st.step === 2 ? "Say the word" : "Say it all",
        targets: [text.replace(/[/.!?]/g, "")],
        onAttempt: (r, info) => {
          if (r === "notyet") {
            ctx.log({ item: text, result: "notyet", heard: info.heard, detail: detail() });
            st.recent.push(false);
            adapt();
          }
        },
        onDone: (res) => {
          if (res.result === "skip") return ctx.complete("skip", { item: text, delay: 50 });
          st.recent.push(res.result === "correct");
          st.gems++;
          dropGem();
          const d = detail();
          adapt();
          if (st.gems % 10 === 0) {
            const sticker = STICKERS[(st.stickers.length) % STICKERS.length];
            st.stickers.push(sticker);
            P.Sound.play("great");
            P.polly(`${st.gems} gems! You earned a sticker ${sticker}`, "happy");
          }
          ctx.complete(res.result, { item: text, emoji: emoji === "👄" || emoji === "🔤" ? "" : emoji, cues: res.cued ? 1 : 0, heard: res.heard, sr: res.sr, detail: d, delay: 650 });
        },
      });
      P.$(".hc-say", wrap).appendChild(s);
      ctx.skipHandler = () => s.skip();

      function detail() { return `/${sk}/ ${pos} · ${STEPS[st.step].toLowerCase()}`; }
      function dropGem() {
        const jar = P.$(".jar", wrap);
        P.$(".jar-count b", wrap).textContent = st.gems;
        P.$(".jar-fill", wrap).style.height = ((index + 1) / n) * 100 + "%";
        const g = el("span", "gem-drop", "💎");
        jar.appendChild(g);
        P.Sound.play("gem");
      }
      function adapt() {
        const move = P.Logic.adapt(st.recent);
        if (move > 0 && st.step < STEPS.length - 1) {
          st.step++; st.recent = [];
          P.toast(`⬆️ Level up! Now: ${STEPS[st.step]}`, "good");
          P.polly(`Great accuracy! Let's try ${STEPS[st.step].toLowerCase()}.`, "happy");
        } else if (move < 0 && st.step > 0) {
          st.step--; st.recent = [];
          P.toast(`Let's practise ${STEPS[st.step].toLowerCase()} for a bit`);
        }
      }
    },
  });
})();

/* =========================================================================
 * THE PARLOR  ·  Word Lock  (Wordle-style word retrieval)
 * Guess the hidden word with picture + meaning clues, supported by a
 * cueing hierarchy (meaning → rhyme → picture → letters → spoken model).
 * Then say the word aloud three times. No dictionary check: any letters are
 * accepted, so spelling difficulty never blocks play.
 * ========================================================================= */
(function () {
  const P = window.P;
  const { el, esc } = P;
  const ROWS = 6;
  const KEYS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

  P.registerGame({
    id: "wordlock",
    title: "Word Lock",
    emoji: "🔐",
    color: ["#ff6b6b", "#ff9f43"],
    tagline: "Crack the hidden word with picture and meaning clues.",
    skill: "Word finding, spelling-to-sound, reading",
    tags: ["Aphasia", "Word finding", "Teens & adults", "Phonics"],
    how: [
      "Look at the picture and clue.",
      "Type a guess with the big letter keys.",
      "Green ✓ tiles are right. Yellow ↔ letters belong somewhere else.",
      "Stuck? Tap Hint for more help.",
      "When you crack it, say the word out loud three times.",
    ],
    evidence: "Combines orthographic and semantic cueing with a <b>cueing hierarchy</b> ordered from least to most support (Linebaugh &amp; Lehner). Every hint is logged so independence can be tracked. Saying the word several times adds high-repetition spoken naming practice. There is no fixed guess limit to fail: after six rows the word is shown in an errorless way and modelled.",
    levels: [
      { name: "3 letters", desc: "Picture and first letter given" },
      { name: "4 letters", desc: "Picture and category given" },
      { name: "5 letters", desc: "Category only. Picture is a hint" },
    ],
    prepare(ctx) {
      const len = 3 + ctx.level;
      const n = Math.min(P.Settings.data.roundLen, 6);
      return P.sample(P.DATA.wordlock[len], n).map(([w, e, c, clue, r]) => ({ key: w, word: w, emoji: e, cat: c, clue, rhyme: r }));
    },
    summaryExtra: () => "and cracked every lock",
    render(ctx, item) {
      const stage = ctx.stage;
      const word = item.word, n = word.length;
      const showPic = ctx.level < 2;
      const known = new Array(n).fill("");
      if (ctx.level === 0) known[0] = word[0];
      let row = 0, cur = known.slice(), rows = [], hints = 0, busy = false, finished = false;

      const wrap = el("div", "wl");
      wrap.innerHTML = `
        <div class="wl-clue">
          <div class="wl-pic ${showPic ? "" : "hidden-pic"}" aria-hidden="true"><span>${showPic ? item.emoji : "❓"}</span></div>
          <div class="wl-clue-text">
            <div class="wl-cat">It's <b>${esc(item.cat)}</b></div>
            <div class="wl-hints" aria-live="polite"></div>
          </div>
          <button type="button" class="btn-round wl-say" aria-label="Hear the clue">🔊</button>
        </div>
        <div class="wl-board" style="--n:${n}" role="grid" aria-label="Guesses"></div>
        <div class="wl-msg" aria-live="polite"></div>
        <div class="wl-tools"></div>
        <div class="wl-kb" aria-label="Keyboard"></div>`;
      stage.appendChild(wrap);
      const board = P.$(".wl-board", wrap), msg = P.$(".wl-msg", wrap), hintsBox = P.$(".wl-hints", wrap), pic = P.$(".wl-pic", wrap);

      for (let r = 0; r < ROWS; r++) {
        const rEl = el("div", "wl-row");
        rEl.setAttribute("role", "row");
        for (let i = 0; i < n; i++) { const t = el("div", "wl-tile"); t.setAttribute("role", "gridcell"); rEl.appendChild(t); }
        board.appendChild(rEl);
      }

      const sayClue = () => P.Voice.speak(`It's ${item.cat}. ${hints >= 1 ? item.clue + "." : ""}`);
      P.$(".wl-say", wrap).addEventListener("click", sayClue);
      ctx.later(sayClue, 500);

      const cues = [
        { label: "clue", run: () => addHint("🧠", item.clue) },
        { label: "rhyme", run: () => addHint("🎵", `It rhymes with “${item.rhyme}”`) },
        { label: "picture", run: () => { if (!showPic) { pic.classList.remove("hidden-pic"); pic.querySelector("span").textContent = item.emoji; addHint("🖼️", "Here's a picture"); } else revealLetter(); } },
        { label: "letter", run: revealLetter },
        { label: "letter", run: revealLetter },
        { label: "model", run: () => { addHint("🔊", "Listen to the word"); P.Voice.speak(word, { rate: 0.8 }); } },
      ];
      const hintBtn = P.Cues(cues, (u) => { hints = u; });
      P.$(".wl-tools", wrap).appendChild(hintBtn);

      function addHint(icon, text) {
        const h = el("div", "wl-hint", `<span aria-hidden="true">${icon}</span> ${esc(text)}`);
        hintsBox.appendChild(h);
        P.Voice.speak(text);
      }
      function revealLetter() {
        const i = known.findIndex((k, j) => !k && word[j] !== undefined);
        if (i < 0) return;
        known[i] = word[i];
        cur[i] = word[i];
        addHint("🔤", `Letter ${i + 1} is “${word[i].toUpperCase()}”`);
        paintRow();
      }

      // keyboard
      const kb = P.$(".wl-kb", wrap);
      KEYS.forEach((line, li) => {
        const r = el("div", "kb-row");
        if (li === 2) r.appendChild(key("enter", "Check ✓", "wide enter"));
        line.split("").forEach((c) => r.appendChild(key(c, c.toUpperCase())));
        if (li === 2) r.appendChild(key("back", "⌫", "wide"));
        kb.appendChild(r);
      });
      function key(k, label, cls) {
        const b = el("button", "kb-key " + (cls || ""), label);
        b.type = "button"; b.dataset.k = k;
        b.setAttribute("aria-label", k === "back" ? "Delete" : k === "enter" ? "Check guess" : k);
        b.addEventListener("click", () => press(k));
        return b;
      }
      const onKey = (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey || document.querySelector(".overlay")) return;
        if (e.key === "Enter") { e.preventDefault(); press("enter"); }
        else if (e.key === "Backspace") { e.preventDefault(); press("back"); }
        else if (/^[a-z]$/i.test(e.key)) press(e.key.toLowerCase());
      };
      document.addEventListener("keydown", onKey);
      ctx.cleanup(() => document.removeEventListener("keydown", onKey));

      function press(k) {
        if (busy || finished) return;
        if (k === "enter") return submit();
        if (k === "back") {
          for (let i = n - 1; i >= 0; i--) if (cur[i] && !known[i]) { cur[i] = ""; break; }
          P.Sound.play("key");
          return paintRow();
        }
        const i = cur.findIndex((c) => !c);
        if (i < 0) return;
        cur[i] = k;
        P.Sound.play("key");
        paintRow(i);
      }
      function paintRow(popAt) {
        const tiles = board.children[row].children;
        for (let i = 0; i < n; i++) {
          tiles[i].textContent = (cur[i] || "").toUpperCase();
          tiles[i].classList.toggle("filled", !!cur[i]);
          tiles[i].classList.toggle("given", !!known[i]);
        }
        if (popAt != null) { const t = tiles[popAt]; t.classList.remove("pop"); void t.offsetWidth; t.classList.add("pop"); }
      }
      function submit() {
        if (cur.some((c) => !c)) {
          msg.textContent = `Fill all ${n} boxes first`;
          const r = board.children[row]; r.classList.remove("shake"); void r.offsetWidth; r.classList.add("shake");
          return;
        }
        busy = true;
        const guess = cur.join("");
        const fb = P.Logic.scoreGuess(guess, word);
        rows.push({ guess, fb });
        const tiles = [...board.children[row].children];
        const STEP = P.$("html").classList.contains("calm-motion") ? 60 : 260;
        tiles.forEach((t, i) => {
          ctx.later(() => { t.classList.add("flip"); }, i * STEP);
          ctx.later(() => {
            t.dataset.s = fb[i];
            P.Sound.play(fb[i] === "g" ? "flipG" : fb[i] === "y" ? "flipY" : "flipX", i);
          }, i * STEP + 220);
        });
        ctx.later(() => {
          paintKeys();
          busy = false;
          if (guess === word) return win();
          // letters the player has found in the right spot become given
          fb.forEach((s, i) => { if (s === "g") known[i] = word[i]; });
          row++;
          if (row >= ROWS) return reveal();
          cur = known.slice();
          paintRow();
          msg.textContent = row >= 3 && !hints ? "Tip: the 💡 Hint button can help" : P.pick(["Keep going!", "Good thinking!", "Getting closer!", "Nice try!"]);
        }, n * STEP + 420);
      }
      function paintKeys() {
        const st = P.Logic.keyStates(rows);
        P.$$(".kb-key", kb).forEach((b) => { if (st[b.dataset.k]) b.dataset.s = st[b.dataset.k]; });
      }
      function win() {
        finished = true;
        board.children[row].classList.add("win");
        pic.classList.remove("hidden-pic");
        pic.querySelector("span").textContent = item.emoji;
        P.Sound.play("great");
        P.confetti(50);
        msg.innerHTML = `<b>${esc(P.praise())}</b> You cracked <b>${word.toUpperCase()}</b>!`;
        ctx.later(speak, 1100);
      }
      function reveal() {
        finished = true;
        hints = Math.max(hints, 6);
        pic.classList.remove("hidden-pic");
        pic.querySelector("span").textContent = item.emoji;
        msg.innerHTML = `The word is <b>${word.toUpperCase()}</b>. Let's say it together.`;
        ctx.later(speak, 900);
      }
      function speak() {
        kb.remove();
        P.$(".wl-tools", wrap).remove();
        const s = P.SayIt({
          text: word, emoji: item.emoji, reps: 3, cued: hints > 0,
          prompt: "Say the word out loud — 3 times!",
          onAttempt: (r, info) => { if (r === "notyet") ctx.log({ item: word, result: "notyet", heard: info.heard }); },
          onDone: (res) => ctx.complete(res.result === "skip" ? "skip" : res.result, { item: word, emoji: item.emoji, cues: hints, heard: res.heard, sr: res.sr, detail: `guesses=${rows.length}` }),
        });
        msg.after(s);
        ctx.skipHandler = () => s.skip();
        s.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      ctx.skipHandler = () => { finished = true; ctx.complete("skip", { item: word, emoji: item.emoji, delay: 50 }); };
      paintRow();
    },
  });
})();

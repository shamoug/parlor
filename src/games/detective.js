/* =========================================================================
 * THE PARLOR  ·  Sound Detective  (Phonological Components Analysis)
 * Solve five sound clues about a mystery picture: first sound, a word that
 * starts the same, number of beats, a rhyme and the last sound. Each clue
 * brings the picture into focus; then name it aloud.
 * ========================================================================= */
(function () {
  const P = window.P;
  const { el, esc } = P;
  const D = () => P.DATA;

  P.registerGame({
    id: "detective",
    title: "Sound Detective",
    emoji: "🔎",
    color: ["#4c6ef5", "#15aabf"],
    tagline: "Crack the case with five sound clues.",
    skill: "Word finding through sounds, phonological awareness",
    tags: ["Aphasia", "Kids", "Phonological awareness", "Reading"],
    how: [
      "A mystery picture needs a name!",
      "Answer each sound clue. Tap 🔊 on a choice to hear it.",
      "Tap the drum once for every beat (syllable).",
      "Each clue you solve makes the picture clearer.",
      "Solve the case by saying the word out loud.",
    ],
    evidence: "Based on <b>Phonological Components Analysis (PCA)</b> (Leonard, Rochon &amp; Laird, 2008). Seven of ten participants with aphasia improved naming, and some generalized to untreated words. Working out a word's sounds (first and last phoneme, rhyme, syllables, words with the same first sound) activates its sound form for retrieval. The same tasks build phonological awareness in children.",
    levels: [
      { name: "Two choices", desc: "Clear picture, 2 options" },
      { name: "Three choices", desc: "Clear picture, 3 options" },
      { name: "Mystery", desc: "Blurry picture that sharpens with each clue" },
    ],
    prepare(ctx) {
      const n = Math.min(P.Settings.data.roundLen, 8);
      return P.sample(D().detective, n).map(([w, e, f, l, s, r]) => ({ key: w, word: w, emoji: e, first: f, last: l, syl: s, rhyme: r }));
    },
    render(ctx, item) {
      const nC = [2, 3, 3][ctx.level];
      const mystery = ctx.level === 2;
      let step = 0, cues = 0;
      const soundKeys = Object.keys(D().soundLabels);

      const wrap = el("div", "det");
      wrap.innerHTML = `
        <div class="det-case">
          <div class="det-pic ${mystery ? "blur" : ""}" style="--blur:${mystery ? 22 : 0}px"><span aria-hidden="true">${item.emoji}</span><div class="det-glass" aria-hidden="true">🔍</div></div>
          <div class="det-board">
            <div class="det-title">Case file</div>
            <ol class="det-clues">
              ${["First sound", "Starts the same", "Beats", "Rhymes with", "Last sound"].map((c, i) => `<li data-i="${i}"><span class="dc-n">${i + 1}</span><span class="dc-label">${c}</span><span class="dc-val">?</span></li>`).join("")}
            </ol>
          </div>
        </div>
        <div class="det-q"></div>`;
      ctx.stage.appendChild(wrap);
      const q = P.$(".det-q", wrap);
      const pic = P.$(".det-pic", wrap);
      const clueLis = P.$$(".det-clues li", wrap);

      const steps = [firstSound, sameStart, beats, rhyme, lastSound];
      function run() {
        clueLis.forEach((li, i) => li.classList.toggle("now", i === step));
        q.replaceChildren();
        if (step >= steps.length) return solve();
        steps[step]();
      }
      function solved(val, missed) {
        const li = clueLis[step];
        li.classList.add("done");
        if (missed) { li.classList.add("helped"); cues++; }
        P.$(".dc-val", li).textContent = val;
        if (mystery) pic.style.setProperty("--blur", Math.max(0, 22 - (step + 1) * 5) + "px");
        step++;
        ctx.later(run, 1100);
      }
      function header(text, sayText) {
        const h = el("div", "pq-head", `<span class="pq-icon" aria-hidden="true">🕵️</span><div><small>Clue ${step + 1} of 5</small><b>${esc(text)}</b></div>`);
        const b = P.button("🔊", "btn-round", () => P.Voice.speak(sayText || text));
        b.setAttribute("aria-label", "Read clue");
        h.appendChild(b);
        q.appendChild(h);
        P.Voice.auto(sayText || text);
      }
      function soundChoices(target) {
        const foils = P.sample(soundKeys, nC - 1, (k) => k === target);
        const opts = P.shuffle([target].concat(foils)).map((k) => ({ label: D().soundLabels[k], emoji: "", say: D().soundSay[k], correct: k === target, value: k }));
        let missed = false;
        const g = P.choices(opts, (it) => {
          if (!it.correct) { missed = true; return false; }
          P.Voice.speak(D().soundSay[target]);
          solved("/" + D().soundLabels[target] + "/", missed);
          return true;
        }, { cls: "choices-sound", errorless: P.Settings.data.support === "errorless" });
        q.appendChild(g);
      }
      function firstSound() { header("What sound does it start with?"); soundChoices(item.first); }
      function lastSound() { header("What sound does it end with?"); soundChoices(item.last); }
      function sameStart() {
        header(`Which word starts with the same sound?`, "Which word starts with the same sound as the mystery word?");
        const pool = D().sounds[item.first];
        const right = P.pick((pool ? pool.initial : [["?", "❓"]]).filter((w) => w[0] !== item.word));
        const foilPool = [];
        Object.keys(D().sounds).forEach((k) => { if (k !== item.first) D().sounds[k].initial.forEach((w) => foilPool.push(w)); });
        const foils = P.sample(foilPool, nC - 1, (w) => w[0][0] === right[0][0]);
        const opts = P.shuffle([{ label: right[0], emoji: right[1], correct: true }].concat(foils.map((w) => ({ label: w[0], emoji: w[1] }))));
        let missed = false;
        q.appendChild(P.choices(opts, (it) => {
          if (!it.correct) { missed = true; return false; }
          P.Voice.speak(it.label);
          solved(right[1] + " " + right[0], missed);
          return true;
        }, { errorless: P.Settings.data.support === "errorless" }));
      }
      function beats() {
        header("How many beats does it have? Tap the drum for each beat.", "How many beats does the mystery word have? Say it in your head, and tap the drum for each beat.");
        let taps = 0, missed = false;
        const box = el("div", "det-drum");
        box.innerHTML = `<button type="button" class="drum" aria-label="Drum: tap once per beat"><span aria-hidden="true">🥁</span></button><div class="drum-count" aria-live="polite"><b>0</b> beats</div>`;
        const drum = P.$(".drum", box), count = P.$(".drum-count b", box);
        drum.addEventListener("click", () => {
          taps++; count.textContent = taps;
          P.Sound.play("drum");
          drum.classList.remove("hit"); void drum.offsetWidth; drum.classList.add("hit");
        });
        const row = el("div", "tool-row center");
        row.appendChild(P.button("↺ Start over", "btn-ghost", () => { taps = 0; count.textContent = 0; }));
        row.appendChild(P.button("✓ Check", "btn-primary", () => {
          if (taps === item.syl) {
            P.Sound.play("good");
            solved("🥁".repeat(item.syl) + " " + item.syl, missed);
          } else {
            missed = true;
            P.Sound.play("gentle");
            taps = 0; count.textContent = 0;
            const lay = el("div", "det-help", "Let's clap it together. Listen and count the beats…");
            box.appendChild(lay);
            P.Voice.speak(item.word, { rate: 0.6 });
            for (let i = 0; i < item.syl; i++) ctx.later(() => { P.Sound.play("drum"); drum.classList.remove("hit"); void drum.offsetWidth; drum.classList.add("hit"); }, 900 + i * 520);
            ctx.later(() => lay.remove(), 900 + item.syl * 520 + 400);
          }
        }));
        box.appendChild(row);
        q.appendChild(box);
      }
      function rhyme() {
        header("Which word rhymes with it?", "Which word rhymes with the mystery word?");
        const others = P.sample(D().detective.filter((d) => d[0] !== item.word && d[5] !== item.rhyme && d[0] !== item.rhyme), nC - 1).map((d) => d[5]);
        const opts = P.shuffle([{ label: item.rhyme, correct: true }].concat(others.map((w) => ({ label: w }))));
        let missed = false;
        q.appendChild(P.choices(opts, (it) => {
          if (!it.correct) { missed = true; return false; }
          P.Voice.speak(item.rhyme);
          solved("🎵 " + item.rhyme, missed);
          return true;
        }, { cls: "choices-text", errorless: P.Settings.data.support === "errorless" }));
      }
      function solve() {
        pic.style.setProperty("--blur", "0px");
        pic.classList.add("solved");
        P.Sound.play("bloom");
        const s = P.SayIt({
          text: item.word, emoji: item.emoji, hideText: true, noAutoModel: true, cued: cues > 1,
          prompt: "Case closed! What is it? Say its name.",
          onAttempt: (r, info) => { if (r === "notyet") ctx.log({ item: item.word, result: "notyet", heard: info.heard }); },
          onDone: (res) => ctx.complete(res.result, { item: item.word, emoji: item.emoji, cues, heard: res.heard, sr: res.sr, detail: `clue_misses=${cues}` }),
        });
        q.appendChild(s);
        ctx.skipHandler = () => s.skip();
      }
      ctx.later(run, 300);
    },
  });
})();

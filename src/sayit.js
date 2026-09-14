/* =========================================================================
 * THE PARLOR  ·  sayit.js
 * Reusable building blocks for the games:
 *   P.SayIt    the "say it out loud" panel shared by every game
 *   P.choices  a grid of big picture choices
 *   P.Cues     a cueing-hierarchy hint button (least → most support)
 *
 * Scoring philosophy (see docs/RESEARCH.md):
 *   • Speech recognition can only CONFIRM success. It never marks an attempt
 *     wrong — the player, caregiver or clinician always has the final say.
 *   • "Not yet" is neutral: it replays the model and invites a retry.
 *   • Support mode: errorless (model first), hint (model on request),
 *     try (model only after a first attempt).
 * ========================================================================= */
(function () {
  const P = window.P;
  const { el, esc } = P;

  /* opts:
   *   text      what is shown (word or phrase)
   *   say       what the voice models (defaults to text)
   *   emoji     big picture
   *   targets   accepted spoken forms (defaults to [text])
   *   prompt    instruction line
   *   reps      how many successful productions to collect (default 1)
   *   hideText  show picture only until the model is heard
   *   support   override settings support mode
   *   onAttempt(result, info) called for every scored attempt
   *   onDone({result, cued, attempts, heard}) called when reps are collected
   */
  P.SayIt = function (opts) {
    const S = P.Settings.data;
    const support = opts.support || S.support;
    const reps = opts.reps || 1;
    const say = opts.say || opts.text;
    const targets = opts.targets || [opts.text];
    let got = 0, attempts = 0, cued = !!opts.cued, heardLast = "", srHit = false, heardModel = false;

    const root = el("div", "sayit");
    root.innerHTML = `
      <div class="sayit-prompt">${esc(opts.prompt || "Now say it out loud")}</div>
      <div class="sayit-card">
        ${opts.emoji ? `<div class="sayit-emoji" aria-hidden="true">${opts.emoji}</div>` : ""}
        <div class="sayit-word ${opts.hideText ? "veiled" : ""}">${esc(opts.text)}</div>
        ${reps > 1 ? `<div class="sayit-reps" aria-label="repetitions">${Array.from({ length: reps }, () => '<span class="rep"></span>').join("")}</div>` : ""}
      </div>
      <div class="sayit-heard" aria-live="polite"></div>
      <div class="sayit-actions"></div>
      <div class="sayit-score" role="group" aria-label="How did it go?"></div>`;
    const actions = root.querySelector(".sayit-actions");
    const score = root.querySelector(".sayit-score");
    const heard = root.querySelector(".sayit-heard");
    const word = root.querySelector(".sayit-word");

    const hearBtn = P.button('<span class="bi">🔊</span><span>Hear it</span>', "btn-big btn-sky", () => model());
    const withBtn = P.button('<span class="bi">🎶</span><span>Say it with me</span>', "btn-big btn-violet", () => together());
    actions.appendChild(hearBtn);
    let micBtn = null;
    if (P.Ear.enabled()) {
      micBtn = P.button('<span class="bi">🎤</span><span>Tap &amp; speak</span>', "btn-big btn-coral mic", () => listen());
      actions.appendChild(micBtn);
    }
    actions.appendChild(withBtn);

    const okBtn = P.button('<span class="bi">✓</span><span>Got it</span>', "btn-score good", () => mark("correct"));
    const helpBtn = P.button('<span class="bi">💡</span><span>With help</span>', "btn-score cued", () => mark("cued"));
    const notBtn = P.button('<span class="bi">↻</span><span>Not yet</span>', "btn-score notyet", () => mark("notyet"));
    score.append(okBtn, helpBtn, notBtn);

    if (support === "try") { hearBtn.disabled = true; withBtn.disabled = true; hearBtn.title = "Have a go first — then you can hear it"; }

    function unveil() { word.classList.remove("veiled"); }
    async function model(rate) {
      heardModel = true;
      unveil();
      root.classList.add("speaking");
      await P.Voice.speak(say, { rate: rate || 1 });
      root.classList.remove("speaking");
    }
    async function together() {
      cued = true;
      heard.innerHTML = "Let's say it together, nice and slow…";
      await model(0.75);
      heard.innerHTML = "Now you — say it!";
    }
    function listen() {
      if (!micBtn) return;
      if (micBtn.classList.contains("on")) { P.Ear.stop(); return; }
      micBtn.classList.add("on");
      micBtn.querySelector("span:last-child").textContent = "Listening…";
      heard.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
      P.Ear.listen({
        targets,
        onInterim: (t) => { heard.innerHTML = `<span class="muted">I'm hearing:</span> “${esc(t)}”`; },
        onResult: (m) => {
          heardLast = m.heard;
          if (m.match) {
            srHit = true;
            heard.innerHTML = `<span class="yay">I heard “${esc(m.heard)}”! ✨</span>`;
            setTimeout(() => mark(cued ? "cued" : "correct", true), 450);
          } else if (m.heard) {
            heard.innerHTML = `I heard “${esc(m.heard)}”. Try again, or tap <b>✓ Got it</b> if that was right.`;
          } else {
            heard.innerHTML = "I didn't catch that. Try again, or tap a button below.";
          }
        },
        onError: (code) => {
          if (code === "not-allowed" || code === "service-not-allowed") heard.innerHTML = "Microphone is blocked — no problem, just tap a button below.";
          else if (code === "no-speech") heard.innerHTML = "I didn't hear anything. Tap 🎤 and speak when ready.";
          else if (code === "network") heard.innerHTML = "Speech recognition needs internet here. Tap a button below instead.";
        },
        onEnd: () => {
          micBtn.classList.remove("on");
          micBtn.querySelector("span:last-child").textContent = "Tap & speak";
        },
      });
    }

    function mark(result, bySR) {
      if (root.classList.contains("done")) return;
      attempts++;
      if (support === "try") { hearBtn.disabled = false; withBtn.disabled = false; }
      if (result === "notyet") {
        P.Sound.play("gentle");
        heard.innerHTML = esc(P.retryLine());
        opts.onAttempt && opts.onAttempt("notyet", { heard: heardLast, sr: false });
        cued = true; // subsequent success counts as supported
        if (attempts >= 2 || support === "errorless") setTimeout(() => together(), 500);
        return;
      }
      if (result === "cued") cued = true;
      got++;
      const repEls = root.querySelectorAll(".rep");
      if (repEls[got - 1]) repEls[got - 1].classList.add("on");
      P.Sound.play(got >= reps ? "good" : "pop");
      P.burst(root.querySelector(".sayit-card"), ["⭐", "✨", "💫"], 10);
      opts.onAttempt && opts.onAttempt(cued ? "cued" : "correct", { heard: heardLast, sr: !!bySR });
      if (got < reps) {
        heard.innerHTML = `${esc(P.praise())} Again! <b>${reps - got}</b> more.`;
        return;
      }
      root.classList.add("done");
      unveil();
      heard.innerHTML = `<span class="yay">${esc(P.praise())}</span>`;
      P.Ear.stop();
      setTimeout(() => opts.onDone && opts.onDone({ result: cued ? "cued" : "correct", cued, attempts, heard: heardLast, sr: srHit }), 700);
    }

    // Errorless: model first. Hint: auto-speak the model if autoSpeak is on.
    setTimeout(() => {
      if (!root.isConnected) return;
      if (support === "errorless") model();
      else if (support === "hint" && P.Settings.data.autoSpeak && !opts.noAutoModel) model();
    }, 350);

    root.skip = () => { root.classList.add("done"); P.Ear.stop(); opts.onDone && opts.onDone({ result: "skip", cued, attempts, heard: heardLast }); };
    root.heardModel = () => heardModel;
    return root;
  };

  /* A grid of big picture choices.
   * items: [{label, emoji, correct, value}] ; onPick(item, button) returns
   * true when the pick is accepted (so the grid locks). */
  P.choices = function (items, onPick, opts) {
    opts = opts || {};
    const grid = el("div", "choices " + (opts.cls || ""));
    grid.setAttribute("role", "group");
    items.forEach((it, i) => {
      const b = el("button", "choice", `${it.emoji ? `<span class="ch-emoji" aria-hidden="true">${it.emoji}</span>` : ""}<span class="ch-label">${esc(it.label)}</span>${opts.speak !== false ? '<span class="ch-say" aria-hidden="true">🔊</span>' : ""}`);
      b.type = "button";
      b.style.setProperty("--i", i);
      b.setAttribute("aria-label", it.label);
      if (opts.errorless && it.correct) b.classList.add("glow");
      b.addEventListener("click", (e) => {
        if (grid.classList.contains("locked")) return;
        if (e.target.closest(".ch-say")) { P.Voice.speak(it.say || it.label); return; }
        const ok = onPick(it, b);
        if (ok) {
          grid.classList.add("locked");
          b.classList.add("right");
          P.Sound.play("good");
          P.burst(b, ["⭐", "✨"], 10);
        } else if (ok === false) {
          b.classList.add("wrong");
          b.disabled = true;
          P.Sound.play("gentle");
          const right = items.findIndex((x) => x.correct);
          if (right >= 0 && opts.glowAfterMiss !== false) grid.children[right].classList.add("glow");
        }
      });
      grid.appendChild(b);
    });
    return grid;
  };

  /* Cueing hierarchy button. cues: [{label, run()}] ordered least → most. */
  P.Cues = function (cues, onUse) {
    let used = 0;
    const btn = P.button('<span class="bi">💡</span><span>Hint</span>', "btn-hint", () => {
      if (used >= cues.length) { P.toast("That's every hint — you've got this!"); return; }
      const c = cues[used++];
      P.Sound.play("hint");
      c.run();
      btn.querySelector("span:last-child").textContent = used >= cues.length ? "No more hints" : `Hint ${used + 1}`;
      btn.dataset.used = used;
      onUse && onUse(used, c);
    });
    btn.used = () => used;
    btn.reset = () => { used = 0; btn.querySelector("span:last-child").textContent = "Hint"; };
    return btn;
  };
})();

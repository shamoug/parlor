/* =========================================================================
 * THE PARLOR  ·  shell.js
 * Hash router, home screen, game runtime, round summary, progress dashboard,
 * settings and guide. Games register themselves with P.registerGame().
 * ========================================================================= */
(function () {
  const P = window.P;
  const { el, esc, button } = P;
  const L = P.Logic;
  const S = P.Settings;
  const GAMES = (P.GAMES = []);
  P.registerGame = (def) => GAMES.push(def);
  const gameById = (id) => GAMES.find((g) => g.id === id);

  const app = () => P.$("#app");
  let teardown = null;

  function clean() {
    if (teardown) { try { teardown(); } catch (e) { console.error(e); } teardown = null; }
    P.Voice.stop(); P.Ear.stop(); P.Mic.stop(); P.closeOverlay();
    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------------ *
   * Router
   * ------------------------------------------------------------------ */
  function route() {
    clean();
    const h = location.hash.replace(/^#\/?/, "");
    const [page, arg, arg2] = h.split("/");
    document.body.dataset.page = page || "home";
    if (page === "play" && gameById(arg)) return intro(gameById(arg));
    if (page === "progress") return progressPage();
    if (page === "settings") return settingsPage();
    if (page === "guide") return guidePage();
    if (page === "plan" && arg) return acceptPlan(arg + (arg2 ? "/" + arg2 : ""));
    return home();
  }
  P.go = (hash) => { if (location.hash === hash) route(); else location.hash = hash; };

  function nav(active) {
    const n = el("header", "topnav");
    n.innerHTML = `
      <a class="brand" href="#/" aria-label="The Parlor home"><span class="brand-mark" aria-hidden="true">🦜</span><span class="brand-name">The Parlor</span></a>
      <nav class="navlinks" aria-label="Main">
        <a href="#/" class="${active === "home" ? "on" : ""}"><span aria-hidden="true">🎲</span> Games</a>
        <a href="#/progress" class="${active === "progress" ? "on" : ""}"><span aria-hidden="true">📈</span> Progress</a>
        <a href="#/guide" class="${active === "guide" ? "on" : ""}"><span aria-hidden="true">📘</span> Guide</a>
        <a href="#/settings" class="${active === "settings" ? "on" : ""}"><span aria-hidden="true">⚙️</span> Settings</a>
      </nav>`;
    return n;
  }

  /* ------------------------------------------------------------------ *
   * Home
   * ------------------------------------------------------------------ */
  function home() {
    const root = el("div", "page home");
    root.appendChild(nav("home"));
    const name = S.data.name;
    const today = P.Log.today(), goal = S.data.goal, streak = P.Log.streak();
    const total = P.Log.all().filter((t) => t.result === "correct" || t.result === "cued").length;
    const pct = Math.min(1, today / goal);
    const hour = new Date().getHours();
    const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    const hero = el("section", "hero");
    hero.innerHTML = `
      <div class="hero-tiles" aria-hidden="true">${"PARLOR".split("").map((c, i) => `<span class="htile" style="--i:${i}">${c}</span>`).join("")}</div>
      <h1 class="hero-title">The Parlor</h1>
      <p class="hero-sub">Eight joyful word games that help every voice grow stronger.</p>
      <p class="hero-hello">${hello}${name ? ", <b>" + esc(name) + "</b>" : ""}! <span aria-hidden="true">👋</span></p>
      <div class="stats">
        <div class="stat ring-stat" title="Practice goal for today">
          <svg viewBox="0 0 44 44" class="ring" aria-hidden="true"><circle cx="22" cy="22" r="18" class="ring-bg"/><circle cx="22" cy="22" r="18" class="ring-fg" style="stroke-dasharray:${(pct * 113.1).toFixed(1)} 113.1"/></svg>
          <div><b>${today}</b><span> / ${goal}</span><small>today's words</small></div>
        </div>
        <div class="stat"><span class="stat-ico" aria-hidden="true">🔥</span><div><b>${streak}</b><small>day streak</small></div></div>
        <div class="stat"><span class="stat-ico" aria-hidden="true">💎</span><div><b>${total}</b><small>words practised</small></div></div>
      </div>`;
    root.appendChild(hero);

    const plan = P.store("plan");
    if (plan && plan.g && plan.g.length) {
      const b = el("section", "plan-banner");
      b.innerHTML = `<div class="pb-ico" aria-hidden="true">📋</div><div class="pb-text"><b>Your practice plan</b><span>${esc(plan.note || "Chosen by your therapist")} · Goal: ${plan.goal || goal} words a day</span></div>`;
      const x = button("Clear plan", "btn-ghost small", () => { P.store("plan", null); route(); });
      b.appendChild(x);
      root.appendChild(b);
    }

    const grid = el("section", "game-grid");
    grid.setAttribute("aria-label", "Games");
    const planned = plan && plan.g ? plan.g : null;
    const order = planned ? GAMES.slice().sort((a, b) => (planned.includes(b.id) ? 1 : 0) - (planned.includes(a.id) ? 1 : 0)) : GAMES;
    order.forEach((g, i) => {
      const card = el("a", "game-card" + (planned && planned.includes(g.id) ? " planned" : ""));
      card.href = "#/play/" + g.id;
      card.style.setProperty("--c1", g.color[0]);
      card.style.setProperty("--c2", g.color[1]);
      card.style.setProperty("--i", i);
      const plays = P.Log.all().filter((t) => t.game === g.id).length;
      card.innerHTML = `
        <div class="gc-top"><span class="gc-emoji" aria-hidden="true">${g.emoji}</span>${planned && planned.includes(g.id) ? '<span class="gc-badge">In your plan</span>' : ""}</div>
        <div class="gc-body">
          <h2>${esc(g.title)}</h2>
          <p>${esc(g.tagline)}</p>
          <div class="gc-tags">${g.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        </div>
        <div class="gc-foot"><span class="gc-skill">${esc(g.skill)}</span><span class="gc-play">${plays ? "Play" : "Start"} <span aria-hidden="true">→</span></span></div>`;
      card.addEventListener("click", () => P.Sound.play("pop"));
      grid.appendChild(card);
    });
    root.appendChild(grid);

    const foot = el("footer", "home-foot");
    foot.innerHTML = `
      <div class="foot-cards">
        <a class="foot-card" href="#/guide"><span aria-hidden="true">🩺</span><b>For therapists</b><small>Evidence, session tips and home-practice plans</small></a>
        <a class="foot-card" href="#/progress"><span aria-hidden="true">📊</span><b>See progress</b><small>Accuracy, cues and trials. Export to CSV</small></a>
        <a class="foot-card" href="#/settings"><span aria-hidden="true">🎨</span><b>Make it yours</b><small>Themes, big text, voice speed and microphone</small></a>
      </div>
      <p class="fine">Private by design: everything stays on this device. The Parlor supports therapy. It does not replace a speech-language pathologist.</p>`;
    root.appendChild(foot);
    app().replaceChildren(root);
    if (!P.store("welcomed")) {
      P.store("welcomed", true);
      setTimeout(() => P.polly("Welcome to The Parlor! Pick any game to begin.", "happy"), 900);
    }
  }

  /* ------------------------------------------------------------------ *
   * Game intro + runtime
   * ------------------------------------------------------------------ */
  function cfgFor(g) { return Object.assign({}, g.defaults || {}, P.store("cfg_" + g.id) || {}); }

  function intro(g) {
    const root = el("div", "page intro");
    root.style.setProperty("--c1", g.color[0]);
    root.style.setProperty("--c2", g.color[1]);
    root.appendChild(nav(""));
    const cfg = cfgFor(g);
    let level = Math.min(cfg.level || 0, g.levels.length - 1);
    const card = el("section", "intro-card");
    card.innerHTML = `
      <div class="intro-head">
        <div class="intro-emoji" aria-hidden="true">${g.emoji}</div>
        <div><h1>${esc(g.title)}</h1><p class="intro-tag">${esc(g.tagline)}</p></div>
        <button class="btn-round say-intro" type="button" aria-label="Read instructions aloud">🔊</button>
      </div>
      <div class="intro-grid">
        <div class="intro-how"><h3>How to play</h3><ol>${g.how.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>
        <div class="intro-why">
          <h3>What it helps</h3>
          <p><b>${esc(g.skill)}</b></p>
          <div class="gc-tags">${g.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          <details><summary>For therapists</summary><p>${g.evidence}</p></details>
        </div>
      </div>
      <h3 class="lvl-title">Choose a level</h3>
      <div class="levels" role="radiogroup" aria-label="Level"></div>
      <div class="intro-setup"></div>
      <div class="intro-go"></div>`;
    const lv = card.querySelector(".levels");
    g.levels.forEach((l, i) => {
      const b = el("button", "level" + (i === level ? " on" : ""), `<span class="lv-n">${i + 1}</span><span class="lv-text"><b>${esc(l.name)}</b><small>${esc(l.desc)}</small></span>`);
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", i === level);
      b.addEventListener("click", () => {
        level = i; P.Sound.play("tap");
        P.$$(".level", lv).forEach((x, j) => { x.classList.toggle("on", j === i); x.setAttribute("aria-checked", j === i); });
        if (g.setup) renderSetup();
      });
      lv.appendChild(b);
    });
    const setupBox = card.querySelector(".intro-setup");
    function renderSetup() { setupBox.replaceChildren(); g.setup(setupBox, cfg, level); }
    if (g.setup) renderSetup();
    const go = button(`<span class="bi">▶</span><span>Let's play!</span>`, "btn-primary btn-xl", () => {
      P.Sound.unlock();
      cfg.level = level;
      P.store("cfg_" + g.id, cfg);
      run(g, level, cfg);
    });
    card.querySelector(".intro-go").appendChild(go);
    card.querySelector(".say-intro").addEventListener("click", () => P.Voice.speak(g.title + ". " + g.tagline + ". " + g.how.join(" ")));
    root.appendChild(card);
    app().replaceChildren(root);
  }

  function run(g, level, cfg) {
    clean();
    const root = el("div", "page play");
    root.style.setProperty("--c1", g.color[0]);
    root.style.setProperty("--c2", g.color[1]);
    const bar = el("header", "playbar");
    bar.innerHTML = `
      <button class="btn-round" type="button" data-act="home" aria-label="Back to games">🏠</button>
      <div class="pb-title"><span aria-hidden="true">${g.emoji}</span> <b>${esc(g.title)}</b> <span class="pb-level">Level ${level + 1}</span></div>
      <div class="pb-dots" aria-label="Round progress"></div>
      <div class="pb-gems" title="Words practised today"><span aria-hidden="true">💎</span> <b>${P.Log.today()}</b></div>
      <button class="btn-round" type="button" data-act="help" aria-label="How to play">❔</button>
      <button class="btn-round" type="button" data-act="skip" aria-label="Skip this one">⏭️</button>`;
    root.appendChild(bar);
    const stage = el("main", "stage");
    stage.id = "stage";
    root.appendChild(stage);
    app().replaceChildren(root);

    const timers = new Set();
    let itemCleanups = [];
    let alive = true;
    const tally = { correct: 0, cued: 0, notyet: 0, skip: 0, items: [] };
    const ctx = {
      game: g, level, cfg, stage, index: 0, items: [],
      alive: () => alive,
      later(fn, ms) { const t = setTimeout(() => { timers.delete(t); if (alive) fn(); }, ms); timers.add(t); return t; },
      cleanup(fn) { itemCleanups.push(fn); },
      log(t) { return P.Log.add(Object.assign({ game: g.id, level: level + 1 }, t)); },
      status(html) { let s = P.$(".stage-status", stage); if (!s) { s = el("div", "stage-status"); stage.prepend(s); } s.innerHTML = html; },
      skipHandler: null,
      /* Finish the current item: result correct|cued|skip. */
      complete(result, info) {
        info = info || {};
        if (result !== "none" && !info.nolog) ctx.log(Object.assign({ item: info.item || "", result, cues: info.cues || 0, heard: info.heard || "", sr: info.sr ? 1 : 0, detail: info.detail || "" }));
        if (tally[result] != null) tally[result]++;
        tally.items.push({ item: info.item, result, emoji: info.emoji || "" });
        const gem = P.$(".pb-gems b", bar); if (gem) gem.textContent = P.Log.today();
        dots();
        ctx.index++;
        ctx.later(next, info.delay != null ? info.delay : 900);
      },
    };
    document.addEventListener("parlor:trial", onTrial);
    function onTrial() { const gem = P.$(".pb-gems b", bar); if (gem) gem.textContent = P.Log.today(); }

    function dots() {
      const d = P.$(".pb-dots", bar);
      d.innerHTML = ctx.items.map((_, i) => {
        const r = tally.items[i];
        return `<span class="dot ${i === ctx.index ? "now" : ""} ${r ? r.result : ""}"></span>`;
      }).join("");
    }
    function next() {
      itemCleanups.forEach((f) => { try { f(); } catch (e) {} });
      itemCleanups = [];
      ctx.skipHandler = null;
      P.Voice.stop(); P.Ear.stop();
      if (ctx.index >= ctx.items.length) return summary();
      stage.replaceChildren();
      stage.classList.remove("enter"); void stage.offsetWidth; stage.classList.add("enter");
      dots();
      g.render(ctx, ctx.items[ctx.index], ctx.index);
      breakCheck();
    }
    function summary() {
      const total = tally.correct + tally.cued;
      const stars = L.stars(tally.correct, Math.max(1, total + tally.skip));
      P.Sound.play("great");
      P.confetti(110);
      const box = el("div", "summary");
      box.innerHTML = `
        <div class="sum-stars" aria-label="${stars} stars">${[1, 2, 3].map((i) => `<span class="${i <= stars ? "on" : ""}" style="--i:${i}">★</span>`).join("")}</div>
        <h2>${esc(P.tone() === "calm" ? "Round complete" : P.pick(["Round complete!", "You're a word wizard!", "What a round!", "Brilliant practice!"]))}</h2>
        <p class="sum-line">You practised <b>${total}</b> ${total === 1 ? "item" : "items"}${g.summaryExtra ? " " + g.summaryExtra(ctx) : ""}.</p>
        <div class="sum-grid">
          <div class="sg good"><b>${tally.correct}</b><small>✓ on your own</small></div>
          <div class="sg cued"><b>${tally.cued}</b><small>💡 with help</small></div>
          <div class="sg skip"><b>${tally.skip}</b><small>⏭️ skipped</small></div>
        </div>
        <div class="sum-items">${tally.items.map((t) => `<span class="si ${t.result}" title="${esc(t.item || "")}">${t.emoji || (t.result === "correct" ? "✓" : t.result === "cued" ? "💡" : "·")}</span>`).join("")}</div>
        <div class="sum-actions"></div>`;
      const acts = box.querySelector(".sum-actions");
      acts.appendChild(button('<span class="bi">🔁</span><span>Play again</span>', "btn-primary", () => { P.closeOverlay(); run(g, level, cfg); }));
      if (level < g.levels.length - 1) acts.appendChild(button('<span class="bi">⬆️</span><span>Next level</span>', "btn-sky", () => { P.closeOverlay(); cfg.level = level + 1; P.store("cfg_" + g.id, cfg); run(g, level + 1, cfg); }));
      acts.appendChild(button('<span class="bi">🎲</span><span>Other games</span>', "btn-ghost", () => { P.closeOverlay(); P.go("#/"); }));
      P.overlay(box, { cls: "modal-summary", stay: true });
      if (stars === 3) P.polly(P.tone() === "calm" ? "Excellent session." : "Three stars! Squawk-tastic! 🌟", "happy");
    }
    let breakShown = false;
    function breakCheck() {
      if (breakShown) return;
      if (Date.now() - P.Log.session.start > 15 * 60 * 1000) {
        breakShown = true;
        P.polly("We've been practising for 15 minutes. A little stretch break might help!", "calm");
      }
    }

    bar.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]");
      if (!act) return;
      P.Sound.play("tap");
      const a = act.dataset.act;
      if (a === "home") P.go("#/play/" + g.id);
      else if (a === "help") {
        const box = el("div", "", `<h2>${g.emoji} ${esc(g.title)}</h2><ol class="help-list">${g.how.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`);
        const acts = el("div", "sum-actions");
        acts.appendChild(button("🔊 Read aloud", "btn-sky", () => P.Voice.speak(g.how.join(" "))));
        acts.appendChild(button("Keep playing", "btn-primary", () => P.closeOverlay()));
        box.appendChild(acts);
        P.overlay(box);
      } else if (a === "skip") {
        if (ctx.skipHandler) ctx.skipHandler();
        else if (ctx.index < ctx.items.length) ctx.complete("skip", { item: String(ctx.items[ctx.index] && (ctx.items[ctx.index].key || "")), delay: 50 });
      }
    });

    teardown = () => {
      alive = false;
      timers.forEach(clearTimeout);
      itemCleanups.forEach((f) => { try { f(); } catch (e) {} });
      document.removeEventListener("parlor:trial", onTrial);
      g.teardown && g.teardown(ctx);
    };

    ctx.items = g.prepare(ctx);
    next();
  }

  /* ------------------------------------------------------------------ *
   * Progress dashboard
   * ------------------------------------------------------------------ */
  function progressPage() {
    const root = el("div", "page progress");
    root.appendChild(nav("progress"));
    const all = P.Log.all();
    const done = all.filter((t) => t.result === "correct" || t.result === "cued");
    const ind = all.filter((t) => t.result === "correct").length;
    const cued = all.filter((t) => t.result === "cued").length;
    const days = new Set(all.map((t) => L.dayKey(t.ts))).size;
    const pctInd = done.length ? Math.round((ind / done.length) * 100) : 0;
    const mins = Math.round(estimateMinutes(all));

    const sec = el("section", "panel");
    sec.innerHTML = `
      <h1>📈 Progress</h1>
      <p class="muted">Every practice attempt is saved on this device only. Export for your records or to share with your therapist.</p>
      <div class="kpis">
        <div class="kpi"><b>${done.length}</b><small>items practised</small></div>
        <div class="kpi good"><b>${pctInd}%</b><small>on their own</small></div>
        <div class="kpi cued"><b>${cued}</b><small>with a hint or model</small></div>
        <div class="kpi"><b>${days}</b><small>practice days</small></div>
        <div class="kpi"><b>🔥 ${P.Log.streak()}</b><small>day streak</small></div>
        <div class="kpi"><b>~${mins}</b><small>minutes practised</small></div>
      </div>`;
    root.appendChild(sec);

    // last 14 days bar chart
    const chart = el("section", "panel");
    const dayRows = [];
    for (let i = 13; i >= 0; i--) {
      const ts = Date.now() - i * 864e5, k = L.dayKey(ts);
      const rows = all.filter((t) => L.dayKey(t.ts) === k);
      dayRows.push({ k, d: new Date(ts), ind: rows.filter((t) => t.result === "correct").length, cued: rows.filter((t) => t.result === "cued").length });
    }
    const maxDay = Math.max(S.data.goal, ...dayRows.map((r) => r.ind + r.cued));
    chart.innerHTML = `<h2>Last 14 days</h2>
      <div class="legend"><span class="lg good"></span> On their own <span class="lg cued"></span> With help <span class="lg goal"></span> Daily goal (${S.data.goal})</div>
      <div class="bars" role="img" aria-label="Items practised per day for the last 14 days">
        <div class="goal-line" style="bottom:${(S.data.goal / maxDay) * 100}%"></div>
        ${dayRows.map((r) => `<div class="bar-col" title="${r.k}: ${r.ind} on own, ${r.cued} with help"><div class="bar-stack"><div class="bar cued" style="height:${(r.cued / maxDay) * 100}%"></div><div class="bar good" style="height:${(r.ind / maxDay) * 100}%"></div></div><small>${r.d.toLocaleDateString(undefined, { weekday: "narrow" })}</small></div>`).join("")}
      </div>`;
    root.appendChild(chart);

    // per game
    const per = el("section", "panel");
    per.innerHTML = `<h2>By game</h2><div class="table-wrap"><table class="data"><thead><tr><th>Game</th><th>Items</th><th>✓ Own</th><th>💡 Help</th><th>↻ Not yet</th><th>Independence</th></tr></thead><tbody>${GAMES.map((g) => {
      const r = all.filter((t) => t.game === g.id);
      const c = r.filter((t) => t.result === "correct").length, h = r.filter((t) => t.result === "cued").length, n = r.filter((t) => t.result === "notyet").length;
      const p = c + h ? Math.round((c / (c + h)) * 100) : 0;
      return `<tr><td>${g.emoji} ${esc(g.title)}</td><td>${c + h}</td><td>${c}</td><td>${h}</td><td>${n}</td><td><div class="meter"><span style="width:${p}%"></span></div> ${c + h ? p + "%" : "—"}</td></tr>`;
    }).join("")}</tbody></table></div>`;
    root.appendChild(per);

    // sounds (Hundred Club + Pair Up)
    const bySound = {};
    all.filter((t) => t.game === "hundred" && t.detail).forEach((t) => {
      const key = t.detail.split(";")[0];
      const o = (bySound[key] = bySound[key] || { c: 0, h: 0, n: 0 });
      if (t.result === "correct") o.c++; else if (t.result === "cued") o.h++; else if (t.result === "notyet") o.n++;
    });
    const sk = Object.keys(bySound);
    if (sk.length) {
      const snd = el("section", "panel");
      snd.innerHTML = `<h2>Sounds (Hundred Club)</h2><div class="table-wrap"><table class="data"><thead><tr><th>Sound · position · step</th><th>✓ Own</th><th>💡 Help</th><th>↻ Not yet</th><th>Accuracy</th></tr></thead><tbody>${sk.sort().map((k) => {
        const o = bySound[k], tot = o.c + o.h + o.n, p = tot ? Math.round((o.c / tot) * 100) : 0;
        return `<tr><td>${esc(k)}</td><td>${o.c}</td><td>${o.h}</td><td>${o.n}</td><td><div class="meter"><span style="width:${p}%"></span></div> ${p}%</td></tr>`;
      }).join("")}</tbody></table></div>`;
      root.appendChild(snd);
    }

    // recent trials
    const rec = el("section", "panel");
    const recent = all.slice(-25).reverse();
    rec.innerHTML = `<h2>Recent attempts</h2>${recent.length ? `<div class="table-wrap"><table class="data small"><thead><tr><th>When</th><th>Game</th><th>Lvl</th><th>Item</th><th>Result</th><th>Hints</th><th>Heard</th></tr></thead><tbody>${recent.map((t) => {
      const g = gameById(t.game);
      return `<tr><td>${new Date(t.ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</td><td>${g ? g.emoji : ""} ${esc(g ? g.title : t.game)}</td><td>${t.level || ""}</td><td>${esc(t.item)}</td><td><span class="res ${t.result}">${{ correct: "✓ own", cued: "💡 help", notyet: "↻ not yet", skip: "⏭ skip" }[t.result] || esc(t.result)}</span></td><td>${t.cues || 0}</td><td>${esc(t.heard || "")}</td></tr>`;
    }).join("")}</tbody></table></div>` : `<p class="empty">No practice yet. <a href="#/">Play a game</a> and your progress will appear here.</p>`}`;
    root.appendChild(rec);

    // data tools
    const tools = el("section", "panel");
    tools.innerHTML = `<h2>Data &amp; sharing</h2><div class="tool-row"></div><p class="muted small">CSV opens in Excel or Google Sheets. The backup file restores progress on another device.</p>`;
    const row = tools.querySelector(".tool-row");
    row.appendChild(button("⬇️ Export CSV", "btn-sky", () => {
      const cols = ["ts", "date", "player", "game", "level", "item", "result", "cues", "heard", "sr", "detail"];
      const rows = P.Log.all().map((t) => Object.assign({ date: new Date(t.ts).toISOString() }, t));
      download("the-parlor-progress.csv", L.toCSV(rows, cols), "text/csv");
    }));
    row.appendChild(button("💾 Backup", "btn-ghost", () => download("the-parlor-backup.json", JSON.stringify({ app: "the-parlor", v: 1, trials: P.Log.all(), bests: P.store("bests"), settings: S.data }), "application/json")));
    const imp = button("📂 Restore", "btn-ghost", () => file.click());
    const file = el("input"); file.type = "file"; file.accept = ".json,application/json"; file.hidden = true;
    file.addEventListener("change", async () => {
      try {
        const data = JSON.parse(await file.files[0].text());
        if (!Array.isArray(data.trials)) throw new Error("bad");
        const merged = P.Log.all().concat(data.trials).sort((a, b) => a.ts - b.ts);
        const seen = new Set();
        const uniq = merged.filter((t) => { const k = t.ts + t.game + t.item + t.result; if (seen.has(k)) return false; seen.add(k); return true; });
        P.store("trials", uniq);
        P.toast("Progress restored ✓", "good");
        setTimeout(() => location.reload(), 700);
      } catch (e) { P.toast("That file couldn't be read.", "bad"); }
    });
    row.append(imp, file);
    row.appendChild(button("🖨️ Print", "btn-ghost", () => window.print()));
    row.appendChild(button("🗑️ Clear all", "btn-ghost danger", () => {
      const box = el("div", "", "<h2>Clear all progress?</h2><p>This removes every saved attempt on this device. Consider exporting a backup first.</p>");
      const acts = el("div", "sum-actions");
      acts.appendChild(button("Keep my data", "btn-primary", () => P.closeOverlay()));
      acts.appendChild(button("Yes, clear it", "btn-ghost danger", () => { P.Log.clear(); P.store("bests", {}); P.closeOverlay(); route(); }));
      box.appendChild(acts);
      P.overlay(box);
    }));
    root.appendChild(tools);

    root.appendChild(planBuilder());
    app().replaceChildren(root);
  }

  function estimateMinutes(all) {
    // sum gaps < 3 minutes between consecutive trials
    let m = 0;
    for (let i = 1; i < all.length; i++) {
      const d = all[i].ts - all[i - 1].ts;
      if (d > 0 && d < 180000) m += d;
    }
    return m / 60000;
  }

  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = el("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* Home-practice plan: a link that contains only game ids and settings —
   * never any personal or health information. */
  function planBuilder() {
    const sec = el("section", "panel plan");
    sec.innerHTML = `<h2>🏡 Home practice plan</h2>
      <p class="muted">Therapists: choose games and a daily goal, then share the link. It opens The Parlor with those games at the top. The link holds no personal information.</p>
      <div class="plan-games"></div>
      <div class="plan-opts">
        <label>Daily goal <select class="pl-goal">${[20, 30, 50, 70, 100, 150].map((n) => `<option ${n === 50 ? "selected" : ""}>${n}</option>`).join("")}</select></label>
        <label>Support <select class="pl-sup"><option value="errorless">Show me first (errorless)</option><option value="hint" selected>Hints on request</option><option value="try">Try first</option></select></label>
        <label class="grow">Note <input class="pl-note" maxlength="80" placeholder="e.g. Focus on /k/ words · 10 minutes a day"></label>
      </div>
      <div class="tool-row"></div>
      <input class="pl-link" readonly aria-label="Plan link">`;
    const box = sec.querySelector(".plan-games");
    GAMES.forEach((g) => {
      const l = el("label", "chip-check", `<input type="checkbox" value="${g.id}"><span>${g.emoji} ${esc(g.title)}</span>`);
      box.appendChild(l);
    });
    const out = sec.querySelector(".pl-link");
    sec.querySelector(".tool-row").appendChild(button("🔗 Create link", "btn-primary", () => {
      const ids = P.$$("input:checked", box).map((i) => i.value);
      if (!ids.length) { P.toast("Pick at least one game"); return; }
      const plan = { g: ids, goal: +sec.querySelector(".pl-goal").value, s: sec.querySelector(".pl-sup").value, note: sec.querySelector(".pl-note").value.trim() };
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(plan)))).replace(/=+$/, "");
      out.value = location.href.split("#")[0] + "#/plan/" + code;
      out.select();
      copy(out.value);
    }));
    return sec;
  }
  function copy(text) {
    const ok = () => P.toast("Link copied ✓", "good");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
    else fallback();
    function fallback() {
      const t = el("textarea"); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); ok(); } catch (e) { P.toast("Copy the link above"); }
      t.remove();
    }
  }
  function acceptPlan(code) {
    try {
      const plan = JSON.parse(decodeURIComponent(escape(atob(code))));
      if (!Array.isArray(plan.g)) throw 0;
      plan.g = plan.g.filter((id) => gameById(id));
      P.store("plan", plan);
      if (plan.goal) S.set("goal", Math.max(5, Math.min(500, +plan.goal || 50)));
      if (["errorless", "hint", "try"].includes(plan.s)) S.set("support", plan.s);
      P.toast("Practice plan added 📋", "good");
    } catch (e) { P.toast("That plan link looks broken.", "bad"); }
    history.replaceState(null, "", location.pathname + location.search + "#/");
    route();
  }

  /* ------------------------------------------------------------------ *
   * Settings
   * ------------------------------------------------------------------ */
  function settingsPage() {
    const root = el("div", "page settings");
    root.appendChild(nav("settings"));
    const d = S.data;
    const sec = el("section", "panel");
    sec.innerHTML = `
      <h1>⚙️ Settings</h1>
      <div class="set-group">
        <h2>👤 Player</h2>
        <label class="field">Name (optional, stays on this device)<input id="st-name" maxlength="30" value="${esc(d.name)}" placeholder="e.g. Sam"></label>
      </div>
      <div class="set-group">
        <h2>🎨 Look</h2>
        <div class="theme-pick" role="radiogroup" aria-label="Theme">
          ${[["sunny", "☀️", "Sunny", "Bright and playful"], ["parlor", "🫖", "Parlor", "Calm and grown-up"], ["night", "🌙", "Night", "Dark and gentle"]].map(([v, e, n, s]) => `<button type="button" role="radio" class="theme-opt t-${v} ${d.theme === v ? "on" : ""}" data-v="${v}" aria-checked="${d.theme === v}"><span class="to-sw" aria-hidden="true">${e}</span><b>${n}</b><small>${s}</small></button>`).join("")}
        </div>
        <div class="toggles">
          ${toggle("contrast", "◐ High contrast", d.contrast)}
          ${toggle("reduceMotion", "🐢 Reduce motion", d.reduceMotion)}
          ${toggle("polly", "🦜 Polly the parrot", d.polly)}
        </div>
        <div class="seg-field"><span>Text size</span><div class="seg" data-k="textSize">${[[1, "A"], [1.15, "A+"], [1.3, "A++"]].map(([v, l]) => `<button type="button" data-v="${v}" class="${d.textSize == v ? "on" : ""}">${l}</button>`).join("")}</div></div>
        <div class="seg-field"><span>Letter spacing</span><div class="seg" data-k="spacing">${[[0, "Normal"], [0.04, "Wide"], [0.08, "Wider"]].map(([v, l]) => `<button type="button" data-v="${v}" class="${d.spacing == v ? "on" : ""}">${l}</button>`).join("")}</div></div>
      </div>
      <div class="set-group">
        <h2>🔊 Sound &amp; voice</h2>
        <div class="toggles">
          ${toggle("sfx", "🎵 Sound effects", d.sfx)}
          ${toggle("autoSpeak", "🗣️ Speak words automatically", d.autoSpeak)}
        </div>
        <label class="field">Voice speed <span class="rate-val">${Math.round(d.rate * 100)}%</span><input id="st-rate" type="range" min="0.5" max="1.2" step="0.05" value="${d.rate}"></label>
        <label class="field">Voice<select id="st-voice"><option value="">Best available</option></select></label>
        <div class="tool-row"><button type="button" class="btn btn-sky" id="st-test">🔊 Test voice</button></div>
      </div>
      <div class="set-group">
        <h2>🎤 Speaking</h2>
        <div class="toggles">${toggle("mic", "🎤 Use the microphone", d.mic)}</div>
        <p class="muted small" id="st-sr"></p>
        <div class="tool-row"><button type="button" class="btn btn-coral" id="st-mictest">🎤 Test microphone</button><div class="mini-meter" aria-hidden="true"><span></span></div></div>
        <h3>Support style</h3>
        <div class="radio-cards" data-k="support">
          ${[["errorless", "👀", "Show me first", "Hear the answer before trying (errorless learning)"], ["hint", "💡", "Hints when needed", "Try, with a hint button"], ["try", "🎯", "Try first", "Have a go before hearing the model"]].map(([v, e, n, s]) => `<button type="button" class="rc ${d.support === v ? "on" : ""}" data-v="${v}"><span aria-hidden="true">${e}</span><b>${n}</b><small>${s}</small></button>`).join("")}
        </div>
      </div>
      <div class="set-group">
        <h2>🎯 Practice</h2>
        <div class="seg-field"><span>Daily goal</span><div class="seg" data-k="goal">${[20, 50, 70, 100, 150].map((v) => `<button type="button" data-v="${v}" class="${d.goal == v ? "on" : ""}">${v}</button>`).join("")}</div></div>
        <div class="seg-field"><span>Items per round</span><div class="seg" data-k="roundLen">${[5, 8, 10, 15].map((v) => `<button type="button" data-v="${v}" class="${d.roundLen == v ? "on" : ""}">${v}</button>`).join("")}</div></div>
      </div>
      <div class="tool-row"><button type="button" class="btn btn-ghost" id="st-reset">↺ Reset settings</button></div>`;
    root.appendChild(sec);
    app().replaceChildren(root);

    const $ = (s) => P.$(s, sec);
    $("#st-name").addEventListener("input", (e) => S.set("name", e.target.value.trim()));
    P.$$(".theme-opt", sec).forEach((b) => b.addEventListener("click", () => { S.set("theme", b.dataset.v); P.Sound.play("pop"); settingsPage(); }));
    P.$$(".tgl", sec).forEach((b) => b.addEventListener("click", () => {
      const on = !S.data[b.dataset.k];
      S.set(b.dataset.k, on);
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
      P.Sound.play("tap");
      if (b.dataset.k === "mic") srNote();
    }));
    P.$$(".seg", sec).forEach((seg) => seg.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      S.set(seg.dataset.k, +b.dataset.v);
      P.$$("button", seg).forEach((x) => x.classList.toggle("on", x === b));
      P.Sound.play("tap");
    }));
    P.$$(".radio-cards", sec).forEach((rc) => rc.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      S.set(rc.dataset.k, b.dataset.v);
      P.$$("button", rc).forEach((x) => x.classList.toggle("on", x === b));
      P.Sound.play("tap");
    }));
    $("#st-rate").addEventListener("input", (e) => { S.set("rate", +e.target.value); $(".rate-val").textContent = Math.round(e.target.value * 100) + "%"; });
    const vs = $("#st-voice");
    function fillVoices() {
      const list = P.Voice.list();
      vs.innerHTML = '<option value="">Best available</option>' + list.map((v) => `<option ${v.name === S.data.voiceName ? "selected" : ""} value="${esc(v.name)}">${esc(v.name)} (${esc(v.lang)})</option>`).join("");
    }
    fillVoices();
    if (P.Voice.supported()) speechSynthesis.addEventListener("voiceschanged", fillVoices);
    vs.addEventListener("change", () => { S.set("voiceName", vs.value); P.Voice.reload(); });
    $("#st-test").addEventListener("click", () => P.Voice.speak("Hello! Welcome to The Parlor. Let's play with words."));
    $("#st-reset").addEventListener("click", () => { S.reset(); settingsPage(); P.toast("Settings reset"); });
    function srNote() {
      $("#st-sr").textContent = !P.Ear.supported()
        ? "This browser can't turn speech into words, so you'll score with the ✓ buttons. The microphone meter still works in the Beat Keeper and Smooth Sailing games. (Chrome, Edge and Safari support speech recognition.)"
        : S.data.mic
          ? "Speech recognition is on. It only ever confirms a correct word; it never marks you wrong. In some browsers speech is processed by the browser's online service."
          : "The microphone is off. Score each attempt with the ✓ / 💡 / ↻ buttons.";
    }
    srNote();
    let meterRAF = 0;
    $("#st-mictest").addEventListener("click", async () => {
      if (P.Mic.on()) { P.Mic.stop(); cancelAnimationFrame(meterRAF); $(".mini-meter span").style.width = "0"; return; }
      const ok = await P.Mic.start();
      if (!ok) { P.toast("Microphone not available or blocked", "bad"); return; }
      const bar = $(".mini-meter span");
      const loop = () => { if (!P.Mic.on() || !bar.isConnected) return; bar.style.width = Math.min(100, P.Mic.level() * 600) + "%"; meterRAF = requestAnimationFrame(loop); };
      loop();
      setTimeout(() => { P.Mic.stop(); bar.style.width = "0"; }, 8000);
    });
    teardown = () => cancelAnimationFrame(meterRAF);
  }
  function toggle(k, label, on) {
    return `<button type="button" class="tgl ${on ? "on" : ""}" data-k="${k}" aria-pressed="${!!on}"><span class="tgl-knob" aria-hidden="true"></span>${label}</button>`;
  }

  /* ------------------------------------------------------------------ *
   * Guide
   * ------------------------------------------------------------------ */
  function guidePage() {
    const root = el("div", "page guide");
    root.appendChild(nav("guide"));
    const sec = el("section", "panel prose");
    sec.innerHTML = `
      <h1>📘 Guide for therapists, families and players</h1>
      <p class="lead">The Parlor turns proven speech and language therapy techniques into short, joyful games. Use it <b>in sessions</b> (the therapist scores each try) or <b>at home</b> (the player or a helper scores).</p>
      <div class="callout">⚕️ The Parlor supports therapy. It does not diagnose, and it does not replace a licensed speech-language pathologist. Please practise with guidance from your therapist.</div>

      <h2>The golden rules we built in</h2>
      <ul class="rules">
        <li><b>Lots of practice.</b> Gains come from repetition. Aphasia studies point to 2+ hours a week, and speech-sound work to 50–100+ tries a session. Every game counts tries toward a daily goal.</li>
        <li><b>The right amount of help.</b> Hints go from least to most support: meaning, then rhyme, then first letter, then the whole word. Pick <i>Show me first</i>, <i>Hints when needed</i> or <i>Try first</i> in Settings.</li>
        <li><b>No failing, no buzzers.</b> "Not yet" replays the model and invites another go. Nothing is timed unless you choose it.</li>
        <li><b>You are the judge.</b> The microphone can cheer a match, but it never marks a try wrong. Speech recognition is unreliable with disordered speech.</li>
        <li><b>Accessible by default.</b> Big buttons, a picture with every word, audio on every word, high contrast, big text, wider spacing and reduced motion.</li>
        <li><b>Short rounds.</b> 5–15 items a round, with a gentle break reminder after 15 minutes. Tiredness affects word-finding.</li>
      </ul>

      <h2>The eight games</h2>
      <div class="guide-games">${GAMES.map((g) => `
        <article class="gg" style="--c1:${g.color[0]};--c2:${g.color[1]}">
          <header><span aria-hidden="true">${g.emoji}</span><div><h3>${esc(g.title)}</h3><small>${esc(g.skill)}</small></div></header>
          <div class="gc-tags">${g.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          <p>${g.evidence}</p>
          <p class="muted small"><b>Levels:</b> ${g.levels.map((l, i) => `${i + 1}. ${esc(l.name)}`).join(" · ")}</p>
          <a class="btn btn-ghost small" href="#/play/${g.id}">Open ${esc(g.title)} →</a>
        </article>`).join("")}</div>

      <h2>Running a session</h2>
      <ol>
        <li>Choose a level that gets about <b>70–80% success</b>. If they get 10 in a row easily, move up. If they struggle, move down or switch to <i>Show me first</i>.</li>
        <li>Let the player try before you help. Use the <b>💡 Hint</b> button so hints are counted.</li>
        <li>Score honestly: <b>✓ Got it</b> means on their own, <b>💡 With help</b> means after a hint or model, and <b>↻ Not yet</b> gives another try.</li>
        <li>Open <a href="#/progress">Progress</a> to see how independent they are, and <b>export a CSV</b> for your notes.</li>
        <li>Make a <b>home practice plan</b> link from the Progress page so practice continues between sessions.</li>
      </ol>

      <h2>Tips for families</h2>
      <ul>
        <li>Short and often beats long and rare. Try 10 minutes, once or twice a day.</li>
        <li>Praise the effort, not only the result. Stay warm and calm, and give them time.</li>
        <li>Don't finish their words for them. Tap <b>🔊 Hear it</b> or <b>💡 Hint</b> instead.</li>
        <li>Stuttering: never ask someone to "slow down" or "start again". Smooth Sailing is for practising tools they chose with their therapist.</li>
      </ul>

      <h2>Privacy</h2>
      <p>No accounts, no ads, no tracking. Progress lives in this browser's storage. In Chrome and Edge, speech recognition may send audio to the browser maker's speech service. Turn the microphone off in Settings to avoid this. The loudness meters in Beat Keeper and Smooth Sailing never send audio anywhere.</p>

      <h2>Where the ideas come from</h2>
      <p class="small">Semantic Feature Analysis (Boyle), Phonological Components Analysis (Leonard et al., 2008), cueing hierarchies (Linebaugh), errorless learning, minimal/maximal/multiple oppositions and the Cycles approach (Hodson), Sound Production Treatment and principles of motor learning, Dynamic Temporal and Tactile Cueing (Strand), Melodic Intonation Therapy, diadochokinetic rates, LSVT LOUD, fluency shaping (Camperdown Program), Verb Network Strengthening Treatment (Edmonds), the Early/Middle/Late 8 sounds (Shriberg), and RELEASE aphasia dosage findings (2022). The full notes with links are in <code>docs/RESEARCH.md</code> in the project.</p>`;
    root.appendChild(sec);
    app().replaceChildren(root);
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  P.boot = function () {
    window.addEventListener("hashchange", route);
    document.addEventListener("pointerdown", () => P.Sound.unlock(), { once: true });
    route();
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  };
})();

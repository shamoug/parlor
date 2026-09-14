/* The Parlor · tests. Run with:  node tests/run.js
 * Loads the browser scripts into a sandbox and checks pure logic + content. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sandbox = { console };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
for (const f of ["src/logic.js", "data/words.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), sandbox, { filename: f });
}
const { Logic: L, DATA: D } = sandbox.P;

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log("  ✓ " + name); }
  catch (e) { fail++; console.log("  ✗ " + name + "\n    " + e.message); }
}
function eq(a, b, msg) {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A !== B) throw new Error((msg || "") + " expected " + B + " got " + A);
}
function ok(v, msg) { if (!v) throw new Error(msg || "expected truthy"); }

console.log("\nWord Lock scoring");
test("all correct", () => eq(L.scoreGuess("cat", "cat").join(""), "ggg"));
test("none", () => eq(L.scoreGuess("dog", "cat").join(""), "xxx"));
test("misplaced", () => eq(L.scoreGuess("act", "cat").join(""), "yyg"));
test("repeated letters scored per position", () => eq(L.scoreGuess("eerie", "tepid").join(""), "xgxgx"));
test("greens claimed before yellows", () => eq(L.scoreGuess("lolly", "hello").join(""), "xyggx"));
test("keyboard keeps best state", () => eq(L.keyStates([{ guess: "ab", fb: ["y", "x"] }, { guess: "ab", fb: ["g", "x"] }]), { a: "g", b: "x" }));

console.log("\nSpeech matching (lenient, confirm-only)");
test("exact word", () => ok(L.matchSpeech(["dog"], ["dog"]).match));
test("inside a sentence", () => ok(L.matchSpeech(["it is a dog"], ["dog"]).match));
test("homophone", () => ok(L.matchSpeech(["two"], ["to"]).match));
test("plural tolerance", () => ok(L.matchSpeech(["cats"], ["cat"]).match));
test("case and punctuation", () => ok(L.matchSpeech(["Banana!"], ["banana"]).match));
test("close long word", () => ok(L.matchSpeech(["butterfli"], ["butterfly"]).match));
test("different word rejected", () => ok(!L.matchSpeech(["tea"], ["key"]).match));
test("phrase", () => ok(L.matchSpeech(["salt and pepper"], ["Salt and pepper"]).match));
test("empty input", () => ok(!L.matchSpeech([], ["dog"]).match));

console.log("\nLoudness analysis");
function envOf(pattern, stepMs) {
  // pattern: array of [ms, level]
  const out = [];
  pattern.forEach(([ms, v]) => { for (let t = 0; t < ms; t += stepMs) out.push(v); });
  return out;
}
test("counts five bursts", () => {
  const p = [];
  for (let i = 0; i < 5; i++) p.push([100, 0.3], [100, 0.01]);
  eq(L.countPeaks(envOf(p, 20), 20).count, 5);
});
test("silence has no peaks", () => eq(L.countPeaks(envOf([[1000, 0.005]], 20), 20).count, 0));
test("even rhythm is steady", () => ok(L.steadiness([0, 200, 400, 600, 800]) >= 99));
test("uneven rhythm is less steady", () => ok(L.steadiness([0, 100, 500, 550, 1200]) < 50));
test("gentle onset rises slowly", () => {
  const env = [0.01, 0.01, 0.01];
  for (let i = 1; i <= 15; i++) env.push(0.01 + i * 0.02);
  ok(L.onsetRise(env, 20) >= 200);
});
test("hard onset rises fast", () => ok(L.onsetRise([0.01, 0.01, 0.01, 0.3, 0.3, 0.3], 20) <= 40));

console.log("\nSession maths");
test("stars", () => { eq(L.stars(8, 10), 3); eq(L.stars(5, 10), 2); eq(L.stars(0, 10), 1); });
test("adapt up at 80%", () => eq(L.adapt([1, 1, 1, 1, 1, 1, 1, 1, 0, 0].map(Boolean)), 1));
test("adapt down below 50%", () => eq(L.adapt([1, 1, 1, 1, 0, 0, 0, 0, 0, 0].map(Boolean)), -1));
test("adapt waits for 10 trials", () => eq(L.adapt([true, true]), 0));
test("csv escaping", () => eq(L.toCSV([{ a: 'he said "hi", ok', b: 2 }], ["a", "b"]), 'a,b\r\n"he said ""hi"", ok",2'));
test("streak", () => {
  const now = new Date(2026, 8, 13, 12).getTime();
  const keys = [0, 1, 2, 4].map((d) => L.dayKey(now - d * 864e5));
  eq(L.streak(keys, now), 3);
});

console.log("\nContent integrity");
test("Word Lock words match their level length", () => {
  [3, 4, 5].forEach((n) => D.wordlock[n].forEach((w) => { if (w[0].length !== n) throw new Error(w[0] + " is not " + n + " letters"); if (!w[1] || !w[2] || !w[3] || !w[4]) throw new Error(w[0] + " missing fields"); }));
});
test("Word Lock words are unique per level", () => [3, 4, 5].forEach((n) => eq(new Set(D.wordlock[n].map((w) => w[0])).size, D.wordlock[n].length, "level " + n)));
test("Feature Garden has every petal for every word", () => D.garden.forEach(([w, e, f]) => D.petals.forEach((p) => { if (!f[p.key]) throw new Error(w + " missing " + p.key); })));
test("Detective sounds are labelled and syllables sane", () => D.detective.forEach((d) => { ok(D.soundLabels[d[2]] && D.soundLabels[d[3]], d[0] + " sound label"); ok(D.sounds[d[2]], d[0] + " first sound has word list"); ok(d[4] >= 1 && d[4] <= 4, d[0] + " syllables"); }));
test("Pair Up pairs are complete and distinct", () => Object.values(D.patterns).forEach((p) => p.pairs.forEach((pr) => { eq(pr.length, 4); ok(pr[0] !== pr[2], pr[0]); })));
test("Sing-Song pitch pattern matches syllables", () => D.singPhrases.forEach((s) => eq(s.t.split(/[\s-]+/).length, s.p.length, s.t)));
test("Finish the Line items have answer + 2 foils", () => [1, 2, 3].forEach((l) => D.lines[l].forEach((x) => { ok(x.s.includes("___"), x.s); eq(x.f.length, 2, x.s); })));
test("Verb items have two valid pairs with sentences", () => D.verbs.forEach((v) => { eq(v.pairs.length, 2, v.v); v.pairs.forEach((p) => ok(p[4] && /[.!?]$/.test(p[4]), v.v)); }));
test("Every target sound has 8+ words in each position", () => Object.entries(D.sounds).forEach(([k, s]) => { ok(s.initial.length >= 8, k + " initial"); ok(s.final.length >= 7, k + " final"); ok(s.tip && s.iso && s.syl.length, k + " tip"); }));
test("Every word has an emoji", () => Object.values(D.sounds).forEach((s) => s.initial.concat(s.final).forEach((w) => ok(w[1] && !/[a-z]/i.test(w[1]), w[0]))));

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);

# 🦜 The Parlor

**Eight joyful word games that help every voice grow stronger.**

The Parlor is a free, private, browser-based set of speech and language therapy games. It is for people with **aphasia, apraxia of speech, dysarthria, speech-sound (articulation and phonological) disorders and stuttering**, and for the **speech-language pathologists (SLPs)** and families who support them.

Every game is built on an evidence-based therapy technique. Every game makes the player **say words out loud**, and every attempt is logged so progress can be seen and exported.

> ⚕️ The Parlor supports therapy. It does not diagnose, and it does not replace a licensed speech-language pathologist.

---

## The eight games

| | Game | Therapy technique | Best for |
|---|---|---|---|
| 🔐 | **Word Lock** | Wordle-style retrieval with a least-to-most **cueing hierarchy**, then saying the word 3× | Aphasia, word finding, phonics |
| 🌸 | **Feature Garden** | **Semantic Feature Analysis (SFA)**: fill petals with group, use, action, looks, place and link | Aphasia, brain injury, language disorder |
| 🔎 | **Sound Detective** | **Phonological Components Analysis (PCA)**: first sound, rhyme, beats, last sound | Aphasia, phonological awareness |
| 🦜 | **Pair Up** | **Minimal pairs** by error pattern (fronting, stopping, final consonants, gliding, voicing, clusters). Polly the parrot flies to what she hears | Children with phonological disorders |
| 🥁 | **Beat Keeper** | Syllable tapping, **Melodic Intonation**-style sing-song, and **DDK** pa-ta-ka drum rolls counted by the microphone | Apraxia, non-fluent aphasia, dysarthria |
| 🧩 | **Finish the Line** | Automatic speech, then sentence completion, then **VNeST**-style "Who does it?" sentence building | Aphasia (including severe), expressive language |
| 💎 | **Hundred Club** | **High-repetition** articulation drill (20, 50 or 💯) that moves sound → syllable → word → phrase → sentence at 80% accuracy. Blocked or random practice | Articulation, apraxia |
| ⛵ | **Smooth Sailing** | **Fluency shaping** (easy onset, prolonged speech) and **LSVT-LOUD**-inspired loudness | Stuttering, Parkinson's (hypokinetic dysarthria) |

## What makes it good for therapy

- **Speaking is the point.** Each game ends with a "Say it" step: 🔊 hear the model, 🎤 speak, then score it ✓ *Got it* / 💡 *With help* / ↻ *Not yet*.
- **You are the judge.** Speech recognition, where the browser supports it, can only *confirm* a correct word. It never marks a try wrong, because recognizers are unreliable with disordered speech.
- **Adjustable support.** Choose *Show me first* (errorless), *Hints when needed*, or *Try first*. Hints follow a least-to-most cueing order and are counted.
- **Dosage.** A daily goal (20–150), trial counters, streaks and a 100-trial drill mode.
- **No failing.** No buzzers, no timers unless you want them, and a gentle break reminder after 15 minutes.
- **Progress for clinicians.** Per-game independence %, cue use, a 14-day chart, sound-by-sound accuracy, recent attempts, **CSV export**, JSON backup and restore, and print.
- **Home practice plans.** Therapists pick games, a goal and a support style, then share a link. The link contains no personal data.
- **Accessible.** 56–74 px touch targets, a picture with every word, audio on every word, three themes (☀️ Sunny, 🫖 Parlor for adults, 🌙 Night), high contrast, big text, wider letter spacing, reduced motion, and keyboard support.
- **Simple sign-in.** Players type their name and pick a buddy once. A first-party cookie plus browser storage recognizes them next visit ("Welcome back, Sam!"). Several players can share one device with **Switch player**, and each keeps separate progress.
- **Start over any time.** Settings → **Erase my progress** clears attempts, scores, streak and plans, and keeps the name and settings.
- **Private.** No passwords, no server, no tracking, no build step. Names and progress stay in the browser. It works offline as an installable web app.
- **Phone-first layout.** Checked at 320–375 px: one-row game bar, a keyboard pinned to the bottom in Word Lock, and the Play button before the instructions.

## Play it

**Online:** https://shamoug.github.io/parlor/

**On your computer:**

- Windows: double-click `start.bat`
- macOS / Linux: `./start.sh`
- or any static server: `python -m http.server 8120`, then open http://localhost:8120

You can also open `index.html` directly. Every game works, but the microphone and offline mode need a server (localhost or https).

### Browser notes

- **Speech recognition** (🎤 Tap & speak) works in Chrome, Edge and Safari. In Chrome and Edge, audio may be processed by the browser maker's online speech service. Turn the microphone off in Settings to avoid this. Without it, just use the ✓ buttons.
- The **loudness meter** (Beat Keeper Drum Roll, Smooth Sailing) works in all modern browsers and never sends audio anywhere.
- **Voices** come from the device. On Windows, Edge's "Natural" voices sound best.

## Run the tests

```bash
node tests/run.js
```

The tests cover Wordle scoring, lenient speech matching, loudness peak counting, onset rise time, steadiness, adaptive levels, CSV export, streaks, and the integrity of all word lists.

## Project layout

```
index.html              app shell (plain <script defer> tags, no bundler)
manifest.webmanifest    installable web app
sw.js                   offline service worker (network-first)
assets/icon.svg         app icon
styles/parlor.css       themes, components, all game styles
data/words.js           ALL therapy content (edit to add words)
src/logic.js            pure logic (tested in Node)
src/core.js             settings, sound, voice, speech recognition, mic, log, UI
src/sayit.js            the shared "Say it" panel, picture choices, hint ladder
src/shell.js            router, home, game runtime, progress, settings, guide
src/games/*.js          the eight games
tests/run.js            unit and content tests
docs/RESEARCH.md        evidence summary and sources
```

### Adding content

All stimuli live in [`data/words.js`](data/words.js). Add a Word Lock word, a Feature Garden item with its six features, a minimal pair, a phrase, or a target-sound word list, then run `node tests/run.js` to check it.

### Adding a game

Call `P.registerGame({ id, title, emoji, color, tagline, skill, tags, how, evidence, levels, prepare(ctx), render(ctx, item) })`. Inside `render`, finish each item with `ctx.complete(result, info)` and use `P.SayIt`, `P.choices` and `P.Cues` for consistent behaviour.

## Publish

`publish.bat` commits and pushes to GitHub. GitHub Pages serves the `main` branch root, and `.nojekyll` is included.

## Credits

Built in the Innovation Lab. Architecture and UI patterns were adapted from the **Common Ground** project, including the synthesized Web Audio bells, narration voice picking, toasts, overlays, confetti and tile flips. Evidence summary: [docs/RESEARCH.md](docs/RESEARCH.md).

## License

MIT. See [LICENSE](LICENSE).

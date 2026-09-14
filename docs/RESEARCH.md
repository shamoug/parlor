# The Parlor: evidence and design notes

This note summarizes the research behind The Parlor's design. It is a practical design brief, not a systematic review. Clinicians should use their own judgement and current guidance.

## 1. Techniques turned into games

| Technique | What it trains | Population | In The Parlor |
|---|---|---|---|
| **Semantic Feature Analysis (SFA)** | Word retrieval through meaning features (group, use, action, properties, location, association) | Aphasia (anomia). A 2018 JSLHR systematic review (21 studies) found treated-word naming gains for most participants [1][2] | 🌸 Feature Garden |
| **Phonological Components Analysis (PCA)** | Retrieval through sound: first sound, rhyme, first-sound associate, last sound, syllables | Aphasia. 7 of 10 participants improved, with some generalization (Leonard et al., 2008) [3][4] | 🔎 Sound Detective |
| **Cueing hierarchy** | Retrieval with fading support. Least-to-most: semantic, then rhyme, then orthographic, then phonemic, then model | Aphasia, apraxia of speech [5][6] | 🔐 Word Lock *Hint* ladder. Every hint is counted |
| **Errorless vs. retrieval practice** | Errorless: model first. Retrieval: try first. Both work; clients often prefer errorless | Aphasia, cognitive-communication [7] | Settings → *Show me first / Hints / Try first* |
| **Minimal, maximal and multiple oppositions** | Meaning-changing sound contrasts | Children with phonological disorders [8] | 🦜 Pair Up (six error patterns) |
| **Cycles approach** (Hodson) | Patterns targeted in cycles; listening before production | Highly unintelligible children [9] | Pair Up: listening level, then speaking levels |
| **Sound Production Treatment and principles of motor learning** | Accurate production with high practice. Blocked then random practice; many trials | Acquired apraxia of speech [10] | 💎 Hundred Club (blocked/random, 20–100 trials) |
| **Dynamic Temporal and Tactile Cueing (DTTC)** | Unison, then immediate repetition, then independent production | Childhood apraxia of speech [11] | "Say it with me" on every Say-it panel; Sing-Song stepper |
| **Melodic Intonation Therapy (MIT)** | Phrases intoned on two pitches with hand tapping; support fades | Non-fluent aphasia, apraxia [12] | 🥁 Beat Keeper Sing-Song |
| **Diadochokinetic (DDK) rates** | Speed and regularity of pa, ta, ka and pa-ta-ka | Dysarthria, apraxia [13] | 🥁 Beat Keeper Drum Roll (practice feedback only) |
| **LSVT LOUD** | Loudness through a single "think loud" focus and high effort | Hypokinetic dysarthria (Parkinson's) [14] | ⛵ Smooth Sailing, Loud & Proud |
| **Fluency shaping** (easy onset, prolonged speech; Camperdown) | Gentle onsets, slow continuous speech, self-rating | Adolescents and adults who stutter [15][16] | ⛵ Smooth Sailing, Easy Start and Stretch |
| **Sentence completion and automatic speech** | Retrieval with strong context | Aphasia, including severe | 🧩 Finish the Line, levels 1–3 |
| **Verb Network Strengthening Treatment (VNeST)** | Agents and patients around a verb; generalizes to untrained sentences | Moderate aphasia [17] | 🧩 Finish the Line, level 4 |

### Dosage

- **Aphasia:** best outcomes with at least 20 hours in total, about 2 or more hours a week (RELEASE, 2022) [18].
- **Speech-sound disorders:** aim for 50–100+ trials a session. Motor-based work: 100–150 [19].
- **In The Parlor:** a daily goal (20–150), trial counters, a 💯 mode and short rounds.

## 2. Speech recognition policy

- Automatic speech recognition error rates on aphasic speech are high (37% or more) [20]. The Parlor **never marks a spoken attempt wrong from recognition**. It only confirms a match. The player, caregiver or clinician always scores.
- Matching is lenient: homophones, plurals, articles, and fuzzy similarity for longer words.
- Support differs by browser (Chrome and Edge `webkitSpeechRecognition`, Safari 14.5+; Firefox off) [21]. Everything works without it.
- Loudness-based features (onset rise time, peaks, hold duration) use the Web Audio `AnalyserNode` locally. They are labelled as practice feedback, not clinical measurement.

## 3. Accessibility decisions

- Large targets (56–74 px) and generous spacing for motor and visual needs after stroke. Colour is never the only signal: Wordle tiles also show ✓ and ↔.
- Clear sans-serif type (Atkinson Hyperlegible). "Dyslexia fonts" show no reading benefit, but **extra letter and word spacing** can help [25], so there is a spacing setting.
- Audio on every word and prompt, adjustable voice speed, auto-speak toggle.
- No time pressure by default, no buzzers, neutral "Not yet" wording, warm and specific praise.
- Short rounds and a 15-minute break reminder, because fatigue affects naming in aphasia [26].
- A calm, adult "Parlor" theme alongside a playful theme, so adults aren't given childish visuals [24].
- High contrast, reduced motion (respects the OS setting), big text.

## 4. Stimulus selection

- **Aphasia:** high-frequency, highly imageable, early-acquired nouns with high name agreement [29][30]. Emoji with ambiguous names are avoided or given accepted alternatives.
- **Speech sounds:** tagged by **phoneme**, not spelling. Word lists are organised by Shriberg's Early, Middle and Late 8 [28], with initial and final positions and mostly simple word shapes.
- Minimal pairs are grouped by phonological process so a clinician can target one pattern at a time.

## Sources

1. SFA systematic review, JSLHR 2018: https://pubmed.ncbi.nlm.nih.gov/29710193/
2. SFA evidence-based systematic review: https://www.sciencedirect.com/science/article/pii/S1877065714000451
3. Leonard, Rochon & Laird 2008, PCA: https://www.tandfonline.com/doi/abs/10.1080/02687030701831474
4. Tactus Therapy, PCA: https://tactustherapy.com/pca-phonological-components-analysis-aphasia/
5. Tactus Therapy, cueing hierarchy: https://tactustherapy.com/cueing-hierarchy-word-finding-aphasia/
6. ASHA Practice Portal, Aphasia: https://www.asha.org/practice-portal/clinical-topics/aphasia/
7. Errorless, errorful and retrieval practice scoping review: https://pmc.ncbi.nlm.nih.gov/articles/PMC10023178/
8. Minimal, maximal and multiple oppositions, LSHSS 2021: https://pubs.asha.org/doi/10.1044/2021_LSHSS-21-00105
9. Cycles approach (Bowen): https://www.speech-language-therapy.com/index.php?option=com_content&view=article&id=75%3Acycles&catid=11%3Aadmin
10. SPT dosage, AJSLP 2020: https://pubs.asha.org/doi/10.1044/2020_AJSLP-19-00110
11. DTTC for childhood apraxia, JSLHR 2024: https://pubs.asha.org/doi/10.1044/2024_JSLHR-23-00415
12. MIT meta-analysis: https://pmc.ncbi.nlm.nih.gov/articles/PMC8371046/
13. DDK rates in normal and dysarthric speakers: https://pubs.asha.org/doi/10.1044/jshd.4703.324
14. LSVT LOUD: https://pmc.ncbi.nlm.nih.gov/articles/PMC7952622/
15. Adult stuttering interventions review: https://www.sciencedirect.com/science/article/abs/pii/S0094730X20300218
16. Camperdown Program treatment guide: https://www.uts.edu.au/globalassets/sites/default/files/2019-10/camperdown-program-treatment-guide-june-2018.pdf
17. VNeST, AJSLP: https://pubs.asha.org/doi/10.1044/2014_AJSLP-13-0098
18. RELEASE dosage meta-analysis, Stroke 2022: https://www.ahajournals.org/doi/10.1161/STROKEAHA.121.035216
19. High trial counts for speech-sound disorders: https://pmc.ncbi.nlm.nih.gov/articles/PMC10208915/
20. ASR on aphasic speech: https://arxiv.org/pdf/2408.14082
21. MDN, SpeechRecognition: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
22. ASHA, fluency disorders: https://www.asha.org/practice-portal/clinical-topics/fluency-disorders/
23. Stroke Association, accessible information guidelines: https://www.stroke.org.uk/sites/default/files/accessible_information_guidelines.pdf1_.pdf
24. UI/UX requirements for young stroke survivors: https://pmc.ncbi.nlm.nih.gov/articles/PMC12241351/
25. OpenDyslexic reading study: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5629233/
26. Fatigue and word production in aphasia: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11310858/
27. Constant Therapy clinician dashboard: https://constanttherapyhealth.com/brainwire/constant-therapy-clinician-web-dashboard-guide/
28. Early, Middle and Late 8 sounds, AJSLP: https://pubs.asha.org/doi/10.1044/1058-0360(2009/08-0036)
29. Stimulus variables in anomia treatment: https://pmc.ncbi.nlm.nih.gov/articles/PMC9927625/
30. Name agreement in aphasia: https://www.tandfonline.com/doi/full/10.1080/02687038.2016.1254148

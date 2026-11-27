# Why games make people keep playing: research notes for a short turn-based browser puzzle game

Compiled 2026-11-12. Every source in the list at the bottom was opened, and quotes and numbers come from those pages. Where only an abstract was available (most journal papers, read through the Europe PMC API), the note says "abstract only". **[UNVERIFIED]** marks a claim I did not confirm in a primary page.

Evidence strength scale: **A** = experiments or meta-analysis, replicated. **B** = one or a few experiments, or strong correlational work. **C** = theory or designer framework with little direct testing. **D** = folk claim or pop science.

---

## 1. Self-Determination Theory: competence, autonomy, relatedness (strength: B)

**Claim.** People are pulled into a game, and want to play it again, to the extent that it satisfies the basic needs for competence (feeling effective and optimally challenged) and autonomy (choice and volition). In social games, relatedness also matters. Intuitive controls and "presence" work through these needs.

**Evidence: Ryan, Rigby & Przybylski (2006), *Motivation and Emotion*.** The paper has four studies, and the PENS (Player Experience of Need Satisfaction) subscales were introduced here.
- **Study 1** (n = 89 undergraduates; Super Mario 64). Autonomy and competence each predicted enjoyment and "preference for future play". **Only competence** predicted the behavioural free-choice measure of continuing with the target game. Competence was also the only need related to presence. Competence predicted pre-to-post gains in state self-esteem and mood. The link between intuitive controls and the outcomes was fully mediated by autonomy and competence.
- **Study 2** (n = 50; Zelda: Ocarina of Time vs A Bug's Life, within-subject). The difference in competence and autonomy between the two games accounted for the difference in enjoyment, preference for future play and presence. For the competence difference, B = .54, p < .01.
- **Study 3** (n = 58; four N64 games; multilevel). Within a person, the games that gave more autonomy and more competence produced more enjoyment (β = .76 and .76), more preference for future play (β = .96 and .65) and more presence (β = .35 and .21). Within-person changes in well-being were mainly a function of competence.
- **Study 4** (n = 730 members of an online community with MMO experience; 679 male; mean age 22). Autonomy, competence and relatedness each independently predicted enjoyment and intended future play. Yee's achievement, social and immersion motives added nothing to those two outcomes once the needs were in the model.
- **PENS** measures in-game competence, in-game autonomy, relatedness, intuitive controls and presence, each on 7-point Likert items. In the Study 4 short form, the alphas were modest: .63 to .72.

**Limits, including the authors' own.** Studies 1 to 3 were lab sessions where students were assigned to commercial console games, mostly female and not self-selected players. PENS and the presence measure were new and needed more validation. The well-being results are short-term only. All the outcomes are self-reported except the Study 1 choice measure. None of the games was a puzzle game.

**For a short puzzle game.** Competence is the strongest lever: give clear, fair feedback that the player is getting better. For autonomy, offer meaningful choice, such as several valid solution routes or a choice of which puzzle to try next. Make controls invisible, because intuitive controls feed both needs. Relatedness is probably minor in a solo jam game, apart from sharing results.

## 2. Flow and the challenge/skill balance (strength: B overall; the "flow channel" as a design rule is C)

**Claim (Csikszentmihalyi).** Flow, meaning absorbed and enjoyable involvement, needs three things: challenges that stretch skills without overwhelming them, clear proximal goals, and immediate feedback. Too much challenge leads to anxiety and too little leads to boredom. I opened the original chapter only through secondary quotes. Šimleša et al. (2018) quote Nakamura & Csikszentmihalyi as saying flow needs "a sense that one is engaging challenges at a level appropriate to one's capacities", plus clear proximal goals.

**Evidence.**
- **Fong, Zaleski & Leach (2014/2015) meta-analysis** (28 studies). The relation between challenge-skill balance and flow was moderate, and smaller for intrinsic motivation. Clear goals and sense of control were equally robust antecedents. Correlations were weaker with experience sampling, with state measures of flow, in work and education settings, and in individualistic cultures. **[UNVERIFIED]**: secondary sources give r ≈ .48 and k = 34 samples. I did not see the paper's own numbers.
- **Keller & Bless (2008), *Personality and Social Psychology Bulletin*** (abstract only). This was an experimental manipulation of skill-demand compatibility, using an adaptive Tetris-like paradigm. Compatibility *caused* more flow. People high in action orientation were most sensitive to it.
- **Harmat et al. (2015)** (n = 77; Tetris at easy, optimal and difficult levels; abstract only). The "optimal" condition produced the highest state flow, positive affect and effortless attention.
- **Abuhamdeh & Csikszentmihalyi (2012)** (abstract only). In internet chess, perceived challenge strongly predicted enjoyment. Games against stronger opponents were more enjoyable than games against weaker ones, and close games were more enjoyable than blowouts.
- **Dynamic difficulty adjustment (DDA).** Juvina & O'Neill (2022 preprint; abstract only) used AI-adaptive Tetris. The adaptive condition beat both easy and hard on a composite of performance and flow: the easy condition hurt performance and the hard condition hurt flow. Denisova & Cairns (CHI PLAY 2015): players *told* that an adaptive AI was present, when none was, reported more immersion. In Study 1 (n = 21, within-subject), partial η² = .285. Study 2 (n = 40, between-subject) had a smaller effect (partial η² = .137). Expectation alone shifts perceived experience, which complicates how DDA studies should be read.
- **Jenova Chen, "Flow in Games" (MFA thesis, USC).** The opened introduction states the flow-zone idea and proposes *player-oriented* adjustment, where players choose the difficulty, instead of system-driven DDA. The introduction presents no data. **[UNVERIFIED]**: how flOw implements this and the thesis's later test results.

**Limits.** Most flow research is correlational and self-reported. "Balance" is perceived rather than objective. Peifer et al.'s (2022) scoping review notes that action orientation can produce flow without fit. Lab DDA studies are short, with small samples.

**For a short puzzle game.** Ramp difficulty in small steps. Show the goal clearly on every level and give instant feedback on every move. Bias toward slightly too hard rather than too easy, since close calls are more enjoyable. With only about 10 to 20 levels, a hand-tuned curve plus optional skips or hints, which give the player choice, is safer than automatic DDA.

## 3. Learning as fun: Koster, *A Theory of Fun* (strength: C)

**Claim.** "Fun is just another word for learning." Games are systems for learning patterns. Fun is the brain's reward for absorbing a pattern, and boredom sets in once the pattern is mastered. Koster's "Ten Years Later" slides quote the book: "Fun in games arises out of mastery. It arises out of comprehension. It is the act of solving puzzles that makes games fun. With games, learning is the drug." The slides say the idea "came out of cognitive science and evolutionary psychology". They also say Koster "intentionally excluded a lot of stuff we call 'fun'" (easy fun, altered states) from the definition.

**Evidence.** None directly. It is a designer's synthesis. It is consistent with the curiosity and insight findings in sections 4 and 6, which tie learning and information to reward and memory circuitry, but that is convergence, not a test of the theory.

**Limits.** A deliberately narrow definition of fun. It is unfalsifiable as stated. Koster himself credits Chris Crawford with an earlier version of the idea.

**For a short puzzle game.** Each level should teach or twist one rule, and you should stop before the pattern is exhausted. A jam game that ends while the player is still learning is a feature: "a good game teaches everything it has before the player quits".

## 4. Curiosity, information gaps, Zeigarnik and "one more turn" (strength: B for curiosity; D for the Zeigarnik memory effect)

**Loewenstein (1994), *Psychological Bulletin*** (pp. 87-91, read from the scanned PDF).
- Curiosity arises "when attention becomes focused on a gap in one's knowledge". Such gaps produce a feeling of deprivation, and the person is motivated to close them. Curiosity is reference-point dependent: the same knowledge can evoke curiosity or not, depending on what the person wants to know.
- Curiosity should rise as the ability to *close* the gap rises. In Loewenstein et al. (1992), about 70% of subjects chose to learn the rule tied to the longer list.
- It should be **greater for insight problems than for incremental ones**. In a 5 × 9 grid reveal task, subjects in the single-picture "gestalt" condition uncovered significantly more squares.
- Curiosity should increase with knowledge in a domain, with an approach gradient as the person nears completion. The paper gives the exception of a jigsaw puzzle: curiosity drops once you can guess the picture.
- Triggers include posing a question or puzzle, a sequence of events with an anticipated outcome (making a prediction intensifies it), violated expectations, and others knowing something you don't.
- **Guessing with accuracy feedback** increases curiosity. Loewenstein ties this explicitly to "a type of Zeigarnik effect".
- People avoid curiosity they expect will not be satisfied, or will only be satisfied after a long delay.

**Later evidence.**
- **Kang et al. (2009), *Psychological Science*** (abstract only, plus Dubey & Griffiths's summary of it). Curiosity about trivia answers correlated with activity in the caudate, a region linked to anticipated reward. People spent scarce tokens or waiting time to learn answers they were curious about. Higher curiosity predicted recall of surprising answers 1 to 2 weeks later. Curiosity was an **inverted U-shaped function of confidence**: highest at moderate confidence.
- **Gruber, Gelman & Ranganath (2014), *Neuron*** (abstract only). High curiosity improved memory, even for incidental material, and engaged the midbrain and nucleus accumbens.
- **Dubey & Griffiths (2017/2020)**. The inverted-U holds when the probability of needing the information later is tied to prior confidence. When the two are independent, curiosity rises as confidence falls. So the shape depends on context.

**Zeigarnik effect (better memory for interrupted tasks).** Ghibellini & Meier's (2025) meta-analysis in *Humanities & Social Sciences Communications* found **"no memory advantage for unfinished tasks"**. By contrast, the **Ovsiankina effect, the tendency to *resume* an interrupted task, "represents a general tendency."** They suggest the original effect depended on experimenter authority, task demands and involvement. **[UNVERIFIED]**: the meta-analysis's effect sizes and study counts. A separate work-recovery meta-analysis (Wendsche et al., 2026; abstract only) found that unfinished work tasks correlate with off-job work thoughts (ρ = .38 between-person, .25 within-person). That supports intrusive thoughts and rumination, not a recall advantage.

**"One more turn."** I found no primary research on the phrase itself. **[UNVERIFIED]**: it is designer lore. The defensible mechanisms are Ovsiankina resumption, Loewenstein's approach gradient near a goal, and curiosity about a visible next goal.

**For a short puzzle game.** Pose the question visibly: show the goal state or a locked next level. Keep each gap feel closeable, because people avoid hopeless curiosity. Let players predict and then get feedback ("will this move work?"). Ending a session on a half-seen next puzzle exploits resumption, not memory. Avoid revealing the solution pattern too early, as in the jigsaw example.

## 5. Reward schedules, compulsion loops and dopamine (solid core with heavy pop-science overlay)

**Solid: dopamine as a prediction-error signal.** Schultz, Dayan & Montague (1997, *Science*; abstract only): primate dopamine neurons signal "changes or errors in the predictions of future salient and rewarding events", consistent with temporal-difference learning models. **Strength: A.**

**Solid: dopamine is released while playing a game.** Koepp et al. (1998, *Nature*; abstract only) used raclopride PET. Striatal dopamine release during a video game correlated with performance level and was greatest in the ventral striatum. **Strength: B.** **[UNVERIFIED]**: the sample size, which I recall as about 8, and which is not in the abstract.

**Important correction to the pop-science version.** Berridge & Robinson (1998; abstract only) showed that rats depleted of up to 99% of dopamine still showed normal hedonic "liking" reactions and normal learning of new likes. They concluded that dopamine mediates "wanting" (incentive salience), not "liking" or pleasure. So "dopamine = pleasure hit" is wrong. Dopamine is better read as learning, prediction error and wanting. **Strength: A for this distinction.**

**Variable-ratio reinforcement in games.** The classic operant finding is that variable-ratio schedules produce higher response rates than fixed ones. I saw this only as stated in Kao's literature review; Ferster & Skinner was not opened **[UNVERIFIED primary]**. The direct game evidence is Kao (2012, Princeton MSE thesis, Mechanical Turk; Ns per experiment from 173 to 707). Players chose variable-reward worlds more often than fixed-reward worlds *with the same mean*, but only when the variance was small: 5-15 uniform, t(158) = 3.46, p < .001. With a wider range (0-20) the preference disappeared. With 0/50 at 80/20, players preferred the *fixed* schedule. The thesis reads this as aversion to small or zero rewards. **Strength: B-/C** (one thesis, an online convenience sample).

**Compulsion loops.** The term traces to Hopson's 2001 Gamasutra article, which I did not open. In his 2012 retrospective, Hopson says variable-ratio loot drops existed before anyone named them, and that "contingencies are the essence of games". He also says reinforcement's power has been overstated by both fans and critics, that it doesn't replace fun, and that a reward is ethical when players would enjoy the activity anyway. **Strength: C** (practitioner framing).

**Pop-science to avoid.** Claims that games "hijack dopamine like slot machines", or that random rewards alone create engagement. The evidence above shows that variance is preferred only within limits, that dopamine is not pleasure, and that SDT needs explain more of the variance in enjoyment and replay.

**For a short puzzle game.** Puzzle rewards are mostly *deterministic*: the solution works. You can add small, bounded variety, such as different celebration effects or a chance of a bonus star. Don't add big zero-or-jackpot randomness, which players disliked in Kao. A surprising but fair outcome is a positive prediction error, and that is the learning signal.

## 6. Insight: the "aha" (strength: B, converging)

- **Kounios & Beeman (2014), *Annual Review of Psychology*** (abstract only). Insight is "suddenly reinterpret[ing] a stimulus... to produce a nonobvious, nondominant interpretation". It is linked to right-hemisphere coarse semantic coding and to internally focused attention.
- **Oh, Chesebrough, Erickson, Zhang & Kounios (2020), *NeuroImage*** (abstract only). EEG during anagrams: insight solutions, compared with analytic ones, showed a prefrontal gamma burst. A second burst, scaled by each person's reward sensitivity and partly sourced to orbitofrontal cortex, was read as an "insight-related reward signal". The authors suggest it explains why people choose puzzles and murder mysteries.
- **Tik et al. (2018), *Human Brain Mapping*** (abstract only). 7T fMRI on Remote Associates Task problems: Aha moments engaged the VTA, nucleus accumbens, caudate, hippocampus and thalamus.
- **Danek et al. (2013), *Psychological Research*** (n = 50, magic-trick solutions; abstract only). After 14 days, 64.4% of insight solutions were recalled versus 52.4% of non-insight solutions.
- **Danek & Wiley (2016), *Frontiers in Psychology*** (n = 70; abstract only). The Aha experience has the dimensions **Pleasure, Suddenness and Certainty**. False insights exist. Correct solutions came faster, felt stronger and carried relief, while incorrect ones carried surprise.
- **Danek, Williams & Wiley (2020)** (abstract only). Sudden representational change toward a correct solution produced stronger Aha than incremental change.
- **Bilalić, Graf, Vaci & Danek (2019)** (abstract only). Chess experts solved the mutilated-checkerboard problem more often but reported **less** Aha. When prior knowledge removes the need to restructure the problem, the Aha is diminished.

**Limits.** Small samples. The tasks are verbal or riddle-like (anagrams, RAT, magic tricks), not game levels. The neural "reward" findings are correlational and come from single studies. Aha is self-reported.

**For a short puzzle game.** Design levels around **one misleading default assumption that has to be dropped**. That restructuring, not grinding search, makes the Aha. Make the solution verifiable at once, so certainty arrives with the insight. Avoid levels solvable by trial and error, which gives incremental and weaker Aha. Players who already know the trick get less Aha, so introduce twists that break the pattern you just taught.

## 7. Player motivation models (strength: C+ for Quantic Foundry; C- for Bartle)

**Bartle (1996), "Hearts, Clubs, Diamonds, Spades".** Four types: achievers, explorers, socialisers and killers. They came from an informal debate among about 30 experienced players on one UK MUD, summarised by Bartle as administrator. Bartle says he is not a psychologist, that the types are stereotypes, that individuals mix them, and that the scope is MUDs. **Not an empirical instrument.** It has little to say about solo puzzle games.

**Quantic Foundry (Yee) Gamer Motivation Model.**
- The model was derived by factor analysis from a 5-minute online survey. The reference PDF reports more than 1.25 million respondents, 74% male, with a median age of 23. About 80% were recruited through social-media sharing, a self-selected sample.
- Reported reliability: Cronbach's alpha ≥ .75 and test-retest r = .73.
- 12 motivations in 6 clusters: **Action** (Destruction, Excitement), **Social** (Competition, Community), **Mastery** (Challenge, Strategy; "Let Me Think"), **Achievement** (Completion, Power), **Immersion** (Fantasy, Story) and **Creativity** (Design, Discovery).
- Relevant to puzzles:
  - **Strategy**: "enjoy games that require careful decision-making and planning… think through their options and likely outcomes".
  - **Challenge**: skill, practice, persistence through failure.
  - **Completion**: "finish everything".
- In the GDC 2020 segments, the "Acrobat" segment (top motivations Challenge + Discovery) lists Tetris among its popular games. The "Gardener" segment ("Quiet, Relaxing Task Completion") lists Candy Crush and Solitaire.
- The GDC 2021 talk distinguishes **universals** (intuitive UI, clear goals, feedback on progress, control over outcome, choices: "Players always want more of these") from **differentiators** (Strategy, Competition, Story and so on, where people differ). The universals line up closely with SDT competence and autonomy and with the flow conditions.

**Limits.** The model is proprietary, and most of it is published as company slides rather than peer-reviewed papers. The sample is self-selected and skews toward young male core gamers. It describes preference, not what causes engagement.

**For a short puzzle game.** The core audience is Mastery: Strategy (deliberate, turn-based thinking) plus Challenge. Completion is a cheap secondary hook: level checkmarks, optional stars and par-move targets. Discovery can come from hidden mechanics. Get the universals right first.

---

## Ranked by strength of evidence (summary)

1. **Dopamine as prediction error / "wanting" rather than pleasure** (Schultz 1997; Berridge & Robinson 1998). A.
2. **Challenge-skill balance, clear goals and feedback → flow and enjoyment** (Fong meta-analysis; Keller & Bless; Harmat; Abuhamdeh & Csikszentmihalyi). A-/B.
3. **SDT competence and autonomy predict enjoyment and wanting to play again** (Ryan et al. 2006; four studies). B.
4. **Curiosity as an information gap: rewarding, memory-enhancing, peaks at moderate confidence** (Loewenstein 1994; Kang 2009; Gruber 2014). B.
5. **Insight is pleasurable, recruits reward circuitry and needs restructuring** (Danek; Tik; Oh/Kounios). B.
6. **Ovsiankina resumption is reliable; the Zeigarnik memory advantage is not** (Ghibellini & Meier 2025). B for resumption; D for the memory claim.
7. **Small reward variance is preferred, large variance is not** (Kao 2012). B-/C.
8. **Quantic Foundry motivations: Mastery and Completion for puzzle players**. C+.
9. **Koster's "fun = learning"**. C.
10. **Bartle types; "one more turn"; "compulsion loop" as a mechanism**. C-/D.

---

## Sources actually opened

| # | Title | Author(s) | Year | URL |
|---|---|---|---|---|
| 1 | The Motivational Pull of Video Games: A Self-Determination Theory Approach (full PDF) | Ryan, Rigby, Przybylski | 2006 | https://selfdeterminationtheory.org/SDT/documents/2006_RyanRigbyPrzybylski_MandE.pdf |
| 2 | The Psychology of Curiosity: A Review and Reinterpretation (scanned PDF; pp. 87-91 read) | Loewenstein | 1994 | https://www.cmu.edu/dietrich/sds/docs/loewenstein/PsychofCuriosity.pdf |
| 3 | The wick in the candle of learning (abstract, Europe PMC) | Kang, Hsu, Krajbich, Loewenstein, McClure, Wang, Camerer | 2009 | https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:19619181%20AND%20SRC:MED&resultType=core&format=json (doi:10.1111/j.1467-9280.2009.02402.x) |
| 4 | States of curiosity modulate hippocampus-dependent learning via the dopaminergic circuit (abstract, Europe PMC) | Gruber, Gelman, Ranganath | 2014 | https://www.ebi.ac.uk/europepmc/webservices/rest/search (query TITLE; doi:10.1016/j.neuron.2014.08.060) |
| 5 | A rational analysis of curiosity | Dubey, Griffiths | 2017/2020 | https://arxiv.org/pdf/1705.04351 |
| 6 | Interruption, recall and resumption: a meta-analysis of the Zeigarnik and Ovsiankina effects (IDEAS abstract page) | Ghibellini, Meier | 2025 | https://ideas.repec.org/a/pal/palcom/v12y2025i1d10.1057_s41599-025-05000-w.html |
| 7 | Unfinished work tasks and work-related thoughts during off-job time: meta-analysis (abstract, Europe PMC) | Wendsche, Weigelt, Syrek | 2026 | doi:10.1080/10615806.2026.2616302 via Europe PMC API |
| 8 | A neural substrate of prediction and reward (abstract, Europe PMC) | Schultz, Dayan, Montague | 1997 | https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:9054347%20AND%20SRC:MED&resultType=core&format=json |
| 9 | Evidence for striatal dopamine release during a video game (abstract, Europe PMC) | Koepp et al. | 1998 | https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:9607763%20AND%20SRC:MED&resultType=core&format=json |
| 10 | What is the role of dopamine in reward: hedonic impact, reward learning, or incentive salience? (abstract) | Berridge, Robinson | 1998 | doi:10.1016/s0165-0173(98)00019-8 via Europe PMC API |
| 11 | Reward Preference in Video Games (MSE thesis PDF) | Kao | 2012 | https://people.csail.mit.edu/dkao/pdf/kao2012rewardpreference.pdf |
| 12 | 10 Years of Behavioral Game Design with Bungie's Research Boss | Hopson | 2012 | https://gamedeveloper.com/design/10-years-of-behavioral-game-design-with-bungie-s-research-boss |
| 13 | The cognitive neuroscience of insight (abstract) | Kounios, Beeman | 2014 | doi:10.1146/annurev-psych-010213-115154 via Europe PMC API |
| 14 | An insight-related neural reward signal (abstract) | Oh, Chesebrough, Erickson, Zhang, Kounios | 2020 | doi:10.1016/j.neuroimage.2020.116757 via Europe PMC API |
| 15 | Ultra-high-field fMRI insights on insight (abstract) | Tik et al. | 2018 | doi:10.1002/hbm.24073 via Europe PMC API |
| 16 | Aha! experiences leave a mark: facilitated recall of insight solutions (abstract) | Danek, Fraps, von Müller, Grothe, Öllinger | 2013 | doi:10.1007/s00426-012-0454-8 via Europe PMC API |
| 17 | What about false insights? (abstract) | Danek, Wiley | 2016/2017 | doi:10.3389/fpsyg.2016.02077 via Europe PMC API |
| 18 | Closing the gap: connecting sudden representational change to the subjective Aha! experience (abstract) | Danek, Williams, Wiley | 2020 | doi:10.1007/s00426-018-0977-8 via Europe PMC API |
| 19 | When the solution is on the doorstep… chess experts, mutilated checkerboard (abstract) | Bilalić, Graf, Vaci, Danek | 2019 | doi:10.1111/cogs.12771 via Europe PMC API |
| 20 | Flow and regulatory compatibility (abstract) | Keller, Bless | 2008 | doi:10.1177/0146167207310026 via Europe PMC API |
| 21 | Physiological correlates of the flow experience during computer game playing (abstract) | Harmat et al. | 2015 | doi:10.1016/j.ijpsycho.2015.05.001 via Europe PMC API |
| 22 | Adaptive Interface Promotes a Composite of Performance and Flow in Tetris (preprint abstract) | Juvina, O'Neill | 2022 | doi:10.31234/osf.io/gptvz via Europe PMC API |
| 23 | The importance of challenge for the enjoyment of intrinsically motivated, goal-directed activities (abstract) | Abuhamdeh, Csikszentmihalyi | 2012 | doi:10.1177/0146167211427147 via Europe PMC API |
| 24 | The challenge–skill balance and antecedents of flow: a meta-analytic investigation (abstract page) | Fong, Zaleski, Leach | 2014/2015 | https://www.instituteofcoaching.org/resources/challenge%E2%80%93skill-balance-and-antecedents-flow-meta-analytic-investigation |
| 25 | A Scoping Review of Flow Research | Peifer et al. | 2022 | https://www.frontiersin.org/articles/10.3389/fpsyg.2022.815665/full |
| 26 | The Flow Engine Framework | Šimleša et al. | 2018 | https://pmc.ncbi.nlm.nih.gov/articles/PMC5973526 |
| 27 | Flow in Games (thesis introduction) | Jenova Chen | c. 2006 | https://www.jenovachen.com/flowingames/introduction.htm |
| 28 | The Placebo Effect in Digital Games: Phantom Perception of Adaptive AI | Denisova, Cairns | 2015 | https://www-users.york.ac.uk/~pc530/pubs/Denisova2_CHIPLAY15.pdf |
| 29 | A Theory of Fun (book site) | Koster | 2004/2013 | https://www.theoryoffun.com/ |
| 30 | Theory of Fun 10 Years Later (slides) | Koster | c. 2012 (uploaded 2026) | https://www.raphkoster.com/wp-content/uploads/2026/07/Theory-of-Fun-10-Years-Later.pdf |
| 31 | Hearts, Clubs, Diamonds, Spades: Players Who Suit MUDs | Bartle | 1996 | https://mud.co.uk/richard/hcds.htm |
| 32 | Gamer Motivation Model Reference (PDF) | Quantic Foundry (Yee, Ducheneaut) | 2019 | https://quanticfoundry.com/wp-content/uploads/2019/04/Gamer-Motivation-Model-Reference.pdf |
| 33 | GDC 2021: Universals vs Differentiators (slides) | Quantic Foundry | 2021 | https://quanticfoundry.com/wp-content/uploads/2021/07/GDC-2021-Slides-Universals-vs-Differentiators-Quantic-Foundry.pdf |
| 34 | 9 Player Segments, GDC 2020 excerpt (slides) | Quantic Foundry | 2020 | https://quanticfoundry.com/wp-content/uploads/2020/08/9-Player-Segments-GDC-2020-Excerpt.pdf |

Attempted but not readable: the Quantic Foundry model pages (403), the PubMed pages (cookie wall; the Europe PMC API was used instead), the Nature/HSSC full text of Ghibellini & Meier (login redirect), and the Hopson 2001 Gamasutra original (not opened).

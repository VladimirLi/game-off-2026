# Jam stickiness and engaging vs. addictive design: research notes

Researched 2026-11-12 for a solo GitHub Game Off 2026 entry (short turn-based puzzle game, browser, keyboard).
Every source in the list at the bottom was opened, either with WebFetch or as extracted PDF/HTML text. Search snippets are not used as evidence.
**[UNVERIFIED]** marks claims I could not confirm from an opened primary page, and **[INFERENCE]** marks my own reading of the data.

---

## A. What makes a short jam game stick

### A1. How Game Off is judged

- **2026 jam page.** The theme is shown as **"SHIFT"**, not "Shifting", so check the wording. You must push the repo by **1 Dec 2026, 13:37 PST**, and **voting ends 1 Jan 2027, 13:37 PST**. The rules are: make the game in November, keep the source in a public GitHub repo, submit on itch.io, and use any engine. About 3,970 people had joined when I checked. [itch.io/jam/game-off-2026]
- **Criteria.** Entries are rated 1–5 stars on six criteria: **Overall, Gameplay, Graphics, Audio, Innovation, Theme Interpretation**. This is the same as in 2024 and 2025. [jam pages, results pages]
- **Who votes.** Participants rate each other's games, not a jury. GitHub then features the top 10 overall on its blog. [game-off-2025 page; GitHub blog winners posts]
- **itch.io mechanics.** Each criterion is ranked by its average star score. If the host restricts voting to submitters, only votes from people with a valid entry count. itch.io uses a "rating queue" so that every entry gets some minimum number of votes, and it never publishes individual votes. [itch.io docs: game jams]
- **Few raters per game.**
  - 2024: 507 entries, 4,696 ratings, **average 9.3 and median 6 ratings per game**.
  - 2025: 708 entries, 10,414 ratings, **average 14.7 and median 16**.
  - Top-10 entries had about 13–67 ratings.
  - **[INFERENCE]** A game's rank depends on a small and noisy sample of fellow jammers. Every rater's first minutes count, and rating other games, which feeds itch.io's queue and builds goodwill, increases your exposure.

### A2. What past top entries had in common

- **2025 ("Waves", 700+ entries).** At least six of the top 10 were puzzle or puzzle-strategy games: *Where the Water Flows* (#2), *BEACON*, *A Kingdom Slightly Out Of Tune*, *Tidal Town*, *Froggy Love*, and *The Last Wave*.
  - In each, the theme **is** the core mechanic. In *Where the Water Flows* you raise and lower the sea level; in *Froggy Love* splash ripples steer the frog.
  - The blog's descriptions praise "observation over reflexes", "serene visuals", "quiet and cozy", and soundtracks.
  - *Froggy Love* placed #7 with **only three handcrafted levels**.
  - [GitHub blog 2025 winners]
- **2024 ("Secrets").**
  - #1 *Trail of Secrets* combined a minimalist art style, dynamic music, and 12 secret endings.
  - Category winners: *Museum Servivit* (graphics, hand-drawn art plus clever puzzles), *The Trial of Wasdo* (audio, tile-based puzzle), and *Shaki Shaki Island* (innovation, "draw-em-up" puzzles).
  - [GitHub blog 2024; itch results 2024]
- **2023 ("Scale").** Reviewer quotes on the top 10 keep returning to **atmosphere, music, art style, and polish**. Several winners took the theme literally as a mechanic, such as merging, stacking, or balancing on a scale. [GitHub blog 2023]
- **2022 ("Cliché").** The innovation award went to *Knight in Shining Armour*, a "polished puzzle experience" that fits the theme. *Elephant in the Room* was praised for "progressively introduced gameplay elements". [GitHub blog 2022]
- **[INFERENCE] Common threads:**
  1. The theme is the mechanic, not decoration.
  2. A coherent mood with an audio-visual identity.
  3. Polish over size.
  4. Puzzle games do very well in this jam.

  **[UNVERIFIED]** I did not check whether every winner had a web build.

### A3. Practical advice from guides and postmortems

- **Players spend minutes, not hours.**
  - Ian Campbell (Defold, 2022): "People will most likely play your game for between 3 and 10 minutes." He advises one or two polished levels over many broken ones, and recommends unlocking all levels so stuck players can skip ahead.
  - The *Heartbeats* postmortem (browser jam game, 2019) measured **245 s (about 4 min) average playtime**, and only **18.9%** of players finished every level. This is a single data point.
  - Kenneth Ng (Epic MegaJam, 2015) expected judges to give about 30 minutes per game when there were around 170 entries. That is a different context from Game Off.
- **Browser build.** A survey of 169 developers found browser plays averaged about **37% of page views**, while downloads were about **6–7%**. The survey says web builds drew roughly 3x more players [howtomarketagame 2025]. Kenney also recommends a web build so players don't have to download. A figure of "about 10x plays for web" appears in an itch forum snippet **[UNVERIFIED, not opened]**.
- **Onboarding without text.**
  - Puzzledorf (Burfield, 2021) uses no text except controls. Its first puzzles are nearly impossible to fail and teach one idea each.
  - It uses positive feedback: flashing blocks, a happy sound, and particles on success.
  - It keeps an **always-visible undo/restart key hint**, because players forgot those keys after rushing through the opening levels.
  - The first fail state arrives in level 1 and teaches the player to undo.
  - Its method was to watch testers without helping them.
  - Defold adds "show, don't tell" and safe practice spaces.
- **Presentation (Kenney, 2024).**
  - Give the game a unique title, never just the jam name.
  - Use a bright, readable thumbnail built from in-game visuals, ideally animated.
  - Use varied screenshots of gameplay, not menus.
  - Any GIF or video should show gameplay from the first second.
  - Put the controls both on the itch page and in the game.
  - Normalise audio levels.
  - Play the game start to finish before submitting.
  - Reserve 1–2 hours for presentation work.
- **Sound and identity (Defold).**
  - Music sets the mood.
  - Balance volumes and keep frequently repeated SFX quieter.
  - Randomise pitch and gain a little so sounds don't feel repetitive.
  - Pick one consistent palette; consistency matters more than fancy art.
- **Scope (Defold, Ng).** Build a minimum viable product first and keep a submittable build at all times. A complete game with imperfections beats an incomplete one.
- **Community.**
  - Don't beg for ratings, which can lead to lower scores [Defold].
  - The *Heartbeats* author credits playing and commenting on 50+ other entries, a polished itch page, and accessibility.

---

## B. Engaging vs. addictive

### B1. Dark patterns

- **Zagal, Björk & Lewis (FDG 2013)**
  - **Definition:** "a pattern used intentionally by a game creator to cause negative experiences for players which are against their best interests and likely to happen without their consent."
  - **Categories:**
    - *Temporal:* Grinding, Playing by Appointment.
    - *Monetary:* Pay to Skip, Pre-Delivered Content, Monetized Rivalries.
    - *Social-capital:* Social Pyramid Schemes, Impersonation.
  - They also discuss "psychological tricks" as an open question, including artificial scarcity of the "One Time Offer!" kind.
  - **Key nuance:** appointment play is "nullified if completing appointments is not required for progression". Time-mapped bonuses that are optional are acceptable.
- **DarkPattern.games (review site, accessed 2026)** extends the taxonomy into four groups:
  - *Temporal:* Playing by Appointment, Daily Rewards, Grinding, Ads, Infinite Treadmill, Can't Pause or Save, Wait To Play.
  - *Monetary:* Pay to Skip, Premium Currency, Pay to Win, Artificial Scarcity.
  - *Social:* Social Pyramid, Social Obligation, Friend Spam, Reciprocity.
  - *Psychological:* Invested Value, Badges / Endowed Progress, Complete the Collection, Illusion of Control, Variable Rewards, Aesthetic Manipulations, Optimism / Frequency Biases.
  - It states that "A good game allows you to play it whenever you want, and … for as long or as short as you want."
- **van der Hof et al. (Frontiers in Digital Health, 2022)** use four categories (temporal, monetary, social, psychological) and add friction, obscured currencies, monetised matchmaking, and loot boxes. They frame the issue in terms of children's rights.
- **Critique: Deterding, Stenros & Montola (DiGRA 2020).** They argue the concept is "ontologically incoherent". It makes designer intent and player consent the test, yet labels concrete features as dark in themselves. It also names no ethical framework.
  - **Takeaway:** judge each feature by its context and effect on the player, not by a checklist.

### B2. WHO ICD-11 gaming disorder

- **WHO definition.** Gaming disorder is impaired control over gaming, increasing priority given to gaming, and continuation despite negative consequences. It must cause significant impairment, normally evident for at least 12 months. WHO says it affects "only a small proportion" of players.
- **Debate.**
  - Aarseth et al. (2016/17) called it premature. Their reasons were weak evidence, criteria borrowed from substance use, and the risks of moral panic and stigma.
  - Király & Demetrovics (2017) replied that inclusion has more advantages than disadvantages, provided the criteria stay provisional and focused on impairment.

### B3. Variable rewards, loot boxes, and the Skinner box

- **Skinner and compulsion loops.**
  - Brignull (*Deceptive Patterns*, ch. 11) links Skinner's variable schedules to compulsive use. He notes how infinite scroll removes "stopping cues" and calls paid loot boxes "gamblification".
  - GameAnalytics (Kim) presents compulsion loops as a retention tool rooted in the Skinner box, with no discussion of ethics.
  - Jonathan Blow (MIGS 2007) distinguished rewards that are like food from rewards that are like drugs. His test: would the game still appeal if its scheduled rewards were removed?
- **Regulation.**
  - **UK (DCMS, 18 Jul 2022):** the government found a "stable and consistent association" between loot boxes and problem gambling, but no proven causation. It chose not to amend the Gambling Act and asked industry for measures: no purchases by under-18s without parental consent, spending controls, and transparency about odds.
  - **Belgium (2018):** the Gaming Commission said paid loot boxes in some games broke gambling law **[secondary: Brignull; PC Gamer page body did not load]**, and Brignull says enforcement has been weak.
  - **Norwegian Consumer Council "Insert Coin" (31 May 2022):** backed by 20 groups in 18 countries. It asks for bans on deceptive design, protections for minors, and transparency about real-money cost.

### B4. Positive alternatives

- **Self-determination theory.** Ryan, Rigby & Przybylski (2006) found that enjoyment and post-play well-being go with perceived **competence and autonomy**, and that both relate to intuitive controls. Need satisfaction, not schedules of reinforcement, is the healthy engine of engagement.
- **Exit points.** Extra Credits, "Exit Points" (2015), argues for respecting players' time:
  - Design intended exit points, such as level ends and gentle time reminders.
  - Minimise unintended ones, such as frustration and slow restarts.
- **Self-imposed endpoints.** Felix (Ahmed, 2018) uses *Civilization*'s "one more turn" to show how turn-based games without clear endpoints keep players going on goals they set themselves.
- **For a puzzle game:** finite content, a clear finish, saved progress, instant undo and restart, and level ends that feel like resting points.

---

## Source list (all opened)

| # | Title | Author | Year | URL |
|---|---|---|---|---|
| 1 | Game Off 2026 (itch.io jam page) | GitHub / itch.io | 2026 | https://itch.io/jam/game-off-2026 |
| 2 | Game Off 2025 (jam page) | GitHub / itch.io | 2025 | https://itch.io/jam/game-off-2025 |
| 3 | Game Off 2025 results | itch.io | 2026 | https://itch.io/jam/game-off-2025/results |
| 4 | Game Off 2024 results | itch.io | 2025 | https://itch.io/jam/game-off-2024/results |
| 5 | Light waves, rising tides, and drifting ships: Game Off 2025 winners | Lee Reilly | 2026 | https://github.blog/open-source/gaming/light-waves-rising-tides-and-drifting-ships-game-off-2025-winners/ |
| 6 | Game Off 2024 winners | Lee Reilly | 2025 | https://github.blog/open-source/game-off-2024-winners/ |
| 7 | Game Off 2023 results | Lee Reilly | 2024 | https://github.blog/2024-01-09-game-off-2023-results |
| 8 | Game Off 2022 winners | Lee Reilly | 2023 | https://github.blog/open-source/gaming/game-off-2022-winners |
| 9 | Game jams (creator docs) | itch.io | n.d. | https://itch.io/docs/creators/game-jams |
| 10 | Improving the presentation of jam games | Kenney (no named author) | 2024 | https://kenney.nl/learn/improving-the-presentation-of-jam-games |
| 11 | Big list of game jam advice | Ian Campbell | 2022 | https://defold.com/2022/07/22/Big-list-of-game-jam-advice/ |
| 12 | How to Make a Game in One Week: Epic MegaJam Learnings | Kenneth Ng | 2015 | https://www.gamedeveloper.com/design/how-to-make-a-game-in-one-week-epic-megajam-learnings |
| 13 | Postmortem: my thoughts after the game jam (Heartbeats) | Dyoxyne | 2019 | https://itch.io/devlog/72163/postmortem-my-thoughts-after-the-game-jam.amp |
| 14 | Benchmark: Itch.io traffic | zukalous (How To Market A Game) | 2025 | https://howtomarketagame.com/2025/05/12/benchmark-itch-io-traffic/ |
| 15 | Tutorial design in Puzzledorf: reflections | Stuart Burfield | 2021 | https://www.gamedeveloper.com/game-platforms/tutorial-design-in-puzzledorf-reflections |
| 16 | Dark Patterns in the Design of Games (FDG 2013) | Zagal, Björk, Lewis | 2013 | https://gup.ub.gu.se/file/101018 |
| 17 | Against "Dark Game Design Patterns" (DiGRA 2020 abstract) | Deterding, Stenros, Montola | 2020 | https://eprints.whiterose.ac.uk/156460/1/DiGRA_2020_paper_189.pdf |
| 18 | DarkPattern.games (home, temporal, psychological pages) | DarkPattern.games | 2026 (accessed) | https://www.darkpattern.games/ ; /pattern/1/temporal-dark-patterns.html ; /pattern/4/psychological-dark-patterns.html |
| 19 | "Don't Gamble With Children's Rights" | van der Hof, van Hilten, Ouburg, Birk, van Rooij | 2022 | https://www.frontiersin.org/articles/10.3389/fdgth.2022.822933/full |
| 20 | Addictive behaviours: Gaming disorder (Q&A) | WHO | n.d. | https://www.who.int/news-room/questions-and-answers/item/addictive-behaviours-gaming-disorder |
| 21 | Scholars' open debate paper on the WHO ICD-11 Gaming Disorder proposal (ORA record) | Aarseth et al. | 2016/2017 | https://ora.ox.ac.uk/objects/uuid:7d35d93f-a336-48b9-9e23-437a31f8148d |
| 22 | Inclusion of Gaming Disorder in ICD has more advantages than disadvantages | Király, Demetrovics | 2017 | https://pmc.ncbi.nlm.nih.gov/articles/PMC5700721/ |
| 23 | Government response to the call for evidence on loot boxes in video games | UK DCMS | 2022 | https://www.gov.uk/government/consultations/loot-boxes-in-video-games-call-for-evidence/outcome/government-response-to-the-call-for-evidence-on-loot-boxes-in-video-games |
| 24 | Loot boxes: How the gaming industry manipulates and exploits consumers | BEUC | 2022 | https://www.beuc.eu/news/loot-boxes-how-gaming-industry-manipulates-and-exploits-consumers |
| 25 | Deceptive Patterns, ch. 11: Exploiting addiction | Harry Brignull | n.d. (book 2023) | https://deceptive.design/book/contents/chapter-11 |
| 26 | The compulsion loop explained | Joseph Kim (GameAnalytics) | updated 2025 | https://www.gameanalytics.com/blog/the-compulsion-loop-explained |
| 27 | MIGS 2007: Jonathan Blow on the "WoW drug", meaningful games | Brandon Boyer, Leigh Alexander | 2007 | https://www.gamedeveloper.com/game-platforms/migs-2007-jonathan-blow-on-the-i-wow-i-drug-meaningful-games |
| 28 | The Motivational Pull of Video Games: A Self-Determination Theory Approach | Ryan, Rigby, Przybylski | 2006 | https://www.rochester.edu/warner/lida/wp-content/uploads/2022/11/02bfe513dd59366750000000.pdf |
| 29 | Extra Credits: "Exit Points" (episode listing) | Extra Credits (via TheTVDB) | 2015 | https://www.thetvdb.com/series/extra-credits/episodes/5219354 |
| 30 | Just one more turn: the arbitrary endpoint | Saad Ahmed (Felix) | 2018 | https://felixonline.co.uk/articles/2018-05-18-just-one-more-turn-the-arbitrary-endpoint/ |

**Opened but not usable:** the PC Gamer Belgium article (the page body did not load). The Belgian claims rely on Brignull [25].
**Not opened:** the "web games get about 10x plays" itch forum post, which is unverified.

# GitHub Game Off 2026 (theme: SHIFT): how to make and place a Bevy entry

Researched 2026-11-07. Scope: solo developer, new to Rust/Bevy, ~3 weeks, browser-playable, portfolio piece. Claims cite primary sources; anything marked *unverified* could not be traced to a primary source.

## The 10 rules

1. **Ship a browser (wasm) build, and make it the default upload.** Every Game Off overall winner of 2024 and 2025 whose itch page was checked is HTML5 ([Evaw](https://wafflenaut-games.itch.io/evaw), [Where The Water Flows](https://nademtis.itch.io/gameoff2025-where-the-water-flows), [Trail of Secrets](https://grumelkeks.itch.io/trail-of-secrets)). The Bevy Jam page states web builds "have historically drawn many more players" ([Bevy Jam #7](https://itch.io/jam/bevy-jam-7)). itch.io's admin ranks platforms by ratings drawn as browser, then Windows, then Mac/Linux, while saying there is no formal analysis ([thread](https://itch.io/t/1474777/gamejam-statistics-about-effect-of-available-platforms-on-number-of-ratings)).
2. **Get above the median rating count, or your score is cut.** itch.io ranks by average star score, but entries with fewer ratings than the jam median are multiplied by `sqrt(min(median, votes)/median)` ([admin leafo](https://itch.io/post/8993133)). Game Off 2023's median was 10 ratings ([results](https://itch.io/jam/game-off-2023/results)); 2025 had 709 entries and 10,414 ratings ([results](https://itch.io/jam/game-off-2025/results)). Play, rate and comment on other entries during the whole voting month (Dec 1 to Jan 1): in a submitters-vote jam that is how your game gets seen.
3. **Score on all six criteria, not one.** Game Off's Overall is the plain average of Gameplay, Graphics, Audio, Innovation and Theme interpretation ([itch jam docs](https://itch.io/docs/creators/game-jams), [Game Off 2026](https://itch.io/jam/game-off-2026)). A silent game or a theme-less game caps its own score. Budget real time for audio and a visible SHIFT mechanic.
4. **One mechanic, 5 to 15 minutes of play, finished early.** Game Off 2024's winner lists an average session of "a few minutes" ([Trail of Secrets](https://grumelkeks.itch.io/trail-of-secrets)). Chainboom's team finished gameplay three days before deadline, which left room for polish ([postmortem](https://janhohenheim.itch.io/chainboom/devlog/964782/postmortem-from-jans-perspective)). Bevy Jam #1 postmortem: scope "will double in size almost instantly", keep cutting ([Mechaburro](https://ramirezmike2.itch.io/quien-es-el-mechaburro/devlog/354715/bevy-jam-1-postmortem)).
5. **Start from `bevy_new_2d` with `bevy_cli`, on Bevy 0.20.** Templates are explicitly allowed ([GitHub blog](https://github.blog/open-source/gaming/game-off-2026-the-theme-is-shift/)). The template is on Bevy 0.20.1 and ships web profiles plus CI that deploys to itch.io ([Cargo.toml](https://raw.githubusercontent.com/TheBevyFlock/bevy_new_2d/main/Cargo.toml), [workflows](https://github.com/TheBevyFlock/bevy_new_2d/blob/main/docs/workflows.md)). Bevy 0.20 is current (Oct 8 2026) ([bevy.org/news](https://bevy.org/news/)).
6. **Deploy a wasm build to itch.io in week 1 and test it in the itch iframe.** Mechaburro's author: know the build pipeline before you start, push daily so CI breaks early, test the wasm build on itch early because browser behaviour differs ([postmortem](https://ramirezmike2.itch.io/quien-es-el-mechaburro/devlog/354715/bevy-jam-1-postmortem)).
7. **Treat web audio as a known hazard.** Browsers run wasm single-threaded, which causes stutter, and block audio until user interaction ([Bevy examples README](https://github.com/bevyengine/bevy/blob/main/examples/README.md)). Mitigations documented by the template: precompile render pipelines at startup, keep FPS high, the JavaScript music workaround, recommend Chromium ([known issues](https://github.com/TheBevyFlock/bevy_new_2d/blob/main/docs/known-issues.md), [workaround](https://necrashter.github.io/bevy-choppy-music-workaround)). Add a "click to start" screen.
8. **Stay on WebGL2, keep assets small, avoid heavy physics on web.** WebGPU is experimental in Bevy and excludes browsers without it ([examples README](https://github.com/bevyengine/bevy/blob/main/examples/README.md)); Laborgeist went WebGPU-only and had to tell web players to use Chrome and warn of bugs ([itch page](https://janhohenheim.itch.io/laborgeist)). A Bevy Jam #6 entry ran at 1.5 FPS on web until trimesh colliders were replaced by convex/cuboid ones ([postmortem](https://piefayth.itch.io/at-the-end-of-the-hall/devlog/964759/at-the-end-of-the-hall-postmortem)).
9. **Make the repo itself the portfolio.** The rules require a public GitHub repo with work done during the jam and a push before Dec 1 13:37 PST; itch submission is a separate step ([GitHub blog](https://github.blog/open-source/gaming/game-off-2026-the-theme-is-shift/)). A README with a GIF, a play link, the CI badge and a short postmortem is what winners' pages mostly lack (none of the checked winner itch pages linked a devlog).
10. **Declare AI use honestly and write your own postmortem.** Game Off allows AI-assisted development and asks about it at submission ([GitHub blog](https://github.blog/open-source/gaming/game-off-2026-the-theme-is-shift/)). Unlike GMTK, which bans generative art/audio ([GMTK 2025](https://itch.io/jam/gmtk-2025)), there is no asset ban, but voters read descriptions.

## 1. Game Off 2026 rules and mechanics

Sources: [GitHub blog announcement](https://github.blog/open-source/gaming/game-off-2026-the-theme-is-shift/), [itch.io jam page](https://itch.io/jam/game-off-2026), [itch.io jam docs](https://itch.io/docs/creators/game-jams).

- **Theme:** SHIFT. "How you interpret the theme is entirely up to you."
- **Deadline:** December 1 2026, 13:37 PST, for both the GitHub push and the itch.io submission. The itch header shows 21:37 UTC, which is the same instant.
- **Voting:** opens after submissions close, ends January 1 2027 13:37 PST. "Participants will vote on each other's games." Whether contributors (not just the submitting account) can vote depends on a host setting the pages do not show; *unverified*.
- **Criteria (2026, confirmed):** Overall, Gameplay, Graphics, Audio, Innovation, Theme interpretation. Same six in 2023, 2024, 2025. No Accessibility category.
- **Eligibility:** free GitHub account plus itch.io account; solo or team; no age/location rule stated.
- **Repo:** public GitHub repo; "the vast majority of the work should take place during the Game Off submission period"; templates and starter projects allowed; push before deadline. "Pushing your code to GitHub does not submit your entry."
- **License:** your choice; open source encouraged, not required.
- **AI:** allowed; a disclosure question at submission.
- **Tools and assets:** any engine; Bevy is named as an example. Open source, commercial, commissioned and original assets all allowed.
- **Prizes:** none stated beyond being featured on the GitHub blog.
- **Scoring mechanics (itch.io, documented):** 5-star scale per criterion, ranked by average; Overall is the average of all criteria; scores stay private; hosts may enable a rating queue. **Median adjustment (admin-stated in forums, not in docs):** `adjustment = sqrt(min(median, votes_received) / median)`; entries at or above the median keep their raw score ([leafo](https://itch.io/post/8993133), [thread](https://itch.io/post/8970561)).
- As of 2026-11-07 the jam page shows 3,426 joined.

## 2. What past Game Off winners did

| Year | Entries / ratings | #1 overall | Engine | Browser | Team | Notes |
|---|---|---|---|---|---|---|
| 2025 | 709 / 10,414 | Evaw | Godot | HTML5 only | 4 | 10-level puzzle-platformer; "not meant to be completed in one sitting"; speedrun timer, secrets ([itch](https://wafflenaut-games.itch.io/evaw), [results](https://itch.io/jam/game-off-2025/results), [blog](https://github.blog/open-source/gaming/light-waves-rising-tides-and-drifting-ships-game-off-2025-winners/)) |
| 2024 | 507 / 4,696 | Trail of Secrets | Godot | HTML5 + Windows | 2 | "A few minutes" sessions, 12 finales; 51 ratings ([itch](https://grumelkeks.itch.io/trail-of-secrets), [results](https://itch.io/jam/game-off-2024/results), [blog](https://github.blog/open-source/game-off-2024-winners/)) |
| 2023 | 609 / 8,765 (median 10) | Glory to SCALE | Godot C# | Download only, 805 MB | ~7 credited | Point-and-click, two endings; won with 9 ratings ([itch](https://liquidpixel-media.itch.io/glory-to-scale), [results](https://itch.io/jam/game-off-2023/results), [blog](https://github.blog/open-source/gaming/game-off-2023-results/)) |

Patterns across the 2023 to 2025 top tens:

- **Engines:** Godot and Unity dominate; 2025's top ten were 6 Godot, 4 Unity. No Bevy entry in any top ten. 2024 also had GameMaker, Unreal and Construct 3 entries ([2024 blog](https://github.blog/open-source/game-off-2024-winners/), [2023 blog](https://github.blog/open-source/gaming/game-off-2023-results/)).
- **Scope:** short puzzle, platformer, point-and-click or arcade score-chasers with one twist (e.g. Where The Water Flows: raise/lower sea level; La Ola: typing to keep a stadium wave going).
- **Teams:** 2 to 5 people common; solo top-tens exist (Secondhand 2nd in 2024 with 14 ratings; Untitled Dungeon Crawler won Gameplay 2024).
- **Rating counts are small and uneven:** 2024's #1 had 51 ratings, #2 had 14. With a median around 10 to 20, the adjustment formula is decisive.
- **Postmortems:** none of the checked winner itch pages link a devlog or postmortem. Repos are linked from the blog posts (e.g. [Evaw](https://github.com/Wafflenaut-Games/Evaw), [Trail of Secrets](https://github.com/Grumelkeks/GO2024-TrailOfSecrets)). Whether winners wrote write-ups elsewhere is *unverified*.

## 3. Bevy Jam winners and Bevy-specific lessons

Bevy Jams are 9 to 10 days, 64 to 98 entries, median around 20 ratings. Criteria: Game Design, Execution, Graphics/Visuals, Audio (no Theme or Innovation category) ([#5](https://itch.io/jam/bevy-jam-5/results), [#6](https://itch.io/jam/bevy-jam-6/results), [#7](https://itch.io/jam/bevy-jam-7/results)).

- **#5 winner:** Simon Says, solo (DylanRJohnston), HTML5 only, puzzle; page warns Firefox users of audio stutter and recommends Chrome ([itch](https://dylanrjohnston.itch.io/simon-says), [repo](https://github.com/DylanRJohnston/simon_says)).
- **#6 winner:** A Fistful of Boomerangs, team of 5. #3 Chainboom (team of 4) has the most useful [postmortem](https://janhohenheim.itch.io/chainboom/devlog/964782/postmortem-from-jans-perspective): start from your own template (boilerplate cost a prior team ~20% of the jam), one plugin per feature connected by events, gameplay done 3 days early, `bevy_audio` choppy on wasm (mitigated by loading assets, precompiling shaders, building navmesh before gameplay), prune unmaintained `bevy_*` crates, forward decals broken on web, many unique meshes cause web lag spikes.
- **#7:** PvF (team of 3) won; Laborgeist (9+ people) 2nd, WebGPU-only web build with "known bugs" ([itch](https://janhohenheim.itch.io/laborgeist)).
- **#3 winner LinkSider** (team of 3): Bevy ECS good for splitting work; 20-minute rebuilds when adding dependencies; `std::fs` absent on web so use `include_str!`; audio glitches common in Bevy web builds ([devlog](https://kuviman.itch.io/linksider/devlog/520806/i-tried-bevy-for-the-first-time-for-a-game-jam)).
- **Bevy Jam #1 postmortem** (Mechaburro): prepare menus, asset loading and input before the jam; set up CI on GitHub Actions; test wasm on itch early; time-box audio ([devlog](https://ramirezmike2.itch.io/quien-es-el-mechaburro/devlog/354715/bevy-jam-1-postmortem)).

Bevy facts (primary):

- **Versions:** 0.20 (2026-10-08) is current; 0.19 (2026-06-19), 0.18 (2026-01-13), 0.17 (2025-09-30) ([news](https://bevy.org/news/)). 0.19 introduced BSN scenes and more Feathers widgets; 0.20 changed BSN syntax and added custom sprite materials ([0.19](https://bevy.org/news/bevy-0-19/), [0.20](https://bevy.org/news/bevy-0-20/)). Many tutorials target 0.14 to 0.16 and will not compile unchanged.
- **Template:** `bevy new -t=2d my_game` via `bevy_cli` (alpha, `cli-v0.1.0-alpha.2`, not on crates.io) ([bevy_cli](https://github.com/TheBevyFlock/bevy_cli)). `bevy_new_2d` depends on `bevy = 0.20.1` with features `2d, ui, audio`; `web-release` profile uses `opt-level = "s"`, `lto = "thin"`, `codegen-units = 1`, `strip = "debuginfo"` ([Cargo.toml](https://raw.githubusercontent.com/TheBevyFlock/bevy_new_2d/main/Cargo.toml)). Includes screens, menus, audio, asset tracking, dev tools on backtick, optional `.cargo/config_fast_builds.toml` ([README](https://github.com/TheBevyFlock/bevy_new_2d)).
- **Web build:** `bevy run web --open` to serve; `bevy build --release web --bundle` outputs `target/bevy_web` for upload; `wasm-opt` runs by default on release; override `web/index.html` for a custom loading page ([bevy_cli web docs](https://thebevyflock.github.io/bevy_cli/cli/web.html)).
- **CI/CD:** template workflow builds Windows/macOS/Linux/web, uploads to GitHub Releases and itch.io via butler using a `BUTLER_CREDENTIALS` secret; after first release set the itch project kind to HTML and mark the web upload as played in browser ([workflows](https://github.com/TheBevyFlock/bevy_new_2d/blob/main/docs/workflows.md)).
- **Size:** Bevy's own measurements (2022, small 3D project): default release 13 MB, `opt-level=z` + fat LTO + `codegen-units=1` + `wasm-opt -Oz` 4.8 MB ([examples README](https://github.com/bevyengine/bevy/blob/main/examples/README.md)).
- **Known web issues:** audio stutter (see rule 7), white flash on Windows startup, movement tied to frame rate (use fixed timestep) ([known issues](https://github.com/TheBevyFlock/bevy_new_2d/blob/main/docs/known-issues.md)).

## 4. Jam process and winning advice

Documented:

- **itch.io ratings:** averages per criterion, Overall auto-averaged, host chooses who votes, optional rating queue ([docs](https://itch.io/docs/creators/game-jams)). Median penalty per admin post (section 1). itch.io has no karma/coolness system; users have requested one ([request thread](https://itch.io/t/527869/karma-system-for-the-game-jams)).
- **Ludum Dare Coolness (archived 2017 rules):** "The more games you play and rate, the higher your score"; "More players will find (and likely) rate your game if you have a high Coolness"; "Games that are hard to play have a hard time getting ratings" ([rules 2017](https://ludumdare.com/resources/archive/rules-2017/)). Current ldjam.com rules page could not be fetched; *unverified* whether still identical.
- **GMTK jam rules:** game must run on Windows or in browser; five criteria with no Overall; uploads locked during rating; edit your page fast because "most ratings come at the start"; generative AI art/audio banned ([GMTK 2025](https://itch.io/jam/gmtk-2025)). Mark Brown on his 2026 favourites: "presentation doesn't always matter in game jams"; themes allow a "cheeky" alternative definition ([Substack](https://gmtk.substack.com/p/my-favourite-games-from-gmtk-game-50b)). His general advice to beginners: "start small" ([Q&A](https://medium.com/hackathon-entertainment/gmtk-game-jam-q-a-with-mark-brown-72b157961472), *content unverified*, page returned 403).
- A specific Mark Brown "how to make a jam game" video was not found; *unverified*.

Practitioner postmortems (Ludum Dare solo entrants, itch devlogs): recurring lessons are "aim for stupidly simple" next time ([LD44](https://retroindiejosh.itch.io/the-final-rescue/devlog/81894/ludum-dare-44-postmortem)), finishing is the main success ([LD53](https://dcmpx.remotevs.com/net/gamedev/www/PL/blogs/entry/2276005-ludum-dare-53-post-mortem)), and skipping polish and SFX to save time costs ratings ([LD33](https://www.gamedeveloper.com/business/minimalistic-minimization---a-ludum-dare-compo-postmortem)).

Community folklore (consistent, but no primary data): web builds get several times more ratings; rating others' games and leaving comments gets return ratings ("rate for rate") ([Game Off 2024 thread](https://itch.io/jam/game-off-2024/topic/4364860/is-a-bad-choice-to-not-have-a-web-build)). The "3x engagement for browser games" figure circulating on marketing blogs has no traceable source; *unverified*.

## 5. Failure modes for solo entrants, and the browser effect

- **Not submitting on itch** after pushing to GitHub (explicitly warned in the rules).
- **Download-only build:** a Game Off 2024 entrant reported near-zero downloads and ratings with a Windows-only build ([thread](https://itch.io/jam/game-off-2024/topic/4364860/is-a-bad-choice-to-not-have-a-web-build)). Glory to SCALE won 2023 download-only with 9 ratings, so it is not fatal, but it is the exception.
- **Falling under the median ratings count** and losing to the sqrt penalty (section 1).
- **Audio missing or broken in browser:** one Bevy Jam #1 team cut music entirely after it failed on web ([Mechaburro](https://ramirezmike2.itch.io/quien-es-el-mechaburro/devlog/354715/bevy-jam-1-postmortem)). Audio is 1 of 6 criteria.
- **Tooling time sink for a Bevy newcomer:** 20 to 40 second rebuilds, 20 minute dependency rebuilds, physics discoverability, version churn ([LinkSider](https://kuviman.itch.io/linksider/devlog/520806/i-tried-bevy-for-the-first-time-for-a-game-jam), [Chainboom](https://janhohenheim.itch.io/chainboom/devlog/964782/postmortem-from-jans-perspective)). Use the template's fast-builds config and dynamic linking in dev.
- **Scope creep and late UI:** UI left to the last day, fewer levels than planned ([at the end of the hall](https://piefayth.itch.io/at-the-end-of-the-hall/devlog/964759/at-the-end-of-the-hall-postmortem)).
- **Web performance cliffs:** trimesh colliders, many unique meshes, 4K resolution, WebGPU-only builds (section 3).
- **Data on browser effect:** no rigorous published dataset found. Evidence is itch admin ordering (browser > Windows > Mac/Linux), the Bevy Jam page statement, Ludum Dare's 2017 rule text, and winner pages. A University of Alberta itch.io jam-mining paper was located but not read for platform effects; *unverified* ([listing](https://asgaard.ece.ualberta.ca/publications/?tgid=20)).

## Sources

- https://github.blog/open-source/gaming/game-off-2026-the-theme-is-shift/
- https://itch.io/jam/game-off-2026
- https://itch.io/jam/game-off-2025 and /results; https://itch.io/jam/game-off-2024/results; https://itch.io/jam/game-off-2023/results
- https://github.blog/open-source/gaming/light-waves-rising-tides-and-drifting-ships-game-off-2025-winners/
- https://github.blog/open-source/game-off-2024-winners/
- https://github.blog/open-source/gaming/game-off-2023-results/
- https://github.blog/tag/game-off/
- Winner pages: https://wafflenaut-games.itch.io/evaw, https://nademtis.itch.io/gameoff2025-where-the-water-flows, https://grumelkeks.itch.io/trail-of-secrets, https://liquidpixel-media.itch.io/glory-to-scale
- https://itch.io/docs/creators/game-jams
- https://itch.io/post/8993133 and https://itch.io/post/8970561 (median adjustment, admin leafo)
- https://itch.io/t/1474777/gamejam-statistics-about-effect-of-available-platforms-on-number-of-ratings
- https://itch.io/jam/game-off-2024/topic/4364860/is-a-bad-choice-to-not-have-a-web-build
- https://itch.io/t/527869/karma-system-for-the-game-jams
- https://ludumdare.com/resources/archive/rules-2017/
- https://itch.io/jam/gmtk-2025; https://gmtk.substack.com/p/my-favourite-games-from-gmtk-game-50b
- Bevy Jams: https://itch.io/jam/bevy-jam-5/results, https://itch.io/jam/bevy-jam-6/results, https://itch.io/jam/bevy-jam-7 and /results
- https://dylanrjohnston.itch.io/simon-says; https://janhohenheim.itch.io/laborgeist
- https://janhohenheim.itch.io/chainboom/devlog/964782/postmortem-from-jans-perspective
- https://piefayth.itch.io/at-the-end-of-the-hall/devlog/964759/at-the-end-of-the-hall-postmortem
- https://ramirezmike2.itch.io/quien-es-el-mechaburro/devlog/354715/bevy-jam-1-postmortem
- https://kuviman.itch.io/linksider/devlog/520806/i-tried-bevy-for-the-first-time-for-a-game-jam
- https://bevy.org/news/ ; https://bevy.org/news/bevy-0-20/ ; https://bevy.org/news/bevy-0-19/ ; https://bevy.org/news/bevy-0-18/
- https://github.com/bevyengine/bevy/blob/main/examples/README.md
- https://github.com/TheBevyFlock/bevy_new_2d (README, docs/workflows.md, docs/known-issues.md, Cargo.toml)
- https://github.com/TheBevyFlock/bevy_cli ; https://thebevyflock.github.io/bevy_cli/cli/web.html
- https://necrashter.github.io/bevy-choppy-music-workaround

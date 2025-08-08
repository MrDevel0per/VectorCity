Title: Vector City – Engagement, Story, and Gameplay Plan

Goals
- Make the game more fun, readable, and winnable while preserving a fast start.
- Add story beats and evolving “moments” that change short‑term goals.
- Reward mastery with clear win/lose, streak scoring, and light persistence.

High‑level improvements (suggestions)
1) Story/Context
   - Give each run a radio-style narrative and escalations via timed “events”.
   - Short mission briefings at start; light debrief at win/lose.
   - District codename and seed logging for replay chatter.

2) Dynamic Events (moment-to-moment story)
   - Mutation Spike: temporary spread boost → forces scan + barrier play.
   - Citywide Curfew: citizens slow → better catch-up moment.
   - Supply Airdrop: instant burst of vaccines (agency moment).
   - Hotspot Ignition: seeds a small cluster → quick containment puzzle.
   - Optional future: Weather front (fog/heavy rain), Blackout (scan cooldown changes), VIP extract, etc.

3) Pulse Scan (clarity + tracking)
   - Already improved: expanding ring + halos that FOLLOW detected infected for ~2s.
   - Optional future: chain beacon effect if repeatedly scanned.

4) Barriers (impact)
   - Larger, taller, and “solid”: trap citizens who are inside on placement; block entry for outsiders.
   - Visual cylindrical wall + top ring to read “enclosure”.
   - Optional future: link two barriers to form a wall segment; or decay mechanics.

5) Balance
   - Slower early infection ramp, then increases as time passes.
   - Deaths require a minimum time spent infected; deaths are probability-based per second after that.
   - Vaccines spawn more often and scale slightly with infection pressure.
   - Background seeding periodically spawns new cases even when you cleared all (keeps pressure on) until level time ends.

6) Win/Lose & Scoring
   - Win: maintain infections ≤ 3 for 30s.
   - Lose: casualties exceed difficulty cap.
   - Score sources: heals, pickups, scans, containment streak seconds; penalty in future could be applied for casualties.
   - Persist best score in localStorage and show on main menu (future).

7) Tutorial / Tasks
   - Clear “current” vs “done” states with progress bar; pop toasts per step.
   - Steps: move → pickup → scan → heal → barrier → overview.

8) Minimap
   - Clear player arrow in center; citizens as colored dots; show deceased separately.

9) Future (not implemented now; candidates)
   - Upgrades between waves (choose 1 of 3 perks).
   - District progression (3-5 stages), boss-style outbreak.
   - Drones or medic NPC.
   - Achievements and daily modifiers.
   - Replay seed and analytics.

Implemented in this delivery
- Dynamic Events Director (Mutation Spike, Curfew, Supply Airdrop, Hotspot Ignition).
- Solid Trapping Barriers (taller tube that traps those inside).
- Pulse Scan tracking halos that follow targets ~2s.
- Slower early spread ramp (difficulty-based), vaccine frequency buffed, deaths require min infected time.
- Background seeding of new infections on lull.
- Win/Lose with return-to-menu on Continue.
- Tutorial/task UI with checkmarks and progress.
- Minimap player arrow for clarity.
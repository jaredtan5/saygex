# Character Bot Battles

## Goal
Add a solo mode where the player chooses a *Mushoku Tensei* character opponent, with distinct difficulty and presentation, while keeping the existing local two-player mode.

## What will change
- Add a mode selector for **Solo** and **Two Players**.
- Add a character roster with portraits and difficulty labels:
  - **Sylphie — Novice**: mostly casual moves with basic blocking.
  - **Eris — Apprentice**: aggressive tactical play.
  - **Roxy — Adept**: stronger attack and defense.
  - **Nanahoshi — Expert**: deeper strategic search.
  - **Rudeus — Master**: strongest search with opening awareness.
- Show the selected opponent’s portrait, name, difficulty, turn state, and score beside the player’s identity.
- Make bot turns automatic after a short readable pause, lock the board while the bot is thinking, and handle resets or mode changes safely.
- Keep legal Connect Four rules, win highlights, draws, round scoring, alternating starters, and match reset behavior.
- Replace the current painterly academy background with newly generated anime-style fantasy academy scenery inspired by the series’ warm, detailed worldbuilding.
- Generate a coordinated set of character portraits for the roster and active opponent display.
- Update visible wording and sharing metadata to reflect solo character battles.

## Technical details
- Keep all game logic local in React; no account, database, or online service is needed during play.
- Extract reusable board evaluation helpers and implement tiered bot behavior, ranging from weighted legal moves to depth-limited minimax with alpha-beta pruning.
- Ensure the bot cannot move after a reset, mode switch, completed round, or stale timer.
- Use semantic design tokens for the refreshed anime-fantasy presentation and retain reduced-motion support.
- Verify every difficulty can complete turns, wins and draws resolve correctly, controls remain usable during bot thinking, and layouts work on desktop and mobile.

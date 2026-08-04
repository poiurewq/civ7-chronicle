# Chronicle - Stats, Graphs & Hall of Fame

A UI-only quality-of-life mod for **Sid Meier's Civilization VII**. Per-turn graphs and breakdowns for every player, plus a Hall of Fame across campaigns.

Civ 7 tracks a lot of historical data and barely shows it. Chronicle surfaces it.

## What it does

Open a full-screen stats overlay from:

- **F2** any turn while the map is focused. Rebind under Options → Accessibility → Keyboard + Mouse.
- The **pause menu** on any turn. Chronicle leaves the pause menu open behind it.
- The **end-of-game results screen**. Accessibility hotkeys including F2 do not fire there, same as the base game.

Open **Hall of Fame** from the Main Menu or from the Chronicle overlay. It lists every campaign Chronicle has tracked: win/loss record, per-leader and per-civilization stats, game history, and high-score / fastest-finish boards. Open any past game for Chronicle graphs from the log.

This mod changes no gameplay rules and does **not** affect your saved games.

### Languages

Full UI in **English**, **Simplified Chinese (简体中文)**, and **Traditional Chinese (繁體中文)**. The Add-Ons menu name and description match. Dynamic game names such as Ages, leaders, unit types, and victory paths use the game's own translations.

### Two views of most stats

Most charts have a **Trends** line for how the stat moved turn by turn and a **Standings** bar for where every civ ranks right now. Toggle under the chart. Same data, two views.

By-type breakdowns and World settlement leaderboards are current snapshots, so they have a single view. Population Share and the religion charts keep full Trends ⇄ Standings.

### Categories

- **Research:** Science, Culture, Technologies, Civics, and Great Works, plus per-citizen ratios.
- **Economy:** net Gold per turn, treasury, Gold per Citizen, Trade Routes, Production, Buildings and Improvements owned, Overbuilds, Wonders, and Great People.
- **Society:** Population, Food, Happiness, Influence, Urban Districts, urbanization, and Tourism.
- **Expansion:** Settlements Total, Cities vs Towns, Settlements Lost, and Settlement Cap.
- **Military:** Units Killed and Lost, Units Owned, kills and losses by unit type, Settlements Conquered / Conquest %, Settlements Razed, and IPs Dispersed.
- **Overall:** Score and the four victory-path point totals: Cultural, Economic, Military, Scientific.
- **World:** Buildings, Improvements, and Districts by type, a board of every Wonder each civ owns, Settlement leaderboards, Population Share, Religion Spread, and Religion by Population.

### Details

- Every chart includes **all players**, including you. The base game's own charts hide the local player.
- **Hover** a line point for its exact value at that turn. **Click** a civ in the legend to hide or show its line.
- **Hold and drag** in a Trends plot to scrub turns: a vertical crosshair snaps to the nearest logged turn, with dots on each visible series and a multi-civ value panel. Release clears. Hover tooltips stay when you are not scrubbing.
- Stats the base game leaves empty are filled in: **Civics**, **net Gold per turn**, **Units Killed**, and **Units Lost**. Technologies and Civics **count Masteries**, not just base nodes.
- **Eliminated civs** drop out of current standings. Their Units Killed, Lost, and trained stay on the Military charts.
- Trend lines start where the data begins and stop at the last real point.
- Charts with no data are **hidden automatically**. An Antiquity game will not show empty Tourism or Great People charts.
- Colors too dark to read are brightened. Near-identical civ colors are nudged apart.

### Fog of war and settings

On a **live mid-game** open, Chronicle hides civs you have not met. No line, bar, legend entry, tooltip, by-type column, or settlement-board row. Captions say how many civs are withheld, for example `3 civs not yet met`. Settlement boards filter by **plot discovery**, not owner-met. Religions founded by unmet civs are hidden. You are always fully visible.

Fog is **off** for end-game results, Hall of Fame, and Game Details. Take *just one more turn* and fog returns. The per-turn log is never fogged, so post-game review still has the full record.

**Settings** use one stored value in two places:

- Main Menu or pause → **Options → Add-ons → Chronicle**
- An **Options** button in every Chronicle / Hall of Fame / Game Details header

The first setting is **Show data for civs you haven't met**. Default off, so fog stays on. Hotkey rebinding is on Chronicle's own Options panel only, not Add-ons.

### Keyboard navigation

While Chronicle or Game Details is open:

- **1–7:** jump category. On Hall of Fame, **1–5** jump tabs.
- **- =:** previous / next category. Same keys step Hall of Fame tabs.
- **[ ]:** previous / next chart.
- **, .:** Trends / Standings, or prev / next page on multi-page bars.
- **H:** open or close Hall of Fame from live Chronicle.
- **O:** open or close Options.
- **Escape:** close the topmost overlay.

Rebind under **Options** in the overlay header. Number keys **1–7** stay fixed. A short footer hint shows the current binds.

## Where the data comes from

Each chart uses whichever source holds more of your game:

- **Chronicle's own per-turn log.** The only source that **spans Ages**. It only knows turns Chronicle was actually running for.
- **The game's own per-turn record.** Covers the **current Age in full**, including turns from before you enabled Chronicle. Only that Age. The game rebuilds it each Age.

Enable Chronicle mid-game and you still get a full chart for the current Age rather than a stub. The caption under each chart names the source.

When the game's version of a stat is not quite the same thing, the chart says so rather than quietly swapping it. **Settlements Total** becomes **Settlements Founded** when it falls back, because the game counts what you *founded*, not what you currently *hold*.

## Limitations

- **Cross-Age history exists only for Ages you played with Chronicle enabled.** Enable it before starting a game for the whole story. The game itself can only fill in the Age you are currently in.
- **By-type breakdowns** span every Age Chronicle was running for. The game keeps only the current Age, so Chronicle banks each Age's tally as it ends. Captions name the Ages covered.
- A trend line from Chronicle's log needs **3+ recorded turns**. A game logged from turn 1 shows from turn 2. A standings bar needs only the current turn, so Standings can appear before Trends on a freshly enabled game.

## Installation

On Steam, **subscribe on the Steam Workshop**. Steam downloads and updates the mod for you. Non-Steam players can install the zip by hand, or use **CivMods**.

### Option A: Steam Workshop

1. Open the [Chronicle Workshop page](https://steamcommunity.com/sharedfiles/filedetails/?id=3761407790) and click **Subscribe**.
2. Launch Civ 7 → **Additional Content / Mods** → enable **Chronicle - Stats, Graphs & Hall of Fame**.

Steam keeps it up to date. To uninstall, **Unsubscribe**.

### Option B: manual install

1. Get the latest zip from [CivFanatics Downloads](https://forums.civfanatics.com/resources/chronicle-stats-graphs-hall-of-fame.32899/) or this repo's release package.
2. Locate your Civ 7 mods folder:
   - **macOS:** `~/Library/Application Support/Civilization VII/Mods/`
   - **Windows:** `%LOCALAPPDATA%\Firaxis Games\Sid Meier's Civilization VII\Mods\`
3. Copy the entire `ozq-chronicle` folder into that `Mods` folder.
4. Launch Civ 7 → **Additional Content / Mods** → enable **Chronicle - Stats, Graphs & Hall of Fame**.

To uninstall, disable it in the Mods menu or delete the `ozq-chronicle` folder.

### Option C: CivMods

If you use [CivMods](https://civmods.com), open the [Chronicle install link](https://civmods.com/install?modCfId=32899). Download the app first if you do not have it yet.

> **Don't mix install paths.** Workshop subscription, a hand-copied `Mods/` folder, and a CivMods install share the same mod id and conflict. Pick one.

## Compatibility

- Additive UI patch. It overwrites no base-game files, so it is resilient to game updates and unlikely to conflict with other mods.
- Requires the base game only. No dependencies.
- Chronicle stores its per-turn log under the community shared `modSettings` key. Same convention as Policy Yields Previews, City Hall, and Better Options Menu. Their settings are preserved when Chronicle reads and writes its own data.
- Updating from an older Chronicle migrates existing history into the shared key automatically on first launch.

## For mod developers: a Civ 7 `localStorage` bug

The Civ 7 UI engine, Coherent Gameface, has a **key-blind `localStorage.getItem`**: it returns the origin's **first key in sort order**, not the key you asked for. `localStorage.key(i)` is blind too. Only `setItem` and `removeItem` are correctly keyed.

If your UI mod runs in the game scope and reads `localStorage` by key:

- Whichever installed mod holds the **first-sorting key** answers *every* `getItem` in that shared origin. Your `getItem` may hand you another mod's value, including Chronicle's.
- There is no keyed-read fallback. Only the origin's first row is readable.
- The modding community's answer is to **share one key**, `modSettings`, with one sub-object per mod. Several popular settings mods already enforce this. Some clear the whole origin when they find a second key.
- Since 0.31.0 Chronicle follows the convention too. Data lives under `modSettings["ozq-chronicle"]`. Writes preserve every other mod's sub-object. The origin is never cleared unless reads are actually blocked, and even then Chronicle keeps a copy of the row it displaced.
- If your mod persists anything, put it under a `modSettings` sub-key rather than your own key. A private key both breaks other mods' reads and will likely be erased at the next boot.

This is an **engine bug**, not anything specific to Chronicle. It convincingly imitates data corruption, a size quota, or an engine freeze.

Reported to 2K Support as ticket #16348750, July 2026. Full public writeup with a minimal repro mod and UI.log evidence: [CivFanatics thread](https://forums.civfanatics.com/threads/ui-modding-localstorage-getitem-ignores-the-key-argument-and-always-returns-the-first-stored-keys-value-repro-inside-reported-to-2k-as-16348750.703995/). If you can reproduce it too, adding your findings there helps make the case for a fix.

## Feedback

Bug reports and suggestions are welcome. Please open an issue on the [GitHub repository](https://github.com/poiurewq/civ7-chronicle/issues).

## License

Released under the MIT License. See [`LICENSE`](LICENSE).

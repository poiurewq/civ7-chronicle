# Chronicle — Stats & Graphs

A quality-of-life UI mod for **Sid Meier's Civilization VII** that adds a proper
statistics screen — per-turn graphs and breakdowns for every player.

Civ 7 tracks a lot of historical data during a game but never really shows it to
you. Chronicle surfaces it.

## What it does

Adds a **Chronicle** button in two places — the **pause menu** (openable on any
turn) and the **end-of-game results screen** — that opens a full-screen overlay
of charts, organized into categories:

- **Growth** — per-turn line charts of yields and rates over time: Science,
  Culture, Gold, Food, Production, Population, Happiness, Influence, Technologies,
  Civics, plus derived ratios like Urbanization % and Science per Citizen.
- **Totals** — cumulative counts over time: Cities, Wonders, Great People, Units
  Killed / Lost, plus Trade Routes, Great Works, and Urban Districts.
- **By Type** — grouped bar charts broken down by type, one bar series per
  player: Units Trained / Killed / Lost by unit, Buildings and Districts by type
  (paged when there are many types), plus a per-player **Wonders** board.
- **Standings** — end-of-game bars comparing every civ at a glance: trade routes,
  great works, wonders, urban districts, settlements, conquests, and
  size-normalized ratios (urbanization, science per citizen, trade per city,
  conquest share).
- **World** — leaderboards across the whole map: the largest cities, and which
  religion holds the most settlements.

Every chart includes **all players** — including you (the base game's own chart
code hides the local player). Empty categories are hidden automatically, and a
chart only appears for data the current game actually recorded. Colors that would
be too dark to read on the chart are brightened, and near-identical civ colors are
nudged apart so every line stays distinct.

This is a **UI-only** mod. It changes no gameplay rules and is flagged so it does
**not** affect your saved games.

## Limitations

- The game's own per-turn history covers only the **current Age** (Antiquity,
  Exploration, or Modern). Chronicle works around this by logging its own per-turn
  snapshots while enabled, so charts it tracks (Growth yields, Techs, Civics) can
  span Ages — but only for the Ages you played **with Chronicle enabled**. Charts
  read straight from the game's summary still cover the final Age only.
- A few stats the game declares aren't populated in its summary (e.g. Civics has
  no per-turn series), so Chronicle derives those live from game state instead.

## Installation

1. Locate your Civ 7 mods folder:
   - **macOS:** `~/Library/Application Support/Civilization VII/Mods/`
   - **Windows:** `%LOCALAPPDATA%\Firaxis Games\Sid Meier's Civilization VII\Mods\`
2. Copy the entire `ozq-chronicle` folder into that `Mods` folder.
3. Launch Civ 7 → **Additional Content / Mods** → enable **Chronicle — Stats &
   Graphs**.
4. In-game, open the pause menu (Escape) any turn and click **Chronicle** — or
   click **Chronicle** on the end-of-game results screen.

To uninstall, disable it in the Mods menu or delete the `ozq-chronicle` folder.

## Compatibility

- Additive UI patch — it overwrites no base-game files, so it's resilient to
  game updates and unlikely to conflict with other mods.
- Requires the base game only. No dependencies.

## Feedback

Bug reports and suggestions are welcome — please open an issue on the
[GitHub repository](https://github.com/poiurewq/civ7-chronicle/issues).

## License

Released under the MIT License. See [`LICENSE`](LICENSE).

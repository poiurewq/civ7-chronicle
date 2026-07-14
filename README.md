# Chronicle — Stats & Graphs

A quality-of-life UI mod for **Sid Meier's Civilization VII** that adds a proper
statistics screen — per-turn graphs and breakdowns for every player.

Civ 7 tracks a lot of historical data during a game but never really shows it to
you. Chronicle surfaces it.

## What it does

Adds a **Chronicle** button in two places — the **pause menu** (openable on any
turn) and the **end-of-game results screen** — that opens a full-screen overlay
of charts.

### Two views of most stats

Most stats have a **Trends** line (how it moved turn by turn) and a **Standings** bar
(where every civ ranks right now). Toggle between them under the chart — it's the same
data shown two ways, so the two can never disagree.

The by-type breakdowns (Military and Construction) and a few World settlement
leaderboards are snapshots of the current standings, so they have a single view and
no toggle. Population Share and the two religion charts have full Trends ⇄ Standings
like everything else.

### Categories

- **Research** — Science, Culture, Technologies, Civics, and Great Works, plus
  per-citizen ratios.
- **Economy** — net Gold per turn, treasury, Gold per Citizen, Trade Routes,
  Production, Wonders, and Great People.
- **Society** — Food, Population, Happiness, Influence, Urban Districts,
  urbanization, and Tourism.
- **Expansion** — Settlements, Settlement Cap, Cities vs Towns, and conquests.
- **Military** — Units Killed and Units Lost over time, plus Units Trained and kills
  and losses broken down by unit type.
- **Construction** — Buildings and Districts by type (paged when there are many),
  plus a per-player board of every Wonder each civ built.
- **World** — whole-map views: largest settlements, most urbanized, and settlement sizes
  (live snapshots), plus Population Share, Religion Spread, and Religion by Population
  as Trends ⇄ Standings over time.

### Details

- Every chart includes **all players** — including you (the base game's own chart
  code hides the local player).
- **Hover** any point on a line to read its exact value at that turn. **Click** a civ
  in the legend to hide or show its line.
- Stats the base game never populates — **Civics**, **net Gold per turn**, **Units
  Killed** and **Units Lost** — are filled in. Technologies and Civics **count
  Masteries**, not just base nodes.
- **Eliminated civs still count** where it matters. A defeated civ drops out of the
  current standings (it has no treasury or population any more), but the units it
  killed, lost and trained are a permanent part of the game, so it keeps its place in
  the Military charts.
- Trend lines start where the data begins and stop at the last real point.
- Charts with no data are **hidden automatically**, so an Antiquity game won't show
  you empty Tourism or Great People charts.
- Colors too dark to read are brightened, and near-identical civ colors are nudged
  apart so every line stays distinct.

This is a **UI-only** mod. It changes no gameplay rules and is flagged so it does
**not** affect your saved games.

## Where the data comes from

Chronicle draws on two sources, and each chart uses whichever one holds more of your game:

- **Chronicle's own per-turn log.** The only source that **spans Ages** — it carries charts
  across Antiquity, Exploration, and Modern, where the game's own history does not. But it
  only knows the turns Chronicle was actually running for.
- **The game's own per-turn record.** Covers the **current Age in full**, including turns
  from before you enabled Chronicle — but only that Age (the game rebuilds it each Age).

So if you enable Chronicle partway through a game, you still get a full chart for the
current Age rather than a stub. The caption under each chart tells you which source it used.

Where the game's version of a stat isn't quite the same thing, the chart says so rather than
quietly swapping it: **Settlements Total** becomes **Settlements Founded** when it falls back,
because the game counts what you *founded*, not what you currently *hold*.

## Limitations

- **Cross-Age history exists only for the Ages you played with Chronicle enabled.** Enable it
  before starting a game to get the whole story; the game itself can only fill in the Age
  you're currently in.
- The **by-type breakdowns** (Military and Construction: units, buildings, districts,
  wonders) span every Age that Chronicle was running for — the game itself keeps only the
  current one, so Chronicle banks each Age's tally as it ends. The caption under each
  breakdown names the Ages it covers, so you always know what you are looking at.
- A trend line drawn from Chronicle's own log needs **3+ recorded turns** (a couple of points
  across a long game would be misleading rather than informative), though a game logged from
  turn 1 shows from turn 2. A standings bar needs only the current turn, so on a freshly-enabled
  game the Standings can appear before the Trends do.

## Installation

The easiest way is to **subscribe on the Steam Workshop** — Steam downloads and
updates the mod for you. Installing manually also works if you'd rather not use the
Workshop (or you're playing a non-Steam copy).

### Option A — Steam Workshop (recommended)

1. Open the [Chronicle Workshop page](https://steamcommunity.com/sharedfiles/filedetails/?id=3761407790)
   and click **Subscribe**.
2. Launch Civ 7 → **Additional Content / Mods** → make sure **Chronicle — Stats &
   Graphs** is enabled.

Steam keeps it up to date automatically. To uninstall, just **Unsubscribe**.

### Option B — manual install

1. Locate your Civ 7 mods folder:
   - **macOS:** `~/Library/Application Support/Civilization VII/Mods/`
   - **Windows:** `%LOCALAPPDATA%\Firaxis Games\Sid Meier's Civilization VII\Mods\`
2. Copy the entire `ozq-chronicle` folder into that `Mods` folder.
3. Launch Civ 7 → **Additional Content / Mods** → enable **Chronicle — Stats &
   Graphs**.

To uninstall, disable it in the Mods menu or delete the `ozq-chronicle` folder.

> **Don't do both.** If you subscribe on the Workshop *and* place a copy in `Mods/`,
> the two share the same mod id and conflict — pick one.

### Using it

In-game, open the pause menu (Escape) any turn and click **Chronicle** — or click
**Chronicle** on the end-of-game results screen. Press **Escape** to close Chronicle
again (it leaves the pause menu open behind it).

## Compatibility

- Additive UI patch — it overwrites no base-game files, so it's resilient to
  game updates and unlikely to conflict with other mods.
- Requires the base game only. No dependencies.
- Chronicle stores its per-turn log in the UI's `localStorage`. If you run another UI
  mod that also uses `localStorage`, see the note below.

## For mod developers — a Civ 7 `localStorage` bug

The Civ 7 UI engine (Coherent Gameface) has a **key-blind `localStorage.getItem`**: it
returns the origin's **first key in sort order**, not the key you asked for.
`localStorage.key(i)` is blind too. Only `setItem` and `removeItem` are correctly keyed.

Consequences, if your UI mod runs in the game scope and reads `localStorage` by key:

- Whichever installed mod holds the **first-sorting key** answers *every* `getItem` in
  that shared origin — so your `getItem` may hand you another mod's value, including
  Chronicle's.
- There is no keyed-read fallback. Chronicle works around it by storing everything under
  a single key named `!chronicle`, whose leading `!` sorts ahead of essentially any key
  another mod would use, keeping its own reads reliable.

This is an **engine bug**, not anything specific to Chronicle. It's worth knowing about
before you spend days debugging what looks like data corruption, a size quota, or an
engine "freeze" — it convincingly imitates all three.

## Feedback

Bug reports and suggestions are welcome — please open an issue on the
[GitHub repository](https://github.com/poiurewq/civ7-chronicle/issues).

## License

Released under the MIT License. See [`LICENSE`](LICENSE).

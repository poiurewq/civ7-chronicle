const LOG = "[ozq-chronicle]";

globalThis.ozqChronicleCommon || console.error("[ozq-chronicle] chronicle-common.js did not load before this script — check the UIScripts order in ozq-chronicle.modinfo");

const {chronicleI18n: chronicleI18n, L: T, metricKeyLabel: metricKeyLabel, typeDisplayName: typeDisplayName, prettifyTypeEnglish: prettifyTypeEnglish, resolveTypeNameOrNull: resolveTypeNameOrNull, PANEL_BOX: PANEL_BOX, HEADER_BOX: HEADER_BOX, TITLE_COL_ROW: TITLE_COL_ROW, TITLE_TEXT: TITLE_TEXT, HEADER_ACTIONS: HEADER_ACTIONS, CHART_SRC: CHART_SRC, makeNativeButton: makeNativeButton, highlightButton: highlightButton, makeSettingsButton: makeSettingsButton, CANCEL_ACTIONS: CANCEL_ACTIONS, isPressFinished: isPressFinished, installFrontInputHandler: installFrontInputHandler, scheduleInstall: scheduleInstall, noteOverlayOpened: noteOverlayOpened, isTopOverlay: isTopOverlay, forgetOverlay: forgetOverlay, isSyntheticReligionLabel: isSyntheticReligionLabel, resolvePlayerReligionName: resolvePlayerReligionName, makeIsMajorPid: makeIsMajorPid, readSettings: readSettings, formatHotkeyCode: formatHotkeyCode, resolveHotkeyCode: resolveHotkeyCode, isWatchedEngineAction: isWatchedEngineAction, engineCodesForAction: engineCodesForAction, isEngineBoundHotkeyCode: isEngineBoundHotkeyCode, refreshEngineKeyMap: refreshEngineKeyMap, hotkeySlotForCode: hotkeySlotForCode, EAT_WORLD_ENGINE_ACTIONS: EAT_WORLD_ENGINE_ACTIONS, stopKeydownPeers: stopKeydownPeers, readHotkeys: readHotkeys, probeKeydownLog: probeKeydownLog, probeEngineLog: probeEngineLog, hotkeyNow: hotkeyNow, SHARED_KEY: SHARED_KEY, SUB_KEY: SUB_KEY} = globalThis.ozqChronicleCommon;

function metricYTitle(id, opts) {
  const api = chronicleI18n();
  return api && api.metricYTitle && api.metricYTitle(id, opts) || "";
}

function formatChartNumber(n, opts) {
  const api = chronicleI18n();
  return api && api.formatChartNumber ? api.formatChartNumber(n, opts) : null != n && isFinite(Number(n)) ? String(n) : "";
}

function locSrcYTitle(metric, src) {
  if (!metric) return "";
  const summary = !(!src || "summary" !== src.source);
  return metricYTitle(metric.id, {
    summary: summary
  }) || "";
}

let activeRoot = null, rootCounter = 0;

let viewMode = null;

function isHistoricalView() {
  return !(!viewMode || !viewMode.store);
}

function currentGameSeed() {
  try {
    const g = Configuration.getGame();
    if (g && null != g.gameSeed) return g.gameSeed;
  } catch (e) {}
  return null;
}

function resolveGameId() {
  const setup = function() {
    try {
      const g = Configuration.getGame();
      if (g && null != g.campaignSetupGUID && String(g.campaignSetupGUID).length) return String(g.campaignSetupGUID);
    } catch (e) {}
    return null;
  }(), seed = currentGameSeed(), seedOk = null != seed && "0" !== String(seed);
  return setup && seedOk ? `${setup}_${seed}` : seedOk ? `seed:${seed}` : setup || null;
}

let _storeLayoutCache = null, _trendSourceCache = null, _probeTrendCache = null, _summaryTurnCache = null, _stockSnapshotCache = null;

function invalidateOpenCaches() {
  _storeLayoutCache = null, _stockSnapshotCache = null, _trendSourceCache = null, 
  _probeTrendCache = null, _summaryTurnCache = null, _visiblePidCache = null, _relVisibleCache = null, 
  _hiddenMajorCount = null;
}

function loadLoggerStore() {
  const ctx = ensureStoreLayout();
  return ctx ? ctx.store : null;
}

const isMajorPid = makeIsMajorPid(loadLoggerStore);

let openedFromEndGame = !1, fogOn = !1, _visiblePidCache = null, _relVisibleCache = null, _hiddenMajorCount = null, hasMetThrewLogged = !1, revealThrewLogged = !1;

function localPlayerId() {
  try {
    if ("undefined" != typeof GameContext && null != GameContext.localPlayerID) return Number(GameContext.localPlayerID);
  } catch (e) {}
  return -1;
}

function computeFogActive() {
  if (isHistoricalView()) return !1;
  if (!isLiveGameContext()) return !1;
  let want = !0;
  try {
    want = !!readSettings().fog;
  } catch (e) {}
  return !!want && !(openedFromEndGame && !function() {
    try {
      return !(!Game.AgeProgressManager || !Game.AgeProgressManager.isExtendedGame);
    } catch (e) {
      return !1;
    }
  }());
}

function isVisiblePid(pid) {
  if (!fogOn) return !0;
  const n = Number(pid);
  if (_visiblePidCache || (_visiblePidCache = new Map), _visiblePidCache.has(n)) return _visiblePidCache.get(n);
  let visible = !1;
  const local = localPlayerId();
  if (n === local) visible = !0; else if (local >= 0) try {
    visible = !!Game.Diplomacy.hasMet(local, n);
  } catch (e) {
    visible = !1, hasMetThrewLogged || (hasMetThrewLogged = !0, console.error(`${LOG} fog: Game.Diplomacy.hasMet threw for pid ${n} (${e}) — hiding it`));
  }
  return _visiblePidCache.set(n, visible), visible;
}

function isVisibleMajorPid(pid) {
  return isMajorPid(pid) && isVisiblePid(pid);
}

function hiddenMajorCount() {
  if (!fogOn) return 0;
  if (null != _hiddenMajorCount) return _hiddenMajorCount;
  let n = 0;
  try {
    for (const p of Players.getAlive()) p && p.isMajor && !isVisiblePid(p.id) && n++;
  } catch (e) {
    n = 0;
  }
  return _hiddenMajorCount = n, n;
}

function isVisibleReligionHash(hash) {
  if (!fogOn) return !0;
  if (_relVisibleCache || (_relVisibleCache = new Map), _relVisibleCache.has(hash)) return _relVisibleCache.get(hash);
  const meta = religionMeta(hash), visible = !(!meta || null == meta.pid || !isVisiblePid(meta.pid));
  return _relVisibleCache.set(hash, visible), visible;
}

function isSettlementRevealed(city) {
  if (!fogOn) return !0;
  try {
    const loc = city && city.location;
    if (!loc || null == loc.x || null == loc.y) return !1;
    return GameplayMap.getRevealedState(localPlayerId(), loc.x, loc.y) !== RevealedStates.HIDDEN;
  } catch (e) {
    revealThrewLogged || (revealThrewLogged = !0, console.error(`${LOG} fog: GameplayMap.getRevealedState unavailable (${e}) — hiding unrevealed settlements by owner-met instead`));
    try {
      return isVisiblePid(city.owner);
    } catch (e2) {
      return !1;
    }
  }
}

function bracketCiTurn() {
  if (isHistoricalView()) return {
    curCi: null,
    curTurn: 1 / 0
  };
  return {
    curCi: currentAgeCi(),
    curTurn: "undefined" != typeof Game && null != Game.turn ? Game.turn : 1 / 0
  };
}

function ensureStoreLayout() {
  const bracketKey = function() {
    const {curCi: curCi, curTurn: curTurn} = bracketCiTurn();
    return (isHistoricalView() ? "h" : "l") + ":" + String(curCi) + ":" + String(curTurn);
  }();
  if (_storeLayoutCache && _storeLayoutCache.bracketKey === bracketKey) return _storeLayoutCache;
  const store = function() {
    if (viewMode && viewMode.store) return viewMode.store;
    let container = null;
    try {
      const raw = localStorage.getItem(SHARED_KEY), row0 = raw ? JSON.parse(raw) : null;
      row0 && row0[SUB_KEY] && row0[SUB_KEY].games ? container = row0[SUB_KEY] : row0 && row0.games && (container = row0);
    } catch (e) {}
    if (!container || !container.games) return null;
    const gid = resolveGameId();
    if (gid && container.games[gid] && container.games[gid].ages) return container.games[gid];
    const seed = currentGameSeed();
    if (null != seed) for (const k in container.games) {
      const g = container.games[k];
      if (g && g.ages && g.fp && g.fp.seed === seed) return g;
    }
    return null;
  }();
  if (!store) return _storeLayoutCache = null, null;
  const built = function(store) {
    const empty = {
      layout: [],
      earliestCi: null,
      end: 0
    };
    if (!store || !store.ages) return empty;
    const ages = Object.keys(store.ages).map(k => {
      const m = resolveAgeMeta(k, store.ages[k]);
      return {
        key: k,
        turns: store.ages[k].turns,
        ci: m.ci,
        label: m.label
      };
    }).sort((a, b) => a.ci - b.ci), {curCi: curCi, curTurn: curTurn} = bracketCiTurn();
    let cursor = 0;
    const layout = [];
    for (const age of ages) {
      if (null != curCi && age.ci > curCi) continue;
      let turns = Object.keys(age.turns || {}).map(Number).sort((a, b) => a - b);
      if (null != curCi && age.ci === curCi && (turns = turns.filter(t => t <= curTurn)), 
      !turns.length) continue;
      const minT = turns[0], maxT = turns[turns.length - 1];
      layout.push({
        age: age,
        turns: turns,
        minT: minT,
        offset: cursor
      }), cursor += maxT - minT + 2;
    }
    const end = Math.max(0, cursor - 2);
    return {
      layout: layout,
      earliestCi: layout.length ? layout[0].age.ci || 0 : null,
      end: end
    };
  }(store);
  return _storeLayoutCache = {
    store: store,
    layout: built.layout,
    earliestCi: built.earliestCi,
    end: built.end,
    bracketKey: bracketKey
  }, _storeLayoutCache;
}

const CATEGORIES = [ "Research", "Economy", "Society", "Expansion", "Military", "Overall", "World" ], METRICS = [ {
  id: "score",
  category: "Overall",
  trend: {
    loggerKey: "score"
  }
}, {
  id: "vCul",
  category: "Overall",
  trend: {
    loggerKey: "vCul"
  }
}, {
  id: "vEco",
  category: "Overall",
  trend: {
    loggerKey: "vEco"
  }
}, {
  id: "vMil",
  category: "Overall",
  trend: {
    loggerKey: "vMil"
  }
}, {
  id: "vSci",
  category: "Overall",
  trend: {
    loggerKey: "vSci"
  }
}, {
  id: "Science",
  category: "Research",
  default: !0,
  trend: {
    loggerKey: "Science",
    summary: {
      id: "Science",
      scope: "Player"
    }
  }
}, {
  id: "Culture",
  category: "Research",
  trend: {
    loggerKey: "Culture",
    summary: {
      id: "Culture",
      scope: "Player"
    }
  }
}, {
  id: "TechsAcquired",
  category: "Research",
  trend: {
    loggerKey: "TechsAcquired",
    stepped: !0,
    summary: {
      id: "TechsAcquired",
      scope: "Player"
    }
  }
}, {
  id: "CivicsAcquired",
  category: "Research",
  trend: {
    loggerKey: "CivicsAcquired",
    stepped: !0
  }
}, {
  id: "ratioSciPerCitizen",
  category: "Research",
  trend: {
    ratioKey: {
      num: "Science",
      den: "tpop",
      scale: 1,
      dp: 1
    }
  }
}, {
  id: "ratioCulPerCitizen",
  category: "Research",
  trend: {
    ratioKey: {
      num: "Culture",
      den: "tpop",
      scale: 1,
      dp: 1
    }
  }
}, {
  id: "trendGreatWorks",
  category: "Research",
  trend: {
    loggerKey: "gw",
    stepped: !0
  }
}, {
  id: "goldNet",
  category: "Economy",
  trend: {
    loggerKey: "goldNet",
    signed: !0
  }
}, {
  id: "ratioGoldPerCitizen",
  category: "Economy",
  trend: {
    ratioKey: {
      num: "goldNet",
      den: "tpop",
      scale: 1,
      dp: 1
    },
    signed: !0
  }
}, {
  id: "Gold",
  category: "Economy",
  trend: {
    loggerKey: "gold",
    summary: {
      id: "Gold",
      scope: "Player"
    }
  }
}, {
  id: "trendTrade",
  category: "Economy",
  trend: {
    loggerKey: "tr",
    stepped: !0
  }
}, {
  id: "Production",
  category: "Economy",
  trend: {
    loggerKey: "Production",
    summary: {
      id: "Production",
      scope: "City"
    }
  }
}, {
  id: "trendBuildings",
  category: "Economy",
  trend: {
    loggerKey: "bld",
    stepped: !0,
    summary: {
      id: "BuildingsConstructed",
      scope: "Player",
      delta: !0
    }
  }
}, {
  id: "trendImprovements",
  category: "Economy",
  trend: {
    loggerKey: "imp",
    stepped: !0
  }
}, {
  id: "trendOverbuilds",
  category: "Economy",
  trend: {
    loggerKey: "ob",
    stepped: !0,
    includeDead: !0
  }
}, {
  id: "WondersConstructed",
  category: "Economy",
  trend: {
    loggerKey: "won",
    stepped: !0,
    summary: {
      id: "WondersConstructed",
      scope: "Player",
      delta: !0
    }
  }
}, {
  id: "gp",
  category: "Economy",
  trend: {
    loggerKey: "gp",
    stepped: !0,
    summary: {
      id: "GreatPeopleEarned",
      scope: "Player",
      delta: !0
    }
  }
}, {
  id: "Population",
  category: "Society",
  trend: {
    loggerKey: "tpop",
    summary: {
      id: "Population",
      scope: "City"
    }
  }
}, {
  id: "Food",
  category: "Society",
  trend: {
    loggerKey: "Food",
    summary: {
      id: "Food",
      scope: "City"
    }
  }
}, {
  id: "hap",
  category: "Society",
  trend: {
    loggerKey: "hap",
    signed: !0
  }
}, {
  id: "inf",
  category: "Society",
  trend: {
    loggerKey: "inf",
    signed: !0
  }
}, {
  id: "trendUrban",
  category: "Society",
  trend: {
    loggerKey: "urb",
    stepped: !0
  }
}, {
  id: "ratioUrban",
  category: "Society",
  trend: {
    ratioKey: {
      num: "upop",
      den: "tpop",
      scale: 100,
      dp: 0
    }
  }
}, {
  id: "tour",
  category: "Society",
  trend: {
    loggerKey: "tour",
    summary: {
      id: "Tourism",
      scope: "City"
    }
  }
}, {
  id: "CitiesTotal",
  category: "Expansion",
  trend: {
    loggerKey: "set",
    stepped: !0,
    summary: {
      id: "CitiesFounded",
      scope: "Player",
      delta: !0
    }
  }
}, {
  id: "trendCities",
  category: "Expansion",
  trend: {
    loggerKey: "cityN",
    stepped: !0
  }
}, {
  id: "trendTowns",
  category: "Expansion",
  trend: {
    loggerKey: "townN",
    stepped: !0
  }
}, {
  id: "trendSettlementsLost",
  category: "Expansion",
  trend: {
    loggerKey: "sLost",
    stepped: !0,
    includeDead: !0
  }
}, {
  id: "trendSettlementCap",
  category: "Expansion",
  trend: {
    loggerKey: "cap",
    stepped: !0
  }
}, {
  id: "ratioSettlementCap",
  category: "Expansion",
  trend: {
    ratioKey: {
      num: "set",
      den: "cap",
      scale: 100,
      dp: 0
    }
  }
}, {
  id: "uKill",
  category: "Military",
  trend: {
    loggerKey: "uKill",
    stepped: !0,
    includeDead: !0,
    summary: {
      id: "UnitsKilled",
      scope: "Player",
      delta: !0
    }
  }
}, {
  id: "uLost",
  category: "Military",
  trend: {
    loggerKey: "uLost",
    stepped: !0,
    includeDead: !0,
    summary: {
      id: "UnitsLost",
      scope: "Player",
      delta: !0
    }
  }
}, {
  id: "UnitsOwnedByType",
  category: "Military",
  kind: "bar",
  byType: "stock",
  lookup: "Units"
}, {
  id: "UnitsKilledByType",
  category: "Military",
  kind: "bar",
  byType: "event",
  eventKey: "kbt",
  majorsOnly: !0,
  lookup: "Units"
}, {
  id: "UnitsLostByType",
  category: "Military",
  kind: "bar",
  byType: "event",
  eventKey: "lbt",
  majorsOnly: !0,
  lookup: "Units"
}, {
  id: "CitiesConquered",
  category: "Military",
  trend: {
    loggerKey: "conqA",
    campaignFromAgeLocal: !0,
    stepped: !0,
    summary: {
      id: "CitiesConquered",
      scope: "Player",
      delta: !0
    }
  }
}, {
  id: "ratioConquest",
  category: "Military",
  trend: {
    ratioKey: {
      num: "conqA",
      den: "set",
      scale: 100,
      dp: 0,
      campaignSumNum: !0
    }
  }
}, {
  id: "trendRazed",
  category: "Military",
  trend: {
    loggerKey: "rz",
    stepped: !0,
    includeDead: !0
  }
}, {
  id: "trendIndDisp",
  category: "Military",
  trend: {
    loggerKey: "indDisp",
    stepped: !0,
    includeDead: !0
  }
}, {
  id: "BuildingsOwnedByType",
  category: "World",
  kind: "bar",
  byType: "stock",
  lookup: "Constructibles"
}, {
  id: "ImprovementsOwnedByType",
  category: "World",
  kind: "bar",
  byType: "stock",
  lookup: "Constructibles"
}, {
  id: "DistrictsOwnedByType",
  category: "World",
  kind: "bar",
  byType: "stock",
  lookup: "Districts"
}, {
  id: "WondersOwnedByType",
  category: "World",
  kind: "board",
  byType: "stock",
  lookup: "Constructibles"
}, {
  id: "liveLargestCities",
  category: "World",
  kind: "live",
  compute: function() {
    const rows = settlementRowsForCharts().slice();
    rows.sort((a, b) => b.pop - a.pop);
    const top = rows.slice(0, 15);
    return {
      labels: top.map(r => r.name),
      data: top.map(r => r.pop),
      colors: top.map(r => ownerColor({
        ownerPlayer: r.pid
      })),
      indexAxis: "y",
      valueTitle: metricKeyLabel("Population"),
      catTitle: ""
    };
  }
}, {
  id: "liveMostUrbanized",
  category: "World",
  kind: "live",
  compute: function() {
    const rows = [];
    for (const r of settlementRowsForCharts()) {
      const tot = r.pop, urb = r.urb;
      null == tot || null == urb || isNaN(tot) || isNaN(urb) || tot < MIN_URBAN_POP || rows.push({
        name: r.name,
        pct: Math.round(100 * urb / tot),
        pid: r.pid
      });
    }
    rows.sort((a, b) => b.pct - a.pct);
    const top = rows.slice(0, 15);
    if (!top.length) return {
      labels: [],
      data: [],
      colors: [],
      indexAxis: "y",
      valueTitle: "",
      catTitle: ""
    };
    return {
      labels: top.map(r => r.name),
      data: top.map(r => r.pct),
      colors: top.map(r => ownerColor({
        ownerPlayer: r.pid
      })),
      indexAxis: "y",
      valueTitle: metricKeyLabel("ratioUrban"),
      catTitle: ""
    };
  }
}, {
  id: "liveSizeDist",
  category: "World",
  kind: "live",
  compute: function() {
    const counts = SIZE_BUCKETS.map(() => 0);
    let any = !1;
    for (const r of settlementRowsForCharts()) {
      const pop = r.pop;
      if (null != pop && !isNaN(pop)) for (let i = 0; i < SIZE_BUCKETS.length; i++) if (pop >= SIZE_BUCKETS[i][0] && pop <= SIZE_BUCKETS[i][1]) {
        counts[i]++, any = !0;
        break;
      }
    }
    if (!any) return {
      labels: [],
      data: [],
      colors: [],
      indexAxis: "x",
      valueTitle: "",
      catTitle: ""
    };
    return {
      labels: SIZE_BUCKETS.map(([lo, hi]) => hi === 1 / 0 ? `${lo}+` : `${lo}–${hi}`),
      data: counts,
      colors: SIZE_BUCKETS.map((_, i) => SIZE_BAR_COLORS[i]),
      indexAxis: "x",
      valueTitle: metricKeyLabel("set"),
      catTitle: metricKeyLabel("Population")
    };
  }
}, {
  id: "popShare",
  category: "World",
  trend: {
    ratioKey: {
      num: "tpop",
      denSum: "tpop",
      scale: 100,
      dp: 1
    }
  }
}, {
  id: "relSpread",
  category: "World",
  trend: {
    religionKey: "s",
    stepped: !0
  }
}, {
  id: "relPop",
  category: "World",
  trend: {
    religionKey: "p"
  }
} ];

function ownerName(obj) {
  const pid = obj && obj.ownerPlayer;
  if (isHistoricalView() && viewMode.store && viewMode.store.meta && viewMode.store.meta.players) {
    const rec = viewMode.store.meta.players[pid] || viewMode.store.meta.players[String(pid)];
    if (rec && rec.leader) return type = rec.leader, resolveTypeNameOrNull("Leaders", type) || prettifyType(type);
  }
  var type;
  try {
    const p = Players.get(pid);
    if (p && p.leaderName) return Locale.compose(p.leaderName);
  } catch (e) {}
  return `Player ${pid}`;
}

function ownerColor(obj) {
  const pid = obj && obj.ownerPlayer;
  try {
    const m = function() {
      if (colorMapCache) return colorMapCache;
      const map = new Map, placed = [];
      let pids = [];
      if (isHistoricalView() && viewMode.store && viewMode.store.ages) {
        const seen = new Set;
        for (const k in viewMode.store.ages) {
          const turns = viewMode.store.ages[k].turns || {};
          for (const t in turns) {
            const turnRow = turns[t], p = turnRow && turnRow.p || {};
            for (const pid in p) seen.add(Number(pid));
          }
        }
        try {
          const f = viewMode.store.relFounders;
          if (f) for (const k in f) {
            const n = Number(f[k]);
            Number.isFinite(n) && seen.add(n);
          }
        } catch (e) {}
        try {
          const ss = viewMode.store.ss;
          if (ss) for (const r of ss) if (r && null != r.o) {
            const n = Number(r.o);
            Number.isFinite(n) && seen.add(n);
          }
        } catch (e) {}
        pids = [ ...seen ];
      } else if (isLiveGameContext()) try {
        pids = Players.getAlive().filter(p => p).map(p => p.id);
      } catch (e) {}
      pids.sort((a, b) => a - b);
      let pi = 0;
      for (const pid of pids) {
        let raw = "#B0B0B0";
        if (isHistoricalView() || !isLiveGameContext()) {
          const banked = bankedPrimaryColor(pid);
          raw = banked || HIST_PALETTE[pi % HIST_PALETTE.length];
        } else try {
          raw = UI.Player.getPrimaryColorValueAsString(pid);
        } catch (e) {}
        pi++;
        const rgb = parseColor(raw);
        if (!rgb) {
          map.set(pid, raw);
          continue;
        }
        const finalRgb = disambiguate(ensureContrast(rgb), placed);
        placed.push(finalRgb), map.set(pid, rgbCss(finalRgb));
      }
      return colorMapCache = map, map;
    }();
    if (m.has(pid)) return m.get(pid);
  } catch (e) {}
  let raw = "#B0B0B0";
  try {
    raw = UI.Player.getPrimaryColorValueAsString(pid);
  } catch (e) {}
  return function(raw) {
    const rgb = parseColor(raw);
    return rgb ? rgbCss(ensureContrast(rgb)) : raw;
  }(raw);
}

function ownerColorSecondary(obj) {
  const pid = obj && obj.ownerPlayer;
  if (isHistoricalView() && viewMode.store && viewMode.store.meta && viewMode.store.meta.players) {
    const rec = viewMode.store.meta.players[pid] || viewMode.store.meta.players[String(pid)];
    if (rec && rec.sec) return rec.sec;
  }
  try {
    return UI.Player.getSecondaryColorValueAsString(pid);
  } catch (e) {
    return "#FFFFFF";
  }
}

function resolveAgeMeta(ageKey, ageObj) {
  let ci = ageObj && null != ageObj.ci ? ageObj.ci : null, label = ageObj && ageObj.label ? ageObj.label : "";
  if (null == ci || !label) try {
    if ("undefined" != typeof GameInfo && GameInfo.Ages) for (const a of GameInfo.Ages) if (String(a.$hash) === String(ageKey) || a.AgeType === ageKey) {
      null == ci && (ci = a.ChronologyIndex), label || (label = a.AgeType);
      break;
    }
  } catch (e) {}
  return {
    ci: null != ci ? ci : 0,
    label: label || String(ageKey)
  };
}

function loggerValueOf(metric) {
  const r = metric.ratioKey;
  if (r) {
    const scale = null != r.scale ? r.scale : 1, dp = null != r.dp ? r.dp : 1, f = Math.pow(10, dp);
    return (v, all) => {
      if (!v || null == v[r.num]) return null;
      let den;
      if (r.denSum) {
        if (!all) return null;
        den = 0;
        for (const pid in all) isVisiblePid(pid) && all[pid] && null != all[pid][r.denSum] && (den += all[pid][r.denSum]);
      } else den = v[r.den];
      return null == den || 0 === den ? null : Math.round(scale * v[r.num] / den * f) / f;
    };
  }
  const key = metric.loggerKey;
  return v => v && null != v[key] ? v[key] : null;
}

function turnAxisTicks(blocks, start, end) {
  const values = [], labels = new Map, visible = blocks.filter(b => b.offset + (b.maxT - b.minT) >= start && b.offset <= end);
  return visible.forEach((b, bi) => {
    const bEndX = b.offset + (b.maxT - b.minT), lo = b.minT + (Math.max(start, b.offset) - b.offset), hi = b.minT + (Math.min(end, bEndX) - b.offset), step = function(range) {
      const raw = Math.max(1, range) / 5, pow = Math.max(1, Math.pow(10, Math.floor(Math.log10(raw))));
      for (const m of [ 1, 2, 5, 10 ]) if (m * pow >= raw) return m * pow;
      return 10 * pow;
    }(hi - lo), turns = new Set(bi === visible.length - 1 ? [ lo, hi ] : [ lo ]);
    for (let t = Math.ceil(lo / step) * step; t < hi; t += step) t > lo && turns.add(t);
    Array.from(turns).sort((a, z) => a - z).forEach((t, i) => {
      const x = b.offset + (t - b.minT);
      values.push(x);
      const tl = String(Math.round(t));
      labels.set(x, 0 === i ? [ b.label, tl ] : tl);
    });
  }), {
    values: values,
    labelAt: x => {
      const v = labels.get(x);
      return null != v ? v : "";
    }
  };
}

function countTurnsWhere(hasData, layout, earliestCi) {
  let turnCount = 0, firstCi = null, firstT = null, firstAgeLabel = "";
  for (const L of layout) for (const t of L.turns) hasData(L.age.turns[t]) && (turnCount++, 
  null == firstCi && (firstCi = L.age.ci || 0, firstT = t, firstAgeLabel = L.age.label || L.age.key));
  const fromGameStart = function(firstCi, firstT, earliestCi) {
    return null != firstCi && null != earliestCi && firstCi === earliestCi && null != firstT && firstT <= 1;
  }(firstCi, firstT, earliestCi);
  return {
    turnCount: turnCount,
    firstCi: firstCi,
    firstT: firstT,
    firstAgeLabel: firstAgeLabel,
    fromGameStart: fromGameStart,
    lineOk: turnCount >= (fromGameStart ? 2 : 3),
    standOk: turnCount >= 1
  };
}

const NO_TURNS = {
  turnCount: 0,
  firstCi: null,
  firstT: null,
  firstAgeLabel: "",
  fromGameStart: !1,
  lineOk: !1,
  standOk: !1
};

function countLoggerTurns(metric, layout, earliestCi) {
  if (!layout || !layout.length || !metric.loggerKey && !metric.ratioKey) return NO_TURNS;
  const valueOf = loggerValueOf(metric);
  return countTurnsWhere(turnRow => {
    const p = turnRow && turnRow.p || {};
    for (const pid in p) if (isVisibleMajorPid(pid) && null != valueOf(p[pid], p)) return !0;
    return !1;
  }, layout, earliestCi);
}

function countReligionTurns(metric, layout, earliestCi) {
  const key = metric.religionKey;
  return key && layout && layout.length ? countTurnsWhere(turnRow => {
    const rel = turnRow && turnRow.rel;
    for (const h in rel) if (rel[h] && null != rel[h][key] && isVisibleReligionHash(h)) return !0;
    return !1;
  }, layout, earliestCi) : NO_TURNS;
}

function probeTrend(trend) {
  if (!trend) return {
    standOk: !1,
    trendOk: !1,
    loggerLineOk: !1,
    loggerTurnCount: 0,
    summaryTurnCount: 0
  };
  if (_probeTrendCache || (_probeTrendCache = new WeakMap), _probeTrendCache.has(trend)) return _probeTrendCache.get(trend);
  let loggerTurnCount = 0, loggerLineOk = !1, loggerStandOk = !1;
  if (trend.religionKey || trend.loggerKey || trend.ratioKey) {
    const ctx = ensureStoreLayout(), layout = ctx ? ctx.layout : [], earliestCi = ctx ? ctx.earliestCi : null, counted = trend.religionKey ? countReligionTurns(trend, layout, earliestCi) : countLoggerTurns(trend, layout, earliestCi);
    loggerTurnCount = counted.turnCount, loggerLineOk = counted.lineOk, loggerStandOk = counted.standOk;
  }
  const summaryTurnCount = !isHistoricalView() && trend.summary ? function(trend) {
    const spec = trend && trend.summary;
    if (!spec || isHistoricalView()) return 0;
    if ("undefined" == typeof Game || !Game.Summary || "function" != typeof Game.Summary.getDataSets) return 0;
    _summaryTurnCache || (_summaryTurnCache = new Map);
    const cacheKey = String(spec.id) + ":" + String(spec.scope) + ":" + (spec.delta ? "1" : "0");
    if (_summaryTurnCache.has(cacheKey)) return _summaryTurnCache.get(cacheKey);
    let n = 0;
    try {
      const objectMap = new Map;
      Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
      const sets = Game.Summary.getDataSets(spec.id);
      if (!sets || !sets.length) return _summaryTurnCache.set(cacheKey, 0), 0;
      const curTurn = null != Game.turn ? Game.turn : 1 / 0, turnSet = new Set;
      for (const ds of sets) {
        const o = null != ds.owner ? objectMap.get(ds.owner) : null;
        if (o && o.type === spec.scope && null != o.ownerPlayer && ds.values && ds.values.length) for (const pt of ds.values) null == pt.x || null == pt.y || pt.x > curTurn || turnSet.add(pt.x);
      }
      n = turnSet.size;
    } catch (e) {
      n = 0;
    }
    return _summaryTurnCache.set(cacheKey, n), n;
  }(trend) : 0, result = {
    standOk: loggerStandOk || summaryTurnCount >= 1,
    trendOk: loggerLineOk || summaryTurnCount >= 2,
    loggerLineOk: loggerLineOk,
    loggerTurnCount: loggerTurnCount,
    summaryTurnCount: summaryTurnCount
  };
  return _probeTrendCache.set(trend, result), result;
}

function trendAvailable(metric) {
  try {
    return !!(metric && metric.trend && probeTrend(metric.trend).trendOk);
  } catch (e) {
    return !1;
  }
}

function standAvailable(metric) {
  try {
    return !!(metric && metric.trend && probeTrend(metric.trend).standOk);
  } catch (e) {
    return !1;
  }
}

function majorPidsIn(layout) {
  const pids = new Set;
  for (const L of layout) for (const t of L.turns) {
    const turnRow = L.age.turns[t], p = turnRow && turnRow.p || {};
    for (const pid in p) isVisibleMajorPid(pid) && pids.add(pid);
  }
  return pids;
}

function makePlayerSeries(metric, pid) {
  const valueOf = loggerValueOf(metric), campaignPlain = !!metric.campaignFromAgeLocal, ratioSpec = metric.ratioKey, campaignRatio = !(!ratioSpec || !ratioSpec.campaignSumNum);
  let pastLocal = 0, lastLocal = null;
  return {
    value(turnRow) {
      const p = turnRow && turnRow.p || {}, row = p[pid];
      if (campaignRatio) {
        const r = function(row, ratioSpec, pastLocal) {
          const local = row && null != row[ratioSpec.num] ? row[ratioSpec.num] : null, den = row && null != row[ratioSpec.den] ? row[ratioSpec.den] : null;
          if (null == local || null == den || 0 === den) return {
            local: local,
            y: null
          };
          const scale = null != ratioSpec.scale ? ratioSpec.scale : 1, dp = null != ratioSpec.dp ? ratioSpec.dp : 1, f = Math.pow(10, dp);
          return {
            local: local,
            y: Math.round(scale * (pastLocal + local) / den * f) / f
          };
        }(row, ratioSpec, pastLocal);
        return null != r.local && (lastLocal = r.local), r.y;
      }
      const y = valueOf(row, p);
      return null == y ? null : campaignPlain ? (lastLocal = y, pastLocal + y) : y;
    },
    ageEnd() {
      null != lastLocal && (pastLocal += lastLocal), lastLocal = null;
    }
  };
}

function buildSeriesDatasets(metric, spec) {
  const empty = {
    datasets: [],
    start: 0,
    end: 0,
    blocks: [],
    turnCount: 0,
    startedLate: !1,
    firstAgeLabel: "",
    firstTurn: 0,
    currentAgeOnly: !1,
    source: "logger"
  }, ctx = ensureStoreLayout();
  if (!ctx || !ctx.store || !ctx.store.ages) return empty;
  const layout = ctx.layout, counted = spec.count(layout, ctx.earliestCi);
  if (!counted.lineOk) return empty;
  const {turnCount: turnCount, firstT: firstT, firstAgeLabel: firstAgeLabel, fromGameStart: fromGameStart} = counted, datasets = [];
  for (const key of spec.seriesKeys(layout)) {
    const reader = spec.reader(key), data = [];
    for (const L of layout) {
      for (const t of L.turns) {
        const y = reader.value(L.age.turns[t]);
        null != y && data.push({
          x: L.offset + (t - L.minT),
          y: y
        });
      }
      reader.ageEnd();
    }
    data.length && datasets.push(Object.assign({
      data: data,
      parsing: !1,
      pointRadius: 0,
      stepped: !!metric.stepped,
      tension: metric.stepped ? 0 : .15
    }, spec.style(key)));
  }
  const startedLate = !fromGameStart && null != firstT, blocks = layout.map(L => ({
    offset: L.offset,
    minT: L.minT,
    maxT: L.turns[L.turns.length - 1],
    label: prettifyType(L.age.label || L.age.key)
  }));
  let firstX = null, lastX = null;
  for (const ds of datasets) {
    if (!ds.data.length) continue;
    const a = ds.data[0].x, b = ds.data[ds.data.length - 1].x;
    (null == firstX || a < firstX) && (firstX = a), (null == lastX || b > lastX) && (lastX = b);
  }
  return {
    datasets: datasets,
    start: null != firstX ? firstX : 0,
    end: null != lastX ? lastX : ctx.end,
    blocks: blocks,
    turnCount: turnCount,
    startedLate: startedLate,
    firstAgeLabel: firstAgeLabel,
    firstTurn: null != firstT ? firstT : 0,
    currentAgeOnly: !1,
    source: "logger"
  };
}

function trendSourceUncached(trend) {
  if (trend.religionKey) return buildReligionDatasets(trend);
  const logged = (metric = trend).religionKey ? buildReligionDatasets(metric) : buildSeriesDatasets(metric, {
    count: (layout, earliestCi) => countLoggerTurns(metric, layout, earliestCi),
    seriesKeys: majorPidsIn,
    reader: pid => makePlayerSeries(metric, pid),
    style: pid => {
      const color = ownerColor({
        ownerPlayer: Number(pid)
      });
      return {
        label: ownerName({
          ownerPlayer: Number(pid)
        }),
        pid: Number(pid),
        borderColor: color,
        backgroundColor: color
      };
    }
  });
  var metric;
  if (isHistoricalView()) return logged;
  const native = function(trend) {
    const empty = {
      datasets: [],
      start: 0,
      end: 0,
      blocks: [],
      turnCount: 0,
      startedLate: !1,
      firstAgeLabel: "",
      firstTurn: 0,
      currentAgeOnly: !0,
      source: "summary"
    }, spec = trend.summary;
    if (!spec || "undefined" == typeof Game || !Game.Summary || "function" != typeof Game.Summary.getDataSets) return empty;
    let objectMap, sets;
    try {
      objectMap = new Map, Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o)), 
      sets = Game.Summary.getDataSets(spec.id);
    } catch (e) {
      return empty;
    }
    if (!sets || !sets.length) return empty;
    const curTurn = "undefined" != typeof Game && null != Game.turn ? Game.turn : 1 / 0, series = [], turnSet = new Set;
    for (const ds of sets) {
      const o = null != ds.owner ? objectMap.get(ds.owner) : null;
      if (!o || o.type !== spec.scope || null == o.ownerPlayer || !ds.values || !ds.values.length) continue;
      const points = new Map;
      for (const pt of ds.values) null == pt.x || null == pt.y || pt.x > curTurn || (points.set(pt.x, pt.y), 
      turnSet.add(pt.x));
      points.size && series.push({
        pid: o.ownerPlayer,
        points: points
      });
    }
    const turns = Array.from(turnSet).sort((a, b) => a - b);
    if (!turns.length) return empty;
    const byPid = new Map;
    for (const s of series) {
      const acc = byPid.get(s.pid) || turns.map(() => 0);
      let running = 0, last = null;
      turns.forEach((t, i) => {
        spec.delta ? (running += s.points.get(t) || 0, acc[i] += running) : (s.points.has(t) && (last = s.points.get(t)), 
        null != last && (acc[i] += last));
      }), byPid.set(s.pid, acc);
    }
    if (!byPid.size) return empty;
    const minT = turns[0], maxT = turns[turns.length - 1], datasets = [];
    for (const [pid, vals] of byPid) {
      if (!isVisibleMajorPid(pid)) continue;
      const owner = {
        ownerPlayer: Number(pid)
      }, color = ownerColor(owner);
      datasets.push({
        label: ownerName(owner),
        pid: Number(pid),
        data: turns.map((t, i) => ({
          x: t - minT,
          y: vals[i]
        })),
        parsing: !1,
        borderColor: color,
        backgroundColor: color,
        pointRadius: 0,
        stepped: !!trend.stepped,
        tension: trend.stepped ? 0 : .15
      });
    }
    const ageLabel = prettifyType(resolveAgeMeta("undefined" != typeof Game && null != Game.age ? String(Game.age) : "", null).label);
    return {
      datasets: datasets,
      start: 0,
      end: maxT - minT,
      blocks: [ {
        offset: 0,
        minT: minT,
        maxT: maxT,
        label: ageLabel
      } ],
      turnCount: turns.length,
      startedLate: !1,
      firstAgeLabel: ageLabel,
      firstTurn: minT,
      currentAgeOnly: !0,
      source: "summary"
    };
  }(trend);
  return logged.turnCount >= native.turnCount ? logged : native;
}

function trendSource(trend) {
  if (_trendSourceCache || (_trendSourceCache = new WeakMap), _trendSourceCache.has(trend)) return _trendSourceCache.get(trend);
  const src = trendSourceUncached(trend);
  return _trendSourceCache.set(trend, src), src;
}

function sourceLabel(src) {
  return "summary" === src.source ? T("LOC_CHRONICLE_SOURCE_NATIVE") : T("LOC_CHRONICLE_SOURCE_LOGGER");
}

function metricLabel(metric) {
  return metricKeyLabel(metric.id);
}

function isPlayerAlive(pid) {
  if (isHistoricalView()) return !0;
  try {
    return !!Players.isAlive(Number(pid));
  } catch (e) {
    return !1;
  }
}

function buildStandings(trend) {
  if (trend.religionKey) return function(trend) {
    const key = trend.religionKey, relCat = T("LOC_CHRONICLE_RELIGION"), empty = {
      labels: [],
      data: [],
      colors: [],
      indexAxis: "x",
      catTitle: relCat,
      signed: !1
    };
    if (!key) return empty;
    const rel = function() {
      const ctx = ensureStoreLayout();
      if (!ctx) return null;
      for (let i = ctx.layout.length - 1; i >= 0; i--) {
        const L = ctx.layout[i];
        for (let j = L.turns.length - 1; j >= 0; j--) {
          const row = L.age.turns[L.turns[j]];
          if (row && row.rel && Object.keys(row.rel).length) return row.rel;
        }
      }
      return null;
    }();
    if (!rel) return empty;
    const rows = [];
    for (const h in rel) {
      const y = rel[h] && rel[h][key];
      if (null == y) continue;
      if (!isVisibleReligionHash(h)) continue;
      const meta = religionMeta(h);
      rows.push({
        label: meta.name,
        value: y,
        color: meta.color
      });
    }
    if (rows.sort((a, b) => b.value - a.value), !rows.length) return empty;
    return {
      labels: rows.map(r => r.label),
      data: rows.map(r => r.value),
      colors: rows.map(r => r.color),
      indexAxis: "x",
      catTitle: relCat,
      signed: !1
    };
  }(trend);
  const src = trendSource(trend), includeDead = !!trend.includeDead, rows = [];
  if ("summary" === src.source && src.turnCount > 0) for (const ds of src.datasets) ds.data.length && (includeDead || isPlayerAlive(ds.pid)) && rows.push({
    label: ds.label,
    value: ds.data[ds.data.length - 1].y,
    color: ds.borderColor
  }); else for (const [pid, y] of function(trend) {
    const out = new Map, ctx = ensureStoreLayout();
    if (!ctx || !ctx.layout.length) return out;
    for (const pid of majorPidsIn(ctx.layout)) {
      const reader = makePlayerSeries(trend, pid);
      let last = null;
      for (const L of ctx.layout) {
        for (const t of L.turns) {
          const y = reader.value(L.age.turns[t]);
          null != y && (last = y);
        }
        reader.ageEnd();
      }
      null != last && out.set(Number(pid), last);
    }
    return out;
  }(trend)) {
    if (!includeDead && !isPlayerAlive(pid)) continue;
    const owner = {
      ownerPlayer: pid
    };
    rows.push({
      label: ownerName(owner),
      value: y,
      color: ownerColor(owner)
    });
  }
  return rows.sort((a, b) => b.value - a.value), {
    labels: rows.map(r => r.label),
    data: rows.map(r => r.value),
    colors: rows.map(r => r.color),
    indexAxis: "x",
    catTitle: "",
    signed: !!trend.signed
  };
}

const BASE_RELIGION_TYPES = [ "RELIGION_BUDDHISM", "RELIGION_CATHOLICISM", "RELIGION_CONFUCIANISM", "RELIGION_HINDUISM", "RELIGION_ISLAM", "RELIGION_JUDAISM", "RELIGION_ORTHODOXY", "RELIGION_PROTESTANTISM", "RELIGION_SHINTO", "RELIGION_SIKHISM", "RELIGION_TAOISM", "RELIGION_ZOROASTRIANISM", "RELIGION_CUSTOM_1", "RELIGION_CUSTOM_2", "RELIGION_CUSTOM_3", "RELIGION_CUSTOM_4", "RELIGION_CUSTOM_5", "RELIGION_CUSTOM_6", "RELIGION_CUSTOM_7", "RELIGION_CUSTOM_8", "RELIGION_CUSTOM_9", "RELIGION_CUSTOM_10", "RELIGION_CUSTOM_11", "RELIGION_CUSTOM_12" ];

function hash32Eq(a, b) {
  if (null == a || null == b) return !1;
  if (a === b || String(a) === String(b)) return !0;
  const na = Number(a), nb = Number(b);
  return !(!Number.isFinite(na) || !Number.isFinite(nb)) && (na === nb || ((0 | na) == (0 | nb) || na >>> 0 == nb >>> 0));
}

function typeHash(type) {
  try {
    if ("undefined" != typeof Database && "function" == typeof Database.makeHash) return Database.makeHash(type);
  } catch (e) {}
  return null;
}

function bankedRelLookup(map, hash) {
  if (!map) return null;
  if (null != map[String(hash)]) return map[String(hash)];
  if (null != map[hash]) return map[hash];
  for (const k in map) if (hash32Eq(k, hash) && null != map[k]) return map[k];
  return null;
}

function isLiveGameContext() {
  if (isHistoricalView()) return !1;
  try {
    return "undefined" != typeof Game && null != Game && "undefined" != typeof Players && null != Players && "function" == typeof Players.getAlive;
  } catch (e) {
    return !1;
  }
}

function religionMeta(hash) {
  let name = `Religion ${hash}`, pid = null, type = null;
  try {
    const store = loadLoggerStore();
    type = function(hash) {
      try {
        const store = loadLoggerStore();
        if (store && store.relTypes) {
          const t = store.relTypes[String(hash)] || store.relTypes[hash];
          if (t) return t;
          for (const k in store.relTypes) if (hash32Eq(k, hash)) return store.relTypes[k];
        }
      } catch (e) {}
      try {
        if ("undefined" != typeof GameInfo && GameInfo.Religions) for (const r of GameInfo.Religions) if (r) {
          if (hash32Eq(r.$hash, hash)) return r.ReligionType || null;
          if (r.ReligionType) {
            const h = typeHash(r.ReligionType);
            if (null != h && hash32Eq(h, hash)) return r.ReligionType;
          }
        }
      } catch (e) {}
      for (const t of BASE_RELIGION_TYPES) {
        const h = typeHash(t);
        if (null != h && hash32Eq(h, hash)) return t;
      }
      return null;
    }(hash);
    const live = isLiveGameContext();
    if (live && type && (pid = function(type) {
      if (!type || !isLiveGameContext()) return null;
      try {
        if (Game.Religion && "function" == typeof Game.Religion.getPlayerFromReligion) {
          const f = Game.Religion.getPlayerFromReligion(type);
          if (null != f && f >= 0) return f;
        }
      } catch (e) {}
      try {
        const alive = Players.getAlive() || [];
        for (const p of alive) {
          if (!p || !p.isMajor || !p.Religion) continue;
          if ("function" == typeof p.Religion.hasCreatedReligion && !p.Religion.hasCreatedReligion()) continue;
          if ("function" != typeof p.Religion.getReligionType) continue;
          const tid = p.Religion.getReligionType();
          if (null != tid) {
            if (hash32Eq(tid, type) || tid === type) return p.id;
            try {
              if ("undefined" != typeof GameInfo && GameInfo.Religions) {
                const def = GameInfo.Religions.lookup(tid);
                if (def && def.ReligionType === type) return p.id;
              }
            } catch (e) {}
          }
        }
      } catch (e) {}
      return null;
    }(type)), null == pid && store) {
      const bf = bankedRelLookup(store.relFounders, hash);
      if (null != bf && "" !== bf) {
        const n = Number(bf);
        Number.isFinite(n) && (pid = n);
      }
    }
    let named = !1;
    if (live && null != pid) try {
      const pl = Players.get(pid), nm = pl && pl.Religion ? resolvePlayerReligionName(pl.Religion) : null;
      nm && (name = nm, named = !0);
    } catch (e) {}
    if (!named && store) {
      const rn = bankedRelLookup(store.relNames, hash);
      rn && !isSyntheticReligionLabel(rn) && (name = String(rn).trim(), named = !0);
    }
    if (!named && type) {
      const sn = function(type) {
        if (!type) return null;
        try {
          if ("undefined" != typeof GameInfo && GameInfo.Religions) {
            const def = GameInfo.Religions.lookup ? GameInfo.Religions.lookup(type) : null;
            if (def && def.Name) {
              const n = Locale.compose(def.Name);
              if (n && n.trim() && 0 !== String(n).indexOf("LOC_")) return n;
            }
            for (const r of GameInfo.Religions) if (r && r.ReligionType === type && r.Name) {
              const n = Locale.compose(r.Name);
              if (n && n.trim() && 0 !== String(n).indexOf("LOC_")) return n;
              break;
            }
          }
        } catch (e) {}
        try {
          const locKey = 0 === String(type).indexOf("RELIGION_CUSTOM_") ? "LOC_RELIGION_CUSTOM_NAME" : "LOC_" + type + "_NAME";
          if ("undefined" != typeof Locale && "function" == typeof Locale.compose) {
            const n = Locale.compose(locKey);
            if (n && n.trim() && String(n) !== locKey && 0 !== String(n).indexOf("LOC_")) return n;
          }
        } catch (e) {}
        return prettifyType(type);
      }(type);
      sn && sn.trim() && (name = sn);
    }
  } catch (e) {}
  return {
    name: name,
    pid: pid,
    color: null != pid ? ownerColor({
      ownerPlayer: pid
    }) : "#B0B0B0",
    type: type
  };
}

function buildReligionDatasets(metric) {
  const key = metric.religionKey;
  return key ? buildSeriesDatasets(metric, {
    count: (layout, earliestCi) => countReligionTurns(metric, layout, earliestCi),
    seriesKeys: layout => {
      const hashes = new Set;
      for (const L of layout) for (const t of L.turns) {
        const turnRow = L.age.turns[t], rel = turnRow && turnRow.rel;
        for (const h in rel) rel[h] && null != rel[h][key] && isVisibleReligionHash(h) && hashes.add(h);
      }
      return hashes;
    },
    reader: hash => function(key, hash) {
      let seen = !1;
      return {
        value(turnRow) {
          const rel = turnRow && turnRow.rel, raw = rel && rel[hash] && null != rel[hash][key] ? rel[hash][key] : null;
          return null != raw && (seen = !0), seen ? null != raw ? raw : 0 : null;
        },
        ageEnd() {}
      };
    }(key, hash),
    style: hash => {
      const meta = religionMeta(hash);
      return {
        label: meta.name,
        borderColor: meta.color,
        backgroundColor: meta.color
      };
    }
  }) : {
    datasets: [],
    start: 0,
    end: 0,
    blocks: [],
    turnCount: 0,
    startedLate: !1,
    firstAgeLabel: "",
    firstTurn: 0,
    currentAgeOnly: !1,
    source: "logger"
  };
}

function currentAgeCi() {
  try {
    if ("undefined" != typeof Game && null != Game.age) return resolveAgeMeta(String(Game.age), null).ci;
  } catch (e) {}
  return null;
}

function prettifyType(type) {
  return typeDisplayName(type) || prettifyTypeEnglish(type);
}

function resolveTypeName(table, type) {
  if (null == type || "" === String(type).trim()) return T("LOC_CHRONICLE_UNKNOWN");
  try {
    const def = GameInfo[table] && GameInfo[table].lookup(type);
    if (def && def.Name) {
      const name = Locale.compose(def.Name);
      if (name && name.trim()) return name;
    }
  } catch (e) {}
  const pretty = prettifyType(type);
  return pretty && pretty.trim() ? pretty : String(type).trim();
}

function readByTypeData(metric) {
  const rows = [], rawTypes = new Set;
  if ("event" === metric.byType) {
    const map = function(eventKey) {
      const store = loadLoggerStore();
      if (!store || !eventKey) return {};
      const m = store[eventKey];
      return m && "object" == typeof m ? m : {};
    }(metric.eventKey);
    for (const pid in map) if ((!metric.majorsOnly || isMajorPid(pid)) && isVisiblePid(pid)) for (const type in map[pid]) {
      const val = map[pid][type];
      null != val && ("26" !== type && (rows.push({
        pid: Number(pid),
        type: type,
        val: val
      }), rawTypes.add(type)));
    }
  } else {
    const cur = new Map, livePids = new Set;
    if (!isHistoricalView()) {
      const live = function(metricId) {
        if (!_stockSnapshotCache) {
          let snap = null;
          try {
            const log = "undefined" != typeof globalThis && globalThis.ozqChronicleLog || "undefined" != typeof window && window.ozqChronicleLog;
            log && "function" == typeof log.snapshotStock && (snap = log.snapshotStock());
          } catch (e) {}
          _stockSnapshotCache = snap || {};
        }
        return _stockSnapshotCache[metricId] || {};
      }(metric.id);
      for (const pid in live) if (livePids.add(Number(pid)), isVisiblePid(pid)) for (const type in live[pid]) cur.set(`${pid}|${type}`, live[pid][type]);
      try {
        for (const p of Players.getAlive()) p && p.isMajor && livePids.add(p.id);
      } catch (e) {}
    }
    for (const r of function(metricId) {
      const rows = [], store = loadLoggerStore();
      if (!store || !store.ages) return rows;
      const curCi = currentAgeCi();
      for (const k of Object.keys(store.ages)) {
        const meta = resolveAgeMeta(k, store.ages[k]);
        if (null != curCi && meta.ci !== curCi) continue;
        const bt = store.ages[k].bt && store.ages[k].bt[metricId];
        if (bt) for (const pid in bt) for (const type in bt[pid]) null != bt[pid][type] && rows.push({
          pid: Number(pid),
          type: type,
          val: bt[pid][type]
        });
      }
      return rows;
    }(metric.id)) {
      if (livePids.has(r.pid)) continue;
      if (!isVisiblePid(r.pid)) continue;
      const k = `${r.pid}|${r.type}`;
      cur.set(k, r.val);
    }
    for (const [k, val] of cur) {
      const sep = k.indexOf("|");
      rows.push({
        pid: Number(k.slice(0, sep)),
        type: k.slice(sep + 1),
        val: val
      }), rawTypes.add(k.slice(sep + 1));
    }
  }
  const canon = function(types, table) {
    const stripNum = id => {
      const tk = String(id).split("_");
      for (;tk.length > 1 && /^\d+$/.test(tk[tk.length - 1]); ) tk.pop();
      return tk.join("_");
    }, groups = new Map;
    for (const t of types) {
      const base = stripNum(t);
      groups.has(base) || groups.set(base, []), groups.get(base).push(t);
    }
    const out = new Map;
    for (const [base, group] of groups) {
      const canon = group.find(t => t === base) || group.slice().sort((a, b) => a.length - b.length)[0], canonName = resolveTypeName(table, canon);
      for (const t of group) out.set(t, resolveTypeName(table, t) === canonName ? canon : t);
    }
    return out;
  }([ ...rawTypes ], metric.lookup), perPlayer = new Map, playerTotal = new Map, typeTotal = new Map;
  for (const {pid: pid, type: type, val: val} of rows) {
    const t = canon.get(type) || type;
    let m = perPlayer.get(pid);
    m || (m = new Map, perPlayer.set(pid, m)), m.set(t, (m.get(t) || 0) + val), playerTotal.set(pid, (playerTotal.get(pid) || 0) + val), 
    typeTotal.set(t, (typeTotal.get(t) || 0) + val);
  }
  const players = [ ...perPlayer.keys() ].sort((a, b) => (playerTotal.get(b) || 0) - (playerTotal.get(a) || 0));
  return {
    perPlayer: perPlayer,
    players: players,
    typeTotal: typeTotal
  };
}

function byTypeNote(metric) {
  return "event" === metric.byType ? T("LOC_CHRONICLE_NOTE_EVENT") : T("LOC_CHRONICLE_NOTE_STOCK");
}

function buildBarChart(metric, page) {
  page = page || 0;
  const {perPlayer: perPlayer, players: players, typeTotal: typeTotal} = readByTypeData(metric), sorted = [ ...typeTotal.keys() ].sort((a, b) => (typeTotal.get(b) || 0) - (typeTotal.get(a) || 0)), shown = sorted.slice(12 * page, 12 * page + 12), nameMap = function(types, table) {
    const byName = new Map;
    for (const t of types) {
      const n = resolveTypeName(table, t);
      byName.has(n) || byName.set(n, []), byName.get(n).push(t);
    }
    const out = new Map;
    for (const [name, group] of byName) {
      if (1 === group.length) {
        out.set(group[0], name);
        continue;
      }
      const tokens = group.map(t => String(t).split("_"));
      let common = 0;
      for (;tokens.every(tk => null != tk[common] && tk[common] === tokens[0][common]); ) common++;
      group.forEach((t, i) => {
        const prefix = tokens[i].slice(common).join(" ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        out.set(t, prefix && prefix !== name ? `${prefix} ${name}` : name);
      });
    }
    return out;
  }(sorted, metric.lookup);
  return {
    labels: shown.map(t => nameMap.get(t)),
    datasets: players.map(pid => {
      const tally = perPlayer.get(pid), color = ownerColor({
        ownerPlayer: pid
      });
      return {
        label: ownerName({
          ownerPlayer: pid
        }),
        data: shown.map(t => tally.get(t) || 0),
        backgroundColor: color,
        borderColor: color
      };
    })
  };
}

function barPageCount(metric) {
  const {typeTotal: typeTotal} = readByTypeData(metric);
  return Math.max(1, Math.ceil(typeTotal.size / 12));
}

function playerCities(p) {
  try {
    if (p && p.Cities && "function" == typeof p.Cities.getCities) return p.Cities.getCities() || [];
  } catch (e) {}
  return [];
}

function cityName(c) {
  try {
    return Locale.compose(c.name);
  } catch (e) {
    return String(c && c.name);
  }
}

function bankedSettlementRows() {
  if (!isHistoricalView() || !viewMode || !viewMode.store) return [];
  const ss = viewMode.store.ss;
  if (!ss || !ss.length) return [];
  const out = [];
  for (const r of ss) r && null != r.p && !isNaN(r.p) && out.push({
    name: null != r.n && "" !== r.n ? r.n : T("LOC_CHRONICLE_SETTLEMENT"),
    pop: r.p,
    urb: r.u,
    pid: r.o
  });
  return out;
}

function settlementRowsForCharts() {
  return isHistoricalView() ? bankedSettlementRows() : function() {
    const rows = [];
    if (!isLiveGameContext()) return rows;
    try {
      for (const p of Players.getAlive()) if (p) for (const c of playerCities(p)) try {
        if (!isSettlementRevealed(c)) continue;
        const pop = c.population;
        if (null == pop || isNaN(pop)) continue;
        let urb;
        try {
          urb = c.urbanPopulation;
        } catch (e) {
          urb = null;
        }
        rows.push({
          name: cityName(c),
          pop: pop,
          urb: urb,
          pid: p.id
        });
      } catch (e) {}
    } catch (e) {}
    return rows;
  }();
}

const SIZE_BUCKETS = [ [ 1, 5 ], [ 6, 10 ], [ 11, 15 ], [ 16, 20 ], [ 21, 1 / 0 ] ], SIZE_BAR_COLORS = [ "#F0DDA0", "#E0C06A", "#C9A94E", "#B0893A", "#8C6522" ];

const MIN_URBAN_POP = 5;

const AXIS_TICK = "#C9BFA6";

function axisTitle(text) {
  return text ? {
    display: !0,
    text: text,
    color: AXIS_TICK
  } : {
    display: !1
  };
}

function parseColor(c) {
  if ("string" != typeof c) return null;
  let m = c.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const n = parseInt(m[1], 16);
    return {
      r: n >> 16 & 255,
      g: n >> 8 & 255,
      b: 255 & n
    };
  }
  if (m = c.match(/^#([0-9a-f]{3})$/i), m) {
    const s = m[1];
    return {
      r: parseInt(s[0] + s[0], 16),
      g: parseInt(s[1] + s[1], 16),
      b: parseInt(s[2] + s[2], 16)
    };
  }
  if (m = c.match(/rgba?\(([^)]+)\)/i), m) {
    const p = m[1].split(",").map(x => parseFloat(x));
    return {
      r: p[0] || 0,
      g: p[1] || 0,
      b: p[2] || 0
    };
  }
  return null;
}

const CHART_BG_RGB = {
  r: 22,
  g: 19,
  b: 14
}, MIN_CONTRAST = 2.4;

function relLuminance(rgb) {
  const chan = v => (v /= 255) <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
  return .2126 * chan(rgb.r) + .7152 * chan(rgb.g) + .0722 * chan(rgb.b);
}

function contrastRatio(a, b) {
  const la = relLuminance(a), lb = relLuminance(b);
  return (Math.max(la, lb) + .05) / (Math.min(la, lb) + .05);
}

function rgbToHsl({r: r, g: g, b: b}) {
  r /= 255, g /= 255, b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  const l = (mx + mn) / 2;
  return 0 !== d && (h = mx === r ? (g - b) / d % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4, 
  h *= 60, h < 0 && (h += 360)), {
    h: h,
    s: 0 === d ? 0 : d / (1 - Math.abs(2 * l - 1)),
    l: l
  };
}

function hslToRgb({h: h, s: s, l: l}) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(h / 60 % 2 - 1)), m = l - c / 2;
  let r = 0, g = 0, b = 0;
  return h < 60 ? (r = c, g = x) : h < 120 ? (r = x, g = c) : h < 180 ? (g = c, b = x) : h < 240 ? (g = x, 
  b = c) : h < 300 ? (r = x, b = c) : (r = c, b = x), {
    r: Math.round(255 * (r + m)),
    g: Math.round(255 * (g + m)),
    b: Math.round(255 * (b + m))
  };
}

function rgbCss(rgb) {
  return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
}

function ensureContrast(rgb) {
  if (contrastRatio(rgb, CHART_BG_RGB) >= MIN_CONTRAST) return rgb;
  const hsl = rgbToHsl(rgb);
  let out = rgb;
  for (let L = hsl.l; L <= .95 && (out = hslToRgb({
    h: hsl.h,
    s: hsl.s,
    l: L
  }), !(contrastRatio(out, CHART_BG_RGB) >= MIN_CONTRAST)); L += .03) ;
  return out;
}

const MIN_COLOR_DIST = 90;

function colorDist(a, b) {
  const dr = a.r - b.r, dg = a.g - b.g, db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function tooClose(rgb, placed) {
  for (const p of placed) if (colorDist(rgb, p) < MIN_COLOR_DIST) return !0;
  return !1;
}

const NUDGE_L_CAP = .78;

function disambiguate(rgb, placed) {
  if (!tooClose(rgb, placed)) return rgb;
  const hsl = rgbToHsl(rgb), s = hsl.s, baseL = Math.min(NUDGE_L_CAP, hsl.l);
  let prefer = 1, nearH = null, best = 1 / 0;
  for (const p of placed) {
    const d = colorDist(rgb, p);
    d < best && (best = d, nearH = rgbToHsl(p).h);
  }
  if (null != nearH) {
    prefer = (hsl.h - nearH + 540) % 360 - 180 >= 0 ? 1 : -1;
  }
  if (hsl.l >= .55) for (const dL of [ -.06, -.1, -.14, -.18, -.22, .04, .08 ]) {
    const L = Math.min(NUDGE_L_CAP, Math.max(.48, baseL + dL)), cand = ensureContrast(hslToRgb({
      h: hsl.h,
      s: s,
      l: L
    }));
    if (!tooClose(cand, placed)) return cand;
  }
  for (let step = 1; step <= 4; step++) for (const dir of [ prefer, -prefer ]) {
    const cand = ensureContrast(hslToRgb({
      h: (hsl.h + dir * step * 8 + 360) % 360,
      s: s,
      l: baseL
    }));
    if (!tooClose(cand, placed)) return cand;
  }
  for (const dL of [ .06, -.06, .12, -.12, .18, -.18 ]) {
    const L = Math.min(NUDGE_L_CAP, Math.max(.35, baseL + dL)), cand = ensureContrast(hslToRgb({
      h: hsl.h,
      s: s,
      l: L
    }));
    if (!tooClose(cand, placed)) return cand;
  }
  for (let step = 1; step <= 5; step++) for (const dir of [ prefer, -prefer ]) {
    const cand = ensureContrast(hslToRgb({
      h: (hsl.h + dir * step * 15 + 360) % 360,
      s: s,
      l: Math.min(NUDGE_L_CAP, Math.max(.4, baseL))
    }));
    if (!tooClose(cand, placed)) return cand;
  }
  return rgb;
}

const HIST_PALETTE = [ "#E8C547", "#5BA3D9", "#D96B6B", "#6BCB77", "#C77DFF", "#FF9F43", "#2ED9A8", "#F368E0", "#B0B0B0" ];

let colorMapCache = null;

function bankedPrimaryColor(pid) {
  if (!(isHistoricalView() && viewMode && viewMode.store && viewMode.store.meta)) return null;
  const players = viewMode.store.meta.players;
  if (!players) return null;
  const rec = players[pid] || players[String(pid)];
  return rec && rec.pri ? rec.pri : null;
}

let activeChart = null, legendHintShown = !1;

function renderChart(ui, metric, view, page) {
  if ("board" === metric.kind) return activeChart && (activeChart.destroy(), activeChart = null), 
  setNote(ui, byTypeNote(metric), metric), ui.chartInner.style.display = "none", ui.board.style.display = "block", 
  void function(container, metric) {
    const {perPlayer: perPlayer, players: players} = readByTypeData(metric);
    if (container.textContent = "", !players.length) return container.textContent = T("LOC_CHRONICLE_NO_TO_SHOW", metricLabel(metric)), 
    void (container.style.color = AXIS_TICK);
    const row = document.createElement("div");
    row.setAttribute("style", "display:flex;gap:14px;align-items:stretch;height:100%;padding-bottom:6px");
    for (const pid of players) {
      const col = document.createElement("div");
      col.setAttribute("style", "flex:0 0 auto;min-width:11rem;max-width:16rem;display:flex;flex-direction:column;border:1px solid #4A4034;background:rgba(255,255,255,0.02)");
      const head = document.createElement("div");
      head.textContent = ownerName({
        ownerPlayer: pid
      }), head.setAttribute("style", `padding:9px 12px;font-weight:700;border-bottom:1px solid #6B5842;background:${ownerColor({
        ownerPlayer: pid
      })};color:${ownerColorSecondary({
        ownerPlayer: pid
      })};text-shadow:0 1px 2px rgba(0,0,0,0.55)`), col.appendChild(head);
      const names = [ ...perPlayer.get(pid).keys() ].map(t => resolveTypeName(metric.lookup, t)).sort();
      for (const name of names) {
        const item = document.createElement("div");
        item.textContent = name, item.setAttribute("style", "padding:6px 12px;border-bottom:1px solid #2E281F;color:#E8E2D0;font-size:0.95rem"), 
        col.appendChild(item);
      }
      row.appendChild(col);
    }
    container.appendChild(row);
  }(ui.board, metric);
  if (ui.board.style.display = "none", ui.chartInner.style.display = "block", "undefined" == typeof Chart) return;
  if (!ui.chartInner.clientWidth || !ui.chartInner.clientHeight) return void requestAnimationFrame(() => renderChart(ui, metric, view, page));
  activeChart && (activeChart.destroy(), activeChart = null), applyChartDefaults();
  const fs = function() {
    try {
      if ("undefined" != typeof Chart && Chart.defaults && Chart.defaults.font) {
        const cur = Number(Chart.defaults.font.size) || 0;
        if (cur >= 33) return cur;
      }
    } catch (e) {}
    return 33;
  }(), tickFont = {
    size: fs
  }, legendFont = {
    size: fs
  }, plugins = {
    legend: {
      display: !0,
      labels: {
        color: "#E8E2D0",
        font: legendFont,
        boxWidth: 18,
        padding: 12
      }
    },
    title: {
      display: !1
    }
  }, tickOpts = {
    color: AXIS_TICK,
    font: tickFont
  }, valTicks = (base = tickOpts, Object.assign({}, base || {}, {
    callback: function(value) {
      return formatChartNumber(value);
    }
  }));
  var base;
  let config;
  if ("bar" === metric.kind) {
    setNote(ui, byTypeNote(metric), metric);
    const {labels: labels, datasets: datasets} = buildBarChart(metric, page), hasData = datasets.length > 0 && labels.length > 0;
    if (setNoData(ui.canvas, hasData ? "" : T("LOC_CHRONICLE_NO_DATA_RECORDED", metricLabel(metric))), 
    !hasData) return;
    config = {
      type: "bar",
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        maintainAspectRatio: !1,
        animation: !1,
        color: "#E8E2D0",
        plugins: {
          ...plugins,
          tooltip: {
            callbacks: {
              label: item => T("LOC_CHRONICLE_VALUE_SEP", item.dataset.label || item.label || "", formatChartNumber(null != item.parsed ? null != item.parsed.y ? item.parsed.y : item.parsed.x : item.raw))
            }
          }
        },
        scales: {
          x: {
            type: "category",
            ticks: tickOpts,
            grid: {
              color: "#4A4034"
            }
          },
          y: {
            type: "linear",
            min: 0,
            title: axisTitle(metricYTitle(metric.id)),
            ticks: valTicks,
            grid: {
              color: "#4A4034"
            }
          }
        }
      }
    };
  } else if ("live" === metric.kind || "stand" === view) {
    const isLive = "live" === metric.kind;
    if (isLive && isHistoricalView() && bankedSettlementRows().length > 0) setNote(ui, T("LOC_CHRONICLE_NOTE_BANKED"), metric); else {
      const stand = [ T("LOC_CHRONICLE_CURRENT_STANDINGS") ];
      !isLive && metric.trend && stand.unshift(sourceLabel(trendSource(metric.trend))), 
      setNote(ui, stand.join("  ·  "), metric);
    }
    const res = isLive ? metric.compute() : buildStandings(metric.trend), hasData = res && res.data && res.data.length > 0;
    if (setNoData(ui.canvas, hasData ? "" : T("LOC_CHRONICLE_NO_DATA_AVAILABLE", metricLabel(metric))), 
    !hasData) return;
    const horiz = "y" === res.indexAxis, valueTitle = isLive ? res.valueTitle : locSrcYTitle(metric, metric.trend ? trendSource(metric.trend) : null), catAxis = {
      type: "category",
      title: axisTitle(res.catTitle),
      ticks: tickOpts,
      grid: {
        color: "#4A4034"
      }
    }, valAxis = {
      type: "linear",
      min: res.signed ? void 0 : 0,
      title: axisTitle(valueTitle),
      ticks: valTicks,
      grid: {
        color: "#4A4034"
      }
    };
    config = {
      type: "bar",
      data: {
        labels: res.labels,
        datasets: [ {
          data: res.data,
          backgroundColor: res.colors,
          borderColor: res.colors,
          borderWidth: 0
        } ]
      },
      options: {
        indexAxis: horiz ? "y" : "x",
        maintainAspectRatio: !1,
        animation: !1,
        color: "#E8E2D0",
        plugins: {
          legend: {
            display: !1
          },
          title: {
            display: !1
          },
          tooltip: {
            callbacks: {
              label: item => formatChartNumber(null != item.parsed ? horiz ? item.parsed.x : item.parsed.y : item.raw)
            }
          }
        },
        scales: horiz ? {
          x: valAxis,
          y: catAxis
        } : {
          x: catAxis,
          y: valAxis
        }
      }
    };
  } else {
    const trend = metric.trend, src = trendSource(trend);
    if (!function(src) {
      return src && src.turnCount >= 2;
    }(src)) return setNote(ui, "", metric), void setNoData(ui.canvas, T("LOC_CHRONICLE_NO_RECORDED_YET", metricLabel(metric)));
    {
      const {datasets: datasets, start: start, end: end} = src;
      setNoData(ui.canvas, "");
      const agePretty = prettifyType(src.firstAgeLabel), scope = src.currentAgeOnly ? T("LOC_CHRONICLE_AGE_ONLY", agePretty) : src.startedLate ? T("LOC_CHRONICLE_TRACKED_SINCE", agePretty, src.firstTurn) : "", provenance = [ sourceLabel(src), scope ].filter(Boolean).join("  ·  ");
      let hint = "";
      !legendHintShown && datasets.length > 1 && (hint = T("LOC_CHRONICLE_LEGEND_HINT"), 
      legendHintShown = !0), setNote(ui, [ provenance, hint ].filter(Boolean).join("  ·  "), metric);
      const turnLabel = x => {
        for (const b of src.blocks) {
          const bEndX = b.offset + (b.maxT - b.minT);
          if (x >= b.offset && x <= bEndX) return T("LOC_CHRONICLE_AGE_TURN", b.label, b.minT + (x - b.offset));
        }
        return T("LOC_CHRONICLE_TURN", x);
      }, dp = trend.ratioKey ? trend.ratioKey.dp : null, fmtVal = y => formatChartNumber(y, {
        dp: null != dp ? dp : Number.isInteger(Number(y)) ? null : 1
      }), tk = turnAxisTicks(src.blocks, start, end);
      config = {
        type: "line",
        data: {
          datasets: datasets
        },
        options: {
          maintainAspectRatio: !1,
          animation: !1,
          color: "#E8E2D0",
          interaction: {
            mode: "nearest",
            intersect: !0
          },
          elements: {
            point: {
              hitRadius: 30
            }
          },
          plugins: {
            ...plugins,
            tooltip: {
              mode: "nearest",
              intersect: !0,
              backgroundColor: "rgba(6,7,10,0.92)",
              borderColor: "rgba(232,226,208,0.25)",
              borderWidth: 1,
              titleColor: "#F5EFDD",
              bodyColor: "#E8E2D0",
              padding: 10,
              titleFont: legendFont,
              bodyFont: tickFont,
              callbacks: {
                title: items => items && items.length ? turnLabel(items[0].raw.x) : "",
                label: item => T("LOC_CHRONICLE_VALUE_SEP", item.dataset.label, fmtVal(item.raw.y))
              }
            }
          },
          scales: {
            x: {
              type: "linear",
              min: start,
              max: end > start ? end : void 0,
              afterBuildTicks: axis => {
                axis.ticks = tk.values.map(v => ({
                  value: v
                }));
              },
              ticks: {
                ...tickOpts,
                autoSkip: !1,
                maxRotation: 0,
                callback: v => tk.labelAt(v)
              },
              grid: {
                color: "#4A4034"
              }
            },
            y: {
              type: "linear",
              min: trend.signed ? void 0 : 0,
              title: axisTitle(locSrcYTitle(metric, src)),
              ticks: valTicks,
              grid: {
                color: "#4A4034"
              }
            }
          }
        }
      };
    }
  }
  activeChart = new Chart(ui.canvas.getContext("2d"), config), requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      activeChart && activeChart.resize();
    });
  });
}

function setNote(ui, text, metric) {
  if (!ui || !ui.note) return;
  const parts = text ? [ text ] : [];
  if (fogOn) {
    const trend = metric && metric.trend;
    trend && trend.ratioKey && trend.ratioKey.denSum && parts.push(T("LOC_CHRONICLE_FOG_KNOWN_WORLD"));
    const fog = function() {
      const n = hiddenMajorCount();
      return n ? 1 === n ? T("LOC_CHRONICLE_FOG_UNMET_ONE") : T("LOC_CHRONICLE_FOG_UNMET_N", n) : "";
    }();
    fog && parts.push(fog);
  }
  ui.note.textContent = parts.join("  ·  ");
}

function setNoData(canvas, msg) {
  const wrap = canvas.parentNode;
  if (!wrap) return;
  let el = wrap.querySelector(".ozq-nodata");
  el || (el = document.createElement("div"), el.className = "ozq-nodata", el.setAttribute("style", "position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#C9BFA6;font-size:1.2rem;pointer-events:none;text-align:center"), 
  wrap.appendChild(el)), el.textContent = msg || "", el.style.display = msg ? "flex" : "none", 
  canvas.style.display = msg ? "none" : "block";
}

function makeScrollRow(opts) {
  opts = opts || {};
  let items = [], startIdx = 0, endIdx = 0, overflowing = !1, retryPending = !1;
  const root = document.createElement("div"), mb = null != opts.marginBottom ? opts.marginBottom : 0;
  root.setAttribute("style", "position:relative;width:100%;max-width:100%;min-width:0;flex:0 0 auto;box-sizing:border-box;overflow:visible;" + (mb ? `margin-bottom:${mb}px;` : ""));
  const viewport = document.createElement("div");
  viewport.setAttribute("style", "width:100%;max-width:100%;min-width:0;overflow:hidden;position:relative;box-sizing:border-box");
  const track = document.createElement("div");
  track.setAttribute("style", "display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;position:relative;left:0;top:0;margin:0;padding:0;border:0;box-sizing:border-box;width:100%"), 
  viewport.appendChild(track), root.appendChild(viewport);
  const makeArrow = (label, dir, side) => {
    const b = document.createElement("div");
    b.textContent = label, b.setAttribute("activatable", "true");
    const sidePos = "left" === side ? "left:-30px;" : "right:-30px;";
    return b.setAttribute("style", "position:absolute;" + sidePos + "top:50%;margin-top:-14px;width:24px;height:28px;display:flex;align-items:center;justify-content:center;color:#C9BFA6;font-size:1.35rem;line-height:1;font-weight:700;cursor:pointer;user-select:none;z-index:3;background:transparent;border:none;padding:0;visibility:hidden;pointer-events:none"), 
    b.addEventListener("click", e => {
      try {
        e.stopPropagation(), e.preventDefault();
      } catch (err) {}
      b._inert || "hidden" === b.style.visibility || function(dir) {
        if (!overflowing) return;
        if (dir > 0) {
          if (endIdx >= items.length) return;
          startIdx = Math.min(items.length - 1, startIdx + 1);
        } else {
          if (startIdx <= 0) return;
          startIdx = Math.max(0, startIdx - 1);
        }
        relayout();
      }(dir);
    }), b;
  }, prev = makeArrow("‹", -1, "left"), next = makeArrow("›", 1, "right");
  function setArrowState(btn, enabled) {
    if (btn._inert = !enabled, !overflowing) return btn.style.visibility = "hidden", 
    void (btn.style.pointerEvents = "none");
    btn.style.visibility = "visible", btn.style.opacity = enabled ? "0.95" : "0.35", 
    btn.style.cursor = enabled ? "pointer" : "default", btn.style.pointerEvents = enabled ? "auto" : "none", 
    btn.style.color = enabled ? "#C9BFA6" : "#6B6350";
  }
  function scheduleRetry() {
    retryPending || (retryPending = !0, requestAnimationFrame(() => {
      retryPending = !1, relayout();
    }));
  }
  function applyBaseGaps(fromIdx, toIdx) {
    const lo = null == fromIdx ? 0 : fromIdx, hi = null == toIdx ? items.length : toIdx;
    for (let i = lo; i < hi; i++) {
      const el = items[i].el;
      el.style.flexShrink = "0", el.style.flexGrow = "0", el.style.marginLeft = "0", el.style.marginRight = i < hi - 1 ? "9px" : "0";
    }
  }
  function widthsCached() {
    for (let i = 0; i < items.length; i++) if ((items[i].w || 0) < 1) return !1;
    return items.length > 0;
  }
  function sumBtnW(from, end) {
    let s = 0;
    for (let i = from; i < end; i++) s += items[i].w || 0;
    return s;
  }
  function planGaps(count, btnW, vw, opts) {
    opts = opts || {};
    const gaps = Math.max(0, count - 1);
    if (count < 1) return {
      used: 0,
      gapEach: 0,
      extraRem: 0
    };
    if (0 === gaps) return btnW > vw + .5 ? null : {
      used: btnW,
      gapEach: 0,
      extraRem: 0
    };
    if (btnW + 4 * gaps > vw + .5) return null;
    let gapEach = 9, used = btnW + gaps * gapEach;
    if (used > vw + .5) {
      const avail = Math.max(0, Math.floor(vw - btnW));
      gapEach = Math.max(4, Math.floor(avail / gaps));
      const extraRem = Math.max(0, avail - gapEach * gaps);
      return used = btnW + gapEach * gaps + extraRem, {
        used: used,
        gapEach: gapEach,
        extraRem: extraRem
      };
    }
    const leftover = Math.max(0, Math.floor(vw - used)), avgW = count > 0 ? btnW / count : 0, widthCapped = !!opts.widthCapped, nearlyFull = leftover > 0 && leftover <= Math.max(32, .35 * avgW), doSpread = leftover > 0 && (widthCapped || nearlyFull), extraEach = doSpread ? Math.floor(leftover / gaps) : 0, extraRem = doSpread ? leftover - extraEach * gaps : 0;
    return gapEach = 9 + extraEach, used = btnW + gapEach * gaps + extraRem, {
      used: used,
      gapEach: gapEach,
      extraRem: extraRem
    };
  }
  function packEnd(from, vw, n) {
    let end = from;
    for (let i = from; i < n; i++) {
      const trialEnd = i + 1;
      if (!planGaps(trialEnd - from, sumBtnW(from, trialEnd), vw, {})) break;
      end = trialEnd;
    }
    if (end === from && from < n) return end = from + 1, {
      end: end,
      plan: {
        used: items[from].w || 0,
        gapEach: 0,
        extraRem: 0
      }
    };
    const btnW = sumBtnW(from, end);
    return {
      end: end,
      plan: planGaps(end - from, btnW, vw, {
        widthCapped: end < n
      }) || {
        used: btnW,
        gapEach: 4,
        extraRem: 0
      }
    };
  }
  function relayout() {
    root.style.width = "100%", root.style.maxWidth = "100%", root.style.minWidth = "0", 
    root.style.height = "", root.style.minHeight = "", viewport.style.width = "100%", 
    viewport.style.maxWidth = "100%", viewport.style.height = "", viewport.style.minHeight = "", 
    track.style.height = "", track.style.minHeight = "", track.style.width = "100%";
    const n = items.length;
    if (n < 1) return track.textContent = "", track.style.visibility = "visible", overflowing = !1, 
    startIdx = 0, endIdx = 0, setArrowState(prev, !1), void setArrowState(next, !1);
    const vw = viewport.clientWidth || root.clientWidth || 0;
    if (vw < 1) return track.style.visibility = "hidden", void scheduleRetry();
    if (track.style.visibility = "hidden", !widthsCached() && !function() {
      const n = items.length;
      if (n < 1) return !0;
      const prevOverflow = viewport.style.overflow;
      track.textContent = "", track.style.width = "10000px", viewport.style.overflow = "visible", 
      applyBaseGaps(0, n);
      for (let i = 0; i < n; i++) track.appendChild(items[i].el);
      let allOk = !0;
      for (let i = 0; i < n; i++) {
        const el = items[i].el;
        let w = el.offsetWidth || 0;
        if (w < 1) try {
          w = el.getBoundingClientRect().width || 0;
        } catch (e) {}
        w > 1 ? items[i].w = w : (items[i].w || 0) > 1 || (allOk = !1);
      }
      return track.style.width = "100%", viewport.style.overflow = prevOverflow || "hidden", 
      allOk;
    }()) return void scheduleRetry();
    const allBtnW = sumBtnW(0, n), allPlan = planGaps(n, allBtnW, vw, {});
    let plan;
    if (overflowing = !allPlan, overflowing) {
      startIdx > n - 1 && (startIdx = Math.max(0, n - 1)), startIdx < 0 && (startIdx = 0);
      let packed = packEnd(startIdx, vw, n);
      if (endIdx = packed.end, plan = packed.plan, endIdx >= n && startIdx > 0) {
        let s = startIdx;
        for (;s > 0; ) {
          const trial = packEnd(s - 1, vw, n);
          if (trial.end < n) break;
          s -= 1, endIdx = trial.end, plan = trial.plan;
        }
        startIdx = s;
      }
    } else startIdx = 0, endIdx = n, plan = planGaps(n, allBtnW, vw, {
      widthCapped: !1
    }) || allPlan;
    track.textContent = "", track.style.marginLeft = "0", track.style.left = "0", track.style.transform = "", 
    track.style.width = "100%";
    let extraRem = plan.extraRem || 0;
    const gapEach = plan.gapEach || 0;
    for (let i = startIdx; i < endIdx; i++) {
      const el = items[i].el;
      if (el.style.flexShrink = "0", el.style.flexGrow = "0", el.style.marginLeft = "0", 
      i < endIdx - 1) {
        let mr = gapEach;
        extraRem > 0 && (mr += 1, extraRem -= 1), el.style.marginRight = mr + "px";
      } else el.style.marginRight = "0";
      track.appendChild(el);
    }
    track.style.visibility = "visible", setArrowState(prev, overflowing && startIdx > 0), 
    setArrowState(next, overflowing && endIdx < n);
  }
  return root.appendChild(prev), root.appendChild(next), {
    root: root,
    setButtons: function(els) {
      const list = els || [];
      track.style.visibility = "hidden", items = list.map((el, i) => (el.style.flexShrink = "0", 
      el.style.flexGrow = "0", el.style.marginLeft = "0", el.style.marginRight = i < list.length - 1 ? "9px" : "0", 
      {
        el: el,
        w: 0
      })), startIdx = 0, endIdx = 0, track.textContent = "", items.forEach(it => {
        track.appendChild(it.el);
      }), relayout();
    },
    scrollToShow: function(el) {
      if (!el || !items.length) return;
      let idx = -1;
      for (let i = 0; i < items.length; i++) if (items[i].el === el) {
        idx = i;
        break;
      }
      if (idx < 0) return;
      if (idx >= startIdx && idx < endIdx) return;
      const vw = viewport.clientWidth || root.clientWidth || 0;
      if (vw > 1 && widthsCached()) {
        let s = Math.max(0, idx);
        for (;s > 0; ) {
          if (packEnd(s - 1, vw, items.length).end <= idx) break;
          s -= 1;
        }
        startIdx = s;
      } else startIdx = Math.max(0, idx);
      relayout(), (idx >= endIdx || idx < startIdx) && (startIdx = Math.max(0, idx), relayout());
    },
    remeasure: function() {
      for (let i = 0; i < items.length; i++) items[i].w = 0;
      applyBaseGaps(0, items.length), relayout();
    }
  };
}

let activeNav = null;

const chronicleInputHandler = {
  handleInput(e) {
    const t0 = hotkeyNow(), d = e && e.detail || {};
    if (!activeRoot || !isTopOverlay(activeRoot.id)) return !0;
    if (!d.name) return !0;
    if (isWatchedEngineAction(d.name)) {
      const tCodes = hotkeyNow(), codes = engineCodesForAction(d.name), msCodes = hotkeyNow() - tCodes;
      if (isPressFinished(e) && activeNav) {
        const tHk = hotkeyNow(), hk = readHotkeys(), msHk = hotkeyNow() - tHk;
        let slot = null;
        const tSlot = hotkeyNow();
        for (let i = 0; i < codes.length && (slot = hotkeySlotForCode(hk, codes[i]), !slot); i++) ;
        const msSlot = hotkeyNow() - tSlot;
        "openHof" === slot ? activeNav.openHof() : "openOptions" === slot ? activeNav.openOptions() : "catPrev" === slot ? activeNav.stepCategory(-1) : "catNext" === slot ? activeNav.stepCategory(1) : "chartPrev" === slot ? activeNav.stepChart(-1) : "chartNext" === slot ? activeNav.stepChart(1) : "pagePrev" === slot ? activeNav.secondaryPrev() : "pageNext" === slot && activeNav.secondaryNext(), 
        probeEngineLog("graphs", d.name, d.status, codes, [ {
          n: "codes",
          ms: msCodes
        }, {
          n: "readHk",
          ms: msHk
        }, {
          n: "slot",
          ms: msSlot
        }, {
          n: "total",
          ms: hotkeyNow() - t0
        } ], "slot=" + (slot || "-"));
      } else probeEngineLog("graphs", d.name, d.status, codes, [ {
        n: "codes",
        ms: msCodes
      }, {
        n: "total",
        ms: hotkeyNow() - t0
      } ], "phase=eat");
      return !1;
    }
    return isPressFinished(e) && probeEngineLog("graphs", d.name, d.status, [], [ {
      n: "total",
      ms: hotkeyNow() - t0
    } ], "watched=0"), !(EAT_WORLD_ENGINE_ACTIONS.indexOf(d.name) >= 0) && (CANCEL_ACTIONS.indexOf(d.name) < 0 || (isPressFinished(e) && closeOverlay(), 
    !1));
  },
  handleNavigation: () => !0
};

function onOverlayKeydown(e) {
  const t0 = hotkeyNow();
  if (!activeRoot || !isTopOverlay(activeRoot.id) || !activeNav) return;
  if (e.repeat) return;
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  const tRes = hotkeyNow(), code = resolveHotkeyCode(e), msRes = hotkeyNow() - tRes;
  if (!code) return;
  if (isEngineBoundHotkeyCode(code)) return void probeKeydownLog("graphs", code, [ {
    n: "resolve",
    ms: msRes
  }, {
    n: "total",
    ms: hotkeyNow() - t0
  } ], "skip=engine-bound");
  const tHk = hotkeyNow(), hk = readHotkeys(), msHk = hotkeyNow() - tHk;
  let handled = !1, slot = "-";
  if (code === hk.catPrev) handled = !!activeNav.stepCategory(-1), slot = "catPrev"; else if (code === hk.catNext) handled = !!activeNav.stepCategory(1), 
  slot = "catNext"; else if (code === hk.chartPrev) handled = !!activeNav.stepChart(-1), 
  slot = "chartPrev"; else if (code === hk.chartNext) handled = !!activeNav.stepChart(1), 
  slot = "chartNext"; else if (code === hk.pagePrev) handled = !!activeNav.secondaryPrev(), 
  slot = "pagePrev"; else if (code === hk.pageNext) handled = !!activeNav.secondaryNext(), 
  slot = "pageNext"; else if (code === hk.openHof) handled = !!activeNav.openHof(), 
  slot = "openHof"; else if (code === hk.openOptions) handled = !!activeNav.openOptions(), 
  slot = "openOptions"; else if (0 === code.indexOf("Digit") || 0 === code.indexOf("NumPad") || 0 === code.indexOf("Numpad")) {
    const n = Number(code.replace("Digit", "").replace("NumPad", "").replace("Numpad", ""));
    n >= 1 && n <= 7 && (handled = !!activeNav.jumpCategory(n - 1), slot = "digit" + n);
  }
  probeKeydownLog("graphs", code, [ {
    n: "resolve",
    ms: msRes
  }, {
    n: "readHk",
    ms: msHk
  }, {
    n: "total",
    ms: hotkeyNow() - t0
  } ], "handled=" + (handled ? 1 : 0) + " slot=" + slot), handled && stopKeydownPeers(e);
}

const suspendedOverlays = [];

function closeOverlay() {
  activeChart && (activeChart.destroy(), activeChart = null), activeRoot && (forgetOverlay(activeRoot.id), 
  activeRoot.remove(), activeRoot = null), activeNav = null;
  const onClose = viewMode && viewMode.onClose;
  if (viewMode = null, fogOn = !1, openedFromEndGame = !1, colorMapCache = null, invalidateOpenCaches(), 
  function() {
    const s = suspendedOverlays.pop();
    s && (activeRoot = s.root, activeNav = s.nav || null, viewMode = s.viewMode, activeChart = s.activeChart, 
    colorMapCache = s.colorMapCache, legendHintShown = s.legendHintShown, fogOn = !!s.fogOn, 
    openedFromEndGame = !!s.openedFromEndGame, activeRoot.style.visibility = "", invalidateOpenCaches());
  }(), "function" == typeof onClose) try {
    onClose();
  } catch (e) {}
}

let chartWaiters = null;

function applyChartDefaults() {
  if ("undefined" != typeof Chart && Chart.defaults) try {
    Chart.defaults.maintainAspectRatio = !1, Chart.defaults.font || (Chart.defaults.font = {});
    const cur = Number(Chart.defaults.font.size) || 0;
    Chart.defaults.font.size = Math.max(cur, 33);
    try {
      "undefined" != typeof BODY_FONTS && BODY_FONTS && BODY_FONTS.length && (Chart.defaults.font.family = BODY_FONTS.join(", "));
    } catch (e) {}
    Chart.defaults.color && "#666" !== Chart.defaults.color && "#666666" !== Chart.defaults.color || (Chart.defaults.color = "#E8E2D0");
  } catch (e) {}
}

function openOverlayForStore(store, opts) {
  opts = opts || {}, store && store.ages && (activeRoot && (activeRoot.style.visibility = "hidden", 
  suspendedOverlays.push({
    root: activeRoot,
    viewMode: viewMode,
    activeChart: activeChart,
    colorMapCache: colorMapCache,
    legendHintShown: legendHintShown,
    fogOn: fogOn,
    openedFromEndGame: openedFromEndGame,
    nav: activeNav
  }), activeRoot = null, activeNav = null, viewMode = null, fogOn = !1, openedFromEndGame = !1, 
  activeChart = null, colorMapCache = null, invalidateOpenCaches()), viewMode = {
    store: store,
    title: opts.title || T("LOC_HOF_VIEWDETAILS"),
    caption: opts.caption || "",
    onClose: opts.onClose || null
  }, colorMapCache = null, openOverlay());
}

try {
  globalThis.ozqChronicleGraphs = {
    open: openOverlay,
    openForStore: openOverlayForStore,
    close: closeOverlay,
    version: "0.33.31"
  };
} catch (e) {
  try {
    window.ozqChronicleGraphs = {
      open: openOverlay,
      openForStore: openOverlayForStore,
      close: closeOverlay,
      version: "0.33.31"
    };
  } catch (e2) {}
}

function openNowMs() {
  try {
    if ("undefined" != typeof performance && "function" == typeof performance.now) return performance.now();
  } catch (e) {}
  return Date.now();
}

function openLog(msg) {
  try {
    console.error(LOG + " " + msg);
  } catch (e) {}
}

let openSeq = 0, liveSessionSelection = null;

function openOverlay(opts) {
  const fromEndGame = !(!opts || !0 !== opts.fromEndGame);
  if (activeRoot) return;
  if ("undefined" == typeof Chart) return void function(done) {
    if ("undefined" != typeof Chart) return applyChartDefaults(), void done();
    if (chartWaiters) chartWaiters.push(done); else {
      chartWaiters = [ done ];
      try {
        const s = document.createElement("script");
        s.src = CHART_SRC, s.onload = () => {
          const q = chartWaiters || [];
          if (chartWaiters = null, "undefined" != typeof Chart) {
            applyChartDefaults();
            for (const fn of q) try {
              fn();
            } catch (e) {}
          }
        }, s.onerror = () => {
          chartWaiters = null;
        }, (document.head || document.documentElement).appendChild(s);
      } catch (e) {
        chartWaiters = null;
      }
    }
  }(() => openOverlay(opts));
  const seq = ++openSeq, tOpen0 = openNowMs();
  applyChartDefaults(), legendHintShown = !1;
  const historical = isHistoricalView();
  openedFromEndGame = fromEndGame, fogOn = computeFogActive();
  let flushMs = 0;
  if (invalidateOpenCaches(), !historical) try {
    const log = "undefined" != typeof globalThis && globalThis.ozqChronicleLog || "undefined" != typeof window && window.ozqChronicleLog;
    if (log && "function" == typeof log.flushNow) {
      const fr = log.flushNow("open");
      fr && null != fr.totalMs && (flushMs = fr.totalMs);
    }
  } catch (e) {}
  invalidateOpenCaches();
  const tProbe0 = openNowMs(), byTypeIds = isHistoricalView() ? new Set : function() {
    const withData = new Set;
    for (const m of METRICS) if ("bar" === m.kind || "board" === m.kind) try {
      const {typeTotal: typeTotal} = readByTypeData(m);
      typeTotal && typeTotal.size && withData.add(m.id);
    } catch (e) {}
    return withData;
  }(), metrics = METRICS.filter(m => {
    if (isHistoricalView() && ("bar" === m.kind || "board" === m.kind)) return !1;
    if ("live" === m.kind) try {
      const r = m.compute();
      return !!(r && r.data && r.data.length);
    } catch (e) {
      return !1;
    }
    return "bar" === m.kind || "board" === m.kind ? byTypeIds.has(m.id) : standAvailable(m) || trendAvailable(m);
  }), catList = CATEGORIES.filter(c => metrics.some(m => m.category === c)), probeMs = Math.round(openNowMs() - tProbe0), root = document.createElement("div");
  root.id = "ozq-chronicle-graphs-overlay-" + ++rootCounter, activeRoot = root, noteOverlayOpened(root.id);
  try {
    refreshEngineKeyMap("graphs-open");
  } catch (e) {}
  const backdrop = document.createElement("div");
  backdrop.setAttribute("style", "position:fixed;left:0;top:0;width:100%;height:100%;z-index:999998;background:rgba(6,7,10,0.78);pointer-events:auto"), 
  backdrop.addEventListener("click", closeOverlay), root.appendChild(backdrop);
  const panel = document.createElement("div");
  panel.setAttribute("style", PANEL_BOX), root.appendChild(panel);
  const header = document.createElement("div");
  header.setAttribute("style", HEADER_BOX);
  const titleCol = document.createElement("div");
  titleCol.setAttribute("style", "display:flex;flex-direction:column;align-items:stretch;gap:4px;flex:1 1 auto;min-width:0;overflow:hidden");
  const titleRow = document.createElement("div");
  titleRow.setAttribute("style", TITLE_COL_ROW);
  const title = document.createElement("div");
  title.textContent = historical ? viewMode && viewMode.title || T("LOC_HOF_VIEWDETAILS") : T("LOC_CHRONICLE_TITLE"), 
  title.className = "font-title uppercase tracking-150", title.setAttribute("style", TITLE_TEXT), 
  titleRow.appendChild(title);
  const note = document.createElement("div");
  if (note.className = "font-body text-sm", note.setAttribute("style", "color:#B7A987;font-size:0.85rem;letter-spacing:0.04em;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-bottom:0.3rem"), 
  titleRow.appendChild(note), titleCol.appendChild(titleRow), historical && viewMode && viewMode.caption) {
    const cap = document.createElement("div");
    cap.className = "font-body text-sm", cap.textContent = viewMode.caption, cap.setAttribute("style", "color:#B7A987;font-size:0.9rem;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"), 
    titleCol.appendChild(cap);
  }
  header.appendChild(titleCol);
  const headerActions = document.createElement("div");
  function muteHeaderBtn(b) {
    b.style.opacity = "0.72";
    const lab = b.querySelector(".ozq-btn-label");
    lab && (lab.style.color = "#E8E2D0");
  }
  headerActions.setAttribute("style", HEADER_ACTIONS);
  const optionsOnClose = res => {
    if (res && res.changed && !isHistoricalView()) {
      const wasFromEndGame = openedFromEndGame;
      closeOverlay(), openOverlay({
        fromEndGame: wasFromEndGame
      });
    }
  };
  function openHofFromHeader() {
    if (historical) return !1;
    try {
      const api = "undefined" != typeof globalThis && globalThis.ozqChronicleHof || "undefined" != typeof window && window.ozqChronicleHof;
      if (api && "function" == typeof api.open) return api.open(), !0;
    } catch (e) {}
    return !1;
  }
  function openOptionsFromHeader() {
    try {
      const api = "undefined" != typeof globalThis && globalThis.ozqChronicleOptions || "undefined" != typeof window && window.ozqChronicleOptions;
      if (api && "function" == typeof api.open) return api.open({
        onClose: optionsOnClose
      }), !0;
    } catch (e) {}
    return !1;
  }
  if (!historical) {
    const hofBtn = makeNativeButton(T("LOC_HOF_TITLE"), () => {
      openHofFromHeader();
    }, {});
    muteHeaderBtn(hofBtn), hofBtn.style.marginRight = "9px", headerActions.appendChild(hofBtn);
  }
  const optionsBtn = makeSettingsButton({
    onClose: optionsOnClose
  });
  optionsBtn.style.marginRight = "9px", headerActions.appendChild(optionsBtn);
  const closeBtn = makeNativeButton(T("LOC_GENERIC_CLOSE"), closeOverlay, {});
  if (muteHeaderBtn(closeBtn), headerActions.appendChild(closeBtn), header.appendChild(headerActions), 
  panel.appendChild(header), !catList.length) {
    const empty = document.createElement("div");
    return empty.textContent = T("LOC_CHRONICLE_EMPTY_STATS"), empty.setAttribute("style", "flex:1 1 auto;display:flex;align-items:center;justify-content:center;color:#C9BFA6;font-size:1.15rem;text-align:center;padding:2rem"), 
    panel.appendChild(empty), activeNav = {
      jumpCategory: () => !1,
      stepCategory: () => !1,
      stepChart: () => !1,
      stepPage: () => !1,
      setViewKey: () => !1,
      secondaryPrev: () => !1,
      secondaryNext: () => !1,
      openHof: () => openHofFromHeader(),
      openOptions: () => openOptionsFromHeader()
    }, document.body.appendChild(root), void openLog("open-fill total=" + Math.round(openNowMs() - tOpen0) + "ms flush=" + flushMs + " probe=" + probeMs + " empty=1 historical=" + (historical ? 1 : 0));
  }
  const categoryRow = makeScrollRow({
    marginBottom: 10
  });
  panel.appendChild(categoryRow.root);
  const chartRow = makeScrollRow({
    marginBottom: 16
  });
  panel.appendChild(chartRow.root);
  const chartWrap = document.createElement("div");
  chartWrap.setAttribute("style", "position:relative;flex:1 1 auto;width:100%;min-height:0;overflow:hidden");
  const chartInner = document.createElement("div");
  chartInner.setAttribute("style", "position:relative;width:100%;height:100%");
  const canvas = document.createElement("canvas");
  canvas.setAttribute("style", "display:block;width:100%;height:100%"), chartInner.appendChild(canvas), 
  chartWrap.appendChild(chartInner);
  const board = document.createElement("div");
  board.setAttribute("style", "position:relative;width:100%;height:100%;overflow:auto;display:none"), 
  chartWrap.appendChild(board), panel.appendChild(chartWrap);
  const viewBar = document.createElement("div");
  viewBar.setAttribute("style", "display:flex;gap:8px;justify-content:center;margin-top:12px;flex-shrink:0"), 
  panel.appendChild(viewBar);
  const pageBar = document.createElement("div");
  pageBar.setAttribute("style", "display:flex;gap:12px;align-items:center;justify-content:center;margin-top:10px;flex-shrink:0"), 
  panel.appendChild(pageBar);
  const hotkeyHint = document.createElement("div");
  hotkeyHint.textContent = function() {
    const h = readHotkeys(), cats = formatHotkeyCode(h.catPrev) + " " + formatHotkeyCode(h.catNext), charts = formatHotkeyCode(h.chartPrev) + " " + formatHotkeyCode(h.chartNext), page = formatHotkeyCode(h.pagePrev) + " " + formatHotkeyCode(h.pageNext);
    return T("LOC_CHRONICLE_HOTKEY_HINT", cats, charts, page);
  }(), hotkeyHint.setAttribute("style", "color:#8A7F63;font-size:0.78rem;text-align:center;margin-top:10px;flex-shrink:0;opacity:0.9"), 
  panel.appendChild(hotkeyHint);
  const ui = {
    canvas: canvas,
    chartInner: chartInner,
    board: board,
    note: note
  }, chartButtons = [], viewButtons = {
    trend: null,
    stand: null
  };
  let curMetric = null, curView = "trend", curPage = 0, curCatIndex = 0, curChartIndex = 0, curInCat = [];
  const renderPage = () => {
    renderChart(ui, curMetric, curView, curPage), pageBar.textContent = "";
    const pages = curMetric && "bar" === curMetric.kind ? barPageCount(curMetric) : 1;
    if (pages <= 1) return;
    const prev = makeNativeButton(T("LOC_CHRONICLE_PREV"), () => {
      curPage > 0 && (curPage--, renderPage());
    }, {
      secondary: !0
    }), next = makeNativeButton(T("LOC_CHRONICLE_NEXT"), () => {
      curPage < pages - 1 && (curPage++, renderPage());
    }, {
      secondary: !0
    });
    0 === curPage && (prev.style.opacity = "0.4"), curPage === pages - 1 && (next.style.opacity = "0.4");
    const label = document.createElement("div");
    label.textContent = T("LOC_CHRONICLE_PAGE", curPage + 1, pages), label.setAttribute("style", "color:#E8E2D0;font-size:0.9rem;min-width:6rem;text-align:center"), 
    pageBar.appendChild(prev), pageBar.appendChild(label), pageBar.appendChild(next);
  }, setView = v => {
    const btn = viewButtons[v];
    if (!btn || !1 !== btn._avail) {
      curView = v;
      for (const key of [ "trend", "stand" ]) {
        const b = viewButtons[key];
        if (!b) continue;
        const active = key === v, label = b.querySelector(".ozq-btn-label");
        label && (label.style.color = active ? "#FFD98A" : "#E8E2D0"), b.style.opacity = active ? "1" : b._avail ? "0.72" : "0.4", 
        b.style.cursor = b._avail ? "pointer" : "default";
      }
      curPage = 0, renderPage(), !historical && curMetric && curMetric.id && (liveSessionSelection = {
        metricId: curMetric.id,
        view: curView
      });
    }
  }, selectChart = (inCat, index, preferView) => {
    if (!inCat || !inCat.length || index < 0 || index >= inCat.length) return;
    curInCat = inCat, curChartIndex = index, chartButtons.forEach((b, i) => highlightButton(b, i === index)), 
    curMetric = inCat[index];
    let v = (metric => {
      if (viewBar.textContent = "", viewButtons.trend = viewButtons.stand = null, "live" === metric.kind || "bar" === metric.kind || "board" === metric.kind) return viewBar.style.display = "none", 
      "stand";
      viewBar.style.display = "flex";
      const tAvail = trendAvailable(metric), sAvail = standAvailable(metric);
      return viewButtons.trend = makeNativeButton(T("LOC_CHRONICLE_TRENDS"), () => setView("trend"), {
        secondary: !0
      }), viewButtons.stand = makeNativeButton(T("LOC_CHRONICLE_STANDINGS"), () => setView("stand"), {
        secondary: !0
      }), viewButtons.trend._avail = tAvail, viewButtons.stand._avail = sAvail, viewBar.appendChild(viewButtons.trend), 
      viewBar.appendChild(viewButtons.stand), tAvail ? "trend" : "stand";
    })(curMetric);
    if ("trend" === preferView || "stand" === preferView) {
      const b = viewButtons[preferView];
      b && !1 !== b._avail && (v = preferView);
    }
    setView(v), chartButtons[index] && chartRow.scrollToShow(chartButtons[index]);
  }, selectCategory = (catIndex, preferId, preferView) => {
    if (catIndex < 0 || catIndex >= catList.length) return;
    curCatIndex = catIndex, catButtons.forEach((b, i) => highlightButton(b, i === catIndex)), 
    catButtons[catIndex] && categoryRow.scrollToShow(catButtons[catIndex]), chartButtons.length = 0;
    const inCat = metrics.filter(m => m.category === catList[catIndex]);
    if (inCat.forEach((metric, i) => {
      const b = makeNativeButton(metricLabel(metric), () => selectChart(inCat, i), {
        secondary: !0
      });
      chartButtons.push(b);
    }), chartRow.setButtons(chartButtons), inCat.length) {
      const idx = preferId ? Math.max(0, inCat.findIndex(m => m.id === preferId)) : 0;
      selectChart(inCat, idx < 0 ? 0 : idx, preferView);
    } else curInCat = [], curChartIndex = 0, curMetric = null;
  }, catButtons = catList.map((cat, i) => makeNativeButton(function(cat) {
    return T("LOC_CHRONICLE_CAT_" + cat);
  }(cat), () => selectCategory(i), {}));
  activeNav = {
    jumpCategory: i => !(i < 0 || i >= catList.length) && (selectCategory(i), !0),
    stepCategory: d => !!catList.length && (selectCategory((curCatIndex + d + catList.length) % catList.length), 
    !0),
    stepChart(d) {
      if (!curInCat.length) return !1;
      const next = (curChartIndex + d + curInCat.length) % curInCat.length;
      return selectChart(curInCat, next, curView), !0;
    },
    stepPage(d) {
      if (!curMetric || "bar" !== curMetric.kind) return !1;
      const pages = barPageCount(curMetric);
      if (pages <= 1) return !1;
      const next = Math.max(0, Math.min(pages - 1, curPage + d));
      return next !== curPage && (curPage = next, renderPage(), !0);
    },
    setViewKey(v) {
      if ("trend" !== v && "stand" !== v) return !1;
      const b = viewButtons[v];
      return !(!b || !1 === b._avail) && (setView(v), !0);
    },
    secondaryPrev() {
      return !!this.stepPage(-1) || this.setViewKey("trend");
    },
    secondaryNext() {
      return !!this.stepPage(1) || this.setViewKey("stand");
    },
    openHof: () => openHofFromHeader(),
    openOptions: () => openOptionsFromHeader()
  }, document.body.appendChild(root), categoryRow.setButtons(catButtons), openLog("open-fill total=" + Math.round(openNowMs() - tOpen0) + "ms flush=" + flushMs + " probe=" + probeMs + " metrics=" + metrics.length + " cats=" + catList.length + " historical=" + (historical ? 1 : 0) + " fog=" + (fogOn ? 1 : 0) + " hiddenMajors=" + hiddenMajorCount());
  let openMetric = metrics.find(m => m.default) || metrics[0], openView = null;
  if (!historical && liveSessionSelection && liveSessionSelection.metricId) {
    const remembered = metrics.find(m => m.id === liveSessionSelection.metricId);
    remembered && (openMetric = remembered, openView = liveSessionSelection.view || null);
  }
  const openCat = openMetric ? Math.max(0, catList.indexOf(openMetric.category)) : 0;
  requestAnimationFrame(() => {
    if (seq !== openSeq || !activeRoot) return;
    const tChart0 = openNowMs();
    selectCategory(openCat, openMetric && openMetric.id, openView), openLog("open-first-chart " + Math.round(openNowMs() - tChart0) + "ms"), 
    requestAnimationFrame(() => {
      seq === openSeq && activeRoot && (categoryRow.remeasure(), chartRow.remeasure());
    });
  });
}

function readEndGameFlag(screen) {
  try {
    let raw = screen.getAttribute("endGameScreen");
    return null == raw && (raw = screen.getAttribute("endgamescreen")), "true" === String(raw).toLowerCase();
  } catch (e) {
    return !1;
  }
}

function injectButton(screen) {
  let tries = 0;
  const attempt = () => {
    if (screen.querySelector("#ozq-chronicle-graphs-button")) return;
    const row = screen.querySelector(".bottom-10.right-10");
    if (!row) return void (tries++ < 180 && requestAnimationFrame(attempt));
    const button = makeNativeButton(T("LOC_CHRONICLE_BUTTON"), () => openOverlay({
      fromEndGame: readEndGameFlag(screen)
    }), {
      id: "ozq-chronicle-graphs-button",
      extraClass: "mr-8"
    });
    row.insertBefore(button, row.firstChild);
  };
  requestAnimationFrame(attempt);
}

function injectPauseMenuButton(container) {
  if (container.querySelector("#ozq-chronicle-pause-button")) return;
  const button = makeNativeButton(T("LOC_CHRONICLE_BUTTON"), () => openOverlay(), {
    id: "ozq-chronicle-pause-button",
    extraClass: "pause-menu-button mt-4"
  }), resume = container.querySelector("#pause-menu-resume-button");
  resume && resume.nextSibling ? container.insertBefore(button, resume.nextSibling) : container.insertBefore(button, container.firstChild);
}

function isResultsScreen(el) {
  return el instanceof HTMLElement && "string" == typeof el.localName && "screen-victory-progress" === el.localName.toLowerCase();
}

function inspectNode(node) {
  if (!(node instanceof HTMLElement)) return;
  if (isResultsScreen(node)) injectButton(node); else if (node.querySelectorAll) for (const el of node.querySelectorAll("*")) if (isResultsScreen(el)) {
    injectButton(el);
    break;
  }
  const pause = function(node) {
    return node instanceof HTMLElement ? "pause-menu-button-container" === node.id ? node : node.querySelector ? node.querySelector("#pause-menu-button-container") : null : null;
  }(node);
  pause && injectPauseMenuButton(pause);
}

scheduleInstall(function() {
  const existing = document.querySelector("screen-victory-progress");
  existing && injectButton(existing);
  const existingPause = document.getElementById("pause-menu-button-container");
  existingPause && injectPauseMenuButton(existingPause), new MutationObserver(mutations => {
    for (const mutation of mutations) for (const added of mutation.addedNodes) inspectNode(added);
  }).observe(document.body, {
    childList: !0,
    subtree: !0
  }), installFrontInputHandler(chronicleInputHandler);
  try {
    document.addEventListener("keydown", onOverlayKeydown, !0);
  } catch (e) {}
  try {
    refreshEngineKeyMap("graphs-install");
  } catch (e) {}
  console.error(`${LOG} loaded.`);
});

export { };
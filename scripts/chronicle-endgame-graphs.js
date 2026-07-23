const LOG = "[ozq-chronicle]", PANEL_BOX = [ "position:fixed", "left:4%", "top:5%", "width:92%", "height:90%", "box-sizing:border-box", "z-index:999999", "pointer-events:auto", "background:#16130E", "border:2px solid #6B5842", "display:flex", "flex-direction:column", "padding:24px 36px", "overflow-x:hidden", "overflow-y:hidden" ].join(";"), OVERLAY_ID = "ozq-chronicle-graphs-overlay";

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

let _storeLayoutCache = null, _trendSourceCache = null, _probeTrendCache = null, _summaryTurnCache = null;

function invalidateOpenCaches() {
  _storeLayoutCache = null, _trendSourceCache = null, _probeTrendCache = null, _summaryTurnCache = null;
}

function loadLoggerStore() {
  const ctx = ensureStoreLayout();
  return ctx ? ctx.store : null;
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
      const raw = localStorage.getItem("modSettings"), row0 = raw ? JSON.parse(raw) : null;
      row0 && row0["ozq-chronicle"] && row0["ozq-chronicle"].games ? container = row0["ozq-chronicle"] : row0 && row0.games && (container = row0);
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
  label: "Score",
  category: "Overall",
  trend: {
    loggerKey: "score",
    yTitle: "Score"
  }
}, {
  id: "vCul",
  label: "Cultural",
  category: "Overall",
  trend: {
    loggerKey: "vCul",
    yTitle: "Cultural victory points"
  }
}, {
  id: "vEco",
  label: "Economic",
  category: "Overall",
  trend: {
    loggerKey: "vEco",
    yTitle: "Economic victory points"
  }
}, {
  id: "vMil",
  label: "Military",
  category: "Overall",
  trend: {
    loggerKey: "vMil",
    yTitle: "Military victory points"
  }
}, {
  id: "vSci",
  label: "Scientific",
  category: "Overall",
  trend: {
    loggerKey: "vSci",
    yTitle: "Scientific victory points"
  }
}, {
  id: "Science",
  label: "Science / Turn",
  category: "Research",
  default: !0,
  trend: {
    loggerKey: "Science",
    yTitle: "Science / turn",
    summary: {
      id: "Science",
      scope: "Player"
    }
  }
}, {
  id: "Culture",
  label: "Culture / Turn",
  category: "Research",
  trend: {
    loggerKey: "Culture",
    yTitle: "Culture / turn",
    summary: {
      id: "Culture",
      scope: "Player"
    }
  }
}, {
  id: "TechsAcquired",
  label: "Technologies",
  category: "Research",
  trend: {
    loggerKey: "TechsAcquired",
    stepped: !0,
    yTitle: "Technologies researched",
    summary: {
      id: "TechsAcquired",
      scope: "Player"
    }
  }
}, {
  id: "CivicsAcquired",
  label: "Civics",
  category: "Research",
  trend: {
    loggerKey: "CivicsAcquired",
    stepped: !0,
    yTitle: "Civics researched"
  }
}, {
  id: "ratioSciPerCitizen",
  label: "Science / Citizen",
  category: "Research",
  trend: {
    ratioKey: {
      num: "Science",
      den: "tpop",
      scale: 1,
      dp: 1
    },
    yTitle: "Science per citizen / turn"
  }
}, {
  id: "ratioCulPerCitizen",
  label: "Culture / Citizen",
  category: "Research",
  trend: {
    ratioKey: {
      num: "Culture",
      den: "tpop",
      scale: 1,
      dp: 1
    },
    yTitle: "Culture per citizen / turn"
  }
}, {
  id: "trendGreatWorks",
  label: "Great Works",
  category: "Research",
  trend: {
    loggerKey: "gw",
    stepped: !0,
    yTitle: "Great works"
  }
}, {
  id: "goldNet",
  label: "Gold / Turn",
  category: "Economy",
  trend: {
    loggerKey: "goldNet",
    signed: !0,
    yTitle: "Net gold / turn"
  }
}, {
  id: "ratioGoldPerCitizen",
  label: "Gold / Citizen",
  category: "Economy",
  trend: {
    ratioKey: {
      num: "goldNet",
      den: "tpop",
      scale: 1,
      dp: 1
    },
    signed: !0,
    yTitle: "Net gold per citizen / turn"
  }
}, {
  id: "Gold",
  label: "Gold (Treasury)",
  category: "Economy",
  trend: {
    loggerKey: "gold",
    yTitle: "Treasury",
    summary: {
      id: "Gold",
      scope: "Player"
    }
  }
}, {
  id: "trendTrade",
  label: "Trade Routes",
  category: "Economy",
  trend: {
    loggerKey: "tr",
    stepped: !0,
    yTitle: "Active trade routes"
  }
}, {
  id: "Production",
  label: "Production / Turn",
  category: "Economy",
  trend: {
    loggerKey: "Production",
    yTitle: "Production / turn",
    summary: {
      id: "Production",
      scope: "City"
    }
  }
}, {
  id: "trendBuildings",
  label: "Buildings",
  category: "Economy",
  trend: {
    loggerKey: "bld",
    stepped: !0,
    yTitle: "Buildings owned",
    summary: {
      id: "BuildingsConstructed",
      scope: "Player",
      delta: !0,
      yTitle: "Buildings built"
    }
  }
}, {
  id: "trendImprovements",
  label: "Improvements",
  category: "Economy",
  trend: {
    loggerKey: "imp",
    stepped: !0,
    yTitle: "Improvements owned"
  }
}, {
  id: "trendOverbuilds",
  label: "Overbuilds",
  category: "Economy",
  trend: {
    loggerKey: "ob",
    stepped: !0,
    includeDead: !0,
    yTitle: "Buildings & improvements overbuilt"
  }
}, {
  id: "WondersConstructed",
  label: "Wonders",
  category: "Economy",
  trend: {
    loggerKey: "won",
    stepped: !0,
    yTitle: "Wonders owned",
    summary: {
      id: "WondersConstructed",
      scope: "Player",
      delta: !0,
      yTitle: "Wonders built"
    }
  }
}, {
  id: "gp",
  label: "Great People",
  category: "Economy",
  trend: {
    loggerKey: "gp",
    stepped: !0,
    yTitle: "Great people earned",
    summary: {
      id: "GreatPeopleEarned",
      scope: "Player",
      delta: !0
    }
  }
}, {
  id: "Population",
  label: "Population",
  category: "Society",
  trend: {
    loggerKey: "tpop",
    yTitle: "Population",
    summary: {
      id: "Population",
      scope: "City"
    }
  }
}, {
  id: "Food",
  label: "Food / Turn",
  category: "Society",
  trend: {
    loggerKey: "Food",
    yTitle: "Food / turn",
    summary: {
      id: "Food",
      scope: "City"
    }
  }
}, {
  id: "hap",
  label: "Happiness / Turn",
  category: "Society",
  trend: {
    loggerKey: "hap",
    signed: !0,
    yTitle: "Net happiness / turn"
  }
}, {
  id: "inf",
  label: "Influence / Turn",
  category: "Society",
  trend: {
    loggerKey: "inf",
    signed: !0,
    yTitle: "Influence / turn"
  }
}, {
  id: "trendUrban",
  label: "Urban Districts",
  category: "Society",
  trend: {
    loggerKey: "urb",
    stepped: !0,
    yTitle: "Urban districts"
  }
}, {
  id: "ratioUrban",
  label: "Urbanization %",
  category: "Society",
  trend: {
    ratioKey: {
      num: "upop",
      den: "tpop",
      scale: 100,
      dp: 0
    },
    yTitle: "% of population urban"
  }
}, {
  id: "tour",
  label: "Tourism",
  category: "Society",
  trend: {
    loggerKey: "tour",
    yTitle: "Tourism / turn",
    summary: {
      id: "Tourism",
      scope: "City"
    }
  }
}, {
  id: "CitiesTotal",
  label: "Settlements Total",
  category: "Expansion",
  trend: {
    loggerKey: "set",
    stepped: !0,
    yTitle: "Settlements owned",
    summary: {
      id: "CitiesFounded",
      scope: "Player",
      delta: !0,
      label: "Settlements Founded",
      yTitle: "Settlements founded"
    }
  }
}, {
  id: "trendCities",
  label: "Cities",
  category: "Expansion",
  trend: {
    loggerKey: "cityN",
    stepped: !0,
    yTitle: "Cities (promoted settlements)"
  }
}, {
  id: "trendTowns",
  label: "Towns",
  category: "Expansion",
  trend: {
    loggerKey: "townN",
    stepped: !0,
    yTitle: "Towns"
  }
}, {
  id: "trendSettlementsLost",
  label: "Settlements Lost",
  category: "Expansion",
  trend: {
    loggerKey: "sLost",
    stepped: !0,
    includeDead: !0,
    yTitle: "Settlements lost"
  }
}, {
  id: "trendSettlementCap",
  label: "Settlement Cap",
  category: "Expansion",
  trend: {
    loggerKey: "cap",
    stepped: !0,
    yTitle: "Settlement cap"
  }
}, {
  id: "ratioSettlementCap",
  label: "Settlement Cap %",
  category: "Expansion",
  trend: {
    ratioKey: {
      num: "set",
      den: "cap",
      scale: 100,
      dp: 0
    },
    yTitle: "% of settlement cap used"
  }
}, {
  id: "uKill",
  label: "Units Killed",
  category: "Military",
  trend: {
    loggerKey: "uKill",
    stepped: !0,
    includeDead: !0,
    yTitle: "Units killed",
    summary: {
      id: "UnitsKilled",
      scope: "Player",
      delta: !0
    }
  }
}, {
  id: "uLost",
  label: "Units Lost",
  category: "Military",
  trend: {
    loggerKey: "uLost",
    stepped: !0,
    includeDead: !0,
    yTitle: "Units lost",
    summary: {
      id: "UnitsLost",
      scope: "Player",
      delta: !0
    }
  }
}, {
  id: "UnitsOwnedByType",
  label: "Units Owned",
  category: "Military",
  kind: "bar",
  byType: "stock",
  lookup: "Units",
  xTitle: "Unit type",
  yTitle: "Number owned"
}, {
  id: "UnitsKilledByType",
  label: "Kills by Unit",
  category: "Military",
  kind: "bar",
  byType: "event",
  eventKey: "kbt",
  majorsOnly: !0,
  lookup: "Units",
  xTitle: "Your unit type",
  yTitle: "Enemy units it killed"
}, {
  id: "UnitsLostByType",
  label: "Losses by Unit",
  category: "Military",
  kind: "bar",
  byType: "event",
  eventKey: "lbt",
  majorsOnly: !0,
  lookup: "Units",
  xTitle: "Your unit type",
  yTitle: "Number lost"
}, {
  id: "CitiesConquered",
  label: "Settlements Conquered",
  category: "Military",
  trend: {
    loggerKey: "conqA",
    campaignFromAgeLocal: !0,
    stepped: !0,
    yTitle: "Settlements conquered",
    summary: {
      id: "CitiesConquered",
      scope: "Player",
      delta: !0
    }
  }
}, {
  id: "ratioConquest",
  label: "Conquest %",
  category: "Military",
  trend: {
    ratioKey: {
      num: "conqA",
      den: "set",
      scale: 100,
      dp: 0,
      campaignSumNum: !0
    },
    yTitle: "% of settlements taken by force"
  }
}, {
  id: "trendRazed",
  label: "Settlements Razed",
  category: "Military",
  trend: {
    loggerKey: "rz",
    stepped: !0,
    includeDead: !0,
    yTitle: "Settlements razed"
  }
}, {
  id: "trendIndDisp",
  label: "IPs Dispersed",
  category: "Military",
  trend: {
    loggerKey: "indDisp",
    stepped: !0,
    includeDead: !0,
    yTitle: "Independent powers dispersed"
  }
}, {
  id: "BuildingsOwnedByType",
  label: "Buildings",
  category: "World",
  kind: "bar",
  byType: "stock",
  lookup: "Constructibles",
  xTitle: "Building",
  yTitle: "Number owned"
}, {
  id: "ImprovementsOwnedByType",
  label: "Improvements",
  category: "World",
  kind: "bar",
  byType: "stock",
  lookup: "Constructibles",
  xTitle: "Improvement",
  yTitle: "Number owned"
}, {
  id: "DistrictsOwnedByType",
  label: "Districts",
  category: "World",
  kind: "bar",
  byType: "stock",
  lookup: "Districts",
  xTitle: "District",
  yTitle: "Number owned"
}, {
  id: "WondersOwnedByType",
  label: "Wonders",
  category: "World",
  kind: "board",
  byType: "stock",
  lookup: "Constructibles"
}, {
  id: "liveLargestCities",
  label: "Largest Settlements",
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
      valueTitle: "Population",
      catTitle: ""
    };
  }
}, {
  id: "liveMostUrbanized",
  label: "Most Urbanized",
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
      valueTitle: "% urban",
      catTitle: ""
    };
  }
}, {
  id: "liveSizeDist",
  label: "Settlement Sizes",
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
      valueTitle: "Settlements",
      catTitle: "Population"
    };
  }
}, {
  id: "popShare",
  label: "Population Share",
  category: "World",
  trend: {
    ratioKey: {
      num: "tpop",
      denSum: "tpop",
      scale: 100,
      dp: 1
    },
    yTitle: "% of major population"
  }
}, {
  id: "relSpread",
  label: "Religion Spread",
  category: "World",
  trend: {
    religionKey: "s",
    stepped: !0,
    yTitle: "Settlements following"
  }
}, {
  id: "relPop",
  label: "Religion by Population",
  category: "World",
  trend: {
    religionKey: "p",
    yTitle: "Population following"
  }
} ];

const LEADER_PERSONA_NAMES = {
  LEADER_NAPOLEON_ALT: "Napoleon, Revolutionary",
  LEADER_ASHOKA_ALT: "Ashoka, World Conqueror",
  LEADER_HIMIKO_ALT: "Himiko, High Shaman",
  LEADER_FRIEDRICH_ALT: "Friedrich, Baroque",
  LEADER_XERXES_ALT: "Xerxes, the Achaemenid"
};

function isResolvedLoc(n, key) {
  if (null == n) return !1;
  const s = String(n).trim();
  return !!s && ((null == key || s !== String(key)) && !/^LOC_[A-Z0-9_]+$/i.test(s));
}

function ownerName(obj) {
  const pid = obj && obj.ownerPlayer;
  if (isHistoricalView() && viewMode.store && viewMode.store.meta && viewMode.store.meta.players) {
    const rec = viewMode.store.meta.players[pid] || viewMode.store.meta.players[String(pid)];
    if (rec && rec.leader) return function(type) {
      if (null == type || "" === type) return null;
      const t = String(type);
      try {
        if ("undefined" != typeof GameInfo && GameInfo.Leaders) {
          const def = GameInfo.Leaders.lookup(t);
          if (def && def.Name) {
            const n = Locale.compose(def.Name);
            if (isResolvedLoc(n, def.Name)) return n;
          }
        }
      } catch (e) {}
      try {
        if ("undefined" != typeof Locale && "function" == typeof Locale.compose) {
          const key = "LOC_" + t + "_NAME", n = Locale.compose(key);
          if (isResolvedLoc(n, key)) return n;
        }
      } catch (e) {}
      return LEADER_PERSONA_NAMES[t] ? LEADER_PERSONA_NAMES[t] : prettifyType(t);
    }(rec.leader);
  }
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
        for (const pid in all) all[pid] && null != all[pid][r.denSum] && (den += all[pid][r.denSum]);
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

function isFromGameStart(firstCi, firstT, earliestCi) {
  return null != firstCi && null != earliestCi && firstCi === earliestCi && null != firstT && firstT <= 1;
}

function countLoggerTurns(metric, layout, earliestCi) {
  const empty = {
    turnCount: 0,
    firstCi: null,
    firstT: null,
    firstAgeLabel: "",
    fromGameStart: !1,
    lineOk: !1,
    standOk: !1
  };
  if (!layout || !layout.length || !metric.loggerKey && !metric.ratioKey) return empty;
  const valueOf = loggerValueOf(metric);
  let turnCount = 0, firstCi = null, firstT = null, firstAgeLabel = "";
  for (const L of layout) for (const t of L.turns) {
    const turnRow = L.age.turns[t], p = turnRow && turnRow.p || {};
    let has = !1;
    for (const pid in p) if (isMajorPid(pid) && null != valueOf(p[pid], p)) {
      has = !0;
      break;
    }
    has && (turnCount++, null == firstCi && (firstCi = L.age.ci || 0, firstT = t, firstAgeLabel = L.age.label || L.age.key));
  }
  const fromGameStart = isFromGameStart(firstCi, firstT, earliestCi);
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

function countReligionTurns(metric, layout, earliestCi) {
  const empty = {
    turnCount: 0,
    firstCi: null,
    firstT: null,
    firstAgeLabel: "",
    fromGameStart: !1,
    lineOk: !1,
    standOk: !1
  }, key = metric.religionKey;
  if (!key || !layout || !layout.length) return empty;
  let turnCount = 0, firstCi = null, firstT = null, firstAgeLabel = "";
  for (const L of layout) for (const t of L.turns) {
    const turnRow = L.age.turns[t], rel = turnRow && turnRow.rel;
    if (!rel) continue;
    let has = !1;
    for (const h in rel) if (rel[h] && null != rel[h][key]) {
      has = !0;
      break;
    }
    has && (turnCount++, null == firstCi && (firstCi = L.age.ci || 0, firstT = t, firstAgeLabel = L.age.label || L.age.key));
  }
  const fromGameStart = isFromGameStart(firstCi, firstT, earliestCi);
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

function trendIdentityKey(trend) {
  if (!trend) return "";
  if (trend.religionKey) return "rel:" + trend.religionKey;
  const parts = [];
  if (trend.loggerKey && parts.push("k:" + trend.loggerKey), trend.ratioKey) {
    const r = trend.ratioKey;
    parts.push("r:" + r.num + "/" + (null != r.den ? r.den : "") + "/" + (null != r.denSum ? r.denSum : "") + (r.campaignSumNum ? "+c" : ""));
  }
  return trend.campaignFromAgeLocal && parts.push("camp"), trend.includeDead && parts.push("dead"), 
  trend.summary && trend.summary.id && parts.push("s:" + trend.summary.id + ":" + (trend.summary.scope || "")), 
  parts.join("|") || "anon";
}

function probeTrend(trend) {
  if (!trend) return {
    standOk: !1,
    trendOk: !1,
    loggerLineOk: !1,
    loggerTurnCount: 0,
    summaryTurnCount: 0
  };
  _probeTrendCache || (_probeTrendCache = new Map);
  const id = trendIdentityKey(trend);
  if (_probeTrendCache.has(id)) return _probeTrendCache.get(id);
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
  return _probeTrendCache.set(id, result), result;
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

function trendSourceUncached(trend) {
  if (trend.religionKey) return buildReligionDatasets(trend);
  const logged = function(metric) {
    if (metric.religionKey) return buildReligionDatasets(metric);
    const valueOf = loggerValueOf(metric), empty = {
      datasets: [],
      start: 0,
      end: 0,
      blocks: [],
      turnCount: 0,
      startedLate: !1,
      firstAgeLabel: "",
      firstTurn: 0,
      yTitle: metric.yTitle,
      label: null,
      currentAgeOnly: !1,
      source: "logger"
    }, ctx = ensureStoreLayout();
    if (!ctx || !ctx.store || !ctx.store.ages || !metric.loggerKey && !metric.ratioKey) return empty;
    const layout = ctx.layout, end = ctx.end, counted = countLoggerTurns(metric, layout, ctx.earliestCi);
    if (!counted.lineOk) return empty;
    const {turnCount: turnCount, firstCi: firstCi, firstT: firstT, firstAgeLabel: firstAgeLabel, fromGameStart: fromGameStart} = counted, pids = new Set;
    for (const L of layout) for (const t of L.turns) {
      const turnRow = L.age.turns[t], p = turnRow && turnRow.p || {};
      for (const pid in p) isMajorPid(pid) && pids.add(pid);
    }
    const campaignPlain = !!metric.campaignFromAgeLocal, campaignRatio = !(!metric.ratioKey || !metric.ratioKey.campaignSumNum), ratioSpec = metric.ratioKey, datasets = [];
    for (const pid of pids) {
      const data = [];
      let pastLocal = 0;
      for (const L of layout) {
        let lastLocal = null;
        for (const t of L.turns) {
          const turnRow = L.age.turns[t], p = turnRow && turnRow.p || {}, row = p[pid], x = L.offset + (t - L.minT);
          if (campaignRatio && ratioSpec) {
            const local = row && null != row[ratioSpec.num] ? row[ratioSpec.num] : null;
            null != local && (lastLocal = local);
            const den = row && null != row[ratioSpec.den] ? row[ratioSpec.den] : null;
            if (null != local && null != den && 0 !== den) {
              const scale = null != ratioSpec.scale ? ratioSpec.scale : 1, dp = null != ratioSpec.dp ? ratioSpec.dp : 1, f = Math.pow(10, dp), cum = pastLocal + local;
              data.push({
                x: x,
                y: Math.round(scale * cum / den * f) / f
              });
            }
          } else if (campaignPlain) {
            const y = valueOf(row, p);
            null != y && (lastLocal = y, data.push({
              x: x,
              y: pastLocal + y
            }));
          } else {
            const y = valueOf(row, p);
            null != y && data.push({
              x: x,
              y: y
            });
          }
        }
        null != lastLocal && (pastLocal += lastLocal);
      }
      if (!data.length) continue;
      const color = ownerColor({
        ownerPlayer: Number(pid)
      });
      datasets.push({
        label: ownerName({
          ownerPlayer: Number(pid)
        }),
        pid: Number(pid),
        data: data,
        parsing: !1,
        borderColor: color,
        backgroundColor: color,
        pointRadius: 0,
        stepped: !!metric.stepped,
        tension: metric.stepped ? 0 : .15
      });
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
      end: null != lastX ? lastX : end,
      blocks: blocks,
      turnCount: turnCount,
      startedLate: startedLate,
      firstAgeLabel: firstAgeLabel,
      firstTurn: null != firstT ? firstT : 0,
      yTitle: metric.yTitle,
      label: null,
      currentAgeOnly: !1,
      source: "logger"
    };
  }(trend);
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
      yTitle: trend.yTitle,
      label: null,
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
      if (!isMajorPid(pid)) continue;
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
      yTitle: spec.yTitle || trend.yTitle,
      label: spec.label || null,
      currentAgeOnly: !0,
      source: "summary"
    };
  }(trend);
  return logged.turnCount >= native.turnCount ? logged : native;
}

function trendSource(trend) {
  _trendSourceCache || (_trendSourceCache = new Map);
  const id = trendIdentityKey(trend);
  if (_trendSourceCache.has(id)) return _trendSourceCache.get(id);
  const src = trendSourceUncached(trend);
  return _trendSourceCache.set(id, src), src;
}

function sourceLabel(src) {
  return "summary" === src.source ? "Native log" : "Chronicle log";
}

function metricLabel(metric) {
  if (!metric.trend) return metric.label;
  const spec = metric.trend.summary;
  if (!spec || !spec.label) return metric.label;
  if (isHistoricalView()) return metric.label;
  try {
    const p = probeTrend(metric.trend), effectiveLogger = p.loggerLineOk ? p.loggerTurnCount : 0;
    if (p.summaryTurnCount > effectiveLogger) return spec.label;
  } catch (e) {}
  return metric.label;
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
    const key = trend.religionKey, empty = {
      labels: [],
      data: [],
      colors: [],
      indexAxis: "x",
      valueTitle: trend.yTitle || "",
      catTitle: "Religion",
      signed: !1
    };
    if (!key) return empty;
    const rel = function() {
      const store = loadLoggerStore();
      if (!store || !store.ages) return null;
      const {curCi: curCi, curTurn: curTurn} = bracketCiTurn(), ages = Object.keys(store.ages).map(k => {
        const m = resolveAgeMeta(k, store.ages[k]);
        return {
          turns: store.ages[k].turns,
          ci: m.ci
        };
      }).filter(a => null == curCi || a.ci <= curCi).sort((a, b) => b.ci - a.ci);
      for (const age of ages) {
        let turns = Object.keys(age.turns || {}).map(Number);
        if (null != curCi && age.ci === curCi && (turns = turns.filter(t => t <= curTurn)), 
        !turns.length) continue;
        const maxT = turns.reduce((a, b) => b > a ? b : a, turns[0]), row = age.turns[maxT];
        if (row && row.rel && Object.keys(row.rel).length) return row.rel;
      }
      return null;
    }();
    if (!rel) return empty;
    const rows = [];
    for (const h in rel) {
      const y = rel[h] && rel[h][key];
      if (null == y) continue;
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
      valueTitle: trend.yTitle || "",
      catTitle: "Religion",
      signed: !1
    };
  }(trend);
  const src = trendSource(trend), includeDead = !!trend.includeDead, rows = [];
  if ("summary" === src.source && src.turnCount > 0) for (const ds of src.datasets) ds.data.length && (includeDead || isPlayerAlive(ds.pid)) && rows.push({
    label: ds.label,
    value: ds.data[ds.data.length - 1].y,
    color: ds.borderColor
  }); else for (const [pid, y] of function(trend) {
    const out = new Map, store = loadLoggerStore();
    if (!store || !store.ages) return out;
    const valueOf = loggerValueOf(trend), campaignPlain = !!trend.campaignFromAgeLocal, campaignRatio = !(!trend.ratioKey || !trend.ratioKey.campaignSumNum), ratioSpec = trend.ratioKey, {curCi: curCi, curTurn: curTurn} = bracketCiTurn(), ages = Object.keys(store.ages).map(k => {
      const m = resolveAgeMeta(k, store.ages[k]);
      return {
        turns: store.ages[k].turns,
        ci: m.ci
      };
    }).filter(a => null == curCi || a.ci <= curCi).sort((a, b) => a.ci - b.ci), pastLocal = {};
    for (const age of ages) {
      let turns = Object.keys(age.turns || {}).map(Number).sort((a, b) => a - b);
      null != curCi && age.ci === curCi && (turns = turns.filter(t => t <= curTurn));
      const lastLocal = {};
      for (const t of turns) {
        const turnRow = age.turns[t], p = turnRow && turnRow.p || {};
        for (const pid in p) {
          if (!isMajorPid(pid)) continue;
          const row = p[pid], nPid = Number(pid);
          if (campaignRatio && ratioSpec) {
            const local = row && null != row[ratioSpec.num] ? row[ratioSpec.num] : null;
            null != local && (lastLocal[pid] = local);
            const den = row && null != row[ratioSpec.den] ? row[ratioSpec.den] : null;
            if (null != local && null != den && 0 !== den) {
              const scale = null != ratioSpec.scale ? ratioSpec.scale : 1, dp = null != ratioSpec.dp ? ratioSpec.dp : 1, f = Math.pow(10, dp), cum = (pastLocal[pid] || 0) + local;
              out.set(nPid, Math.round(scale * cum / den * f) / f);
            }
          } else if (campaignPlain) {
            const y = valueOf(row, p);
            null != y && (lastLocal[pid] = y, out.set(nPid, (pastLocal[pid] || 0) + y));
          } else {
            const y = valueOf(row, p);
            null != y && out.set(nPid, y);
          }
        }
      }
      for (const pid in lastLocal) pastLocal[pid] = (pastLocal[pid] || 0) + lastLocal[pid];
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
    valueTitle: src.yTitle || trend.yTitle || "",
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

function isSyntheticReligionLabel(s) {
  if (null == s) return !0;
  const t = String(s).trim();
  return !t || (0 === t.indexOf("LOC_") || (!!/^custom\s+\d+$/i.test(t) || !!/^religion[\s_-]?-?\d+$/i.test(t)));
}

function resolvePlayerReligionName(playerRel) {
  if (!playerRel || "function" != typeof playerRel.getReligionName) return null;
  let raw = null;
  try {
    raw = playerRel.getReligionName();
  } catch (e) {
    return null;
  }
  if (null == raw) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const ugc = function(s) {
    const m = String(s).match(/:\s*ugc\s+\d+;([^;}]*)/i);
    return m && m[1] && m[1].trim() ? m[1].trim() : null;
  }(s);
  return ugc && !isSyntheticReligionLabel(ugc) ? ugc : isSyntheticReligionLabel(s) ? null : s;
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
  const empty = {
    datasets: [],
    start: 0,
    end: 0,
    blocks: [],
    turnCount: 0,
    startedLate: !1,
    firstAgeLabel: "",
    firstTurn: 0,
    yTitle: metric.yTitle,
    label: null,
    currentAgeOnly: !1,
    source: "logger"
  }, key = metric.religionKey;
  if (!key) return empty;
  const ctx = ensureStoreLayout();
  if (!ctx || !ctx.store || !ctx.store.ages) return empty;
  const layout = ctx.layout, end = ctx.end, counted = countReligionTurns(metric, layout, ctx.earliestCi);
  if (!counted.lineOk) return empty;
  const {turnCount: turnCount, firstT: firstT, firstAgeLabel: firstAgeLabel, fromGameStart: fromGameStart} = counted, hashes = new Set;
  for (const L of layout) for (const t of L.turns) {
    const turnRow = L.age.turns[t], rel = turnRow && turnRow.rel;
    if (rel) for (const h in rel) rel[h] && null != rel[h][key] && hashes.add(h);
  }
  if (!hashes.size) return empty;
  const datasets = [];
  for (const h of hashes) {
    const data = [];
    let seen = !1;
    for (const L of layout) for (const t of L.turns) {
      const turnRow = L.age.turns[t], rel = turnRow && turnRow.rel, raw = rel && rel[h] && null != rel[h][key] ? rel[h][key] : null;
      null != raw && (seen = !0), seen && data.push({
        x: L.offset + (t - L.minT),
        y: null != raw ? raw : 0
      });
    }
    if (!data.length) continue;
    const meta = religionMeta(h);
    datasets.push({
      label: meta.name,
      data: data,
      parsing: !1,
      borderColor: meta.color,
      backgroundColor: meta.color,
      pointRadius: 0,
      stepped: !!metric.stepped,
      tension: metric.stepped ? 0 : .15
    });
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
    end: null != lastX ? lastX : end,
    blocks: blocks,
    turnCount: turnCount,
    startedLate: startedLate,
    firstAgeLabel: firstAgeLabel,
    firstTurn: null != firstT ? firstT : 0,
    yTitle: metric.yTitle,
    label: null,
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
  return String(type).replace(/^[A-Z]+_/, "").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function resolveTypeName(table, type) {
  if (null == type || "" === String(type).trim()) return "Unknown";
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

function isMajorPid(pid) {
  const n = Number(pid);
  try {
    if ("undefined" != typeof Players && "function" == typeof Players.get) {
      const p = Players.get(n);
      if (p && null != p.isMajor) return !!p.isMajor;
    }
  } catch (e) {}
  try {
    const store = loadLoggerStore(), m = store && store.meta && store.meta.players && (store.meta.players[n] || store.meta.players[String(n)]);
    if (m && null != m.isMajor) return !!m.isMajor;
    if (m) return !0;
  } catch (e) {}
  return !1;
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
    for (const pid in map) if (!metric.majorsOnly || isMajorPid(pid)) for (const type in map[pid]) {
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
        const empty = {};
        try {
          if ("undefined" == typeof Players || "function" != typeof Players.getAlive) return empty;
          const byPid = {};
          for (const p of Players.getAlive()) {
            if (!p || !p.isMajor) continue;
            const pid = p.id, tally = {};
            if ("UnitsOwnedByType" === metricId) try {
              const pu = p.Units, ids = pu && ("function" == typeof pu.getUnitIds ? pu.getUnitIds() : "function" == typeof pu.getUnits ? pu.getUnits() : null);
              if (ids) for (const uid of ids) try {
                const u = "undefined" != typeof Units && Units.get ? Units.get(uid) : null;
                if (!u) continue;
                let name = null;
                try {
                  const def = GameInfo.Units.lookup(u.type);
                  def && def.UnitType && (name = def.UnitType);
                } catch (e) {}
                if (!name || "26" === name) continue;
                tally[name] = (tally[name] || 0) + 1;
              } catch (e) {}
            } catch (e) {} else if ("BuildingsOwnedByType" === metricId || "ImprovementsOwnedByType" === metricId || "WondersOwnedByType" === metricId || "DistrictsOwnedByType" === metricId) try {
              if (p.Cities && "function" == typeof p.Cities.getCities) for (const c of p.Cities.getCities() || []) if ("DistrictsOwnedByType" === metricId) try {
                if (c.Districts && "function" == typeof c.Districts.getIds) for (const did of c.Districts.getIds() || []) try {
                  const d = "undefined" != typeof Districts && Districts.get ? Districts.get(did) : null;
                  if (!d) continue;
                  const raw = null != d.type ? d.type : d.districtType;
                  let name = String(raw);
                  try {
                    const def = GameInfo.Districts.lookup(raw);
                    def && def.DistrictType && (name = def.DistrictType);
                  } catch (e) {}
                  tally[name] = (tally[name] || 0) + 1;
                } catch (e) {}
              } catch (e) {} else try {
                if (c.Constructibles && "function" == typeof c.Constructibles.getIds) for (const cid of c.Constructibles.getIds() || []) try {
                  const inst = "undefined" != typeof Constructibles && Constructibles.getByComponentID ? Constructibles.getByComponentID(cid) : null;
                  if (!inst) continue;
                  if (!1 === inst.complete) continue;
                  if (null != inst.percentComplete && inst.percentComplete < 100) continue;
                  let cls = null, name = String(inst.type);
                  try {
                    const def = GameInfo.Constructibles.lookup(inst.type);
                    def && (cls = def.ConstructibleClass || null, def.ConstructibleType && (name = def.ConstructibleType));
                  } catch (e) {}
                  ("BuildingsOwnedByType" === metricId && "BUILDING" === cls || "ImprovementsOwnedByType" === metricId && "IMPROVEMENT" === cls || "WondersOwnedByType" === metricId && "WONDER" === cls) && (tally[name] = (tally[name] || 0) + 1);
                } catch (e) {}
              } catch (e) {}
            } catch (e) {}
            Object.keys(tally).length && (byPid[pid] = tally);
          }
          return byPid;
        } catch (e) {
          return empty;
        }
      }(metric.id);
      for (const pid in live) {
        livePids.add(Number(pid));
        for (const type in live[pid]) cur.set(`${pid}|${type}`, live[pid][type]);
      }
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
  return "event" === metric.byType ? "Chronicle log · Whole game" : "Current standings · Owned stock";
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
    name: null != r.n && "" !== r.n ? r.n : "Settlement",
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
  setNote(ui, byTypeNote(metric)), ui.chartInner.style.display = "none", ui.board.style.display = "block", 
  void function(container, metric) {
    const {perPlayer: perPlayer, players: players} = readByTypeData(metric);
    if (container.textContent = "", !players.length) return container.textContent = `No ${metric.label.toLowerCase()} to show.`, 
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
  };
  let config;
  if ("bar" === metric.kind) {
    setNote(ui, byTypeNote(metric));
    const {labels: labels, datasets: datasets} = buildBarChart(metric, page), hasData = datasets.length > 0 && labels.length > 0;
    if (setNoData(ui.canvas, hasData ? "" : `No data recorded for ${metricLabel(metric)}.`), 
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
        plugins: plugins,
        scales: {
          x: {
            type: "category",
            title: axisTitle(metric.xTitle),
            ticks: tickOpts,
            grid: {
              color: "#4A4034"
            }
          },
          y: {
            type: "linear",
            min: 0,
            title: axisTitle(metric.yTitle),
            ticks: tickOpts,
            grid: {
              color: "#4A4034"
            }
          }
        }
      }
    };
  } else if ("live" === metric.kind || "stand" === view) {
    const isLive = "live" === metric.kind;
    if (isLive && isHistoricalView() && bankedSettlementRows().length > 0) setNote(ui, "Chronicle log  ·  Last logged standings"); else {
      const stand = [ "Current standings" ];
      !isLive && metric.trend && stand.unshift(sourceLabel(trendSource(metric.trend))), 
      setNote(ui, stand.join("  ·  "));
    }
    const res = isLive ? metric.compute() : buildStandings(metric.trend), hasData = res && res.data && res.data.length > 0;
    if (setNoData(ui.canvas, hasData ? "" : `No data available for ${metricLabel(metric)}.`), 
    !hasData) return;
    const horiz = "y" === res.indexAxis, catAxis = {
      type: "category",
      title: axisTitle(res.catTitle),
      ticks: tickOpts,
      grid: {
        color: "#4A4034"
      }
    }, valAxis = {
      type: "linear",
      min: res.signed ? void 0 : 0,
      title: axisTitle(res.valueTitle),
      ticks: tickOpts,
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
    }(src)) return setNote(ui, ""), void setNoData(ui.canvas, `No ${metricLabel(metric)} recorded yet (tracked only while Chronicle is enabled).`);
    {
      const {datasets: datasets, start: start, end: end} = src;
      setNoData(ui.canvas, "");
      const scope = src.currentAgeOnly ? `${prettifyType(src.firstAgeLabel)} only` : src.startedLate ? `Tracked since ${prettifyType(src.firstAgeLabel)} turn ${src.firstTurn}` : "", provenance = [ sourceLabel(src), scope ].filter(Boolean).join("  ·  ");
      let hint = "";
      !legendHintShown && datasets.length > 1 && (hint = "Click a civ in the legend to toggle it", 
      legendHintShown = !0), setNote(ui, [ provenance, hint ].filter(Boolean).join("  ·  "));
      const turnLabel = x => {
        for (const b of src.blocks) {
          const bEndX = b.offset + (b.maxT - b.minT);
          if (x >= b.offset && x <= bEndX) return `${b.label} turn ${b.minT + (x - b.offset)}`;
        }
        return `Turn ${x}`;
      }, dp = trend.ratioKey ? trend.ratioKey.dp : null, fmtVal = y => null != dp ? Number(y).toFixed(dp) : Number.isInteger(y) ? String(y) : Number(y).toFixed(1), tk = turnAxisTicks(src.blocks, start, end);
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
                label: item => `${item.dataset.label}: ${fmtVal(item.raw.y)}`
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
              title: axisTitle(src.yTitle),
              ticks: tickOpts,
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

function setNote(ui, text) {
  ui && ui.note && (ui.note.textContent = text || "");
}

function setNoData(canvas, msg) {
  const wrap = canvas.parentNode;
  if (!wrap) return;
  let el = wrap.querySelector(".ozq-nodata");
  el || (el = document.createElement("div"), el.className = "ozq-nodata", el.setAttribute("style", "position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#C9BFA6;font-size:1.2rem;pointer-events:none;text-align:center"), 
  wrap.appendChild(el)), el.textContent = msg || "", el.style.display = msg ? "flex" : "none", 
  canvas.style.display = msg ? "none" : "block";
}

function makeNativeButton(label, onClick, opts) {
  opts = opts || {};
  const button = document.createElement("div");
  opts.id && (button.id = opts.id);
  const sizing = opts.secondary ? "font-body text-sm tracking-100 px-4 py-1.5 " : "font-title text-base uppercase tracking-150 px-5 py-2 ";
  return button.className = "pointer-events-auto fxs-button relative flex items-center justify-center text-accent-1 text-shadow-subtle leading-none text-center cursor-pointer " + sizing + (opts.extraClass || ""), 
  button.setAttribute("data-name", "Button"), button.setAttribute("activatable", "true"), 
  button.setAttribute("data-audio-press-ref", "data-audio-primary-button-press"), 
  button.setAttribute("data-audio-focus-ref", "data-audio-primary-button-focus"), 
  button.innerHTML = '<div class="absolute inset-0"><div class="absolute inset-0 fxs-button__bg fxs-button__bg--base"></div><div class="absolute inset-0 opacity-0 fxs-button__bg fxs-button__bg--focus"></div><div class="absolute inset-0 opacity-0 fxs-button__bg fxs-button__bg--active"></div></div><div class="ozq-btn-label relative flex flex-auto items-center justify-center"></div>', 
  button.querySelector(".ozq-btn-label").textContent = label, button.addEventListener("click", onClick), 
  button;
}

function highlightButton(button, active) {
  const label = button.querySelector(".ozq-btn-label");
  label && (label.style.color = active ? "#FFD98A" : "#E8E2D0"), button.style.opacity = active ? "1" : "0.72";
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
    viewport: viewport,
    track: track,
    prev: prev,
    next: next,
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
    },
    hasOverflow: function() {
      return overflowing;
    }
  };
}

const CANCEL_ACTIONS = [ "cancel", "keyboard-escape", "mousebutton-right", "sys-menu" ], chronicleInputHandler = {
  handleInput(e) {
    const d = e && e.detail || {};
    return !document.getElementById(OVERLAY_ID) || (!d.name || CANCEL_ACTIONS.indexOf(d.name) < 0 || (function(e) {
      if ("engine-input" !== e.type || !e.detail) return !1;
      if ("undefined" == typeof InputActionStatuses) return !0;
      return e.detail.status === InputActionStatuses.FINISH;
    }(e) && closeOverlay(), !1));
  },
  handleNavigation: () => !0
};

function closeOverlay() {
  activeChart && (activeChart.destroy(), activeChart = null), document.getElementById(OVERLAY_ID)?.remove();
  const onClose = viewMode && viewMode.onClose;
  if (viewMode = null, colorMapCache = null, invalidateOpenCaches(), "function" == typeof onClose) try {
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
  opts = opts || {}, store && store.ages && (document.getElementById(OVERLAY_ID) && closeOverlay(), 
  viewMode = {
    store: store,
    title: opts.title || "Game Details",
    caption: opts.caption || "",
    onClose: opts.onClose || null
  }, colorMapCache = null, openOverlay());
}

try {
  globalThis.ozqChronicleGraphs = {
    open: openOverlay,
    openForStore: openOverlayForStore,
    close: closeOverlay,
    version: "0.31.26"
  };
} catch (e) {
  try {
    window.ozqChronicleGraphs = {
      open: openOverlay,
      openForStore: openOverlayForStore,
      close: closeOverlay,
      version: "0.31.26"
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

let openSeq = 0;

function openOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;
  if ("undefined" == typeof Chart) return void function(done) {
    if ("undefined" != typeof Chart) return applyChartDefaults(), void done();
    if (chartWaiters) chartWaiters.push(done); else {
      chartWaiters = [ done ];
      try {
        const s = document.createElement("script");
        s.src = "fs://game/core/ui/external/chart-js/chart.js", s.onload = () => {
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
  }(() => openOverlay());
  const seq = ++openSeq, tOpen0 = openNowMs();
  applyChartDefaults(), legendHintShown = !1;
  const historical = isHistoricalView();
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
  root.id = OVERLAY_ID;
  const backdrop = document.createElement("div");
  backdrop.setAttribute("style", "position:fixed;left:0;top:0;width:100%;height:100%;z-index:999998;background:rgba(6,7,10,0.78);pointer-events:auto"), 
  backdrop.addEventListener("click", closeOverlay), root.appendChild(backdrop);
  const panel = document.createElement("div");
  panel.setAttribute("style", PANEL_BOX), root.appendChild(panel);
  const header = document.createElement("div");
  header.setAttribute("style", "display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;flex-shrink:0;width:100%;min-width:0;box-sizing:border-box");
  const titleCol = document.createElement("div");
  titleCol.setAttribute("style", "display:flex;flex-direction:column;align-items:stretch;gap:4px;flex:1 1 auto;min-width:0;overflow:hidden");
  const titleRow = document.createElement("div");
  titleRow.setAttribute("style", "display:flex;flex-direction:row;align-items:flex-end;min-width:0;overflow:hidden;flex:1 1 auto");
  const title = document.createElement("div");
  title.textContent = historical ? viewMode && viewMode.title || "Game Details" : "Chronicle — Game Statistics", 
  title.className = "font-title uppercase tracking-150", title.setAttribute("style", "font-size:1.8rem;color:#F0E6D2;flex-shrink:0;line-height:1.2;margin-right:20px"), 
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
  if (headerActions.setAttribute("style", "display:flex;align-items:center;flex-shrink:0;margin-left:16px"), 
  !historical) {
    const hofBtn = makeNativeButton("Hall of Fame", () => {
      try {
        const api = "undefined" != typeof globalThis && globalThis.ozqChronicleHof || "undefined" != typeof window && window.ozqChronicleHof;
        api && "function" == typeof api.open && api.open();
      } catch (e) {}
    }, {});
    muteHeaderBtn(hofBtn), hofBtn.style.marginRight = "9px", headerActions.appendChild(hofBtn);
  }
  const closeBtn = makeNativeButton("Close", closeOverlay, {});
  if (muteHeaderBtn(closeBtn), headerActions.appendChild(closeBtn), header.appendChild(headerActions), 
  panel.appendChild(header), !catList.length) {
    const empty = document.createElement("div");
    return empty.textContent = "No stats recorded yet. Chronicle logs each turn while it is enabled.", 
    empty.setAttribute("style", "flex:1 1 auto;display:flex;align-items:center;justify-content:center;color:#C9BFA6;font-size:1.15rem;text-align:center;padding:2rem"), 
    panel.appendChild(empty), document.body.appendChild(root), void openLog("open-fill total=" + Math.round(openNowMs() - tOpen0) + "ms flush=" + flushMs + " probe=" + probeMs + " empty=1 historical=" + (historical ? 1 : 0));
  }
  const categoryRow = makeScrollRow({
    name: "cat",
    marginBottom: 10
  });
  panel.appendChild(categoryRow.root);
  const chartRow = makeScrollRow({
    name: "chart",
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
  const ui = {
    canvas: canvas,
    chartInner: chartInner,
    board: board,
    note: note
  }, chartButtons = [], viewButtons = {
    trend: null,
    stand: null
  };
  let curMetric = null, curView = "trend", curPage = 0;
  const renderPage = () => {
    renderChart(ui, curMetric, curView, curPage), pageBar.textContent = "";
    const pages = "bar" === curMetric.kind ? function(metric) {
      const {typeTotal: typeTotal} = readByTypeData(metric);
      return Math.max(1, Math.ceil(typeTotal.size / 12));
    }(curMetric) : 1;
    if (pages <= 1) return;
    const prev = makeNativeButton("‹ Prev", () => {
      curPage > 0 && (curPage--, renderPage());
    }, {
      secondary: !0
    }), next = makeNativeButton("Next ›", () => {
      curPage < pages - 1 && (curPage++, renderPage());
    }, {
      secondary: !0
    });
    0 === curPage && (prev.style.opacity = "0.4"), curPage === pages - 1 && (next.style.opacity = "0.4");
    const label = document.createElement("div");
    label.textContent = `Page ${curPage + 1} / ${pages}`, label.setAttribute("style", "color:#E8E2D0;font-size:0.9rem;min-width:6rem;text-align:center"), 
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
      curPage = 0, renderPage();
    }
  }, selectChart = (inCat, index) => {
    chartButtons.forEach((b, i) => highlightButton(b, i === index)), curMetric = inCat[index], 
    setView((metric => {
      if (viewBar.textContent = "", viewButtons.trend = viewButtons.stand = null, "live" === metric.kind || "bar" === metric.kind || "board" === metric.kind) return viewBar.style.display = "none", 
      "stand";
      viewBar.style.display = "flex";
      const tAvail = trendAvailable(metric), sAvail = standAvailable(metric);
      return viewButtons.trend = makeNativeButton("Trends", () => setView("trend"), {
        secondary: !0
      }), viewButtons.stand = makeNativeButton("Standings", () => setView("stand"), {
        secondary: !0
      }), viewButtons.trend._avail = tAvail, viewButtons.stand._avail = sAvail, viewBar.appendChild(viewButtons.trend), 
      viewBar.appendChild(viewButtons.stand), tAvail ? "trend" : "stand";
    })(curMetric)), chartButtons[index] && chartRow.scrollToShow(chartButtons[index]);
  }, selectCategory = (catIndex, preferId) => {
    catButtons.forEach((b, i) => highlightButton(b, i === catIndex)), catButtons[catIndex] && categoryRow.scrollToShow(catButtons[catIndex]), 
    chartButtons.length = 0;
    const inCat = metrics.filter(m => m.category === catList[catIndex]);
    if (inCat.forEach((metric, i) => {
      const b = makeNativeButton(metricLabel(metric), () => selectChart(inCat, i), {
        secondary: !0
      });
      chartButtons.push(b);
    }), chartRow.setButtons(chartButtons), inCat.length) {
      const idx = preferId ? Math.max(0, inCat.findIndex(m => m.id === preferId)) : 0;
      selectChart(inCat, idx < 0 ? 0 : idx);
    }
  }, catButtons = catList.map((cat, i) => makeNativeButton(cat, () => selectCategory(i), {}));
  document.body.appendChild(root), categoryRow.setButtons(catButtons), openLog("open-fill total=" + Math.round(openNowMs() - tOpen0) + "ms flush=" + flushMs + " probe=" + probeMs + " metrics=" + metrics.length + " cats=" + catList.length + " historical=" + (historical ? 1 : 0));
  const def = metrics.find(m => m.default) || metrics[0], defCat = def ? Math.max(0, catList.indexOf(def.category)) : 0;
  requestAnimationFrame(() => {
    if (seq !== openSeq || !document.getElementById(OVERLAY_ID)) return;
    const tChart0 = openNowMs();
    selectCategory(defCat, def && def.id), openLog("open-first-chart " + Math.round(openNowMs() - tChart0) + "ms"), 
    requestAnimationFrame(() => {
      seq === openSeq && document.getElementById(OVERLAY_ID) && (categoryRow.remeasure(), 
      chartRow.remeasure());
    });
  });
}

function injectButton(screen) {
  let tries = 0;
  const attempt = () => {
    if (screen.querySelector("#ozq-chronicle-graphs-button")) return;
    const row = screen.querySelector(".bottom-10.right-10");
    if (!row) return void (tries++ < 180 && requestAnimationFrame(attempt));
    const button = makeNativeButton("Chronicle", openOverlay, {
      id: "ozq-chronicle-graphs-button",
      extraClass: "mr-8"
    });
    row.insertBefore(button, row.firstChild);
  };
  requestAnimationFrame(attempt);
}

function injectPauseMenuButton(container) {
  if (container.querySelector("#ozq-chronicle-pause-button")) return;
  const button = makeNativeButton("Chronicle", openOverlay, {
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

function install() {
  const existing = document.querySelector("screen-victory-progress");
  existing && injectButton(existing);
  const existingPause = document.getElementById("pause-menu-button-container");
  existingPause && injectPauseMenuButton(existingPause);
  new MutationObserver(mutations => {
    for (const mutation of mutations) for (const added of mutation.addedNodes) inspectNode(added);
  }).observe(document.body, {
    childList: !0,
    subtree: !0
  }), function() {
    try {
      import("/core/ui/context-manager/context-manager.js").then(m => {
        const cm = m && m.default;
        if (!cm || "function" != typeof cm.registerEngineInputHandler) return;
        cm.registerEngineInputHandler(chronicleInputHandler);
        const arr = cm.engineInputEventHandlers;
        if (Array.isArray(arr)) {
          const i = arr.indexOf(chronicleInputHandler);
          i > 0 && (arr.splice(i, 1), arr.unshift(chronicleInputHandler));
        }
      }).catch(() => {});
    } catch (e) {}
  }(), console.error(`${LOG} loaded.`);
}

!function scheduleInstall() {
  document.body ? install() : "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", install, {
    once: !0
  }) : requestAnimationFrame(scheduleInstall);
}();

export { };
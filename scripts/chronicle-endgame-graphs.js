const LOG = "[ozq-chronicle]", OVERLAY_ID = "ozq-chronicle-graphs-overlay";

function currentGameSeed() {
  try {
    const g = Configuration.getGame();
    if (g && null != g.gameSeed) return g.gameSeed;
  } catch (e) {}
  return null;
}

function currentSetup() {
  try {
    const g = Configuration.getGame();
    if (g && null != g.campaignSetupGUID && String(g.campaignSetupGUID).length) return String(g.campaignSetupGUID);
  } catch (e) {}
  return null;
}

function loadLoggerStore() {
  const seed = currentGameSeed(), readKey = key => {
    if (!key) return null;
    try {
      const raw = localStorage.getItem("chronicle:v1:" + key);
      if (raw) {
        const o = JSON.parse(raw);
        if (o && o.ages) return o;
      }
    } catch (e) {}
    return null;
  };
  let store = readKey(function() {
    const setup = currentSetup(), seed = currentGameSeed(), seedOk = null != seed && "0" !== String(seed);
    return setup && seedOk ? `${setup}#${seed}` : seedOk ? `seed:${seed}` : setup || null;
  }());
  if (store && (null == seed || store.fp && store.fp.seed === seed)) return store;
  if (null != seed) for (const s of function() {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && 0 === k.indexOf("chronicle:v1:") && "chronicle:v1:current" !== k) try {
          const o = JSON.parse(localStorage.getItem(k));
          o && o.ages && out.push({
            key: k,
            store: o
          });
        } catch (e) {}
      }
    } catch (e) {}
    return out;
  }()) if (s.store.fp && s.store.fp.seed === seed) return s.store;
  const setup = currentSetup();
  if (setup) {
    const lg = readKey(setup);
    if (lg && !lg.fp) return lg;
  }
  try {
    const p = readKey(localStorage.getItem("chronicle:v1:current"));
    if (p && (null == seed || !p.fp || p.fp.seed === seed)) return p;
  } catch (e) {}
  return null;
}

const CATEGORIES = [ "Growth", "Totals", "Settlements", "Economy", "Breakdown", "World" ], METRICS = [ {
  id: "Science",
  label: "Science / Turn",
  category: "Growth",
  loggerKey: "Science",
  default: !0
}, {
  id: "TechsAcquired",
  label: "Technologies",
  category: "Growth",
  stepped: !0,
  loggerKey: "TechsAcquired"
}, {
  id: "Culture",
  label: "Culture / Turn",
  category: "Growth",
  loggerKey: "Culture"
}, {
  id: "CivicsAcquired",
  label: "Civics",
  category: "Growth",
  stepped: !0,
  loggerKey: "CivicsAcquired",
  loggerOnly: !0
}, {
  id: "goldNet",
  label: "Gold / Turn",
  category: "Growth",
  loggerKey: "goldNet",
  loggerOnly: !0,
  signed: !0,
  yTitle: "Net gold / turn"
}, {
  id: "Gold",
  label: "Gold (Treasury)",
  category: "Growth",
  loggerKey: "gold"
}, {
  id: "Food",
  label: "Food / Turn",
  category: "Growth",
  cityRollup: !0,
  loggerKey: "Food"
}, {
  id: "Population",
  label: "Population",
  category: "Growth",
  cityRollup: !0,
  loggerKey: "Population"
}, {
  id: "hap",
  label: "Happiness / Turn",
  category: "Growth",
  loggerKey: "hap",
  loggerOnly: !0,
  signed: !0,
  yTitle: "Net happiness / turn"
}, {
  id: "inf",
  label: "Influence / Turn",
  category: "Growth",
  loggerKey: "inf",
  loggerOnly: !0,
  signed: !0,
  yTitle: "Influence / turn"
}, {
  id: "Production",
  label: "Production / Turn",
  category: "Growth",
  cityRollup: !0,
  loggerKey: "Production"
}, {
  id: "Tourism",
  label: "Tourism / Turn",
  category: "Growth",
  cityRollup: !0,
  loggerKey: "Tourism"
}, {
  id: "ratioUrbanTrend",
  label: "Urbanization %",
  category: "Growth",
  loggerOnly: !0,
  ratioKey: {
    num: "upop",
    den: "tpop",
    scale: 100,
    dp: 0
  },
  yTitle: "% of population urban"
}, {
  id: "ratioSciPerCitizenTrend",
  label: "Science / Citizen",
  category: "Growth",
  loggerOnly: !0,
  ratioKey: {
    num: "Science",
    den: "tpop",
    scale: 1,
    dp: 1
  },
  yTitle: "Science per citizen / turn"
}, {
  id: "ratioTradeDepTrend",
  label: "Trade / Settlement",
  category: "Growth",
  loggerOnly: !0,
  ratioKey: {
    num: "tr",
    den: "cit",
    scale: 1,
    dp: 2
  },
  yTitle: "Trade routes per settlement"
}, {
  id: "ratioConquestTrend",
  label: "Conquest %",
  category: "Growth",
  loggerOnly: !0,
  ratioKey: {
    num: "conq",
    den: "set",
    scale: 100,
    dp: 0
  },
  yTitle: "% of settlements taken by force"
}, {
  id: "ratioSettlementCapTrend",
  label: "Cap Used %",
  category: "Growth",
  loggerOnly: !0,
  ratioKey: {
    num: "set",
    den: "cap",
    scale: 100,
    dp: 0
  },
  yTitle: "% of settlement cap used"
}, {
  id: "CitiesTotal",
  label: "Settlements Total",
  category: "Totals",
  loggerKey: "set",
  loggerOnly: !0,
  stepped: !0,
  yTitle: "Settlements owned"
}, {
  id: "trendSettlementCap",
  label: "Settlement Cap",
  category: "Totals",
  loggerKey: "cap",
  loggerOnly: !0,
  stepped: !0,
  yTitle: "Settlement cap"
}, {
  id: "trendCities",
  label: "Cities",
  category: "Totals",
  loggerKey: "cityN",
  loggerOnly: !0,
  stepped: !0,
  yTitle: "Cities (promoted settlements)"
}, {
  id: "trendTowns",
  label: "Towns",
  category: "Totals",
  loggerKey: "townN",
  loggerOnly: !0,
  stepped: !0,
  yTitle: "Towns"
}, {
  id: "CitiesFounded",
  label: "Settlements Founded",
  category: "Totals",
  delta: !0,
  stepped: !0
}, {
  id: "CitiesConquered",
  label: "Settlements Conquered",
  category: "Totals",
  delta: !0,
  stepped: !0,
  loggerKey: "conq"
}, {
  id: "GreatPeopleEarned",
  label: "Great People",
  category: "Totals",
  delta: !0,
  stepped: !0
}, {
  id: "UnitsKilled",
  label: "Units Killed",
  category: "Totals",
  delta: !0,
  stepped: !0
}, {
  id: "UnitsLost",
  label: "Units Lost",
  category: "Totals",
  delta: !0,
  stepped: !0
}, {
  id: "WondersConstructed",
  label: "Wonders",
  category: "Totals",
  delta: !0,
  stepped: !0,
  loggerKey: "won"
}, {
  id: "trendTrade",
  label: "Trade Routes",
  category: "Totals",
  loggerKey: "tr",
  loggerOnly: !0,
  stepped: !0,
  yTitle: "Active trade routes"
}, {
  id: "trendGreatWorks",
  label: "Great Works",
  category: "Totals",
  loggerKey: "gw",
  loggerOnly: !0,
  stepped: !0,
  yTitle: "Great works"
}, {
  id: "trendUrban",
  label: "Urban Districts",
  category: "Totals",
  loggerKey: "urb",
  loggerOnly: !0,
  stepped: !0,
  yTitle: "Urban districts"
}, {
  id: "UnitsTrainedByType",
  label: "Units Trained",
  category: "Breakdown",
  kind: "bar",
  lookup: "Units",
  xTitle: "Unit type",
  yTitle: "Number trained"
}, {
  id: "UnitsKilledByType",
  label: "Kills by Unit",
  category: "Breakdown",
  kind: "bar",
  lookup: "Units",
  xTitle: "Your unit type",
  yTitle: "Enemy units it killed"
}, {
  id: "UnitsLostByType",
  label: "Losses by Unit",
  category: "Breakdown",
  kind: "bar",
  lookup: "Units",
  xTitle: "Your unit type",
  yTitle: "Number lost"
}, {
  id: "BuildingsBuiltByType",
  label: "Buildings",
  category: "Breakdown",
  kind: "bar",
  lookup: "Constructibles",
  xTitle: "Building",
  yTitle: "Number built"
}, {
  id: "DistrictsBuiltByType",
  label: "Districts",
  category: "Breakdown",
  kind: "bar",
  lookup: "Districts",
  xTitle: "District",
  yTitle: "Number built"
}, {
  id: "WondersBuiltByType",
  label: "Wonders",
  category: "Breakdown",
  kind: "board",
  lookup: "Constructibles"
}, {
  id: "liveSettlements",
  label: "Settlements",
  category: "Settlements",
  kind: "live",
  compute: () => perCivBar(p => readNum(() => p.Stats.numSettlements), "Settlements")
}, {
  id: "liveSettlementCap",
  label: "Settlement Cap",
  category: "Settlements",
  kind: "live",
  compute: () => perCivBar(p => readNum(() => p.Stats.settlementCap), "Settlement cap")
}, {
  id: "liveCities",
  label: "Cities",
  category: "Settlements",
  kind: "live",
  compute: () => perCivBar(p => readNum(() => p.Stats.numCities), "Cities")
}, {
  id: "liveTowns",
  label: "Towns",
  category: "Settlements",
  kind: "live",
  compute: () => perCivBar(p => readNum(() => p.Stats.numTowns), "Towns")
}, {
  id: "liveConquered",
  label: "Conquered",
  category: "Settlements",
  kind: "live",
  compute: () => perCivBar(p => readNum(() => p.Stats.getNumConqueredSettlements(!0, !0, !0, !1)), "Settlements conquered")
}, {
  id: "ratioConquest",
  label: "Conquest %",
  category: "Settlements",
  kind: "live",
  compute: () => perCivBar(p => {
    const conq = readNum(() => p.Stats.getNumConqueredSettlements(!0, !0, !0, !1)), set = readNum(() => p.Stats.numSettlements);
    return null != conq && set > 0 ? Math.round(100 * conq / set) : null;
  }, "% of settlements taken by force")
}, {
  id: "liveUrban",
  label: "Urban Districts",
  category: "Settlements",
  kind: "live",
  compute: () => perCivBar(urbanDistrictCount, "Urban districts")
}, {
  id: "ratioUrban",
  label: "Urbanization %",
  category: "Settlements",
  kind: "live",
  compute: () => perCivBar(p => {
    const s = popSplit(p);
    return s.total > 0 ? Math.round(100 * s.urban / s.total) : null;
  }, "% of population urban")
}, {
  id: "ratioSciPerCitizen",
  label: "Science / Citizen",
  category: "Economy",
  kind: "live",
  compute: () => perCivBar(p => {
    const sci = readNum(() => p.Stats.getNetYield(YieldTypes.YIELD_SCIENCE)), pop = popSplit(p).total;
    return null != sci && pop > 0 ? Math.round(10 * sci / pop) / 10 : null;
  }, "Science per citizen / turn")
}, {
  id: "ratioCulPerCitizen",
  label: "Culture / Citizen",
  category: "Economy",
  kind: "live",
  compute: () => perCivBar(p => {
    const cul = readNum(() => p.Stats.getNetYield(YieldTypes.YIELD_CULTURE)), pop = popSplit(p).total;
    return null != cul && pop > 0 ? Math.round(10 * cul / pop) / 10 : null;
  }, "Culture per citizen / turn")
}, {
  id: "ratioGoldPerCitizen",
  label: "Gold / Citizen",
  category: "Economy",
  kind: "live",
  compute: () => perCivBar(p => {
    const gold = readNum(() => p.Stats.getNetYield(YieldTypes.YIELD_GOLD)), pop = popSplit(p).total;
    return null != gold && pop > 0 ? Math.round(10 * gold / pop) / 10 : null;
  }, "Gold per citizen / turn")
}, {
  id: "liveTradeRoutes",
  label: "Trade Routes",
  category: "Economy",
  kind: "live",
  compute: () => perCivBar(p => readNum(() => p.Trade.countPlayerTradeRoutes()), "Active trade routes")
}, {
  id: "ratioTradeDep",
  label: "Trade / Settlement",
  category: "Economy",
  kind: "live",
  compute: () => perCivBar(p => {
    const tr = readNum(() => p.Trade.countPlayerTradeRoutes()), c = function(p) {
      return playerCities(p).length;
    }(p);
    return null != tr && c > 0 ? Math.round(100 * tr / c) / 100 : null;
  }, "Trade routes per settlement")
}, {
  id: "liveGreatWorks",
  label: "Great Works",
  category: "Economy",
  kind: "live",
  compute: () => perCivBar(p => readNum(() => p.Stats.getTotalGreatWorksSlotted()), "Great works")
}, {
  id: "liveWonders",
  label: "Wonders",
  category: "Economy",
  kind: "live",
  compute: () => perCivBar(p => readNum(() => p.Stats.getNumWonders(!1, !1)), "Wonders owned")
}, {
  id: "liveLargestCities",
  label: "Largest Settlements",
  category: "World",
  kind: "live",
  compute: function() {
    const rows = [];
    try {
      for (const p of Players.getAlive()) if (p) for (const c of playerCities(p)) try {
        null != c.population && rows.push({
          name: cityName(c),
          pop: c.population,
          pid: p.id
        });
      } catch (e) {}
    } catch (e) {}
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
    try {
      for (const p of Players.getAlive()) if (p) for (const c of playerCities(p)) try {
        const tot = c.population, urb = c.urbanPopulation;
        if (null == tot || null == urb || isNaN(tot) || isNaN(urb) || tot < MIN_URBAN_POP) continue;
        rows.push({
          name: cityName(c),
          pct: Math.round(100 * urb / tot),
          pid: p.id
        });
      } catch (e) {}
    } catch (e) {}
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
    try {
      for (const p of Players.getAlive()) if (p) for (const c of playerCities(p)) try {
        const pop = c.population;
        if (null == pop || isNaN(pop)) continue;
        for (let i = 0; i < SIZE_BUCKETS.length; i++) if (pop >= SIZE_BUCKETS[i][0] && pop <= SIZE_BUCKETS[i][1]) {
          counts[i]++, any = !0;
          break;
        }
      } catch (e) {}
    } catch (e) {}
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
  id: "liveWorldPopShare",
  label: "Population Share",
  category: "World",
  kind: "live",
  compute: function() {
    let worldTotal = 0;
    const perMajor = [];
    try {
      for (const p of Players.getAlive()) {
        if (!p) continue;
        let tot = 0;
        for (const c of playerCities(p)) try {
          null != c.population && (tot += c.population);
        } catch (e) {}
        worldTotal += tot, p.isMajor && tot > 0 && perMajor.push({
          pid: p.id,
          pop: tot
        });
      }
    } catch (e) {}
    if (worldTotal <= 0 || !perMajor.length) return {
      labels: [],
      data: [],
      colors: [],
      indexAxis: "x",
      valueTitle: "",
      catTitle: ""
    };
    return perMajor.sort((a, b) => b.pop - a.pop), {
      labels: perMajor.map(r => ownerName({
        ownerPlayer: r.pid
      })),
      data: perMajor.map(r => Math.round(1e3 * r.pop / worldTotal) / 10),
      colors: perMajor.map(r => ownerColor({
        ownerPlayer: r.pid
      })),
      indexAxis: "x",
      valueTitle: "% of world population",
      catTitle: ""
    };
  }
}, {
  id: "liveReligion",
  label: "Religion Spread",
  category: "World",
  kind: "live",
  compute: function() {
    const relByHash = new Map;
    try {
      for (const r of GameInfo.Religions) relByHash.set(r.$hash, r);
    } catch (e) {}
    if (!relByHash.size || "undefined" == typeof Game || !Game.Religion) return {
      labels: [],
      data: [],
      colors: [],
      indexAxis: "x",
      valueTitle: "",
      catTitle: ""
    };
    const counts = new Map;
    try {
      for (const p of Players.getAlive()) if (p) for (const c of playerCities(p)) try {
        const rel = c.Religion && c.Religion.majorityReligion;
        null != rel && relByHash.has(rel) && counts.set(rel, (counts.get(rel) || 0) + 1);
      } catch (e) {}
    } catch (e) {}
    const rows = [];
    for (const [hash, count] of counts) {
      const def = relByHash.get(hash);
      let name = def.Name ? Locale.compose(def.Name) : prettifyType(def.ReligionType), pid = null;
      try {
        const f = Game.Religion.getPlayerFromReligion(def.ReligionType);
        null != f && f >= 0 && (pid = f);
      } catch (e) {}
      rows.push({
        name: name,
        count: count,
        pid: pid
      });
    }
    return rows.sort((a, b) => b.count - a.count), {
      labels: rows.map(r => r.name),
      data: rows.map(r => r.count),
      colors: rows.map(r => null != r.pid ? ownerColor({
        ownerPlayer: r.pid
      }) : "#B0B0B0"),
      indexAxis: "x",
      valueTitle: "Settlements following",
      catTitle: "Religion"
    };
  }
}, {
  id: "liveReligionPop",
  label: "Religion by Population",
  category: "World",
  kind: "live",
  compute: function() {
    const relByHash = new Map;
    try {
      for (const r of GameInfo.Religions) relByHash.set(r.$hash, r);
    } catch (e) {}
    if (!relByHash.size || "undefined" == typeof Game || !Game.Religion) return {
      labels: [],
      data: [],
      colors: [],
      indexAxis: "x",
      valueTitle: "",
      catTitle: ""
    };
    const pops = new Map;
    try {
      for (const p of Players.getAlive()) if (p) for (const c of playerCities(p)) try {
        const rel = c.Religion && c.Religion.majorityReligion;
        null != rel && relByHash.has(rel) && null != c.population && pops.set(rel, (pops.get(rel) || 0) + c.population);
      } catch (e) {}
    } catch (e) {}
    const rows = [];
    for (const [hash, pop] of pops) {
      const def = relByHash.get(hash);
      let name = def.Name ? Locale.compose(def.Name) : prettifyType(def.ReligionType), pid = null;
      try {
        const f = Game.Religion.getPlayerFromReligion(def.ReligionType);
        null != f && f >= 0 && (pid = f);
      } catch (e) {}
      rows.push({
        name: name,
        pop: pop,
        pid: pid
      });
    }
    return rows.sort((a, b) => b.pop - a.pop), {
      labels: rows.map(r => r.name),
      data: rows.map(r => r.pop),
      colors: rows.map(r => null != r.pid ? ownerColor({
        ownerPlayer: r.pid
      }) : "#B0B0B0"),
      indexAxis: "x",
      valueTitle: "Population following",
      catTitle: "Religion"
    };
  }
} ], ALL_DATASET_IDS = [ "Beliefs", "Cities", "CivicsAcquired", "Culture", "Faith", "Followers", "Gold", "Science", "Score", "TechsAcquired", "BuildingsConstructed", "CitiesConquered", "CitiesFounded", "CitiesLost", "Combats", "DistrictsConstructed", "GreatPeopleEarned", "NaturalWondersDiscovered", "NukesLaunched", "UnitsKilled", "UnitsLost", "WarsDeclared", "WarsReceived", "WondersConstructed" ];

function ownerName(obj) {
  try {
    const p = Players.get(obj.ownerPlayer);
    if (p && p.leaderName) return Locale.compose(p.leaderName);
  } catch (e) {}
  return `Player ${obj.ownerPlayer}`;
}

function ownerColor(obj) {
  const pid = obj && obj.ownerPlayer;
  try {
    const m = function() {
      if (colorMapCache) return colorMapCache;
      const map = new Map, placed = [];
      let pids = [];
      try {
        pids = Players.getAlive().filter(p => p).map(p => p.id);
      } catch (e) {}
      pids.sort((a, b) => a - b);
      for (const pid of pids) {
        let raw = "#B0B0B0";
        try {
          raw = UI.Player.getPrimaryColorValueAsString(pid);
        } catch (e) {}
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
  try {
    return UI.Player.getSecondaryColorValueAsString(obj.ownerPlayer);
  } catch (e) {
    return "#FFFFFF";
  }
}

function ageEndTurn() {
  try {
    if ("undefined" != typeof Game && null != Game.turn) return Game.turn;
  } catch (e) {}
  return 0;
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

function buildLoggerDatasets(metric) {
  const valueOf = function(metric) {
    const r = metric.ratioKey;
    if (r) {
      const scale = null != r.scale ? r.scale : 1, dp = null != r.dp ? r.dp : 1, f = Math.pow(10, dp);
      return v => v && null != v[r.num] && null != v[r.den] && 0 !== v[r.den] ? Math.round(scale * v[r.num] / v[r.den] * f) / f : null;
    }
    const key = metric.loggerKey;
    return v => v && null != v[key] ? v[key] : null;
  }(metric), empty = {
    datasets: [],
    start: 0,
    end: 0,
    boundaries: [],
    turnCount: 0,
    startedLate: !1,
    firstAgeLabel: "",
    firstTurn: 0
  }, store = loadLoggerStore();
  if (!store || !store.ages || !metric.loggerKey && !metric.ratioKey) return empty;
  const ages = Object.keys(store.ages).map(k => {
    const m = resolveAgeMeta(k, store.ages[k]);
    return {
      key: k,
      turns: store.ages[k].turns,
      ci: m.ci,
      label: m.label
    };
  }).sort((a, b) => a.ci - b.ci), curCi = function() {
    try {
      if ("undefined" != typeof Game && null != Game.age) return resolveAgeMeta(String(Game.age), null).ci;
    } catch (e) {}
    return null;
  }(), curTurn = "undefined" != typeof Game && null != Game.turn ? Game.turn : 1 / 0;
  let cursor = 0;
  const boundaries = [], layout = [], pids = new Set;
  for (const age of ages) {
    if (null != curCi && age.ci > curCi) continue;
    let turns = Object.keys(age.turns || {}).map(Number).sort((a, b) => a - b);
    if (null != curCi && age.ci === curCi && (turns = turns.filter(t => t <= curTurn)), 
    !turns.length) continue;
    const minT = turns[0], maxT = turns[turns.length - 1];
    boundaries.push({
      x: cursor,
      label: prettifyType(age.label || age.key)
    }), layout.push({
      age: age,
      turns: turns,
      minT: minT,
      offset: cursor
    }), cursor += maxT - minT + 2;
    for (const t of turns) {
      const p = age.turns[t].p || {};
      for (const pid in p) pids.add(pid);
    }
  }
  const end = Math.max(0, cursor - 2);
  let turnCount = 0;
  for (const L of layout) for (const t of L.turns) {
    const p = L.age.turns[t].p || {};
    let has = !1;
    for (const pid in p) if (null != valueOf(p[pid])) {
      has = !0;
      break;
    }
    has && turnCount++;
  }
  if (turnCount <= 1) return empty;
  const datasets = [];
  for (const pid of pids) {
    const data = [];
    for (const L of layout) for (const t of L.turns) {
      const y = valueOf((L.age.turns[t].p || {})[pid]);
      null != y && data.push({
        x: L.offset + (t - L.minT),
        y: y
      });
    }
    if (!data.length) continue;
    const color = ownerColor({
      ownerPlayer: Number(pid)
    });
    datasets.push({
      label: ownerName({
        ownerPlayer: Number(pid)
      }),
      data: data,
      parsing: !1,
      borderColor: color,
      backgroundColor: color,
      pointRadius: 0,
      stepped: !!metric.stepped,
      tension: metric.stepped ? 0 : .15
    });
  }
  const first = layout[0];
  return {
    datasets: datasets,
    start: 0,
    end: end,
    boundaries: boundaries,
    turnCount: turnCount,
    startedLate: !!first && ((first.age.ci || 0) > 0 || first.minT > 1),
    firstAgeLabel: first ? first.age.label || first.age.key : "",
    firstTurn: first ? first.minT : 0
  };
}

function prettifyType(type) {
  return String(type).replace(/^[A-Z]+_/, "").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function resolveTypeName(table, type) {
  try {
    const def = GameInfo[table] && GameInfo[table].lookup(type);
    if (def && def.Name) return Locale.compose(def.Name);
  } catch (e) {}
  return prettifyType(type);
}

function readByTypeData(metric) {
  const objectMap = new Map;
  Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
  const validPlayers = new Set;
  for (const o of objectMap.values()) "Player" === o.type && validPlayers.add(o.ownerPlayer);
  let dps = [];
  try {
    dps = Game.Summary.getDataPoints();
  } catch (e) {}
  const rows = [], rawTypes = new Set;
  for (const dp of dps) {
    if (dp.ID !== metric.id || !dp.value || null == dp.value.numeric || null == dp.type) continue;
    const owner = null != dp.owner ? objectMap.get(dp.owner) : null, pid = owner ? owner.ownerPlayer : null;
    null != pid && validPlayers.has(pid) && (rows.push({
      pid: pid,
      type: dp.type,
      val: dp.value.numeric
    }), rawTypes.add(dp.type));
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

function readNum(fn) {
  try {
    const v = fn();
    return null == v || isNaN(v) ? null : v;
  } catch (e) {
    return null;
  }
}

function playerCities(p) {
  try {
    if (p && p.Cities && "function" == typeof p.Cities.getCities) return p.Cities.getCities() || [];
  } catch (e) {}
  return [];
}

function urbanDistrictCount(p) {
  if ("undefined" == typeof DistrictTypes) return null;
  let n = 0, any = !1;
  for (const c of playerCities(p)) try {
    c.Districts && "function" == typeof c.Districts.getIdsOfType && (n += c.Districts.getIdsOfType(DistrictTypes.URBAN).length, 
    any = !0);
  } catch (e) {}
  return any ? n : null;
}

function popSplit(p) {
  let urban = 0, total = 0;
  for (const c of playerCities(p)) try {
    null != c.urbanPopulation && (urban += c.urbanPopulation), null != c.population && (total += c.population);
  } catch (e) {}
  return {
    urban: urban,
    total: total
  };
}

function perCivBar(valueFn, valueTitle) {
  const labels = [], data = [], colors = [];
  for (const p of function() {
    const out = [];
    try {
      for (const p of Players.getAlive()) p && p.isMajor && out.push(p);
    } catch (e) {}
    return out;
  }()) {
    const v = valueFn(p);
    null == v || isNaN(v) || (labels.push(ownerName({
      ownerPlayer: p.id
    })), data.push(v), colors.push(ownerColor({
      ownerPlayer: p.id
    })));
  }
  return {
    labels: labels,
    data: data,
    colors: colors,
    indexAxis: "x",
    valueTitle: valueTitle,
    catTitle: ""
  };
}

function cityName(c) {
  try {
    return Locale.compose(c.name);
  } catch (e) {
    return String(c && c.name);
  }
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

const MIN_COLOR_DIST = 72;

function colorDist(a, b) {
  const dr = a.r - b.r, dg = a.g - b.g, db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function tooClose(rgb, placed) {
  for (const p of placed) if (colorDist(rgb, p) < MIN_COLOR_DIST) return !0;
  return !1;
}

function disambiguate(rgb, placed) {
  if (!tooClose(rgb, placed)) return rgb;
  const hsl = rgbToHsl(rgb);
  for (let L = hsl.l + .08; L <= .92; L += .06) {
    const cand = hslToRgb({
      h: hsl.h,
      s: hsl.s,
      l: L
    });
    if (!tooClose(cand, placed)) return cand;
  }
  for (let step = 1; step <= 5; step++) for (const dir of [ 1, -1 ]) {
    const cand = ensureContrast(hslToRgb({
      h: (hsl.h + dir * step * 20 + 360) % 360,
      s: Math.min(1, hsl.s + .1),
      l: Math.min(.72, hsl.l + .06)
    }));
    if (!tooClose(cand, placed)) return cand;
  }
  return rgb;
}

let colorMapCache = null;

let activeChart = null;

function renderChart(ui, metric, page) {
  if ("board" === metric.kind) return activeChart && (activeChart.destroy(), activeChart = null), 
  setNote(ui, ""), ui.chartInner.style.display = "none", ui.board.style.display = "block", 
  void function(container, metric) {
    const {perPlayer: perPlayer, players: players} = readByTypeData(metric);
    if (container.textContent = "", !players.length) return container.textContent = `No data recorded for ${metric.label} this Age.`, 
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
  if (ui.board.style.display = "none", ui.chartInner.style.display = "block", "undefined" == typeof Chart) return void console.error(`${LOG} Chart.js global not available.`);
  if (!ui.chartInner.clientWidth || !ui.chartInner.clientHeight) return void requestAnimationFrame(() => renderChart(ui, metric, page));
  activeChart && (activeChart.destroy(), activeChart = null);
  const plugins = {
    legend: {
      display: !0,
      labels: {
        color: "#E8E2D0"
      }
    },
    title: {
      display: !1
    }
  };
  let config;
  if ("bar" === metric.kind) {
    setNote(ui, "");
    const {labels: labels, datasets: datasets} = buildBarChart(metric, page), hasData = datasets.length > 0 && labels.length > 0;
    if (setNoData(ui.canvas, hasData ? "" : `No data recorded for ${metric.label} this Age.`), 
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
            ticks: {
              color: AXIS_TICK
            },
            grid: {
              color: "#4A4034"
            }
          },
          y: {
            type: "linear",
            min: 0,
            title: axisTitle(metric.yTitle),
            ticks: {
              color: AXIS_TICK
            },
            grid: {
              color: "#4A4034"
            }
          }
        }
      }
    };
  } else if ("live" === metric.kind) {
    setNote(ui, "Current standings, whole game");
    const res = metric.compute(), hasData = res && res.data && res.data.length > 0;
    if (setNoData(ui.canvas, hasData ? "" : `No data available for ${metric.label}.`), 
    !hasData) return;
    const horiz = "y" === res.indexAxis, catAxis = {
      type: "category",
      title: axisTitle(res.catTitle),
      ticks: {
        color: AXIS_TICK
      },
      grid: {
        color: "#4A4034"
      }
    }, valAxis = {
      type: "linear",
      min: 0,
      title: axisTitle(res.valueTitle),
      ticks: {
        color: AXIS_TICK
      },
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
    const logged = metric.loggerKey || metric.ratioKey ? buildLoggerDatasets(metric) : null, loggedTurns = logged ? logged.turnCount : 0;
    let native = null, nativeTurns = 0;
    metric.loggerOnly || (native = metric.cityRollup ? function(metric) {
      const objectMap = new Map;
      Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
      const validPlayers = new Set;
      for (const o of objectMap.values()) "Player" === o.type && validPlayers.add(o.ownerPlayer);
      const perPlayerCities = new Map;
      let start = 1 / 0, end = ageEndTurn();
      for (const ds of Game.Summary.getDataSets(metric.id)) {
        const o = null != ds.owner ? objectMap.get(ds.owner) : null;
        if (!o || "City" !== o.type || null == o.ownerPlayer || !validPlayers.has(o.ownerPlayer)) continue;
        if (!ds.values || !ds.values.length) continue;
        const vals = ds.values.map(p => ({
          x: p.x,
          y: p.y
        }));
        start = Math.min(start, vals[0].x), end = Math.max(end, vals[vals.length - 1].x), 
        perPlayerCities.has(o.ownerPlayer) || perPlayerCities.set(o.ownerPlayer, []), perPlayerCities.get(o.ownerPlayer).push(vals);
      }
      isFinite(start) || (start = 0);
      const datasets = [];
      for (const [pid, cities] of perPlayerCities) {
        const pStart = cities.reduce((mn, c) => Math.min(mn, c[0].x), 1 / 0), idx = cities.map(() => 0), cur = cities.map(() => 0), data = [];
        for (let t = pStart; t <= end; t++) {
          let sum = 0;
          for (let c = 0; c < cities.length; c++) {
            const v = cities[c];
            for (;idx[c] < v.length && v[idx[c]].x <= t; ) cur[c] = v[idx[c]].y, idx[c]++;
            sum += cur[c];
          }
          data.push({
            x: t,
            y: sum
          });
        }
        const color = ownerColor({
          ownerPlayer: pid
        });
        datasets.push({
          label: ownerName({
            ownerPlayer: pid
          }),
          data: data,
          parsing: !1,
          borderColor: color,
          backgroundColor: color,
          pointRadius: 0,
          tension: .15
        });
      }
      return {
        datasets: datasets,
        start: start,
        end: end
      };
    }(metric) : function(metric) {
      const objectMap = new Map;
      Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
      const dataSets = Game.Summary.getDataSets(metric.id);
      let start = 1 / 0, end = ageEndTurn();
      const series = [];
      for (const ds of dataSets) {
        const owner = null != ds.owner ? objectMap.get(ds.owner) : null;
        if (!owner || "Player" !== owner.type) continue;
        let values = ds.values.map(pt => ({
          x: pt.x,
          y: pt.y
        }));
        if (metric.delta) {
          let sum = 0;
          values = values.map(pt => (sum += pt.y, {
            x: pt.x,
            y: sum
          }));
        }
        values.length && (start = Math.min(start, values[0].x), end = Math.max(end, values[values.length - 1].x)), 
        series.push({
          owner: owner,
          values: values
        });
      }
      isFinite(start) || (start = 0);
      const datasets = [];
      for (const s of series) {
        const v = s.values;
        if (!v.length) continue;
        v[v.length - 1].x < end && v.push({
          x: end,
          y: v[v.length - 1].y
        });
        const color = ownerColor(s.owner);
        datasets.push({
          label: ownerName(s.owner),
          data: v,
          parsing: !1,
          borderColor: color,
          backgroundColor: color,
          pointRadius: 0,
          stepped: !!metric.stepped,
          tension: metric.stepped ? 0 : .15
        });
      }
      return {
        datasets: datasets,
        start: start,
        end: end
      };
    }(metric), nativeTurns = native.datasets.reduce((mx, d) => Math.max(mx, d.data.length), 0));
    if (loggedTurns > 0 && loggedTurns >= nativeTurns) {
      const {datasets: datasets, start: start, end: end, boundaries: boundaries} = logged;
      setNoData(ui.canvas, ""), setNote(ui, logged.startedLate ? `Tracked since ${prettifyType(logged.firstAgeLabel)} turn ${logged.firstTurn} — Chronicle was enabled mid-game` : "");
      config = {
        type: "line",
        data: {
          datasets: datasets
        },
        options: {
          maintainAspectRatio: !1,
          animation: !1,
          color: "#E8E2D0",
          plugins: plugins,
          scales: {
            x: {
              type: "linear",
              min: start,
              max: end > start ? end : void 0,
              afterBuildTicks: axis => {
                axis.ticks = boundaries.map(b => ({
                  value: b.x
                }));
              },
              ticks: {
                color: AXIS_TICK,
                autoSkip: !1,
                maxRotation: 0,
                callback: v => {
                  const b = boundaries.find(bd => Math.abs(bd.x - v) < .5);
                  return b ? b.label : "";
                }
              },
              grid: {
                color: "#4A4034"
              }
            },
            y: {
              type: "linear",
              min: metric.signed ? void 0 : 0,
              title: axisTitle(metric.yTitle),
              ticks: {
                color: AXIS_TICK
              },
              grid: {
                color: "#4A4034"
              }
            }
          }
        }
      };
    } else {
      if (metric.loggerOnly) return setNote(ui, ""), void setNoData(ui.canvas, `No ${metric.label} recorded yet (tracked only while Chronicle is enabled).`);
      {
        const {datasets: datasets, start: start, end: end} = native, hasData = datasets.some(d => d.data.length > 0);
        if (setNoData(ui.canvas, hasData ? "" : `No data recorded for ${metric.label} this Age.`), 
        setNote(ui, hasData ? `Current Age only (${function() {
          try {
            return prettifyType(resolveAgeMeta(String(Game.age), null).label);
          } catch (e) {
            return "";
          }
        }()})` + (function() {
          try {
            const cur = resolveAgeMeta(String(Game.age), null).ci;
            let min = cur;
            for (const a of GameInfo.Ages) a.ChronologyIndex < min && (min = a.ChronologyIndex);
            return cur > min;
          } catch (e) {
            return !1;
          }
        }() ? " — enable Chronicle earlier for cross-Age history" : "") : ""), !hasData) return;
        config = {
          type: "line",
          data: {
            datasets: datasets
          },
          options: {
            maintainAspectRatio: !1,
            animation: !1,
            color: "#E8E2D0",
            plugins: plugins,
            scales: {
              x: {
                type: "linear",
                min: start,
                max: end > start ? end : void 0,
                title: axisTitle("Turn"),
                ticks: {
                  color: AXIS_TICK
                },
                grid: {
                  color: "#4A4034"
                }
              },
              y: {
                type: "linear",
                min: 0,
                title: axisTitle(metric.yTitle),
                ticks: {
                  color: AXIS_TICK
                },
                grid: {
                  color: "#4A4034"
                }
              }
            }
          }
        };
      }
    }
  }
  activeChart = new Chart(ui.canvas.getContext("2d"), config), requestAnimationFrame(() => {
    activeChart && activeChart.resize();
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

function closeOverlay() {
  activeChart && (activeChart.destroy(), activeChart = null), document.getElementById(OVERLAY_ID)?.remove();
}

function openOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;
  const root = document.createElement("div");
  root.id = OVERLAY_ID;
  const backdrop = document.createElement("div");
  backdrop.setAttribute("style", "position:fixed;left:0;top:0;width:100%;height:100%;z-index:999998;background:rgba(6,7,10,0.78);pointer-events:auto"), 
  backdrop.addEventListener("click", closeOverlay), root.appendChild(backdrop);
  const panel = document.createElement("div");
  panel.setAttribute("style", [ "position:fixed", "left:4%", "top:5%", "width:92%", "height:90%", "box-sizing:border-box", "z-index:999999", "pointer-events:auto", "background:#16130E", "border:2px solid #6B5842", "display:flex", "flex-direction:column", "padding:24px 28px" ].join(";")), 
  root.appendChild(panel);
  const header = document.createElement("div");
  header.setAttribute("style", "display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-shrink:0");
  const titleCol = document.createElement("div");
  titleCol.setAttribute("style", "display:flex;flex-direction:row;align-items:flex-end;gap:20px");
  const title = document.createElement("div");
  title.textContent = "Chronicle — Game Statistics", title.className = "font-title uppercase tracking-150", 
  title.setAttribute("style", "font-size:1.8rem;color:#F0E6D2"), titleCol.appendChild(title);
  const note = document.createElement("div");
  note.className = "font-body text-sm", note.setAttribute("style", "color:#B7A987;font-size:0.85rem;letter-spacing:0.04em;flex-shrink:0;padding-bottom:0.3rem"), 
  titleCol.appendChild(note), header.appendChild(titleCol), header.appendChild(makeNativeButton("Close", closeOverlay, {
    extraClass: ""
  })), panel.appendChild(header);
  const categoryBar = document.createElement("div");
  categoryBar.setAttribute("style", "display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;flex-shrink:0"), 
  panel.appendChild(categoryBar);
  const chartBar = document.createElement("div");
  chartBar.setAttribute("style", "display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;flex-shrink:0"), 
  panel.appendChild(chartBar);
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
  const pageBar = document.createElement("div");
  pageBar.setAttribute("style", "display:flex;gap:12px;align-items:center;justify-content:center;margin-top:10px;flex-shrink:0"), 
  panel.appendChild(pageBar);
  const datasetIds = function() {
    const objectMap = new Map;
    try {
      Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
    } catch (e) {}
    const withData = new Set;
    for (const id of ALL_DATASET_IDS) try {
      for (const ds of Game.Summary.getDataSets(id)) {
        const o = null != ds.owner ? objectMap.get(ds.owner) : null;
        if (o && "Player" === o.type && ds.values && ds.values.length) {
          withData.add(id);
          break;
        }
      }
    } catch (e) {}
    return withData;
  }(), dataPointIds = function() {
    const withData = new Set;
    let dps = [];
    try {
      dps = Game.Summary.getDataPoints();
    } catch (e) {}
    for (const dp of dps) dp.value && null != dp.value.numeric && withData.add(dp.ID);
    return withData;
  }(), cityIds = function(ids) {
    const objectMap = new Map;
    try {
      Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
    } catch (e) {}
    const withData = new Set;
    for (const id of ids) try {
      for (const ds of Game.Summary.getDataSets(id)) {
        const o = null != ds.owner ? objectMap.get(ds.owner) : null;
        if (o && "City" === o.type && ds.values && ds.values.length) {
          withData.add(id);
          break;
        }
      }
    } catch (e) {}
    return withData;
  }(METRICS.filter(m => m.cityRollup).map(m => m.id)), metrics = METRICS.filter(m => {
    if ("live" === m.kind) try {
      const r = m.compute();
      return !!(r && r.data && r.data.length);
    } catch (e) {
      return !1;
    }
    if (m.loggerOnly) return buildLoggerDatasets(m).turnCount > 0;
    if ("bar" === m.kind || "board" === m.kind) return dataPointIds.has(m.id);
    return (m.cityRollup ? cityIds.has(m.id) : datasetIds.has(m.id)) || m.loggerKey && buildLoggerDatasets(m).turnCount > 0;
  }), catList = CATEGORIES.filter(c => metrics.some(m => m.category === c)), ui = {
    canvas: canvas,
    chartInner: chartInner,
    board: board,
    note: note
  }, chartButtons = [];
  let curMetric = null, curPage = 0;
  const renderPage = () => {
    renderChart(ui, curMetric, curPage), pageBar.textContent = "";
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
  }, selectChart = (inCat, index) => {
    chartButtons.forEach((b, i) => highlightButton(b, i === index)), curMetric = inCat[index], 
    curPage = 0, renderPage();
  }, selectCategory = (catIndex, preferId) => {
    [ ...categoryBar.children ].forEach((b, i) => highlightButton(b, i === catIndex)), 
    chartBar.textContent = "", chartButtons.length = 0;
    const inCat = metrics.filter(m => m.category === catList[catIndex]);
    if (inCat.forEach((metric, i) => {
      const b = makeNativeButton(metric.label, () => selectChart(inCat, i), {
        secondary: !0
      });
      chartButtons.push(b), chartBar.appendChild(b);
    }), inCat.length) {
      const idx = preferId ? Math.max(0, inCat.findIndex(m => m.id === preferId)) : 0;
      selectChart(inCat, idx);
    }
  };
  catList.forEach((cat, i) => {
    categoryBar.appendChild(makeNativeButton(cat, () => selectCategory(i), {}));
  }), document.body.appendChild(root);
  const def = metrics.find(m => m.default) || metrics[0], defCat = def ? Math.max(0, catList.indexOf(def.category)) : 0;
  catList.length && requestAnimationFrame(() => selectCategory(defCat, def && def.id));
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
  }), console.error(`${LOG} loaded.`);
}

!function scheduleInstall() {
  document.body ? install() : "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", install, {
    once: !0
  }) : requestAnimationFrame(scheduleInstall);
}();

export { };
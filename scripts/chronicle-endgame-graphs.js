const LOG = "[ozq-chronicle]", OVERLAY_ID = "ozq-chronicle-graphs-overlay";

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

function loadLoggerStore() {
  let container = null;
  try {
    const raw = localStorage.getItem("!chronicle");
    raw && (container = JSON.parse(raw));
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
}

const CATEGORIES = [ "Research", "Economy", "Society", "Expansion", "Military", "Construction", "World" ], METRICS = [ {
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
  id: "CivicsAcquired",
  label: "Civics",
  category: "Research",
  trend: {
    loggerKey: "CivicsAcquired",
    stepped: !0,
    yTitle: "Civics researched"
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
  id: "CitiesConquered",
  label: "Settlements Conquered",
  category: "Expansion",
  trend: {
    loggerKey: "conq",
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
  category: "Expansion",
  trend: {
    ratioKey: {
      num: "conq",
      den: "set",
      scale: 100,
      dp: 0
    },
    yTitle: "% of settlements taken by force"
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
  id: "UnitsTrainedByType",
  label: "Units Trained",
  category: "Military",
  kind: "bar",
  lookup: "Units",
  xTitle: "Unit type",
  yTitle: "Number trained"
}, {
  id: "UnitsKilledByType",
  label: "Kills by Unit",
  category: "Military",
  kind: "bar",
  lookup: "Units",
  xTitle: "Your unit type",
  yTitle: "Enemy units it killed"
}, {
  id: "UnitsLostByType",
  label: "Losses by Unit",
  category: "Military",
  kind: "bar",
  lookup: "Units",
  xTitle: "Your unit type",
  yTitle: "Number lost"
}, {
  id: "BuildingsBuiltByType",
  label: "Buildings",
  category: "Construction",
  kind: "bar",
  lookup: "Constructibles",
  xTitle: "Building",
  yTitle: "Number built"
}, {
  id: "DistrictsBuiltByType",
  label: "Districts",
  category: "Construction",
  kind: "bar",
  lookup: "Districts",
  xTitle: "District",
  yTitle: "Number built"
}, {
  id: "WondersBuiltByType",
  label: "Wonders Built",
  category: "Construction",
  kind: "board",
  lookup: "Constructibles"
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

function niceTurnStep(range) {
  const raw = Math.max(1, range) / 5, pow = Math.max(1, Math.pow(10, Math.floor(Math.log10(raw))));
  for (const m of [ 1, 2, 5, 10 ]) if (m * pow >= raw) return m * pow;
  return 10 * pow;
}

function isFromGameStart(firstCi, firstT, earliestCi) {
  return null != firstCi && null != earliestCi && firstCi === earliestCi && null != firstT && firstT <= 1;
}

function trendSource(trend) {
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
    }).sort((a, b) => a.ci - b.ci), curCi = currentAgeCi(), curTurn = "undefined" != typeof Game && null != Game.turn ? Game.turn : 1 / 0;
    let cursor = 0;
    const layout = [], pids = new Set;
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
      for (const t of turns) {
        const p = age.turns[t].p || {};
        for (const pid in p) pids.add(pid);
      }
    }
    const end = Math.max(0, cursor - 2);
    let turnCount = 0, firstCi = null, firstT = null;
    for (const L of layout) for (const t of L.turns) {
      const p = L.age.turns[t].p || {};
      let has = !1;
      for (const pid in p) if (null != valueOf(p[pid], p)) {
        has = !0;
        break;
      }
      has && (turnCount++, null == firstCi && (firstCi = L.age.ci || 0, firstT = t));
    }
    if (turnCount < (isFromGameStart(firstCi, firstT, layout.length ? layout[0].age.ci || 0 : null) ? 2 : 3)) return empty;
    const datasets = [];
    for (const pid of pids) {
      const data = [];
      for (const L of layout) for (const t of L.turns) {
        const p = L.age.turns[t].p || {}, y = valueOf(p[pid], p);
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
    const first = layout[0], startedLate = !!first && first.minT > 1, blocks = layout.map(L => ({
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
      firstAgeLabel: first ? first.age.label || first.age.key : "",
      firstTurn: first ? first.minT : 0,
      yTitle: metric.yTitle,
      label: null,
      currentAgeOnly: !1,
      source: "logger"
    };
  }(trend), native = function(trend) {
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

function canDrawLine(src) {
  return src.turnCount >= 2;
}

function sourceLabel(src) {
  return "summary" === src.source ? "Native log" : "Chronicle log";
}

function metricLabel(metric) {
  if (!metric.trend) return metric.label;
  try {
    return trendSource(metric.trend).label || metric.label;
  } catch (e) {
    return metric.label;
  }
}

function isPlayerAlive(pid) {
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
      const curCi = currentAgeCi(), curTurn = "undefined" != typeof Game && null != Game.turn ? Game.turn : 1 / 0, ages = Object.keys(store.ages).map(k => {
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
  }); else if (includeDead) for (const [pid, y] of function(trend) {
    const out = new Map, store = loadLoggerStore();
    if (!store || !store.ages) return out;
    const valueOf = loggerValueOf(trend), curCi = currentAgeCi(), curTurn = "undefined" != typeof Game && null != Game.turn ? Game.turn : 1 / 0, ages = Object.keys(store.ages).map(k => {
      const m = resolveAgeMeta(k, store.ages[k]);
      return {
        turns: store.ages[k].turns,
        ci: m.ci
      };
    }).filter(a => null == curCi || a.ci <= curCi).sort((a, b) => a.ci - b.ci);
    for (const age of ages) {
      let turns = Object.keys(age.turns || {}).map(Number).sort((a, b) => a - b);
      null != curCi && age.ci === curCi && (turns = turns.filter(t => t <= curTurn));
      for (const t of turns) {
        const p = age.turns[t].p || {};
        for (const pid in p) {
          const y = valueOf(p[pid], p);
          null != y && out.set(Number(pid), y);
        }
      }
    }
    return out;
  }(trend)) {
    const owner = {
      ownerPlayer: pid
    };
    rows.push({
      label: ownerName(owner),
      value: y,
      color: ownerColor(owner)
    });
  } else {
    const row = function() {
      const store = loadLoggerStore();
      if (!store || !store.ages) return null;
      const curCi = currentAgeCi(), curTurn = "undefined" != typeof Game && null != Game.turn ? Game.turn : 1 / 0, ages = Object.keys(store.ages).map(k => {
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
        const maxT = turns.reduce((a, b) => b > a ? b : a, turns[0]);
        return age.turns[maxT].p || {};
      }
      return null;
    }(), valueOf = loggerValueOf(trend);
    if (row) for (const pid in row) {
      if (!isPlayerAlive(pid)) continue;
      const y = valueOf(row[pid], row);
      if (null == y) continue;
      const owner = {
        ownerPlayer: Number(pid)
      };
      rows.push({
        label: ownerName(owner),
        value: y,
        color: ownerColor(owner)
      });
    }
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

function religionMeta(hash) {
  const n = Number(hash);
  let name = `Religion ${hash}`, pid = null;
  try {
    if ("undefined" != typeof GameInfo && GameInfo.Religions) for (const r of GameInfo.Religions) if (r.$hash === n || String(r.$hash) === String(hash)) {
      name = r.Name ? Locale.compose(r.Name) : prettifyType(r.ReligionType);
      try {
        if ("undefined" != typeof Game && Game.Religion && "function" == typeof Game.Religion.getPlayerFromReligion) {
          const f = Game.Religion.getPlayerFromReligion(r.ReligionType);
          null != f && f >= 0 && (pid = f);
        }
      } catch (e) {}
      break;
    }
  } catch (e) {}
  return {
    name: name,
    pid: pid,
    color: null != pid ? ownerColor({
      ownerPlayer: pid
    }) : "#B0B0B0"
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
  const store = loadLoggerStore();
  if (!store || !store.ages) return empty;
  const ages = Object.keys(store.ages).map(k => {
    const m = resolveAgeMeta(k, store.ages[k]);
    return {
      key: k,
      turns: store.ages[k].turns,
      ci: m.ci,
      label: m.label
    };
  }).sort((a, b) => a.ci - b.ci), curCi = currentAgeCi(), curTurn = "undefined" != typeof Game && null != Game.turn ? Game.turn : 1 / 0;
  let cursor = 0;
  const layout = [], hashes = new Set;
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
    for (const t of turns) {
      const rel = age.turns[t] && age.turns[t].rel;
      if (rel) for (const h in rel) rel[h] && null != rel[h][key] && hashes.add(h);
    }
  }
  const end = Math.max(0, cursor - 2);
  let turnCount = 0, firstCi = null, firstT = null;
  for (const L of layout) for (const t of L.turns) {
    const rel = L.age.turns[t] && L.age.turns[t].rel;
    if (!rel) continue;
    let has = !1;
    for (const h in rel) if (rel[h] && null != rel[h][key]) {
      has = !0;
      break;
    }
    has && (turnCount++, null == firstCi && (firstCi = L.age.ci || 0, firstT = t));
  }
  if (turnCount < (isFromGameStart(firstCi, firstT, layout.length ? layout[0].age.ci || 0 : null) ? 2 : 3)) return empty;
  if (!hashes.size) return empty;
  const datasets = [];
  for (const h of hashes) {
    const data = [];
    let seen = !1;
    for (const L of layout) for (const t of L.turns) {
      const rel = L.age.turns[t] && L.age.turns[t].rel, raw = rel && rel[h] && null != rel[h][key] ? rel[h][key] : null;
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
  const first = layout[0], startedLate = !!first && first.minT > 1, blocks = layout.map(L => ({
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
    firstAgeLabel: first ? first.age.label || first.age.key : "",
    firstTurn: first ? first.minT : 0,
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

function pastAgeByType(dpId) {
  const out = {
    rows: [],
    labels: []
  }, store = loadLoggerStore();
  if (!store || !store.ages) return out;
  const curCi = currentAgeCi(), ages = Object.keys(store.ages).map(k => {
    const m = resolveAgeMeta(k, store.ages[k]);
    return {
      obj: store.ages[k],
      ci: m.ci,
      label: m.label
    };
  }).filter(a => null != curCi && a.ci < curCi).sort((a, b) => a.ci - b.ci);
  for (const a of ages) {
    const bt = a.obj.bt && a.obj.bt[dpId];
    if (!bt) continue;
    let any = !1;
    for (const pid in bt) for (const type in bt[pid]) {
      const v = bt[pid][type];
      null != v && (out.rows.push({
        pid: Number(pid),
        type: type,
        val: v
      }), any = !0);
    }
    any && out.labels.push(prettifyType(a.label));
  }
  return out;
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
  const rows = [], rawTypes = new Set, cur = new Map;
  for (const dp of dps) {
    if (dp.ID !== metric.id || !dp.value || null == dp.value.numeric) continue;
    if (null == dp.type || "" === String(dp.type).trim()) continue;
    const owner = null != dp.owner ? objectMap.get(dp.owner) : null, pid = owner ? owner.ownerPlayer : null;
    null != pid && validPlayers.has(pid) && cur.set(`${pid}|${dp.type}`, dp.value.numeric);
  }
  for (const r of function(dpId) {
    const out = [], store = loadLoggerStore();
    if (!store || !store.ages) return out;
    const curCi = currentAgeCi();
    for (const k of Object.keys(store.ages)) {
      const meta = resolveAgeMeta(k, store.ages[k]);
      if (null == curCi || meta.ci !== curCi) continue;
      const bt = store.ages[k].bt && store.ages[k].bt[dpId];
      if (bt) for (const pid in bt) for (const type in bt[pid]) null != bt[pid][type] && out.push({
        pid: Number(pid),
        type: type,
        val: bt[pid][type]
      });
    }
    return out;
  }(metric.id)) {
    const k = `${r.pid}|${r.type}`;
    r.val > (cur.get(k) || 0) && cur.set(k, r.val);
  }
  for (const [k, val] of cur) {
    const sep = k.indexOf("|"), type = k.slice(sep + 1);
    rows.push({
      pid: Number(k.slice(0, sep)),
      type: type,
      val: val
    }), rawTypes.add(type);
  }
  const past = pastAgeByType(metric.id);
  for (const r of past.rows) rows.push(r), rawTypes.add(r.type);
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
  const past = pastAgeByType(metric.id).labels, here = prettifyType(resolveAgeMeta(String("undefined" != typeof Game ? Game.age : ""), null).label);
  return past.length ? `Current standings · ${past.concat([ here ]).join(" + ")}` : `Current standings · ${here} only`;
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

let activeChart = null, legendHintShown = !1;

function renderChart(ui, metric, view, page) {
  if ("board" === metric.kind) return activeChart && (activeChart.destroy(), activeChart = null), 
  setNote(ui, byTypeNote(metric)), ui.chartInner.style.display = "none", ui.board.style.display = "block", 
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
  if (!ui.chartInner.clientWidth || !ui.chartInner.clientHeight) return void requestAnimationFrame(() => renderChart(ui, metric, view, page));
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
  } else if ("live" === metric.kind || "stand" === view) {
    const isLive = "live" === metric.kind, stand = [ "Current standings" ];
    !isLive && metric.trend && stand.unshift(sourceLabel(trendSource(metric.trend))), 
    setNote(ui, stand.join("  ·  "));
    const res = isLive ? metric.compute() : buildStandings(metric.trend), hasData = res && res.data && res.data.length > 0;
    if (setNoData(ui.canvas, hasData ? "" : `No data available for ${metricLabel(metric)}.`), 
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
      min: res.signed ? void 0 : 0,
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
    const trend = metric.trend, src = trendSource(trend);
    if (!canDrawLine(src)) return setNote(ui, ""), void setNoData(ui.canvas, `No ${metricLabel(metric)} recorded yet (tracked only while Chronicle is enabled).`);
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
      }, dp = trend.ratioKey ? trend.ratioKey.dp : null, fmtVal = y => null != dp ? Number(y).toFixed(dp) : Number.isInteger(y) ? String(y) : Number(y).toFixed(1), tk = function(blocks, start, end) {
        const values = [], labels = new Map;
        for (const b of blocks) {
          const bEndX = b.offset + (b.maxT - b.minT);
          if (bEndX < start || b.offset > end) continue;
          const lo = b.minT + (Math.max(start, b.offset) - b.offset), hi = b.minT + (Math.min(end, bEndX) - b.offset), step = niceTurnStep(hi - lo), turns = new Set([ lo, hi ]);
          for (let t = Math.ceil(lo / step) * step; t < hi; t += step) t > lo && turns.add(t);
          Array.from(turns).sort((a, z) => a - z).forEach((t, i) => {
            const x = b.offset + (t - b.minT);
            values.push(x);
            const tl = String(Math.round(t));
            labels.set(x, 0 === i ? [ b.label, tl ] : tl);
          });
        }
        return {
          values: values,
          labelAt: x => {
            const v = labels.get(x);
            return null != v ? v : "";
          }
        };
      }(src.blocks, start, end);
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
                color: AXIS_TICK,
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

const CANCEL_ACTIONS = [ "cancel", "keyboard-escape", "mousebutton-right", "sys-menu" ], chronicleInputHandler = {
  handleInput(e) {
    const d = e && e.detail || {};
    return !document.getElementById(OVERLAY_ID) || (!d.name || CANCEL_ACTIONS.indexOf(d.name) < 0 || (DEBUG_INPUT && console.error(`${LOG} INPUT cm-handler name=${d.name} status=${d.status} finish=${isPressFinished(e)} — consumed`), 
    isPressFinished(e) && closeOverlay(), !1));
  },
  handleNavigation: () => !0
};

function isPressFinished(e) {
  return !("engine-input" !== e.type || !e.detail) && ("undefined" == typeof InputActionStatuses || e.detail.status === InputActionStatuses.FINISH);
}

const DEBUG_INPUT = !1;

function probeInput(where, e) {
  if (!DEBUG_INPUT) return;
  if (!document.getElementById(OVERLAY_ID)) return;
  const d = e.detail || {};
  console.error(`${LOG} INPUT ${where} type=${e.type} name=${d.name} status=${d.status} phase=${e.eventPhase} cancel=${function(e) {
    return "engine-input" === e.type ? !!e.detail && CANCEL_ACTIONS.indexOf(e.detail.name) >= 0 : "Escape" === e.key || 27 === e.keyCode;
  }(e)}`);
}

function closeOverlay() {
  activeChart && (activeChart.destroy(), activeChart = null), document.getElementById(OVERLAY_ID)?.remove();
}

function openOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;
  legendHintShown = !1;
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
  const trendAvailable = m => {
    try {
      return canDrawLine(trendSource(m.trend));
    } catch (e) {
      return !1;
    }
  }, standAvailable = m => {
    try {
      const r = buildStandings(m.trend);
      return !!(r && r.data && r.data.length);
    } catch (e) {
      return !1;
    }
  }, dataPointIds = function() {
    const withData = new Set;
    let dps = [];
    try {
      dps = Game.Summary.getDataPoints();
    } catch (e) {}
    for (const dp of dps) dp.value && null != dp.value.numeric && withData.add(dp.ID);
    for (const m of METRICS) "bar" !== m.kind && "board" !== m.kind || withData.has(m.id) || pastAgeByType(m.id).rows.length && withData.add(m.id);
    return withData;
  }(), metrics = METRICS.filter(m => {
    if ("live" === m.kind) try {
      const r = m.compute();
      return !!(r && r.data && r.data.length);
    } catch (e) {
      return !1;
    }
    return "bar" === m.kind || "board" === m.kind ? dataPointIds.has(m.id) : standAvailable(m) || trendAvailable(m);
  }), catList = CATEGORIES.filter(c => metrics.some(m => m.category === c));
  if (!catList.length) {
    const empty = document.createElement("div");
    return empty.textContent = "No stats recorded yet. Chronicle logs each turn while it is enabled.", 
    empty.setAttribute("style", "flex:1 1 auto;display:flex;align-items:center;justify-content:center;color:#C9BFA6;font-size:1.15rem;text-align:center;padding:2rem"), 
    panel.appendChild(empty), void document.body.appendChild(root);
  }
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
    })(curMetric));
  }, selectCategory = (catIndex, preferId) => {
    [ ...categoryBar.children ].forEach((b, i) => highlightButton(b, i === catIndex)), 
    chartBar.textContent = "", chartButtons.length = 0;
    const inCat = metrics.filter(m => m.category === catList[catIndex]);
    if (inCat.forEach((metric, i) => {
      const b = makeNativeButton(metricLabel(metric), () => selectChart(inCat, i), {
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
  requestAnimationFrame(() => selectCategory(defCat, def && def.id));
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
        if (!cm || "function" != typeof cm.registerEngineInputHandler) return void console.error(`${LOG} ContextManager has no input-handler API — Escape will not close the overlay.`);
        cm.registerEngineInputHandler(chronicleInputHandler);
        const arr = cm.engineInputEventHandlers;
        if (Array.isArray(arr)) {
          const i = arr.indexOf(chronicleInputHandler);
          i > 0 && (arr.splice(i, 1), arr.unshift(chronicleInputHandler));
        }
        console.error(`${LOG} input handler installed (first of ${Array.isArray(arr) ? arr.length : "?"}).`);
      }).catch(e => {
        console.error(`${LOG} ContextManager import failed (${e && e.message}) — Escape will not close the overlay.`);
      });
    } catch (e) {
      console.error(`${LOG} ContextManager import threw (${e && e.message}).`);
    }
  }(), function() {
    if (DEBUG_INPUT) for (const ev of [ "keydown", "engine-input" ]) {
      try {
        window.addEventListener(ev, e => probeInput("win-capture", e), !0);
      } catch (e) {}
      try {
        document.addEventListener(ev, e => probeInput("doc-capture", e), !0);
      } catch (e) {}
    }
  }(), console.error(`${LOG} loaded.`);
}

!function scheduleInstall() {
  document.body ? install() : "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", install, {
    once: !0
  }) : requestAnimationFrame(scheduleInstall);
}();

export { };
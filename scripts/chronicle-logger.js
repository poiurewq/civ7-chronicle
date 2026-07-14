const YIELD_METRICS = [ {
  k: "hap",
  yield: "YIELD_HAPPINESS"
}, {
  k: "inf",
  yield: "YIELD_DIPLOMACY"
}, {
  k: "goldNet",
  yield: "YIELD_GOLD"
}, {
  k: "Science",
  yield: "YIELD_SCIENCE"
}, {
  k: "Culture",
  yield: "YIELD_CULTURE"
}, {
  k: "Production",
  yield: "YIELD_PRODUCTION"
}, {
  k: "Food",
  yield: "YIELD_FOOD"
} ], SUMMARY_SERIES = [ {
  k: "gp",
  id: "GreatPeopleEarned",
  scope: "Player",
  delta: !0
}, {
  k: "tour",
  id: "Tourism",
  scope: "City",
  delta: !1
} ];

let nodeListCache = {};

function countCompletedNodes(pid, ageType, system) {
  if ("undefined" == typeof Game || !Game.ProgressionTrees || "function" != typeof Game.ProgressionTrees.getNode) return null;
  const nodes = function(ageType, system) {
    const ck = ageType + ":" + system;
    if (nodeListCache[ck]) return nodeListCache[ck];
    const list = [];
    try {
      for (const n of GameInfo.ProgressionTreeNodes) {
        const tree = GameInfo.ProgressionTrees.lookup(n.ProgressionTree);
        tree && tree.SystemType === system && tree.AgeType === ageType && list.push(n.ProgressionTreeNodeType);
      }
    } catch (e) {}
    return nodeListCache[ck] = list, list;
  }(ageType, system);
  if (!nodes.length) return null;
  let n = 0;
  try {
    for (const nt of nodes) {
      const nd = Game.ProgressionTrees.getNode(pid, nt);
      nd && nd.depthUnlocked > 0 && (n += nd.depthUnlocked);
    }
  } catch (e) {
    return null;
  }
  return n;
}

function err(msg) {
  console.error(`[chronicle-log] ${msg}`);
}

function round1(n) {
  return Math.round(10 * n) / 10;
}

function resolveGameId() {
  const fp = function() {
    let seed = null, setup = null, csa = null;
    try {
      const g = Configuration.getGame();
      g && (null != g.gameSeed && (seed = g.gameSeed), null != g.campaignSetupGUID && String(g.campaignSetupGUID).length && (setup = String(g.campaignSetupGUID)), 
      null != g.campaignStartAgeType && (csa = g.campaignStartAgeType));
    } catch (e) {}
    return {
      seed: seed,
      setup: setup,
      csa: csa
    };
  }(), seedOk = null != fp.seed && "0" !== String(fp.seed);
  let chosen = "nogid";
  return fp.setup && seedOk ? chosen = `${fp.setup}_${fp.seed}` : seedOk ? chosen = `seed:${fp.seed}` : fp.setup && (chosen = fp.setup), 
  {
    id: chosen,
    fp: fp,
    diag: `setup=${fp.setup} seed=${fp.seed} csa=${fp.csa}`
  };
}

function currentAge() {
  let key = "unknown", label = "", ci = null;
  try {
    if (key = String(Game.age), "undefined" != typeof GameInfo && GameInfo.Ages) for (const a of GameInfo.Ages) if (a.$hash === Game.age || a.AgeType === Game.age) {
      label = a.AgeType, ci = a.ChronologyIndex;
      break;
    }
  } catch (e) {}
  return {
    key: key,
    label: label,
    ci: ci
  };
}

function snapshotLiveScalars(p, s) {
  const st = p.Stats;
  try {
    if (p.Trade && "function" == typeof p.Trade.countPlayerTradeRoutes) {
      const v = p.Trade.countPlayerTradeRoutes();
      null != v && (s.tr = v);
    }
  } catch (e) {}
  if (st) {
    try {
      if ("function" == typeof st.getTotalGreatWorksSlotted) {
        const v = st.getTotalGreatWorksSlotted();
        null != v && (s.gw = v);
      }
    } catch (e) {}
    try {
      if ("function" == typeof st.getNumWonders) {
        const v = st.getNumWonders(!1, !1);
        null != v && (s.won = v);
      }
    } catch (e) {}
    try {
      null != st.numSettlements && (s.set = st.numSettlements);
    } catch (e) {}
    try {
      null != st.numCities && (s.cityN = st.numCities);
    } catch (e) {}
    try {
      null != st.numTowns && (s.townN = st.numTowns);
    } catch (e) {}
    try {
      null != st.settlementCap && (s.cap = st.settlementCap);
    } catch (e) {}
    try {
      if ("function" == typeof st.getNumConqueredSettlements) {
        const v = st.getNumConqueredSettlements(!0, !0, !0, !1);
        null != v && (s.conq = v);
      }
    } catch (e) {}
  }
  const urb = function(p) {
    if ("undefined" == typeof DistrictTypes || !p.Cities || "function" != typeof p.Cities.getCities) return null;
    let n = 0, any = !1;
    try {
      for (const c of p.Cities.getCities()) try {
        c.Districts && "function" == typeof c.Districts.getIdsOfType && (n += c.Districts.getIdsOfType(DistrictTypes.URBAN).length, 
        any = !0);
      } catch (e) {}
    } catch (e) {
      return null;
    }
    return any ? n : null;
  }(p);
  null != urb && (s.urb = urb);
  try {
    if (p.Cities && "function" == typeof p.Cities.getCities) {
      const cities = p.Cities.getCities() || [];
      s.cit = cities.length;
      let up = 0, tp = 0, any = !1;
      for (const c of cities) try {
        null != c.urbanPopulation && (up += c.urbanPopulation, any = !0), null != c.population && (tp += c.population, 
        any = !0);
      } catch (e) {}
      any && (s.upop = up, s.tpop = tp);
    }
  } catch (e) {}
}

function snapshotPlayer(p) {
  const s = {}, st = p.Stats;
  if (st && "function" == typeof st.getNetYield) for (const m of YIELD_METRICS) try {
    const yt = YieldTypes[m.yield];
    if (null != yt) {
      const v = st.getNetYield(yt);
      null != v && (s[m.k] = round1(v));
    }
  } catch (e) {}
  try {
    p.Treasury && null != p.Treasury.goldBalance && (s.gold = round1(p.Treasury.goldBalance));
  } catch (e) {}
  return snapshotLiveScalars(p, s), s;
}

const kills = {}, losses = {};

function ownerOf(cid) {
  return cid && null != cid.owner ? cid.owner : null;
}

function onUnitKilled(data) {
  if (!data) return;
  const victim = ownerOf(data.unitKilled), killer = ownerOf(data.unitKiller);
  null != killer && (kills[killer] = (kills[killer] || 0) + 1), null != victim && (losses[victim] = (losses[victim] || 0) + 1), 
  function() {
    if (!store || !container) return;
    try {
      const bucket = store.ages[currentAge().key], row = bucket && bucket.turns ? bucket.turns[Game.turn] : null;
      if (!row || !row.p) return;
      applyKillCounts(row.p), store.updated = Date.now(), saveContainer(container, guid);
    } catch (e) {
      err("kill stamp failed: " + emsg(e));
    }
  }();
}

function applyKillCounts(players) {
  const anyKills = Object.keys(kills).length > 0, anyLosses = Object.keys(losses).length > 0;
  if (anyKills || anyLosses) for (const pid in players) anyKills && (players[pid].uKill = kills[pid] || 0), 
  anyLosses && (players[pid].uLost = losses[pid] || 0);
}

function seedKillCounters() {
  if (!store || !store.ages) return;
  let best = null, bestCi = -1, bestTurn = -1;
  for (const k in store.ages) {
    const a = store.ages[k], ci = null != a.ci ? a.ci : 0;
    for (const t in a.turns) {
      const turn = Number(t);
      (ci > bestCi || ci === bestCi && turn > bestTurn) && (bestCi = ci, bestTurn = turn, 
      best = a.turns[t]);
    }
  }
  if (best && best.p) for (const pid in best.p) {
    const row = best.p[pid];
    null != row.uKill && (kills[pid] = row.uKill), null != row.uLost && (losses[pid] = row.uLost);
  }
}

const BYTYPE_IDS = [ "UnitsTrainedByType", "UnitsKilledByType", "UnitsLostByType", "BuildingsBuiltByType", "DistrictsBuiltByType", "WondersBuiltByType" ];

function emsg(e) {
  return e && e.message ? e.message : e;
}

function containerBytes(c) {
  try {
    return JSON.stringify(c).length;
  } catch (e) {
    return -1;
  }
}

function evictOldestGame(c, currentGameId) {
  let oldest = null, oldestT = 1 / 0;
  for (const gid in c.games) {
    if (gid === currentGameId) continue;
    const u = c.games[gid].updated || 0;
    u < oldestT && (oldestT = u, oldest = gid);
  }
  return null != oldest && (delete c.games[oldest], err(`evicted oldest game ${oldest} (container cap)`), 
  !0);
}

const CONTAINER_CAP = 430080;

function saveContainer(c, currentGameId) {
  c.updated = Date.now();
  let guard = 0;
  for (;containerBytes(c) > CONTAINER_CAP && guard++ < 64 && evictOldestGame(c, currentGameId); ) ;
  for (let attempt = 0; attempt < 10; attempt++) try {
    return localStorage.setItem("!chronicle", JSON.stringify(c)), !0;
  } catch (e) {
    if (!evictOldestGame(c, currentGameId)) return err("save failed (quota, nothing to evict): " + emsg(e)), 
    !1;
  }
  return err("save failed after evictions"), !1;
}

function countRows(store) {
  let n = 0;
  for (const k in store.ages) {
    const t = store.ages[k].turns;
    t && (n += Object.keys(t).length);
  }
  return n;
}

let container = null, store = null, guid = "nogid", lastCaptureKey = null;

function maybeCapture(reason) {
  if (!store || !container) return;
  const age = currentAge(), ageKey = age.key, turn = Game.turn;
  if (null == turn) return;
  const dedup = ageKey + ":" + turn;
  if (dedup === lastCaptureKey) return;
  lastCaptureKey = dedup;
  const bucket = store.ages[ageKey] || (store.ages[ageKey] = {
    ci: age.ci,
    label: age.label,
    turns: {}
  });
  null == bucket.ci && null != age.ci && (bucket.ci = age.ci), !bucket.label && age.label && (bucket.label = age.label);
  const summaryByPid = function(turn) {
    const out = {};
    if ("undefined" == typeof Game || !Game.Summary || "function" != typeof Game.Summary.getDataSets) return out;
    let objectMap;
    try {
      objectMap = new Map, Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
    } catch (e) {
      return out;
    }
    for (const sm of SUMMARY_SERIES) {
      let sets;
      try {
        sets = Game.Summary.getDataSets(sm.id);
      } catch (e) {
        continue;
      }
      if (sets) for (const ds of sets) {
        const o = null != ds.owner ? objectMap.get(ds.owner) : null;
        if (!o || o.type !== sm.scope || null == o.ownerPlayer || !ds.values || !ds.values.length) continue;
        let v = null;
        if (sm.delta) {
          let acc = 0;
          for (const pt of ds.values) pt.x <= turn && (acc += pt.y);
          v = acc;
        } else {
          let bestX = -1 / 0;
          for (const pt of ds.values) pt.x <= turn && pt.x > bestX && (bestX = pt.x, v = pt.y);
        }
        if (null == v) continue;
        const row = out[o.ownerPlayer] || (out[o.ownerPlayer] = {});
        row[sm.k] = (row[sm.k] || 0) + v;
      }
    }
    return out;
  }(turn), rel = function() {
    const out = {};
    try {
      if ("undefined" == typeof GameInfo || !GameInfo.Religions) return out;
      const known = new Set;
      for (const r of GameInfo.Religions) r && null != r.$hash && known.add(r.$hash);
      if (!known.size) return out;
      for (const p of Players.getAlive()) if (p && p.Cities && "function" == typeof p.Cities.getCities) for (const c of p.Cities.getCities() || []) try {
        const rel = c.Religion && c.Religion.majorityReligion;
        if (null == rel || !known.has(rel)) continue;
        const k = String(rel), row = out[k] || (out[k] = {
          s: 0,
          p: 0
        });
        row.s += 1, null != c.population && (row.p += c.population);
      } catch (e) {}
    } catch (e) {}
    return out;
  }();
  Object.keys(kills).length || Object.keys(losses).length || seedKillCounters();
  const players = {};
  for (const p of Players.getAlive()) {
    if (!p || !p.isMajor) continue;
    const s = snapshotPlayer(p), civics = countCompletedNodes(p.id, age.label, "SYSTEM_CULTURE");
    null != civics && (s.CivicsAcquired = civics);
    const techs = countCompletedNodes(p.id, age.label, "SYSTEM_TECH");
    null != techs && (s.TechsAcquired = techs);
    const sm = summaryByPid[p.id];
    if (sm) for (const k in sm) s[k] = round1(sm[k]);
    players[p.id] = s;
  }
  applyKillCounts(players);
  const turnRow = {
    t: turn,
    p: players
  };
  Object.keys(rel).length && (turnRow.rel = rel), bucket.turns[turn] = turnRow;
  const bt = function() {
    const out = {};
    if ("undefined" == typeof Game || !Game.Summary || "function" != typeof Game.Summary.getDataPoints) return out;
    let objectMap, dps;
    try {
      objectMap = new Map, Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o)), 
      dps = Game.Summary.getDataPoints();
    } catch (e) {
      return out;
    }
    if (!dps) return out;
    const validPlayers = new Set;
    for (const o of objectMap.values()) "Player" === o.type && validPlayers.add(o.ownerPlayer);
    for (const dp of dps) {
      if (BYTYPE_IDS.indexOf(dp.ID) < 0) continue;
      if (!dp.value || null == dp.value.numeric) continue;
      if (null == dp.type || "" === String(dp.type).trim()) continue;
      const o = null != dp.owner ? objectMap.get(dp.owner) : null, pid = o ? o.ownerPlayer : null;
      if (null == pid || !validPlayers.has(pid)) continue;
      const byId = out[dp.ID] || (out[dp.ID] = {}), byPid = byId[pid] || (byId[pid] = {});
      byPid[dp.type] = (byPid[dp.type] || 0) + dp.value.numeric;
    }
    return out;
  }();
  Object.keys(bt).length && (bucket.bt = bt), store.updated = Date.now(), saveContainer(container, guid);
}

function init() {
  const resolved = resolveGameId();
  guid = resolved.id, container = function() {
    let row0 = null;
    try {
      const raw = localStorage.getItem("!chronicle");
      raw && (row0 = JSON.parse(raw));
    } catch (e) {
      err("container load/parse failed: " + emsg(e));
    }
    if (row0 && row0.games) return (c = row0) && "object" == typeof c && c.games ? (c.v = 2, 
    c) : {
      v: 2,
      updated: 0,
      games: {}
    };
    var c;
    if (row0 && row0.ages && !row0.games) {
      const gid = row0.fp && row0.fp.setup && null != row0.fp.seed ? `${row0.fp.setup}_${row0.fp.seed}` : row0.guid || "legacy", games = {};
      return games[gid] = {
        fp: row0.fp || null,
        created: row0.created || Date.now(),
        updated: row0.updated || 0,
        ages: row0.ages
      }, err(`migrated legacy row-0 store (${gid}) into container: ${Object.keys(row0.ages).length} age(s)`), 
      {
        v: 2,
        updated: 0,
        games: games
      };
    }
    return {
      v: 2,
      updated: 0,
      games: {}
    };
  }(), store = function(c, gameId, fp) {
    const cur = c.games[gameId];
    if (cur && cur.ages) return fp && (cur.fp = fp), cur;
    if (fp && null != fp.seed) for (const gid in c.games) {
      const g = c.games[gid];
      if (g && g.ages && g.fp && g.fp.seed === fp.seed) return gid !== gameId && (c.games[gameId] = g, 
      delete c.games[gid]), g.fp = fp, g;
    }
    const fresh = {
      fp: fp,
      created: Date.now(),
      updated: 0,
      ages: {}
    };
    return c.games[gameId] = fresh, fresh;
  }(container, guid, resolved.fp), saveContainer(container, guid);
  const age = currentAge();
  err(`loaded. game=${guid} age=${age.key}${age.label ? " (" + age.label + ")" : ""} restored ${countRows(store)} prior rows across ${Object.keys(store.ages).length} ages; container has ${Object.keys(container.games).length} game(s), ${containerBytes(container)} B`), 
  seedKillCounters();
  try {
    maybeCapture();
  } catch (e) {
    err("initial capture threw: " + (e && e.message ? e.message : e));
  }
  try {
    engine.on("PlayerTurnActivated", () => {
      try {
        maybeCapture();
      } catch (e) {
        err("capture threw: " + (e && e.message ? e.message : e));
      }
    });
  } catch (e) {
    err("engine.on hook failed: " + (e && e.message ? e.message : e));
  }
  try {
    engine.on("UnitKilledInCombat", data => {
      try {
        onUnitKilled(data);
      } catch (e) {
        err("kill hook threw: " + (e && e.message ? e.message : e));
      }
    });
  } catch (e) {
    err("UnitKilledInCombat hook failed: " + (e && e.message ? e.message : e));
  }
}

let bootTries = 0;

requestAnimationFrame(function boot() {
  !function() {
    try {
      return "undefined" != typeof Game && null != Game.turn && "undefined" != typeof Players && "function" == typeof Players.getAlive && "undefined" != typeof YieldTypes && "undefined" != typeof localStorage && null != localStorage;
    } catch (e) {
      return !1;
    }
  }() ? bootTries++ < 600 ? requestAnimationFrame(boot) : err("gameplay APIs never became ready; logger inactive") : init();
});

export { };
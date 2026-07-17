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

function resolveType(tableName, hash, field) {
  if (null == hash) return null;
  try {
    const t = "undefined" != typeof GameInfo ? GameInfo[tableName] : null;
    if (t && "function" == typeof t.lookup) {
      const row = t.lookup(hash);
      if (row && null != row[field]) return String(row[field]);
    }
  } catch (e) {}
  return String(hash);
}

function ensureMeta() {
  if (!store) return;
  const fresh = function() {
    const m = {
      updated: Date.now(),
      players: {}
    };
    try {
      const g = Configuration.getGame();
      g && (m.diff = resolveType("Difficulties", g.difficultyType, "DifficultyType"), 
      m.startAge = resolveType("Ages", g.campaignStartAgeType, "AgeType"));
    } catch (e) {}
    try {
      const mp = Configuration.getMap();
      mp && null != mp.mapSizeTypeName && (m.mapSize = String(mp.mapSizeTypeName));
    } catch (e) {}
    try {
      m.local = GameContext.localPlayerID;
    } catch (e) {}
    let alive = null;
    try {
      alive = Players.getAlive();
    } catch (e) {
      alive = [];
    }
    for (const p of alive) {
      if (!p || !p.isMajor) continue;
      const rec = {
        isMajor: !0
      };
      try {
        const pc = Configuration.getPlayer(p.id);
        pc && (rec.isAI = !!pc.isAI, null != pc.leaderTypeName ? rec.leader = String(pc.leaderTypeName) : null != pc.leaderName && (rec.leader = String(pc.leaderName)));
      } catch (e) {}
      try {
        const pri = UI.Player.getPrimaryColorValueAsString(p.id);
        pri && (rec.pri = String(pri));
      } catch (e) {}
      try {
        const sec = UI.Player.getSecondaryColorValueAsString(p.id);
        sec && (rec.sec = String(sec));
      } catch (e) {}
      m.players[p.id] = rec;
    }
    return m;
  }(), m = store.meta || (store.meta = {
    players: {}
  });
  m.updated = fresh.updated;
  for (const k of [ "ruleset", "diff", "mapSize", "startAge", "local" ]) null != fresh[k] && (m[k] = fresh[k]);
  m.players || (m.players = {});
  for (const pid in fresh.players) m.players[pid] = Object.assign(m.players[pid] || {}, fresh.players[pid]);
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

const VICTORY_POINT_METRICS = [ {
  k: "score",
  cls: "VICTORY_CLASS_SCORE"
}, {
  k: "vCul",
  cls: "VICTORY_CLASS_CULTURE"
}, {
  k: "vEco",
  cls: "VICTORY_CLASS_ECONOMIC"
}, {
  k: "vMil",
  cls: "VICTORY_CLASS_MILITARY"
}, {
  k: "vSci",
  cls: "VICTORY_CLASS_SCIENCE"
} ];

let _vpHash;

function snapshotVictoryPoints(p, s) {
  if (!p.Victories || "function" != typeof p.Victories.getPointsForVictoryType) return;
  const byClass = function() {
    if (void 0 !== _vpHash) return _vpHash;
    _vpHash = {};
    try {
      if ("undefined" != typeof GameInfo && GameInfo.Victories) for (const v of GameInfo.Victories) v && null != v.VictoryClassType && null != v.$hash && null == _vpHash[v.VictoryClassType] && (_vpHash[v.VictoryClassType] = v.$hash);
    } catch (e) {
      _vpHash = {};
    }
    return _vpHash;
  }();
  for (const m of VICTORY_POINT_METRICS) {
    const h = byClass[m.cls];
    if (null != h) try {
      const v = p.Victories.getPointsForVictoryType(h);
      null != v && (s[m.k] = round1(v));
    } catch (e) {}
  }
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
  return snapshotVictoryPoints(p, s), snapshotLiveScalars(p, s), s;
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
    } catch (e) {}
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
  return null != oldest && (delete c.games[oldest], !0);
}

const CONTAINER_CAP = 4194304;

function saveContainer(c, currentGameId) {
  c.updated = Date.now();
  let guard = 0;
  for (;containerBytes(c) > CONTAINER_CAP && guard++ < 64 && evictOldestGame(c, currentGameId); ) ;
  for (let attempt = 0; attempt < 10; attempt++) try {
    return localStorage.setItem("!chronicle", JSON.stringify(c)), !0;
  } catch (e) {
    if (!evictOldestGame(c, currentGameId)) return !1;
  }
  return !1;
}

let container = null, store = null, guid = "nogid", lastCaptureKey = null;

function recordOutcome(reason) {
  if (!store || "undefined" == typeof Game) return;
  const vm = Game.VictoryManager;
  if (!vm) return;
  let winnerTeam = null, place = null, victoryClass = null;
  try {
    if ("function" == typeof vm.getVictories) {
      const wins = (vm.getVictories() || []).filter(v => v && v.place >= 1).sort((a, b) => a.place - b.place);
      if (wins.length) {
        winnerTeam = wins[0].team, place = wins[0].place;
        try {
          const def = GameInfo.Victories.lookup(wins[0].victory);
          def && (victoryClass = def.VictoryClassType);
        } catch (e) {}
      }
    }
  } catch (e) {}
  let localTeam = null;
  try {
    const lp = Players.get(GameContext.localPlayerID);
    lp && (localTeam = lp.team);
  } catch (e) {}
  let defeatType = null;
  try {
    if ("PlayerDefeat" === reason && "function" == typeof vm.getLatestPlayerDefeat) {
      const d = vm.getLatestPlayerDefeat();
      !d || null == d.defeatType && null == d.DefeatType || (defeatType = String(null != d.defeatType ? d.defeatType : d.DefeatType));
    }
  } catch (e) {}
  if (null == winnerTeam && null == defeatType) return;
  const res = store.meta && store.meta.result ? store.meta.result : {};
  res.turn = Game.turn, res.ageKey = currentAge().key, null != winnerTeam && (res.victorTeam = winnerTeam, 
  res.place = place, victoryClass && (res.victoryClass = victoryClass), null != localTeam && (res.localWon = winnerTeam === localTeam)), 
  null != defeatType && (res.localDefeated = !0, res.defeatType = defeatType), store.meta || (store.meta = {
    players: {}
  }), store.meta.result = res, store.updated = Date.now();
  try {
    saveContainer(container, guid);
  } catch (e) {}
}

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
  if (null == bucket.ci && null != age.ci && (bucket.ci = age.ci), !bucket.label && age.label && (bucket.label = age.label), 
  store.meta && store.meta.players && Object.keys(store.meta.players).length || ensureMeta(), 
  !bucket.civ) {
    const civ = function() {
      const civ = {};
      let alive = null;
      try {
        alive = Players.getAlive();
      } catch (e) {
        return civ;
      }
      for (const p of alive) if (p && p.isMajor) try {
        const pc = Configuration.getPlayer(p.id);
        pc && null != pc.civilizationTypeName && (civ[p.id] = String(pc.civilizationTypeName));
      } catch (e) {}
      return civ;
    }();
    Object.keys(civ).length && (bucket.civ = civ);
  }
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
  }(turn), relSnap = function() {
    const out = {
      tallies: {},
      types: {},
      names: {},
      founders: {}
    };
    try {
      if ("undefined" == typeof GameInfo || !GameInfo.Religions) return out;
      const known = new Set, hashToType = new Map;
      for (const r of GameInfo.Religions) r && null != r.$hash && (known.add(r.$hash), 
      r.ReligionType && hashToType.set(r.$hash, r.ReligionType));
      if (!known.size) return out;
      for (const p of Players.getAlive()) if (p && p.isMajor && p.Religion) try {
        if ("function" == typeof p.Religion.hasCreatedReligion && !p.Religion.hasCreatedReligion()) continue;
        if ("function" != typeof p.Religion.getReligionType) continue;
        const typeId = p.Religion.getReligionType();
        if (null == typeId) continue;
        let typeStr = null, hashKey = null;
        try {
          const def = GameInfo.Religions.lookup(typeId);
          def && (typeStr = def.ReligionType || null, null != def.$hash && (hashKey = String(def.$hash)));
        } catch (e) {}
        null == hashKey && (hashKey = String(typeId)), !typeStr && hashToType.has(typeId) && (typeStr = hashToType.get(typeId)), 
        !typeStr && hashToType.has(Number(typeId)) && (typeStr = hashToType.get(Number(typeId))), 
        out.founders[hashKey] = p.id, typeStr && (out.types[hashKey] = typeStr);
        const nm = resolvePlayerReligionName(p.Religion);
        if (nm && (out.names[hashKey] = nm), typeStr) try {
          if ("undefined" != typeof Database && "function" == typeof Database.makeHash) {
            const h = Database.makeHash(typeStr);
            null != h && String(h) !== hashKey && (out.founders[String(h)] = p.id, out.types[String(h)] = typeStr, 
            nm && (out.names[String(h)] = nm));
          }
        } catch (e) {}
      } catch (e) {}
      for (const p of Players.getAlive()) if (p && p.Cities && "function" == typeof p.Cities.getCities) for (const c of p.Cities.getCities() || []) try {
        const rel = c.Religion && c.Religion.majorityReligion;
        if (null == rel || !known.has(rel)) continue;
        const k = String(rel), row = out.tallies[k] || (out.tallies[k] = {
          s: 0,
          p: 0
        });
        if (row.s += 1, null != c.population && (row.p += c.population), !out.types[k] && hashToType.has(rel) && (out.types[k] = hashToType.get(rel)), 
        null == out.founders[k] && "undefined" != typeof Game && Game.Religion && "function" == typeof Game.Religion.getPlayerFromReligion) {
          const type = out.types[k];
          if (type) try {
            const f = Game.Religion.getPlayerFromReligion(type);
            if (null != f && f >= 0) {
              out.founders[k] = f;
              const pl = Players.get(f);
              if (pl && pl.Religion) {
                const nm = resolvePlayerReligionName(pl.Religion);
                nm && (out.names[k] = nm);
              }
            }
          } catch (e) {}
        }
      } catch (e) {}
    } catch (e) {}
    return out;
  }(), rel = relSnap.tallies || {};
  if (Object.keys(relSnap.types || {}).length) {
    store.relTypes = store.relTypes || {};
    for (const k in relSnap.types) store.relTypes[k] = relSnap.types[k];
  }
  if (Object.keys(relSnap.names || {}).length) {
    store.relNames = store.relNames || {};
    for (const k in relSnap.names) {
      const nm = relSnap.names[k];
      isSyntheticReligionLabel(nm) || (store.relNames[k] = nm);
    }
  }
  if (Object.keys(relSnap.founders || {}).length) {
    store.relFounders = store.relFounders || {};
    for (const k in relSnap.founders) store.relFounders[k] = relSnap.founders[k];
  }
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
  Object.keys(bt).length && (bucket.bt = bt);
  const ss = function() {
    const out = [];
    try {
      for (const p of Players.getAlive()) {
        if (!p) continue;
        const pid = p.id;
        let cities = [];
        try {
          p.Cities && "function" == typeof p.Cities.getCities && (cities = p.Cities.getCities() || []);
        } catch (e) {
          continue;
        }
        for (const c of cities) try {
          const pop = c.population;
          if (null == pop || isNaN(pop)) continue;
          let name;
          try {
            name = Locale.compose(c.name);
          } catch (e) {
            name = String(c && c.name);
          }
          null != name && "" !== name || (name = "Settlement");
          const row = {
            n: name,
            p: pop,
            o: pid
          };
          try {
            const u = c.urbanPopulation;
            null == u || isNaN(u) || (row.u = u);
          } catch (e) {}
          out.push(row);
        } catch (e) {}
      }
    } catch (e) {}
    return out;
  }();
  ss.length && (store.ss = ss), store.updated = Date.now(), saveContainer(container, guid);
  try {
    recordOutcome("capture");
  } catch (e) {}
}

function init() {
  const resolved = resolveGameId();
  guid = resolved.id, container = function() {
    let row0 = null;
    try {
      const raw = localStorage.getItem("!chronicle");
      raw && (row0 = JSON.parse(raw));
    } catch (e) {}
    if (row0 && row0.games) return (c = row0) && "object" == typeof c && c.games ? (c.v = 2, 
    c) : {
      v: 2,
      updated: 0,
      games: {}
    };
    var c;
    if (row0 && row0.ages && !row0.games) {
      const games = {};
      return games[row0.fp && row0.fp.setup && null != row0.fp.seed ? `${row0.fp.setup}_${row0.fp.seed}` : row0.guid || "legacy"] = {
        fp: row0.fp || null,
        created: row0.created || Date.now(),
        updated: row0.updated || 0,
        ages: row0.ages
      }, {
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
  }(container, guid, resolved.fp), ensureMeta(), saveContainer(container, guid);
  const age = currentAge();
  var msg;
  msg = `loaded. game=${guid} age=${age.key}${age.label ? " (" + age.label + ")" : ""} restored ${function(store) {
    let n = 0;
    for (const k in store.ages) {
      const t = store.ages[k].turns;
      t && (n += Object.keys(t).length);
    }
    return n;
  }(store)} prior rows across ${Object.keys(store.ages).length} ages; container has ${Object.keys(container.games).length} game(s), ${containerBytes(container)} B`, 
  console.error(`[chronicle-log] ${msg}`), seedKillCounters();
  try {
    maybeCapture();
  } catch (e) {}
  try {
    engine.on("PlayerTurnActivated", () => {
      try {
        maybeCapture();
      } catch (e) {}
    });
  } catch (e) {}
  try {
    engine.on("UnitKilledInCombat", data => {
      try {
        onUnitKilled(data);
      } catch (e) {}
    });
  } catch (e) {}
  try {
    engine.on("TeamVictory", () => {
      try {
        recordOutcome("TeamVictory");
      } catch (e) {}
    });
  } catch (e) {}
  try {
    engine.on("PlayerDefeat", () => {
      try {
        recordOutcome("PlayerDefeat");
      } catch (e) {}
    });
  } catch (e) {}
}

let bootTries = 0;

requestAnimationFrame(function boot() {
  !function() {
    try {
      return "undefined" != typeof Game && null != Game.turn && "undefined" != typeof Players && "function" == typeof Players.getAlive && "undefined" != typeof YieldTypes && "undefined" != typeof localStorage && null != localStorage;
    } catch (e) {
      return !1;
    }
  }() ? bootTries++ < 600 && requestAnimationFrame(boot) : init();
});

export { };
const LEGACY_KEYS = [ "!chronicle", "chronicle" ], YIELD_METRICS = [ {
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
        null != v && (s.conqA = v);
      }
    } catch (e) {}
    try {
      if ("function" == typeof st.getNumIndependentsDispersed) {
        const v = st.getNumIndependentsDispersed();
        null != v && (s.indDisp = v);
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

const razes = {}, settlementsLost = {};

function applySettlementEventCounts(players) {
  for (const pid in players) null != razes[pid] && (players[pid].rz = razes[pid]), 
  null != settlementsLost[pid] && (players[pid].sLost = settlementsLost[pid]);
}

function installSettlementEventHandlers() {
  try {
    engine.on("CityRazingStarted", data => {
      try {
        !function(data) {
          if (!data || !data.cityID) return;
          const razer = null != data.cityID.owner ? data.cityID.owner : null;
          null != razer && (razes[razer] = (razes[razer] || 0) + 1, stampEventCounters());
        }(data);
      } catch (e) {}
    });
  } catch (e) {
    err(`settlement events: could not subscribe CityRazingStarted: ${e && e.message}`);
  }
  try {
    engine.on("CityTransfered", data => {
      try {
        !function(data) {
          if (!data || null == data.fromPlayer) return;
          const from = data.fromPlayer;
          let to = null;
          try {
            data.cityID && null != data.cityID.owner && (to = data.cityID.owner);
          } catch (e) {}
          null != to && to === from || (settlementsLost[from] = (settlementsLost[from] || 0) + 1, 
          stampEventCounters());
        }(data);
      } catch (e) {}
    });
  } catch (e) {
    err(`settlement events: could not subscribe CityTransfered: ${e && e.message}`);
  }
}

const kills = {}, losses = {}, killsByType = {}, lossesByType = {}, overbuilds = {}, overbuildsByType = {}, pendingOverbuildRemovals = {};

function ownerOf(cid) {
  return cid && null != cid.owner ? cid.owner : null;
}

const unitTypeByCid = {}, UNIT_TYPE_CACHE_CAP = 5e3;

function cidKey(cid) {
  if (!cid || null == cid.id) return null;
  return (null != cid.owner ? cid.owner : null != cid.ownerPlayer ? cid.ownerPlayer : "?") + ":" + cid.id;
}

function unitTypeName(typeOrHash) {
  if (null == typeOrHash) return null;
  try {
    if ("undefined" != typeof GameInfo && GameInfo.Units) {
      const def = GameInfo.Units.lookup(typeOrHash);
      if (def && def.UnitType) return def.UnitType;
    }
  } catch (e) {}
  const s = String(typeOrHash);
  return "26" === s ? null : 0 === s.indexOf("UNIT_") ? s : null;
}

function rememberUnitType(cid, typeOrHash) {
  const name = unitTypeName(typeOrHash);
  if (!name) return null;
  const k = cidKey(cid);
  if (!k) return name;
  unitTypeByCid[k] = name;
  try {
    const keys = Object.keys(unitTypeByCid);
    if (keys.length > UNIT_TYPE_CACHE_CAP) {
      const drop = Math.floor(keys.length / 2);
      for (let i = 0; i < drop; i++) delete unitTypeByCid[keys[i]];
    }
  } catch (e) {}
  return name;
}

function unitTypeFromCid(cid) {
  if (!cid) return null;
  try {
    if ("undefined" != typeof Units && "function" == typeof Units.get) {
      const u = Units.get(cid);
      if (u && null != u.type) {
        const n = rememberUnitType(cid, u.type);
        if (n) return n;
      }
    }
  } catch (e) {}
  const k = cidKey(cid);
  if (k && unitTypeByCid[k]) return unitTypeByCid[k];
  try {
    if (null != cid.unitType) {
      const n = rememberUnitType(cid, cid.unitType);
      if (n) return n;
    }
  } catch (e) {}
  return null;
}

function seedUnitTypeCacheFromMap() {
  try {
    if ("undefined" == typeof Players || "function" != typeof Players.getAlive) return;
    for (const p of Players.getAlive()) if (p) try {
      const pu = p.Units, ids = pu && ("function" == typeof pu.getUnitIds ? pu.getUnitIds() : "function" == typeof pu.getUnits ? pu.getUnits() : null);
      if (!ids) continue;
      for (const uid of ids) try {
        const u = "undefined" != typeof Units && Units.get ? Units.get(uid) : null;
        if (!u || null == u.type) continue;
        let cid = null;
        if (null != u.id && "object" == typeof u.id && null != u.id.id) cid = u.id; else if (null != uid && "object" == typeof uid && null != uid.id) cid = uid; else {
          const owner = null != u.owner ? u.owner : null != p.id ? p.id : null, id = null != u.id && "object" != typeof u.id ? u.id : uid;
          null != owner && null != id && (cid = {
            owner: owner,
            id: id
          });
        }
        cid && rememberUnitType(cid, u.type);
      } catch (e) {}
    } catch (e) {}
  } catch (e) {}
}

function installUnitTypeCacheHandlers() {
  try {
    engine.on("UnitAddedToMap", data => {
      try {
        !function(data) {
          if (!data) return;
          const unit = null != data.unit ? data.unit : null != data.unitID ? data.unitID : null;
          null != data.unitType && unit ? rememberUnitType(unit, data.unitType) : unit && unitTypeFromCid(unit);
        }(data);
      } catch (e) {}
    });
  } catch (e) {
    err(`unit-type cache: could not subscribe UnitAddedToMap: ${e && e.message}`);
  }
}

function bumpByType(map, pid, typeName) {
  if (null == pid || !typeName) return;
  const byPid = map[pid] || (map[pid] = {});
  byPid[typeName] = (byPid[typeName] || 0) + 1;
}

function applyKillCounts(players) {
  for (const pid in players) null != kills[pid] && (players[pid].uKill = kills[pid]), 
  null != losses[pid] && (players[pid].uLost = losses[pid]);
}

function applyOverbuildCounts(players) {
  for (const pid in players) null != overbuilds[pid] && (players[pid].ob = overbuilds[pid]);
}

function sumMergeByType(dst, src) {
  if (src) for (const pid in src) {
    const row = src[pid];
    if (!row) continue;
    const out = dst[pid] || (dst[pid] = {});
    for (const t in row) null != row[t] && (out[t] = (out[t] || 0) + row[t]);
  }
}

function maxMergeByType(dst, src) {
  if (src) for (const pid in src) {
    const row = src[pid];
    if (!row) continue;
    const out = dst[pid] || (dst[pid] = {});
    for (const t in row) null != row[t] && (out[t] = Math.max(out[t] || 0, row[t]));
  }
}

function seedKillCounters() {
  if (store) {
    if (store.kbt && "object" == typeof store.kbt) for (const pid in store.kbt) killsByType[pid] = Object.assign({}, store.kbt[pid]);
    if (store.lbt && "object" == typeof store.lbt) for (const pid in store.lbt) lossesByType[pid] = Object.assign({}, store.lbt[pid]);
    if (store.obt && "object" == typeof store.obt) for (const pid in store.obt) overbuildsByType[pid] = Object.assign({}, store.obt[pid]);
    try {
      !function() {
        if (!store || !store.ages) return;
        if (store._kbtMigrated) return;
        const floorK = {}, floorL = {};
        for (const k in store.ages) {
          const bt = store.ages[k].bt;
          bt && (sumMergeByType(floorK, bt.UnitsKilledByType), sumMergeByType(floorL, bt.UnitsLostByType));
        }
        maxMergeByType(killsByType, floorK), maxMergeByType(lossesByType, floorL), Object.keys(killsByType).length && (store.kbt = cloneByTypeMap(killsByType)), 
        Object.keys(lossesByType).length && (store.lbt = cloneByTypeMap(lossesByType)), 
        store._kbtMigrated = 1;
      }();
    } catch (e) {}
    if (store.ages) {
      for (const k in store.ages) {
        const a = store.ages[k];
        if (a && a.turns) for (const t in a.turns) {
          const row = a.turns[t] && a.turns[t].p;
          if (row) for (const pid in row) {
            const r = row[pid];
            null != r.uKill && (kills[pid] = Math.max(kills[pid] || 0, r.uKill)), null != r.uLost && (losses[pid] = Math.max(losses[pid] || 0, r.uLost)), 
            null != r.ob && (overbuilds[pid] = Math.max(overbuilds[pid] || 0, r.ob)), null != r.rz && (razes[pid] = Math.max(razes[pid] || 0, r.rz)), 
            null != r.sLost && (settlementsLost[pid] = Math.max(settlementsLost[pid] || 0, r.sLost));
          }
        }
      }
      try {
        !function() {
          if (!store || !store.ages) return;
          const ages = Object.keys(store.ages).map(k => {
            const a = store.ages[k];
            return {
              k: k,
              a: a,
              ci: a && null != a.ci ? a.ci : 0
            };
          }).sort((x, y) => x.ci - y.ci || String(x.k).localeCompare(String(y.k))), runK = {}, runL = {}, runOb = {}, runRz = {}, runSL = {};
          let dirty = !1;
          for (const {a: a} of ages) {
            if (!a || !a.turns) continue;
            const turns = Object.keys(a.turns).map(Number).filter(n => !isNaN(n)).sort((x, y) => x - y);
            for (const t of turns) {
              const row = a.turns[t] && a.turns[t].p;
              if (row) for (const pid in row) {
                const r = row[pid];
                null != r.uKill && (null != runK[pid] && r.uKill < runK[pid] ? (r.uKill = runK[pid], 
                dirty = !0) : runK[pid] = r.uKill), null != r.uLost && (null != runL[pid] && r.uLost < runL[pid] ? (r.uLost = runL[pid], 
                dirty = !0) : runL[pid] = r.uLost), null != r.ob && (null != runOb[pid] && r.ob < runOb[pid] ? (r.ob = runOb[pid], 
                dirty = !0) : runOb[pid] = r.ob), null != r.rz && (null != runRz[pid] && r.rz < runRz[pid] ? (r.rz = runRz[pid], 
                dirty = !0) : runRz[pid] = r.rz), null != r.sLost && (null != runSL[pid] && r.sLost < runSL[pid] ? (r.sLost = runSL[pid], 
                dirty = !0) : runSL[pid] = r.sLost);
              }
            }
          }
          for (const pid in runK) kills[pid] = Math.max(kills[pid] || 0, runK[pid]);
          for (const pid in runL) losses[pid] = Math.max(losses[pid] || 0, runL[pid]);
          for (const pid in runOb) overbuilds[pid] = Math.max(overbuilds[pid] || 0, runOb[pid]);
          for (const pid in runRz) razes[pid] = Math.max(razes[pid] || 0, runRz[pid]);
          for (const pid in runSL) settlementsLost[pid] = Math.max(settlementsLost[pid] || 0, runSL[pid]);
          if (dirty && container && guid) {
            store.updated = Date.now();
            try {
              saveContainer(container, guid);
            } catch (e) {}
          }
        }();
      } catch (e) {}
      try {
        !function() {
          if (!store || !store.ages) return;
          if (store._conqAOnly) return;
          let dirty = !1;
          const hadCumFlag = !!store._conqCum;
          for (const k in store.ages) {
            const a = store.ages[k];
            if (a && a.turns) for (const t of Object.keys(a.turns)) {
              const row = a.turns[t] && a.turns[t].p;
              if (row) for (const pid in row) {
                const r = row[pid];
                null != r.conqA || null == r.conq || hadCumFlag || (r.conqA = r.conq, dirty = !0), 
                null != r.conq && (delete r.conq, dirty = !0);
              }
            }
          }
          store._conqAOnly = 1;
          try {
            delete store._conqCum;
          } catch (e) {}
          if (dirty && container && guid) {
            store.updated = Date.now();
            try {
              saveContainer(container, guid);
            } catch (e) {}
          }
        }();
      } catch (e) {}
    }
  }
}

function plotLocKey(loc) {
  return loc && null != loc.x && null != loc.y ? loc.x + "," + loc.y : null;
}

function ownerFromConstructibleEvent(data) {
  if (!data) return null;
  try {
    if (data.district && null != data.district.owner) return data.district.owner;
  } catch (e) {}
  try {
    if (data.constructible && null != data.constructible.owner) return data.constructible.owner;
  } catch (e) {}
  return null;
}

function installOverbuildHandlers() {
  try {
    engine.on("ConstructibleRemovedFromMap", data => {
      try {
        !function(data) {
          if (!data) return;
          const meta = constructibleTypeName(data.constructibleType);
          if (!meta || "BUILDING" !== meta.cls && "IMPROVEMENT" !== meta.cls) return;
          const key = plotLocKey(data.location);
          if (!key) return;
          let turn = null;
          try {
            turn = Game.turn;
          } catch (e) {}
          pendingOverbuildRemovals[key] = {
            type: meta.type,
            cls: meta.cls,
            owner: ownerFromConstructibleEvent(data),
            turn: turn
          };
        }(data);
      } catch (e) {}
    });
  } catch (e) {
    err(`overbuild: could not subscribe ConstructibleRemovedFromMap: ${e && e.message}`);
  }
  try {
    engine.on("ConstructibleAddedToMap", data => {
      try {
        !function(data) {
          if (!data) return;
          const key = plotLocKey(data.location);
          if (!key) return;
          const pending = pendingOverbuildRemovals[key];
          if (!pending) return;
          delete pendingOverbuildRemovals[key];
          const meta = constructibleTypeName(data.constructibleType);
          if (!meta || "BUILDING" !== meta.cls && "IMPROVEMENT" !== meta.cls) return;
          const owner = ownerFromConstructibleEvent(data);
          null != owner && (overbuilds[owner] = (overbuilds[owner] || 0) + 1, pending.type && bumpByType(overbuildsByType, owner, pending.type), 
          stampEventCounters());
        }(data);
      } catch (e) {}
    });
  } catch (e) {
    err(`overbuild: could not subscribe ConstructibleAddedToMap: ${e && e.message}`);
  }
}

const STOCK_IDS = {
  units: "UnitsOwnedByType",
  buildings: "BuildingsOwnedByType",
  improvements: "ImprovementsOwnedByType",
  districts: "DistrictsOwnedByType",
  wonders: "WondersOwnedByType"
};

function constructibleTypeName(typeOrHash) {
  if (null == typeOrHash) return null;
  try {
    if ("undefined" != typeof GameInfo && GameInfo.Constructibles) {
      const def = GameInfo.Constructibles.lookup(typeOrHash);
      if (def) return {
        type: def.ConstructibleType || String(typeOrHash),
        cls: def.ConstructibleClass || null
      };
    }
  } catch (e) {}
  return {
    type: String(typeOrHash),
    cls: null
  };
}

function districtTypeName(typeOrHash) {
  if (null == typeOrHash) return null;
  try {
    if ("undefined" != typeof GameInfo && GameInfo.Districts) {
      const def = GameInfo.Districts.lookup(typeOrHash);
      if (def && def.DistrictType) return def.DistrictType;
    }
  } catch (e) {}
  return String(typeOrHash);
}

function inc(map, key) {
  key && (map[key] = (map[key] || 0) + 1);
}

function sumTypeCounts(byType) {
  if (!byType) return null;
  let n = 0, any = !1;
  for (const t in byType) null != byType[t] && (n += byType[t], any = !0);
  return any ? n : null;
}

function cloneByTypeMap(src) {
  const out = {};
  if (!src) return out;
  for (const pid in src) out[pid] = Object.assign({}, src[pid]);
  return out;
}

function migrateContainer(c) {
  return c && "object" == typeof c && c.games ? (c.v = 2, c) : {
    v: 2,
    updated: 0,
    games: {}
  };
}

function mergeContainers(base, add) {
  for (const gid in add.games) {
    const a = add.games[gid], b = base.games[gid];
    (!b || (a.updated || 0) >= (b.updated || 0)) && (base.games[gid] = a);
  }
  return base;
}

function foldSchema1(row0) {
  const gid = row0.fp && row0.fp.setup && null != row0.fp.seed ? `${row0.fp.setup}_${row0.fp.seed}` : row0.guid || "legacy", c = {
    v: 2,
    updated: 0,
    games: {}
  };
  return c.games[gid] = {
    fp: row0.fp || null,
    created: row0.created || Date.now(),
    updated: row0.updated || 0,
    ages: row0.ages
  }, c;
}

function loadShared() {
  let folded = null;
  const notes = [], fin = shared => ({
    shared: shared,
    container: folded || {
      v: 2,
      updated: 0,
      games: {}
    },
    notes: notes
  });
  for (let hop = 0; hop < 4; hop++) {
    let raw = null;
    try {
      raw = localStorage.getItem("modSettings");
    } catch (e) {}
    if (!raw) return notes.push("row0 empty"), fin({});
    let row0 = null;
    try {
      row0 = JSON.parse(raw);
    } catch (e) {}
    if (!row0 || "object" != typeof row0) return notes.push("row0 not JSON (foreign)"), 
    fin({});
    const sub = row0["ozq-chronicle"];
    if (sub && sub.games) {
      const c = migrateContainer(sub);
      return 0 !== hop || folded ? notes.push("reached modSettings after fold") : notes.push("steady"), 
      delete row0["ozq-chronicle"], folded = folded ? mergeContainers(c, folded) : c, 
      fin(row0);
    }
    if (row0.games) {
      folded = folded ? mergeContainers(migrateContainer(row0), folded) : migrateContainer(row0), 
      notes.push("folded pre-0.31 container");
      let removed = !1;
      for (const k of LEGACY_KEYS) try {
        localStorage.removeItem(k), removed = !0;
      } catch (e) {}
      if (!removed) return fin({});
      continue;
    }
    return row0.ages && !row0.games ? (folded = folded ? mergeContainers(foldSchema1(row0), folded) : foldSchema1(row0), 
    notes.push("folded <=0.24 store (write-verify will clean)"), fin({})) : (notes.push(0 === hop ? "adopted row0 object" : "adopted object after fold"), 
    fin(row0));
  }
  return notes.push("hop limit"), fin({});
}

function saveShared(shared, c) {
  shared["ozq-chronicle"] = c;
  const str = JSON.stringify(shared);
  localStorage.setItem("modSettings", str);
  let back = null;
  try {
    back = localStorage.getItem("modSettings");
  } catch (e) {}
  if (back === str) return !0;
  try {
    null != back && (shared._ozqRescued = {
      t: Date.now(),
      data: String(back).slice(0, 131072)
    }), localStorage.clear();
    const str2 = JSON.stringify(shared);
    return localStorage.setItem("modSettings", str2), err("origin reads were blocked by an unknown first-sorting key; cleared as last resort (row-0 bytes kept in modSettings._ozqRescued)"), 
    localStorage.getItem("modSettings") === str2;
  } catch (e) {
    return !1;
  }
}

let bootNotes = [];

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
    return saveShared(loadShared().shared, c);
  } catch (e) {
    if (!evictOldestGame(c, currentGameId)) return !1;
  }
  return !1;
}

let container = null, store = null, guid = "nogid", lastCaptureKey = null, storeDirty = !1;

function eventCounterPids() {
  const out = {};
  for (const map of [ kills, losses, razes, settlementsLost, overbuilds ]) for (const pid in map) out[pid] = !0;
  return out;
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
    if (store && store.meta && store.meta.players) {
      const m = store.meta.players[n] || store.meta.players[String(n)];
      if (m && null != m.isMajor) return !!m.isMajor;
      if (m) return !0;
    }
  } catch (e) {}
  return !1;
}

function stampEventCounters() {
  if (store && container) try {
    const age = currentAge(), turn = Game.turn;
    if (null == turn) return;
    const bucket = store.ages[age.key];
    let row = bucket && bucket.turns ? bucket.turns[turn] : null;
    if (!row || !row.p) return void captureTurn("stamp-bootstrap", !0);
    const needPids = eventCounterPids();
    for (const pid in needPids) isMajorPid(pid) && null == row.p[pid] && (row.p[pid] = {});
    applyKillCounts(row.p), applyOverbuildCounts(row.p), applySettlementEventCounts(row.p), 
    Object.keys(killsByType).length && (store.kbt = cloneByTypeMap(killsByType)), Object.keys(lossesByType).length && (store.lbt = cloneByTypeMap(lossesByType)), 
    Object.keys(overbuildsByType).length && (store.obt = cloneByTypeMap(overbuildsByType)), 
    store.updated = Date.now(), storeDirty = !0;
  } catch (e) {}
}

function flushNow(reason) {
  try {
    return captureTurn(reason || "flush", !0);
  } catch (e) {
    return null;
  }
}

function nowMs() {
  try {
    if ("undefined" != typeof performance && "function" == typeof performance.now) return performance.now();
  } catch (e) {}
  return Date.now();
}

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

function captureTurn(reason, force) {
  if (!store || !container) return null;
  const age = currentAge(), ageKey = age.key, turn = Game.turn;
  if (null == turn) return null;
  const dedup = ageKey + ":" + turn;
  if (!force && dedup === lastCaptureKey) return null;
  lastCaptureKey = dedup;
  const t0 = nowMs();
  let mark = t0;
  const phases = {}, lap = name => {
    const n = nowMs();
    phases[name] = Math.round(n - mark), mark = n;
  }, bucket = store.ages[ageKey] || (store.ages[ageKey] = {
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
  lap("meta");
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
  }(turn);
  lap("summary");
  const relSnap = function() {
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
  lap("religion"), (Object.keys(kills).length || Object.keys(losses).length) && Object.keys(overbuilds).length || seedKillCounters();
  const prevPlayers = bucket.turns[turn] && bucket.turns[turn].p ? bucket.turns[turn].p : null, players = {};
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
  const needPids = eventCounterPids();
  for (const pid in needPids) if (isMajorPid(pid) && null == players[pid]) if (prevPlayers && prevPlayers[pid]) {
    const copy = {};
    for (const k in prevPlayers[pid]) copy[k] = prevPlayers[pid][k];
    players[pid] = copy;
  } else players[pid] = {};
  applyKillCounts(players), applyOverbuildCounts(players), applySettlementEventCounts(players), 
  lap("players");
  try {
    seedUnitTypeCacheFromMap();
  } catch (e) {}
  const bt = function() {
    const out = {
      [STOCK_IDS.units]: {},
      [STOCK_IDS.buildings]: {},
      [STOCK_IDS.improvements]: {},
      [STOCK_IDS.districts]: {},
      [STOCK_IDS.wonders]: {}
    };
    try {
      for (const p of Players.getAlive()) {
        if (!p || !p.isMajor) continue;
        const pid = String(p.id), units = out[STOCK_IDS.units][pid] || (out[STOCK_IDS.units][pid] = {}), bld = out[STOCK_IDS.buildings][pid] || (out[STOCK_IDS.buildings][pid] = {}), imp = out[STOCK_IDS.improvements][pid] || (out[STOCK_IDS.improvements][pid] = {}), dist = out[STOCK_IDS.districts][pid] || (out[STOCK_IDS.districts][pid] = {}), won = out[STOCK_IDS.wonders][pid] || (out[STOCK_IDS.wonders][pid] = {});
        try {
          const pu = p.Units, ids = pu && ("function" == typeof pu.getUnitIds ? pu.getUnitIds() : "function" == typeof pu.getUnits ? pu.getUnits() : null);
          if (ids) for (const uid of ids) try {
            const u = "undefined" != typeof Units && Units.get ? Units.get(uid) : null;
            if (!u) continue;
            const un = unitTypeName(u.type);
            if (un) {
              inc(units, un);
              try {
                let cid = null;
                if (null != uid && "object" == typeof uid && null != uid.id) cid = uid; else {
                  const owner = null != u.owner ? u.owner : p.id, id = null != u.id && "object" != typeof u.id ? u.id : uid;
                  null != owner && null != id && (cid = {
                    owner: owner,
                    id: id
                  });
                }
                cid && rememberUnitType(cid, u.type);
              } catch (e2) {}
            }
          } catch (e) {}
        } catch (e) {}
        try {
          if (!p.Cities || "function" != typeof p.Cities.getCities) continue;
          for (const c of p.Cities.getCities() || []) {
            try {
              if (c.Constructibles && "function" == typeof c.Constructibles.getIds) for (const cid of c.Constructibles.getIds() || []) try {
                const inst = "undefined" != typeof Constructibles && Constructibles.getByComponentID ? Constructibles.getByComponentID(cid) : null;
                if (!inst) continue;
                if (!1 === inst.complete) continue;
                if (null != inst.percentComplete && inst.percentComplete < 100) continue;
                const meta = constructibleTypeName(inst.type);
                if (!meta || !meta.type) continue;
                "BUILDING" === meta.cls ? inc(bld, meta.type) : "IMPROVEMENT" === meta.cls ? inc(imp, meta.type) : "WONDER" === meta.cls && inc(won, meta.type);
              } catch (e) {}
            } catch (e) {}
            try {
              if (c.Districts && "function" == typeof c.Districts.getIds) for (const did of c.Districts.getIds() || []) try {
                const d = "undefined" != typeof Districts && Districts.get ? Districts.get(did) : null;
                if (!d) continue;
                const dn = districtTypeName(null != d.type ? d.type : d.districtType);
                dn && inc(dist, dn);
              } catch (e) {}
            } catch (e) {}
          }
        } catch (e) {}
        Object.keys(units).length || delete out[STOCK_IDS.units][pid], Object.keys(bld).length || delete out[STOCK_IDS.buildings][pid], 
        Object.keys(imp).length || delete out[STOCK_IDS.improvements][pid], Object.keys(dist).length || delete out[STOCK_IDS.districts][pid], 
        Object.keys(won).length || delete out[STOCK_IDS.wonders][pid];
      }
    } catch (e) {}
    for (const id of Object.keys(out)) Object.keys(out[id]).length || delete out[id];
    return out;
  }();
  Object.keys(bt).length && (bucket.bt = bt), function(players, bt) {
    if (!players || !bt) return;
    const bRoot = bt[STOCK_IDS.buildings] || {}, iRoot = bt[STOCK_IDS.improvements] || {};
    for (const pid in players) {
      const sp = String(pid), bn = sumTypeCounts(bRoot[sp] || bRoot[pid]), inn = sumTypeCounts(iRoot[sp] || iRoot[pid]);
      null != bn && (players[pid].bld = bn), null != inn && (players[pid].imp = inn);
    }
  }(players, bt), lap("stock");
  const turnRow = {
    t: turn,
    p: players
  };
  Object.keys(rel).length && (turnRow.rel = rel), bucket.turns[turn] = turnRow, Object.keys(killsByType).length && (store.kbt = cloneByTypeMap(killsByType)), 
  Object.keys(lossesByType).length && (store.lbt = cloneByTypeMap(lossesByType)), 
  Object.keys(overbuildsByType).length && (store.obt = cloneByTypeMap(overbuildsByType));
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
  ss.length && (store.ss = ss);
  try {
    !function() {
      let turn = null;
      try {
        turn = Game.turn;
      } catch (e) {
        return;
      }
      if (null != turn) for (const k of Object.keys(pendingOverbuildRemovals)) {
        const p = pendingOverbuildRemovals[k];
        p && null != p.turn && p.turn < turn - 1 && delete pendingOverbuildRemovals[k];
      }
    }();
  } catch (e) {}
  try {
    store._rzPend && delete store._rzPend, store._rzFrom && delete store._rzFrom;
  } catch (e) {}
  store.updated = Date.now(), lap("settlements"), saveContainer(container, guid), 
  storeDirty = !1, lap("save");
  try {
    recordOutcome("capture");
  } catch (e) {}
  lap("outcome");
  const totalMs = Math.round(nowMs() - t0);
  if (force || totalMs >= 50) {
    err(`capture ${reason || "?"} force=${force ? 1 : 0} total=${totalMs}ms ${Object.keys(phases).map(k => k + "=" + phases[k]).join(" ")}`);
  }
  return {
    totalMs: totalMs,
    phases: phases
  };
}

function maybeCapture(reason) {
  captureTurn(reason, !1);
}

function init() {
  const resolved = resolveGameId();
  guid = resolved.id, container = function() {
    const r = loadShared();
    return bootNotes = r.notes, r.container;
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
  err(`loaded. game=${guid} age=${age.key}${age.label ? " (" + age.label + ")" : ""} restored ${function(store) {
    let n = 0;
    for (const k in store.ages) {
      const t = store.ages[k].turns;
      t && (n += Object.keys(t).length);
    }
    return n;
  }(store)} prior rows across ${Object.keys(store.ages).length} ages; container has ${Object.keys(container.games).length} game(s), ${containerBytes(container)} B; storage: ${bootNotes.join(", ")}`), 
  seedKillCounters();
  try {
    installOverbuildHandlers();
  } catch (e) {
    err(`overbuild install threw: ${e && e.message}`);
  }
  try {
    installSettlementEventHandlers();
  } catch (e) {
    err(`settlement events install threw: ${e && e.message}`);
  }
  try {
    installUnitTypeCacheHandlers();
  } catch (e) {
    err(`unit-type cache install threw: ${e && e.message}`);
  }
  try {
    !function() {
      try {
        engine.on("PlayerTurnDeactivated", () => {
          try {
            flushNow("PlayerTurnDeactivated");
          } catch (e) {}
        });
      } catch (e) {
        err(`PlayerTurnDeactivated subscribe failed: ${e && e.message}`);
      }
    }();
  } catch (e) {
    err(`deactivate install threw: ${e && e.message}`);
  }
  try {
    !function() {
      const api = {
        flushNow: reason => flushNow(reason || "api"),
        isDirty: () => !!storeDirty
      };
      try {
        globalThis.ozqChronicleLog = api;
      } catch (e) {}
      try {
        "undefined" != typeof window && (window.ozqChronicleLog = api);
      } catch (e) {}
    }();
  } catch (e) {}
  try {
    seedUnitTypeCacheFromMap();
  } catch (e) {}
  try {
    maybeCapture("load");
  } catch (e) {}
  try {
    engine.on("PlayerTurnActivated", () => {
      try {
        maybeCapture("PlayerTurnActivated");
      } catch (e) {}
    });
  } catch (e) {}
  try {
    engine.on("UnitKilledInCombat", data => {
      try {
        !function(data) {
          if (!data) return;
          const victim = ownerOf(data.unitKilled), killer = ownerOf(data.unitKiller);
          null != killer && (kills[killer] = (kills[killer] || 0) + 1), null != victim && (losses[victim] = (losses[victim] || 0) + 1);
          try {
            const kType = unitTypeFromCid(data.unitKiller), vType = unitTypeFromCid(data.unitKilled);
            null != killer && kType && bumpByType(killsByType, killer, kType), null != victim && vType && bumpByType(lossesByType, victim, vType);
            const vk = cidKey(data.unitKilled);
            vk && delete unitTypeByCid[vk];
          } catch (e) {}
          stampEventCounters();
        }(data);
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

try {
  const r = loadShared();
  saveShared(r.shared, r.container), err(`boot migration: ${r.notes.join(", ")}; ${Object.keys(r.container.games).length} game(s) in container`);
} catch (e) {
  err(`boot migration threw: ${e}`);
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
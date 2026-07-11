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
} ], SUMMARY_PLAYER_IDS = [ "TechsAcquired" ], SUMMARY_CITY_IDS = [ "Population", "Tourism" ];

let nodeListCache = {};

function countCompletedNodes(pid, ageType, system) {
  if ("undefined" == typeof Game || !Game.ProgressionTrees || "function" != typeof Game.ProgressionTrees.getNodeState || "undefined" == typeof ProgressionTreeNodeState) return null;
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
    for (const nt of nodes) Game.ProgressionTrees.getNodeState(pid, nt) === ProgressionTreeNodeState.NODE_STATE_FULLY_UNLOCKED && n++;
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
  return fp.setup && seedOk ? chosen = `${fp.setup}#${fp.seed}` : seedOk ? chosen = `seed:${fp.seed}` : fp.setup && (chosen = fp.setup), 
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

function lastY(ds) {
  return ds && ds.values && ds.values.length ? ds.values[ds.values.length - 1].y : null;
}

function storeKey(guid) {
  return "chronicle:v1:" + guid;
}

function emsg(e) {
  return e && e.message ? e.message : e;
}

function migrateStore(o) {
  return o && "object" == typeof o ? (o.ages || (o.ages = {}), o.v = 1, o) : o;
}

function scanChronicleStores() {
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
}

function evictOldestStore(exceptKey) {
  const stores = scanChronicleStores().filter(s => s.key !== exceptKey);
  if (!stores.length) return !1;
  stores.sort((a, b) => (a.store.updated || 0) - (b.store.updated || 0));
  try {
    return localStorage.removeItem(stores[0].key), err(`evicted oldest store ${stores[0].key} (quota)`), 
    !0;
  } catch (e) {
    return !1;
  }
}

function saveStore(store) {
  store.updated = Date.now();
  const key = storeKey(store.guid), payload = JSON.stringify(store);
  for (let attempt = 0; attempt < 8; attempt++) try {
    return localStorage.setItem(key, payload), localStorage.setItem("chronicle:v1:current", store.guid), 
    !0;
  } catch (e) {
    if (!evictOldestStore(key)) return err("save failed (quota, nothing to evict): " + emsg(e)), 
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

function byteLen(store) {
  try {
    return JSON.stringify(store).length;
  } catch (e) {
    return -1;
  }
}

let store = null, guid = "nogid", lastCaptureKey = null;

function maybeCapture(reason) {
  if (!store) return;
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
  const players = {};
  for (const p of Players.getAlive()) {
    if (!p || !p.isMajor) continue;
    const s = snapshotPlayer(p), civics = countCompletedNodes(p.id, age.label, "SYSTEM_CULTURE");
    null != civics && (s.CivicsAcquired = civics), players[p.id] = s;
  }
  !function(players) {
    let any = !1;
    try {
      if ("undefined" == typeof Game || !Game.Summary) return !1;
      const objectMap = new Map;
      Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
      for (const id of SUMMARY_PLAYER_IDS) try {
        for (const ds of Game.Summary.getDataSets(id)) {
          const o = null != ds.owner ? objectMap.get(ds.owner) : null;
          if (o && "Player" === o.type && players[o.ownerPlayer]) {
            const y = lastY(ds);
            null != y && (players[o.ownerPlayer][id] = round1(y), any = !0);
          }
        }
      } catch (e) {}
      for (const id of SUMMARY_CITY_IDS) {
        const sums = {};
        try {
          for (const ds of Game.Summary.getDataSets(id)) {
            const o = null != ds.owner ? objectMap.get(ds.owner) : null;
            if (o && "City" === o.type && null != o.ownerPlayer) {
              const y = lastY(ds);
              null != y && (sums[o.ownerPlayer] = (sums[o.ownerPlayer] || 0) + y);
            }
          }
        } catch (e) {}
        for (const pid in sums) players[pid] && (players[pid][id] = round1(sums[pid]), any = !0);
      }
    } catch (e) {}
  }(players);
  bucket.turns[turn] = {
    t: turn,
    p: players
  }, saveStore(store);
}

function init() {
  const resolved = resolveGameId();
  guid = resolved.id, store = function(newKey, fp) {
    const adopt = (o, why) => {
      o.guid = newKey, o.fp = fp;
      const m = migrateStore(o);
      return why && (err(`adopted ${why} → ${newKey}: ${countRows(m)} rows across ${Object.keys(m.ages).length} ages`), 
      saveStore(m)), m;
    };
    try {
      const raw = localStorage.getItem(storeKey(newKey));
      if (raw) {
        const o = JSON.parse(raw);
        if (o && o.ages && o.fp && fp && o.fp.seed === fp.seed) return o.guid = newKey, 
        o.fp = fp, migrateStore(o);
      }
    } catch (e) {
      err("load parse failed: " + emsg(e));
    }
    if (fp && null != fp.seed) for (const s of scanChronicleStores()) if (s.key !== storeKey(newKey) && s.store.fp && s.store.fp.seed === fp.seed) return adopt(s.store, `relocated store ${s.key}`);
    if (fp && fp.setup) try {
      const raw = localStorage.getItem(storeKey(fp.setup));
      if (raw) {
        const o = JSON.parse(raw);
        if (o && o.ages && !o.fp) return adopt(o, `legacy setup=${fp.setup} store`);
      }
    } catch (e) {}
    return migrateStore({
      v: 1,
      guid: newKey,
      fp: fp,
      created: Date.now(),
      updated: 0,
      ages: {}
    });
  }(guid, resolved.fp);
  const age = currentAge();
  err(`loaded. game=${guid} age=${age.key}${age.label ? " (" + age.label + ")" : ""} restored ${countRows(store)} prior rows across ${Object.keys(store.ages).length} ages (${byteLen(store)} B)`);
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
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
  return s;
}

function lastY(ds) {
  return ds && ds.values && ds.values.length ? ds.values[ds.values.length - 1].y : null;
}

function storeKey(guid) {
  return "chronicle:v1:" + guid;
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
  }, function(store) {
    try {
      return store.updated = Date.now(), localStorage.setItem(storeKey(store.guid), JSON.stringify(store)), 
      localStorage.setItem("chronicle:v1:current", store.guid), !0;
    } catch (e) {
      return err("save failed: " + (e && e.message ? e.message : e)), !1;
    }
  }(store);
}

function init() {
  const resolved = function() {
    let diag = "", chosen = "nogid";
    try {
      const g = Configuration.getGame(), cands = g ? {
        campaignSetupGUID: g.campaignSetupGUID,
        gameGUIDHexString: g.gameGUIDHexString,
        gameSeed: g.gameSeed
      } : {};
      diag = Object.keys(cands).map(k => `${k}=${JSON.stringify(cands[k])}`).join(" ");
      for (const k of [ "campaignSetupGUID", "gameGUIDHexString", "gameSeed" ]) {
        const v = cands[k];
        if (null != v && String(v).length && "0" !== String(v)) {
          chosen = String(v);
          break;
        }
      }
    } catch (e) {}
    return {
      id: chosen,
      diag: diag
    };
  }();
  guid = resolved.id, store = function(guid) {
    try {
      const raw = localStorage.getItem(storeKey(guid));
      if (raw) {
        const o = JSON.parse(raw);
        if (o && o.ages) return o.guid = guid, o;
      }
    } catch (e) {
      err("load parse failed: " + (e && e.message ? e.message : e));
    }
    return {
      v: 1,
      guid: guid,
      created: Date.now(),
      updated: 0,
      ages: {}
    };
  }(guid);
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
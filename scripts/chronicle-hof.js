globalThis.ozqChronicleCommon || console.error("[ozq-chronicle] chronicle-common.js did not load before this script — check the UIScripts order in ozq-chronicle.modinfo");

const {chronicleI18n: chronicleI18n, L: L, typeDisplayName: typeDisplayName, resolveTypeNameOrNull: resolveTypeNameOrNull, PANEL_BOX: PANEL_BOX, HEADER_BOX: HEADER_BOX, TITLE_COL_ROW: TITLE_COL_ROW, TITLE_TEXT: TITLE_TEXT, HEADER_ACTIONS: HEADER_ACTIONS, makeNativeButton: makeNativeButton, highlightButton: highlightButton, makeSettingsButton: makeSettingsButton, CANCEL_ACTIONS: CANCEL_ACTIONS, isPressFinished: isPressFinished, installFrontInputHandler: installFrontInputHandler, scheduleInstall: scheduleInstall, noteOverlayOpened: noteOverlayOpened, isTopOverlay: isTopOverlay, forgetOverlay: forgetOverlay, loadShared: loadShared, saveShared: saveShared, resolveHotkeyCode: resolveHotkeyCode, isWatchedEngineAction: isWatchedEngineAction, engineCodesForAction: engineCodesForAction, isEngineBoundHotkeyCode: isEngineBoundHotkeyCode, refreshEngineKeyMap: refreshEngineKeyMap, hotkeySlotForCode: hotkeySlotForCode, EAT_WORLD_ENGINE_ACTIONS: EAT_WORLD_ENGINE_ACTIONS, stopKeydownPeers: stopKeydownPeers, readHotkeys: readHotkeys} = globalThis.ozqChronicleCommon, OVERLAY_ID = "ozq-chronicle-hof-overlay", IS_GAME = "undefined" != typeof Game;

function err(msg) {
  try {
    console.error(`[ozq-hof] ${msg}`);
  } catch (e) {}
}

function typeNameOrUnknown(t) {
  return null == t || "" === t ? L("LOC_HOF_UNKNOWN") : typeDisplayName(t) || L("LOC_HOF_UNKNOWN");
}

function resolveName(table, type) {
  return resolveTypeNameOrNull(table, type) || typeNameOrUnknown(type);
}

function leaderName(type) {
  return resolveName("Leaders", type);
}

function civName(type) {
  return resolveName("Civilizations", type);
}

function fmtDate(ms) {
  const api = chronicleI18n();
  if (api && "function" == typeof api.formatDate) return api.formatDate(ms);
  if (!ms) return "";
  try {
    const d = new Date(ms);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString(void 0, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch (e) {
    return "";
  }
}

try {
  const r = loadShared();
  saveShared(r.shared, r.container), err(`boot migration (${IS_GAME ? "game" : "shell"}): ${r.notes.join(", ")}; ${Object.keys(r.container.games).length} game(s) in container`);
} catch (e) {
  err(`boot migration threw: ${e}`);
}

function agesOrdered(store) {
  return store && store.ages ? Object.keys(store.ages).map(k => {
    const a = store.ages[k];
    return {
      key: k,
      ci: null != a.ci ? a.ci : 999,
      label: a.label || k,
      turns: a.turns || {},
      civ: a.civ || {},
      bt: a.bt
    };
  }).sort((a, b) => a.ci - b.ci) : [];
}

function countTurns(store) {
  let n = 0;
  for (const a of agesOrdered(store)) n += Object.keys(a.turns).length;
  return n;
}

function lastValue(store, pid, key) {
  const ages = agesOrdered(store);
  for (let i = ages.length - 1; i >= 0; i--) {
    const ts = Object.keys(ages[i].turns).map(Number).sort((a, b) => b - a);
    for (const t of ts) {
      const row = ages[i].turns[t], p = row && row.p && row.p[pid];
      if (p && null != p[key]) return p[key];
    }
  }
  return null;
}

function victoryClassLabel(cls) {
  return cls ? typeNameOrUnknown(cls) : "";
}

function ageName(labelOrKey) {
  return null == labelOrKey || "" === labelOrKey ? "" : typeNameOrUnknown(labelOrKey);
}

function turnsLabel(g) {
  const m = function(g) {
    let turn = g.lastTurn, age = g.lastAgeLabel;
    if (g.result && (null != g.result.turn && (turn = g.result.turn), null != g.result.ageKey && g.store && g.store.ages)) {
      const a = g.store.ages[g.result.ageKey];
      age = a && a.label ? a.label : g.result.ageKey;
    }
    return {
      turn: turn,
      age: age
    };
  }(g);
  if (null == m.turn) return "";
  const a = ageName(m.age);
  return a ? L("LOC_CHRONICLE_AGE_TURN", a, m.turn) : L("LOC_CHRONICLE_HOF_N_TURNS", m.turn);
}

function speedLabel(g) {
  const t = turnsLabel(g);
  return g.totalTurns > 0 ? t ? L("LOC_CHRONICLE_HOF_SPEED", g.totalTurns, t) : L("LOC_CHRONICLE_HOF_N_TURNS", g.totalTurns) : t;
}

function summarizeGame(id, store) {
  const meta = store.meta || {}, pid = function(store) {
    if (store.meta && null != store.meta.local) return store.meta.local;
    if (store.meta && store.meta.players) {
      const ids = Object.keys(store.meta.players);
      if (ids.length) return Number(ids[0]);
    }
    for (const a of agesOrdered(store)) for (const t of Object.keys(a.turns)) {
      const p = a.turns[t].p;
      if (p) {
        const k = Object.keys(p)[0];
        if (null != k) return Number(k);
      }
    }
    return 0;
  }(store), players = meta.players || {}, leader = (players[pid] || players[String(pid)] || {}).leader || null, ages = agesOrdered(store), civs = [];
  for (const a of ages) {
    const c = null != a.civ[pid] ? a.civ[pid] : a.civ[String(pid)];
    c && civs.push({
      ageLabel: a.label,
      civ: c
    });
  }
  const primaryCiv = civs.length ? civs[civs.length - 1].civ : null, lt = function(store) {
    const ages = agesOrdered(store);
    for (let i = ages.length - 1; i >= 0; i--) {
      const ts = Object.keys(ages[i].turns).map(Number).sort((a, b) => a - b);
      if (ts.length) return {
        turn: ts[ts.length - 1],
        ageLabel: ages[i].label,
        ageKey: ages[i].key
      };
    }
    return {
      turn: null,
      ageLabel: "",
      ageKey: ""
    };
  }(store), result = meta.result || null, score = lastValue(store, pid, "score"), peakSet = function(store, pid, key) {
    let max = null;
    for (const a of agesOrdered(store)) for (const t of Object.keys(a.turns)) {
      const p = a.turns[t].p && a.turns[t].p[pid];
      p && null != p[key] && (null == max || p[key] > max) && (max = p[key]);
    }
    return max;
  }(store, pid, "set"), uKill = lastValue(store, pid, "uKill");
  let outcome = "in-progress";
  result && (!0 === result.localWon ? outcome = "victory" : (!0 === result.localDefeated || !1 === result.localWon || null != result.victorTeam) && (outcome = "defeat"));
  let totalTurns = 0;
  for (const a of ages) {
    const ts = Object.keys(a.turns).map(Number);
    ts.length && (totalTurns += Math.max.apply(null, ts));
  }
  return {
    id: id,
    store: store,
    pid: pid,
    leader: leader,
    primaryCiv: primaryCiv,
    civs: civs,
    diff: meta.diff || null,
    mapSize: meta.mapSize || null,
    startAge: meta.startAge || null,
    lastTurn: lt.turn,
    lastAgeLabel: lt.ageLabel,
    totalTurns: totalTurns,
    turnCount: countTurns(store),
    score: null != score ? score : null,
    peakSettlements: peakSet,
    unitsKilled: uKill,
    result: result,
    outcome: outcome,
    updated: store.updated || meta.updated || 0,
    created: store.created || 0
  };
}

function isHofEligible(g) {
  return !!(g && g.leader && g.primaryCiv);
}

function allGames() {
  const c = function() {
    try {
      const c = loadShared().container;
      if (c && Object.keys(c.games).length) return c;
    } catch (e) {}
    return null;
  }();
  if (!c || !c.games) return [];
  const out = [];
  for (const id in c.games) {
    const g = c.games[id];
    if (!g || !g.ages) continue;
    const s = summarizeGame(id, g);
    isHofEligible(s) && out.push(s);
  }
  return out.sort((a, b) => (b.updated || 0) - (a.updated || 0)), out;
}

function isDecided(g) {
  return "victory" === g.outcome || "defeat" === g.outcome;
}

function progressLine(r) {
  const parts = [];
  return parts.push(1 === r.played ? L("LOC_CHRONICLE_HOF_PLAYED_ONE") : L("LOC_CHRONICLE_HOF_PLAYED_N", r.played)), 
  r.decided > 0 && parts.push(L("LOC_CHRONICLE_HOF_WON_OUT_OF", r.won, r.decided)), 
  null != r.bestScore && parts.push(L("LOC_CHRONICLE_HOF_BEST_SCORE", Math.round(r.bestScore))), 
  parts.join("  ·  ");
}

function el(tag, style, text, className) {
  const n = document.createElement(tag);
  return className && (n.className = className), style && n.setAttribute("style", style), 
  null != text && (n.textContent = text), n;
}

function gameTitle(g) {
  const parts = [];
  return g.leader && parts.push(leaderName(g.leader)), g.primaryCiv && parts.push(civName(g.primaryCiv)), 
  parts.length || parts.push(g.id), parts.join(" · ");
}

function outcomeText(g) {
  if ("victory" === g.outcome) {
    const cls = g.result && g.result.victoryClass ? " (" + victoryClassLabel(g.result.victoryClass) + ")" : "";
    return L("LOC_HOF_VICTORY") + cls;
  }
  if ("defeat" === g.outcome) {
    const cls = g.result && g.result.victoryClass ? " (" + victoryClassLabel(g.result.victoryClass) + ")" : "";
    return L("LOC_HOF_DEFEAT") + cls;
  }
  return g.result && null != g.result.victorTeam ? L("LOC_HOF_NOBODY_WON") : L("LOC_CHRONICLE_HOF_IN_PROGRESS");
}

function outcomeColor(g) {
  return "victory" === g.outcome ? "#6BCB77" : "defeat" === g.outcome ? "#D96B6B" : "#B7A987";
}

const VICTORY_BADGE_BLP = {
  VICTORY_CLASS_SCIENCE: "blp:endScreen_icon_scientific.png",
  VICTORY_CLASS_MILITARY: "blp:endScreen_icon_military.png",
  VICTORY_CLASS_CULTURE: "blp:endScreen_icon_cultural.png",
  VICTORY_CLASS_ECONOMIC: "blp:endScreen_icon_economic.png"
}, VICTORY_ICON_FALLBACK = {
  VICTORY_CLASS_SCIENCE: "fs://game/leg_pro_sci_victory_icon.png",
  VICTORY_CLASS_MILITARY: "fs://game/leg_pro_mil_victory_icon.png",
  VICTORY_CLASS_CULTURE: "fs://game/leg_pro_cul_victory_icon.png",
  VICTORY_CLASS_ECONOMIC: "fs://game/leg_pro_eco_victory_icon.png"
};

function uiIconCss(id, context) {
  if (null == id || "" === id) return "";
  try {
    if ("undefined" != typeof UI) {
      if ("function" == typeof UI.getIconCSS) {
        const css = null != context && "" !== context ? UI.getIconCSS(id, context) : UI.getIconCSS(id);
        if (css && "url('')" !== css && 'url("")' !== css && "none" !== css) return css;
      }
      if ("function" == typeof UI.getIconURL) {
        const url = null != context && "" !== context ? UI.getIconURL(id, context) : UI.getIconURL(id);
        if (url && String(url).indexOf("unknown") < 0) return "url('" + url + "')";
      }
    }
  } catch (e) {}
  return "";
}

function victoryIconResolved(cls) {
  if (!cls) return {
    css: "",
    source: ""
  };
  const badge = uiIconCss(cls, "BADGE");
  if (badge) return {
    css: badge,
    source: "BADGE"
  };
  if (VICTORY_BADGE_BLP[cls]) return {
    css: "url('" + VICTORY_BADGE_BLP[cls] + "')",
    source: "blp-badge"
  };
  if (VICTORY_ICON_FALLBACK[cls]) return {
    css: "url('" + VICTORY_ICON_FALLBACK[cls] + "')",
    source: "victory-icon"
  };
  const laurel = uiIconCss(cls);
  return laurel ? {
    css: laurel,
    source: "laurel"
  } : {
    css: "",
    source: ""
  };
}

function makeIcon(css, size, extraStyle, bgSize) {
  const d = el("div", "width:" + size + "px;height:" + size + "px;flex-shrink:0;background-position:center;background-repeat:no-repeat;background-size:" + (bgSize || "contain") + ";" + (extraStyle || ""));
  return css && (d.style.backgroundImage = css), d;
}

function makeLeaderPortrait(leaderType, size) {
  const wrap = el("div", "width:" + (size = size || 112) + "px;height:" + size + "px;flex-shrink:0;border-radius:" + Math.round(size / 2) + "px;overflow:hidden;background:#2A241C;border:2px solid #6B5842;box-sizing:border-box;background-position:center;background-repeat:no-repeat;background-size:cover"), css = function(leaderType) {
    return leaderType && (uiIconCss(leaderType, "CIRCLE_MASK") || uiIconCss(leaderType)) || "";
  }(leaderType);
  if (css) wrap.style.backgroundImage = css; else {
    wrap.style.display = "flex", wrap.style.alignItems = "center", wrap.style.justifyContent = "center";
    const name = leaderType ? leaderName(leaderType) : "?";
    wrap.appendChild(el("div", "color:#B7A987;font-size:" + Math.max(12, Math.round(.38 * size)) + "px;font-weight:600", (name || "?").charAt(0).toUpperCase()));
  }
  return wrap;
}

function makeCivSymbol(civType, size) {
  const wrap = el("div", "width:" + (size = size || 104) + "px;height:" + size + "px;flex-shrink:0;background:#2A241C;border:1px solid #6B5842;box-sizing:border-box;display:flex;align-items:center;justify-content:center"), css = function(civType) {
    if (!civType) return "";
    const viaUi = uiIconCss(civType) || uiIconCss(civType, "DEFAULT");
    if (viaUi) return viaUi;
    const name = String(civType).replace(/^CIVILIZATION_/, "").toLowerCase();
    return name && "unknown" !== name ? "url('blp:civ_sym_" + name + "')" : "";
  }(civType);
  if (css) wrap.appendChild(makeIcon(css, Math.round(.72 * size), "")); else {
    const name = civType ? civName(civType) : "?";
    wrap.appendChild(el("div", "color:#B7A987;font-size:" + Math.max(11, Math.round(.36 * size)) + "px;font-weight:600", (name || "?").charAt(0).toUpperCase()));
  }
  return wrap;
}

function makeVictoryBadge(cls, size) {
  size = size || 112;
  const resolved = victoryIconResolved(cls);
  if (!resolved.css) return null;
  const zoom = "laurel" === resolved.source ? "165%" : "contain";
  return makeIcon(resolved.css, size, "", zoom);
}

function makeWinBar(won, decided, widthPx) {
  const track = el("div", "height:10px;width:" + (widthPx = widthPx || 162) + "px;background:#2A241C;border:1px solid #4A3F32;box-sizing:border-box;overflow:hidden;flex-shrink:0");
  if (decided > 0 && won > 0) {
    const pct = Math.max(2, Math.round(100 * won / decided));
    track.appendChild(el("div", "height:100%;width:" + pct + "%;background:#6BCB77"));
  }
  return track;
}

function makeCard(opts) {
  const card = el("div", "display:flex;align-items:center;background:#1E1A14;border:1px solid #4A3F32;padding:" + ((opts = opts || {}).pad || "19px 23px") + ";box-sizing:border-box" + (opts.clickable ? ";cursor:pointer" : ""));
  return opts.clickable && opts.onClick && (card.addEventListener("click", opts.onClick), 
  card.addEventListener("mouseenter", () => {
    card.style.borderColor = "#8A6F4A", card.style.background = "#241F17";
  }), card.addEventListener("mouseleave", () => {
    card.style.borderColor = "#4A3F32", card.style.background = "#1E1A14";
  })), card;
}

function sectionTitle(text) {
  return el("div", "color:#F0E6D2;font-size:1.53rem;margin-bottom:16px;letter-spacing:0.04em;text-transform:uppercase", text);
}

function destroyHofDom() {
  document.getElementById(OVERLAY_ID)?.remove(), forgetOverlay(OVERLAY_ID), activeHofNav = null;
}

function closeHof() {
  destroyHofDom();
}

let activeHofNav = null;

const hofInputHandler = {
  handleInput(e) {
    const d = e && e.detail || {};
    if (!isTopOverlay(OVERLAY_ID)) return !0;
    if (!d.name) return !0;
    if (isWatchedEngineAction(d.name)) {
      const codes = engineCodesForAction(d.name);
      if (isPressFinished(e)) {
        const hk = readHotkeys();
        let slot = null;
        for (let i = 0; i < codes.length && (slot = hotkeySlotForCode(hk, codes[i]), !slot); i++) ;
        "openHof" === slot ? closeHof() : "openOptions" === slot && activeHofNav ? activeHofNav.openOptions() : "catPrev" === slot && activeHofNav ? activeHofNav.stepTab(-1) : "catNext" === slot && activeHofNav && activeHofNav.stepTab(1);
      }
      return !1;
    }
    return !(EAT_WORLD_ENGINE_ACTIONS.indexOf(d.name) >= 0) && (CANCEL_ACTIONS.indexOf(d.name) < 0 || (isPressFinished(e) && closeHof(), 
    !1));
  },
  handleNavigation: () => !0
};

function onHofKeydown(e) {
  if (!isTopOverlay(OVERLAY_ID) || !activeHofNav) return;
  if (e.repeat) return;
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  const code = resolveHotkeyCode(e);
  if (!code) return;
  if (isEngineBoundHotkeyCode(code)) return;
  const hk = readHotkeys();
  let handled = !1;
  if (code === hk.catPrev) handled = !!activeHofNav.stepTab(-1); else if (code === hk.catNext) handled = !!activeHofNav.stepTab(1); else if (code === hk.openHof) closeHof(), 
  handled = !0; else if (code === hk.openOptions) handled = !!activeHofNav.openOptions(); else if (0 === code.indexOf("Digit") || 0 === code.indexOf("NumPad") || 0 === code.indexOf("Numpad")) {
    const n = Number(code.replace("Digit", "").replace("NumPad", "").replace("Numpad", ""));
    n >= 1 && n <= 5 && (handled = !!activeHofNav.jumpTab(n - 1));
  }
  handled && stopKeydownPeers(e);
}

function renderEntityGrid(body, rows, opts) {
  if (!rows.length) return void body.appendChild(el("div", "color:#C9BFA6;text-align:center;padding:3rem;font-size:1.78rem", opts.emptyMsg));
  const grid = el("div", "display:flex;flex-wrap:wrap;align-content:flex-start");
  for (const r of rows) {
    const card = makeCard({
      pad: "23px 26px"
    });
    card.style.margin = "0 19px 19px 0", card.style.flex = "1 1 26rem", card.style.minWidth = "24rem", 
    card.style.maxWidth = "39rem", "leader" === opts.kind ? card.appendChild(makeLeaderPortrait(r.leader, 112)) : card.appendChild(makeCivSymbol(r.civ, 104));
    const mid = el("div", "display:flex;flex-direction:column;min-width:0;flex:1 1 auto;margin:0 0 0 23px");
    if (mid.appendChild(el("div", "color:#F0E6D2;font-size:1.75rem;margin-bottom:6px", "leader" === opts.kind ? leaderName(r.leader) : civName(r.civ))), 
    mid.appendChild(el("div", "color:#B7A987;font-size:1.38rem;margin-bottom:13px", progressLine(r))), 
    mid.appendChild(makeWinBar(r.won, r.decided, 227)), r.decided > 0) {
      const pct = Math.round(100 * r.won / r.decided);
      mid.appendChild(el("div", "color:#8A7F63;font-size:1.22rem;margin-top:6px", L("LOC_CHRONICLE_HOF_PCT_FINISHED", pct)));
    }
    card.appendChild(mid), grid.appendChild(card);
  }
  body.appendChild(grid);
}

function renderLeaders(body, games) {
  renderEntityGrid(body, function(games) {
    const map = new Map;
    for (const g of games) {
      if (!g.leader) continue;
      const key = g.leader;
      let r = map.get(key);
      r || (r = {
        leader: g.leader,
        played: 0,
        decided: 0,
        won: 0,
        bestScore: null,
        last: g
      }, map.set(key, r)), r.played++, isDecided(g) && (r.decided++, "victory" === g.outcome && r.won++), 
      null != g.score && (null == r.bestScore || g.score > r.bestScore) && (r.bestScore = g.score), 
      (g.updated || 0) >= (r.last.updated || 0) && (r.last = g);
    }
    return [ ...map.values() ].sort((a, b) => b.played - a.played || b.won - a.won);
  }(games), {
    kind: "leader",
    emptyMsg: L("LOC_CHRONICLE_HOF_NO_LEADERS")
  });
}

function renderCivs(body, games) {
  renderEntityGrid(body, function(games) {
    const map = new Map;
    for (const g of games) {
      const seen = new Set;
      for (const c of g.civs) {
        if (!c.civ || seen.has(c.civ)) continue;
        seen.add(c.civ);
        let r = map.get(c.civ);
        r || (r = {
          civ: c.civ,
          played: 0,
          decided: 0,
          won: 0
        }, map.set(c.civ, r)), r.played++, isDecided(g) && (r.decided++, "victory" === g.outcome && r.won++);
      }
    }
    return [ ...map.values() ].sort((a, b) => b.played - a.played || b.won - a.won);
  }(games), {
    kind: "civ",
    emptyMsg: L("LOC_CHRONICLE_HOF_NO_CIVS")
  });
}

function openHof(opts) {
  opts = opts || {}, destroyHofDom(), installFrontInputHandler(hofInputHandler);
  const games = allGames(), root = document.createElement("div");
  root.id = OVERLAY_ID, noteOverlayOpened(OVERLAY_ID);
  try {
    refreshEngineKeyMap("hof-open");
  } catch (e) {}
  const backdrop = el("div", "position:fixed;left:0;top:0;width:100%;height:100%;z-index:999998;background:rgba(6,7,10,0.78);pointer-events:auto");
  backdrop.addEventListener("click", closeHof), root.appendChild(backdrop);
  const panel = el("div", PANEL_BOX);
  root.appendChild(panel);
  const header = el("div", HEADER_BOX), titleCol = el("div", TITLE_COL_ROW), titleEl = el("div", TITLE_TEXT, L("LOC_HOF_TITLE"), "font-title uppercase tracking-150");
  titleCol.appendChild(titleEl), titleCol.appendChild(el("div", "color:#B7A987;font-size:0.85rem;padding-bottom:0.3rem;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap", games.length ? 1 === games.length ? L("LOC_CHRONICLE_HOF_ONE_CAMPAIGN") : L("LOC_CHRONICLE_HOF_N_CAMPAIGNS", games.length) : L("LOC_CHRONICLE_HOF_CAMPAIGNS_CAPTION"))), 
  header.appendChild(titleCol);
  const headerActions = el("div", HEADER_ACTIONS);
  const optionsBtn = makeSettingsButton({});
  optionsBtn.style.marginRight = "9px", headerActions.appendChild(optionsBtn);
  const closeBtn = makeNativeButton(L("LOC_GENERIC_CLOSE"), closeHof, {});
  closeBtn.style.opacity = "0.72";
  const closeLabel = closeBtn.querySelector(".ozq-btn-label");
  closeLabel && (closeLabel.style.color = "#E8E2D0"), headerActions.appendChild(closeBtn), 
  header.appendChild(headerActions), panel.appendChild(header);
  const tabs = [ {
    id: "overview",
    label: L("LOC_HOF_OVERVIEW")
  }, {
    id: "reports",
    label: L("LOC_HOF_REPORTS")
  }, {
    id: "leaders",
    label: L("LOC_PROFILE_TAB_LEADERS")
  }, {
    id: "civs",
    label: L("LOC_PROFILE_TAB_CIVILIZATIONS")
  }, {
    id: "history",
    label: L("LOC_HOF_HISTORY")
  } ], tabBar = el("div", "display:flex;flex-wrap:wrap;margin-bottom:16px;flex-shrink:0");
  panel.appendChild(tabBar);
  const body = el("div", "flex:1 1 auto;min-height:0;overflow:auto;display:flex;flex-direction:column;width:100%;box-sizing:border-box");
  panel.appendChild(body);
  const tabButtons = [];
  let curTab = opts.tab || "overview";
  function openDetail(g) {
    let api = null;
    try {
      api = "undefined" != typeof globalThis && globalThis.ozqChronicleGraphs || "undefined" != typeof window && window.ozqChronicleGraphs;
    } catch (e) {}
    if (!api || "function" != typeof api.openForStore) return;
    const bits = [ gameTitle(g), outcomeText(g) ];
    null != g.score && bits.push(L("LOC_CHRONICLE_HOF_SCORE_N", Math.round(g.score)));
    const tl = turnsLabel(g);
    tl && bits.push(tl), g.diff && bits.push(typeNameOrUnknown(g.diff)), g.mapSize && bits.push(typeNameOrUnknown(g.mapSize));
    const when = fmtDate(g.updated);
    when && bits.push(when), api.openForStore(g.store, {
      title: L("LOC_HOF_VIEWDETAILS"),
      caption: bits.join("  ·  ")
    });
  }
  function showTab(id) {
    curTab = id, tabButtons.forEach((b, i) => highlightButton(b, tabs[i].id === id)), 
    body.textContent = "", "overview" === id ? function(body, games, goHistory) {
      const st = function(games) {
        const decided = games.filter(g => "victory" === g.outcome || "defeat" === g.outcome), wins = games.filter(g => "victory" === g.outcome), losses = games.filter(g => "defeat" === g.outcome), byClass = {};
        for (const g of wins) {
          const cls = g.result && g.result.victoryClass || "UNKNOWN";
          byClass[cls] = (byClass[cls] || 0) + 1;
        }
        let totalTurns = 0;
        for (const g of games) totalTurns += g.totalTurns || 0;
        let highScore = null, fastestWin = null, biggestEmpire = null, mostKills = null;
        for (const g of games) null != g.score && (!highScore || g.score > highScore.score) && (highScore = g), 
        "victory" === g.outcome && g.totalTurns > 0 && (!fastestWin || g.totalTurns < fastestWin.totalTurns) && (fastestWin = g), 
        null != g.peakSettlements && (!biggestEmpire || g.peakSettlements > biggestEmpire.peakSettlements) && (biggestEmpire = g), 
        null != g.unitsKilled && (!mostKills || g.unitsKilled > mostKills.unitsKilled) && (mostKills = g);
        return {
          games: games.length,
          decided: decided.length,
          wins: wins.length,
          losses: losses.length,
          byClass: byClass,
          totalTurns: totalTurns,
          highScore: highScore,
          fastestWin: fastestWin,
          biggestEmpire: biggestEmpire,
          mostKills: mostKills
        };
      }(games);
      if (body.textContent = "", !games.length) {
        const empty = el("div", "color:#C9BFA6;margin-top:52px;text-align:center;font-size:1.78rem");
        return empty.appendChild(el("div", "margin-bottom:13px", L("LOC_CHRONICLE_HOF_EMPTY_CAMPAIGNS"))), 
        empty.appendChild(el("div", "color:#8A7F63;font-size:1.54rem", L("LOC_CHRONICLE_HOF_EMPTY_CAMPAIGNS_HINT"))), 
        void body.appendChild(empty);
      }
      const hero = el("div", "display:flex;flex-wrap:nowrap;margin:0 0 32px 0;flex-shrink:0;width:100%;box-sizing:border-box");
      function heroTile(label, value, sub, accent) {
        const t = el("div", "background:#1E1A14;border:1px solid #6B5842;padding:26px 32px;flex:1 1 0;min-width:0;margin:0 19px 0 0;box-sizing:border-box");
        t.appendChild(el("div", "color:#8A7F63;font-size:1.17rem;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:13px", label)), 
        t.appendChild(el("div", "color:" + (accent || "#F0E6D2") + ";font-size:3rem;font-weight:600;line-height:1.1", String(value))), 
        sub && t.appendChild(el("div", "color:#B7A987;font-size:1.33rem;margin-top:10px", sub)), 
        hero.appendChild(t);
      }
      const winPct = st.decided ? Math.round(100 * st.wins / st.decided) : null;
      heroTile(L("LOC_CHRONICLE_HOF_CAMPAIGNS"), st.games, st.decided ? L("LOC_CHRONICLE_HOF_FINISHED", st.decided) : L("LOC_CHRONICLE_HOF_IN_PROGRESS_SUB")), 
      heroTile(L("LOC_CHRONICLE_HOF_RECORD"), st.wins + "–" + st.losses, null != winPct ? L("LOC_CHRONICLE_HOF_WIN_RATE", winPct) : L("LOC_CHRONICLE_HOF_NO_FINISHED"), st.wins > st.losses ? "#6BCB77" : st.losses > st.wins ? "#D96B6B" : "#F0E6D2"), 
      heroTile(L("LOC_CHRONICLE_HOF_TURNS_LOGGED"), st.totalTurns, L("LOC_CHRONICLE_HOF_ACROSS_CAMPAIGNS")), 
      hero.lastChild && (hero.lastChild.style.marginRight = "0"), body.appendChild(hero);
      const classes = Object.keys(st.byClass).sort((a, b) => st.byClass[b] - st.byClass[a]);
      if (classes.length) {
        body.appendChild(sectionTitle(L("LOC_CHRONICLE_HOF_VICTORIES_BY_PATH")));
        const vrow = el("div", "display:flex;flex-wrap:wrap;margin:0 0 36px 0;flex-shrink:0");
        for (const cls of classes) {
          const card = el("div", "display:flex;align-items:center;background:#1E1A14;border:1px solid #4A3F32;padding:16px 23px;margin:0 16px 16px 0;flex:1 1 18%;min-width:12rem;max-width:48%;box-sizing:border-box"), badge = makeVictoryBadge(cls, 112);
          badge && (badge.style.marginRight = "19px", card.appendChild(badge));
          const col = el("div", "display:flex;flex-direction:column;min-width:0");
          col.appendChild(el("div", "color:#E8E2D0;font-size:1.54rem", victoryClassLabel(cls))), 
          col.appendChild(el("div", "color:#FFD98A;font-size:2.03rem;font-weight:600", String(st.byClass[cls]))), 
          card.appendChild(col), vrow.appendChild(card);
        }
        body.appendChild(vrow);
      }
      body.appendChild(sectionTitle(L("LOC_HOF_HIGHLIGHTS")));
      const records = el("div", "display:flex;flex-wrap:wrap;margin:0 0 13px 0;width:100%;box-sizing:border-box");
      function recordCard(title, g, valueText, valueColor) {
        if (!g) return;
        const card = makeCard({
          pad: "19px 23px",
          clickable: !0,
          onClick: () => goHistory(g)
        });
        card.style.margin = "0 2% 19px 0", card.style.flex = "0 0 48%", card.style.maxWidth = "48%", 
        card.style.boxSizing = "border-box", card.style.alignItems = "flex-start";
        const portrait = makeLeaderPortrait(g.leader, 112);
        portrait.style.marginTop = "2px", card.appendChild(portrait);
        const main = el("div", "display:flex;flex-direction:column;min-width:0;flex:1 1 auto;margin:0 0 0 23px"), topRow = el("div", "display:flex;align-items:flex-start;min-width:0;width:100%"), mid = el("div", "display:flex;flex-direction:column;min-width:0;flex:1 1 auto");
        mid.appendChild(el("div", "color:#8A7F63;font-size:1.13rem;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:5px", title)), 
        mid.appendChild(el("div", "color:#E8E2D0;font-size:1.59rem;white-space:normal", gameTitle(g)));
        const metaBits = [];
        if (g.primaryCiv && metaBits.push(civName(g.primaryCiv)), g.result && g.result.victoryClass && "victory" === g.outcome && metaBits.push(victoryClassLabel(g.result.victoryClass)), 
        metaBits.length && mid.appendChild(el("div", "color:#8A7F63;font-size:1.26rem;margin-top:3px;white-space:normal", metaBits.join(" · "))), 
        topRow.appendChild(mid), "victory" === g.outcome && g.result && g.result.victoryClass) {
          const vb = makeVictoryBadge(g.result.victoryClass, 112);
          vb && (vb.style.marginLeft = "14px", vb.style.flexShrink = "0", topRow.appendChild(vb));
        }
        main.appendChild(topRow), main.appendChild(el("div", "color:" + (valueColor || "#FFD98A") + ";font-size:1.86rem;font-weight:600;white-space:nowrap;align-self:flex-end;margin-top:10px", valueText)), 
        card.appendChild(main), records.appendChild(card);
      }
      recordCard(L("LOC_CHRONICLE_HOF_HIGH_SCORE"), st.highScore, st.highScore && null != st.highScore.score ? String(Math.round(st.highScore.score)) : "—"), 
      recordCard(L("LOC_CHRONICLE_HOF_FASTEST_VICTORY"), st.fastestWin, st.fastestWin ? speedLabel(st.fastestWin) : "—", "#6BCB77"), 
      recordCard(L("LOC_CHRONICLE_HOF_BIGGEST_EMPIRE"), st.biggestEmpire, st.biggestEmpire && null != st.biggestEmpire.peakSettlements ? L("LOC_CHRONICLE_HOF_N_SETTLEMENTS", st.biggestEmpire.peakSettlements) : "—"), 
      recordCard(L("LOC_CHRONICLE_HOF_MOST_KILLS"), st.mostKills, st.mostKills && null != st.mostKills.unitsKilled ? String(st.mostKills.unitsKilled) : "—", "#D96B6B"), 
      records.children.length || records.appendChild(el("div", "color:#B7A987;padding:19px;font-size:1.54rem", L("LOC_CHRONICLE_HOF_NO_RECORDS"))), 
      body.appendChild(records);
    }(body, games, openDetail) : "leaders" === id ? renderLeaders(body, games) : "civs" === id ? renderCivs(body, games) : "reports" === id ? function(body, games, openDetail) {
      const boards = el("div", "display:flex;flex-wrap:wrap;align-items:flex-start");
      function rankBoard(title, emptyMsg, items, valueFn, valueColor) {
        const col = el("div", "display:flex;flex-direction:column;flex:0 0 48%;max-width:48%;margin:0 2% 32px 0;box-sizing:border-box;min-width:0");
        if (col.appendChild(sectionTitle(title)), !items.length) return col.appendChild(el("div", "color:#B7A987;padding:13px 0;font-size:1.38rem", emptyMsg)), 
        void boards.appendChild(col);
        items.forEach((g, i) => {
          const row = makeCard({
            pad: "16px 19px",
            clickable: !0,
            onClick: () => openDetail(g)
          });
          row.style.marginBottom = "10px", row.style.width = "100%";
          const rankColor = 0 === i ? "#FFD98A" : 1 === i ? "#C0C0C0" : 2 === i ? "#C48A5A" : "#8A7F63";
          row.appendChild(el("div", "width:2.6rem;color:" + rankColor + ";font-size:1.7rem;font-weight:600;flex-shrink:0;text-align:center", String(i + 1))), 
          row.appendChild(makeLeaderPortrait(g.leader, 112));
          const spacer = el("div", "width:19px;flex-shrink:0");
          row.appendChild(spacer);
          const mid = el("div", "display:flex;flex-direction:column;min-width:0;flex:1 1 auto");
          mid.appendChild(el("div", "color:#E8E2D0;font-size:1.54rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap", gameTitle(g)));
          const sub = el("div", "display:flex;align-items:center;margin-top:3px;min-width:0");
          if ("victory" === g.outcome && g.result && g.result.victoryClass) {
            const vb = makeVictoryBadge(g.result.victoryClass, 90);
            vb && (vb.style.marginRight = "10px", vb.style.flexShrink = "0", sub.appendChild(vb)), 
            sub.appendChild(el("div", "color:#8A7F63;font-size:1.26rem;flex-shrink:0", victoryClassLabel(g.result.victoryClass)));
          }
          sub.appendChild(el("div", "flex:1 1 auto")), sub.appendChild(el("div", "color:" + (valueColor || "#FFD98A") + ";font-size:1.7rem;font-weight:600;white-space:nowrap;flex-shrink:0;margin-left:14px", valueFn(g))), 
          mid.appendChild(sub), row.appendChild(mid), col.appendChild(row);
        }), boards.appendChild(col);
      }
      const byScore = games.filter(g => null != g.score).slice().sort((a, b) => b.score - a.score).slice(0, 10);
      rankBoard(L("LOC_CHRONICLE_HOF_HIGH_SCORE"), L("LOC_CHRONICLE_HOF_NO_SCORES"), byScore, g => String(Math.round(g.score)), "#FFD98A");
      const bySpeed = games.filter(g => "victory" === g.outcome && g.totalTurns > 0).slice().sort((a, b) => a.totalTurns - b.totalTurns).slice(0, 10);
      rankBoard(L("LOC_CHRONICLE_HOF_FASTEST_VICTORY"), L("LOC_CHRONICLE_HOF_NO_VICTORIES"), bySpeed, g => speedLabel(g), "#6BCB77");
      const byKills = games.filter(g => null != g.unitsKilled && g.unitsKilled > 0).slice().sort((a, b) => b.unitsKilled - a.unitsKilled).slice(0, 10);
      byKills.length && rankBoard(L("LOC_CHRONICLE_HOF_MOST_KILLS"), "", byKills, g => String(g.unitsKilled), "#D96B6B"), 
      body.appendChild(boards);
    }(body, games, openDetail) : "history" === id && function(body, games, openDetail) {
      if (!games.length) return void body.appendChild(el("div", "color:#C9BFA6;text-align:center;padding:3rem;font-size:1.78rem", L("LOC_CHRONICLE_HOF_NO_GAMES")));
      const list = el("div", "display:flex;flex-direction:column;flex:1 1 auto;min-height:0;overflow:auto;width:100%;box-sizing:border-box");
      for (const g of games) {
        const row = makeCard({
          pad: "19px 23px",
          clickable: !0,
          onClick: () => openDetail(g)
        });
        row.style.marginBottom = "13px", row.style.width = "100%", row.appendChild(makeLeaderPortrait(g.leader, 112));
        const mid = el("div", "display:flex;flex-direction:column;min-width:0;flex:1 1 auto;margin:0 23px"), titleLine = el("div", "display:flex;align-items:center;min-width:0;margin-bottom:5px");
        if (titleLine.appendChild(el("div", "color:#F0E6D2;font-size:1.65rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap", leaderName(g.leader))), 
        g.primaryCiv) {
          const civSym = makeCivSymbol(g.primaryCiv, 66);
          civSym.style.marginLeft = "16px", civSym.style.border = "none", civSym.style.background = "transparent", 
          titleLine.appendChild(civSym), titleLine.appendChild(el("div", "color:#B7A987;font-size:1.46rem;margin-left:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap", civName(g.primaryCiv)));
        }
        mid.appendChild(titleLine);
        const settings = [ g.diff ? typeNameOrUnknown(g.diff) : "", g.mapSize ? typeNameOrUnknown(g.mapSize) : "", g.startAge ? ageName(g.startAge) : "" ].filter(Boolean).join(" · "), subBits = [];
        settings && subBits.push(settings);
        const when = fmtDate(g.updated);
        when && subBits.push(when), subBits.length && mid.appendChild(el("div", "color:#8A7F63;font-size:1.3rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap", subBits.join("  ·  "))), 
        row.appendChild(mid);
        const right = el("div", "display:flex;flex-direction:column;align-items:flex-end;flex-shrink:0;min-width:11rem"), outcomeRow = el("div", "display:flex;align-items:center;margin-bottom:5px");
        if ("victory" === g.outcome && g.result && g.result.victoryClass) {
          const vb = makeVictoryBadge(g.result.victoryClass, 90);
          vb && (vb.style.marginRight = "13px", outcomeRow.appendChild(vb));
        } else if ("defeat" === g.outcome) {
          const def = el("div", "width:66px;height:66px;border-radius:" + Math.round(33) + "px;background:#3A2222;border:1px solid #D96B6B;margin-right:13px;flex-shrink:0;box-sizing:border-box");
          outcomeRow.appendChild(def);
        }
        outcomeRow.appendChild(el("div", "color:" + outcomeColor(g) + ";font-size:1.49rem;font-weight:600;white-space:nowrap", outcomeText(g))), 
        right.appendChild(outcomeRow);
        const statsLine = el("div", "display:flex;align-items:center");
        null != g.score && statsLine.appendChild(el("div", "color:#FFD98A;font-size:1.43rem;margin-right:19px;white-space:nowrap", L("LOC_CHRONICLE_HOF_PTS", Math.round(g.score))));
        const tl = turnsLabel(g);
        tl && statsLine.appendChild(el("div", "color:#B7A987;font-size:1.38rem;white-space:nowrap", tl)), 
        statsLine.children.length && right.appendChild(statsLine), row.appendChild(right), 
        list.appendChild(row);
      }
      body.appendChild(list);
    }(body, games, openDetail);
  }
  tabs.forEach((t, i) => {
    const b = makeNativeButton(t.label, () => showTab(t.id), {});
    i < tabs.length - 1 && (b.style.marginRight = "8px"), b.style.marginBottom = "6px", 
    tabButtons.push(b), tabBar.appendChild(b);
  }), activeHofNav = {
    jumpTab: i => !(i < 0 || i >= tabs.length) && (showTab(tabs[i].id), !0),
    stepTab(d) {
      if (!tabs.length) return !1;
      let idx = 0;
      for (let i = 0; i < tabs.length; i++) if (tabs[i].id === curTab) {
        idx = i;
        break;
      }
      const next = (idx + d + tabs.length) % tabs.length;
      return showTab(tabs[next].id), !0;
    },
    openOptions: () => function() {
      try {
        const api = "undefined" != typeof globalThis && globalThis.ozqChronicleOptions || "undefined" != typeof window && window.ozqChronicleOptions;
        if (api && "function" == typeof api.open) return api.open({}), !0;
      } catch (e) {}
      return !1;
    }()
  }, document.body.appendChild(root), showTab(curTab);
}

try {
  globalThis.ozqChronicleHof = {
    open: openHof,
    close: closeHof,
    version: "0.33.79"
  };
} catch (e) {
  try {
    window.ozqChronicleHof = {
      open: openHof,
      close: closeHof,
      version: "0.33.79"
    };
  } catch (e2) {}
}

function injectMainMenuButton(container) {
  if (container && !container.querySelector("#ozq-chronicle-hof-main-menu")) try {
    const btn = document.createElement("fxs-text-button");
    btn.id = "ozq-chronicle-hof-main-menu", btn.classList.add("main-menu-text-button", "self-start", "whitespace-nowrap"), 
    btn.setAttribute("type", "big"), btn.setAttribute("centered", "false"), btn.setAttribute("highlight-style", "decorative");
    let caption = L("LOC_HOF_TITLE");
    try {
      "undefined" != typeof Locale && Locale.stylize && (caption = Locale.stylize("LOC_HOF_TITLE"));
    } catch (e) {}
    btn.setAttribute("caption", String(caption).toUpperCase()), btn.setAttribute("data-tooltip-style", "none"), 
    btn.addEventListener("action-activate", () => {
      openHof();
    });
    const buttons = [];
    for (let i = 0; i < container.children.length; i++) {
      const el = container.children[i];
      el.tagName && "fxs-text-button" === String(el.tagName).toLowerCase() && buttons.push(el);
    }
    let insertBefore = null;
    buttons.length >= 2 ? insertBefore = buttons[buttons.length - 2] : 1 === buttons.length && (insertBefore = buttons[0]), 
    insertBefore ? container.insertBefore(btn, insertBefore) : container.appendChild(btn);
  } catch (e) {}
}

function inspectNode(node) {
  const c = function(node) {
    return node instanceof HTMLElement ? node.classList && node.classList.contains("main-menu-button-container") ? node : node.querySelector ? node.querySelector(".main-menu-button-container") : null : null;
  }(node);
  c && injectMainMenuButton(c);
}

scheduleInstall(function() {
  installFrontInputHandler(hofInputHandler);
  try {
    document.addEventListener("keydown", onHofKeydown, !0);
  } catch (e) {}
  const existing = document.querySelector(".main-menu-button-container");
  existing && injectMainMenuButton(existing);
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) for (const n of m.addedNodes) inspectNode(n);
  });
  try {
    observer.observe(document.body, {
      childList: !0,
      subtree: !0
    });
  } catch (e) {}
  err("loaded (" + (IS_GAME ? "game" : "shell") + ").");
});

export { };
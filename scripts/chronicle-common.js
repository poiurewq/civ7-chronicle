function err(msg) {
  try {
    console.error(`[chronicle-common] ${msg}`);
  } catch (e) {}
}

function chronicleI18n() {
  try {
    return "undefined" != typeof globalThis && globalThis.ozqChronicleI18n || "undefined" != typeof window && window.ozqChronicleI18n || null;
  } catch (e) {
    return null;
  }
}

function L() {
  const api = chronicleI18n();
  return api && api.L ? api.L.apply(api, arguments) : "";
}

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

const PANEL_BOX = [ "position:fixed", "left:4%", "top:5%", "width:92%", "height:90%", "box-sizing:border-box", "z-index:999999", "pointer-events:auto", "background:#16130E", "border:2px solid #6B5842", "display:flex", "flex-direction:column", "padding:24px 36px", "overflow-x:hidden", "overflow-y:hidden" ].join(";");

let audioApi = null;

try {
  import("/core/ui/audio-base/audio-support.js").then(m => {
    audioApi = m && m.Audio || null;
  }).catch(() => {});
} catch (e) {}

function playButtonSound(id) {
  try {
    audioApi && audioApi.playSound(id);
  } catch (e) {}
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
  button.querySelector(".ozq-btn-label").textContent = label, button.addEventListener("mouseenter", () => playButtonSound("data-audio-primary-button-focus")), 
  button.addEventListener("click", ev => {
    playButtonSound("data-audio-primary-button-press"), onClick(ev);
  }), button;
}

const installedHandlers = new Set;

const overlayOpenSeq = new Map;

let overlayCounter = 0;

function isSyntheticReligionLabel(s) {
  if (null == s) return !0;
  const t = String(s).trim();
  return !t || (0 === t.indexOf("LOC_") || (!!/^custom\s+\d+$/i.test(t) || !!/^religion[\s_-]?-?\d+$/i.test(t)));
}

function extractUgcPayload(s) {
  const m = String(s).match(/:\s*ugc\s+\d+;([^;}]*)/i);
  return m && m[1] && m[1].trim() ? m[1].trim() : null;
}

const SUB_KEY = "ozq-chronicle", LEGACY_KEYS = [ "!chronicle", "chronicle" ];

function freshContainer() {
  return {
    v: 3,
    updated: 0,
    games: {}
  };
}

function migrateContainer(c) {
  return c && "object" == typeof c && c.games ? (c.v = 3, c) : {
    v: 3,
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
    v: 3,
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
      v: 3,
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
    const sub = row0[SUB_KEY];
    if (sub && sub.games) {
      const c = migrateContainer(sub);
      return 0 !== hop || folded ? notes.push("reached modSettings after fold") : notes.push("steady"), 
      delete row0[SUB_KEY], folded = folded ? mergeContainers(c, folded) : c, fin(row0);
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
  shared[SUB_KEY] = c;
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

const DEFAULT_SETTINGS = {
  fog: !0
};

function readSettings() {
  try {
    const {container: container} = loadShared();
    return Object.assign({}, DEFAULT_SETTINGS, container && container.settings || {});
  } catch (e) {
    return Object.assign({}, DEFAULT_SETTINGS);
  }
}

globalThis.ozqChronicleCommon = {
  chronicleI18n: chronicleI18n,
  L: L,
  metricKeyLabel: function(id) {
    const api = chronicleI18n();
    return api && api.metricLabel && api.metricLabel(id) || "";
  },
  typeDisplayName: function(t) {
    const api = chronicleI18n();
    if (api && "function" == typeof api.typeDisplayName) {
      const n = api.typeDisplayName(t);
      if (n) return n;
    }
    return "";
  },
  prettifyTypeEnglish: function(type) {
    return null == type ? "" : String(type).replace(/^[A-Z]+_/, "").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  },
  LEADER_PERSONA_NAMES: LEADER_PERSONA_NAMES,
  isResolvedLoc: isResolvedLoc,
  resolveTypeNameOrNull: function(table, type) {
    if (null == type || "" === type) return null;
    const t = String(type);
    try {
      if ("undefined" != typeof GameInfo && GameInfo[table]) {
        const def = GameInfo[table].lookup(t);
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
    return "Leaders" === table && LEADER_PERSONA_NAMES[t] ? LEADER_PERSONA_NAMES[t] : null;
  },
  PANEL_PAD_X: 36,
  PANEL_BOX: PANEL_BOX,
  HEADER_BOX: "display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;flex-shrink:0;width:100%;min-width:0;box-sizing:border-box",
  TITLE_COL_ROW: "display:flex;flex-direction:row;align-items:flex-end;min-width:0;overflow:hidden;flex:1 1 auto",
  TITLE_TEXT: "font-size:1.8rem;color:#F0E6D2;flex-shrink:0;line-height:1.2;margin-right:20px",
  HEADER_ACTIONS: "display:flex;align-items:center;flex-shrink:0;margin-left:16px",
  CHART_SRC: "fs://game/core/ui/external/chart-js/chart.js",
  makeNativeButton: makeNativeButton,
  highlightButton: function(button, active) {
    const label = button.querySelector(".ozq-btn-label");
    label && (label.style.color = active ? "#FFD98A" : "#E8E2D0"), button.style.opacity = active ? "1" : "0.72";
  },
  makeSettingsButton: function(opts) {
    opts = opts || {};
    const button = makeNativeButton(L("LOC_CHRONICLE_OPT_BUTTON"), () => {
      try {
        const api = "undefined" != typeof globalThis && globalThis.ozqChronicleOptions || "undefined" != typeof window && window.ozqChronicleOptions;
        api && "function" == typeof api.open && api.open({
          onClose: opts.onClose || null
        });
      } catch (e) {}
    }, {
      id: opts.id
    });
    button.style.opacity = "0.72";
    const label = button.querySelector(".ozq-btn-label");
    return label && (label.style.color = "#E8E2D0"), button;
  },
  CANCEL_ACTIONS: [ "cancel", "keyboard-escape", "mousebutton-right", "sys-menu" ],
  isPressFinished: function(e) {
    return !("engine-input" !== e.type || !e.detail) && ("undefined" == typeof InputActionStatuses || e.detail.status === InputActionStatuses.FINISH);
  },
  installFrontInputHandler: function(handler) {
    if (handler && !installedHandlers.has(handler)) {
      installedHandlers.add(handler);
      try {
        import("/core/ui/context-manager/context-manager.js").then(m => {
          const cm = m && m.default;
          if (!cm || "function" != typeof cm.registerEngineInputHandler) return;
          cm.registerEngineInputHandler(handler);
          const arr = cm.engineInputEventHandlers;
          if (Array.isArray(arr)) {
            const i = arr.indexOf(handler);
            i > 0 && (arr.splice(i, 1), arr.unshift(handler));
          }
        }).catch(() => {});
      } catch (e) {}
    }
  },
  scheduleInstall: function(install) {
    const tick = () => {
      document.body ? install() : "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", install, {
        once: !0
      }) : requestAnimationFrame(tick);
    };
    tick();
  },
  noteOverlayOpened: function(id) {
    overlayOpenSeq.set(id, ++overlayCounter);
  },
  isTopOverlay: function(id) {
    if (!document.getElementById(id)) return !1;
    let topId = null, topSeq = -1;
    return overlayOpenSeq.forEach((seq, otherId) => {
      seq > topSeq && document.getElementById(otherId) && (topSeq = seq, topId = otherId);
    }), topId === id;
  },
  forgetOverlay: function(id) {
    overlayOpenSeq.delete(id);
  },
  isSyntheticReligionLabel: isSyntheticReligionLabel,
  extractUgcPayload: extractUgcPayload,
  resolvePlayerReligionName: function(playerRel) {
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
    const ugc = extractUgcPayload(s);
    return ugc && !isSyntheticReligionLabel(ugc) ? ugc : isSyntheticReligionLabel(s) ? null : s;
  },
  makeIsMajorPid: function(getStore) {
    return function(pid) {
      const n = Number(pid);
      try {
        if ("undefined" != typeof Players && "function" == typeof Players.get) {
          const p = Players.get(n);
          if (p && null != p.isMajor) return !!p.isMajor;
        }
      } catch (e) {}
      try {
        const store = getStore();
        if (store && store.meta && store.meta.players) {
          const m = store.meta.players[n] || store.meta.players[String(n)];
          if (m && null != m.isMajor) return !!m.isMajor;
          if (m) return !0;
        }
      } catch (e) {}
      return !1;
    };
  },
  SHARED_KEY: "modSettings",
  SUB_KEY: SUB_KEY,
  SCHEMA: 3,
  LEGACY_KEYS: LEGACY_KEYS,
  RESCUE_CAP: 131072,
  freshContainer: freshContainer,
  migrateContainer: migrateContainer,
  mergeContainers: mergeContainers,
  foldSchema1: foldSchema1,
  loadShared: loadShared,
  saveShared: saveShared,
  DEFAULT_SETTINGS: DEFAULT_SETTINGS,
  readSettings: readSettings,
  writeSettings: function(patch) {
    try {
      const {shared: shared, container: container} = loadShared();
      return container.settings = Object.assign({}, DEFAULT_SETTINGS, container.settings || {}, patch || {}), 
      container.updated = Date.now(), saveShared(shared, container), Object.assign({}, container.settings);
    } catch (e) {
      return err("settings write failed: " + e), readSettings();
    }
  }
};

export { };
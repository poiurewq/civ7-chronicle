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

const DEFAULT_HOTKEYS = {
  catPrev: "Minus",
  catNext: "Equals",
  chartPrev: "BracketLeft",
  chartNext: "BracketRight",
  pagePrev: "Comma",
  pageNext: "Period",
  openHof: "KeyH",
  openOptions: "KeyO"
}, HOTKEY_SLOT_KEYS = [ "catPrev", "catNext", "chartPrev", "chartNext", "pagePrev", "pageNext", "openHof", "openOptions" ], ENGINE_WATCHED_ACTIONS = [ "unit-heal", "unit-fortify", "unit-sleep", "unit-alert", "unit-auto-explore", "unit-move", "unit-ranged-attack", "unit-skip-turn", "open-greatworks", "open-techs", "open-civics", "open-traditions", "open-rankings", "open-attributes", "open-civilopedia", "open-advisors", "open-legacies", "open-religion", "open-trade", "open-ozq-chronicle", "quick-save", "quick-load", "toggle-grid-layer", "toggle-yields-layer", "toggle-resources-layer", "toggle-frame-stats", "next-action", "keyboard-enter", "text-to-speech-keyboard" ], ENGINE_NO_SKIP_KEYDOWN = {
  "toggle-grid-layer": !0,
  "toggle-yields-layer": !0,
  "toggle-resources-layer": !0,
  "toggle-frame-stats": !0,
  "next-action": !0
}, ENGINE_GESTURE_FALLBACK = {
  "unit-heal": [ "KeyH" ],
  "open-greatworks": [ "KeyO" ],
  "open-ozq-chronicle": [ "F2" ]
}, KEY_ID_TO_CODE = {
  KEY_A: "KeyA",
  KEY_B: "KeyB",
  KEY_C: "KeyC",
  KEY_D: "KeyD",
  KEY_E: "KeyE",
  KEY_F: "KeyF",
  KEY_G: "KeyG",
  KEY_H: "KeyH",
  KEY_I: "KeyI",
  KEY_J: "KeyJ",
  KEY_K: "KeyK",
  KEY_L: "KeyL",
  KEY_M: "KeyM",
  KEY_N: "KeyN",
  KEY_O: "KeyO",
  KEY_P: "KeyP",
  KEY_Q: "KeyQ",
  KEY_R: "KeyR",
  KEY_S: "KeyS",
  KEY_T: "KeyT",
  KEY_U: "KeyU",
  KEY_V: "KeyV",
  KEY_W: "KeyW",
  KEY_X: "KeyX",
  KEY_Y: "KeyY",
  KEY_Z: "KeyZ",
  KEY_0: "Digit0",
  KEY_1: "Digit1",
  KEY_2: "Digit2",
  KEY_3: "Digit3",
  KEY_4: "Digit4",
  KEY_5: "Digit5",
  KEY_6: "Digit6",
  KEY_7: "Digit7",
  KEY_8: "Digit8",
  KEY_9: "Digit9",
  KEY_NP_0: "NumPad0",
  KEY_NP_1: "NumPad1",
  KEY_NP_2: "NumPad2",
  KEY_NP_3: "NumPad3",
  KEY_NP_4: "NumPad4",
  KEY_NP_5: "NumPad5",
  KEY_NP_6: "NumPad6",
  KEY_NP_7: "NumPad7",
  KEY_NP_8: "NumPad8",
  KEY_NP_9: "NumPad9",
  KEY_NP_MULTIPLY: "NumpadMultiply",
  KEY_NP_PLUS: "NumpadAdd",
  KEY_NP_MINUS: "NumpadSubtract",
  KEY_NP_DECIMAL: "NumpadDecimal",
  KEY_NP_DIVIDE: "NumpadDivide",
  KEY_LEFT: "ArrowLeft",
  KEY_RIGHT: "ArrowRight",
  KEY_UP: "ArrowUp",
  KEY_DOWN: "ArrowDown",
  KEY_COMMA: "Comma",
  KEY_PERIOD: "Period",
  KEY_LBRACKET: "BracketLeft",
  KEY_RBRACKET: "BracketRight",
  KEY_SLASH: "Slash",
  KEY_SEMICOLON: "SemiColon",
  KEY_MINUS: "Minus",
  KEY_PLUS: "Equals",
  KEY_TILDE: "Backquote",
  KEY_BACKSLASH: "Backslash",
  KEY_QUOTE: "Quote",
  KEY_SPACE: "Space",
  KEY_TAB: "Tab",
  KEY_ESCAPE: "Escape",
  KEY_RETURN: "Enter",
  KEY_BACKSPACE: "Backspace",
  KEY_DELETE: "Delete",
  KEY_INSERT: "Insert",
  KEY_HOME: "Home",
  KEY_END: "End",
  KEY_PAGEUP: "PageUp",
  KEY_PAGEDOWN: "PageDown",
  KEY_F1: "F1",
  KEY_F2: "F2",
  KEY_F3: "F3",
  KEY_F4: "F4",
  KEY_F5: "F5",
  KEY_F6: "F6",
  KEY_F7: "F7",
  KEY_F8: "F8",
  KEY_F9: "F9",
  KEY_F10: "F10",
  KEY_F11: "F11",
  KEY_F12: "F12"
}, W3C_TO_GAMEFACE_CODE = {
  Equal: "Equals",
  Semicolon: "SemiColon",
  Numpad0: "NumPad0",
  Numpad1: "NumPad1",
  Numpad2: "NumPad2",
  Numpad3: "NumPad3",
  Numpad4: "NumPad4",
  Numpad5: "NumPad5",
  Numpad6: "NumPad6",
  Numpad7: "NumPad7",
  Numpad8: "NumPad8",
  Numpad9: "NumPad9"
};

function toGamefaceCode(code) {
  return code ? W3C_TO_GAMEFACE_CODE[code] || code : "";
}

let engineMap = {
  actionToCodes: Object.create(null),
  actionToLabels: Object.create(null),
  codeToActions: Object.create(null),
  boundCodes: Object.create(null),
  updated: 0,
  source: "init"
}, cachedHotkeys = null, inputBindedListenerInstalled = !1, inputActionBindedTimer = null;

function invalidateHotkeysCache() {
  cachedHotkeys = null;
}

function actionMarksKeydownSkip(actionName) {
  return !(!actionName || ENGINE_NO_SKIP_KEYDOWN[actionName]);
}

function keyIdToCode(keyId) {
  if (null == keyId || "" === keyId || 0 === keyId || -1 === keyId) return "";
  if ("string" == typeof keyId) {
    if (KEY_ID_TO_CODE[keyId]) return KEY_ID_TO_CODE[keyId];
    if (0 === keyId.indexOf("KEY_") && KEY_ID_TO_CODE[keyId]) return KEY_ID_TO_CODE[keyId];
    if (0 === keyId.indexOf("Key") || 0 === keyId.indexOf("Digit") || 0 === keyId.indexOf("Arrow") || 0 === keyId.indexOf("Numpad") || 0 === keyId.indexOf("NumPad") || keyId.length >= 2 && "F" === keyId.charAt(0) && keyId.charAt(1) >= "1" && keyId.charAt(1) <= "9") return toGamefaceCode(keyId);
    if (1 === keyId.length) {
      const u = keyId.toUpperCase();
      if (u >= "A" && u <= "Z") return "Key" + u;
      if (u >= "0" && u <= "9") return "Digit" + u;
      if ("`" === u || "~" === u) return "Backquote";
    }
    return KEY_ID_TO_CODE["KEY_" + keyId] || "";
  }
  if ("number" == typeof keyId) try {
    if ("undefined" != typeof InputKeys && InputKeys) {
      const rev = InputKeys[keyId];
      if ("string" == typeof rev && rev) {
        if (KEY_ID_TO_CODE[rev]) return KEY_ID_TO_CODE[rev];
        if (0 === rev.indexOf("KEY_")) return KEY_ID_TO_CODE[rev] || "";
      }
      const names = Object.keys(InputKeys);
      for (let i = 0; i < names.length; i++) {
        const n = names[i];
        if (!(n.charAt(0) >= "0" && n.charAt(0) <= "9") && InputKeys[n] === keyId) {
          if (KEY_ID_TO_CODE[n]) return KEY_ID_TO_CODE[n];
          if (0 === n.indexOf("KEY_")) return KEY_ID_TO_CODE[n] || "";
        }
      }
    }
  } catch (e) {}
  return "";
}

function gestureDisplayToCode(disp) {
  if (null == disp || "string" != typeof disp) return "";
  let s = disp.trim();
  if (!s) return "";
  if (s.indexOf("+") >= 0) {
    const parts = s.split("+");
    if (s = (parts[parts.length - 1] || "").trim(), !s) return "";
  }
  const fm = /^F([1-9]|1[0-2])$/i.exec(s);
  if (fm) return "F" + fm[1];
  if ("~" === s || "`" === s) return "Backquote";
  if (1 === s.length) return keyIdToCode(s);
  const named = {
    Space: "Space",
    Tab: "Tab",
    Esc: "Escape",
    Escape: "Escape",
    Enter: "Enter",
    Return: "Enter",
    Backspace: "Backspace",
    Delete: "Delete",
    Insert: "Insert",
    Home: "Home",
    End: "End",
    PageUp: "PageUp",
    PageDown: "PageDown",
    Left: "ArrowLeft",
    Right: "ArrowRight",
    Up: "ArrowUp",
    Down: "ArrowDown"
  };
  return named[s] ? named[s] : KEY_ID_TO_CODE[s] ? KEY_ID_TO_CODE[s] : KEY_ID_TO_CODE["KEY_" + s] ? KEY_ID_TO_CODE["KEY_" + s] : keyIdToCode(s);
}

function engineCodesForAction(name) {
  if (!name) return [];
  const live = engineMap.actionToCodes[name];
  if (live && live.length) return live.slice();
  const fb = ENGINE_GESTURE_FALLBACK[name];
  return fb ? fb.slice() : [];
}

const EAT_WORLD_ENGINE_ACTIONS = [ "keyboard-nav-left", "keyboard-nav-right", "keyboard-nav-up", "keyboard-nav-down", "cycle-prev", "cycle-next" ];

const DEFAULT_SETTINGS = {
  fog: !0,
  unitFog: !0,
  dock: !0,
  hotkeys: Object.assign({}, DEFAULT_HOTKEYS)
};

function normalizeHotkeys(raw) {
  const out = Object.assign({}, DEFAULT_HOTKEYS);
  if (!raw || "object" != typeof raw) return out;
  for (let i = 0; i < HOTKEY_SLOT_KEYS.length; i++) {
    const k = HOTKEY_SLOT_KEYS[i], v = raw[k];
    "string" == typeof v && v && (out[k] = toGamefaceCode(v));
  }
  return out;
}

function formatHotkeyCode(code) {
  if (!code) return "?";
  const pretty = {
    BracketLeft: "[",
    BracketRight: "]",
    Comma: ",",
    Period: ".",
    ArrowLeft: "←",
    ArrowRight: "→",
    ArrowUp: "↑",
    ArrowDown: "↓",
    Space: "Space",
    Tab: "Tab",
    Escape: "Esc",
    Minus: "-",
    Equals: "=",
    Equal: "=",
    SemiColon: ";",
    Semicolon: ";",
    Quote: "'",
    Backslash: "\\",
    Slash: "/",
    Backquote: "`",
    IntlBackslash: "\\",
    InternationalBackslash: "\\"
  };
  if (code in pretty) return pretty[code];
  if (0 === code.indexOf("Key") && 4 === code.length) return code.charAt(3);
  if (0 === code.indexOf("Digit")) return code.slice(5);
  const np = /^Num[Pp]ad(.+)$/.exec(code);
  if (np) {
    const rest = np[1];
    if (1 === rest.length && rest >= "0" && rest <= "9") return "Num" + rest;
    return {
      Add: "Num+",
      Subtract: "Num-",
      Multiply: "Num*",
      Divide: "Num/",
      Decimal: "Num.",
      Enter: "NumEnter",
      Backspace: "NumBksp"
    }[rest] || "Num" + rest;
  }
  return code;
}

function readSettings() {
  try {
    const {container: container} = loadShared(), raw = container && container.settings || {}, s = Object.assign({}, DEFAULT_SETTINGS, raw);
    return s.hotkeys = normalizeHotkeys(raw.hotkeys), s;
  } catch (e) {
    return Object.assign({}, DEFAULT_SETTINGS, {
      hotkeys: Object.assign({}, DEFAULT_HOTKEYS)
    });
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
  DEFAULT_HOTKEYS: DEFAULT_HOTKEYS,
  HOTKEY_SLOT_KEYS: HOTKEY_SLOT_KEYS,
  ENGINE_WATCHED_ACTIONS: ENGINE_WATCHED_ACTIONS,
  ENGINE_NO_SKIP_KEYDOWN: ENGINE_NO_SKIP_KEYDOWN,
  ENGINE_GESTURE_FALLBACK: ENGINE_GESTURE_FALLBACK,
  isWatchedEngineAction: function(name) {
    return !!(name && ENGINE_WATCHED_ACTIONS.indexOf(name) >= 0);
  },
  engineCodesForAction: engineCodesForAction,
  engineLabelsForAction: function(name) {
    if (!name) return [];
    const labs = engineMap.actionToLabels[name];
    if (labs && labs.length) return labs.slice();
    const codes = engineCodesForAction(name), out = [];
    for (let i = 0; i < codes.length; i++) {
      const lab = formatHotkeyCode(codes[i]);
      lab && "?" !== lab && out.indexOf(lab) < 0 && out.push(lab);
    }
    return out;
  },
  nativeActionsForCode: function(code) {
    if (!code) return [];
    const list = engineMap.codeToActions[code];
    return list ? list.slice() : [];
  },
  isEngineBoundHotkeyCode: function(code) {
    return !(!code || !engineMap.boundCodes[code]);
  },
  refreshEngineKeyMap: function refreshEngineKeyMap() {
    const actionToCodes = Object.create(null), actionToLabels = Object.create(null), codeToActions = Object.create(null), boundCodes = Object.create(null), actionHadLive = Object.create(null);
    let source = "fallback";
    const pushCode = (actionName, codes, code) => {
      if (!code || codes.indexOf(code) >= 0) return;
      codes.push(code);
      actionMarksKeydownSkip(actionName) && (boundCodes[code] = !0), codeToActions[code] || (codeToActions[code] = []), 
      codeToActions[code].indexOf(actionName) < 0 && codeToActions[code].push(actionName);
    }, pushLabel = (labels, lab) => {
      if (!lab || "string" != typeof lab) return;
      const s = lab.trim();
      !s || labels.indexOf(s) >= 0 || labels.push(s);
    };
    try {
      if ("undefined" != typeof Input && Input && "function" == typeof Input.getActionIdByName) {
        source = "live";
        const dev = "undefined" != typeof InputDeviceType && InputDeviceType ? InputDeviceType.Keyboard : 0, ctxAll = "undefined" != typeof InputContext && InputContext ? InputContext.ALL : 0;
        for (let i = 0; i < ENGINE_WATCHED_ACTIONS.length; i++) {
          const actionName = ENGINE_WATCHED_ACTIONS[i];
          let actionId = null;
          try {
            actionId = Input.getActionIdByName(actionName);
          } catch (e) {
            actionId = null;
          }
          if (null == actionId || 0 === actionId || !1 === actionId) continue;
          const codes = [], labels = [];
          let sawLive = !1;
          for (let g = 0; g < 2; g++) {
            let raw = null;
            try {
              "function" == typeof Input.getGestureKey && (raw = Input.getGestureKey(actionId, g, dev, ctxAll));
            } catch (e) {
              raw = null;
            }
            let disp = null;
            try {
              "function" == typeof Input.getGestureDisplayString && (disp = Input.getGestureDisplayString(actionId, g, dev, ctxAll));
            } catch (e) {
              disp = null;
            }
            !(null == raw || "" === raw || 0 === raw || -1 === raw || !1 === raw) && (sawLive = !0), 
            disp && "string" == typeof disp && disp.trim() && (sawLive = !0, pushLabel(labels, disp));
            let code = keyIdToCode(raw);
            !code && disp && (code = gestureDisplayToCode(disp)), code && pushCode(actionName, codes, code);
          }
          if (sawLive && (actionHadLive[actionName] = !0), codes.length || sawLive) {
            if (!labels.length && codes.length) for (let c = 0; c < codes.length; c++) pushLabel(labels, formatHotkeyCode(codes[c]));
          } else {
            const fb = ENGINE_GESTURE_FALLBACK[actionName];
            if (fb) {
              for (let f = 0; f < fb.length; f++) pushCode(actionName, codes, fb[f]), pushLabel(labels, formatHotkeyCode(fb[f]));
              "live" === source && (source = "live+fallback");
            }
          }
          codes.length && (actionToCodes[actionName] = codes), labels.length && (actionToLabels[actionName] = labels);
        }
      } else source = "no-Input";
    } catch (e) {
      source = "error:" + e, err("refreshEngineKeyMap failed: " + e);
    }
    const fbNames = Object.keys(ENGINE_GESTURE_FALLBACK);
    for (let i = 0; i < fbNames.length; i++) {
      const n = fbNames[i];
      if (!actionHadLive[n] && (!actionToCodes[n] || !actionToCodes[n].length)) {
        actionToCodes[n] = ENGINE_GESTURE_FALLBACK[n].slice();
        const codes = actionToCodes[n], markSkip = actionMarksKeydownSkip(n);
        for (let c = 0; c < codes.length; c++) markSkip && (boundCodes[codes[c]] = !0), 
        codeToActions[codes[c]] || (codeToActions[codes[c]] = []), codeToActions[codes[c]].indexOf(n) < 0 && codeToActions[codes[c]].push(n);
        if (!actionToLabels[n] || !actionToLabels[n].length) {
          const labs = [];
          for (let c = 0; c < codes.length; c++) pushLabel(labs, formatHotkeyCode(codes[c]));
          labs.length && (actionToLabels[n] = labs);
        }
        "live" === source && (source = "live+fallback");
      }
    }
    if (engineMap = {
      actionToCodes: actionToCodes,
      actionToLabels: actionToLabels,
      codeToActions: codeToActions,
      boundCodes: boundCodes,
      updated: Date.now(),
      source: source
    }, !inputBindedListenerInstalled) {
      inputBindedListenerInstalled = !0;
      try {
        "undefined" != typeof engine && engine && "function" == typeof engine.on && engine.on("InputActionBinded", () => {
          try {
            null != inputActionBindedTimer && clearTimeout(inputActionBindedTimer), inputActionBindedTimer = setTimeout(() => {
              inputActionBindedTimer = null;
              try {
                refreshEngineKeyMap();
              } catch (e2) {}
            }, 150);
          } catch (e) {
            try {
              refreshEngineKeyMap();
            } catch (e2) {}
          }
        });
      } catch (e) {}
    }
    return engineMap;
  },
  hotkeySlotForCode: function(hk, code) {
    if (!hk || !code) return null;
    for (let i = 0; i < HOTKEY_SLOT_KEYS.length; i++) {
      const k = HOTKEY_SLOT_KEYS[i];
      if (hk[k] === code) return k;
    }
    return null;
  },
  EAT_WORLD_ENGINE_ACTIONS: EAT_WORLD_ENGINE_ACTIONS,
  isEatableWorldAction: function(name) {
    return !("string" != typeof name || !name) && (EAT_WORLD_ENGINE_ACTIONS.indexOf(name) >= 0 || (0 === name.indexOf("open-") || 0 === name.indexOf("toggle-") || /-lens$/.test(name) || /-layer$/.test(name)));
  },
  stopKeydownPeers: function(e) {
    if (e) {
      try {
        e.preventDefault();
      } catch (err) {}
      try {
        e.stopPropagation();
      } catch (err) {}
      try {
        e.stopImmediatePropagation();
      } catch (err) {}
    }
  },
  readHotkeys: function() {
    if (cachedHotkeys) return cachedHotkeys;
    try {
      const s = readSettings();
      cachedHotkeys = s && s.hotkeys || Object.assign({}, DEFAULT_HOTKEYS);
    } catch (e) {
      cachedHotkeys = Object.assign({}, DEFAULT_HOTKEYS);
    }
    return cachedHotkeys;
  },
  invalidateHotkeysCache: invalidateHotkeysCache,
  normalizeHotkeys: normalizeHotkeys,
  formatHotkeyCode: formatHotkeyCode,
  resolveHotkeyCode: function(e) {
    if (!e) return "";
    if (e.code) return toGamefaceCode(e.code);
    const k = e.key;
    if ("[" === k) return "BracketLeft";
    if ("]" === k) return "BracketRight";
    if ("," === k) return "Comma";
    if ("." === k) return "Period";
    if ("-" === k) return "Minus";
    if ("=" === k) return "Equals";
    const kc = e.keyCode || e.which || 0;
    switch (kc) {
     case 9:
      return "Tab";

     case 27:
      return "Escape";

     case 37:
      return "ArrowLeft";

     case 38:
      return "ArrowUp";

     case 39:
      return "ArrowRight";

     case 40:
      return "ArrowDown";

     case 187:
      return "Equals";

     case 189:
      return "Minus";

     case 188:
      return "Comma";

     case 190:
      return "Period";

     case 219:
      return "BracketLeft";

     case 221:
      return "BracketRight";

     case 49:
     case 50:
     case 51:
     case 52:
     case 53:
     case 54:
     case 55:
      return "Digit" + (kc - 48);

     case 96:
     case 97:
     case 98:
     case 99:
     case 100:
     case 101:
     case 102:
     case 103:
     case 104:
     case 105:
      return "NumPad" + (kc - 96);

     default:
      return kc >= 65 && kc <= 90 ? "Key" + String.fromCharCode(kc) : "";
    }
  },
  readSettings: readSettings,
  writeSettings: function(patch) {
    try {
      const {shared: shared, container: container} = loadShared(), prev = container.settings || {}, next = Object.assign({}, DEFAULT_SETTINGS, prev, patch || {}), prevHk = normalizeHotkeys(prev.hotkeys);
      return patch && patch.hotkeys && "object" == typeof patch.hotkeys ? next.hotkeys = normalizeHotkeys(Object.assign({}, prevHk, patch.hotkeys)) : next.hotkeys = prevHk, 
      container.settings = next, container.updated = Date.now(), saveShared(shared, container), 
      invalidateHotkeysCache(), readSettings();
    } catch (e) {
      return err("settings write failed: " + e), invalidateHotkeysCache(), readSettings();
    }
  }
};

export { };
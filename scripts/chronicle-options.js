const LOG = "[chronicle-options]";

globalThis.ozqChronicleCommon || console.error("[ozq-chronicle] chronicle-common.js did not load before this script — check the UIScripts order in ozq-chronicle.modinfo");

const {L: L, PANEL_PAD_X: PANEL_PAD_X, HEADER_BOX: HEADER_BOX, TITLE_COL_ROW: TITLE_COL_ROW, TITLE_TEXT: TITLE_TEXT, HEADER_ACTIONS: HEADER_ACTIONS, makeNativeButton: makeNativeButton, CANCEL_ACTIONS: CANCEL_ACTIONS, isPressFinished: isPressFinished, installFrontInputHandler: installFrontInputHandler, scheduleInstall: scheduleInstall, noteOverlayOpened: noteOverlayOpened, isTopOverlay: isTopOverlay, forgetOverlay: forgetOverlay, readSettings: readSettings, writeSettings: writeSettings, DEFAULT_HOTKEYS: DEFAULT_HOTKEYS, HOTKEY_SLOT_KEYS: HOTKEY_SLOT_KEYS, isWatchedEngineAction: isWatchedEngineAction, engineCodesForAction: engineCodesForAction, nativeActionsForCode: nativeActionsForCode, isEngineBoundHotkeyCode: isEngineBoundHotkeyCode, refreshEngineKeyMap: refreshEngineKeyMap, stopKeydownPeers: stopKeydownPeers, readHotkeys: readHotkeys, engineLabelsForAction: engineLabelsForAction, formatHotkeyCode: formatHotkeyCode, resolveHotkeyCode: resolveHotkeyCode} = globalThis.ozqChronicleCommon, T = (key, ...args) => L(key, ...args), SETTINGS = [ {
  key: "fog",
  invert: !0,
  label: "LOC_CHRONICLE_OPT_SHOW_UNMET",
  description: "LOC_CHRONICLE_OPT_SHOW_UNMET_DESC"
} ], HOTKEY_ROWS = [ {
  slot: "catPrev",
  label: "LOC_CHRONICLE_OPT_HK_CAT_PREV"
}, {
  slot: "catNext",
  label: "LOC_CHRONICLE_OPT_HK_CAT_NEXT"
}, {
  slot: "chartPrev",
  label: "LOC_CHRONICLE_OPT_HK_CHART_PREV"
}, {
  slot: "chartNext",
  label: "LOC_CHRONICLE_OPT_HK_CHART_NEXT"
}, {
  slot: "pagePrev",
  label: "LOC_CHRONICLE_OPT_HK_PAGE_PREV"
}, {
  slot: "pageNext",
  label: "LOC_CHRONICLE_OPT_HK_PAGE_NEXT"
}, {
  slot: "openHof",
  label: "LOC_CHRONICLE_OPT_HK_OPEN_HOF"
}, {
  slot: "openOptions",
  label: "LOC_CHRONICLE_OPT_HK_OPEN_OPTIONS"
} ], HOTKEY_CAPTURE_BLOCKED = {
  Escape: !0,
  Digit1: !0,
  Digit2: !0,
  Digit3: !0,
  Digit4: !0,
  Digit5: !0,
  Digit6: !0,
  Digit7: !0,
  NumPad1: !0,
  NumPad2: !0,
  NumPad3: !0,
  NumPad4: !0,
  NumPad5: !0,
  NumPad6: !0,
  NumPad7: !0,
  Numpad1: !0,
  Numpad2: !0,
  Numpad3: !0,
  Numpad4: !0,
  Numpad5: !0,
  Numpad6: !0,
  Numpad7: !0
};

const GROUP_ID = "ozq_chronicle", GROUP_SELECTOR = `[data-group="${GROUP_ID}"]`;

function retitleGroupHeader(root) {
  const text = T("LOC_CHRONICLE_TITLE");
  let tries = 0;
  const attempt = () => {
    const headers = (root || document).querySelectorAll(GROUP_SELECTOR);
    let done = !1;
    headers.forEach(header => {
      null != header.getAttribute("title") && (header.getAttribute("title") !== text && header.setAttribute("title", text), 
      done = !0);
    }), !done && tries++ < 120 && requestAnimationFrame(attempt);
  };
  requestAnimationFrame(attempt);
}

function isOptionsScreen(el) {
  return el instanceof HTMLElement && "string" == typeof el.localName && "screen-options" === el.localName.toLowerCase();
}

function optionText(key) {
  return T(key);
}

function checkboxValue(setting) {
  const stored = !!readSettings()[setting.key];
  return setting.invert ? !stored : stored;
}

function setCheckbox(setting, checked) {
  const stored = setting.invert ? !checked : !!checked;
  writeSettings({
    [setting.key]: stored
  });
}

const PANEL_BOX_DIALOG = [ "position:fixed", "left:20%", "top:12%", "width:60%", "height:72%", "box-sizing:border-box", "z-index:999999", "pointer-events:auto", "background:#16130E", "border:2px solid #6B5842", "display:flex", "flex-direction:column", "padding:24px " + PANEL_PAD_X + "px", "overflow-x:hidden", "overflow-y:auto" ].join(";");

let activeRoot = null, activeOnClose = null, changedWhileOpen = !1, captureSlot = null, captureButton = null, capturePaintAll = null, captureCancelLatch = !1, captureEngineLatchCode = null;

function el(tag, style, text) {
  const node = document.createElement(tag);
  return style && node.setAttribute("style", style), null != text && (node.textContent = text), 
  node;
}

function cancelHotkeyCapture() {
  if (captureSlot = null, captureButton = null, "function" == typeof capturePaintAll) try {
    capturePaintAll();
  } catch (e) {}
}

function applyHotkeyCapture(code, fromEngine) {
  if (!captureSlot || !code) return;
  const slot = captureSlot, hk = readHotkeys(), prevCode = hk[slot], patch = {};
  for (let i = 0; i < HOTKEY_SLOT_KEYS.length; i++) {
    const k = HOTKEY_SLOT_KEYS[i];
    k !== slot && hk[k] === code && (patch[k] = prevCode && prevCode !== code ? prevCode : DEFAULT_HOTKEYS[k]);
  }
  patch[slot] = code, writeSettings({
    hotkeys: patch
  }), changedWhileOpen = !0, !fromEngine && isEngineBoundHotkeyCode(code) && (captureEngineLatchCode = code), 
  cancelHotkeyCapture();
}

function onOptionsKeydown(e) {
  if (!activeRoot || !isTopOverlay(activeRoot.id)) return;
  if (e.repeat) return;
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const code = resolveHotkeyCode(e);
  if (code) if (captureSlot) {
    if (stopKeydownPeers(e), "ShiftLeft" === code || "ShiftRight" === code || "ControlLeft" === code || "ControlRight" === code || "AltLeft" === code || "AltRight" === code || "MetaLeft" === code || "MetaRight" === code) return;
    if ("Escape" === code) return captureCancelLatch = !0, void cancelHotkeyCapture();
    if (HOTKEY_CAPTURE_BLOCKED[code] || e.shiftKey) return;
    applyHotkeyCapture(code);
  } else if (!e.shiftKey) try {
    code !== readHotkeys().openOptions || isEngineBoundHotkeyCode(code) || (stopKeydownPeers(e), 
    closeOptions());
  } catch (err) {}
}

function buildHotkeySection() {
  const section = el("div", "margin-top:18px;width:100%;box-sizing:border-box"), buttons = [];
  let openWorldBtn = null;
  const setLabelText = (label, text) => {
    const s = null == text || "" === text ? "?" : String(text);
    label.textContent !== s && (label.textContent = " ", label.textContent = s);
  }, paintAll = () => {
    (() => {
      if (!openWorldBtn) return;
      const label = openWorldBtn.querySelector(".ozq-btn-label");
      if (!label) return;
      const labs = engineLabelsForAction("open-ozq-chronicle");
      setLabelText(label, labs.length ? labs.join(" / ") : "—"), label.style.color = "#E8E2D0";
    })();
    const hk = readHotkeys();
    for (let i = 0; i < buttons.length; i++) {
      const b = buttons[i], label = b.querySelector(".ozq-btn-label");
      label && (captureSlot === b._slot ? (setLabelText(label, T("LOC_CHRONICLE_OPT_HK_PRESS")), 
      label.style.color = "#FFD98A", b.style.opacity = "1") : (setLabelText(label, formatHotkeyCode(hk[b._slot])), 
      label.style.color = "#E8E2D0", b.style.opacity = "0.85"));
    }
  };
  capturePaintAll = paintAll;
  const titleRow = el("div", "display:flex;flex-direction:row;align-items:center;justify-content:space-between;width:100%;box-sizing:border-box;padding:10px 0;border-bottom:1px solid #3A3227"), titleText = el("div", "display:flex;flex-direction:column;flex:1 1 auto;min-width:0;margin-right:16px");
  titleText.appendChild(el("div", "color:#F0E6D2;font-size:1.05rem", T("LOC_CHRONICLE_OPT_HK_SECTION"))), 
  titleText.appendChild(el("div", "color:#B7A987;font-size:0.78rem;margin-top:3px", T("LOC_CHRONICLE_OPT_HK_SECTION_DESC"))), 
  titleRow.appendChild(titleText);
  const resetBtn = makeNativeButton(T("LOC_CHRONICLE_OPT_HK_RESET"), () => {
    cancelHotkeyCapture(), writeSettings({
      hotkeys: Object.assign({}, DEFAULT_HOTKEYS)
    }), changedWhileOpen = !0, paintAll();
  }, {
    secondary: !0
  });
  resetBtn.style.opacity = "0.72", resetBtn.style.flexShrink = "0", titleRow.appendChild(resetBtn), 
  section.appendChild(titleRow);
  const openWorldRow = el("div", "display:flex;flex-direction:row;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #3A3227;width:100%;box-sizing:border-box"), openWorldText = el("div", "display:flex;flex-direction:column;flex:1 1 auto;min-width:0;margin-right:16px");
  openWorldText.appendChild(el("div", "color:#F0E6D2;font-size:0.95rem", T("LOC_CHRONICLE_OPT_HK_OPEN_WORLD"))), 
  openWorldText.appendChild(el("div", "color:#8A7F63;font-size:0.78rem;margin-top:3px", T("LOC_CHRONICLE_OPT_HK_OPEN_WORLD_NOTE"))), 
  openWorldRow.appendChild(openWorldText), openWorldBtn = makeNativeButton("", () => {}, {
    secondary: !0
  }), openWorldBtn.style.flexShrink = "0", openWorldBtn.style.width = "13.33rem", 
  openWorldBtn.style.boxSizing = "border-box", openWorldBtn.style.opacity = "0.45", 
  openWorldBtn.style.pointerEvents = "none", openWorldBtn.style.cursor = "default", 
  openWorldRow.appendChild(openWorldBtn), section.appendChild(openWorldRow);
  for (let i = 0; i < HOTKEY_ROWS.length; i++) {
    const rowDef = HOTKEY_ROWS[i], row = el("div", "display:flex;flex-direction:row;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #3A3227;width:100%;box-sizing:border-box"), textCol = el("div", "display:flex;flex-direction:column;flex:1 1 auto;min-width:0;margin-right:16px");
    textCol.appendChild(el("div", "color:#F0E6D2;font-size:0.95rem", T(rowDef.label))), 
    row.appendChild(textCol);
    const button = makeNativeButton("", () => {
      captureSlot !== rowDef.slot ? (captureSlot = rowDef.slot, captureButton = button, 
      paintAll()) : cancelHotkeyCapture();
    }, {
      secondary: !0
    });
    button._slot = rowDef.slot, button.style.flexShrink = "0", button.style.width = "13.33rem", 
    button.style.boxSizing = "border-box", buttons.push(button), row.appendChild(button), 
    section.appendChild(row);
  }
  return paintAll(), section;
}

function buildRow(setting) {
  const row = el("div", "display:flex;flex-direction:row;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid #3A3227;width:100%;box-sizing:border-box"), textCol = el("div", "display:flex;flex-direction:column;flex:1 1 auto;min-width:0;margin-right:20px");
  textCol.appendChild(el("div", "color:#F0E6D2;font-size:1.05rem", T(setting.label))), 
  textCol.appendChild(el("div", "color:#B7A987;font-size:0.85rem;margin-top:4px", T(setting.description))), 
  row.appendChild(textCol);
  const button = makeNativeButton("", () => {
    setCheckbox(setting, !checkboxValue(setting)), changedWhileOpen = !0, paint();
  }, {
    secondary: !0
  }), paint = () => {
    const on = checkboxValue(setting), label = button.querySelector(".ozq-btn-label");
    label && (label.textContent = T(on ? "LOC_CHRONICLE_OPT_ON" : "LOC_CHRONICLE_OPT_OFF"), 
    label.style.color = on ? "#FFD98A" : "#E8E2D0"), button.style.opacity = on ? "1" : "0.72";
  };
  return paint(), button.style.minWidth = "96px", row.appendChild(button), row;
}

function closeOptions() {
  if (!activeRoot) return;
  cancelHotkeyCapture(), captureCancelLatch = !1, captureEngineLatchCode = null, capturePaintAll = null, 
  forgetOverlay(activeRoot.id), activeRoot.remove(), activeRoot = null;
  const onClose = activeOnClose, changed = changedWhileOpen;
  if (activeOnClose = null, changedWhileOpen = !1, "function" == typeof onClose) try {
    onClose({
      changed: changed
    });
  } catch (e) {}
}

const optionsInputHandler = {
  handleInput(e) {
    const d = e && e.detail || {};
    if (!activeRoot || !isTopOverlay(activeRoot.id)) return !0;
    if (!d.name) return !0;
    if (isWatchedEngineAction(d.name)) {
      const codes = engineCodesForAction(d.name);
      if (captureSlot) {
        if (isPressFinished(e)) {
          const engCode = codes[0] || "";
          engCode && !HOTKEY_CAPTURE_BLOCKED[engCode] && applyHotkeyCapture(engCode, !0);
        }
        return !1;
      }
      if (captureEngineLatchCode && codes.indexOf(captureEngineLatchCode) >= 0) return isPressFinished(e) && (captureEngineLatchCode = null), 
      !1;
      if (isPressFinished(e)) try {
        const hk = readHotkeys();
        for (let i = 0; i < codes.length; i++) if (hk.openOptions === codes[i]) {
          closeOptions();
          break;
        }
      } catch (err) {}
      return !1;
    }
    return CANCEL_ACTIONS.indexOf(d.name) < 0 || (captureSlot || captureCancelLatch ? (captureCancelLatch = !0, 
    isPressFinished(e) && (cancelHotkeyCapture(), captureCancelLatch = !1), !1) : (isPressFinished(e) && closeOptions(), 
    !1));
  },
  handleNavigation: () => !0
};

try {
  globalThis.ozqChronicleOptions = {
    open: function(opts) {
      if (activeRoot) return;
      activeOnClose = (opts = opts || {}).onClose || null, changedWhileOpen = !1;
      const root = el("div", "");
      root.id = "ozq-chronicle-options-overlay", activeRoot = root, noteOverlayOpened("ozq-chronicle-options-overlay");
      try {
        refreshEngineKeyMap("options-open");
      } catch (e) {}
      const backdrop = el("div", "position:fixed;left:0;top:0;width:100%;height:100%;z-index:999998;background:rgba(6,7,10,0.55);pointer-events:auto");
      backdrop.addEventListener("click", closeOptions), root.appendChild(backdrop);
      const panel = el("div", PANEL_BOX_DIALOG);
      root.appendChild(panel);
      const header = el("div", HEADER_BOX), titleCol = el("div", TITLE_COL_ROW), title = el("div", TITLE_TEXT, T("LOC_CHRONICLE_OPT_TITLE"));
      title.className = "font-title uppercase tracking-150", titleCol.appendChild(title), 
      header.appendChild(titleCol);
      const actions = el("div", HEADER_ACTIONS), closeBtn = makeNativeButton(T("LOC_GENERIC_CLOSE"), closeOptions, {});
      closeBtn.style.opacity = "0.72";
      const closeLabel = closeBtn.querySelector(".ozq-btn-label");
      closeLabel && (closeLabel.style.color = "#E8E2D0"), actions.appendChild(closeBtn), 
      header.appendChild(actions), panel.appendChild(header);
      for (const setting of SETTINGS) panel.appendChild(buildRow(setting));
      panel.appendChild(buildHotkeySection()), panel.appendChild(el("div", "color:#8A7F63;font-size:0.8rem;margin-top:16px", T("LOC_CHRONICLE_OPT_ALSO_IN_MENU"))), 
      document.body.appendChild(root);
    },
    close: closeOptions,
    read: readSettings,
    version: "0.33.50"
  };
} catch (e) {}

scheduleInstall(function() {
  installFrontInputHandler(optionsInputHandler);
  try {
    document.addEventListener("keydown", onOptionsKeydown, !0);
  } catch (e) {}
  Promise.all([ import("/core/ui/options/model-options.js"), import("/core/ui/options/options-helpers.js"), import("/core/ui/options/screen-options.js") ]).then(([modelOptions, helpers]) => {
    const {Options: Options, OptionType: OptionType, CategoryType: CategoryType} = modelOptions, {CategoryData: CategoryData} = helpers;
    Options && OptionType && CategoryType && CategoryData ? (CategoryType.Mods = "mods", 
    CategoryData[CategoryType.Mods] = {
      title: "LOC_UI_CONTENT_MGR_SUBTITLE",
      description: "LOC_UI_CONTENT_MGR_SUBTITLE_DESCRIPTION"
    }, Options.__ozqInitPatched || (Options.addInitCallback = function(callback) {
      this.optionsInitCallbacks.push(callback), this.optionsReInitCallbacks.push(callback);
    }, Options.__ozqInitPatched = !0), Options.addInitCallback(() => {
      for (const setting of SETTINGS) Options.addOption({
        category: CategoryType.Mods,
        group: GROUP_ID,
        type: OptionType.Checkbox,
        id: "ozq-chronicle-" + setting.key,
        label: optionText(setting.label),
        description: optionText(setting.description),
        initListener: optionInfo => {
          optionInfo.currentValue = checkboxValue(setting);
        },
        updateListener: (_optionInfo, value) => {
          setCheckbox(setting, value);
        }
      });
    })) : console.error(`${LOG} options model missing expected exports; Mods tab skipped`);
  }).catch(e => {
    console.error(`${LOG} could not register Add-ons options (${e}) — in-overlay Options still works`);
  }), function() {
    const existing = document.querySelector("screen-options");
    existing && retitleGroupHeader(existing), new MutationObserver(mutations => {
      for (const mutation of mutations) for (const added of mutation.addedNodes) added instanceof HTMLElement && (isOptionsScreen(added) || added.querySelector && added.querySelector("screen-options")) && retitleGroupHeader(added);
    }).observe(document.body, {
      childList: !0,
      subtree: !0
    });
  }(), console.error(`${LOG} loaded.`);
});

export { };
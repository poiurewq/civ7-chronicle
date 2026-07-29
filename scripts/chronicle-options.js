const LOG = "[chronicle-options]";

globalThis.ozqChronicleCommon || console.error("[ozq-chronicle] chronicle-common.js did not load before this script — check the UIScripts order in ozq-chronicle.modinfo");

const {L: L, PANEL_PAD_X: PANEL_PAD_X, HEADER_BOX: HEADER_BOX, TITLE_COL_ROW: TITLE_COL_ROW, TITLE_TEXT: TITLE_TEXT, HEADER_ACTIONS: HEADER_ACTIONS, makeNativeButton: makeNativeButton, CANCEL_ACTIONS: CANCEL_ACTIONS, isPressFinished: isPressFinished, installFrontInputHandler: installFrontInputHandler, scheduleInstall: scheduleInstall, noteOverlayOpened: noteOverlayOpened, isTopOverlay: isTopOverlay, forgetOverlay: forgetOverlay, readSettings: readSettings, writeSettings: writeSettings} = globalThis.ozqChronicleCommon, T = (key, ...args) => L(key, ...args), SETTINGS = [ {
  key: "fog",
  invert: !0,
  label: "LOC_CHRONICLE_OPT_SHOW_UNMET",
  description: "LOC_CHRONICLE_OPT_SHOW_UNMET_DESC"
} ];

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

const PANEL_BOX_DIALOG = [ "position:fixed", "left:24%", "top:20%", "width:52%", "height:46%", "box-sizing:border-box", "z-index:999999", "pointer-events:auto", "background:#16130E", "border:2px solid #6B5842", "display:flex", "flex-direction:column", "padding:24px " + PANEL_PAD_X + "px", "overflow-x:hidden", "overflow-y:auto" ].join(";");

let activeRoot = null, activeOnClose = null, changedWhileOpen = !1;

function el(tag, style, text) {
  const node = document.createElement(tag);
  return style && node.setAttribute("style", style), null != text && (node.textContent = text), 
  node;
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
    return !activeRoot || !isTopOverlay(activeRoot.id) || (!d.name || CANCEL_ACTIONS.indexOf(d.name) < 0 || (isPressFinished(e) && closeOptions(), 
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
      panel.appendChild(el("div", "color:#8A7F63;font-size:0.8rem;margin-top:16px", T("LOC_CHRONICLE_OPT_ALSO_IN_MENU"))), 
      document.body.appendChild(root);
    },
    close: closeOptions,
    read: readSettings,
    version: "0.33.1"
  };
} catch (e) {}

scheduleInstall(function() {
  installFrontInputHandler(optionsInputHandler), Promise.all([ import("/core/ui/options/model-options.js"), import("/core/ui/options/options-helpers.js"), import("/core/ui/options/screen-options.js") ]).then(([modelOptions, helpers]) => {
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
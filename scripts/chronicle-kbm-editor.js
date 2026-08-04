const LOG = "[ozq-chronicle-kbm]", CHRONICLE_KBM_ACTIONS = [ "open-ozq-chronicle" ];

class OzqChronicleEditorKeyboardMapping {
  static patched=null;
  constructor(component) {
    this.component = component, this.component.ozqChronicleKbm = this, this.patchPrototype(Object.getPrototypeOf(component));
  }
  patchPrototype(proto) {
    if (OzqChronicleEditorKeyboardMapping.patched) return;
    const c = OzqChronicleEditorKeyboardMapping.patched = {
      proto: proto
    };
    c.addActionsForContext = c.proto.addActionsForContext, c.proto.addActionsForContext = function(...args) {
      const crv = c.addActionsForContext.apply(this, args), self = this.ozqChronicleKbm;
      if (self) {
        const arv = self.afterAddActionsForContext(...args);
        return void 0 !== arv ? arv : crv;
      }
      return crv;
    };
  }
  beforeAttach() {}
  afterAttach() {}
  beforeDetach() {}
  afterDetach() {}
  afterAddActionsForContext(inputContext) {
    if (this.component && this.component.actionContainer && "undefined" != typeof Input && "function" == typeof Input.getActionIdByName) for (let i = 0; i < CHRONICLE_KBM_ACTIONS.length; i++) {
      const actionIdString = CHRONICLE_KBM_ACTIONS[i];
      let actionId = null;
      try {
        actionId = Input.getActionIdByName(actionIdString);
      } catch (e) {
        actionId = null;
      }
      if (actionId) {
        if (!this.component.mappingDataMap || !this.component.mappingDataMap.has(actionId)) if ("function" == typeof this.component.createActionEntry) try {
          this.component.actionContainer.appendChild(this.component.createActionEntry(actionId, inputContext));
        } catch (e) {
          console.error(LOG + " createActionEntry failed for " + actionIdString + ": " + e);
        } else console.error(LOG + " createActionEntry missing on editor-keyboard-mapping");
      } else console.error(LOG + " getActionIdByName failed for " + actionIdString);
    }
  }
}

try {
  "undefined" != typeof Controls && "function" == typeof Controls.decorate ? Controls.decorate("editor-keyboard-mapping", component => new OzqChronicleEditorKeyboardMapping(component)) : console.error(LOG + " Controls.decorate unavailable; KBM row not injected");
} catch (e) {
  console.error(LOG + " decorate failed: " + e);
}

export { };
import { applyChildNodes } from "../core/utilities.js";
import * as internal from "./internal.js";
import * as template from "../core/template.js";
import Dialog from "./Dialog.js";

/**
 * Asks a single question the user can answer with choice buttons
 *
 * @inherits Dialog
 * @part {button} choice-button - a button representing a choice
 */
class AlertDialog extends Dialog {
  [internal.componentDidMount]() {
    super[internal.componentDidMount]();
    this[internal.ids].buttonContainer.addEventListener(
      "click",
      async event => {
        // TODO: Ignore clicks on buttonContainer background.
        const button = event.target;
        if (button instanceof HTMLElement) {
          const choice = button.textContent;
          this[internal.raiseChangeEvents] = true;
          await this.close({ choice });
          this[internal.raiseChangeEvents] = false;
        }
      }
    );
  }

  /**
   * The buttons created by the component to represent the choices in the
   * [choices](#choices) property.
   *
   * @type {HTMLElement[]}
   */
  get choiceButtons() {
    return this[internal.state].choiceButtons;
  }

  /**
   * The class, tag, or template used to create the `choice-button` parts —
   * the set of choices shown to the user.
   *
   * @type {PartDescriptor}
   * @default 'button'
   */
  get choiceButtonPartType() {
    return this[internal.state].choiceButtonPartType;
  }
  set choiceButtonPartType(choiceButtonPartType) {
    this[internal.setState]({ choiceButtonPartType });
  }

  /**
   * An array of strings indicating the choices the `AlertDialog` will present
   * to the user as responses to the alert. For each string in the array, the
   * `AlertDialog` displays a button labeled with that string.
   *
   * By default, this is an array with a single choice, "OK".
   *
   * @type {string[]}
   */
  get choices() {
    return this[internal.state].choices;
  }
  set choices(choices) {
    this[internal.setState]({ choices });
  }

  get [internal.defaultState]() {
    return Object.assign(super[internal.defaultState], {
      choiceButtonPartType: "button",
      choiceButtons: [],
      choices: ["OK"]
    });
  }

  // Let the user select a choice by pressing its initial letter.
  [internal.keydown](/** @type {KeyboardEvent} */ event) {
    let handled = false;

    const key = event.key.length === 1 && event.key.toLowerCase();
    if (key) {
      // See if one of the choices starts with the key.
      const choice = this.choices.find(
        choice => choice[0].toLowerCase() === key
      );
      if (choice) {
        this.close({
          choice
        });
        handled = true;
      }
    }

    // Prefer mixin result if it's defined, otherwise use base result.
    return (
      handled ||
      (super[internal.keydown] && super[internal.keydown](event)) ||
      false
    );
  }

  [internal.render](/** @type {PlainObject} */ changed) {
    super[internal.render](changed);
    if (changed.choiceButtons) {
      applyChildNodes(
        this[internal.ids].buttonContainer,
        this[internal.state].choiceButtons
      );
    }
  }

  [internal.stateEffects](state, changed) {
    const effects = super[internal.stateEffects](state, changed);

    // When choices or choice button part type changes, regenerate buttons.
    if (changed.choiceButtonPartType || changed.choices) {
      /** @type {string[]} */ const choices = state.choices;
      const choiceButtons = choices.map(choice => {
        const button = template.createElement(state.choiceButtonPartType);
        if ("part" in button) {
          /** @type {any} */ (button).part = "choice-button";
        }
        button.textContent = choice;
        return button;
      });
      Object.freeze(choiceButtons);
      Object.assign(effects, {
        choiceButtons
      });
    }

    return effects;
  }

  get [internal.template]() {
    const result = super[internal.template];
    // Fill the default slot with a new default slot and a button container.
    const defaultSlot = template.defaultSlot(result.content);
    if (defaultSlot) {
      const alertDialogTemplate = template.html`
        <div id="alertDialogContent">
          <slot></slot>
          <div id="buttonContainer"></div>
        </div>
      `;
      template.transmute(defaultSlot, alertDialogTemplate);
    }
    return result;
  }
}

export default AlertDialog;

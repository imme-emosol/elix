import * as internal from "../base/internal.js";
import DateComboBox from "../base/DateComboBox.js";
import html from "../core/html.js";
import PlainButton from "./PlainButton.js";
import PlainCalendarMonthNavigator from "./PlainCalendarMonthNavigator.js";
import PlainComboBoxMixin from "./PlainComboBoxMixin.js";

/**
 * DateComboBox component in the Plain reference design system
 *
 * @inherits DateComboBox
 */
class PlainDateComboBox extends PlainComboBoxMixin(DateComboBox) {
  get [internal.defaultState]() {
    return Object.assign(super[internal.defaultState], {
      calendarPartType: PlainCalendarMonthNavigator,
      todayButtonPartType: PlainButton
    });
  }

  get [internal.template]() {
    const result = super[internal.template];
    result.content.append(
      html`
        <style>
          :host {
            width: 8em;
          }

          #calendar {
            margin: 0.5em;
          }

          #todayButton {
            border: 1px solid transparent;
            padding: 0.5em;
          }

          #todayButton:hover {
            border-color: gray;
          }
        </style>
      `
    );
    return result;
  }
}

export default PlainDateComboBox;

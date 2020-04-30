// Elix is a JavaScript project, but we define TypeScript declarations so we can
// confirm our code is type safe, and to support TypeScript users.

import FormElementMixin from "./FormElementMixin.js";
import ItemsAPIMixin from "./ItemsAPIMixin.js";
import MenuButton from "./MenuButton.js";
import SelectedItemTextValueMixin from "./SelectedItemTextValueMixin.js";
import SingleSelectAPIMixin from "./SingleSelectAPIMixin.js";
import SlotItemsMixin from "./SlotItemsMixin.js";

export default class PlainDropdownList extends FormElementMixin(
  ItemsAPIMixin(
    SelectedItemTextValueMixin(SingleSelectAPIMixin(SlotItemsMixin(MenuButton)))
  )
) {
  defaultMenuSelectedIndex: number;
  valuePartType: PartDescriptor;
}

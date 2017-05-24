// Elix is a JavaScript project, but we use TypeScript as an internal tool to
// confirm our code is type safe.

/// <reference path="../elix.d.ts"/>

declare const SelectedItemTextValueMixin: Mixin<{
  items?: Element[];
  selectedItem?: Element;
}, {
  value: string;
}>;

export default SelectedItemTextValueMixin;

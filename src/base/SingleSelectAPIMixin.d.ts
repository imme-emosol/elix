// Elix is a JavaScript project, but we define TypeScript declarations so we can
// confirm our code is type safe, and to support TypeScript users.

/// <reference path="../core/shared.d.ts"/>

declare const SingleSelectAPIMixin: Mixin<
  {},
  {
    canSelectNext: boolean;
    canSelectPrevious: boolean;
    selectedIndex: number;
    selectedItem: Element | null;
    selectFirst(): boolean;
    selectLast(): boolean;
    selectionRequired: boolean;
    selectionWraps: boolean;
    selectNext(): boolean;
    selectPrevious(): boolean;
  }
>;

export default SingleSelectAPIMixin;

// Elix is a JavaScript project, but we define TypeScript declarations so we can
// confirm our code is type safe, and to support TypeScript users.

/// <reference path="../core/shared.d.ts"/>

import { contentSlot } from "./internal.js";

declare const SlotContentMixin: StateMixin<
  {},
  {},
  {
    readonly [contentSlot]: HTMLSlotElement | null;
  },
  {
    content: Node[];
  }
>;

export default SlotContentMixin;

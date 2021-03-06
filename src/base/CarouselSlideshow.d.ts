// Elix is a JavaScript project, but we define TypeScript declarations so we can
// confirm our code is type safe, and to support TypeScript users.

import Carousel from "./Carousel.js";
import TimerCursorMixin from "./TimerCursorMixin.js";

export default class CarouselSlideshow extends TimerCursorMixin(Carousel) {
  transitionDuration: number;
}

import './Popup.js';
import './PopupFrame.js';
import { merge } from './updates.js';
import * as symbols from './symbols.js';
import FocusVisibleMixin from './FocusVisibleMixin.js';
import KeyboardMixin from './KeyboardMixin.js';
import OpenCloseMixin from './OpenCloseMixin.js';
import ReactiveElement from './ReactiveElement.js';

const backdropTagKey = Symbol('backdropTag');
const frameTagKey = Symbol('frameTag');
const popupButtonTagKey = Symbol('popupButtonTag');
const popupTagKey = Symbol('popupTag');


const Base =
  FocusVisibleMixin(
  KeyboardMixin(
  OpenCloseMixin(
    ReactiveElement
  )));


/**
 * @elementtag {Backdrop} backdrop
 * @elementtag {OverlayFrame} frame
 * @elementtag {Popup} popup
 * @elementtag {HTMLButtonElement} popupButton
 */
class PopupSource extends Base {

  get backdropTag() {
    return this[backdropTagKey];
  }
  set backdropTag(backdropTag) {
    this[symbols.hasDynamicTemplate] = true;
    this[backdropTagKey] = backdropTag;
  }

  componentDidMount() {
    if (super.componentDidMount) { super.componentDidMount(); }
    // Desktop popups generally open on mousedown, not click/mouseup. On mobile,
    // mousedown won't fire until the user releases their finger, so it behaves
    // like a click.
    this.$.button.addEventListener('mousedown', event => {
      // Only handle primary button mouse down to avoid interfering with
      // right-click behavior.
      /** @type {any} */
      const cast = event;
      if (cast.button === 0 && !this.opened) {
        setTimeout(() => {
          this[symbols.raiseChangeEvents] = true;
          this.open()
          this[symbols.raiseChangeEvents] = false;
        });
      }
    });
    this.$.popup.addEventListener('opened-changed', event => {
      /** @type {any} */ 
      const cast = event;
      const opened = cast.detail.opened;
      if (opened !== this.opened) {
        this[symbols.raiseChangeEvents] = true;
        this.opened = opened;
        this[symbols.raiseChangeEvents] = false;
      }
    });
  }

  componentDidUpdate(previousState) {
    if (super.componentDidUpdate) { super.componentDidUpdate(previousState); }
    if (this.state.opened && !previousState.opened) {
      // Wait a tick to let the newly-opened component actually render.
      setTimeout(() => {
        // See if the rendered component fits above/below/left/right w.r.t. the
        // source.
        const { fitsAbove, fitsBelow, fitsLeft, fitsRight } = checkPopupFits(this, this.$.popup);
        this.setState({
          fitChecked: true,
          fitsAbove,
          fitsBelow,
          fitsLeft,
          fitsRight
        });
      });
    }
  }

  get defaults() {
    return {
      tags: {
        backdrop: 'elix-backdrop',
        frame: 'elix-popup-frame', // TODO: Move to Popup
        popup: 'elix-popup',
        popupButton: 'button'
      }
    };
  }

  get defaultState() {
    return Object.assign({}, super.defaultState, {
      fitChecked: false,
      fitsAbove: true,
      fitsBelow: true,
      fitsLeft: true,
      fitsRight: true,
      horizontalAlign: 'left',
      popupPosition: 'below'
    });
  }

  get frameTag() {
    return this[frameTagKey];
  }
  set frameTag(frameTag) {
    this[symbols.hasDynamicTemplate] = true;
    this[frameTagKey] = frameTag;
  }

  // TODO: 'start', 'end'
  get horizontalAlign() {
    return this.state.horizontalAlign;
  }
  set horizontalAlign(horizontalAlign) {
    this.setState({
      horizontalAlign
    });
  }

  [symbols.keydown](event) {
    let handled;
    switch (event.key) {
      // Pressing Enter or Space opens the popup.
      case 'Enter':
      case ' ':
        this.open();
        handled = true;
        break;
    }

    // Prefer mixin result if it's defined, otherwise use base result.
    return handled || (super[symbols.keydown] && super[symbols.keydown](event));
  }

  get popupButtonTemplate() {
    const popupButtonTag = this.popupButtonTag || this.defaults.tags.popupButton;
    return `
      <${popupButtonTag} id="button" tabindex="-1">
        <slot></slot>
      </${popupButtonTag}>
    `;
  }

  get popupPosition() {
    return this.state.popupPosition;
  }
  set popupPosition(popupPosition) {
    this.setState({
      popupPosition
    });
  }

  get popupButtonTag() {
    return this[popupButtonTagKey];
  }
  set popupButtonTag(popupButtonTag) {
    this[symbols.hasDynamicTemplate] = true;
    this[popupButtonTagKey] = popupButtonTag;
  }

  get popupTag() {
    return this[popupTagKey];
  }
  set popupTag(popupTag) {
    this[symbols.hasDynamicTemplate] = true;
    this[popupTagKey] = popupTag;
  }

  get popupTemplate() {
    const backdropTag = this.backdropTag || this.defaults.tags.backdrop;
    const frameTag = this.frameTag || this.defaults.tags.frame;
    const popupTag = this.popupTag || this.defaults.tags.popup;
    return `
      <${popupTag} id="popup" backdrop-tag="${backdropTag}" frame-tag="${frameTag}">
        <slot name="popup"></slot>
      </${popupTag}>
    `;
  }

  refineState(state) {
    let result = super.refineState ? super.refineState(state) : true;
    if (state.opened && !this.opened &&
        (!state.fitsAbove || !state.fitsBelow || !state.fitsLeft || !state.fitsRight)) {
      // Reset our expectations of whether the opening component will fit above
      // and below. Assume it will fit in either direction.
      Object.assign(state, {
        fitChecked: false,
        fitsAbove: true,
        fitsBelow: true,
        fitsLeft: true,
        fitsRight: true
      });
      result = false;
    }
    return result;
  }

  // TODO: Tags for popup and source
  get [symbols.template]() {
    const popupButtonTemplate = this.popupButtonTemplate;
    const popupTemplate = this.popupTemplate;
    return `
      <style>
        :host {
          display: inline-block;
          position: relative;
        }

        #button {
          border-style: solid;
          color: inherit;
          display: block;
          font-size: inherit;
          font-family: inherit;
          font-style: inherit;
          margin: 0;
          outline: none;
          -moz-user-select: none;
          -ms-user-select: none;
          -webkit-user-select: none;
          user-select: none;
        }

        #popupContainer {
          height: 0;
          outline: none;
          position: absolute;
          width: 100%;
        }

        #popup {
          align-items: initial;
          flex-direction: initial;
          height: initial;
          justify-content: initial;
          left: initial;
          outline: none;
          position: absolute;
          top: initial;
          width: initial;
        }
      </style>
      ${popupButtonTemplate}
      <div id="popupContainer">
        ${popupTemplate}
      </div>
    `;
  }

  // TODO: Pressed state for button
  get updates() {

    const base = super.updates;

    const opened = this.state.opened;
    const buttonStyle = {
      'background-color': opened ? 'highlight' : '',
      color: opened ? 'highlighttext' : ''
    };

    const preferPositionBelow = this.state.popupPosition === 'below';
    const { fitChecked, fitsAbove, fitsBelow, fitsLeft, fitsRight } = this.state;

    // If we're requested to position the popup below, we do so if there's room
    // below; if not, we position above if there's room above. If there's no
    // room in either direction, we position below.
    // Same general rule applies if we're requested to position above.
    const positionBelow = preferPositionBelow && (fitsBelow || !fitsAbove) ||
      !preferPositionBelow && !fitsAbove && fitsBelow;

    // Position container.
    const popupContainerStyle = {
      top: positionBelow ? '' : 0
    };

    // Position popup.
    const bottom = positionBelow ? '' : 0;

    let left;
    let right;
    const horizontalAlign = this.state.horizontalAlign;
    if (horizontalAlign === 'stretch') {
      left = 0;
      right = 0;
    } else {
      const preferLeftAlign = horizontalAlign === 'left';
      // The above/below preference rules also apply to left/right positioning.
      const positionLeft = preferLeftAlign && (fitsRight || !fitsLeft) ||
        !preferLeftAlign && !fitsRight && fitsLeft;
      left = positionLeft ? 0 : '';
      right = !positionLeft ? 0 : '';
    }

    // Until we've checked the rendered position of the popup, keep it in the
    // layout but don't make it visible yet.
    const visibility = fitChecked ? '' : 'hidden';

    const popupStyle = {
      bottom,
      left,
      right,
      visibility
    };

    return merge(base, {
      $: {
        button: {
          style: buttonStyle
        },
        popup: {
          opened: this.state.opened,
          style: popupStyle
        },
        popupContainer: {
          style: popupContainerStyle
        }
      }
    });
  }

}


function checkPopupFits(source, popup) {
  const sourceRect = source.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  const fitsAbove = sourceRect.top >= popupRect.height;
  const fitsBelow = sourceRect.bottom + popupRect.height <= window.innerHeight;
  const fitsLeft = sourceRect.right >= popupRect.width;
  const fitsRight = sourceRect.left + popupRect.width <= window.innerWidth;
  return {
    fitsAbove,
    fitsBelow,
    fitsLeft,
    fitsRight
  };
}


export default PopupSource;
customElements.define('elix-popup-source', PopupSource);

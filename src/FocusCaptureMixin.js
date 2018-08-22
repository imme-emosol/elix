import * as symbols from './symbols.js';
import * as template from './template.js';


// Symbols for private data members on an element.
const patch = Symbol('patch');
/** @type {any} */
const wrappingFocusKey = Symbol('wrappingFocus');


/**
 * This mixin patches a component’s template such that, once the component gains
 * the keyboard focus, Tab and Shift+Tab operations will cycle the focus within
 * the component.
 * 
 * This mixin expects the component to provide:
 * 
 * * A template-stamping mechanism compatible with `ShadowTemplateMixin`.
 * 
 * The mixin provides these features to the component:
 * 
 * * Template elements and event handlers that will cause the keyboard focus to wrap.
 *
 * This mixin [contributes to a component's template](mixins#mixins-that-contribute-to-a-component-s-template).
 * See that discussion for details on how to use such a mixin.
 * 
 * @module FocusCaptureMixin
 */
function FocusCaptureMixin(base) {

  class FocusCapture extends base {

    componentDidMount() {
      if (super.componentDidMount) { super.componentDidMount(); }
      this.$.focusCatcher.addEventListener('focus', () => {
        if (!this[wrappingFocusKey]) {
          // Wrap focus back to the dialog.
          this.focus();
        }
      });
    }

    [symbols.keydown](event) {
      /** @type {any} */
      const element = this;
      if (document.activeElement === element &&
          this.shadowRoot.activeElement === null &&
          event.key === 'Tab' && event.shiftKey) {
        // Set focus to focus catcher.
        // The Shift+Tab keydown event should continue bubbling, and the default
        // behavior should cause it to end up on the last focusable element.
        this[wrappingFocusKey] = true;
        this.$.focusCatcher.focus();
        this[wrappingFocusKey] = false;
        // Don't mark the event as handled, since we want it to keep bubbling up.
      }

      // Prefer mixin result if it's defined, otherwise use base result.
      return (super[symbols.keydown] && super[symbols.keydown](event)) || false;
    }

    /**
     * Patch a DOM tree with additional elements necessary to capture focus.
     * 
     * Call this method in a components `symbols.template` property.
     * Invoke this method as `this[FocusCaptureMixin.patch](element)`.
     * 
     * @param {Node} original - the element within which focus should wrap
     */
    [patch](original) {
      const focusCatcher = template.html`<div id="focusCatcher" tabindex="0"></div>`;
      if (original.parentNode) {
        original.parentNode.insertBefore(focusCatcher.content, original.nextSibling);
      } else {
        /* eslint-disable no-console */
        console.warn(`FocusCaptureMixin[patch] can only patch an element that has a parent.`);
      }
    }

  }

  return FocusCapture;
}


FocusCaptureMixin.patch = patch;


export default FocusCaptureMixin;

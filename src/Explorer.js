import './Modes.js';
import { merge } from './updates.js';
import * as symbols from './symbols.js';
import AriaListMixin from './AriaListMixin.js';
import ContentItemsMixin from './ContentItemsMixin.js';
import ElementBase from './ElementBase.js';
import SingleSelectionMixin from './SingleSelectionMixin.js';
import SlotContentMixin from './SlotContentMixin.js';


const proxyTagKey = Symbol('proxyTag');
const listKey = Symbol('list');
const proxySlotchangeFiredKey = Symbol('proxySlotchangeFired');
const listTagKey = Symbol('listTag');
const previousItemsKey = Symbol('previousItems');
const stageTagKey = Symbol('stageTag');


const Base =
  AriaListMixin(
  ContentItemsMixin(
  SingleSelectionMixin(
  SlotContentMixin(
    ElementBase
  ))));


class Explorer extends Base {

  componentDidMount() {
    if (super.componentDidMount) { super.componentDidMount(); }
    const handleSelectedIndexChanged = event => {
      this[symbols.raiseChangeEvents] = true;
      const selectedIndex = event.detail.selectedIndex;
      if (this.selectedIndex !== selectedIndex) {
        this.selectedIndex = selectedIndex;
      }
      this[symbols.raiseChangeEvents] = false;
    };
    this.$.stage.addEventListener('selected-index-changed', handleSelectedIndexChanged);
    this.$.list.addEventListener('selected-index-changed', handleSelectedIndexChanged);

    // Work around inconsistencies in slotchange timing; see SlotContentMixin.
    this.$.proxySlot.addEventListener('slotchange', () => {
      this[proxySlotchangeFiredKey] = true;
      updateDefaultProxies(this);
    });
    Promise.resolve().then(() => {
      if (!this[proxySlotchangeFiredKey]) {
        // The event didn't fire, so we're most likely in Safari.
        // Update our notion of the component content.
        this[proxySlotchangeFiredKey] = true;
        updateDefaultProxies(this);
      }
    });
  }

  componentDidUpdate(previousState) {
    if (super.componentDidUpdate) { super.componentDidUpdate(previousState); }
    updateDefaultProxies(this);
  }

  get defaults() {
    return {
      tags: {
        list: 'div',
        proxy: 'div',
        stage: 'elix-modes'
      }
    };
  }

  get defaultState() {
    return Object.assign({}, super.defaultState, {
      defaultProxies: [],
      listPosition: 'top'
    });
  }

  get listPosition() {
    return this.state.listPosition;
  }
  set listPosition(listPosition) {
    this.setState({ listPosition });
  }

  get listTag() {
    return this[listTagKey];
  }
  set listTag(listTag) {
    this[symbols.hasDynamicTemplate] = true;
    this[listTagKey] = listTag;
  }

  get proxyTag() {
    return this[proxyTagKey];
  }
  set proxyTag(proxyTag) {
    this[symbols.hasDynamicTemplate] = true;
    this[proxyTagKey] = proxyTag;
  }

  // Return either the assigned proxies (if present) or the default proxies.
  get proxies() {
    /** @type {any} */
    const proxySlot = this.$.proxySlot;
    const assignedlist = proxySlot.assignedNodes({ flatten: true });
    return assignedlist.length > 0 ?
      assignedlist :
      createDefaultProxies(this);
  }

  [symbols.render]() {
    if (super[symbols.render]) { super[symbols.render](); }

    // Physically reorder the list and stage to reflect the desired arrangement.
    // We could change the visual appearance by reversing the order of the flex
    // box, but then the visual order wouldn't reflect the document order, which
    // determines focus order. That would surprise a user trying to tab through
    // the controls.
    const listPosition = this.state.listPosition;
    const topOrLeftPosition = (listPosition === 'top' || listPosition === 'left');
    const stage = findChildContainingNode(this.shadowRoot, this.$.stage);
    const list = findChildContainingNode(this.shadowRoot, this.$.list);
    const firstElement = topOrLeftPosition ? list : stage;
    const lastElement = topOrLeftPosition ? stage : list;
    if (!this.shadowRoot) {
      /* eslint-disable no-console */
      console.warn(`Explorer expects ${this.constructor.name} to define a shadowRoot.\nThis can be done with ShadowTemplateMixin: https://elix.org/documentation/ShadowTemplateMixin.`);
    } else if (firstElement.nextSibling !== lastElement) {
      this.shadowRoot.insertBefore(firstElement, lastElement);
    }
  }

  setProxyItem(proxy, item) {
    if ('item' in Object.getPrototypeOf(proxy)) {
      proxy.item = item;
    }
  }

  get stageTag() {
    return this[stageTagKey];
  }
  set stageTag(stageTag) {
    this[symbols.hasDynamicTemplate] = true;
    this[stageTagKey] = stageTag;
  }

  get stageTemplate() {
    const stageTag = this.stageTag || this.defaults.tags.stage;
    return `<${stageTag} id="stage" role="none">
      <slot></slot>
    </${stageTag}>`;
  }

  get [symbols.template]() {
    const listTag = this.listTag || this.defaults.tags.list;
    const stageTemplate = this.stageTemplate;
    return `
      <style>
        :host {
          display: inline-flex;
          flex-direction: column;
        }

        #stage {
          flex: 1;
        }
      </style>
      ${stageTemplate}
      <${listTag} id="list"><slot id="proxySlot" name="proxy"></slot></${listTag}>
    `;
  }

  get updates() {
    const listPosition = this.state.listPosition;
    const lateralPosition = listPosition === 'left' || listPosition === 'right';

    const selectedIndex = this.selectedIndex;
    const swipeFraction = this.state.swipeFraction;

    let listChildNodes = [this.$.proxySlot, ...this.state.defaultProxies];

    return merge(super.updates, {
      style: {
        'flex-direction': lateralPosition ? 'row' : 'column'
      },
      $: {
        list: {
          childNodes: listChildNodes,
          position: listPosition,
          selectedIndex,
          swipeFraction
        },
        stage: {
          selectedIndex,
          swipeFraction
        }
      }
    });
  }

}


// Return true if arrays a and b have the same items.
function arrayEquals(a, b) {
  if ((a && !b) || (!a && b) || (!a && !b) || (a.length !== b.length)) {
    return false;
  }
  return !a.some((item, index) => item !== b[index]);
}


// Return the default list generated for the given items.
function createDefaultProxies(element) {
  if (element.items !== element[previousItemsKey]) {
    if (!element.items) {
      // No items yet.
      element[listKey] = [];
    } else {
      // Items have changed; create new buttons set.
      element[listKey] = element.items.map(item =>
        proxyForItem(element, item));
      // Make the array immutable.
      Object.freeze(element[listKey]);
    }
    element[previousItemsKey] = element.items;
  }
  return element[listKey];
}


// Find the child of root that is or contains the given node.
function findChildContainingNode(root, node) {
  const parentNode = node.parentNode;
  return parentNode === root ?
    node :
    findChildContainingNode(root, parentNode);
}


function proxyForItem(element, item) {
  let proxy;
  const proxyTag = element.proxyTag || element.defaults.tags.proxy;
  if (proxyTag) {
    proxy = document.createElement(proxyTag);
    const isCustomElement = proxyTag.indexOf('-') >= 0;
    if (!isCustomElement || customElements.get(proxyTag)) {
      element.setProxyItem(proxy, item);
    } else {
      customElements.whenDefined(proxyTag)
      .then(() => {
        element.setProxyItem(proxy, item);
      });
    }
  } else {
    proxy = item.cloneNode(true);
  }
  return proxy;
}


function updateDefaultProxies(element) {
  /** @type {any} */
  const proxySlot = element.$.proxySlot;
  const assignedButtons = proxySlot.assignedNodes({ flatten: true });
  const defaultProxies = assignedButtons.length > 0 ?
    [] :
    createDefaultProxies(element);
  const changed = !arrayEquals(defaultProxies, element.state.defaultProxies);
  if (changed) {
    element.setState({ defaultProxies });
  }
}


customElements.define('elix-explorer', Explorer);
export default Explorer;
'use strict';

import HM from "./HandlersManager.js";
import DUPC from "./DynamicallyUpdatedPromiseChain.js";
import { mergeLinearChanges as markLinearChanges } from "./utils.js";

const changeMerge = (target, source) => {
  // Target mutates, source replaces primitives and merges objects
  // if source has primitive and target has object, object wins
  // Objects must not have cyclic refs and dupes are weird.
  for (let [key, value] of Object.entries(source)) {

    if (typeof target[key] === "object") {
      if (typeof source[key] === "object") {
        changeMerge(target[key], source[key]);
      }
    } else {
      target[key] = value;
    }

  }

}

// merge tree paths to changesObj
const markTreeChanges = (pointer, key, treePaths) => {
  if (typeof treePaths === "object") {
    // Merge paths objects if treePaths is object
    if (typeof pointer[key] !== "object") pointer[key] = {};
    changeMerge(pointer[key], treePaths);
  } else {
    // Else set path point to true if it's still undefined
    if (!pointer[key]) pointer[key] = true;
  }
}

const dispatch = self => {
  const ctSnapshot = self.changesTree;
  self.changesTree = {};
  self.dispatched = false;
  // self[callbackQueue].add(() => self[handlersTree].actOnChanges(ctSnapshot));
  self[handlersTree].actOnChanges(ctSnapshot)
}


const handlersTree = Symbol("handlersTree");
const callbackQueue = Symbol("callbackQueue");
const dispatchSym = Symbol("dispatchSym");
class ChangesTracker {
  constructor(ht) {
    this.changesTree = {};
    this[callbackQueue] = new DUPC();
    if (ht !== undefined) this.addHandlersTree(ht);
    this[dispatchSym] = () => dispatch(this);
  }

  mergeChanges(linearPath /*: linear path (Array)*/, treePaths /* tree paths (Object) */) {
    const [pointer, key] = markLinearChanges(this.changesTree, linearPath);
    markTreeChanges(pointer, key, treePaths);

    // dispatch events before clearing changesTree
    if (this[handlersTree]) {
      if (!this.dispatched) {
        // Task
        // executes at next cycle
        // setTimeout(dispatch, 0, this); // or maybe requestAnimationFrame is better
        // Microtask
        // executes after current call stack is done.
        // I think it can get stack in infineite loop
        this[callbackQueue].add(this[dispatchSym]);
      }
      this.dispatched = true;
    }
  }

  addHandlersTree(ht) {
    if (!(ht instanceof HM)) throw new TypeError("ht must be instance of HandlersManager");
    this[handlersTree] = ht;
  }

  removeHandlersTree() {
    this[handlersTree] = null
  }

}

export default ChangesTracker;
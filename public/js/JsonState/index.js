'use strict';

import ChangesTracker from "./ChangesTracker.js"
import HandlersManager from "./HandlersManager.js"

///////// INIT IDEA ////////////
// rs = new RealState(initState)
// fn = func that runs when state changes. Takes path arg of the val that changed
// rs.a.b.callOnChange(fn) // runs fn when b OR ANY NESTED PROPERTY OF b changes
// rs.callOnChange(pathStr, fn) // calls On Change on properties not existent yet
// rs.cancel(fn) // cancel fn from any values it's is subscribed to
// rs.callOnChange funcs return a cancel func (which just cancels this particular callOnChange)
// If two keys point at the same value and it changes, they are both considered changed
// When there is self reference everything changes until they point it reaches the self reference

////////// IDEA 2 /////////////
// Kathe node kserei ta paidia tou, tous goneis tou, kai to arxiko obj
// Otan paw na kanw delete h change se obj, koitaw ta paidia k tous goneis tous pros ta panw mexri:
// Na ftasw sto arxiko xwris na perasw apo to node to be deleted, h ton eauto mou (circular ref).

////////// IDEA 3 /////////////
// Json. Every point knows the path that leads to it.

const changesSym = Symbol("changesSym");
const listenersSym = Symbol("listenersSym");

const targetSym = Symbol("targetSym");
const parentSym = Symbol("parentSym");
const keySym = Symbol("keySym");

// Return an array of keys and the root object
const pathToRoot = (jsonState, path = []) => {
  if (jsonState[keySym] !== null) {
    path.push(jsonState[keySym])
  } else {
    path.push(jsonState)
  }

  if (!jsonState[parentSym]) return path;

  return pathToRoot(jsonState[parentSym], path);
}

// Return an obj whose keys are the keys of json state
const childrenPaths = (jsonState) => {
  if (!(jsonState instanceof JsonState)) return true;

  const paths = {};

  for (let [key, value] of Object.entries(jsonState)) {
    paths[key] = childrenPaths(value);
  }

  return paths;
}

const getRootAndPath = target => {
  const arrToRoot = pathToRoot(target);
  const root = arrToRoot.pop();
  const pathArr = arrToRoot.reverse();
  return { root, pathArr };
}

const emittChangeEvent = (target, key) => {
  // const arrToRoot = pathToRoot(target);
  // const root = arrToRoot.pop();
  // const pathUpToMe = arrToRoot.reverse().concat(key);
  const { root, pathArr } = getRootAndPath(target);
  const pathUpToMe = pathArr.concat(key);
  const pathsAfterMe = childrenPaths(target[key]);
  root[changesSym].mergeChanges(pathUpToMe, pathsAfterMe);
}


const extend = (jsonStateTarget, stateExtension) => {

  // Sets directly to target to avoid emitting events
  for (let [key, val] of Object.entries(stateExtension)) {
    if (typeof val === "object") {
      jsonStateTarget[key] = new JsonStateNode(JSON.stringify(val), jsonStateTarget, key);
    } else {
      jsonStateTarget[key] = val;
    }
  }

}

const rsHandler = {
  set: (target, key, val, receiver) => {
    // emitt change events after (shallow) check for change
    if (typeof key === "string" && target[key] !== val) {
      emittChangeEvent(target, key);
    }

    // Set new target[key]
    target[key] = val;

    return true; // success
  },

  // get: (target, key, receiver) => {
  //   return target[key]
  // },

  ownKeys: (target) => Reflect.ownKeys(target),

  // instanceof etc.
  getPrototypeOf: () => JsonState.prototype,

  has: function(target, prop) {
    // Determines behavious of in operator. In operator is used at pathToVal
    return prop in target;
  }
}
class JsonStateNode {
  constructor(initStateStrg, parent, key) {
    let target;
    if (initStateStrg.trim()[0] === "[") {
      target = [];
    } else {
      target = {};
    }
    const self = new Proxy(target, rsHandler);
    target[targetSym] = target;
    target[parentSym] = parent || null;
    target[keySym] = key !== undefined ? key : null;

    // Methods
    Object.defineProperty(target, "extend", {
      value: str => {

        // Parse state extension
        const stateExtension = JSON.parse(str) || {};

        // Emitt aproppriate events
        for (let propName of Object.keys(stateExtension)) emittChangeEvent(target, propName);

        // Finally extend target with the new state extension
        extend(target, stateExtension);
      }
    });

    Object.defineProperty(target, "addCallBackToPath", {
      value: (path, callback) => {
        const { root, pathArr } = getRootAndPath(target);
        const hm = root[targetSym][listenersSym];
        const wholePath = `${pathArr.join(".")}.${path}`;
        hm.add(wholePath, callback);

        return () => hm.remove(wholePath, callback);
      }
    });

    Object.defineProperty(target, "removeCallBackFromPath", {
      value: (path, callback) => {
        const { root, pathArr } = getRootAndPath(target);
        const hm = root[targetSym][listenersSym];
        hm.remove(`${pathArr.join(".")}.${path}`, callback);
      }
    });

    Object.defineProperty(target, "cleanPath", {
      value: path => {
        const { root, pathArr } = getRootAndPath(target);
        const hm = root[targetSym][listenersSym];
        hm.cleanPath(`${pathArr.join(".")}.${path}`);
      }
    });

    // call local extend function to initialize (doesn't fire events)
    const initState = JSON.parse(initStateStrg) || {};
    extend(target, initState);

    return self;
  }
}

class JsonState extends JsonStateNode {
  constructor(initStateStrg) {
    super(initStateStrg);
    
    // set up listener obj
    this[targetSym][listenersSym] = new HandlersManager(); // {[pathString]: [list of handlers]};
    this[targetSym][changesSym] = new ChangesTracker(this[targetSym][listenersSym]); // {tree of changed keys}; empties itself after firing events

    // Methods
    Object.defineProperty(this[targetSym], "removeCallback", {
      value: callback => this[targetSym][listenersSym].removeHandler(callback)
    });
  }
}

export default JsonState;
'use strict';

import { mergeLinearChanges, pathToVal, jsonWalk, jsonParallelWalk } from "./utils.js";

const handlersSym = Symbol("handlersSym");
const callbacksSym = Symbol("callbacksSym");
import { parentSym, keySym } from "./sharedSymbols.js";

const purgeParents = pointer => {
  while (pointer[parentSym]) {
    // Climb path deleting all that shouldn't exist
    // Length is two, because parentSym, keySym are always present
    if (Reflect.ownKeys(pointer).length === 2) {
      const key = pointer[keySym];
      pointer = pointer[parentSym];
      delete pointer[key];
    } else break;
  }
}

// pathArr is array, path is string

class HandlersManager {
  constructor() {
    // object that holds callbacks and their paths.
    // A list of callbacks is stored in the
    // callbacksSym in the appropriate path
    this[handlersSym] = {};
  }

  add(path, handler) {
    const pathArr = path.length > 0 ? path.split(".") : [];
    const [pointer, key] = mergeLinearChanges(this[handlersSym], pathArr, true);
    if (!pointer[key]) pointer[key] = {[parentSym]: pointer, [keySym]: key};
    if (!pointer[key][callbacksSym]) pointer[key][callbacksSym] = [];
    pointer[key][callbacksSym].push(handler);
  }

  remove(path, handler) {
    const pathinfo = pathToVal(this[handlersSym], path);
    if (pathinfo.exists && pathinfo.value[callbacksSym]) {
      const pointer = pathinfo.value;
      const callbackindex = pointer[callbacksSym].findIndex(val => val === handler);
      if (callbackindex !== -1) {
        // Remove callback
        pointer[callbacksSym].splice(callbackindex, 1);
        if (pointer[callbacksSym].length === 0) delete pointer[callbacksSym];
        // delete all keys that have no reason to exist
        purgeParents(pointer);
      }
    }
  }

  cleanPath(path) {
    const pathinfo = pathToVal(this[handlersSym], path);
    if (pathinfo.exists && pathinfo.value[callbacksSym]) {
      delete pathinfo.value[callbacksSym];
      purgeParents(pathinfo.value);
    }
  }

  removeHandler(handler) {
    // json walk and purge every path of handler???
    jsonWalk(this[handlersSym], null, (val, currentPath) => {
      // Clear all appropriate handlers from path
      for (let key of currentPath) {
        const handlersTreePoint = val[callbacksSym];
        if (handlersTreePoint) {
          const callbackindex = handlersTreePoint.findIndex(callback => callback === handler);
          if (callbackindex !== -1) {
            handlersTreePoint.splice(callbackindex, 1);
            if (handlersTreePoint.length === 0) delete val[callbacksSym];
          }
        }
      }
      
      if (Object.keys(val).length !== 0) return
      purgeParents(val);
    })
  }

  actOnChanges(changesTrackerInstance) {
    // Iterate changes tracker instance and
    // call appropriate handlers at matching paths
    // or something like that
    console.log("todo");
    // jsonParallelWalk(changesTrackerInstance, this[handlersSym])
  }

}

export default HandlersManager;
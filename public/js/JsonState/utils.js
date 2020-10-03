import { parentSym, keySym } from "./sharedSymbols.js";

// merge linear path to changesObj
export const mergeLinearChanges = (margedObj, pathArr, connectToParents) => {
  let pointer = margedObj;
  for (let i = 0; i < pathArr.length - 1; i++) {
    const key = pathArr[i];
    if (typeof pointer[key] !== "object") pointer[key] = {}
    if (connectToParents) {
      if (!pointer[key][parentSym]) {
        pointer[key][parentSym] = pointer;
        pointer[key][keySym] = key;
      }
    }
    pointer = pointer[key]
  }
  return [pointer, pathArr[pathArr.length - 1]];
}


export const pathToVal = (obj, path) => {
  const pathArr = path.length > 0 ? path.split(".") : [];

  let pointer = obj;
  let treadedPath = [];
  let prevPointer;

  for (let key of pathArr) {
    prevPointer = pointer;
    pointer = pointer[key];
    treadedPath.push(key);
    if (!pointer) break;
  }

  return {
    value: pointer,
    treadedPath: treadedPath.length > 0 ? treadedPath.join(".") : null,
    exists: prevPointer ? treadedPath[treadedPath.length-1] in prevPointer : true
  }
}


const jsonWalkPrivate = (json, valHook, diveHook, pathArr = []) => {
  for (let [key, val] of Object.entries(json)) {
    const currentPath = pathArr.concat(key);
    if (typeof val !== "object") {
      if (valHook) valHook(val, currentPath);
    } else {
      if (diveHook) diveHook(val, currentPath);
      jsonWalkPrivate(val, valHook, diveHook, currentPath);
    }
  }
}

export const jsonWalk = (json, valHook, diveHook) => {
  return jsonWalkPrivate(json, valHook, diveHook);
}


// Iterate json's and obj's common keys. obj doesn't need to be json
const jsonParallelWalkPrivate = (json, obj, valHook, diveHook, pathArr = []) => {
  for (let [key, jsonVal] of Object.entries(json)) {
    const currentPath = pathArr.concat(key);
    if (!(key in obj)) continue;
    const objVal = obj[key];
    if (typeof jsonVal !== "object") {
      if (valHook) valHook(objVal, jsonVal, currentPath);
    } else {
      if (diveHook) diveHook(objVal, jsonVal, currentPath);
      jsonParallelWalkPrivate(jsonVal, objVal, valHook, diveHook, currentPath);
    }
  }
}

export const jsonParallelWalk = (json, obj, valHook, diveHook) => {
  return jsonParallelWalkPrivate(json, obj, valHook, diveHook);
}
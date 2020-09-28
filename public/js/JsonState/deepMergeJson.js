const deepmerge = (target, source) => {
  // Target mutates, source replaces primitives and merges objects
  // if source has primitive and target has object, object wins
  // Objects must not have cyclic refs and dupes are weird.
  for (let [key, value] of Object.entries(source)) {

    if (typeof target[key] === "object") {
      if (typeof source[key] === "object") {
        deepmerge(target[key], source[key]);
      }
    } else {
      target[key] = value;
    }

  }

}

export default deepmerge;
const queueSym = Symbol("QueueSym")

class DUPC {
  constructor() {
    this[queueSym] = Promise.resolve();
  }

  add(fn) {
    this[queueSym] = this[queueSym].then(fn);
  }
}

export default DUPC;
import compressedToUrl from "./compressedToUrl.js";
import encryptedToUrl from "./encryptedToUrl.js";

export default class JsonReadWrite {
  constructor(state, options = {}) {
    if (!(state && typeof state === "object" && JSON.stringify(state))) {
      throw new TypeError("state must be json")
    }
    this.state = state;

    switch (options.method) {
      case "encryptedToUrl":
        this.method = encryptedToUrl;
        break;
      case "compressedToUrl":
      default:
        this.method = compressedToUrl;
        break;
    }
  }

  write() {
    this.method.write(this.state);
  }

  read() {
    const json = this.method.read();
    this.state.extend(JSON.stringify(json));
  }
}
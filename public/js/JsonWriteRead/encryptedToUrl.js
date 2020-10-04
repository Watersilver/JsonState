import jpack from "./jsonpack/jsonpack.esm.js";
import {encrypt, decrypt} from "./XORCipher.js";

const compressedToUrl = {
  write: json => {
    const packedJson = jpack.pack(json);
    const encryptedJson = encrypt("erty", packedJson)
    history.replaceState(null, null, `?state=${encryptedJson}`)
  },

  read: () => {
    const params = (new URL(document.location)).searchParams;
    const encryptedJson = params.get("state");
    const packedJson = decrypt("erty", encryptedJson);
    if (!packedJson) return {};
    const json = jpack.unpack(packedJson);
    return json;
  }
};

export default compressedToUrl;
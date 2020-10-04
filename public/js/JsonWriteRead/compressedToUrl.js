import jpack from "./jsonpack/jsonpack.esm.js";

const compressedToUrl = {
  write: json => {
    const packedJson = jpack.pack(json);
    history.replaceState(null, null, `?state=${packedJson}`)
  },

  read: () => {
    const params = (new URL(document.location)).searchParams;
    const packedState = params.get("state");
    if (!packedState) return {};
    const json = jpack.unpack(packedState);
    return json;
  }
};

export default compressedToUrl;
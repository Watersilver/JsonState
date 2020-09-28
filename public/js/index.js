import JsonState from "./JsonState/index.js"

window.erty = new JsonState(JSON.stringify({
  a: 1,
  b: {c: "fuck you"},
  d: "erty",
  e: 3,
  f: {g: ["what"], h: 2}
}));

erty.f.extend(JSON.stringify({i: 321}));

erty.a = 2;
erty.extend(JSON.stringify({a: 123}));
erty.f.g.extend(JSON.stringify({[1]: "hey"}));

erty.a = "that";
erty.f = "treepaths";
erty.extend(JSON.stringify({f: {g: {h: {j: {k: 1, l: 2, m: 3}}}}}));
erty.f = "treepaths2";

setTimeout(() => erty.a = "idiot", 1000);

// const erty = new JsonState(JSON.stringify([]));

console.log("obj is:", erty)

erty.hmDebug();
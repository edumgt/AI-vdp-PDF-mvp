const { lineBreak } = require("../src/linebreak");

function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assert failed");
}

(() => {
  const lines = lineBreak({ text: "Hello world this is a long sentence", maxWidth: 100, policy: "space_based", fontSize: 16 });
  assert(lines.length >= 2, "should wrap lines");
  const cjk = lineBreak({ text: "가나다라마바사아자차카타파하", maxWidth: 60, policy: "cjk", fontSize: 16 });
  assert(cjk.length >= 2, "should wrap cjk");
  console.log("[layout-engine tests] OK");
})();

/**
 * Web Worker: loads Go WASM and runs user code. Streams stdout via postMessage
 * so the main thread stays responsive and can show "Running..." and handle Stop.
 */
importScripts("./wasm_exec.js");

let runGoCode = null;

async function init() {
  const go = new globalThis.Go();
  const wasmResponse = await fetch("./main.wasm");
  const wasmBuffer = await wasmResponse.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(wasmBuffer, go.importObject);
  go.run(instance);
  runGoCode = globalThis.runGoCode;
}

init().then(() => {
  self.onmessage = function (e) {
    if (e.data.type !== "run") return;
    const { code, input } = e.data;
    try {
      const stdoutCallback = function (data) {
        self.postMessage({ type: "stdout", data: data });
      };
      const result = runGoCode(code, input, stdoutCallback);
      self.postMessage({ type: "done", result: result || "" });
    } catch (err) {
      self.postMessage({
        type: "done",
        result: "Error: " + (err && err.message ? err.message : String(err)),
      });
    }
  };
}).catch((err) => {
  self.postMessage({
    type: "done",
    result: "Error: Failed to load WASM: " + (err && err.message ? err.message : String(err)),
  });
});

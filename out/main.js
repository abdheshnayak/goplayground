let wasmInstance;

async function loadWasm() {
  renderCode();
  const go = new Go(); // This is the Go runtime
  const wasmFile = await fetch("./main.wasm");
  const wasmArrayBuffer = await wasmFile.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(wasmArrayBuffer, go.importObject);
  go.run(instance);
  wasmInstance = instance;
}


var goCode = ace.edit("gocode");
var inputEditor = ace.edit("input");

function getAceTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
    ? "ace/theme/chrome"
    : "ace/theme/monokai";
}

function applyEditorTheme() {
  var theme = getAceTheme();
  goCode.setTheme(theme);
  inputEditor.setTheme(theme);
}

function setToLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

function getFromLocalStorage(key) {
  return localStorage.getItem(key);
}

function onGoCodeChange() {
  setToLocalStorage("goCode", goCode.getValue());
}

function onInputChange() {
  setToLocalStorage("input", inputEditor.getValue());
}

function renderCode() {
  goCode.setValue(getFromLocalStorage("goCode") || `package main

import "fmt"

func main() {
  fmt.Println("Hello, world!")
}
`);
  inputEditor.setValue(getFromLocalStorage("input"));

  // set language mode golang
  goCode.session.setMode("ace/mode/golang");
  // standard mode
  inputEditor.session.setMode("ace/mode/text");

  goCode.setOptions({
    fontSize: "16px",
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true
  });
  inputEditor.setOptions({
    fontSize: "16px",
  });

  applyEditorTheme();
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", applyEditorTheme);
  }

  function formatDocument() {
    // goCode
  }

  goCode.on("change", onGoCodeChange);
  inputEditor.on("change", onInputChange);

  // Listen for Ctrl + Enter keypress event
  goCode.commands.addCommand({
    name: 'ctrlEnterCommand',
    bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
    exec: function(editor) {
      formatDocument()
      executeGoCode();
    }
  });

  goCode.commands.addCommand({
    name: 'ctrlSCommand',
    bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
    exec: function(editor) {
      formatDocument()
      executeGoCode();
    }
  });
}

async function executeGoCode() {
  const code = goCode.getValue();
  const input = inputEditor.getValue();
  if (!wasmInstance) {
    await loadWasm();
  }


  const result = window.runGoCode(code, input); // Run Go code inside WASM
  const outputEl = document.getElementById("output");
  outputEl.innerText = result;
  outputEl.setAttribute("data-status", String(result).startsWith("Error:") ? "error" : "");
}

// Load WASM when the page is ready
window.onload = loadWasm;

let runWorker = null;
let isRunning = false;

function startWorker() {
  runWorker = new Worker("./run_worker.js");
  runWorker.onmessage = onWorkerMessage;
  runWorker.onerror = function (e) {
    isRunning = false;
    updateRunningUI();
    const outputEl = document.getElementById("output");
    outputEl.textContent = (outputEl.textContent || "") + "\nError: Worker failed: " + (e.message || "unknown");
    outputEl.setAttribute("data-status", "error");
    runWorker = null;
  };
}

function onWorkerMessage(e) {
  const msg = e.data;
  const outputEl = document.getElementById("output");
  if (msg.type === "stdout") {
    outputEl.textContent = (outputEl.textContent || "") + msg.data;
    outputEl.removeAttribute("data-status");
    outputEl.scrollTop = outputEl.scrollHeight;
  } else if (msg.type === "done") {
    isRunning = false;
    updateRunningUI();
    if (msg.result && msg.result.startsWith("Error:")) {
      outputEl.textContent = (outputEl.textContent || "") + (outputEl.textContent ? "\n" : "") + msg.result;
      outputEl.setAttribute("data-status", "error");
    }
    runWorker = null;
  }
}

function setRunning(running) {
  isRunning = running;
  updateRunningUI();
}

function updateRunningUI() {
  const runBtn = document.getElementById("run-btn");
  const stopBtn = document.getElementById("stop-btn");
  const runningIndicator = document.getElementById("running-indicator");
  if (!runBtn || !stopBtn || !runningIndicator) return;
  if (isRunning) {
    runBtn.setAttribute("aria-hidden", "true");
    runBtn.style.display = "none";
    stopBtn.removeAttribute("aria-hidden");
    stopBtn.style.display = "inline-flex";
    runningIndicator.classList.add("playground-running-visible");
  } else {
    runBtn.removeAttribute("aria-hidden");
    runBtn.style.display = "inline-flex";
    stopBtn.setAttribute("aria-hidden", "true");
    stopBtn.style.display = "none";
    runningIndicator.classList.remove("playground-running-visible");
  }
}

function stopExecution() {
  if (!runWorker || !isRunning) return;
  runWorker.terminate();
  runWorker = null;
  isRunning = false;
  updateRunningUI();
  startWorker();
}

async function loadWasm() {
  renderCode();
  startWorker();
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
  if (isRunning) return;
  const code = goCode.getValue();
  const input = inputEditor.getValue();
  if (!runWorker) {
    await loadWasm();
  }
  const outputEl = document.getElementById("output");
  outputEl.textContent = "";
  outputEl.removeAttribute("data-status");
  setRunning(true);
  runWorker.postMessage({ type: "run", code: code, input: input || "" });
}

// Load WASM when the page is ready
window.onload = loadWasm;

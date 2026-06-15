// Pyodide Web Worker — runs user Python code in isolation.
// The main thread can terminate this worker to enforce a timeout.
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");

let pyodide = null;

async function ensurePyodide() {
  if (pyodide) return pyodide;
  // eslint-disable-next-line no-undef
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
  });
  return pyodide;
}

self.onmessage = async (e) => {
  const { id, code } = e.data;
  let stdout = "";
  let stderr = "";
  let exitCode = 0;

  try {
    const py = await ensurePyodide();
    py.setStdout({ batched: (s) => { stdout += s + "\n"; } });
    py.setStderr({ batched: (s) => { stderr += s + "\n"; } });
    await py.runPythonAsync(code);
  } catch (err) {
    stderr += (err instanceof Error ? err.message : String(err)) + "\n";
    exitCode = 1;
  }

  self.postMessage({ id, stdout, stderr, exitCode });
};

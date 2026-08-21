// Launches `next <command>` (e.g. dev/start), applying Node flags only when the
// running Node version actually supports them. This keeps the project working
// across Node versions: `--no-experimental-webstorage` exists on Node 24 (our
// target, see package.json "engines") but is rejected by older Node, where
// putting it in NODE_OPTIONS crashes the process before Next even starts.

import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const command = process.argv[2];
if (!command) {
  console.error("Usage: node scripts/run-next.mjs <next-command>");
  process.exit(1);
}

// Only flags Node recognizes are allowed in NODE_OPTIONS; unknown ones throw.
const desiredFlags = ["--no-experimental-webstorage"];
const supportedFlags = desiredFlags.filter((flag) =>
  process.allowedNodeEnvironmentFlags.has(flag)
);

const nodeOptions = [process.env.NODE_OPTIONS, ...supportedFlags]
  .filter(Boolean)
  .join(" ");

const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, command], {
  stdio: "inherit",
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
});

const signalHandlers = new Map();
for (const signal of ["SIGINT", "SIGTERM"]) {
  const handler = () => {
    if (!child.killed) child.kill(signal);
  };
  signalHandlers.set(signal, handler);
  process.once(signal, handler);
}

const removeSignalHandlers = () => {
  for (const [signal, handler] of signalHandlers) {
    process.removeListener(signal, handler);
  }
};

child.on("exit", (code, signal) => {
  removeSignalHandlers();
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});

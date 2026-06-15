import { Sandbox } from "@vercel/sandbox";
import type { LanguageId, RunResult } from "./types";
import { getLanguage } from "./languages";

interface LangSpec {
  filename: string;
  compile: string[];
  run: (binDir: string) => string[];
  installCheck: string;
  installCmd: string;
}

// ulimit flags applied to every user program:
//   -t 5       max 5 seconds CPU time
//   -v 262144  max 256 MB virtual memory
//   -u 64      max 64 processes (prevents fork bombs)
//   -f 1024    max 1 MB file writes (prevents disk fill)
const ULIMIT = "ulimit -t 5 -v 262144 -u 64 -f 1024 2>/dev/null;";

const SPECS: Partial<Record<LanguageId, LangSpec>> = {
  c: {
    filename: "main.c",
    compile: ["gcc", "/tmp/main.c", "-o", "/tmp/program"],
    run: () => ["sh", "-c", `${ULIMIT} /tmp/program`],
    installCheck: "which gcc",
    installCmd: "dnf install -y gcc",
  },
  java: {
    filename: "Main.java",
    compile: ["javac", "-d", "/tmp", "/tmp/Main.java"],
    // -Xmx256m caps heap, -Xss512k caps stack (prevents StackOverflowError spam)
    run: () => ["sh", "-c", `${ULIMIT} java -Xmx256m -Xss512k -cp /tmp Main`],
    installCheck: "which javac",
    installCmd: "dnf install -y java-21-amazon-corretto-devel",
  },
};

export async function runInSandbox(
  languageId: LanguageId,
  code: string,
  stdin: string,
): Promise<RunResult> {
  const lang = getLanguage(languageId);
  if (lang.runtime !== "server") throw new Error(`${languageId} is not a server language`);

  const spec = SPECS[languageId];
  if (!spec) throw new Error(`No sandbox spec for ${languageId}`);

  const sandbox = await Sandbox.create({ runtime: "node24", timeout: 60_000 });
  const start = Date.now();

  try {
    await sandbox.fs.writeFile(`/tmp/${spec.filename}`, code);

    const checkResult = await sandbox.runCommand("sh", [
      "-c",
      `${spec.installCheck} 2>/dev/null || sudo ${spec.installCmd} 2>&1`,
    ]);
    if (checkResult.exitCode !== 0) {
      const checkErr = await checkResult.stderr();
      return {
        stdout: "",
        stderr: `Toolchain install failed: ${checkErr}`,
        exitCode: 1,
        timedOut: false,
        durationMs: Date.now() - start,
      };
    }

    const [compileCmd, ...compileArgs] = spec.compile;
    const compileResult = await sandbox.runCommand(compileCmd, compileArgs);
    const compileStderr = await compileResult.stderr();
    const compileStdout = await compileResult.stdout();
    if (compileResult.exitCode !== 0) {
      return {
        stdout: "",
        stderr: compileStderr || compileStdout,
        exitCode: compileResult.exitCode,
        timedOut: false,
        durationMs: Date.now() - start,
      };
    }

    const runCmd = spec.run("/tmp");
    if (stdin) {
      await sandbox.fs.writeFile("/tmp/stdin.txt", stdin);
      const shellCmd = `${runCmd.slice(2).join(" ")} < /tmp/stdin.txt`;
      const runResult = await sandbox.runCommand("sh", ["-c", shellCmd]);
      return {
        stdout: await runResult.stdout(),
        stderr: await runResult.stderr(),
        exitCode: runResult.exitCode,
        timedOut: runResult.exitCode === 152, // SIGXCPU exit code
        durationMs: Date.now() - start,
      };
    }

    const [cmd, ...args] = runCmd;
    const runResult = await sandbox.runCommand(cmd, args);
    return {
      stdout: await runResult.stdout(),
      stderr: await runResult.stderr(),
      exitCode: runResult.exitCode,
      timedOut: runResult.exitCode === 152,
      durationMs: Date.now() - start,
    };
  } finally {
    // Never let stop() swallow errors or block the response
    await sandbox.stop().catch((e: unknown) =>
      console.error("sandbox.stop() failed:", e)
    );
  }
}

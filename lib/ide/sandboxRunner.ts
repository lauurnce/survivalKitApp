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

const SPECS: Partial<Record<LanguageId, LangSpec>> = {
  c: {
    filename: "main.c",
    compile: ["gcc", "/tmp/main.c", "-o", "/tmp/program"],
    run: () => ["/tmp/program"],
    installCheck: "which gcc",
    installCmd: "dnf install -y gcc",
  },
  java: {
    filename: "Main.java",
    compile: ["javac", "-d", "/tmp", "/tmp/Main.java"],
    run: () => ["java", "-cp", "/tmp", "Main"],
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
    // Write source file directly via fs API
    await sandbox.fs.writeFile(`/tmp/${spec.filename}`, code);

    // Ensure toolchain is present (pre-installed on snapshots, installed fresh otherwise)
    const checkResult = await sandbox.runCommand("sh", ["-c", `${spec.installCheck} 2>/dev/null || sudo ${spec.installCmd} 2>&1`]);
    const checkErr = await checkResult.stderr();
    if (checkResult.exitCode !== 0) {
      return { stdout: "", stderr: `Toolchain install failed: ${checkErr}`, exitCode: 1, timedOut: false, durationMs: Date.now() - start };
    }

    // Compile
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

    // Write stdin to file and redirect if provided
    let runArgs: string[];
    if (stdin) {
      await sandbox.fs.writeFile("/tmp/stdin.txt", stdin);
      // Run via shell to get stdin redirect
      const runCmd = spec.run("/tmp").join(" ");
      runArgs = ["-c", `${runCmd} < /tmp/stdin.txt`];
      const runResult = await sandbox.runCommand("sh", runArgs);
      return {
        stdout: await runResult.stdout(),
        stderr: await runResult.stderr(),
        exitCode: runResult.exitCode,
        timedOut: false,
        durationMs: Date.now() - start,
      };
    }

    const [runCmd, ...runCmdArgs] = spec.run("/tmp");
    const runResult = await sandbox.runCommand(runCmd, runCmdArgs);
    return {
      stdout: await runResult.stdout(),
      stderr: await runResult.stderr(),
      exitCode: runResult.exitCode,
      timedOut: false,
      durationMs: Date.now() - start,
    };
  } finally {
    await sandbox.stop();
  }
}

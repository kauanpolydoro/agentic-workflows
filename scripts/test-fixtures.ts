import { spawnSync } from "node:child_process";

function run(command: string, args: string[], expected = 0): void {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== expected)
    throw new Error(
      `${command} ${args.join(" ")} returned ${result.status}; expected ${expected}.`,
    );
}
run(process.execPath, [
  "--test",
  "fixtures/vulnerable-node-api/server.test.js",
  "fixtures/large-module-refactor/report.test.js",
  "fixtures/docs-drift-api/api.test.js",
]);
run(process.platform === "win32" ? "python" : "python3", [
  "-m",
  "unittest",
  "discover",
  "-s",
  "fixtures/legacy-python-service",
  "-p",
  "test_*.py",
]);
run(process.execPath, ["fixtures/broken-typescript-ci/scripts/lint.js"], 1);
run("pnpm", ["exec", "tsc", "-p", "fixtures/broken-typescript-ci"], 2);
run(process.execPath, ["--test", "fixtures/broken-typescript-ci/test/sum.test.js"], 1);
console.log("Fixture checks matched their documented outcomes.");

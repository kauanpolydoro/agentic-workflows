import { spawnSync } from "node:child_process";

const result = spawnSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
  encoding: "utf8",
  shell: false,
});
if (result.status !== 0) {
  process.stderr.write(result.stderr || "Could not inspect the Git worktree.\n");
  process.exitCode = 1;
} else if (result.stdout.trim().length > 0) {
  process.stderr.write(`Generated or quality commands changed the worktree:\n${result.stdout}`);
  process.exitCode = 1;
} else {
  process.stdout.write("Tracked and untracked repository artifacts are current.\n");
}

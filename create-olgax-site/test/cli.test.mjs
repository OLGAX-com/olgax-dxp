import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const binPath = join(rootDir, "bin", "index.mjs");

describe("create-olgax-site CLI", () => {
  it("prints help and exits 0 without creating a 'help' directory on --help", () => {
    const res = spawnSync(process.execPath, [binPath, "--help"], {
      cwd: rootDir,
      encoding: "utf8",
    });
    assert.equal(res.status, 0);
    assert.match(res.stdout, /Usage: npx create-olgax-site/);
    assert.equal(existsSync(join(rootDir, "help")), false);
  });

  it("prints package version on --version", () => {
    const pkg = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"));
    const res = spawnSync(process.execPath, [binPath, "--version"], {
      cwd: rootDir,
      encoding: "utf8",
    });
    assert.equal(res.status, 0);
    assert.equal(res.stdout.trim(), pkg.version);
  });

  it("rejects unknown flags with exit code 1", () => {
    const res = spawnSync(process.execPath, [binPath, "--unknown-flag"], {
      cwd: rootDir,
      encoding: "utf8",
    });
    assert.equal(res.status, 1);
    assert.match(res.stderr, /Unknown option: --unknown-flag/);
  });

  it("ships pnpm-workspace.yaml with allowBuilds for esbuild", () => {
    const wsPath = join(rootDir, "template", "pnpm-workspace.yaml");
    assert.equal(existsSync(wsPath), true);
    const content = readFileSync(wsPath, "utf8");
    assert.match(content, /allowBuilds:/);
    assert.match(content, /esbuild:\s*true/);
  });
});

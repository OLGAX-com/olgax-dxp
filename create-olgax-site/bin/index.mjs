#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, cpSync, renameSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateDir = join(__dirname, "..", "template");

function toKebabCase(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function promptForName() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("Project name: ");
  rl.close();
  return answer;
}

async function main() {
  const argName = process.argv[2];
  const rawName = argName || (await promptForName());
  const projectName = toKebabCase(rawName);

  if (!projectName) {
    console.error("A project name is required, e.g. npx create-olgax-site my-site");
    process.exit(1);
  }

  const targetDir = join(process.cwd(), projectName);
  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    console.error(`Directory "${projectName}" already exists and is not empty.`);
    process.exit(1);
  }

  mkdirSync(targetDir, { recursive: true });
  cpSync(templateDir, targetDir, { recursive: true });

  // "gitignore" -> ".gitignore" (npm packing conventions special-case dotfiles in templates)
  const gitignorePath = join(targetDir, "gitignore");
  if (existsSync(gitignorePath)) {
    renameSync(gitignorePath, join(targetDir, ".gitignore"));
  }

  const pkgPath = join(targetDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.name = projectName;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  console.log(`\nScaffolded "${projectName}" in ${targetDir}\n`);

  try {
    console.log("Installing dependencies with pnpm...");
    execSync("pnpm install", { cwd: targetDir, stdio: "inherit" });
  } catch {
    console.warn("\npnpm install failed or pnpm isn't available - run it manually.");
  }

  console.log(`
Next steps:
  cd ${projectName}
  cp .env.example .env        # then set PAYLOAD_SECRET
  pnpm seed                   # creates an admin user + demo page
  pnpm dev
`);
}

main();

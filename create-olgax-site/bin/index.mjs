#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, cpSync, renameSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";

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

  // A working .env up front (with a unique secret) so the site runs without manual setup.
  const envExamplePath = join(targetDir, ".env.example");
  if (existsSync(envExamplePath)) {
    const env = readFileSync(envExamplePath, "utf8").replace(
      /^PAYLOAD_SECRET=.*$/m,
      `PAYLOAD_SECRET=${randomBytes(32).toString("hex")}`,
    );
    writeFileSync(join(targetDir, ".env"), env);
  }

  console.log(`\nScaffolded "${projectName}" in ${targetDir}\n`);

  let installed = false;
  let seeded = false;
  try {
    console.log("Installing dependencies with pnpm...");
    execSync("pnpm install", { cwd: targetDir, stdio: "inherit" });
    installed = true;
  } catch {
    console.warn("\npnpm install failed or pnpm isn't available - run it manually.");
  }

  if (installed) {
    try {
      console.log("\nCreating the admin user and demo homepage...");
      execSync("pnpm seed", { cwd: targetDir, stdio: "inherit" });
      seeded = true;
    } catch {
      console.warn("\nSeeding failed - run `pnpm seed` yourself once the issue above is resolved.");
    }
  }

  const steps = [`cd ${projectName}`];
  if (!installed) steps.push("pnpm install");
  if (!seeded) steps.push("pnpm seed                  # admin user + demo homepage");
  steps.push("pnpm dev");

  console.log(`
Next steps:
${steps.map((step) => `  ${step}`).join("\n")}

Then open http://localhost:3000
  Admin login:   admin@example.com / ChangeMe123!  (change it in /admin before deploying)
  Page builder:  http://localhost:3000/home/edit
  Your own components: pnpm new:component MyBlock   (see README.md)

Docs:     https://dxp.olgax.com
Discord:  https://discord.gg/EAXcCXgUz2   (questions, help and showcase)
`);
}

main();

import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const fixture = path.join(root, ".copy-fixture");
const layers = ["optical", "scene", "signature"];

async function main() {
  await rm(fixture, { recursive: true, force: true });
  await mkdir(path.join(fixture, "components"), { recursive: true });

  const slugs = [];

  for (const layer of layers) {
    const layerDir = path.join(root, "registry", layer);
    const entries = await readdir(layerDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const sourceDir = path.join(layerDir, entry.name);
      const targetDir = path.join(fixture, "components", entry.name);
      await mkdir(targetDir, { recursive: true });

      const files = await readdir(sourceDir);
      const componentFiles = files.filter(
        (file) =>
          file === "index.tsx" ||
          file === "styles.css" ||
          file === "use-optical-tier.ts",
      );

      for (const file of componentFiles) {
        await cp(
          path.join(sourceDir, file),
          path.join(targetDir, file),
        );
      }

      if (componentFiles.includes("index.tsx")) {
        slugs.push(entry.name);
      }
    }
  }

  const imports = slugs
    .map((slug, index) => `import * as Component${index} from "./components/${slug}";`)
    .join("\n");
  const modules = slugs.map((_, index) => `Component${index}`).join(",\n  ");

  await writeFile(
    path.join(fixture, "index.tsx"),
    `${imports}\n\nexport const modules = [\n  ${modules}\n];\n`,
  );

  await writeFile(
    path.join(fixture, "css.d.ts"),
    'declare module "*.css";\n',
  );

  await writeFile(
    path.join(fixture, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          lib: ["DOM", "DOM.Iterable", "ES2020"],
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          types: ["node", "react"],
        },
        include: [
          "index.tsx",
          "css.d.ts",
          "components/**/*.ts",
          "components/**/*.tsx",
        ],
      },
      null,
      2,
    ),
  );

  console.log(
    `[copy-fixture] ${slugs.length} components copied to .copy-fixture`,
  );

  const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");
  const result = spawnSync(
    process.execPath,
    [tsc, "-p", path.join(fixture, "tsconfig.json")],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    console.error("[copy-fixture] TypeScript check failed");
    process.exit(result.status ?? 1);
  }

  console.log("[copy-fixture] TypeScript check passed");
}

main().catch((error) => {
  console.error("[copy-fixture] failed", error);
  process.exit(1);
});

import { readFile } from "node:fs/promises";
import path from "node:path";
import { codeToHtml } from "shiki";
import type { ComponentMeta } from "./schema";

export type ComponentCodeFile = {
  name: string;
  raw: string;
  html: string;
};

const layerDirectories: Record<ComponentMeta["layer"], string> = {
  optical: "optical",
  scene: "scene",
  signature: "signature",
};

function languageFor(fileName: string): string {
  if (fileName.endsWith(".tsx")) return "tsx";
  if (fileName.endsWith(".ts")) return "ts";
  if (fileName.endsWith(".css")) return "css";
  if (fileName.endsWith(".mdx")) return "mdx";
  return "text";
}

export async function getComponentFiles(
  meta: ComponentMeta,
): Promise<ComponentCodeFile[]> {
  const directory = path.join(
    process.cwd(),
    "registry",
    layerDirectories[meta.layer],
    meta.slug,
  );

  return Promise.all(
    meta.files.map(async (fileName) => {
      const raw = await readFile(path.join(directory, fileName), "utf8");
      const html = await codeToHtml(raw, {
        lang: languageFor(fileName),
        theme: "github-dark",
      });

      return {
        name: fileName,
        raw,
        html,
      };
    }),
  );
}

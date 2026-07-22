import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const repository = path.resolve(import.meta.dirname, "..");
const sourceFile = path.join(repository, "docs/public/social-preview.svg");
const outputFile = path.join(repository, "docs/public/social-preview.png");
const fontFile = path.join(
  repository,
  "node_modules/vitepress/dist/client/theme-default/fonts/inter-roman-latin.woff2",
);

export async function renderSocialPreview(): Promise<Buffer> {
  const [source, font] = await Promise.all([readFile(sourceFile), readFile(fontFile)]);
  // resvg 2.6.2 accepts fontBuffers at runtime but omits it from the Node type declaration.
  const fontOptions = {
    defaultFontFamily: "Inter",
    fontBuffers: [font],
    loadSystemFonts: false,
    monospaceFamily: "Inter",
    sansSerifFamily: "Inter",
  };
  const rendered = new Resvg(source, {
    font: fontOptions,
    logLevel: "warn",
    textRendering: 2,
  }).render();

  if (rendered.width !== 1200 || rendered.height !== 630) {
    throw new Error(
      `Social preview must render at 1200x630, received ${rendered.width}x${rendered.height}`,
    );
  }

  return rendered.asPng();
}

async function main(): Promise<void> {
  const expected = await renderSocialPreview();
  if (process.argv.includes("--check")) {
    const current = await readFile(outputFile);
    if (!current.equals(expected)) {
      throw new Error("Social preview PNG is stale. Run pnpm render:social-preview.");
    }
    console.log("Social preview PNG matches its SVG source.");
    return;
  }

  await writeFile(outputFile, expected);
  console.log("Rendered docs/public/social-preview.png from its SVG source.");
}

const entrypoint = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
if (entrypoint === fileURLToPath(import.meta.url)) await main();

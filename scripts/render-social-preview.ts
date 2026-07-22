import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repository = path.resolve(import.meta.dirname, "..");
const sourceFile = path.join(repository, "docs/public/social-preview.svg");
const outputFile = path.join(repository, "docs/public/social-preview.png");
const manifestFile = path.join(repository, "docs/public/social-preview.manifest.json");
const fontFile = path.join(
  repository,
  "node_modules/vitepress/dist/client/theme-default/fonts/inter-roman-latin.woff2",
);

interface RootMetadata {
  devDependencies?: Record<string, unknown>;
}

interface SocialPreviewManifest {
  schema_version: 1;
  source: "social-preview.svg";
  source_sha256: string;
  output: "social-preview.png";
  output_sha256: string;
  width: 1200;
  height: 630;
  recipe_count: number;
  renderer: string;
  font: string;
  font_sha256: string;
}

function sha256(content: Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

async function previewManifest(source: Buffer, output: Buffer): Promise<SocialPreviewManifest> {
  const [metadataContents, font] = await Promise.all([
    readFile(path.join(repository, "package.json"), "utf8"),
    readFile(fontFile),
  ]);
  const metadata = JSON.parse(metadataContents) as RootMetadata;
  const rendererVersion = metadata.devDependencies?.["@resvg/resvg-js"];
  const vitepressVersion = metadata.devDependencies?.vitepress;
  const exactVersion = /^\d+\.\d+\.\d+$/u;
  if (
    typeof rendererVersion !== "string" ||
    !exactVersion.test(rendererVersion) ||
    typeof vitepressVersion !== "string" ||
    !exactVersion.test(vitepressVersion)
  ) {
    throw new Error("Social preview renderer dependencies must use exact versions.");
  }

  const recipeCount = (
    await readdir(path.join(repository, "recipes"), { withFileTypes: true })
  ).filter((entry) => entry.isDirectory()).length;
  if (!source.toString("utf8").includes(`${recipeCount} structured workflows`)) {
    throw new Error(`Social preview SVG must display the current count of ${recipeCount}.`);
  }
  if (
    output.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" ||
    output.readUInt32BE(16) !== 1200 ||
    output.readUInt32BE(20) !== 630
  ) {
    throw new Error("Social preview output must be a 1200x630 PNG.");
  }
  return {
    schema_version: 1,
    source: "social-preview.svg",
    source_sha256: sha256(source),
    output: "social-preview.png",
    output_sha256: sha256(output),
    width: 1200,
    height: 630,
    recipe_count: recipeCount,
    renderer: `@resvg/resvg-js@${rendererVersion}`,
    font: `vitepress@${vitepressVersion}/inter-roman-latin.woff2`,
    font_sha256: sha256(font),
  };
}

async function renderSocialPreview(): Promise<Buffer> {
  const { Resvg } = await import("@resvg/resvg-js");
  const [source, font] = await Promise.all([readFile(sourceFile), readFile(fontFile)]);
  // The Node runtime accepts fontBuffers but the published Node type declaration omits it.
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
  if (process.argv.includes("--check")) {
    const [source, output, retainedManifest] = await Promise.all([
      readFile(sourceFile),
      readFile(outputFile),
      readFile(manifestFile, "utf8"),
    ]);
    const expectedManifest = await previewManifest(source, output);
    if (retainedManifest !== `${JSON.stringify(expectedManifest, undefined, 2)}\n`) {
      throw new Error("Social preview manifest is stale. Run pnpm render:social-preview.");
    }
    console.log("Social preview source, PNG, and manifest are synchronized.");
    return;
  }

  const source = await readFile(sourceFile);
  const output = await renderSocialPreview();
  const manifest = await previewManifest(source, output);
  await writeFile(outputFile, output);
  await writeFile(manifestFile, `${JSON.stringify(manifest, undefined, 2)}\n`);
  console.log("Rendered the social preview PNG and recorded its source manifest.");
}

const entrypoint = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
if (entrypoint === fileURLToPath(import.meta.url)) await main();

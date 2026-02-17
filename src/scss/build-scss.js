const sass = require("sass");
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const { pathToFileURL } = require("url");

const SRC_DIR = path.resolve(__dirname);
const ASSETS_DIR = path.resolve(__dirname, "../../assets");
const CSS_OUTPUT_DIR = path.join(ASSETS_DIR, "css");
const IGNORED_FOLDERS = new Set(["00-godrej-reference"]);
const NON_ENTRY_TOP_LEVEL_DIRS = new Set(["abstracts", "base", "motion", "typography"]);

function shouldIgnore(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return Array.from(IGNORED_FOLDERS).some((folder) => normalized.includes(`/${folder}/`) || normalized.endsWith(`/${folder}`));
}

function collectScssFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (shouldIgnore(fullPath)) continue;
    if (entry.isDirectory()) {
      files = files.concat(collectScssFiles(fullPath));
      continue;
    }
    if (entry.isFile() && path.extname(entry.name) === ".scss") {
      files.push(fullPath);
    }
  }
  return files;
}

function toOutputPath(inputFile) {
  const relativePath = path.relative(SRC_DIR, inputFile).replace(/\\/g, "/");
  const outputRelative = relativePath.replace(/\.scss$/, ".css");
  const parsed = path.parse(outputRelative);
  const cleanedBaseName = parsed.name.replace(/^_+/, "") || parsed.name;
  return path.join(CSS_OUTPUT_DIR, parsed.dir, `${cleanedBaseName}.css`);
}

function getTopLevelSegment(filePath) {
  const relativePath = path.relative(SRC_DIR, filePath).replace(/\\/g, "/");
  return relativePath.split("/")[0];
}

function shouldCompileFile(filePath) {
  const ext = path.extname(filePath);
  if (ext !== ".scss") return false;
  if (!fs.existsSync(filePath)) return false;
  if (shouldIgnore(filePath)) return false;
  const topLevel = getTopLevelSegment(filePath);
  if (NON_ENTRY_TOP_LEVEL_DIRS.has(topLevel)) return false;
  return true;
}

async function compileFile(inputFile) {
  const outputFile = toOutputPath(inputFile);
  const source = fs.readFileSync(inputFile, "utf8");
  let result;

  try {
    result = sass.compile(inputFile, {
      style: "compressed",
      sourceMap: false
    });
  } catch (err) {
    // Some files depend on shared mixins/functions but don't import abstracts directly.
    const hasAbstractsUse = /@use\s+["'][^"']*abstracts\/index["']/.test(source) || /@use\s+["']@abstracts["']/.test(source);
    if (hasAbstractsUse) throw err;

    const abstractsPath = path.join(SRC_DIR, "abstracts", "index");
    let relToAbstracts = path.relative(path.dirname(inputFile), abstractsPath).replace(/\\/g, "/");
    if (!relToAbstracts.startsWith(".")) relToAbstracts = `./${relToAbstracts}`;
    const wrappedSource = `@use "${relToAbstracts}" as *;\n${source}`;

    result = sass.compileString(wrappedSource, {
      style: "compressed",
      sourceMap: false,
      url: pathToFileURL(inputFile)
    });
  }

  const prefixed = await postcss([autoprefixer]).process(result.css, { from: undefined });
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, prefixed.css, "utf8");
  console.log(
    "Compiled",
    path.relative(process.cwd(), inputFile),
    "->",
    path.relative(process.cwd(), outputFile)
  );
}

async function buildAll() {
  const files = collectScssFiles(SRC_DIR).filter((file) => shouldCompileFile(file));
  if (files.length === 0) {
    console.log("No SCSS files found in", SRC_DIR);
    return;
  }
  let failed = 0;
  for (const file of files) {
    try {
      await compileFile(file);
    } catch (err) {
      failed += 1;
      console.error("Compile failed:", path.relative(process.cwd(), file), "-", err.message);
    }
  }
  if (failed > 0) {
    console.warn(`SCSS build completed with ${failed} failed file(s).`);
  }
}

function watchAll() {
  console.log("Watching SCSS:", path.relative(process.cwd(), SRC_DIR));
  let timeoutId = null;

  fs.watch(SRC_DIR, { recursive: true }, (_eventType, filename) => {
    if (!filename) return;
    const filePath = path.join(SRC_DIR, filename.toString());
    if (path.extname(filePath) !== ".scss") return;

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      try {
        await buildAll();
      } catch (err) {
        console.error("Watch compile error:", err.message);
      }
    }, 150);
  });
}

if (require.main === module) {
  const isWatchMode = process.argv.includes("--watch");
  if (isWatchMode) {
    watchAll();
  } else {
    buildAll().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
}

module.exports = { buildAll, watchAll };

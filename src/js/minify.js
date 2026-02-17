const { minify } = require("terser");
const fs = require("fs");
const path = require("path");

const SRC_DIR = path.resolve(__dirname);
const ASSETS_JS_DIR = path.resolve(__dirname, "../../assets/js");
const IGNORED_FOLDERS = new Set(["00-godrej-reference"]);
const IGNORED_FILES = new Set(["minify.js", "minify-dist.js"]);

function shouldIgnore(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return Array.from(IGNORED_FOLDERS).some((folder) => normalized.includes(`/${folder}/`) || normalized.endsWith(`/${folder}`));
}

function collectSourceJsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (shouldIgnore(fullPath)) continue;

    if (entry.isDirectory()) {
      files = files.concat(collectSourceJsFiles(fullPath));
      continue;
    }

    if (!entry.isFile()) continue;
    if (path.extname(entry.name) !== ".js") continue;
    if (IGNORED_FILES.has(entry.name)) continue;
    if (entry.name.endsWith(".bkp.js")) continue;

    files.push(fullPath);
  }

  return files;
}

async function minifyAssetFile(assetFile) {
  if (!fs.existsSync(assetFile)) {
    console.warn("Skipped missing asset", path.relative(process.cwd(), assetFile));
    return;
  }

  const code = fs.readFileSync(assetFile, "utf8");
  const result = await minify(code, {
    compress: {
      keep_classnames: true,
      keep_fnames: true
    },
    mangle: {
      keep_classnames: true
    },
    sourceMap: false
  });

  if (result.code) {
    fs.writeFileSync(assetFile, result.code, "utf8");
    console.log("Minified", path.relative(process.cwd(), assetFile));
  }
}

async function run() {
  const sourceFiles = collectSourceJsFiles(SRC_DIR);
  if (sourceFiles.length === 0) {
    console.log("No source JS files found in", SRC_DIR);
    return;
  }

  for (const sourceFile of sourceFiles) {
    const relative = path.relative(SRC_DIR, sourceFile);
    const assetFile = path.join(ASSETS_JS_DIR, relative);
    await minifyAssetFile(assetFile);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

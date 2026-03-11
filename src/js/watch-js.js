const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const babel = require("@babel/core");
const { minify } = require("terser");

const SRC_DIR = path.resolve(__dirname);
const ASSETS_JS_DIR = path.resolve(__dirname, "../../assets/js");
const ROOT_DIR = path.resolve(__dirname, "../..");
const BABEL_CONFIG = path.join(ROOT_DIR, "babel.config.json");
const IGNORED_FOLDERS = new Set(["00-godrej-reference"]);
const INTERNAL_FILES = new Set(["minify.js", "minify-dist.js", "watch-js.js"]);

const pendingFiles = new Set();
let debounceId = null;
let isProcessing = false;

function shouldIgnore(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  if (!normalized.endsWith(".js")) return true;
  if (normalized.endsWith(".bkp.js")) return true;
  if (INTERNAL_FILES.has(path.basename(normalized))) return true;
  for (const folder of IGNORED_FOLDERS) {
    if (normalized.includes(`/${folder}/`) || normalized.endsWith(`/${folder}`)) {
      return true;
    }
  }
  return false;
}

function enqueue(relativePath) {
  pendingFiles.add(relativePath);
  if (debounceId) clearTimeout(debounceId);
  debounceId = setTimeout(processQueue, 120);
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    while (pendingFiles.size) {
      const batch = Array.from(pendingFiles);
      pendingFiles.clear();
      for (const relative of batch) {
        await buildOrRemove(relative);
      }
    }
  } finally {
    isProcessing = false;
  }
}

async function buildOrRemove(relativePath) {
  const sourceFile = path.join(SRC_DIR, relativePath);
  let stats;

  try {
    stats = await fs.promises.stat(sourceFile);
  } catch (err) {
    await removeAsset(relativePath);
    return;
  }

  if (!stats.isFile()) return;

  const assetFile = path.join(ASSETS_JS_DIR, relativePath);
  await fs.promises.mkdir(path.dirname(assetFile), { recursive: true });

  try {
    const result = await babel.transformFileAsync(sourceFile, {
      configFile: BABEL_CONFIG,
      cwd: ROOT_DIR,
      sourceMaps: false
    });

    if (!result || !result.code) return;

    const minified = await minify(result.code, {
      compress: {
        keep_classnames: true,
        keep_fnames: true
      },
      mangle: {
        keep_classnames: true
      },
      sourceMap: false
    });

    const output = minified.code || result.code;
    await fs.promises.writeFile(assetFile, output, "utf8");
    console.log(`[watch-js] Built ${relativePath.replace(/\\/g, "/")}`);
  } catch (err) {
    console.error(`[watch-js] Failed to build ${relativePath}`, err);
  }
}

async function removeAsset(relativePath) {
  const assetFile = path.join(ASSETS_JS_DIR, relativePath);
  if (!fs.existsSync(assetFile)) return;
  await fs.promises.unlink(assetFile);
  console.log(`[watch-js] Removed ${relativePath.replace(/\\/g, "/")}`);
}

function runInitialBuild() {
  return new Promise((resolve) => {
    const command = process.platform === "win32" ? "npm run build:js" : "npm run build:js";
    const child = spawn(command, [], {
      stdio: "inherit",
      shell: true
    });

    child.on("close", (code) => {
      if (code !== 0) {
        console.error("JS watch initial build failed with exit code", code);
      }
      resolve();
    });
  });
}

function startWatcher() {
  fs.watch(SRC_DIR, { recursive: true }, (_eventType, filename) => {
    if (!filename) return;
    const relative = path.normalize(filename.toString()).replace(/\\/g, "/");
    if (shouldIgnore(relative)) return;
    enqueue(relative);
  });
}

(async function run() {
  await runInitialBuild();
  startWatcher();
  console.log(`[watch-js] Watching ${path.relative(process.cwd(), SRC_DIR)}`);
})();

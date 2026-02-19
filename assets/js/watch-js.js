const fs = require("fs");
const path = require("path");
const {
  spawn
} = require("child_process");
const SRC_DIR = path.resolve(__dirname);
let isBuilding = false;
let queued = false;
let debounceId = null;
function runBuild() {
  if (isBuilding) {
    queued = true;
    return;
  }
  isBuilding = true;
  const command = process.platform === "win32" ? "npm run build:js" : "npm run build:js";
  const child = spawn(command, [], {
    stdio: "inherit",
    shell: true
  });
  child.on("close", code => {
    isBuilding = false;
    if (code !== 0) {
      console.error("JS watch build failed with exit code", code);
    }
    if (queued) {
      queued = false;
      runBuild();
    }
  });
}
function scheduleBuild() {
  if (debounceId) clearTimeout(debounceId);
  debounceId = setTimeout(() => {
    runBuild();
  }, 150);
}
function watch() {
  console.log("Watching JS:", path.relative(process.cwd(), SRC_DIR));
  runBuild();
  fs.watch(SRC_DIR, {
    recursive: true
  }, (_eventType, filename) => {
    if (!filename) return;
    const changed = filename.toString();
    if (!changed.endsWith(".js")) return;
    if (changed.endsWith(".bkp.js")) return;
    scheduleBuild();
  });
}
watch();
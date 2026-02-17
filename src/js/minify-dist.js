const { minify } = require('terser');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('dist directory not found, run babel first');
  process.exit(1);
}

async function minifyFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const result = await minify(code, {
    sourceMap: true,
  });
  if (result.code) {
    fs.writeFileSync(filePath.replace(/\.js$/, '.min.js'), result.code, 'utf8');
    if (result.map) {
      fs.writeFileSync(filePath.replace(/\.js$/, '.min.js.map'), result.map, 'utf8');
    }
    console.log('Minified', path.basename(filePath));
  }
}

async function walkAndMinify(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkAndMinify(full);
    } else if (/\.js$/.test(entry.name)) {
      await minifyFile(full);
    }
  }
}

walkAndMinify(distDir).catch(err => {
  console.error(err);
  process.exit(1);
});

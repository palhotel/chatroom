const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const buildDir = path.join(root, 'build');

const packageJson = require(path.join(root, 'package.json'));
const outputName = packageJson.name || 'PalChatRoom';

function ensureBuildDir() {
  fs.mkdirSync(buildDir, { recursive: true });
}

function copyFile(relativePath) {
  const from = path.join(srcDir, relativePath);
  const to = path.join(buildDir, relativePath);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function buildJs() {
  const source = fs.readFileSync(path.join(srcDir, 'app.js'), 'utf8');
  const banner = `/*! ${outputName} ${new Date().toISOString().slice(0, 10)} */\n`;
  const footer = `\n/* ${outputName} end ! */`;
  fs.writeFileSync(path.join(buildDir, `${outputName}.js`), `${banner}${source}${footer}`);
}

function buildCss() {
  const source = fs.readFileSync(path.join(srcDir, 'PalChatRoom.css'), 'utf8');
  const minified = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .trim();
  fs.writeFileSync(path.join(buildDir, `${outputName}.css`), minified);
}

async function run() {
  ensureBuildDir();
  copyFile('index.html');
  copyFile(path.join('images', 'loading.gif'));
  buildJs();
  buildCss();
  console.log('Build completed to', buildDir);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

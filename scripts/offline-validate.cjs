/**
 * Syntax + pure-domain validation without loading Next.js/React/GSAP.
 * Usage: node scripts/offline-validate.cjs
 * Or: TYPESCRIPT_PATH=/absolute/path/to/typescript node scripts/offline-validate.cjs
 * This deliberately does not claim to replace a framework build/typecheck.
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const ts = require(process.env.TYPESCRIPT_PATH || 'typescript');
const root = path.resolve(__dirname, '..');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'maison-goya-validation-'));
const files = [];
const ignored = new Set(['node_modules', '.next', 'out', 'test-results', 'playwright-report']);
function walk(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(item.name)) continue;
    const filename = path.join(directory, item.name);
    if (item.isDirectory()) walk(filename);
    else if (/(?<!\.d)\.tsx?$/.test(filename)) files.push(filename);
  }
}
function printDiagnostics(diagnostics) {
  for (const diagnostic of diagnostics) {
    console.error(diagnostic.file?.fileName || '', ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  }
}
try {
  walk(root);
  let syntaxCount = 0;
  for (const filename of files) {
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename, reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, strict: true, esModuleInterop: true },
    });
    const diagnostics = result.diagnostics || [];
    syntaxCount += diagnostics.length;
    printDiagnostics(diagnostics);
    const relative = path.relative(root, filename);
    if ((relative.startsWith(`lib${path.sep}`) && !filename.endsWith(`${path.sep}gsap.ts`)) || filename.endsWith('.test.ts')) {
      const target = path.join(output, relative.replace(/\.tsx?$/, '.js'));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, result.outputText);
    }
  }
  console.log(`Syntax: ${files.length} TypeScript/TSX files; ${syntaxCount} diagnostics.`);
  const pureFiles = files.filter((filename) => path.relative(root, filename).startsWith(`lib${path.sep}`) && !filename.endsWith(`${path.sep}gsap.ts`));
  const program = ts.createProgram(pureFiles, {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true, noEmit: true, skipLibCheck: true, types: [],
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.es2022.intl.d.ts'],
  });
  const semantic = ts.getPreEmitDiagnostics(program);
  printDiagnostics(semantic);
  console.log(`Pure-domain semantic check: ${pureFiles.length} modules; ${semantic.length} diagnostics.`);
  const tests = spawnSync(process.execPath, ['--test', path.join(output, 'tests', 'commerce.test.js'), path.join(output, 'tests', 'i18n.test.js')], { stdio: 'inherit' });
  process.exitCode = syntaxCount || semantic.length || tests.status !== 0 ? 1 : 0;
} finally {
  fs.rmSync(output, { recursive: true, force: true });
}

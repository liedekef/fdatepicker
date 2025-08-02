// build.mjs
import { readFile, writeFile, copyFile } from 'fs/promises';

const input = 'src/ftable.js'; // Your source
const outputEsm = 'ftable.esm.js';
const outputUmd = 'ftable.umd.js';
const outputStandalone = 'ftable.js'; // ← This is the standalone version

const source = await readFile(input, 'utf8');

// ESM version
const esm = `
${source}
export default FTable;
`;
await writeFile(outputEsm, esm);

// UMD version
const umd = `
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.FTable = factory());
}(this, (function () {
    ${source}
    return FTable;
})));
`;
await writeFile(outputUmd, umd);

// ✅ Make ftable.js the standalone/UMD version (for backward compatibility)
await copyFile(outputUmd, outputStandalone);

console.log('✅ Built ftable.js (standalone), ftable.esm.js, ftable.umd.js');

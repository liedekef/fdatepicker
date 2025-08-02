// build.mjs
import { readFile, writeFile, copyFile } from 'fs/promises';

const input = 'src/js/fdatepicker.js'; // Your source
const outputEsm = 'fdatepicker.esm.js';
const outputUmd = 'fdatepicker.umd.js';
const outputStandalone = 'fdatepicker.js'; // ← This is the standalone version

const source = await readFile(input, 'utf8');

// ESM version
const esm = `
${source}
export default FDatepicker;
`;
await writeFile(outputEsm, esm);

// UMD version
const umd = `
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.FDatepicker = factory());
}(this, (function () {
    ${source}
    return FDatepicker;
})));
`;
await writeFile(outputUmd, umd);

// ✅ Make fdatepicker.js the standalone/UMD version (for backward compatibility)
await copyFile(outputUmd, outputStandalone);

console.log('✅ Built fdatepicker.js (standalone), fdatepicker.esm.js, fdatepicker.umd.js');

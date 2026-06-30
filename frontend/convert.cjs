const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const srcDir = 'C:/Users/a/.gemini/antigravity/scratch/lovable-ref/digital-sleuth-saga-main/src/game';
const outDir = 'C:/Users/a/.gemini/antigravity/scratch/cyber-arena/frontend/src/game';
const files = ['Phases.tsx', 'Room.tsx', 'devices.tsx', 'Board.tsx', 'Recovery.tsx', 'data.ts'];

files.forEach(f => {
  const content = fs.readFileSync(path.join(srcDir, f), 'utf-8');
  const res = esbuild.transformSync(content, {
    loader: f.endsWith('.tsx') ? 'tsx' : 'ts',
    format: 'esm'
  });
  const ext = f.endsWith('.tsx') ? '.jsx' : '.js';
  fs.writeFileSync(path.join(outDir, f.replace(/\.(tsx|ts)$/, ext)), res.code);
});
console.log('Done!');

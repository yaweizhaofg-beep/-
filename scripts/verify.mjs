import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
let checked=0;
async function walk(directory){const result=[];for(const entry of await fs.readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);result.push(...(entry.isDirectory()?await walk(file):[file]));}return result;}
const files=await walk(root);
for(const file of files.filter(file=>/\.(js|mjs|html|css)$/.test(file))){
  const source=await fs.readFile(file,'utf8');
  const refs=file.endsWith('.html')?[...source.matchAll(/(?:href|src)=["'](\.\/[^"']+?)["']/g)].map(row=>row[1]):file.endsWith('.css')?[]:[...source.matchAll(/(?:from\s*|import\s*\(?\s*)["'](\.[^"']+)["']/g)].map(row=>row[1]);
  for(const ref of refs){const target=path.resolve(path.dirname(file),ref);if(!target.startsWith(root))throw new Error(`Outside bundle: ${path.relative(root,file)}`);await fs.access(target);checked++;}
}
await fs.access(path.join(root,'public/assets/brand-logo.png'));
await fs.access(path.join(root,'public/assets/echo-archive.png'));
console.log(`Bundle verified: ${files.length} files, ${checked} local references, both brand assets present.`);

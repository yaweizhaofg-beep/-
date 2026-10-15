import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const dist=path.join(root,'dist');
await fs.rm(dist,{recursive:true,force:true});
await fs.mkdir(dist,{recursive:true});
for(const name of ['index.html','src','public'])await fs.cp(path.join(root,name),path.join(dist,name),{recursive:true});
console.log('Static bundle ready: dist/');

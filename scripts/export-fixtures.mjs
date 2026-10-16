import fs from 'node:fs/promises';
import { createFixtures } from '../src/data/fixtures.js';
const target=new URL('../artifacts/studio-response.json',import.meta.url);
await fs.mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
await fs.writeFile(target,JSON.stringify({data:createFixtures()},null,2)+'\n');
console.log('Fictional /studio response: artifacts/studio-response.json');

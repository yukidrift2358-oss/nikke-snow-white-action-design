import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const assets=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../assets');
for(const name of await fs.readdir(assets)){
  if(name.endsWith('.svg'))await sharp(path.join(assets,name)).png().toFile(path.join(assets,name.replace('.svg','.png')));
}

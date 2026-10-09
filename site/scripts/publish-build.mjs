import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(site, '..');
const build = resolve(site, 'dist');
async function copyAsset(path) {
  const source = resolve(build, path), target = resolve(root, path);
  if (relative(build, source).startsWith('..') || relative(root, target).startsWith('..')) throw new Error('Invalid build path.');
  await mkdir(dirname(target), {recursive:true});
  await copyFile(source, target);
}
await copyAsset('index.html');
await copyAsset('space-mark.svg');
for (const file of await readdir(resolve(build, '_astro'), {withFileTypes:true})) {
  if (!file.isFile()) throw new Error('Only regular fingerprinted assets may be published.');
  await copyAsset(`_astro/${file.name}`);
}
console.log('Homepage and new assets copied. Existing routes and assets preserved.');

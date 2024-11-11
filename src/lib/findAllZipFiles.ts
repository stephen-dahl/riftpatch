import findZipFiles from './findZipFiles';
import { resolve, basename } from 'path';
import { stringify } from 'yaml';

export default async function findAllZipFiles(
  gamePath: string,
  modPaths: string[] = [
    resolve(gamePath, '../../../workshop/content/780310'),
    resolve('C:/Users/Public/mod.io/3951/mods'),
    resolve(gamePath, '../mods'),
  ],
  ignore = ['~RiftPatch.zip', '~RiftPatchMaps.zip']
) {
  modPaths.unshift(gamePath);

  console.log(`scanning for game files at\n${stringify(modPaths)}`);

  const zips = (await Promise.all(modPaths.map(findZipFiles)))
    .flat()
    .filter((z) => !ignore.includes(basename(z)))
    .sort((a, b) => {
      a = basename(a);
      b = basename(b);
      if (a === b) return 0;
      return a < b ? -1 : 1;
    });
  return zips;
}

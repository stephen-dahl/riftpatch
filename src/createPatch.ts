import filterForConflicts from './lib/filterForConflicts';
import readGameFile from './lib/readGameFile';
import { getDiff } from 'recursive-diff';
import diffToPatch from './lib/diffToPatch';
import { writeFile } from 'fs/promises';
import getModManifest from './lib/getModManifest';
import findAllZipFiles from './lib/findAllZipFiles';

export default async function createPatch(gamePath: string, patchFile: string) {
  const zips = await findAllZipFiles(gamePath);

  console.log(`looking for conflicts`);
  const conflicts = await filterForConflicts(zips, gamePath, 2);

  let i = 1;
  const files = Object.keys(conflicts).sort();
  const modInfo: Record<string, Record<string, string>> = {};
  const result: string[] = [];
  for (const file of files) {
    const zips = conflicts[file];
    if (!zips[0].startsWith(gamePath)) continue;
    console.log(`FILE ${String(i++).padStart(4)}/${files.length} ${file}`);
    result.push(`\n\nfile ${file}`);
    let gameZip: string;
    do {
      gameZip = zips.shift()!;
    } while (zips[0]?.startsWith(gamePath));
    const gameData = await readGameFile(gameZip, file);

    for (const zip of zips) {
      if (!modInfo[zip]) modInfo[zip] = await getModManifest(zip);
      const modData = await readGameFile(zip, file);
      const diff = getDiff(gameData, modData);
      const string = diffToPatch(diff);
      const { name, gameVersion, version } = modInfo[zip];

      result.push(`\n// ${name} v${version} ${gameVersion}`);
      result.push(string);
    }
  }

  await writeFile(patchFile, result.join('\n').trimStart());
  console.log('RiftPatch written to', patchFile);
}

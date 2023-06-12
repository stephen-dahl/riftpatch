import findZipFiles from './lib/findZipFiles';
import filterForConflicts from './lib/filterForConflicts';
import readGameFile from './lib/readGameFile';
import { getDiff } from 'recursive-diff';
import diffToPatch from './lib/diffToPatch';
import { writeFile } from 'fs/promises';
import getModManifest from './lib/getModManifest';

export default async function createPatch(
  gamePath: string,
  modsPath: string,
  patchFile: string
) {
  console.log(`scanning game files at ${gamePath}`);
  const gameZips = await findZipFiles(gamePath, true);
  console.log(`scanning mod files at ${modsPath}`);
  const modZips = await findZipFiles(modsPath);
  const modInfo: Record<string, Record<string, string>> = {};

  console.log(`looking for mod overrides`);
  const conflicts = await filterForConflicts(
    [...gameZips, ...modZips],
    gamePath,
    2
  );

  let i = 1;
  let files = Object.keys(conflicts).sort();
  const result: string[] = [];
  for (const file of files) {
    console.log(`FILE ${String(i++).padStart(4)}/${files.length} ${file}`);
    result.push(`\n\nfile ${file}`);
    const zips = conflicts[file];
    if (!zips[0].startsWith(gamePath)) continue;

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

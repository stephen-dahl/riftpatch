import { readFile } from 'fs/promises';
import { applyDiff, rdiffResult } from 'recursive-diff';
import readGameFile from './lib/readGameFile';
import findZipFiles from './lib/findZipFiles';
import indexFiles from './lib/indexFiles';
import AdmZip from 'adm-zip';
import parse from './lib/parse';
import toGame from './lib/toGame';

const Command =
  /\s*(set|delete|add|file) +(\S+)(?: +((?:(?!\s*\n(set|delete|add|file)).)*))?/sy;
export default async function createMod(
  gameFolder: string,
  patchFile: string,
  modFile: string
) {
  const patch = await readFile(patchFile).then((b) => b.toString('utf8'));
  const commands = patch
    .split('\n')
    .map((l) => l.split('//')[0])
    .filter(Boolean)
    .join('\n');

  const diffByFile: Record<string, rdiffResult[]> = {};
  let file: string;
  let match: any[] | null;
  while ((match = Command.exec(commands))) {
    let [_, op, key, val] = match;
    key = key.replaceAll('\\.', '.');

    if (val?.startsWith('{')) {
      val = val.trim();
      val = parse(val.substring(1, val.length - 1));
    }

    if (!file! && op !== 'file')
      throw new Error('must specify file before any other patch operation');

    switch (op) {
      case 'file':
        file = key;
        if (!diffByFile[file]) diffByFile[file] = [];
        break;
      case 'add':
        diffByFile[file!].push({ op: 'add', path: key.split('.'), val });
        break;
      case 'set':
        diffByFile[file!].push({ op: 'update', path: key.split('.'), val });
        break;
      case 'delete':
        diffByFile[file!].push({ op: 'delete', path: key.split('.'), val });
        break;
    }
  }

  //find game zips
  const zipFiles = await findZipFiles(gameFolder);
  const files = await indexFiles(zipFiles);

  //index files to the zip the game will use for them.
  const index: Record<string, string> = {};
  for (const file in files) {
    index[file] = files[file].pop()!;
  }

  const zip = new AdmZip();
  for (const file in diffByFile) {
    const data = await readGameFile(index[file], file);
    const patched = applyDiff(data, diffByFile[file]);
    const text = toGame(patched);
    zip.addFile(file, Buffer.from(text));
  }

  await zip.writeZipPromise(modFile, { overwrite: true });
  console.log(modFile, 'created');
}

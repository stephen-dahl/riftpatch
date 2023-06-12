import listFilesInZip from './listFilesInZip';
import parsableFolders from './parsableFolders';
import parsableFileTypes from './parsableFileTypes';

export default async function indexFiles(zips: string[]) {
  const index: Record<string, string[]> = {};

  for (const zip of zips) {
    const files = await listFilesInZip(zip, parsableFolders, parsableFileTypes);

    for (const file of files) {
      if (!index[file]) index[file] = [];
      index[file].push(zip);
    }
  }
  return index;
}

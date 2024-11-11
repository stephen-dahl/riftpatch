import { readdir, stat } from 'fs/promises';
import path from 'path';

export default async function findZipFiles(directory: string) {
  const zipFiles: string[] = [];

  async function traverseDir(currentDir: string) {
    try {
      const files = await readdir(currentDir);

      for (const file of files) {
        const filePath = path.join(currentDir, file);
        const s = await stat(filePath);

        if (s.isDirectory()) await traverseDir(filePath);
        else if (path.extname(file) === '.zip') zipFiles.push(filePath);
      }
    } catch (e: any) {
      console.warn(e?.message ?? e);
    }
  }

  await traverseDir(directory);

  return zipFiles;
}

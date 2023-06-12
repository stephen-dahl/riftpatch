import { readdir, stat } from 'fs/promises';
import path from 'path';

export default async function findZipFiles(
  directory: string,
  dataOnly = false
) {
  const zipFiles: string[] = [];

  async function traverseDir(currentDir: string) {
    const files = await readdir(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const s = await stat(filePath);

      if (s.isDirectory()) {
        // Recursive call for subdirectories
        await traverseDir(filePath);
      } else {
        // Check if file has a .zip extension
        if (path.extname(file) === '.zip') {
          if (!dataOnly || path.basename(file).includes('data'))
            zipFiles.push(filePath);
        }
      }
    }
  }

  await traverseDir(directory);

  return zipFiles;
}

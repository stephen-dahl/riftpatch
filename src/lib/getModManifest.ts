import path from 'path';
import readGameFile from './readGameFile';

export default async function getModManifest(zip: string) {
  const file = path.basename(zip, '.zip') + '.manifest';
  let manifest;
  try {
    manifest = ((await readGameFile(zip, file)) as any)?.WorkspaceManifest;
  } catch (e) {
    return {
      name: `${file.split('.')[0]}`,
      gameVersion: 'unknown',
      version: 'unknown',
    };
  }
  return {
    name: Buffer.from(manifest?.title, 'base64').toString(),
    gameVersion: manifest?.game_version?.replaceAll('"', ''),
    version: manifest.version?.replaceAll('"', ''),
  };
}

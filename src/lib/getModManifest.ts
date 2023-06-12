import path from 'path';
import readGameFile from './readGameFile';

export default async function getModManifest(zip: string) {
  const file = path.basename(zip, '.zip') + '.manifest';
  const manifest = ((await readGameFile(zip, file)) as any)?.WorkspaceManifest;
  return {
    name: Buffer.from(manifest?.title, 'base64').toString(),
    gameVersion: manifest?.game_version?.replaceAll('"', ''),
    version: manifest.version?.replaceAll('"', ''),
  };
}

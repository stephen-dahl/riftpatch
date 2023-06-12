import Zip from 'node-stream-zip';
import parse from './parse';

export default async function readGameFile(zipPath: string, file: string) {
  const zip = new Zip.async({ file: zipPath });
  const buffer = await zip.entryData(file);
  const text = buffer.toString('utf8');
  try {
    return parse(text);
  } catch (e) {
    if (e instanceof Error) e.message = `${zipPath}/${file} ${e.message}`;
    throw e;
  }
}

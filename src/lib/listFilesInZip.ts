import * as Zip from 'node-stream-zip';

export default async function listFilesInZip(
  file: string,
  prefix = [''],
  suffix = ['']
) {
  const zip = new Zip.async({ file });
  const entries = await zip.entries();
  return Object.keys(entries).filter(
    (e) =>
      prefix.some((p) => e.startsWith(p)) && suffix.some((s) => e.endsWith(s))
  );
}

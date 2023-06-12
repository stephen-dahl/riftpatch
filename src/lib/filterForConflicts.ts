import indexFiles from './indexFiles';

export default async function filterForConflicts(
  zipFiles: string[],
  gamePath: string,
  maxCopies = 2
) {
  const files = await indexFiles(zipFiles);

  for (const file in files) {
    //only keep the last found game zip containing file
    while (files[file][1]?.startsWith(gamePath)) files[file].shift();

    if (files[file].length <= maxCopies) delete files[file];
  }

  return files;
}

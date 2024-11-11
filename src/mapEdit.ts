import readGameFile from './lib/readGameFile';
import AdmZip from 'adm-zip';
import toGame from './lib/toGame';
import findAllZipFiles from './lib/findAllZipFiles';
import indexFiles from './lib/indexFiles';

const toNumber = (n: string) => Number(n);
const mulList = (list: string | Record<string, object>, n: number) => {
  let quote = false;
  if (typeof list !== 'string') return list;
  if (list.startsWith('"')) {
    quote = true;
    list = list.replaceAll('"', '');
  }
  const result = list
    .split(',')
    .map((v) => Math.round(toNumber(v) * n))
    .join(',');

  return quote ? `"${result}"` : result;
};

export default async function mapEdit(
  gameFolder: string,
  modFile: string,
  sizeMul: number,
  depositMul: number,
  instanceMul: number
) {
  const zips = await findAllZipFiles(gameFolder, undefined, [
    '~RiftPatchMaps.zip',
  ]);
  const files = await indexFiles(zips);

  let i = 1;
  const fileNames = Object.keys(files)
    .filter(
      (f) =>
        f.startsWith('missions/campaigns') ||
        (f.startsWith('missions/survival') && f.endsWith('.mission'))
    )
    .sort();
  const longest = fileNames.reduce((p, v) =>
    p.length > v.length ? p : v
  ).length;
  const mod = new AdmZip();
  for (const file of fileNames) {
    const zip = files[file].pop()!;
    const data = await readGameFile(zip, file);

    if (!data.MissionDef) return;

    //scale map size
    if (data.MissionDef.map_size)
      data.MissionDef.map_size = mulList(data.MissionDef.map_size, sizeMul);

    console.log(
      `File ${i++}/${fileNames.length} ${file.padEnd(
        longest
      )} ${data.MissionDef.map_size?.padEnd(5)} from ${zip}`
    );

    //scale map feature count
    for (const key in data.MissionDef.tile_spawn_rules ?? {}) {
      const tile = data.MissionDef.tile_spawn_rules[key];
      if (tile.min_instances)
        tile.min_instances = mulList(tile.min_instances, instanceMul);
      if (tile.max_instances)
        tile.max_instances = mulList(tile.max_instances, instanceMul);
    }

    //scale hidden caches
    for (const key in data.MissionDef.mission_object_spawners ?? {}) {
      const spawner = data.MissionDef.mission_object_spawners[key];
      if (spawner.spawn_pool === '"mission_objective"') continue;

      if (spawner.spawn_instances_minmax)
        spawner.spawn_instances_minmax = mulList(
          spawner.spawn_instances_minmax,
          instanceMul
        );

      for (const key in spawner.spawn_blueprints ?? {}) {
        const bp = spawner.spawn_blueprints[key];
        if (bp.spawn_instances_minmax)
          bp.spawn_instances_minmax = mulList(
            bp.spawn_instances_minmax,
            instanceMul
          );
      }
    }

    //scale map resources
    for (const key in data.MissionDef.random_resources ?? {}) {
      const r = data.MissionDef.random_resources[key];
      if (r.min_resources)
        r.min_resources = mulList(r.min_resources, depositMul);
      if (r.max_resources)
        r.max_resources = mulList(r.max_resources, depositMul);
      if (r.min_spawned_volumes)
        r.min_spawned_volumes = mulList(r.min_spawned_volumes, instanceMul);
      if (r.max_spawned_volumes)
        r.max_spawned_volumes = mulList(r.max_spawned_volumes, instanceMul);
    }

    //scale spawn area resources
    for (const key in data.MissionDef.starting_resources ?? {}) {
      const r = data.MissionDef.starting_resources[key];
      if (r.min_resources)
        r.min_resources = mulList(r.min_resources, depositMul);
      if (r.max_resources)
        r.max_resources = mulList(r.max_resources, depositMul);
    }

    const text = toGame(data);
    mod.addFile(file, Buffer.from(text));
  }

  await mod.writeZipPromise(modFile);
  console.log('created', modFile);
}

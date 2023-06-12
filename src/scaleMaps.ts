import listFilesInZip from './lib/listFilesInZip';
import findZipFiles from './lib/findZipFiles';
import readGameFile from './lib/readGameFile';
import AdmZip from 'adm-zip';
import toGame from './lib/toGame';

const toNumber = (n: string) => Number(n);
const mulList = (list: string, n: number) => {
  let quote = false;
  if (list.startsWith('"')) {
    quote = true;
    list = list.replaceAll('"', '');
  }
  const result = list
    .split(',')
    .map((v) => toNumber(v) * n)
    .join(',');

  return quote ? `"${result}"` : result;
};

export default async function scaleMaps(
  gameFolder: string,
  modFile: string,
  sizeMul: number,
  depositMul: number,
  instanceMul: number
) {
  const zips = await findZipFiles(gameFolder, true);
  const mod = new AdmZip();
  for (const zip of zips) {
    const missions = await listFilesInZip(zip, ['missions'], ['.mission']);

    for (const mission of missions) {
      const data = await readGameFile(zip, mission);

      if (!data.MissionDef) return;

      //scale map size
      if (data.MissionDef.map_size)
        data.MissionDef.map_size = mulList(data.MissionDef.map_size, sizeMul);

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
      mod.addFile(mission, Buffer.from(text));
    }
  }

  await mod.writeZipPromise(modFile);
  console.log('created', modFile);
}

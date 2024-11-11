import { program, createOption } from 'commander';
import path from 'path';
import createPatch from './createPatch';
import createMod from './createMod';
import mapEdit from './mapEdit';

const oGameFolder = createOption(
  '-g, --gameFolder <string>',
  'root game folder, usually ends in Steam/steamapps/common/Riftbreaker'
).default(process.cwd());
const oPatchFile = createOption(
  '-p, --patchFile <string>',
  'patch file to read/write patches from/to, relative to the folder this cli is used from'
).default('mods.riftPatch');
const oModFile = createOption(
  '-m, --modFile <string>',
  'file name to save the new mod as, relative to game folder. The file name should start with ~ so that it is loaded after mods'
).default('mods/~RiftPatch.zip');

program
  .name('riftPatch')
  .description('Tools for improving compatibility between Rift Breaker mods')
  .version(require('../package.json').version);

program
  .command('createPatch')
  .description('creates a patch from the mods in the mod folder')
  .addOption(oGameFolder)
  .addOption(oPatchFile)
  .action(async (o) => {
    const gameFolder = path.resolve(o.gameFolder, 'packs');
    const patchFile = path.resolve(o.patchFile);
    await createPatch(gameFolder, patchFile);
  });

program
  .command('createMod')
  .description('creates a mod from a .riftPatch file')
  .addOption(oGameFolder)
  .addOption(oPatchFile)
  .addOption(oModFile)
  .action(async (o) => {
    const gameFolder = path.resolve(o.gameFolder, 'packs');
    const patchFile = path.resolve(o.patchFile);
    const modFile = path.resolve(o.gameFolder, o.modFile);
    await createMod(gameFolder, patchFile, modFile);
  });

const oModFile2 = createOption(
  '-m, --modFile <string>',
  'file name to save the new mod as, relative to game folder.'
).default('mods/~RiftPatchMaps.zip');
const oSizeMul = createOption(
  '-s, --sizeMul <string>',
  'multiply the map size by this. if the map size is 8 and you pass 2 the new map size will be 8*2=16. default value is 1 for no change'
).default(1);
const oDepositMul = createOption(
  '-d, --depositMul <string>',
  'multiply the resources in a resource deposit. default value is 1 for no change'
).default(1);
const oInstanceMul = createOption(
  '-i, --instanceMul <string>',
  'multiply the number of map features generated including how many resource deposits are on the map.\nIf you scale the map by 2 you have 4 times the area to fill since you are scaling the width by 2 and the height by 2. default value is sizeMul^2'
).default(null);

program
  .command('mapEdit')
  .description('scales map sizes, and resource deposits on maps.')
  .addOption(oGameFolder)
  .addOption(oModFile2)
  .addOption(oSizeMul)
  .addOption(oDepositMul)
  .addOption(oInstanceMul)
  .action(async ({ gameFolder, modFile, sizeMul, depositMul, instanceMul }) => {
    modFile = path.resolve(gameFolder, modFile);
    gameFolder = path.resolve(gameFolder, 'packs');
    sizeMul = Number(sizeMul);
    depositMul = Number(depositMul);
    instanceMul =
      instanceMul === null ? sizeMul * sizeMul : Number(instanceMul);
    await mapEdit(gameFolder, modFile, sizeMul, depositMul, instanceMul);
  });

program.parse();

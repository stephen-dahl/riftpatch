# RiftPatch

automatically merge many mods that normally conflict.

## What it does

Modding RiftBreaker is done by replacing game data files.
Let's pretend that we have 2 mods. One mod doubles tower range, the other doubles tower damage.
They both edit the towers data file. Since they both edit the same file they conflict even though they are not editing
the same value.

That's where RiftPatch comes in. RiftPatch scans your mods to see what they changed.
It will create a new mod with the changes from both mods and add it to the end of your mod list.

NOTE: RiftPatch can not merge all conflicts. Some changes require manual intervention to fix. Most changes should work
though as long as the folder and extension are listed.

* Supported Folders: [src/lib/parsableFolders.ts](src/lib/parsableFolders.ts)
* Supported files: [src/lib/parsableFileTypes.ts](src/lib/parsableFileTypes.ts)

## Installing

download RiftPatch.bat and riftpatch.exe from latest release and copy them to your game folder.

Your game folder is usually something like `Steam/steamapps/common/Riftbreaker`

If you don't have a mods folder here create it `Riftbreaker/mods`. It should look like this

![riftbreaker folder](riftbreakerfolder.png?raw=true)

## How do I use it?

#### Steam

Double click RiftPatch.bat inside your game folder whenever you update your mods.

#### Everyone Else

Edit the bat file to provide you mod folder's path then run as normal. (edit by right-clicking on the bat file then picking edit)

`.\riftpatch.exe createPatch -m "path/to/my/mods/folder"`

## Advanced Use

The cli has several functions that can be used by mod authors or advanced users.

`.\riftpatch.exe createPatch` scans for conflicting mods and creates a patch file listing what each mod changes in
conflicting files.

`.\riftpatch.exe createMod` reads the patch file to generate the RiftPatch.zip

`.\riftpatch.exe scaleMaps` Bonus function, this creates a standalone mod that scales all maps and resources. By default
it doubles map sizes, doubles resources in a deposit, and scales the number of resource deposits to match the map size.

run `.\riftpatch.exe --help` for available options on any of these commands.


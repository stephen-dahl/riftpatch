# RiftPatch

automatically merge many mods that normally conflict.

## What it does

Modding RiftBreaker is done by replacing game data files.
Let's pretend that we have 2 mods. One mod doubles tower range, the other doubles tower damage.
They both edit the towers data file. Since they both edit the same file they conflict even though they are not editing the same value.

That's where RiftPatch comes in. RiftPatch scans your mods to see what they changed.
It will create a new mod with the changes from both mods and add it to the end of your mod list.

## How do I use it?

### 1. Install RiftPatch to your game folder.

download the latest release and copy it to your game folder.

### 2. Create a patchfile

Run RiftPatch.bat

## Advanced Use

The cli has several functions that can be used by mod authors or advanced users.

`riftpatch createPatch` scans for conflicting mods and creates a patch file listing what each mod changes in conflicting files.

`riftpatch createMod` reads the patch file to generate the RiftPatch.zip

`riftpatch scaleMaps` Bonus function, this creates a standalone mod that scales all maps and resources. By default it doubles map sizes, doubles resources in a deposit, and scales the number of resource deposits to match the map size.

run `riftpatch --help` for available options on any of these commands.

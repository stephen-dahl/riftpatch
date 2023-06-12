export const IndexBy: Record<string, string | undefined> = {
  Blueprint: 'blueprint',
  EntityBlueprint: 'name',
  SubMesh: 'id',
  TypeDesc: 'type',
};

export function getIndex(key: string) {
  return IndexBy[key];
}

export const ArrayTypes: Record<string, boolean | undefined> = {
  TestArray: true,
  EffectBaseBlueprints: true,
  idle_attachments: true,
  tags: true,
};

export function isArrayType(key: string) {
  return ArrayTypes[key] ?? false;
}

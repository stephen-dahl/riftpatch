import { rdiffResult } from 'recursive-diff';
import toGame from './toGame';

const formatValue = (value: string | object) =>
  typeof value === 'object' ? `{\n${toGame(value, 1)}\n}` : value;

export default function diffToPatch(diff: rdiffResult[]) {
  let result = [];
  for (const change of diff) {
    const path = change.path
      .map((p) => String(p).replaceAll('.', '\\.'))
      .join('.');
    switch (change.op) {
      case 'add':
        result.push(`add ${path} ${formatValue(change.val)}`);
        break;
      case 'update':
        result.push(`set ${path} ${formatValue(change.val)}`);
        break;
      case 'delete':
        result.push(`delete ${path}`);
        break;
    }
  }
  return result.join('\n');
}

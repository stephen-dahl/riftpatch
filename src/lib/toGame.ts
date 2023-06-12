const isInt = /^\d+$/;
export default function toGame(data: {}, indent = 0) {
  const result: string[] = [];
  const recurse = (data: any, indent = 0) => {
    const i = `\t`.repeat(indent);

    for (let key in data) {
      const value = data[key];
      const [keyName] = key.split('#');

      switch (typeof value) {
        case 'string':
          if (isInt.test(key)) result.push(`${i}${value}`);
          else result.push(`${i}${keyName} ${value}`);
          break;
        case 'object':
          if (value.__alias__) {
            result.push(`${i}${keyName} ${value.__alias__}\n${i}{`);
            delete value.__alias__;
          } else result.push(`${i}${keyName}\n${i}{`);
          recurse(value, indent + 1);
          result.push(`${i}}`);
          break;
      }
    }
  };
  recurse(data, indent);

  return result.join('\n');
}

import {
  createToken,
  CustomPatternMatcherReturn,
  EmbeddedActionsParser,
  Lexer,
} from 'chevrotain';
import { stringify } from 'yaml';
import { ITokenConfig } from '@chevrotain/types';
import { getIndex, isArrayType } from './dataTypes';

const createTokenWMatches = (
  name: string,
  pattern: RegExp,
  line_breaks = false,
  config: Partial<ITokenConfig> = {}
) => {
  return createToken({
    ...config,
    name,
    line_breaks,
    pattern: (text, offset) => {
      pattern.lastIndex = offset;
      const [all, ...rest] = pattern.exec(text) ?? [];
      if (!all) return null;
      const result: CustomPatternMatcherReturn = [all] as [string] & {
        payload: string[];
      };
      result.payload = rest;
      return result;
    },
  });
};

const tWhitespace = createToken({
  name: 'Whitespace',
  pattern: /\s+/y,
  group: Lexer.SKIPPED,
});
const tObjectEnd = createToken({ name: 'ObjectEnd', pattern: /}/y });
const tObjectStart = createTokenWMatches(
  'ObjectStart',
  /([\S]+)(?:[\t ]+(\S(?:(?![ \t]*[\n{]).)*))?\s*{/y,
  true
);
const tKV = createTokenWMatches(
  'KV',
  /(?:([^\s"]+)[\t ]+)?((?:(?!\s*(?:\/\/|\n)).)+)/y
);

const tokens = [tWhitespace, tObjectEnd, tObjectStart, tKV];

class RiftParser extends EmbeddedActionsParser {
  constructor() {
    super(tokens, { recoveryEnabled: true });
    this.performSelfAnalysis();
  }

  public parse = () => {
    return this.objValues();
  };

  private addValue(obj: any, k: string, v: any) {
    const index = getIndex(k);
    if (index && v[index]) k += '#' + v[index].replaceAll('"', '');
    let i = 0;
    while (true) {
      const k2 = i === 0 ? k : k + '#' + i;
      if (obj[k2] !== undefined) {
        i++;
        continue;
      }
      obj[k2] = v;
      break;
    }
  }

  private object = this.RULE('object', () => {
    const [key, alias] = this.CONSUME(tObjectStart).payload ?? [];
    const value = this.OR([
      {
        GATE: () => isArrayType(key),
        ALT: () => this.SUBRULE(this.arrValues),
      },
      { ALT: () => this.SUBRULE(this.objValues) },
    ]);
    this.CONSUME(tObjectEnd);
    if (alias) value.__alias__ = alias;
    return [key, value];
  });

  private objValues = this.RULE('objValues', () => {
    let obj: any = {};
    this.MANY(() => {
      const keyValue = this.OR([
        { ALT: () => this.SUBRULE(this.object) },
        { ALT: () => this.SUBRULE(this.kv) },
      ]);
      if (this.RECORDING_PHASE) return;
      let [k, v] = keyValue;
      this.addValue(obj, k, v);
    });
    return obj;
  });

  private arrValues = this.RULE('arrValues', () => {
    let arr: string[] & { __alias__?: string } = [];
    this.MANY(() => arr.push(this.CONSUME(tKV).image));
    return arr;
  });

  private kv = this.RULE('kv', () => {
    let kv = this.CONSUME(tKV).payload ?? [];
    return !kv[0] ? [kv[1], {}] : kv;
  });
}

const lexer = new Lexer(tokens);
const parser = new RiftParser();

class ParseError extends Error {
  constructor(public errors: any[]) {
    super('Error Parsing');
    this.message = 'Error Parsing: \n' + stringify(errors);
  }
}

export default function parse(string: string) {
  //remove comments
  string = string
    .split('\n')
    .map((l) => l.split('//')[0])
    .join('\n');

  const { tokens, errors } = lexer.tokenize(string.trim());
  if (errors.length) throw new ParseError(errors);

  parser.reset();
  parser.input = tokens;
  const result = parser.parse();
  if (parser.errors.length)
    throw new ParseError(
      parser.errors.map(
        (e) => `${e.message} at L${e.token.startLine}:${e.token.startColumn}`
      )
    );
  return result;
}

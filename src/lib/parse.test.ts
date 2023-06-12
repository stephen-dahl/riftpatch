import parse from './parse';
import { readFileSync } from 'fs';

test('parse plain object', () => {
  const text = `
    obj
    
    {
    
      key1 "value 1"
      
      key2 value 2
      
    }
  `;

  const result = parse(text);
  expect(result).toEqual({
    obj: { key1: '"value 1"', key2: 'value 2' },
  });
});

test('parse array', () => {
  const text = `
  TestArray
  
  {
  
    "value 1"
    
    value2
    
  }
  `;

  const result = parse(text);
  expect(result).toEqual({
    TestArray: ['"value 1"', 'value2'],
  });
});

test('parse named object', () => {
  const text = `
    TestNamed "name" {
    
      key1 "value 1"
      
      key2 value 2
      
    }
  `;

  const result = parse(text);
  expect(result).toEqual({
    TestNamed: { __alias__: '"name"', key1: '"value 1"', key2: 'value 2' },
  });
});

test('parse unquoted value', () => {
  const text = `
    Obj {
    
      key1 value1
      
      key2 value2
      
    }
  `;

  const result = parse(text);
  expect(result).toEqual({
    Obj: { key1: 'value1', key2: 'value2' },
  });
});

test('no value', () => {
  const text = `
  Obj {
  
    TestEmptyObject
    
    TestEmptyObject
    
  }
  `;

  const result = parse(text);
  expect(result).toEqual({
    Obj: { TestEmptyObject: {}, 'TestEmptyObject#1': {} },
  });
});

test('nested', () => {
  const text = `
  obj1 {
  
    obj2 {
    
      key "value"
      
      key2 value
      
    }
  }`;
  const result = parse(text);
  expect(result).toEqual({
    obj1: {
      obj2: { key: '"value"', key2: 'value' },
    },
  });
});

test('db', () => {
  const text = `
  obj {
  
    key int:"1"
    
  }
  `;
  const result = parse(text);
  expect(result).toEqual({
    obj: {
      key: 'int:"1"',
    },
  });
});

test('comment between Object name and {', () => {
  const text = `
  obj // hi
  {}
  `;
  const result = parse(text);
  expect(result).toEqual({
    obj: {},
  });
});

test('duplicate keys', () => {
  const text = `
  obj {
    key "value"
    key value2
    other "1"
    other 2
  }
  obj {
    foo "bar"
    foo "baz"
  }
  `;
  const result = parse(text);
  expect(result).toEqual({
    obj: {
      key: '"value"',
      'key#1': 'value2',
      other: '"1"',
      'other#1': '2',
    },
    'obj#1': {
      foo: '"bar"',
      'foo#1': '"baz"',
    },
  });
});

test('. in key', () => {
  const text = `
  obj.tile {
    key 1
  }
  `;
  const result = parse(text);
  expect(result).toEqual({
    'obj.tile': {
      key: '1',
    },
  });
});

test('anything in alias', () => {
  const text = `
  obj alias with all the Things!_9-    
     {}
  `;
  const result = parse(text);
  expect(result).toEqual({
    obj: { __alias__: 'alias with all the Things!_9-' },
  });
});

xtest('bug', () => {
  const text = readFileSync('test.txt').toString('utf8');
  const result = parse(text);
  expect(result).toMatchInlineSnapshot(`
    {
      "EntityBlueprint#"effects/enemies_arachnoid/boss_footstep"": {
        "ParticleDesc": {
          "name": ""rift/mech_footstep"",
        },
        "SoundDesc": {
          "name": ""enemies/arachnoid/boss_footstep"",
        },
        "__alias__": "effects/default",
        "name": ""effects/enemies_arachnoid/boss_footstep"",
      },
    }
  `);
});

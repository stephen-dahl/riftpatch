import toGame from './toGame';

test('simple object', () => {
  const data = {
    normal: {
      key1: '"value1"',
      key2: 'value2',
    },
  };
  const result = toGame(data);
  expect(result).toMatchInlineSnapshot(`
    "normal
    {
    	key1 "value1"
    	key2 value2
    }"
  `);
});

test('AutoIncrement', () => {
  const data = {
    'TestAutoIncrement#0': {
      key1: 'val1',
    },
    'TestAutoIncrement#1': {
      key2: 'val2',
    },
  };
  const result = toGame(data);
  expect(result).toMatchInlineSnapshot(`
    "TestAutoIncrement
    {
    	key1 val1
    }
    TestAutoIncrement
    {
    	key2 val2
    }"
  `);
});

test('TestIndexBy', () => {
  const data = {
    'TestIndexBy#thing1': {
      name: 'thing1',
    },
    'TestIndexBy#thing2': {
      name: 'thing2',
    },
  };
  const result = toGame(data);
  expect(result).toMatchInlineSnapshot(`
    "TestIndexBy
    {
    	name thing1
    }
    TestIndexBy
    {
    	name thing2
    }"
  `);
});

test('TestArray', () => {
  const data = {
    TestArray: ['"value 1"', 'value2'],
  };
  const result = toGame(data);
  expect(result).toMatchInlineSnapshot(`
    "TestArray
    {
    	"value 1"
    	value2
    }"
  `);
});

test('nested', () => {
  const data = {
    nested1: {
      key1: 'value',
      nested2: {
        nkey1: 'nvalue1',
      },
    },
  };
  const result = toGame(data);
  expect(result).toMatchInlineSnapshot(`
    "nested1
    {
    	key1 value
    	nested2
    	{
    		nkey1 nvalue1
    	}
    }"
  `);
});

test('Alias', () => {
  const data = {
    Obj: {
      __alias__: '"name"',
      key1: 'value1',
    },
  };
  const result = toGame(data);
  expect(result).toMatchInlineSnapshot(`
    "Obj "name"
    {
    	key1 value1
    }"
  `);
});

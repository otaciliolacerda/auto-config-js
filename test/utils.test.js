jest.mock('fs');
jest.mock('path');
jest.mock('js-yaml');

const path = require('path');
const yaml = require('js-yaml');

const {
  hasValue,
  getPropertyCaseInsensitive,
  setPropertyCaseInsensitive,
  overrideConfigValuesFromSystemVariables,
  mergeDeep,
  loadConfiguration,
} = require('../lib/utils');

it('hasValue', () => {
  expect(hasValue({})).toBeTruthy();
  expect(hasValue('')).toBeTruthy();
  expect(hasValue([])).toBeTruthy();
  expect(hasValue(0)).toBeTruthy();
  expect(hasValue(undefined)).toBeFalsy();
  expect(hasValue(null)).toBeFalsy();
});

it('getPropertyCaseInsensitive', () => {
  expect(getPropertyCaseInsensitive({}, 'hello')).toBeUndefined();
  expect(getPropertyCaseInsensitive({ hello: 1 }, 'test')).toBeUndefined();
  expect(
    getPropertyCaseInsensitive({ hello: 1 }, 'HelloWorld')
  ).toBeUndefined();
  expect(getPropertyCaseInsensitive({ hello: 1 }, 'hell')).toBeUndefined();

  expect(getPropertyCaseInsensitive({ test: 1 }, 'test')).toBe(1);
  expect(getPropertyCaseInsensitive({ test: 1 }, 'TEST')).toBe(1);
  expect(getPropertyCaseInsensitive({ test: 1 }, 'tEst')).toBe(1);

  expect(() =>
    getPropertyCaseInsensitive({ test: 1, Test: 2 }, 'test')
  ).toThrowError(/test/);
});

describe('setPropertyCaseInsensitive', () => {
  it('should fail if property does not exist', () => {
    expect(() => setPropertyCaseInsensitive({}, 'test', 'test')).toThrowError(
      /Error trying to set value {test} for non-existing property {test}/
    );
  });

  it('should fail for duplicated properties', () => {
    expect(() =>
      setPropertyCaseInsensitive({ test: 'mock', Test: 'mock' }, 'test', 'test')
    ).toThrowError(/Found duplicated {test} property/);
  });

  it('should fail if data types do not match', () => {
    expect(() =>
      setPropertyCaseInsensitive({ a: 1 }, 'a', 'true')
    ).toThrowError(/Number expected for property {a}, got {true}/);
    expect(() =>
      setPropertyCaseInsensitive({ a: false }, 'a', '1')
    ).toThrowError(/Value true\/false expected for property {a}, got {1}/);
  });

  it('should override numbers correctly', () => {
    const obj = { a: 1 };
    setPropertyCaseInsensitive(obj, 'a', '2');
    expect(obj.a).toBe(2);
    setPropertyCaseInsensitive(obj, 'a', '0');
    expect(obj.a).toBe(0);
    setPropertyCaseInsensitive(obj, 'a', '-1');
    expect(obj.a).toBe(-1);
    setPropertyCaseInsensitive(obj, 'a', '0.01');
    expect(obj.a).toBe(0.01);
    setPropertyCaseInsensitive(obj, 'a', '0.0');
    expect(obj.a).toBe(0);
    setPropertyCaseInsensitive(obj, 'a', '-0.1');
    expect(obj.a).toBe(-0.1);
    setPropertyCaseInsensitive(obj, 'a', '-0');
    expect(obj.a).toBe(-0);
  });

  it('should override booleans correctly', () => {
    const obj = { a: false };
    setPropertyCaseInsensitive(obj, 'a', 'true');
    expect(obj.a).toBeTruthy();
    setPropertyCaseInsensitive(obj, 'a', 'false');
    expect(obj.a).toBeFalsy();
  });
});

describe('overrideConfigValuesFromSystemVariables', () => {
  it('should read system variables by default', () => {
    process.env.MY_TEST = 'test';
    const config = { my: { test: 'mock' } };
    overrideConfigValuesFromSystemVariables(config);
    expect(config.my.test).toBe(process.env.MY_TEST);
  });

  it('should accept system varibale object map as optional parameter', () => {
    const systemVariables = { MY_TEST: 'test' };
    const config = { my: { test: 'mock' } };
    overrideConfigValuesFromSystemVariables(config, systemVariables);
    expect(config.my.test).toBe(systemVariables.MY_TEST);
  });

  it('should override first level properties', () => {
    const systemVariables = { SINGLE: 'single' };
    const config = { single: 'mock' };
    overrideConfigValuesFromSystemVariables(config, systemVariables);
    expect(config.single).toBe(systemVariables.SINGLE);
  });

  it('should override deep values', () => {
    const systemVariables = {
      COMPOSE_VAR: 'composeVar',
      LONGER_TEST_VAR: 'longerTestVar',
    };

    const config = {
      compose: { var: 'mock' },
      longer: { test: { var: 'mock' } },
    };

    overrideConfigValuesFromSystemVariables(config, systemVariables);

    expect(config.compose.var).toBe(systemVariables.COMPOSE_VAR);
    expect(config.longer.test.var).toBe(systemVariables.LONGER_TEST_VAR);
  });

  it('should not override invalid system variable names', () => {
    const systemVariables = {
      TEST: 'test',
      COM_POSE_VAR: 'composeVar',
      LONGER_TESTVAR: 'longerTestVar',
    };

    const config = {
      test: 'mock',
      compose: { var: 'mock' },
      longer: { test: { var: 'mock' } },
    };

    overrideConfigValuesFromSystemVariables(config, systemVariables);

    expect(config.test).toBe('test');
    expect(config.compose.var).toBe('mock');
    expect(config.longer.test.var).toBe('mock');
  });

  it('should override kebap-case properties', () => {
    const systemVariables = {
      'SINGLE-TEST': 'single-test',
      'TEST_SINGLE-TEST': 'testSingle-Test',
    };
    const config = {
      'single-test': 'mock',
      test: { 'single-test': 'single-test' },
    };

    overrideConfigValuesFromSystemVariables(config, systemVariables);

    expect(config['single-test']).toBe(systemVariables['SINGLE-TEST']);
    expect(config.test['single-test']).toBe(
      systemVariables['TEST_SINGLE-TEST']
    );
  });
});

describe('mergeDeep', () => {
  it('should merge empty objects', () => {
    expect(mergeDeep({}, {})).toEqual({});
  });

  it('should create non existing properties in the targe object', () => {
    expect(mergeDeep({}, { test: 1 })).toEqual({ test: 1 });
  });

  it('should not remove any existing properties from target object', () => {
    expect(mergeDeep({ test: 1 }, {})).toEqual({ test: 1 });
  });

  it('should override target property', () => {
    expect(mergeDeep({ test: 1 }, { test: 'test' })).toEqual({ test: 'test' });
  });

  it('should override nested objects correctly', () => {
    const target = { a: 1, b: { c: 'c', d: { e: 'e', f: 'f' } } };
    const source = { b: { c: 'cTest', d: { e: 'eTest' } } };
    expect(mergeDeep(target, source)).toEqual({
      a: 1,
      b: { c: 'cTest', d: { e: 'eTest', f: 'f' } },
    });
  });
});

describe('loadConfiguration', () => {
  it('should fail if include tag is invalid', () => {
    yaml.safeLoad = jest.fn(() => ({ include: 1 }));
    expect(() => loadConfiguration('mockPath', 'mockProfile')).toThrowError(
      /Include field must be an array in profile: mockProfile!/
    );

    yaml.safeLoad = jest.fn(() => ({ include: 'test' }));
    expect(() => loadConfiguration('mockPath', 'mockProfile')).toThrowError(
      /Include field must be an array in profile: mockProfile!/
    );

    yaml.safeLoad = jest.fn(() => ({ include: {} }));
    expect(() => loadConfiguration('mockPath', 'mockProfile')).toThrowError(
      /Include field must be an array in profile: mockProfile!/
    );
  });

  it('should load config with no includes', () => {
    yaml.safeLoad = jest.fn(() => ({ myApp: 'mock' }));
    expect(loadConfiguration('mockPath', 'mockProfile')).toEqual({
      myApp: 'mock',
    });
  });

  it('should load config with single include', () => {
    yaml.safeLoad = jest
      .fn()
      .mockImplementationOnce(() => ({
        myApp: 'mock',
        include: ['subProfile'],
      }))
      .mockImplementationOnce(() => ({ test: 1 }));

    expect(loadConfiguration('mockPath', 'mockProfile')).toEqual({
      myApp: 'mock',
      test: 1,
      include: ['subProfile'],
    });
  });

  it('should load config with multiple includes', () => {
    yaml.safeLoad = jest
      .fn()
      .mockImplementationOnce(() => ({
        myApp: 'mock',
        include: ['subProfile', 'subProfile2'],
      }))
      .mockImplementationOnce(() => ({ test: 1 }))
      .mockImplementationOnce(() => ({ mock: 2 }));

    expect(loadConfiguration('mockPath', 'mockProfile')).toEqual({
      myApp: 'mock',
      test: 1,
      mock: 2,
      include: ['subProfile', 'subProfile2'],
    });
  });

  it('should load config with nested includes', () => {
    yaml.safeLoad = jest
      .fn()
      .mockImplementationOnce(() => ({
        myApp: 'mock',
        include: ['subProfile'],
      }))
      .mockImplementationOnce(() => ({ test: 1, include: ['subProfile2'] }))
      .mockImplementationOnce(() => ({ mock: 2 }));

    expect(loadConfiguration('mockPath', 'mockProfile')).toEqual({
      myApp: 'mock',
      test: 1,
      mock: 2,
      include: ['subProfile'],
    });
  });

  it('should load respect merge priority', () => {
    yaml.safeLoad = jest
      .fn()
      .mockImplementationOnce(() => ({
        myApp: 'root',
        include: ['subProfile', 'subProfile3'],
      }))
      .mockImplementationOnce(() => ({
        myApp: 'subProfile3',
        test: 'subProfile3',
        include: ['subProfile4', 'subProfile5'],
      }))
      .mockImplementationOnce(() => ({
        myApp: 'subProfile5',
      }))
      .mockImplementationOnce(() => ({
        myApp: 'subProfile4',
      }))
      .mockImplementationOnce(() => ({
        myApp: 'subProfile',
        test: 'test',
        include: ['subProfile2'],
      }))
      .mockImplementationOnce(() => ({ myApp: 'subProfile2' }));

    const mockPath = 'mockPath';
    expect(loadConfiguration(mockPath, 'mockProfile')).toEqual({
      myApp: 'root',
      test: 'subProfile3',
      include: expect.anything(),
    });

    expect(path.join).toHaveBeenNthCalledWith(
      1,
      mockPath,
      'app.mockProfile.config.yaml'
    );
    expect(path.join).toHaveBeenNthCalledWith(
      2,
      mockPath,
      'app.subProfile3.config.yaml'
    );
    expect(path.join).toHaveBeenNthCalledWith(
      3,
      mockPath,
      'app.subProfile5.config.yaml'
    );
    expect(path.join).toHaveBeenNthCalledWith(
      4,
      mockPath,
      'app.subProfile4.config.yaml'
    );
    expect(path.join).toHaveBeenNthCalledWith(
      5,
      mockPath,
      'app.subProfile.config.yaml'
    );
    expect(path.join).toHaveBeenNthCalledWith(
      6,
      mockPath,
      'app.subProfile2.config.yaml'
    );
  });
});

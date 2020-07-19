const {
  hasValue,
  getPropertyCaseInsensitive,
  overrideConfigValuesFromSystemVariables,
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

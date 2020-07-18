const { hasValue, getPropertyCaseInsensitive } = require('../lib/utils');

describe('test utils', () => {
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
});

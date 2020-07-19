const autoConfig = require('../lib/autoConfig');

describe('test init', () => {
  it('should throw error if profile is not defined', () => {
    delete process.env.NODE_ENV;
    expect(() => autoConfig.init()).toThrowError(
      /No profile was given: set NODE_ENV or pass it as a parameter/
    );
    process.env.NODE_ENV = 'test';
  });
});

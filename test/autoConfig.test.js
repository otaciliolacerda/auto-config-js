import utils from '../lib/utils';

jest.mock('../lib/utils', () => ({
  loadConfiguration: jest.fn(() => ({
    include: [],
  })),
  overrideConfigValuesFromSystemVariables: jest.fn(),
}));

describe('test autoConfig', () => {
  let autoConfig;

  beforeEach(() => {
    jest.isolateModules(() => {
      autoConfig = require('../lib/autoConfig');
    });
  });

  it('should throw error if profile is not defined', () => {
    delete process.env.NODE_ENV;
    expect(() => autoConfig.init()).toThrowError(
      /No profile was given: set NODE_ENV or pass it as a parameter/
    );
    process.env.NODE_ENV = 'test';
  });

  it('should warn if init is called more than once', () => {
    const spy = jest.spyOn(console, 'warn');
    spy.mockImplementation(() => undefined);

    autoConfig.init();
    autoConfig.init();

    expect(console.warn).toHaveBeenCalledWith(
      'Config will be re-initialized: autoConfig.init was called again'
    );
    spy.mockRestore();
  });

  it('should not contain keyword [include] in the config object', () => {
    autoConfig.init();
    expect(autoConfig.getConfig().include).toBeUndefined();
  });

  it('should configure profile using optional object parameter', () => {
    autoConfig.init({ profile: 'mockProfile' });
    expect(utils.loadConfiguration).toHaveBeenCalledWith(
      expect.anything(),
      'mockProfile'
    );
  });

  it('should configure config directory using option object parameter', () => {
    autoConfig.init({ profile: 'mockProfile', configDirectory: '/mock/test' });
    expect(utils.loadConfiguration).toHaveBeenCalledWith(
      '/mock/test',
      'mockProfile'
    );
  });

  it('should be able to get the configuration files', () => {
    const mockConfig = {
      test: 1,
      mock: 'mock',
    };
    utils.loadConfiguration.mockImplementationOnce(() => mockConfig);
    expect(autoConfig.getConfig()).toBeUndefined();
    autoConfig.init();
    expect(autoConfig.getConfig()).toEqual(mockConfig);
  });

  it('should work with default params', () => {
    autoConfig.init();
    expect(utils.loadConfiguration).toHaveBeenCalledWith(
      process.cwd(),
      process.env.NODE_ENV
    );
  });
});

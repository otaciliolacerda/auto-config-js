import {
  loadConfiguration,
  overrideConfigValuesFromSystemVariables,
} from './utils';

// Global config
let config;

export function init({
  profile = process.env.NODE_ENV,
  configDirectory = process.cwd(),
} = {}) {
  if (!profile) {
    throw new Error(
      'No profile was given: set NODE_ENV or pass it as a parameter'
    );
  }

  if (config) {
    console.warn(
      'Config will be re-initialized: autoConfig.init was called again'
    );
  }

  config = loadConfiguration(configDirectory, profile);
  overrideConfigValuesFromSystemVariables(config);
  delete config.include;
}

export function getConfig() {
  return config;
}

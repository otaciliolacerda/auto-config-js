import type { ConfigObject, InitOptions } from './types.js';
import {
  loadConfiguration,
  overrideConfigValuesFromSystemVariables,
} from './utils.js';

let config: ConfigObject | undefined;

export function init({
  profile = process.env.NODE_ENV,
  configDirectory = process.cwd(),
}: InitOptions = {}): void {
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

export function getConfig<T extends ConfigObject = ConfigObject>(): T {
  if (!config) {
    throw new Error('Config not initialized: call autoConfig.init() first');
  }
  return config as T;
}

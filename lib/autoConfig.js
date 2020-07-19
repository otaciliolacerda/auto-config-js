const {
  loadConfiguration,
  overrideConfigValuesFromSystemVariables,
} = require('./utils');

// Global config
let config;

function init({
  profile = process.env.NODE_ENV,
  configDirectory = process.cwd(),
}) {
  if (!profile) throw new Error('NODE_ENV not set.');

  if (config) {
    console.warn(
      'Config will be re-initialized: autoConfig.init was called again.'
    );
  }

  config = loadConfiguration(configDirectory, profile);
  overrideConfigValuesFromSystemVariables(config);
  delete config.include;
}

module.exports = { init, getConfig: () => config };

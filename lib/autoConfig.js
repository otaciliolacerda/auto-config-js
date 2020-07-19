const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const {
  isObject,
  overrideConfigValuesFromSystemVariables,
} = require('./utils');

// Global config
let config;

/**
 * Do a deep merge of two objects. This function will lead to infinite recursion on circular references
 * @param target
 * @param source
 */
function mergeDeep(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

/**
 * Load a configuration file recursively. The nested config overrides the previous.
 * This function will lead to infinite recursion on circular references
 * @param confObj
 */
function loadConfig(confObj, filePath, configDirectory) {
  let resultConfig = {};
  if (confObj.include) {
    if (Array.isArray(confObj))
      throw new Error(`${filePath}: include field must be an array!`);

    confObj.include.forEach(confName => {
      const subPath = path.join(configDirectory, `app.${confName}.config.yaml`);
      const includeConf = yaml.safeLoad(fs.readFileSync(subPath, 'utf8'));
      resultConfig = mergeDeep(
        resultConfig,
        loadConfig(includeConf, subPath, configDirectory)
      );
    });
  }
  return mergeDeep(resultConfig, confObj);
}

function init({ profile = process.env.NODE_ENV, configDirectory = './' }) {
  if (!profile) throw new Error('NODE_ENV not set.');

  if (config) {
    console.warn(
      'autoConfig.init was called again. Config will be re-initialized.'
    );
  }

  try {
    // Load config
    const filePath = path.join(configDirectory, `app.${profile}.config.yaml`);

    const confObj = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
    config = loadConfig(confObj, filePath, configDirectory);

    overrideConfigValuesFromSystemVariables(config);
    delete config.include;
  } catch (e) {
    throw new Error(`Auto configuration failed. ${e}`);
  }
}

module.exports = { init, getConfig: () => config };

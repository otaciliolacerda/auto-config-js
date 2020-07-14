const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Check if the reference value is defined and has a value
 * @param obj
 * @returns {boolean|boolean}
 */
function hasValue(obj) {
  return obj !== null && obj !== undefined;
}

/**
 * Get the property from a object ignoring case
 * E.g.: obj.getProperty('HeLo') === obj.getProperty('hElO')
 */
function getProperty(object, key) {
  return object[
    Object.keys(object).find(k => k.toLowerCase() === key.toLowerCase())
  ];
}

/**
 * Set the value for an EXISTING property. It finds the property ignoring the case. If the following operations
 * run in sequence the second will override the value of the first:
 * obj.setProperty('HeLo', 'hi')
 * obj.setProperty('hElO', 'hello')
 *
 * It also casts the new value to have the same data type. If cast fails the operation also fails
 */
function setProperty(object, key, systemVariable) {
  const objectKey = Object.keys(object).find(
    k => k.toLowerCase() === key.toLowerCase()
  );
  const value = process.env[systemVariable];
  // const castedValue = cast(object[objectKey], value);

  switch (typeof object[objectKey]) {
    case 'boolean':
      if (value.toLowerCase() !== 'true' && value.toLowerCase() !== 'false') {
        throw new Error(
          `${systemVariable} contains invalid data. true/false expected.`
        );
      }
      // eslint-disable-next-line no-param-reassign
      object[objectKey] = value.toLowerCase() === 'true';
      break;
    case 'number':
      if (!Number(value)) {
        throw new Error(
          `${systemVariable} contains invalid data. Number expected.`
        );
      }
      // eslint-disable-next-line no-param-reassign
      object[objectKey] = Number(value);
      break;
    default:
      // eslint-disable-next-line no-param-reassign
      object[objectKey] = value;
  }
}

// Configuration object shared in the whole application
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
 * Receives a list of tokens and try to find a property that need to be updated (if it exists in the config).
 * This operation returns the object that will receive the update. For example:
 *
 * System variable: MY_CUSTOM_SYS_VAR
 * Tokens:  [my, custom, sys, var]
 *
 * Return the object if config contains any of the following (match for the system var):
 * my.custom.sys.var
 * my.custom.sysVar
 * my.customSysVar
 * myCustomSysVar
 *
 * The following are not valid:
 * myCustom.sys.var
 *
 * Only the ending can have camel case names
 *
 * @return {node: *, key: *} the node (object) that will be updated
 */
function findPropertyToBeOverride(configObj, tokens) {
  const [current, next] = tokens;

  // Cases
  // The root path is already the sysvar name
  if (hasValue(getProperty(configObj, tokens.join('')))) {
    return { node: configObj, key: tokens.join('') };
  }

  // End of the path, the property is there and there is no one else to check
  if (hasValue(getProperty(configObj, current)) && !hasValue(next)) {
    return { node: configObj, key: current };
  }

  // Start/middle of the path. Has the property and the next, keep calling
  if (
    hasValue(getProperty(configObj, current)) &&
    hasValue(getProperty(getProperty(configObj, current), next))
  ) {
    const [, ...rest] = tokens;
    return findPropertyToBeOverride(getProperty(configObj, current), rest);
  }

  // Find the property in this level but not in the next
  // Then try by concatenating the remaining tokens and comparing
  // if it is the next
  // Covers: cookie.maxAge <-> COOKIE_MAX_AGE
  if (
    hasValue(getProperty(configObj, current)) &&
    !hasValue(getProperty(getProperty(configObj, current), next))
  ) {
    const [, ...rest] = tokens;
    if (hasValue(getProperty(configObj, rest.join('')))) {
      return { node: configObj, key: tokens.join('') };
    }
    return undefined;
  }
  // If does not fit any of the previous
  return undefined;
}

/**
 * This function reads the system variables and try to match the sysvar with some local property. For example,
 * we can have the sysvar PLEASE_DO.NOT_HATE_ME. This can resolve to please.do.not.hateMe or please.doNotHateMe.
 * To do this the function breaks the sysvar in tokens and try to find the combination groups. It only updates existing
 * properties. No new properties are created. The grouping match is only valid to the suffixes, for example, the first
 * is valid but the second is not:
 * please.do.not.hateMe
 * pleaseDoNot.hate.me
 */
function overrideConfigValuesFromSystemVariables(configObj) {
  Object.keys(process.env).forEach(systemVariable => {
    const tokens = systemVariable.toLowerCase().split('_');

    const result = findPropertyToBeOverride(configObj, tokens);
    if (result && result.node && result.key) {
      setProperty(result.node, result.key, systemVariable);
    }
  });
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
    console.log(filePath);
    const confObj = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
    config = loadConfig(confObj, filePath, configDirectory);

    overrideConfigValuesFromSystemVariables(config);
    delete config.include;
  } catch (e) {
    throw new Error(`Auto configuration failed. ${e}`);
  }
}

module.exports = { init, getConfig: () => config };

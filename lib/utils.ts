import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { ConfigObject } from './types.js';

function isObject(item: unknown): item is ConfigObject {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

function hasValue<T>(obj: T): obj is NonNullable<T> {
  return obj !== null && obj !== undefined;
}

function getPropertyNameCaseInsensitive(
  object: ConfigObject,
  property: string
): string | undefined {
  const objKeys = Object.keys(object).filter(
    k => k.toLowerCase() === property.toLowerCase()
  );
  if (objKeys.length > 1) {
    throw new Error(`Found duplicated {${property}} property`);
  }
  return objKeys[0];
}

function getPropertyCaseInsensitive(
  object: ConfigObject,
  property: string
): unknown {
  return object[getPropertyNameCaseInsensitive(object, property) as string];
}

function setPropertyCaseInsensitive(
  object: ConfigObject,
  property: string,
  value: string
): void {
  const propName = getPropertyNameCaseInsensitive(object, property);

  if (!propName) {
    throw new Error(
      `Error trying to set value {${value}} for non-existing property {${property}}`
    );
  }

  switch (typeof object[propName]) {
    case 'boolean':
      if (value.toLowerCase() !== 'true' && value.toLowerCase() !== 'false') {
        throw new Error(
          `Value true/false expected for property {${propName}}, got {${value}}`
        );
      }
      object[propName] = value.toLowerCase() === 'true';
      break;
    case 'number':
      if (Number.isNaN(Number(value))) {
        throw new Error(
          `Number expected for property {${propName}}, got {${value}}`
        );
      }
      object[propName] = Number(value);
      break;
    default:
      object[propName] = value;
  }
}

function overrideConfigValuesFromSystemVariables(
  configObj: ConfigObject,
  systemVariables: NodeJS.ProcessEnv = process.env
): void {
  Object.keys(systemVariables).forEach(sysVar => {
    const tokens = sysVar.toLowerCase().split('_');
    let currentObj: ConfigObject;
    let currentProp: string;
    let currentPropValue: unknown = configObj;

    do {
      currentObj = currentPropValue as ConfigObject;
      currentProp = tokens.shift() as string;
      currentPropValue = getPropertyCaseInsensitive(currentObj, currentProp);
    } while (tokens.length && isObject(currentPropValue));

    if (currentObj! && currentProp! && currentObj[currentProp]) {
      setPropertyCaseInsensitive(
        currentObj,
        currentProp,
        systemVariables[sysVar] as string
      );
    }
  });
}

// This function will lead to infinite recursion on circular references
function mergeDeep(target: ConfigObject, source: ConfigObject): ConfigObject {
  const output: ConfigObject = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(
            target[key] as ConfigObject,
            source[key] as ConfigObject
          );
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function loadYamlFile(configDirectory: string, profile: string): ConfigObject {
  const filePath = path.join(configDirectory, `app.${profile}.config.yaml`);
  return yaml.load(fs.readFileSync(filePath, 'utf8')) as ConfigObject;
}

// This function will lead to an infinite loop on circular references
function loadConfiguration(
  configDirectory: string,
  profile: string
): ConfigObject {
  const toLoadStack = [profile];
  const toProcessStack: ConfigObject[] = [];

  while (toLoadStack.length) {
    const currentProfile = toLoadStack.shift() as string;
    const currentConfig = loadYamlFile(configDirectory, currentProfile);
    toProcessStack.unshift(currentConfig);

    if (currentConfig.include) {
      if (!Array.isArray(currentConfig.include)) {
        throw new Error(
          `Include field must be an array in profile: ${profile}!`
        );
      }
      toLoadStack.unshift(
        ...(currentConfig.include as string[]).slice().reverse()
      );
    }
  }
  return toProcessStack.reduce((acc, current) => mergeDeep(acc, current));
}

export {
  isObject,
  hasValue,
  getPropertyCaseInsensitive,
  setPropertyCaseInsensitive,
  overrideConfigValuesFromSystemVariables,
  mergeDeep,
  loadYamlFile,
  loadConfiguration,
};

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function hasValue(obj) {
  return obj !== null && obj !== undefined;
}

function getPropertyCaseInsensitive(object, key) {
  const objKeys = Object.keys(object).filter(
    k => k.toLowerCase() === key.toLowerCase()
  );
  if (objKeys.length > 1) {
    throw new Error(`Duplicated property found: ${key}`);
  }
  return isObject(object[objKeys[0]]) ? object[objKeys[0]] : undefined;
}

/**
 * Set the value for an EXISTING property. It finds the property ignoring the case. If the following operations
 * run in sequence the second will override the value of the first:
 * obj.setProperty('HeLo', 'hi')
 * obj.setProperty('hElO', 'hello')
 *
 * It also casts the new value to have the same data type. If cast fails the operation also fails
 */
function setPropertyCaseInsensitive(object, key, systemVariable) {
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

function overrideConfigValuesFromSystemVariables(
  configObj,
  systemVariables = Object.keys(process.env)
) {
  systemVariables.forEach(sysVar => {
    let tokens = sysVar.toLowerCase().split('_');

    let currentObj = configObj;
    let currentProp = tokens.shift();
    while (tokens.length) {
      const propValue = getPropertyCaseInsensitive(currentObj, currentProp);
      if (propValue) {
        currentObj = propValue;
        currentProp = tokens.shift();
      } else {
        tokens = [];
      }
    }
    if (currentObj && currentProp && currentObj[currentProp]) {
      setPropertyCaseInsensitive(currentObj, currentProp, sysVar);
    }
  });
}

module.exports = {
  isObject,
  hasValue,
  getPropertyCaseInsensitive,
  setPropertyCaseInsensitive,
  overrideConfigValuesFromSystemVariables,
};

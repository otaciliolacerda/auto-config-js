function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function hasValue(obj) {
  return obj !== null && obj !== undefined;
}

function getPropertyNameCaseInsensitive(object, property) {
  const objKeys = Object.keys(object).filter(
    k => k.toLowerCase() === property.toLowerCase()
  );
  if (objKeys.length > 1) {
    throw new Error(`Found duplicated {${property}} property`);
  }
  return objKeys[0];
}

function getPropertyCaseInsensitive(object, property) {
  return object[getPropertyNameCaseInsensitive(object, property)];
}

/**
 * Set the value for an EXISTING property (case-insensitive). Throw error if:
 * - Property does not exist in the object
 * - System Variable value cannot be casted to the current property data type
 * - If duplicated properties are found
 */
function setPropertyCaseInsensitive(object, property, value) {
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
      // eslint-disable-next-line no-param-reassign
      object[propName] = value.toLowerCase() === 'true';
      break;
    case 'number':
      if (Number.isNaN(Number(value))) {
        throw new Error(
          `Number expected for property {${propName}}, got {${value}}`
        );
      }
      // eslint-disable-next-line no-param-reassign
      object[propName] = Number(value);
      break;
    default:
      // eslint-disable-next-line no-param-reassign
      object[propName] = value;
  }
}

function overrideConfigValuesFromSystemVariables(
  configObj,
  systemVariables = process.env
) {
  Object.keys(systemVariables).forEach(sysVar => {
    let tokens = sysVar.toLowerCase().split('_');
    let currentObj, currentProp;
    let currentPropValue = configObj;

    do {
      currentObj = currentPropValue;
      currentProp = tokens.shift();
      currentPropValue = getPropertyCaseInsensitive(currentObj, currentProp);
    } while (tokens.length && isObject(currentPropValue));

    if (currentObj && currentProp && currentObj[currentProp]) {
      setPropertyCaseInsensitive(
        currentObj,
        currentProp,
        systemVariables[sysVar]
      );
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

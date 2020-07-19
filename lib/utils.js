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
    throw new Error(`Duplicated property found: ${property}`);
  }
  return objKeys[0];
}

function getPropertyCaseInsensitive(object, property) {
  return object[getPropertyNameCaseInsensitive(object, property)];
}

/**
 * Set the value for an EXISTING property. It finds the property ignoring the case. If the following operations
 * run in sequence the second will override the value of the first:
 * obj.setProperty('HeLo', 'hi')
 * obj.setProperty('hElO', 'hello')
 *
 * It also casts the new value to have the same data type. If cast fails the operation also fails
 */
function setPropertyCaseInsensitive(object, property, value) {
  const propName = getPropertyNameCaseInsensitive(object, property);

  switch (typeof object[propName]) {
    case 'boolean':
      if (value.toLowerCase() !== 'true' && value.toLowerCase() !== 'false') {
        throw new Error(
          `true/false value expected for property {${propName}}, got {${value}}`
        );
      }
      // eslint-disable-next-line no-param-reassign
      object[propName] = value.toLowerCase() === 'true';
      break;
    case 'number':
      if (!Number(value)) {
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

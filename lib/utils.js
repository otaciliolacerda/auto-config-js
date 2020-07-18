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
 * Get the property from a object ignoring case.
 * E.g.: obj.getProperty('HeLo') === obj.getProperty('hElO')
 */
function getPropertyCaseInsensitive(object, key) {
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

module.exports = {
  isObject,
  hasValue,
  getPropertyCaseInsensitive,
  setPropertyCaseInsensitive,
};

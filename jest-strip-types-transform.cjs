const { stripTypeScriptTypes } = require('node:module');

module.exports = {
  process(src) {
    return { code: stripTypeScriptTypes(src) };
  },
};

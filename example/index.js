const autoConfig = require('../lib/autoConfig');

autoConfig.init({
  profile: 'dev',
  configDirectory: './example/config/',
});

console.log(autoConfig.getConfig());

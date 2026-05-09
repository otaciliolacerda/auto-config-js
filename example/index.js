import { init, getConfig } from 'auto-config-js';

init({
  profile: 'dev',
  configDirectory: './config/',
});

console.log(getConfig());

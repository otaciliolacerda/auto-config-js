import autoConfig from "auto-config-js";

autoConfig.init({
  profile: 'dev',
  configDirectory: './config/',
});

console.log(autoConfig.getConfig());

import { init, getConfig, type ConfigObject } from 'auto-config-js';

interface AppConfig extends ConfigObject {
  application: string;
  credentials: {
    directory: string;
  };
  session: {
    cookie: {
      maxAge: number;
      secure: boolean;
    };
    secret: string;
  };
}

init({
  profile: 'dev',
  configDirectory: './config/',
});

const config = getConfig<AppConfig>();

console.log(config);
console.log(config.application);
console.log(config.session.cookie.maxAge);

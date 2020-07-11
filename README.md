# auto-config-js

[![](https://img.shields.io/badge/Github%20Discussions%20%26%20Support-Chat%20now!-blue)](https://github.com/otaciliolacerda/auto-config-js/discussions)
[![](https://img.shields.io/badge/Licence-MIT-green.svg)](https://github.com/otaciliolacerda/auto-config-js/blob/master/LICENSE)

Hierarchical NodeJS configuration with Yaml files, environment variables and config merging. Much of this library was inspired on [SpringBoot Environment API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/core/env/Environment.html).

## Install
```bash
# with npm
yarn add auto-config-js

# or with npm
npm install auto-config-js
```

## Usage

As early as possible in your application, require and configure `auto-config-js`.

```javascript
const config = require('auto-config-js').autoConfig()
```

Create a `environmentName.yaml` file in the current directory of your project. Add environment-specific variables on new lines in the form of ``. For example:

```yaml
application: 'my-app'
database: 
  host: 127.0.0.1
  port: 8080
```

Now the `config` constant contains the configuration you defined in your `environmentName.yaml` file.
```javascript
const myAppName = config.application;
const db = require('db');
db.connect({
  host: config.database.host,
  port: config.database.port,
})
```

## Contributing Guide

See [CONTRIBUTING.md](CONTRIBUTING.md)

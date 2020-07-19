# auto-config-js

[![](https://github.com/otaciliolacerda/auto-config-js/workflows/auto-config-js%20tests/badge.svg?branch=master)](https://github.com/otaciliolacerda/auto-config-js/actions?query=workflow%3A%22auto-config-js+tests%22)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![](https://img.shields.io/badge/Licence-MIT-green.svg)](https://github.com/otaciliolacerda/auto-config-js/blob/master/LICENSE)

Hierarchical NodeJS configuration with Yaml files, environment variables and config merging. Much of this library was inspired on [SpringBoot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-external-config).

Usually the configuration files are used externalize default configuration values that can be overridden by system environment variables. Storing configuration in the environment separate from code is based on [The Twelve-Factor App](https://12factor.net/config) methodology.

This lib has a single dependency: [js-yaml](https://github.com/nodeca/js-yaml)

## Quick Features
* Hierarchical configuration
* Configuration tree is available as a javascript object
* Relaxed binding of System Variables

## Install

With yarn:
```bash
yarn add auto-config-js
```

With npm: 
```bash 
npm install auto-config-js
```

## Usage

Create a YAML file named `app.config.yaml` in your application current directory:
```yaml
application: 'my-app'
database: 
  host: 127.0.0.1
  port: 8080
```

As early as possible in your application, require and configure `auto-config-js`.
```javascript
const config = require('auto-config-js').init()
```

The `autoConfig` will read the YAML file. from the current directory and load the configuration in a javascript object. Now the `config` constant contains the configuration you defined in your YAML file.

```javascript
const myAppName = config.application;
const db = require('db');
db.connect({
  host: config.database.host,
  port: config.database.port,
})
```

## Configuration file

#### Content Format

The file content format must be a valid [YAML](https://yaml.org/) format. 

YAML is a superset of JSON and, as such, is a convenient format for specifying hierarchical configuration data in a more human-readable way.

⚠️ Note that the use of `kebap-case` is supported but it requires the use of [bracket notation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_Accessors) when using the [configuration object](#access-to-the-configuration). Example:
```javascript
config["my-app-name"]
```

⚠️ Although Javascript and YAML are case sensitive and accept properties with same name but different case in the same object (e.g. `variable`/`VARiable`, this lib will through an error in such cases. This constraint has the goal to improve the configuration readability and to make it possible the override of such properties by system variables.

#### Name Convention

Each configuration file in `auto-config-js` is called a profile configuration. Because of that, configuration files are named using the following convention:
```
app-<PROFILE>.config.yaml
```

The `<PROFILE>` placeholder uses by default the `NODE_ENV` value. It can be overridden by passing the optional configuration parameter to the `autoConfig` function (check [API](#api)).

If no profile specific file is found, `auto-config-js` will do a last attempt and try to load `app.config.yaml`.

Profiles can be defined hierarchically using the `include` keyword. The include keyword expects an array of profiles names (strings) to be included. The configuration load each file and merge if the current configuration. Example:
```yaml
include: ['base', 'staging']

application: 'my-app'
database: 
  host: 127.0.0.1
  port: 8080
```

This configuration will merge the base and staging profiles (profiles on the right override the profiles on the left), then merge the result with this defined profile to build the configuration object. As a last step the auto configuration reads the system variables looking for values to be overridden.

#### Location

`auto-config-js` by default tries to load the configuration files from:
1. From `${configDir}/` directory (check [API](#api))
1. A `/config` sub-directory of the current directory
1. The current directory

The list is ordered by precedence (properties defined in locations higher in the list override those defined in lower locations).


#### Type conversion

The type conversion is controlled by [js-yaml](https://github.com/nodeca/js-yaml). This lib uses the `safeLoad` function with the default schema (all supported YAML types, without unsafe ones). 

If necessary a few internals can be exposed in the future for further configuration and JSON support.

## Access to the configuration

The configuration will be available to the application as a javascript object, having the same hierarchical structure defined in the YAML file. This means the following configuration:

```yaml
oauth2.client.id: myUser
session:
  cookie:
    maxAge: 86400000
    secure: true
```

Can be access like:

```yaml
config.oauth2.client.id
session.cookie.maxAge
session.cookie.secure
```

## Relaxed Binding

Most operating systems impose strict rules around the names that can be used for environment variables. For example, Linux shell variables can contain only letters (`a` to `z` or `A` to `Z`), numbers (`0` to `9`) or the underscore character (`_`). By convention, Unix shell variables will also have their names in UPPERCASE.

auto-config-js relaxed binding rules are, as much as possible, designed to be compatible with these naming restrictions.

To convert a property name in the canonical-form to an environment variable name you can follow these rules:

* Replace dots (`.`) with underscores (`_`).
* Remove any dashes (`-`).
* Convert to uppercase.

For example, we could bind the following properties with the environment variables:

Property | Environment variable
------------ | -------------
`oauth.client-id` | `OAUTH_CLIENTID`
`oauth.clientId` | `OAUTH_CLIENTID`

> ⚠️️ Underscores cannot be used to replace the dashes in property names. If you attempt to use `OAUTH_CLIENT_ID` with the example above, no value will be bound.

## API

## init

```javascript
autoConfig.init({
  profile,
  configDirectory, 
});
```

#### Parameters
- `profile: String`
  - Optional
  - Name of the profile to be loaded
  - Default to the value found in `NODE_ENV`
- `configDirectory: String`
  - Optional
  - The relative or absolute path to the directory where the configuration files are located.
  - Read [Location](#location) for default behaviour

#### Return
- Nothing

#### Example:
```javascript
const autoConfig = require('auto-config-js');
autoConfig.init({
  profile: 'development',
  configDirectory: './config/'
});
```

## getConfig

```javascript
autoConfig.init({
  profile,
  configDirectory, 
});
```

#### Parameters
- None

#### Return
- Config as a javascript object

#### Example:
```javascript
const autoConfig = require('auto-config-js');
autoConfig.init({
  profile: 'development',
  configDirectory: './config/'
});
const config = autoConfig.getConfig()
```

## Contributing Guide

See [CONTRIBUTING.md](CONTRIBUTING.md)

<!-- Force -->
![Node version](https://img.shields.io/node/v/config-yaml.svg)
![Version](https://img.shields.io/npm/v/config-yaml.svg)
[![Build status](https://travis-ci.org/neolao/config-yaml.svg)](https://travis-ci.org/neolao/config-yaml)
[![dependencies Status](https://david-dm.org/neolao/config-yaml/status.svg)](https://david-dm.org/neolao/config-yaml)
[![devDependencies Status](https://david-dm.org/neolao/config-yaml/dev-status.svg)](https://david-dm.org/neolao/config-yaml?type=dev)

config-yaml
===========

YAML configuration for NodeJS


Basic example
-------------

`config/default.yml`:

```yaml
foo: "bar"
list:
    - 1
    - 2
    - 3
```

```javascript
import configYaml from "config-yaml";

const config = configYaml(`${__dirname}/config/default.yml`);

console.log(config.foo); // "bar"
console.log(config.list[1]); // 2
```

Example with `imports` directive
--------------------------------

`config/production.yml`:

```yaml
imports:
    - { resource: "default.yml" }
    - { resource: "routing/api.yml", property: "routing.api" }

foo: "hello"
tic: "tac"
```

```javascript
import configYaml from "config-yaml";

const config = configYaml(`${__dirname}/config/production.yml`);

console.log(config.foo); // "hello"
console.log(config.routing.api); // Configuration from routing/api.yml
```

Available variables
-------------------

| Variable       | Description                             |
| -------------- | --------------------------------------- |
| `%__dirname%`  | Directory path of the current YAML file |
| `%__filename%` | Current YAML file path                  |


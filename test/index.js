"use strict";

const assert = require("assert");
const configYaml = require("../lib");

let config = configYaml(`${__dirname}/config/default.yml`);
assert.strictEqual(config.foo, "bar");
assert.strictEqual(config.list[1], 2);


config = configYaml(`${__dirname}/config/production.yml`);
assert.strictEqual(config.foo, "hello");
assert.strictEqual(config.tic, "tac");

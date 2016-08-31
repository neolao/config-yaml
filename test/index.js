"use strict";

const assert = require("assert");
const configYaml = require("../lib");

let config = configYaml(`${__dirname}/config/default.yml`);
assert.strictEqual(config.foo, "bar");
assert.strictEqual(config.list[1], 2);
assert.strictEqual(config.parameters.a, "b");


config = configYaml(`${__dirname}/config/production.yml`);
assert.strictEqual(config.foo, "hello");
assert.strictEqual(config.tic, "tac");
assert.strictEqual(config.list[3], 4);
assert.strictEqual(config.parameters.a, "z");

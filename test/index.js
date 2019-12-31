"use strict";

const assert = require("assert");
const configYaml = require("../index");

let config = configYaml(`${__dirname}/config/default.yml`);
assert.strictEqual(config.foo, "bar");
assert.strictEqual(config.list[1], 2);
assert.strictEqual(config.parameters.a, "b");


config = configYaml(`${__dirname}/config/production.yml`);
assert.strictEqual(config.foo, "hello");
assert.strictEqual(config.tic, "tac");
assert.strictEqual(config.list[3], 4);
assert.strictEqual(config.parameters.a, "z");
assert.strictEqual(config.parameters.b, __dirname+"/config");

assert.strictEqual(config.http_router.routes.default.example_index.controller, "DefaultController");
assert.strictEqual(config.routing.a.b.c.example_index.controller, "DefaultController");
assert.strictEqual(config.routing.debug, true);
assert.strictEqual(config.security.rules[0], "a");

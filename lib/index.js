"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _jsYaml = require("js-yaml");

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _deepmerge = require("deepmerge");

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load YAML file
 *
 * @param   {string}    filePath    YAML file path
 * @param   {object}    options     Options
 * @return  {object}                YAML content converted to object
 */
function loadConfigurationYaml(filePath) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (!(typeof filePath === 'string')) {
        throw new TypeError("Value of argument \"filePath\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(filePath));
    }

    if (!(options instanceof Object)) {
        throw new TypeError("Value of argument \"options\" violates contract.\n\nExpected:\nObject\n\nGot:\n" + _inspect(options));
    }

    // Get absolute file path
    var absoluteFilePath = _path2.default.resolve(filePath);

    // Check read access

    if (!(typeof absoluteFilePath === 'string')) {
        throw new TypeError("Value of variable \"absoluteFilePath\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(absoluteFilePath));
    }

    var readFlag = _fs2.default.R_OK;
    if (!readFlag && _fs2.default.constants) {
        readFlag.constants.R_OK;
    }
    try {
        _fs2.default.accessSync(absoluteFilePath, readFlag);
    } catch (error) {
        throw new Error("Unable to read file: " + absoluteFilePath);
    }

    // File encoding
    var encoding = "utf8";
    if (options.encoding) {
        encoding = options.encoding;
    }

    // Load file content
    var content = _fs2.default.readFileSync(filePath, encoding);

    // Convert YAML content to object
    var config = _jsYaml2.default.safeLoad(content);

    // Handle "imports" directive
    if (config.hasOwnProperty("imports") && Array.isArray(config.imports)) {
        // Resources are relative to the original file
        var relativeDirectory = _path2.default.dirname(absoluteFilePath);

        // Build a base configuration

        if (!(typeof relativeDirectory === 'string')) {
            throw new TypeError("Value of variable \"relativeDirectory\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(relativeDirectory));
        }

        var baseConfig = {};
        _config$imports = config.imports;

        if (!(_config$imports && (typeof _config$imports[Symbol.iterator] === 'function' || Array.isArray(_config$imports)))) {
            throw new TypeError("Expected _config$imports to be iterable, got " + _inspect(_config$imports));
        }

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = _config$imports[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _config$imports;

                var importEntry = _step.value;

                if (!importEntry.hasOwnProperty("resource")) {
                    continue;
                }

                // Entry configuration
                var entryConfig = loadConfigurationYaml(relativeDirectory + "/" + importEntry.resource, options);

                // By default, the merge is done on the configuration root
                var targetProperty = null;
                var property = baseConfig;
                if (importEntry.hasOwnProperty("property")) {
                    targetProperty = importEntry.property;
                }
                if (targetProperty && targetProperty.length > 0) {
                    var propertyPath = targetProperty.split(".");
                    var parentProperty = property;
                    var lastPropertyName = null;

                    if (!(propertyPath && (typeof propertyPath[Symbol.iterator] === 'function' || Array.isArray(propertyPath)))) {
                        throw new TypeError("Expected propertyPath to be iterable, got " + _inspect(propertyPath));
                    }

                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = propertyPath[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var propertyName = _step2.value;

                            lastPropertyName = propertyName;
                            parentProperty = property;

                            if ((typeof property === "undefined" ? "undefined" : _typeof(property)) === "object" && property.hasOwnProperty(propertyName)) {
                                property = property[propertyName];
                            } else {
                                // Create the property if it does not exist
                                property = property[propertyName] = {};
                            }
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    parentProperty[lastPropertyName] = (0, _deepmerge2.default)(property, entryConfig);
                } else {
                    baseConfig = (0, _deepmerge2.default)(baseConfig, entryConfig);
                }
            }

            // Override the base configuration with the current configuration
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        config = (0, _deepmerge2.default)(baseConfig, config);

        // Remove import entries from configuration
        delete config.imports;
    }

    return config;
};

exports.default = loadConfigurationYaml;

function _inspect(input, depth) {
    var maxDepth = 4;
    var maxKeys = 15;

    if (depth === undefined) {
        depth = 0;
    }

    depth += 1;

    if (input === null) {
        return 'null';
    } else if (input === undefined) {
        return 'void';
    } else if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
        return typeof input === "undefined" ? "undefined" : _typeof(input);
    } else if (Array.isArray(input)) {
        if (input.length > 0) {
            var _ret = function () {
                if (depth > maxDepth) return {
                        v: '[...]'
                    };

                var first = _inspect(input[0], depth);

                if (input.every(function (item) {
                    return _inspect(item, depth) === first;
                })) {
                    return {
                        v: first.trim() + '[]'
                    };
                } else {
                    return {
                        v: '[' + input.slice(0, maxKeys).map(function (item) {
                            return _inspect(item, depth);
                        }).join(', ') + (input.length >= maxKeys ? ', ...' : '') + ']'
                    };
                }
            }();

            if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
        } else {
            return 'Array';
        }
    } else {
        var keys = Object.keys(input);

        if (!keys.length) {
            if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
                return input.constructor.name;
            } else {
                return 'Object';
            }
        }

        if (depth > maxDepth) return '{...}';
        var indent = '  '.repeat(depth - 1);
        var entries = keys.slice(0, maxKeys).map(function (key) {
            return (/^([A-Z_$][A-Z0-9_$]*)$/i.test(key) ? key : JSON.stringify(key)) + ': ' + _inspect(input[key], depth) + ';';
        }).join('\n  ' + indent);

        if (keys.length >= maxKeys) {
            entries += '\n  ' + indent + '...';
        }

        if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
            return input.constructor.name + ' {\n  ' + indent + entries + '\n' + indent + '}';
        } else {
            return '{\n  ' + indent + entries + '\n' + indent + '}';
        }
    }
}

module.exports = exports["default"];
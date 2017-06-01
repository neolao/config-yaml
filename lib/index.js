"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _jsYaml = require("js-yaml");

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _deepmerge = require("deepmerge");

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loadConfigurationYaml(filePath) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var absoluteFilePath = _path2.default.resolve(filePath);

    var readFlag = _fs2.default.R_OK;
    if (!readFlag && _fs2.default.constants) {
        readFlag = _fs2.default.constants.R_OK;
    }
    try {
        _fs2.default.accessSync(absoluteFilePath, readFlag);
    } catch (error) {
        throw new Error("Unable to read file: " + absoluteFilePath);
    }

    var encoding = "utf8";
    if (options.encoding) {
        encoding = options.encoding;
    }

    var content = _fs2.default.readFileSync(filePath, encoding);

    var config = _jsYaml2.default.safeLoad(content);
    if ((typeof config === "undefined" ? "undefined" : _typeof(config)) !== "object") {
        config = {};
    }

    if (config.hasOwnProperty("imports") && Array.isArray(config.imports)) {
        var relativeDirectory = _path2.default.dirname(absoluteFilePath);

        var baseConfig = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = config.imports[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var importEntry = _step.value;

                if (!importEntry.hasOwnProperty("resource")) {
                    continue;
                }

                var entryConfig = loadConfigurationYaml(relativeDirectory + "/" + importEntry.resource, options);

                var targetProperty = null;
                var property = baseConfig;
                if (importEntry.hasOwnProperty("property")) {
                    targetProperty = importEntry.property;
                }
                if (targetProperty && targetProperty.length > 0) {
                    var propertyPath = targetProperty.split(".");
                    var parentProperty = property;
                    var lastPropertyName = null;
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

                    if (lastPropertyName !== null) {
                        parentProperty[lastPropertyName] = (0, _deepmerge2.default)(property, entryConfig);
                    }
                } else {
                    baseConfig = (0, _deepmerge2.default)(baseConfig, entryConfig);
                }
            }
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

        delete config.imports;
    }

    return config;
}

exports.default = loadConfigurationYaml;
module.exports = exports["default"];
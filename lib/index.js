"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _jsYaml = require("js-yaml");

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _deepmerge = require("deepmerge");

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loadConfigurationYaml(filePath, options) {
    if (!options) {
        options = {};
    }

    let absoluteFilePath = _path2.default.resolve(filePath);

    let readFlag = _fs2.default.R_OK;
    if (!readFlag && _fs2.default.constants) {
        readFlag = _fs2.default.constants.R_OK;
    }
    try {
        _fs2.default.accessSync(absoluteFilePath, readFlag);
    } catch (error) {
        throw new Error(`Unable to read file: ${absoluteFilePath}`);
    }

    let encoding = "utf8";
    if (options.encoding) {
        encoding = options.encoding;
    }

    let content = _fs2.default.readFileSync(filePath, encoding);

    content = content.replace(/%__dirname%/g, _path2.default.dirname(absoluteFilePath));
    content = content.replace(/%__filename%/g, absoluteFilePath);

    let config = _jsYaml2.default.safeLoad(content);
    if (typeof config !== "object") {
        config = {};
    }

    if (config.hasOwnProperty("imports") && Array.isArray(config.imports)) {
        let relativeDirectory = _path2.default.dirname(absoluteFilePath);

        let baseConfig = {};
        for (let importEntry of config.imports) {
            if (!importEntry.hasOwnProperty("resource")) {
                continue;
            }

            let entryConfig = loadConfigurationYaml(`${relativeDirectory}/${importEntry.resource}`, options);

            let targetProperty = null;
            let property = baseConfig;
            if (importEntry.hasOwnProperty("property")) {
                targetProperty = importEntry.property;
            }
            if (targetProperty && targetProperty.length > 0) {
                let propertyPath = targetProperty.split(".");
                let parentProperty = property;
                let lastPropertyName = null;
                for (let propertyName of propertyPath) {
                    lastPropertyName = propertyName;
                    parentProperty = property;

                    if (typeof property === "object" && property.hasOwnProperty(propertyName)) {
                        property = property[propertyName];
                    } else {
                        property = property[propertyName] = {};
                    }
                }
                if (lastPropertyName !== null) {
                    parentProperty[lastPropertyName] = (0, _deepmerge2.default)(property, entryConfig);
                }
            } else {
                baseConfig = (0, _deepmerge2.default)(baseConfig, entryConfig);
            }
        }

        config = (0, _deepmerge2.default)(baseConfig, config);

        delete config.imports;
    }

    return config;
}

exports.default = loadConfigurationYaml;
module.exports = exports["default"];
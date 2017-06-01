/* @flow */
import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import deepmerge from "deepmerge"

/**
 * Load YAML file
 *
 * @param   {string}    filePath    YAML file path
 * @param   {object}    options     Options
 * @return  {object}                YAML content converted to object
 */
function loadConfigurationYaml(filePath:string, options:Object = {})
{
    // Get absolute file path
    let absoluteFilePath:string = path.resolve(filePath);

    // Check read access
    let readFlag = fs.R_OK;
    if (!readFlag && fs.constants) {
        readFlag = fs.constants.R_OK;
    }
    try {
        fs.accessSync(absoluteFilePath, readFlag);
    } catch (error) {
        throw new Error(`Unable to read file: ${absoluteFilePath}`);
    }

    // File encoding
    let encoding = "utf8";
    if (options.encoding) {
        encoding = options.encoding;
    }

    // Load file content
    let content = fs.readFileSync(filePath, encoding);

    // Convert YAML content to object
    let config = yaml.safeLoad(content);
    if (typeof config !== "object") {
        config = {};
    }

    // Handle "imports" directive
    if (config.hasOwnProperty("imports") && Array.isArray(config.imports)) {
        // Resources are relative to the original file
        let relativeDirectory:string = path.dirname(absoluteFilePath);

        // Build a base configuration
        let baseConfig = {};
        for (let importEntry of config.imports) {
            if (!importEntry.hasOwnProperty("resource")) {
                continue;
            }

            // Entry configuration
            let entryConfig = loadConfigurationYaml(`${relativeDirectory}/${importEntry.resource}`, options);

            // By default, the merge is done on the configuration root
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
                        // Create the property if it does not exist
                        property = property[propertyName] = {};
                    }
                }
                if (lastPropertyName !== null) {
                    parentProperty[lastPropertyName] = deepmerge(property, entryConfig);
                }
            } else {
                baseConfig = deepmerge(baseConfig, entryConfig);
            }
        }

        // Override the base configuration with the current configuration
        config = deepmerge(baseConfig, config);

        // Remove import entries from configuration
        delete config.imports;
    }

    return config;
}


export default loadConfigurationYaml;

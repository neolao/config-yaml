import fs from "fs";
import path from "path";
import yaml from "js-yaml";

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
        readFlag.constants.R_OK;
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

            let entryConfig = loadConfigurationYaml(`${relativeDirectory}/${importEntry.resource}`, options);
            baseConfig = Object.assign(baseConfig, entryConfig);
        }

        // Override the base configuration with the current configuration
        config = Object.assign(baseConfig, config);

        // Remove import entries from configuration
        delete config.imports;
    }

    return config;
};


export default loadConfigurationYaml;

const fs = require("fs").promises;
const path = require("path");
const Logger = require("./logger");
const assert = require("assert");

class Printer {
  /**
   * @param {Object} config
   */
  constructor(config) {
    this.config = config;
    this.logger = new Logger(config.owner);
  }

  /**
   * @param {Object} toPrint
   */
  print(toPrint) {
    const moduleName = toPrint.name;
    const module = toPrint.module ;

    if (!toPrint) {
      this.logger.error(`No documentation found for module ${moduleName}`);
      throw new Error(`No documentation found for module ${moduleName}`);
    }

    let output = `# ${moduleName}\n\n`;

    const functionNames = Object.keys(module).sort();

    for (const funcName of functionNames) {
      const func = module[funcName];
      output += this.generateFunctionDoc(moduleName, func);
    }

    return output;
  }

  /**
   * @param {string} moduleName
   * @param {Object} func
   */
  generateFunctionDoc(moduleName, func) {
    let output = "";

    // Function header with full name
    output += this.generateFunctionName(moduleName, func);

    // Description (if any)
    output += this.generateFunctionDescription(func);

    // Function signature in code block
    output += this.generateFunctionSignature(moduleName, func);

    // Parameters section (if any)
    output += this.generateFunctionParameters(func);

    // Returns section (if any)
    output += this.generateFunctionReturns(func);

    // Examples (if any)
    output += this.generateFunctionExamples(func);

    return output;
  }

  /**
   * @param {any[]} params
   */
  getParamList(params) {
    if (!params || !params.length)
      return "";

    return params.map(p => p.name).join(", ");
  }

  // Helper method to write the markdown file
  /**
   * @param {string} outputPath
   * @param {string} doc
   */
  async writeMarkdown(outputPath, doc) {
    try {
      await this.assureDirectory();
      await fs.writeFile(outputPath, doc, "utf8");
      return true;
    } catch (e) {
      this.logger.error(`Error writing markdown for \`${outputPath}\`: ${e}`);
      throw e;
    }
  }

  async assureDirectory() {
    try {
      // Just create the directory and write the file, regardless of whether it"s in a submodule
      const outputPath = path.resolve(this.config.workspaceRoot, this.config.outputPath);
      await fs.mkdir(outputPath, { recursive: true });
    } catch (e) {
      this.logger.error(`Error creating output directory: ${e}`);
      throw e;
    }
  }

  /**
   * @param {string} moduleName
   * @param {Object} func
   */
  generateFunctionName(moduleName, func) {
    return `## ${moduleName}${func.separator}${func.name}\n\n`;
  }

  /**
   * @param {Object} func
   * @param {string} moduleName
   */
  generateFunctionSignature(moduleName, func) {
    return "```lua\n" +
      `${moduleName}${func.separator}${func.name}(${this.getParamList(func.param)})\n` +
      "```\n\n";
  }

  /**
   * @param {Object} func
   */
  generateFunctionDescription(func) {
    return this.generateDocBlock(func, "description");
  }

  /**
   * @param {Object} func
   */
  generateFunctionParameters(func) {
    const f = param => `- \`${param.name}\` (\`${param.type}\`) - ${param.description}\n`;

    return this.generateDocBlock(func, "param", "Parameters", f);
  }

  /**
   * @param {Object} func
   */
  generateFunctionReturns(func) {
    const f = ret => `\`${ret.type}\` - ${ret.description}`;

    return this.generateDocBlock(func, "return", "Returns", f);
  }

  /**
   * @param {Object} func
   */
  generateFunctionExamples(func) {
    return this.generateDocBlock(func, "example", "Examples");
  }

  /**
   * @param {Object} func
   * @param {string} property
   * @param {string} label
   * @param {function} f
   */
  generateDocBlock(func, property, label = null, f = null) {
    assert(func[property], `No ${property} found for ${func.name}`);

    let value = func[property];

    assert(Array.isArray(value) || typeof value === "string", `Expected ${property} to be an array or string, got ${typeof value} for ${func.name}.\nGot: ${JSON.stringify(value)}`);

    const render = (value, f) => {
      return Array.isArray(value)
        ? value.length > 0
          ? (f ? value.map(f) : value).join("\n")
          : ""
        : value.length > 0
          ? f ? f(value) : value
          : "";
    }

    value = render(value, f);

    return value.length > 0
      ? `${label ? `**${label}**\n\n` : ""}${value}\n\n`
      : "";
  }
}

module.exports = Printer;

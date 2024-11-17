const fs = require("fs").promises;
const path = require("path");
const Logger = require("./logger");

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
    // this.logger.debug(`Printing module ${JSON.stringify(toPrint)}`);
    const moduleName = toPrint.name ; // Use `meta` if `name` is not available
    const module = toPrint.funcs;

    // this.logger.debug(`Printing module ${moduleName}`);
    // this.logger.debug(`Module content: ${JSON.stringify(module)}`);

    if (!toPrint) {
      this.logger.error(`No documentation found for module ${moduleName}`);
      throw new Error(`No documentation found for module ${moduleName}`);
    }

    let output = `# ${moduleName}\n\n`;

    const functionNames = Object.keys(module).sort();

    for (const funcName of functionNames) {
      const func = module[funcName];
      // this.logger.debug(`Printing function ${JSON.stringify(func)}`);
      output += this.generateFunctionDoc(moduleName, func);
    }

    return output;
  }

  /**
   * @param {string} moduleName
   * @param {Object} func
   */
  generateFunctionDoc(moduleName, func) {
    const clonedFunc = JSON.parse(JSON.stringify(func));

    // this.logger.debug(`Entering generateFunctionDoc with func: ${JSON.stringify(clonedFunc)}`);

    if (typeof clonedFunc !== 'object' || !clonedFunc.name || !clonedFunc.separator) {
      this.logger.error(`Unexpected input for function doc generation: ${JSON.stringify(clonedFunc)}`);
      return "";
    }

    let output = "";

    if (clonedFunc.name && clonedFunc.separator) {
      // Use the `meta` value for generating function names as well
      // const funcName = `${moduleName}${clonedFunc.separator}${clonedFunc.name}`;
      // output += `## ${funcName}\n\n`;
      // output += this.generateFunctionSignature(clonedFunc);

      output += this.generateFunctionName(clonedFunc);
    } else {
      this.logger.error(`Invalid function or missing name/separator for function in module ${moduleName}: ${JSON.stringify(clonedFunc, null, 2)}`);
      return "";
    }

    // Get the function name and context


    // Generate the function description, if any.
    output += this.generateFunctionDescription(clonedFunc);

    // Parameters section (if any)
    output += this.generateFunctionParameters(clonedFunc);

    // Returns section (if any)
    output += this.generateFunctionReturns(clonedFunc);

    // Examples (if any)
    output += this.generateFunctionExamples(clonedFunc);

    return output + "\n";
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
      this.logger.error(`Error writing markdown for \`${outputPath}\`: ${e.stack}`);
      throw e;
    }
  }

  async assureDirectory() {
    try {
      // Just create the directory and write the file, regardless of whether it"s in a submodule
      const outputPath = path.resolve(this.config.workspaceRoot, this.config.outputPath);
      await fs.mkdir(outputPath, { recursive: true });
    } catch (e) {
      this.logger.error(`Error creating output directory: ${e.stack}`);
      throw e;
    }
  }

  // printer.js

  /**
   * @param {Object} func
   */
  generateFunctionName(func) {
    const context = func.contextName ? `${func.contextName}${func.separator}` : '';
    return `## ${context}${func.name}\n\n`;
  }

  /**
   * @param {Object} func
   */
  generateFunctionSignature(func) {
    // this.logger.debug(`Entering generateFunctionSignature with func: ${JSON.stringify(func)}`);
    if (!func.name) {
      this.logger.error(`Function name is missing for ${func.contextName || 'unknown context'}`);
      return '';
    }

    const context = func.contextName ? `${func.contextName}${func.separator}` : '';
    const functionName = func.name || 'unknown';
    const params = this.getParamList(func.param);

    return "```lua\n" +
      `${context}${functionName}(${params})\n` +
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
    const f = param => `- \`${param.name}\` (\`${param.type}\`) - ${param.description}`;

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
    const debug = this.logger.debug.bind(this.logger);
    if (!func[property])
      return "";

    const render = (value, f) => {
      return Array.isArray(value)
        ? value.length > 0
          ? (f ? value.map(f) : value).join("\n")
          : ""
        : value.length > 0
          ? f ? f(value) : value
          : "";
    }

    let value = render(func[property], f);
    if(value.length < 1) return "";

    let result = "" ;
    result += label ? `\n**${label}**\n\n` : "";

    value = value.replace(/\n$/, '') ;
    value = value.replace(/^\n/, '') ;

    result += value ;

    return result + "\n" ;
  }
}

module.exports = Printer;

const fs = require("fs").promises;
const path = require("path");

class Printer {
  /**
   * @param {Object} core
   */
  constructor(core) {
    this.core = core ;
    this.logger = core.logger ;
  }

  /**
   * @param {Object} toPrint
   */
  print(toPrint) {
    const moduleName = toPrint.meta ; // Use `meta` if `name` is not available
    const module = toPrint.funcs;

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
    const clonedFunc = JSON.parse(JSON.stringify(func));

    if (typeof clonedFunc !== 'object' || !clonedFunc.name || !clonedFunc.separator) {
      this.logger.error(`Unexpected input for function doc generation: ${JSON.stringify(clonedFunc)}`);
      return "";
    }

    let output = "";

    if (clonedFunc.name && clonedFunc.separator) {
      output += this.generateFunctionName(clonedFunc);
    } else {
      this.logger.error(`Invalid function or missing name/separator for function in module ${moduleName}: ${JSON.stringify(clonedFunc, null, 2)}`);
      return "";
    }


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
   * @param {Object} parsed
   */
  async writeMarkdown(parsed) {
    const outputDir = this.core.config.distRoot
    const outputPath = `${outputDir}/${parsed.meta}.md`;

    try {
      await this.assureDirectory();
      await fs.writeFile(outputPath, parsed.markdown, "utf8");
      return true;
    } catch (e) {
      this.logger.error(`Error writing markdown for \`${outputPath}\`: ${e.stack}`);
      throw e;
    }
  }

  async assureDirectory() {
    try {
      // Just create the directory and write the file, regardless of whether it"s in a submodule
      const outputDir = `${this.core.config.distRoot}/`;
      await fs.mkdir(outputDir, { recursive: true });
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
    const f = ret => `\`${ret.types.join("`, `")}\` - ${ret.description}`;

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

// File: src/core/core.js
const fs = require('fs/promises')
const {Environment, Configuration} = require('./env')
const Logger = require('./logger')
const Parser = require('./parser')
const Printer = require('./printer')
const Reader = require('./reader')

/**
 * @class Gludoc
 */
class Gludoc {
  /**
   * @param {Object} config
   */
  constructor(config) {
    if(!config || typeof config !== 'object')
      throw new Error('Config is required')

    // Validate config
    this.validateConfig(config)

    if(!Object.values(Environment).includes(config.env))
      throw new Error(`Invalid environment: ${config.env}`)

    // Ok, we good.
    this.config = config
    this.logger = new Logger(this)
    this.reader = new Reader(this)
    this.parser = new Parser(this)
    this.printer = new Printer(this)

    this.config.outputPath = this.config.destination
  }

  /**
   * @param {Object} config
   * @returns true
   * @throws {Error}
   **/
  validateConfig(config) {
    if(!config)
      throw new Error('Config is required')

    const have = Object.keys(config).filter(key => Configuration.required.includes(key))
    const haveNot = Configuration.required.filter(key => !have.includes(key))

    if(have.length !== Configuration.required.length)
      throw new Error(`Config is missing required fields: ${haveNot.join(', ')}`)

    return true
  }

  /**
   * Determines if a file is documentation-only by checking for `---@meta` tag.
   * @param {string} content
   * @returns {boolean}
   */
  validFile(content) {
    return content.trim().startsWith('---@meta');
  }

  /**
   * @param {string[]} files
   */
  async processFiles(files) {
    const config = this.config;
    const parser = this.parser;
    const printer = this.printer;
    const reader = this.reader;

    const filePromises = files.map(async file => {
      try {
        if (!file.endsWith(".lua")) return;

        const read = await reader.read(file);
        const content = read.text;
        if (!content) return;

        const valid = this.validFile(content);
        if (!valid) return;

        const parsedData = parser.parse(content);
        parsedData.markdown = printer.print(parsedData);

        const result = await printer.writeMarkdown(parsedData);

        return { filePath: file, result };
      } catch (e) {
        return { filePath: file, error: e.message };
      }
    });

    const results = await Promise.all(filePromises);
    return results.filter((result) => result !== undefined);
  }

  async outputFile(content) {
    const outputPath = this.config.outputPath;
    return await fs.writeFile(outputPath, content, 'utf8');
  }
}

module.exports = {
  Gludoc,
  Environment,
  Configuration,
}

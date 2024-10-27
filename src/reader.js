// reader.js
const fs = require('fs/promises');
const Logger = require('./logger');

/**
 * @class Reader
 */
class Reader {
  /**
   * @param {string} owner
   */
  constructor(owner) {
    this.owner = owner;
    this.logger = new Logger(owner);
  }

  /**
   * @param {string} filePath
   */
  async read(filePath) {
    const result = {
      text: await fs.readFile(filePath, 'utf8'),
      filePath,
    };
    return result;
  }
}

module.exports = Reader;

// reader.js
const fs = require('fs/promises');
const path = require('path');
const Logger = require('./logger');

/**
 * @class Reader
 */
class Reader {
  constructor(owner) {
    this.owner = owner;
    this.logger = new Logger(owner);
  }

  async read(filePath) {
    const result = {
      text: await fs.readFile(filePath, 'utf8'),
      filePath,
    };
    return result;
  }
}

module.exports = Reader;

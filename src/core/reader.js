// reader.js
const fs = require('fs/promises');

/**
 * @class Reader
 */
class Reader {
  /**
   * @param {Object} core
   */
  constructor(core) {
    this.core = core ;
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

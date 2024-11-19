// logger.js

const vscode = require('vscode');

const error = vscode.window.showErrorMessage;
const info = vscode.window.showInformationMessage;

class Logger {
  /**
   * @param {Object} core
   */
  constructor(core) {
    this.core = core ;
    this.name = core.config.owner ;
  }

  /**
   * @param {any} message
   */
  debug(message) {
    console.debug(`[${this.name}] debug:`, message);
  }

  /**
   * @param {string} message
   */
  info(message) {
    console.info(`[${this.name}] info:`, message);
    info(message);
  }

  /**
   * @param {string} message
   */
  error(message) {
    console.error(`[${this.name}] error:`, message);
    error(message);
  }
}

module.exports = Logger;
// logger.js

const {Configuration, Environment} = require("./env")

class Logger {
  /**
   * @param {Object} core
   */
  constructor(core) {
    this.core = core ;
    this.name = core.config.owner ;

    if(core.config.env === Environment.EXTENSION) {
      const vscode = require('vscode');
      this.vscodeError = vscode.window.showErrorMessage.bind(vscode.window);
      this.vscodeWarn = vscode.window.showWarningMessage.bind(vscode.window);
      this.vscodeInfo = vscode.window.showInformationMessage.bind(vscode.window);
    }
  }

  /**
   * @param {any} message
   */
  debug(message) {
    console.debug(`[${this.name}] debug:`, message);
  }

  warn(message) {
    console.warn(`[${this.name}] warn:`, message);
    this.vscodeWarn && this.vscodeWarn(message);
  }

  /**
   * @param {string} message
   */
  info(message) {
    console.info(`[${this.name}] info:`, message);
    this.vscodeInfo && this.vscodeInfo(message);
  }

  /**
   * @param {string} message
   */
  error(message) {
    console.error(`[${this.name}] error:`, message);
    this.vscodeError && this.vscodeError(message);
  }
}

module.exports = Logger;

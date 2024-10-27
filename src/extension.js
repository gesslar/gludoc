// extension.js
const vscode = require('vscode');
const fs = require('fs/promises');
const path = require('path');

const Logger = require('./logger');
const Reader = require('./reader');
const Parser = require('./parser');
const Printer = require('./printer');

// Definitions
const types = require('./types');
const patterns = require('./patterns');

/**
 * @class GludocGenerator
 */
class GludocGenerator {
  /**
   * @param {string} workspaceRoot
   */
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this.docs = {};

    const { name = 'gludoc' } = require('../package.json');
    this.name = name.replace('vscode-', '');

    // Core regex patterns
    this.patterns = patterns;

    // Data types
    this.types = types;

    // Track parsing state
    this.currentDoc = null;
    this.inComment = false;
    this.description = [];
  }

  async loadConfig() {
    let config = null;
    const logger = new Logger(this.name);

    try {
      const configPath = path.join(this.workspaceRoot, '.vscode', 'gludoc.json');
      const configData = await fs.readFile(configPath, 'utf8');
      config = JSON.parse(configData);
    } catch (e) {
      config = {
        excludePatterns: ['**/test/**', '**/spec/**'],
        modulePrefix: '',
        outputFormat: 'markdown',
        outputPath: 'wiki',
      };
      logger.error(`Failed to load config: ${e.stack}`);
    }

    config.workspaceRoot = this.workspaceRoot;
    config.owner = this.name;

    return config;
  }
}

/**
 * @param {{ subscriptions: vscode.Disposable[]; }} context
 */
async function activate(context) {
  let errorCount = 0;

  let disposable = vscode.commands.registerCommand('vscode-gludoc.generateDocs', async () => {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
    if (!workspaceRoot) {
      vscode.window.showErrorMessage('No workspace folder found');
      return;
    }

    try {
      const generator = new GludocGenerator(workspaceRoot);
      const config = await generator.loadConfig();

      /**
       * @param {string} filePath
       */
      function getModuleName(filePath) {
        // logger.debug(`File path: \`${filePath}\``);
        const matches = filePath.match(patterns.module);
        // logger.debug(`Module name: \`${JSON.stringify(matches)}\``);
        return matches[1];
      }

      const reader = new Reader(generator.name);
      const parser = new Parser(generator.name);
      const printer = new Printer(config);
      const logger = new Logger(generator.name);
      // Find all Lua files in workspace
      const files = await vscode.workspace.findFiles(
        '**/*.lua',
        `{${config.excludePatterns.join(',')}}`
      );

      const modules = {}

      // logger.debug(`Found ${files.length} files: ${files.toString()}`);

      // Parse each file
      for (const file of files) {
        const moduleName = getModuleName(file.fsPath);
        // logger.debug(`Reading module: \`${moduleName}\``);
        const content = await reader.read(file.fsPath);
        // logger.debug(`Parsing module: \`${moduleName}\``);
        const parsed = parser.parse(content);
        modules[moduleName] = parsed;
      }

      // Generate and save documentation for each module
      for (const [moduleName, module] of Object.entries(modules)) {
        // logger.debug(`Generating docs for module: \`${moduleName}\``);

        try {
          const doc = await printer.print({
            name: moduleName,
            module
          });

          if (doc) {
            const outputPath = path.join(workspaceRoot, config.outputPath, `${moduleName}.md`);
            await printer.writeMarkdown(outputPath, doc);
          }
        } catch (err) {
          errorCount++;
          logger.error(`Failed to generate docs for module \`${moduleName}\`: ${err.stack}`);
        }
      }

      if (errorCount > 0) {
        logger.info(`Documentation generated with ${errorCount} errors`);
      } else {
        logger.info('Documentation generated successfully');
        // logger.debug(`Documentation written to ${config.outputPath}`);
      }
    } catch (e) {
      vscode.window.showErrorMessage(`Error generating documentation: ${e.stack}`);
    }

  });

  context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
};

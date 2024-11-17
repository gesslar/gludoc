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

  /**
   * Determines if a file is documentation-only by checking for `---@meta` tag.
   * @param {string} filePath
   * @returns {Promise<boolean>}
   */
  async isDocumentationOnly(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content.trim().startsWith('---@meta');
    } catch (e) {
      console.error(`Error reading file ${filePath}: ${e.stack}`);
      return false;
    }
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

      const logger = new Logger(generator.name);
      const reader = new Reader(generator.name);
      const parser = new Parser(generator.name);
      const printer = new Printer(config);

      // Find all Lua files in workspace
      const sourcePath = vscode.workspace.getConfiguration().get('gludoc.sourcePath') || '**/*.lua';
      const files = await vscode.workspace.findFiles(
        sourcePath,
        `{${config.excludePatterns.join(',')}}`
      );

      /** @type {Object<string, Object>} */
      const modules = {};

      // Filter documentation-only files and parse them
      for (const file of files) {
        if (await generator.isDocumentationOnly(file.fsPath)) {
          const content = await reader.read(file.fsPath);
          const parsedContent = parser.parse(content);

          modules[parsedContent.meta] = parsedContent.funcs;
          // logger.debug(Object.keys(parsed));
          // logger.debug(JSON.stringify(parsed));

          // const { moduleName: meta, parsed: funcs } = parsedContent ;

          // const {moduleName: meta, parsed: funcs} = parser.parse(content);
          // modules[meta] = funcs;
          // logger.info(`Parsed documentation for module \`${moduleName}\``);
        }
      }

      // logger.debug(Object.keys(modules));

      for (const [moduleName, module] of Object.entries(modules)) {
        // logger.debug(`Generating documentation for module \`${moduleName}\``);

        try {
          const doc = printer.print({ name: moduleName, funcs: module });

          if(doc) {
            const outputPath = path.join(workspaceRoot, config.outputPath, `${moduleName}.md`);
            await printer.writeMarkdown(outputPath, doc);
          }
        } catch(e) {
          errorCount++;
          logger.error(`Failed to generate docs for module \`${moduleName}\`: ${e.stack}`);
        }
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

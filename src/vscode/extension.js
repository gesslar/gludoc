// File: src/vscode/extension.js
const vscode = require('vscode')
const path = require('path')
const {Gludoc, Environment} = require('../core/core')

/**
 * @param {{ subscriptions: vscode.Disposable[]; }} context
 */
async function activate(context) {

  // VS Code commands and subscriptions
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-gludoc.generateDocs', async () => {
      try {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
        if (!workspaceRoot) {
          vscode.window.showErrorMessage('No workspace folder found');
          return;
        }

        const config = {
          owner: "gludoc",
          env: Environment.EXTENSION,
          source: "./library/",
          destination: `${workspaceRoot}/dist/`,
          debug: false,
        }
        const gludoc = new Gludoc(config);
        const searchPattern = "**/*.lua";
        const distPath = `${config.workspaceRoot}/${config.distDirectory}`;
        const files = (await vscode.workspace.findFiles(searchPattern))
          .map(file => file.fsPath);
        const result = await gludoc.processFiles(files);
        const successes = result.filter(({ error }) => !error);
        const errors = result.filter(({ error }) => error);

        errors.forEach(({ filePath, error }) => {
          vscode.window.showErrorMessage(`Error processing ${filePath}: ${error}`);
        });

        if (errors.length) {
          if(errors.length == files.length) {
            vscode.window.showErrorMessage('No documentation generated.');
            return;
          } else {
            vscode.window.showWarningMessage(`${errors.length} files failed to generate documentation.`);
          }
        } else {
          if (successes.length) {
            gludoc.logger.info(`Documentation generation complete for ${successes.length} files.`);
          } else {
            gludoc.logger.info('No files found to generate documentation.');
          }
        }
      } catch (e) {
        vscode.window.showErrorMessage(`Error generating documentation: ${e.message}`);
      }
    }
  ));
}

exports.activate = activate;

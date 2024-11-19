// File: src/github_action/action.js
const {Gludoc, Environment} = require('../core/core')
const core = require('@actions/core');
const fs = require('fs');

// GitHub Action logic
(async function run() {
  try {
    const config= {}

    const sourcePath = core.getInput('sourceRoot')
    if (!sourcePath)
      throw new Error('File path is required as an input')
    config.sourceRoot = sourcePath

    const gludoc = new Gludoc(config);

    /**
     * Find all files in the source path, recursively.
     *
     * @param {string} path
     * @return {string[]}
     */
    function findFiles(path) {
      const result = []
      const sourceFiles = fs.readdirSync(path, { withFileTypes: true })
      for (const file of sourceFiles) {
        if(file.isDirectory()) {
          result.push(...findFiles(`${path}/${file.name}`))
        }
        if (file.isFile() && file.name.endsWith('.lua')) {
          result.push(`${path}/${file.name}`)
        }
      }

      return result
    }

    const files = findFiles(config.sourceRoot)


    const result = await gludoc.processFiles(files);
    const successes = result.filter(({ error }) => !error);
    const errors = result.filter(({ error }) => error);

    const logger = gludoc.logger
    errors.forEach(({ filePath, error }) => {
      const mess =  `Error processing ${filePath}: ${error}`;
      logger.error(mess)
    });
  } catch (error) {
    core.setFailed('Error running GitHub Action: ' + error);
  }
})();

const core = require('@actions/core');
const { Gludoc, Environment } = require('../core/core')
const fs = require('fs');

async function run() {
  try {

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
        if (file.isDirectory()) {
          result.push(...findFiles(`${path}/${file.name}`))
        }
        if (file.isFile() && file.name.endsWith('.lua')) {
          result.push(`${path}/${file.name}`)
        }
      }
      return result
    }

    const source = core.getInput('source');
    const destination = core.getInput('destination');
    const debug = core.getInput('debug');

    const config = {
      owner: "gludoc",
      env: Environment.ACTION,
      source,
      destination,
      debug,
    }

    const gludoc = new Gludoc(config);
    const files = findFiles(config.source);
    const result = await gludoc.processFiles(files);
    const successes = result.filter(({ error }) => !error);
    const errors = result.filter(({ error }) => error);

    const logger = gludoc.logger
    if (errors.length) {
      if (errors.length == files.length) {
        logger.warn('No documentation generated.');
        return;
      } else {
        logger.warn(`${errors.length} files failed to generate documentation.`);
      }
    } else {
      if (successes.length) {
        gludoc.logger.info(`Documentation generation complete for ${successes.length} files.`);
      } else {
        gludoc.logger.info('No files found to generate documentation.');
      }
    }

  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();
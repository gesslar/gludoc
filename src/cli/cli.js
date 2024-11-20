const {Gludoc, Environment} = require('../core/core')
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const argv = yargs
  .option('source', {
    alias: 's',
    type: 'string',
    describe: 'Source directory root to process',
    demandOption: false, // Optional
  })
  .option('destination', {
    alias: 'd',
    type: 'string',
    describe: 'Directory for the output markdown',
    demandOption: true, // Makes this option required
  })
  .option('debug', {
    type: 'boolean',
    describe: 'Enable debug mode',
    default: false,
  })
  .help()
  .alias('help', 'h')
  .argv;

(async () => {
  try {
    const config = {
    ...{
      owner: "gludoc",
      env: Environment.CLI,
      source: "./",
      destination: "dist/",
      debug: false,
    },
    ...argv
    }

    config.source = path.resolve(config.source);
    config.destination = path.resolve(config.destination);

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

    const files = findFiles(config.source)
    const result = await gludoc.processFiles(files);
    const successes = result.filter(({ error }) => !error);
    const errors = result.filter(({ error }) => error);

    const logger = gludoc.logger
    if (errors.length) {
      if(errors.length == files.length) {
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
  } catch (e) {
    console.error(`Error generating documentation: ${e.message}`);
  }
})();

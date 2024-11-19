// parser.js

const patterns = require('./patterns');
const Logger = require('./logger');

class Func {
  constructor() {
    this.name = null;
    this.className = null;
    this.param = [];
    this.return = null;
    this.description = [];
    this.example = [];
    this.meta = null;
    this.separator = null;
    this.contextName = null;
  }
}

class Parser {
  /**
   * @param {Object} core
   */
  constructor(core) {
    this._resetState();
    this.core = core ;
    this.processingMultiline = null;
  }

  _resetState() {
    this.processingComment = false;
    this.processingMultiline = null;
  }

  /**
   * @param {Object} content
   */
  parse(content) {
    try {
      const lines = content.split(/\r?\n/);
      const funcs = {};
      let func = null;
      const result = {};

      // First, let us get the module name via the meta tag, which should be the first line of the file.
      const metaMatch = lines[0].match(patterns.tags.meta);
      if (metaMatch) {
        // debug("We found something that looks like a module name: " + JSON.stringify(metaMatch[1]));
        result.meta = metaMatch[1];

        // If we do not have a module name, we can't do anything with this file
        if (!result.meta) {
          this.core.logger.error('No module name found');
          return funcs;
        }

        // Remove the first line
        lines.shift();
      }

      lines.forEach((/** @type {string} */ line) => {
        const lineTrimmed = line.trim();

        // Skip empty lines unless we're processing a multiline tag, which might have them for formatting reasons.
        if (!this.processingMultiline && !lineTrimmed.length) return;

        // Check for start of doc comment block
        if (this.isCommentStart(lineTrimmed)) {
          // debug('New comment block: ' + lineTrimmed);
          func = this.newFunction(lineTrimmed);
          return;
        }

        // Process documentation lines
        if (this.processingComment) {
          if (!lineTrimmed.startsWith('---')) {
            // End of comment block, look for function definition
            if (this.isFunctionDefinition(lineTrimmed)) {
              const result = this.finalizeFunction(lineTrimmed, func);
              if (result) {
                funcs[result] = func;
              }
            }
            this.processingComment = false;
            return;
          }

          this.processLine(line, func);
        }
      });

      result.funcs = funcs;

      return result
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {string} line
   */
  isCommentStart(line) {
    // Only consider it a new doc block start if we're not already in a comment
    return !this.processingComment && patterns.docStart.test(line);
  }

  /**
   * @param {string} line
   */
  newFunction(line) {
    if (this.isCommentStart(line.trim())) {
      this._resetState();

      const func = new Func();
      this.processingComment = true;

      // Process the first line as content too
      this.processLine(line, func);

      return func;
    }
  }

  /**
   * @param {string} line
   * @param {Func} func
   */
  processLine(line, func) {
    const lineTrimmed = line.trim();

    if (!func) throw new Error('No function context');

    // Match @class tag
    const classMatch = lineTrimmed.match(patterns.tags.class);
    if (classMatch) {
      func.className = classMatch[1];
      return;
    }

    // Match @meta tag
    const metaMatch = lineTrimmed.match(patterns.tags.meta);
    if (metaMatch) {
      func.meta = metaMatch[1];
      return;
    }

    // Match @name tag
    const nameMatch = lineTrimmed.match(patterns.tags.name); // @name tag
    if (nameMatch) {
      func.name = nameMatch[1];
      return;
    }

    // Match @param tag
    const paramMatch = lineTrimmed.match(patterns.tags.param);
    if (paramMatch) {
      func.param.push({
        name: paramMatch[1],
        type: paramMatch[2],
        description: paramMatch[3]
      });
      return;
    }

    // Match @return tag
    const returnMatch = lineTrimmed.match(patterns.tags.return);
    if (returnMatch) {
      const types = [];

      // Split return types by comma
      returnMatch[1].split(',').forEach((type) => { types.push(type.trim()); });
      func.return = [{
        types: types,
        description: returnMatch[2]
      }];
      return;
    }

    // Match @example tag
    const exampleMatch = lineTrimmed.match(patterns.tags.example);
    if (exampleMatch) {
      this.processingMultiline = 'example';
      func.example.push(""); // Start new example block
      return;
    }

    // Process multiline content (for tags like @example)
    if (this.processingMultiline) {
      const currentTag = this.processingMultiline;
      const tagMatch = lineTrimmed.match(patterns.docLine);

      if (tagMatch && tagMatch[1]) {
        func[currentTag].push(tagMatch[1]);
        return;
      } else {
        func[currentTag].push("");
      }
    }

    // If not a special tag, treat as description
    const descMatch = lineTrimmed.match(patterns.docLine);
    if (descMatch && descMatch[1]) {
      func.description.push(descMatch[1]);
      return;
    } else {
      func.description.push("");
    }
  }

  /**
   * @param {string} line
   */
  isFunctionDefinition(line) {
    return line.match(patterns.function) !== null ;
  }

  /**
   * @param {string} line
   * @param {Func} func
   */
  finalizeFunction(line, func) {
    const match = line.match(patterns.function);

    if (match && func) {
      const contextName = match[1];  // Optional context name
      const separator = match[2];    // Optional separator (':' or '.')
      const functionName = match[3]; // Actual function name

      if (!functionName) {
        this.core.logger.error(`Failed to extract function name from line: ${line}`);
        return null;
      }

      func.separator = separator || '';  // Use empty string if separator is not present

      if (contextName) {
        func.contextName = contextName;  // Store context name if available
      }

      return functionName;
    } else {
      this.core.logger.error(`Failed to finalize function: ${JSON.stringify(match)}, line: ${line}`);
      return null;
    }
  }

}

module.exports = Parser;

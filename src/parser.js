// parser.js

const patterns = require('./patterns');
const Logger = require('./logger');

class Func {
  constructor() {}

  name = null;
  param = [];
  return = null;
  description = [];
}

class Parser {
  /**
   * @param {string} owner
   */
  constructor(owner) {
    this._resetState();
    this.owner = owner;
    this.logger = new Logger(owner);
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
      const lines = content.text.split(/\r?\n/);
      const funcs = {};
      let func = null;

      lines.forEach(line => {
        const lineTrimmed = line.trim();

        // Skip empty lines unless we're processing a multiline tag, which
        // might have them for formatting reasons.
        if (!this.processingMultiline && !lineTrimmed.length)
          return;

        // Check for start of doc comment block
        if (this.isCommentStart(lineTrimmed)) {
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

      return funcs;
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

    if (!func)
      throw new Error('No function context');

    const paramMatch = lineTrimmed.match(patterns.param);
    if (paramMatch) {
      func.param.push({
        name: paramMatch[1],
        type: paramMatch[2],
        description: paramMatch[3]
      });
      return;
    }

    // Is this a return statement?
    const returnMatch = lineTrimmed.match(patterns.return);
    if (returnMatch) {
      func.return = [{
        type: returnMatch[1],
        description: returnMatch[2]
      }];
      return;
    }

    // Is this a multiline tag?
    const multilineMatch = lineTrimmed.match(patterns.multilineStart);
    if (multilineMatch && patterns.multilineTags.includes(multilineMatch[1])) {
      const tag = multilineMatch[1];
      func[tag] = func[tag] || [];

      // If there is text on the same line as the tag, add it to the tag
      if (multilineMatch[2])
        func[tag].push(multilineMatch[2]);

      this.processingMultiline = tag;
      return;
    }

    // If we are processing a multiline tag, add the line to the tag
    const currentTag = this.processingMultiline;
    if(currentTag) {
      const tagMatch = lineTrimmed.match(patterns.multiLine);

      if(tagMatch && tagMatch[1]) {
        func[currentTag].push(tagMatch[1]);
        return;
      } else {
        func[currentTag].push("");
      }
    }

    // If not a special tag, treat as description
    const descMatch = line.match(patterns.docLine);
    if (descMatch && descMatch[1]) {
      func.description.push(descMatch[1]);
      return ;
    }
  }

  /**
   * @param {string} line
   */
  isFunctionDefinition(line) {
    return line.match(patterns.function) !== null
  }

  /**
   * @param {string} line
   */
  finalizeFunction(line, func) {
    const match = line.match(patterns.function);

    if (match && func) {
      const separator = match[1];
      const functionName = match[2];

      func.separator = separator;
      func.name = functionName;
      return functionName;
    } else {
      this.logger.error(`Failed to finalize function: ${JSON.stringify(match)}`);
      return null;
    }
  }
}

module.exports = Parser ;

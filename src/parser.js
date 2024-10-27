// parser.js

const patterns = require('./patterns');
const Logger = require('./logger');

class Func {
  constructor() {}

  name = null;
  param = [];
  return = null;
  description = [];
  example = [];
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

      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum].trim();

        if (!line)
          continue;

        // Check for start of doc comment block
        if (this.isCommentStart(line)) {
          func = this.newFunction(line);
          continue;
        }

        // Process documentation lines
        if (this.processingComment) {
          if (!line.startsWith('---')) {
            // End of comment block, look for function definition
            if (this.isFunctionDefinition(line)) {
              const result = this.finalizeFunction(line, func);
              if (result) {
                funcs[result] = func;
              }
            }
            this.processingComment = false;
            continue;
          }

          this.processLine(line, func);
        }
      }

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

  inExample() {
    return this.processingComment && this.processingMultiline
  }

  /**
 * @param {string} line
 */
  newFunction(line) {
    if (this.isCommentStart(line)) {
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
    if (!func)
      throw new Error('No function context');

    const paramMatch = line.match(patterns.param);
    if (paramMatch) {
      func.param.push({
        name: paramMatch[1],
        type: paramMatch[2],
        description: paramMatch[3]
      });
      return;
    }

    // Is this a return statement?
    const returnMatch = line.match(patterns.return);
    if (returnMatch) {
      func.return = [{
        type: returnMatch[1],
        description: returnMatch[2]
      }];
      return;
    }

    // Is this a multiline tag?
    const multilineMatch = line.match(patterns.multilineTag);
    if (multilineMatch && patterns.multiline.includes(multilineMatch[1])) {
      const tag = multilineMatch[1];
      func[tag] = func[tag] || [];
      func[tag].push(multilineMatch[2]);
      this.processingMultiline = tag;
      return;
    }

    // If we are processing a multiline tag, add the line to the tag
    const [currentTag, tagMatch] = [this.processingMultiline, line.match(patterns.docLine)];
    if (currentTag && tagMatch && tagMatch[1]) {
      func[currentTag].push(tagMatch[1]);
      return;
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

const patterns = {
  // Match the module name
  module: /^.*[\\\/](.*)\.lua$/,

  // Just look for any doc comment start
  docStart: /^---\s?/,

  // Doc line for content
  docLine: /^\s*---\s?(.*)$/,
  // multiLine: /^---\s?/,

  tags : {
    class  : /^\s*---\s?@class\s+(.*)/,                    // Class name
    name   : /^\s*---\s?@name\s+(.*)/,                     // Function name
    param  : /^\s*---\s?@param\s+([\w\.]*)\s+(.*)?\s+-\s+(.*)$/, // Function parameter
    example: /^\s*---\s?@example\s*/,                      // Example
    meta   : /^\s*---\s?@meta\s+(.*)/,                     // Module name
    return : /^\s*---\s?@return\s+(.*)\s+#\s+(.*)/,   // Return value
  },

  // Multiline tag
  multilineTags : ["example"],

  // The actual function definition is our source of truth
  function: /^\s*function\s+(\w+)?([:\.])?\s*([\w_]+)\s*\((.*?)\)\s*end$/,
};

module.exports = patterns;

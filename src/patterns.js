const patterns = {
  // Match the module name
  module: /^.*[\\\/](.*)\.lua$/,

  // Just look for any doc comment start
  docStart: /^---\s*/,

  // Doc line for content
  docLine: /^---\s*(.*)/,

  // Param and return patterns stay the same
  // Lines beginning with @ are doc lines
  param: /^---\s*@param\s+(\w+)\s+([^\s-]+)\s*-?\s*(.*)/,
  return: /^---\s*@return\s+([^\s-]+)\s*-?\s*(.*)/,

  // Multiline tag
  multiline: ["example"],
  multilineTag: /^(?:---\s*)?@(\w+)\s*(.*)/,

  // The actual function definition is our source of truth
  function: /^function +\w+\s*([:\.])\s*([\w_]+)\s*\((.*?)\)$/
};

module.exports = patterns;

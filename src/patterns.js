const patterns = {
  // Match the module name
  module: /^.*[\\\/](.*)\.lua$/,

  // Just look for any doc comment start
  docStart: /^--- /,

  // Doc line for content
  docLine: /^--- (.*)/,
  multiLine: /^--- (.*)/,

  // Param and return patterns stay the same
  // Lines beginning with @ are doc lines
  param: /^--- @param\s+(\w+)\s+([^\s-]+)\s*-?\s*(.*)/,
  return: /^--- @return\s+([^\s-]+)\s*-?\s*(.*)/,

  // Multiline tag
  multilineTags: ["example"],
  multilineStart: /^(?:--- *)?@(\w+)\s*(.*)/,

  // The actual function definition is our source of truth
  function: /^function +\w+\s*([:\.])\s*([\w_]+)\s*\((.*?)\)$/
};

module.exports = patterns;

// File: src/core/env.js
const Environment = {
  EXTENSION: 'extension',
  ACTION: 'action',
  CLI: 'cli'
}

const Configuration = {
  default: {
    environment: Environment.EXTENSION,
    name: "gludoc",
    sourceRoot: "src",
    distRoot: "dist",
  },
  required: ["owner", "env", "sourceRoot", "distRoot"]
}

module.exports = {
  Environment,
  Configuration,
}

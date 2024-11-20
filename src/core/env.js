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
    source: "src",
    destination: "dist",
  },
  required: ["owner", "env", "source", "destination"]
}

module.exports = {
  Environment,
  Configuration,
}

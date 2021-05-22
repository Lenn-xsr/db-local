const Schema = require("./modules/schema");
const { resolve } = require("path");
const { existsSync, mkdirSync } = require("fs");

module.exports = function Database({ path } = { path: "./databases" }) {
  const databasePath = resolve(path);
  if (!existsSync(databasePath)) mkdirSync(databasePath);

  return {
    Schema: (model, schema) => Schema(model, schema, path),
  };
};

const Schema = require("./modules/schema");
const { resolve } = require("path");
const { existsSync, mkdirSync } = require("fs");

/**
 * Create a new database.
 *
 * @name LocalDB
 * @constructor
 * @returns {{Schema: Schema}}
 */
function LocalDB({ path, compress } = { path: "./databases", compress: false }) {
  const databasePath = resolve(path);
  if (!existsSync(databasePath)) mkdirSync(databasePath);
  
  return {
    Schema: (model, schema) => Schema(model, schema, path, compress),
  };
}

module.exports = LocalDB;

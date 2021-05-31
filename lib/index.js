const Schema = require("./modules/schema");
const { resolve } = require("path");
const { existsSync, mkdirSync } = require("fs");

/**
 * Create a new database.
 *
 * @name dbLocal
 * @constructor
 * @returns {{Schema: Schema}}
 */
function dbLocal({ path } = { path: "./databases" }) {
  const databasePath = resolve(path);
  if (!existsSync(databasePath)) mkdirSync(databasePath);

  return {
    Schema: (model, schema) => Schema(model, schema, path),
  };
}

module.exports = dbLocal;

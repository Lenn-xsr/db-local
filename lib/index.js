const Schema = require("./modules/schema");

/**
 * Create a new database.
 *
 * @name LocalDB
 * @constructor
 * @returns {{Schema: Schema}}
 */
function LocalDB({ path, compress } = { path: "./databases", compress: false }) {
  return {
    Schema: (model, schema) => Schema(model, schema, path, compress),
  };
}

module.exports = LocalDB;

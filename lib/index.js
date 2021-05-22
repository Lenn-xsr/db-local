const Schema = require("./modules/schema");

/**
 * Create a new database.
 *
 * @name LocalDB
 * @constructor
 * @param {String} path
 * @returns {{Schema: Schema}}
 */
function LocalDB({ path } = { path: "./databases" }) {
  return {
    Schema: (model, schema) => Schema(model, schema, path),
  };
}

module.exports = LocalDB;

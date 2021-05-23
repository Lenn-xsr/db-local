const Schema = require("./modules/schema");

/**
 * Create a new database.
 *
 * @name LocalDB
 * @constructor
 * @returns {{Schema: Schema}}
 */
function LocalDB({ path, pack } = { path: "./databases", pack: false }) {
  return {
    Schema: (model, schema) => Schema(model, schema, path, pack),
  };
}

module.exports = LocalDB;

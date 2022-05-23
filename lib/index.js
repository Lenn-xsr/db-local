const Schema = require("./modules/schema");
const { resolve } = require("path");
const { existsSync, mkdirSync } = require("fs");
const { ObjectId } = require("./modules/objectid");

/**
 * Create a new database.
 *
 * @name dbLocal
 * @constructor
 * @returns {{Schema: Schema}}
 */
function dbLocal(
  { path, readOnFind } = { path: "./databases", readOnFind: false }
) {
  const databasePath = resolve(path);
  if (!existsSync(databasePath)) mkdirSync(databasePath);

  return {
    Schema: (model, schema) => Schema(model, schema, path, readOnFind),
    Types: {
      ObjectId: () => new ObjectId().toString()
    }
  };
}

module.exports = dbLocal;

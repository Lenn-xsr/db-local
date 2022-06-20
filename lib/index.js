const Schema = require("./modules/schema");
const { resolve } = require("path");
const { existsSync, mkdirSync } = require("fs");
const { ObjectId } = require("./modules/objectid");

/**
 * It creates a database object with a Schema function and a Types object
 * @param {String} path - The path to the directory where the database files will be stored.
 * @param {Boolean} readOnFind - If true, the database will be read on every find() call.
 * @default { path: './databases', readOnFind: false }
 * @returns An object with two properties: Schema and Types.
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

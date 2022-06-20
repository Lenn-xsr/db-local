const Methods = require("./methods");
const { ObjectId } = require("./objectid");

const { resolve } = require("path");

const defaultId = {
  type: String,
  default: () => new ObjectId().toString(),
  required: true
};
const schemas = {};

/**
 * It takes a model name, a schema, a path to the database, and a boolean to determine if the database
 * should be read on find
 * @param {Object} model - The name of the model.
 * @param {Object} schema - The schema of the model.
 * @param {String} path - The path to the database folder.
 * @param {Boolean} readOnFind - If true, the database will be read on every find() call.
 * @returns The return value is an object with the methods that are defined in the Methods function.
 */
function Schema(model, schema = { _id: defaultId }, path, readOnFind) {
  if (!model)
    throw new Error("The Schema requires a name, see the documentation.");

  if (!schema._id) schema._id = defaultId;

  const schemaIdType =
    typeof schema._id === "object" ? schema._id.type : schema._id;

  if (
    ![Number, String].includes(schemaIdType) ||
    (typeof schema._id === "function" && schemaIdType === String) ||
    (typeof schema._id === "object" &&
      schemaIdType === String &&
      !schema._id.default)
  )
    schema._id = defaultId;

  if (schema._id.required === undefined) schema._id.required = true;

  const databasePath = resolve(`${path}/${model}.json`);

  schemas[model] = { path: databasePath, schema };

  return {
    ...Methods(schema, databasePath, schemas, readOnFind)
  };
}

module.exports = Schema;

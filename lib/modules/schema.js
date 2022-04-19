const Methods = require("./methods");
const { ObjectId } = require("./objectid");

const { resolve } = require("path");

const defaultId = {
  type: String,
  default: () => new ObjectId().toString(),
  required: true,
};
const schemas = {};

/**
 * Create a new Schema
 *
 * @name Schema
 * @function
 * @param {String} model
 * @param {Object} schema
 * @param {String} path
 * @returns {Methods}
 */
function Schema(model, schema = { _id: defaultId }, path) {
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
    ...Methods(schema, databasePath, schemas),
  };
}

module.exports = Schema;

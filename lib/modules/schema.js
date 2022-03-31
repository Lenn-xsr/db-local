const Methods = require("./methods");
const { ObjectId } = require("./objectid");

const { resolve } = require("path");

const defaultId = { default: new ObjectId().toString(), required: true };
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

  if (
    ![Number, String].includes(schema._id.type) ||
    (schema?._id?.type === Number && !schema?._id?.default)
  )
    schema._id.type = String;

  if (!schema._id.required || !schema._id.default)
    Object.assign(schema._id, defaultId);

  const databasePath = resolve(`${path}/${model}.json`);

  schemas[model] = { path: databasePath, schema };

  return {
    ...Methods(schema, databasePath, schemas),
  };
}

module.exports = Schema;

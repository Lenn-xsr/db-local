const Methods = require("./methods");
const { resolve } = require("path");
const defaultId = { default: Date.now(), required: true };

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
function Schema(model, schema = { _id: defaultId }, path, pack) {
  if (!model)
    throw new Error("The Schema requires a name, see the documentation.");

  if (!schema._id) schema._id = defaultId;

  if (![Number, String].includes(schema._id.type)) schema._id.type = Number;

  if (!schema._id.required || !schema._id.default)
    Object.assign(schema._id, defaultId);

  const databasePath = resolve(`${path}/${model}.json`);

  return {
    ...Methods(schema, databasePath, pack),
  };
}

module.exports = Schema;

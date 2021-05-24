const { concat, verify, save, read } = require("../utils");
const { existsSync, writeFileSync } = require("fs");

/**
 * Methods of a schema
 *
 * @name Methods
 * @function
 * @param {Object} schema
 * @param {String} path
 * @returns {{create: create, update: update, remove: remove}}
 */
function Methods(schema, path, compress) {
  if (!existsSync(path)) writeFileSync(path, "[]");
  let Model = read(path, compress);

  if (!Array.isArray(Model)) Model = [];

  /**
   * Save the file back to disk.
   *
   * @name saveModel
   * @function
   * @param {Object} data The document object.
   * @param {Boolean} push Optional parameter to check if it will be set or add something to the document.
   * @returns {Object} The document object.
   */
  const saveModel = (data, push) => {
    if (push) Model.push(data);
    else {
      const objIndex = Model.findIndex((obj) => obj._id === data._id);

      if (objIndex < 0)
        throw new Error(`Could not find item id ${data._id} to save it`);

      Model[objIndex] = data;
    }

    save(path, Model, compress);

    return {
      data,
      update: (values) => update({ _id: data._id }, values),
      remove: () => remove({ _id: data._id }),
    };
  };

  /**
   * Find an object in the document
   *
   * @name find
   * @function
   * @param {String} _id Object id in the document.
   * @returns {{data, update: update, remove: remove}|null} The date object and its update and remove functions.
   */
  const find = (query) => {
    if (!query) return Model;

    let data;
    if(typeof query === "function") {
      data = Model.find(query)  
    } else {
      data = Model.find((obj) => obj._id === (typeof query === "object" ? query._id : query));
    }
    if (!data) return null;

    return {
      data,
      update: (values) => update({ _id: data._id }, values),
      remove: () => remove({ _id: data._id }),
    };
  };

  /**
   * Creates a new object for the document
   *
   * @name create
   * @function
   * @param {Object} data The document object.
   * @returns {{save: saveModel}} The `saveModel` function.
   */
  const create = (data) => {
    const exists = find(data._id)

    if (exists)
      throw new Error("Duplicate ids. The ids are unique, try another one.");

    data = verify(data, schema);
    return {
      save: () => saveModel(data, true),
    };
  };

  /**
   * Update an object in the document
   *
   * @name update
   * @function
   * @param {String} _id Object id in the document.
   * @param {Object} values The values ​​to be updated.
   * @returns {{save: saveModel}|null} The `saveModel` function.
   */
  const update = ({ _id }, values) => {
    if (values === undefined)
      throw new Error(
        "The update function requires arguments, see the documentation."
      );

    const index = Model.findIndex((obj) => obj._id === _id);
    if (index < 0) return;

    const data = concat(Model[index], values, schema);

    return {
      save: () => saveModel(data, false),
    };
  };

  /**
   * Remove an object in the document
   *
   * @name remove
   * @function
   * @param {String} _id Object id in the document.
   */
  const remove = ({ _id }) => {
    const filtered = Model.filter((obj) => obj._id !== _id);
    Model = filtered;
    save(path, Model, compress);
  };

  return {
    create,
    find,
    remove,
    update,
  };
}

module.exports = Methods;
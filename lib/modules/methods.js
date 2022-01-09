const { concat, verify, save, read } = require("../utils");
const { existsSync, writeFileSync } = require("fs");

/**
 * Methods of a schema
 *
 * @name Methods
 * @function
 * @param {Object} schema
 * @param {String} path
 * @returns {{create: create, update: update, remove: remove, replaceModel: replaceModel}}
 */
function Methods(schema, path) {
  if (!existsSync(path)) writeFileSync(path, "[]");
  let Model = read(path);

  if (!Array.isArray(Model)) Model = [];

  /**
   * Returns the values ​​along with the functions to modify the same.
   *
   * @name dataWithProperties
   * @function
   * @returns {{update: update, remove: remove, save: saveModel}} The date object and its update and remove functions.
   */
  const dataWithProperties = (data) => {
    const getPropertyConfig = (val) => ({
      get: () => val,
      enumerable: false,
      configurable: true,
    });

    Object.defineProperties(data, {
      update: getPropertyConfig((values) => update({ _id: data._id }, values)),
      remove: getPropertyConfig(() => remove({ _id: data._id })),
      save: getPropertyConfig(() => saveModel(data, false)),
    });

    return data;
  };

  /**
   * Save the file back to disk.
   *
   * @name saveModel
   * @function
   * @param {Object} data The document object.
   * @param {Boolean} push Optional parameter to check if it will be set or add something to the document.
   * @returns {dataWithProperties} The document object.
   */
  const saveModel = (data, push) => {
    if (push) Model.push(data);
    else {
      const objIndex = Model.findIndex((obj) => obj._id === data._id);

      if (objIndex < 0)
        throw new Error(`Could not find item id ${data._id} to save it`);

      Model[objIndex] = data;
    }

    save(path, Model);

    return dataWithProperties(data);
  };

  /**
   * Find an object in the document
   *
   * @name find
   * @function
   * @returns {dataWithProperties}
   */
  const find = (query) => {
    if (query == undefined) return Model;

    let data;
    if (typeof query === "function") {
      data = Model.find(query);
    } else {
      data = Model.find(
        (obj) => obj._id === (typeof query === "object" ? query._id : query)
      );
    }
    if (!data) return null;

    return dataWithProperties(data);
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
    const exists = Model.find((obj) => obj._id == data._id);

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

    const doc = find(_id);

    if (!doc)
      throw new Error("Document not found, update could not be performed.");

    const data = concat(doc, values, schema);

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
    save(path, Model);
  };

  /**
   * Replaces the current data of a Model
   *
   * @name replaceModel
   * @function
   * @param {Object} data The new document to set.
   */
  const replaceModel = (data) => {
    if (!data)
      console.warn(
        "[db-local] No data was entered to replace the current one, an empty array was defined by default"
      );

    if (data && !Array.isArray(data))
      throw new Error(`The data must be of type Array`);

    Model = data ? data : [];
    save(path, Model);
  };

  return {
    find,
    create,
    remove,
    update,
    replaceModel,
  };
}

module.exports = Methods;

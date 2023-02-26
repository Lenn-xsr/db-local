const {
  concat,
  verifySchema,
  checkObjectReferences,
  filterWithOperator,
  filterOperators,
  getInstance,
  createProperties,
  save,
  read
} = require('../utils');
const { existsSync, writeFileSync } = require('fs');

/**
 * It returns an object with functions to manipulate the data in the document
 * @param {Object} schema - The schema of the model.
 * @param {String} path - The path to the file where the data will be stored.
 * @param {Array} schemas - The schemas of the models.
 * @param {Boolean} readOnFind - If true, the file will be read every time you call the find function.
 * @returns an object with the functions `find`, `create`, `remove`, `update` and `replaceModel`.
 */
function Methods(schema, path, schemas, readOnFind) {
  if (!existsSync(path)) writeFileSync(path, '[]');
  let Model = read(path);

  if (!Array.isArray(Model)) Model = [];

  /**
   * It takes a data object and returns the same data object with some properties added to it
   * @returns The dataWithProperties function is being returned.
   */
  const dataWithProperties = data => {
    const isArray = Array.isArray(data);
    const defineProperties = _data =>
      createProperties(_data, {
        update: values => update({ _id: _data._id }, values),
        remove: () => remove({ _id: _data._id }),
        save: () => saveModel(_data, false)
      });

    if (isArray) return data.map(data => defineProperties(data));
    else return defineProperties(data);
  };

  /**
   * It saves a model to a file
   * @param data - The data to save
   * @param {Boolean} push - If true, the data will be pushed to the Model array. If false, the data will
   * be updated in the Model array.
   * @returns The dataWithProperties function is being returned.
   */
  const saveModel = (data, push) => {
    data = verifySchema(data, schema);

    if (push) Model.unshift(data);
    else {
      const objIndex = Model.findIndex(obj => obj._id === data._id);

      if (objIndex < 0)
        throw new Error(`Could not find item id ${data._id} to save it`);

      Model[objIndex] = data;
    }

    save(path, Model);

    return dataWithProperties(data);
  };

  /**
   * It takes a query and a reference, and returns an array of objects that match the query
   * @param query - The query
   * @param ref - The reference
   * @returns The find function is being returned.
   */
  const find = (query, ref) => {
    let findedData = [];

    const queryType = getInstance(query);

    if (readOnFind) Model = read(path, true);

    const defaultAction = () => Model.find(obj => obj._id === query);
    const operator = filterOperators(query);

    const getAction = {
      function: () => {
        if (!ref) return Model.filter(query);
        else {
          const queryReferences = Model.filter(query).map(data => {
            const reference = checkObjectReferences(ref, schemas, data);
            return Object.assign(data, reference);
          });

          return queryReferences;
        }
      },
      object: () => {
        const queryParams =
          operator.rest &&
          Object.entries(operator.rest).some(
            param => getInstance(param[1]) !== 'object'
          );

        if (queryParams) {
          let findedData = Model || [];

          for (var filter of Object.entries(operator.rest)) {
            const [key, value] = filter;
            const valueType = getInstance(value);

            if (['object', 'function'].includes(valueType)) continue;

            findedData = findedData.filter(obj => obj[key] === value);
          }

          for (var data of findedData) {
            const queryReferences = checkObjectReferences(query, schemas, data);
            Object.assign(data, queryReferences);
          }

          return findedData;
        } else {
          const queryReferences = Model.filter(data => {
            const reference = checkObjectReferences(query, schemas, data);
            Object.assign(data, reference);
          });

          return queryReferences;
        }
      },
      string: defaultAction,
      number: defaultAction
    };

    const data = getAction[queryType]();

    if (
      ['undefined', 'null'].includes(queryType) ||
      (queryType === 'object' && !Object.keys(query)?.length)
    )
      findedData = Model;
    else if (!data) return [];
    if (operator.data) findedData = filterWithOperator(data, operator.data);

    return dataWithProperties(findedData);
  };

  const findOne = (query, ref) => {
    const data = find(query, ref);

    if (!data) return undefined;

    const isArray = Array.isArray(data);

    return isArray ? data[0] : data;
  };

  /**
   * It creates a new object, checks if it already exists, and then saves it.
   * @returns An object with a save method.
   */
  const create = data => {
    const exists = Model.find(obj => obj._id === data._id);

    if (exists)
      throw new Error('Duplicate ids. The ids are unique, try another one.');

    data = verifySchema(data, schema);

    return {
      save: () => saveModel(data, true)
    };
  };

  /**
   * It takes a query and values, finds the document, concatenates the values to the document, and
   * returns a save function.
   * @param query - The query to find the document.
   * @param values - The values to update the document with.
   * @returns An object with a save function.
   */
  const update = (query, values) => {
    if (values === undefined)
      throw new Error(
        'The update function requires arguments, see the documentation.'
      );

    const doc = find(query)?.[0];

    if (!doc)
      throw new Error('Document not found, update could not be performed.');

    const data = concat(doc, values, schema);

    return {
      save: () => saveModel(data, false)
    };
  };

  /**
   * Remove an object in the document
   *
   * @name remove
   * @param {String|Number|Object|Function} query The query to find the object.
   */
  const remove = query => {
    const queryType = getInstance(query);

    if (readOnFind) Model = read(path, true);

    const defaultAction = () => Model.filter(obj => obj._id !== query);

    const getAction = {
      function: () => Model.filter(obj => !query(obj)),
      object: () => {
        const queryParams = Object.entries(query)?.[0];
        return Model.filter(
          obj => obj?.[queryParams?.[0]] !== queryParams?.[1]
        );
      },
      string: defaultAction,
      number: defaultAction
    };

    Model = getAction[queryType]();

    save(path, Model);
  };

  /**
   * Replaces the current data of a Model
   * BETA VERSION
   *
   * @name replaceModel
   * @param {Object} data The new document to set.
   */
  const replaceModel = data => {
    if (!data)
      console.warn(
        '[db-local] No data was entered to replace the current one, an empty array was defined by default'
      );

    if (data && !Array.isArray(data))
      throw new Error('The data must be of type Array');

    Model = data ? data : [];
    save(path, Model);
  };

  return {
    find,
    findOne,
    create,
    remove,
    update,
    replaceModel
  };
}

module.exports = Methods;

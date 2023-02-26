const { writeFileSync } = require('fs');

/**
 * Returns the class of a value.
 * @param {*} value - The value to be verified.
 * @returns {string} The value class.
 */
function getInstance(value) {
  const type = typeof value;

  return type === 'object' || type === 'function'
    ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
    : type;
}

/**
 * Check if the values of an object are in accordance with a defined scheme.
 * @param {object} obj - The object to be verified.
 * @param {object} schema - The scheme to be used to verify the object.
 * @returns {object} An object with the values of the object verified, following the defined scheme.
 * @throws {Error} If a required value is absent or not in accordance with the scheme.
 */
function verifySchema(obj, schema) {
  const defined = {};

  for (const [key, data] of Object.entries(schema)) {
    const value = obj?.[key];
    const type = typeof data === 'function' ? data : data?.type || data;

    if (!type)
      throw new Error(`The value "${key}" does not have a defined type.`);

    const instanceOfValue = getInstance(value);
    const instanceOfType = getInstance(type);
    const instanceOfTypeFunction =
      instanceOfType === 'function' && getInstance(type());

    if (['null', 'undefined'].includes(instanceOfType))
      throw new Error(`The value "${key}" has an invalid type.`);

    const hasDefault = data?.default !== undefined;
    const hasNullable = data?.nullable !== undefined;
    const isUndefinedOrNull = ['undefined', 'null'].includes(instanceOfValue);

    if (instanceOfValue === 'undefined') {
      if (!hasDefault && data?.required)
        throw new Error(`The value "${key}" is required.`);

      if (hasDefault)
        defined[key] =
          typeof data.default === 'function' ? data.default() : data.default;
      else defined[key] = undefined;

      continue;
    }

    if (instanceOfValue === 'null' && !hasNullable)
      throw new Error(`The value "${key}" cannot be null.`);

    if (data?.enum && !data.enum.includes(value))
      throw new Error(
        `The value "${key}" must be one of the following values: ${data.enum.join(
          ', '
        )}.`
      );

    switch (instanceOfType) {
      case 'function': {
        if (
          instanceOfTypeFunction &&
          instanceOfValue !== instanceOfTypeFunction
        )
          throw new Error(
            `The value "${key}" must be an instance of ${type.name}.`
          );
        else defined[key] = value;
        break;
      }
      case 'object': {
        if (!isUndefinedOrNull) defined[key] = verifySchema(value, type);
        break;
      }
      case 'array': {
        if (instanceOfValue === 'array')
          defined[key] = value.map(item => {
            const instanceOfItem = getInstance(item);
            const instanceOfTypeItem = getInstance(
              typeof type[0] === 'function' ? type[0]() : type[0]?.type()
            );

            if (instanceOfItem === 'object') return verifySchema(item, type[0]);

            if (instanceOfItem !== instanceOfTypeItem && !type[0]?.nullable)
              throw new Error(
                `The value "${key}" must be an Array of the type ${instanceOfTypeItem} and has received a item of type ${instanceOfItem}.`
              );

            return item;
          });
        break;
      }
      default: {
        if (instanceOfValue !== instanceOfType)
          throw new Error(
            `The value "${key}" must be an instance of ${instanceOfType}.`
          );

        defined[key] = value;
        break;
      }
    }
  }

  return defined;
}

/**
 * It takes an object, an object of entries, and a schema, and returns an object with the entries
 * merged into the object, and verified against the schema.
 * @param obj - The object to be concatenated
 * @param entries - The object you want to merge with the original object.
 * @param schema - The schema to use to verify the entries.
 * @returns the result of the verifySchema function.
 */
function concat(obj, entries, schema) {
  const defined = { ...obj };

  Object.entries(entries).forEach(r => {
    Object.entries(defined).filter(a => {
      if (a[0] === r[0] && r[1] != a[1]) defined[a[0]] = r[1];
      else if (r[0]) defined[r[0]] = r[1];
    });
  });

  return verifySchema(defined, schema);
}

/**
 * "Given an object and a string, return the value of the object's property that matches the string."
 *
 * The function takes two arguments:
 *
 * obj: The object to search.
 * string: The string to search for.
 * The function returns the value of the object's property that matches the string
 * @param obj - The object to search
 * @param string - The string to use to get the properties.
 */
const getPropertiesByString = (obj, string) =>
  string.split('.').reduce((o, i) => o?.[i], obj);

/**
 * It takes an array of objects and an object of operators and returns the filtered array of objects
 * @param data - The data you want to filter
 * @param operators - The operators you want to use to filter the data
 * @returns The data that matches the operators.
 */
function filterWithOperator(data, operators) {
  const props = (...args) => getPropertiesByString(...args);

  if (!data) return null;

  const filters = {
    $gt: (obj, key, value) => props(obj, key) > value,
    $lt: (obj, key, value) => props(obj, key) < value,
    $gte: (obj, key, value) => props(obj, key) >= value,
    $lte: (obj, key, value) => props(obj, key) <= value,
    $eq: (obj, key, value) => props(obj, key) === value,
    $neq: (obj, key, value) => props(obj, key) !== value,
    $in: (obj, key, value) => props(obj, key).includes(value),
    $nin: (obj, key, value) => !props(obj, key).includes(value),
    $regex: (obj, key, value) => props(obj, key).match(value),
    $exists: (obj, key) => props(obj, key) !== undefined
  };

  const limit = operators?.$limit;

  operators = Object.keys(operators)
    .filter(a => !['$id', '$ref'].includes(a))
    .reduce((acc, key) => {
      const data = operators[key];

      for (const operator in data) {
        const value = data[operator];

        if (
          !['object', 'undefined'].includes(typeof value) &&
          filters[operator]
        )
          acc.push({ operator, value, key });
      }

      return acc;
    }, []);

  for (var filter of operators) {
    const { operator, value, key } = filter;
    data = data.filter(obj => filters[operator](obj, key, value));
  }

  if (typeof limit === 'number' && limit >= 1) {
    if (!Array.isArray(data)) data = [data];

    if (limit === 1) {
      if (data.length) return data[0];
      else return null;
    } else return data.slice(0, limit);
  } else {
    return data;
  }
}

/**
 * It returns an object with two properties, data and rest. The data property contains all the
 * operators in the object, and the rest property contains all the non-operators
 * @returns An object with two properties: data and rest.
 */
function filterOperators(data) {
  const filter = index => {
    const notOperators = ['$id', '$ref'];
    const customOperators = ['$limit'];
    if (
      notOperators.includes(index) ||
      !['object', 'string'].includes(typeof data)
    )
      return false;

    if (customOperators.includes(index)) return true;
    else if (typeof data[index] === 'string') return data[index].includes('$');
    else if (typeof data[index] === 'object')
      return Object.keys(data[index]).some(
        index => index.includes('$') && !notOperators.includes(index)
      );
  };

  if (typeof data !== 'object')
    return {
      data: false,
      rest: data
    };

  const operators = Object.keys(data).filter(filter);
  const notOperators = Object.keys(data).filter(index => !filter(index));

  const result = {
    data: operators.length ? {} : false,
    rest: notOperators.length ? {} : false
  };

  for (var operator of operators) result.data[operator] = data[operator];
  for (var rest of notOperators) result.rest[rest] = data[rest];

  return result;
}

/**
 * It takes an object, a schema, and a base data object, and returns an object with the same keys as
 * the original object, but with the values replaced with the data from the schema
 * @param obj - The object that contains the references
 * @param schemas - The schemas object
 * @param baseData - The data that will be used to find the references
 * @returns An object with the key being the name of the property and the value being the data.
 */
function checkObjectReferences(obj, schemas, baseData) {
  const defined = {};

  for (const key of Object.keys(obj)) {
    if (obj[key]?.$ref && obj[key]?.$id) {
      const { $id, $ref } = obj[key];
      const refSchema = schemas[$ref];
      const model = read(refSchema.path);
      let propertyRef, data;

      const multipleFind = obj =>
        Array.isArray(propertyRef)
          ? propertyRef.includes(obj._id)
          : obj._id === propertyRef;

      const defaultAction = id => model.find(obj => obj._id === id);

      if (!refSchema) throw new Error(`The "${$ref}" schema is not defined`);

      if (
        typeof $id === 'number' ||
        (typeof $id === 'string' && !$id.includes('$data'))
      ) {
        data = defaultAction($id);
      } else {
        propertyRef = getPropertiesByString(
          baseData,
          typeof $id === 'string' ? $id?.replace('$data.', '') : $id.$data
        );

        data =
          model[Array.isArray(propertyRef) ? 'filter' : 'find'](multipleFind);
      }

      const operators = filterOperators(obj[key]);

      defined[key] = operators.data
        ? filterWithOperator(data, operators.data)
        : data;
    }
  }

  return defined;
}

/**
 * It takes an object and a set of properties, and then creates those properties on the object
 * @param data - The object you want to add the properties to.
 * @param properties - An object containing the properties to be added to the data object.
 * @returns The data object with the properties added to it.
 */
function createProperties(data, properties) {
  const getPropertyConfig = val => ({
    get: () => val,
    enumerable: false,
    configurable: true
  });

  for (var property of Object.entries(properties)) {
    const [key, value] = property;
    const valueType = getInstance(value);

    if (valueType === 'function')
      properties[key] = getPropertyConfig(value.bind(data));
    else properties[key] = getPropertyConfig(value);
  }

  Object.defineProperties(data, properties);

  return data;
}

/**
 * It reads a file and returns the contents of the file.
 * @param path - The path to the file you want to read.
 * @param clear - If true, the module will be reloaded.
 * @returns The function read is being returned.
 */
const read = (path, clear) => {
  if (clear) delete require.cache[require.resolve(path)];
  return require(path);
};

/**
 * It takes a path and content, writes the content to the path, and returns the content
 * @param path - The path to the file you want to save.
 * @param content - The content to be saved.
 * @returns The content.
 */
const save = (path, content) => {
  writeFileSync(path, JSON.stringify(content));
  return content;
};

module.exports = {
  verifySchema,
  checkObjectReferences,
  getPropertiesByString,
  filterWithOperator,
  filterOperators,
  createProperties,
  getInstance,
  concat,
  save,
  read
};

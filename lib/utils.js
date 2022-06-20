const { writeFileSync } = require("fs");

/**
 * It takes an object and a schema, and returns an object with the same keys as the schema, but with
 * the values of the object, or the default values of the schema
 * @param obj - The object to be verified
 * @param schema - The schema object that defines the structure of the object.
 * @returns The return value is an object with the same keys as the schema, but with the values being
 * the values of the object passed in.
 */
const verifySchema = (obj, schema) => {
  const defined = {};
  for (const key of Object.keys(schema)) defined[key] = null;

  for (const key of Object.keys(defined)) {
    let { required, type } = schema[key];

    if (!type && typeof schema[key] === "function") type = schema[key];

    if (
      required &&
      obj?.[key] === undefined &&
      (schema[key]?.default === undefined || obj?.[key] === null)
    )
      throw Error(
        `The "${key}" value is required, it cannot be undefined or null`
      );

    if (
      obj?.[key] &&
      typeof obj?.[key] == "object" &&
      !Array.isArray(obj?.[key]) &&
      Object.keys(obj?.[key]).length &&
      !type
    )
      defined[key] = verifySchema(obj[key], schema[key]);
    else if (typeof obj?.[key] !== "object")
      defined[key] =
        obj?.[key] !== undefined
          ? type(obj?.[key])
          : type
          ? type()
          : verifySchema(obj?.[key], schema?.[key]);
    else if (obj?.[key])
      defined[key] = Object.entries(obj?.[key])[0]
        ? type === Array && Array.isArray(obj?.[key])
          ? obj?.[key]
          : type(Object.assign({}, obj?.[key]))
        : type();

    if (
      (schema[key]?.default && obj?.[key] === undefined) ||
      obj?.[key] === null
    )
      defined[key] =
        typeof schema[key].default === "function"
          ? schema[key].default()
          : schema[key].default;
  }

  return defined;
};

/**
 * It takes an object, an object of entries, and a schema, and returns an object with the entries
 * merged into the object, and verified against the schema.
 * @param obj - The object to be concatenated
 * @param entries - The object you want to merge with the original object.
 * @param schema - The schema to use to verify the entries.
 * @returns the result of the verifySchema function.
 */
const concat = (obj, entries, schema) => {
  const defined = { ...obj };
  Object.entries(entries).forEach(r => {
    Object.entries(defined).filter(a => {
      if (a[0] === r[0] && r[1] != a[1]) defined[a[0]] = r[1];
      else if (r[0]) defined[r[0]] = r[1];
    });
  });
  return verifySchema(defined, schema);
};

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
  string.split(".").reduce((o, i) => o?.[i], obj);

/**
 * It takes an array of objects and an object of operators and returns the filtered array of objects
 * @param data - The data you want to filter
 * @param operators - The operators you want to use to filter the data
 * @returns The data that matches the operators.
 */
const filterWithOperator = (data, operators) => {
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
    .filter(a => !["$id", "$ref"].includes(a))
    .reduce((acc, key) => {
      const data = operators[key];

      for (const operator in data) {
        const value = data[operator];

        if (
          !["object", "undefined"].includes(typeof value) &&
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

  if (typeof limit === "number" && limit >= 1) {
    if (!Array.isArray(data)) data = [data];

    if (limit === 1) {
      if (data.length) return data[0];
      else return null;
    } else return data.slice(0, limit);
  } else {
    return data;
  }
};

/**
 * It returns an object with two properties, data and rest. The data property contains all the
 * operators in the object, and the rest property contains all the non-operators
 * @returns An object with two properties: data and rest.
 */
const filterOperators = data => {
  const filter = index => {
    const notOperators = ["$id", "$ref"];
    const customOperators = ["$limit"];
    if (
      notOperators.includes(index) ||
      !["object", "string"].includes(typeof data)
    )
      return false;

    if (customOperators.includes(index)) return true;
    else if (typeof data[index] === "string") return data[index].includes("$");
    else if (typeof data[index] === "object")
      return Object.keys(data[index]).some(
        index => index.includes("$") && !notOperators.includes(index)
      );
  };

  if (typeof data !== "object")
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
};

/**
 * It takes an object, a schema, and a base data object, and returns an object with the same keys as
 * the original object, but with the values replaced with the data from the schema
 * @param obj - The object that contains the references
 * @param schemas - The schemas object
 * @param baseData - The data that will be used to find the references
 * @returns An object with the key being the name of the property and the value being the data.
 */
const checkObjectReferences = (obj, schemas, baseData) => {
  const defined = {};

  for (const key of Object.keys(obj)) {
    if (obj[key]?.$ref && obj[key]?.$id) {
      const { $id, $ref } = obj[key];
      const refSchema = schemas[$ref];
      const model = read(refSchema.path);
      let propertieRef, data;

      const multipleFind = obj =>
        Array.isArray(propertieRef)
          ? propertieRef.includes(obj._id)
          : obj._id === propertieRef;

      const defaultAction = id => model.find(obj => obj._id === id);

      if (!refSchema) throw new Error(`The "${$ref}" schema is not defined`);

      if (
        typeof $id === "number" ||
        (typeof $id === "string" && !$id.includes("$data"))
      ) {
        data = defaultAction($id);
      } else {
        propertieRef = getPropertiesByString(
          baseData,
          typeof $id === "string" ? $id?.replace("$data.", "") : $id.$data
        );

        data =
          model[Array.isArray(propertieRef) ? "filter" : "find"](multipleFind);
      }

      const operators = filterOperators(obj[key]);

      defined[key] = operators.data
        ? filterWithOperator(data, operators.data)
        : data;
    }
  }

  return defined;
};

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
  concat,
  verifySchema,
  checkObjectReferences,
  getPropertiesByString,
  filterWithOperator,
  filterOperators,
  save,
  read
};

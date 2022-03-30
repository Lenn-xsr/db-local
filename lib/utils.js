const { writeFileSync } = require("fs");

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
      defined[key] = schema[key].default;
  }

  return defined;
};

const concat = (obj, entries, schema) => {
  const defined = { ...obj };
  Object.entries(entries).forEach((r) => {
    Object.entries(defined).filter((a) => {
      if (a[0] === r[0] && r[1] != a[1]) defined[a[0]] = r[1];
      else if (r[0]) defined[r[0]] = r[1];
    });
  });
  return verifySchema(defined, schema);
};

const getPropertiesByString = (obj, string) =>
  string.split(".").reduce((o, i) => o?.[i], obj);

const checkObjectReferences = (obj, schemas, baseData) => {
  const defined = {};
  for (const key of Object.keys(obj)) {
    if (obj[key]?.$ref && obj[key]?.$id) {
      const { $id, $ref } = obj[key];
      const defaultAction = (id) => schema.find((obj) => obj._id === id);
      let propertieRef;

      if (!schemas[$ref])
        throw new Error(`The "${$ref}" schema is not defined`);

      const schema = read(schemas[$ref].path);

      const getRefObject = {
        string: () => {
          if ($id?.includes("$data")) {
            propertieRef = getPropertiesByString(
              baseData,
              $id?.replace("$data.", "")
            );
            return schema.find((obj) => obj._id == propertieRef);
          } else {
            return defaultAction($id);
          }
        },
        object: () => {
          propertieRef = getPropertiesByString(baseData, $id.$data);
          return schema.find((obj) => obj._id === propertieRef);
        },
        number: () => defaultAction($id),
      };

      defined[key] = getRefObject[typeof $id]();
    }
  }

  return defined;
};

const read = (path) => {
  return require(path);
};

const save = (path, content) => {
  writeFileSync(path, JSON.stringify(content));
  return content;
};

module.exports = { concat, verifySchema, save, read, checkObjectReferences };

const { writeFileSync } = require("fs");

const verify = (obj, schema) => {
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
      defined[key] = verify(obj[key], schema[key]);
    else if (typeof obj?.[key] !== "object")
      defined[key] =
        obj?.[key] !== undefined
          ? type(obj?.[key])
          : type
          ? type()
          : verify(obj?.[key], schema?.[key]);
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
  return verify(defined, schema);
};

const read = (path) => {
  return require(path);
};

const save = (path, content) => {
  writeFileSync(path, JSON.stringify(content));
  return content;
};

module.exports = { concat, verify, save, read };

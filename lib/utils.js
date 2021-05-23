const { writeFileSync, readFileSync } = require("fs");
const { pack, unpack } = require("jsonpack");

const verify = (obj, schema) => {
  const defined = {};
  for (const key of Object.keys(schema)) defined[key] = null;

  for (const key of Object.keys(defined)) {
    const { required, type } = schema[key];

    if (
      (required &&
        obj[key] === undefined &&
        schema[key].default === undefined) ||
      obj[key] === null
    ) {
      throw Error(
        `The "${key}" value is required, it cannot be undefined or null`
      );
    }

    if (typeof obj[key] !== "object")
      defined[key] = obj[key] !== undefined ? type(obj[key]) : type();
    else if (obj[key])
      defined[key] = Object.entries(obj[key])[0]
        ? type === Array && Array.isArray(obj[key])
          ? obj[key]
          : type(Object.assign({}, obj[key]))
        : type();

    if ((schema[key].default && obj[key] === undefined) || obj[key] === null)
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

const read = (path, compressContent) => {
  let data = JSON.parse(readFileSync(path, { encoding: "utf-8" }));

  if (
    (typeof data == "string" && !compressContent) ||
    (compressContent && typeof data == "string")
  )
    data = unpack(data);

  return data;
};

const save = (path, content, compressContent) => {
  if (compressContent) content = pack(content);

  writeFileSync(path, JSON.stringify(content, null, 2));
};

module.exports = { concat, verify, save, read };

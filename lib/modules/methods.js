const { concat, verify, save, read } = require("../utils");
const { existsSync, writeFileSync } = require("fs");

module.exports = function Methods(schema, path) {
  if (!existsSync(path)) writeFileSync(path, "{}")
  const Model = read(path);

  if (!Array.isArray(Model.data)) Model.data = [];

  const saveModel = (data, push) => {
    if (push) Model.data.push(data);
    else {
      const objIndex = Model.data.findIndex((obj) => obj._id === data._id);

      if (objIndex < 0)
        throw new Error(`Could not find item id ${data._id} to save it`);

      Model.data[objIndex] = data;
    }

    save(path, Model);
    return data;
  };

  const create = (data) => {
    const exists = Model.data.find((obj) => obj._id == data._id);

    if (exists)
      throw new Error("Duplicate ids. The ids are unique, try another one.");

    data = verify(data, schema);
    return {
      save: () => saveModel(data, true),
    };
  };

  const update = ({ _id }, values) => {
    if (values === undefined)
      throw new Error(
        "The update function requires arguments, see the documentation."
      );

    const index = Model.data.findIndex((obj) => obj._id === _id);
    if (index < 0) return null;

    const data = concat(Model.data[index], values, schema);

    return {
      save: () => saveModel(data, false),
    };
  };

  const find = ({ _id } = {}) => {
    if (!_id) return Model.data;

    const data = Model.data.find((obj) => obj._id === _id);
    if (!data) return null;

    return {
      data,
      update: (values) => update({ _id }, values),
      remove: () => remove({ _id }),
    };
  };

  const remove = ({ _id }) => {
    const filtered = Model.data.filter((obj) => obj._id !== _id);

    Model.data = filtered;
    save(path, Model);

    return true;
  };

  return {
    create,
    find,
    remove,
    update,
  };
};

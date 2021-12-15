"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const fs_1 = require("fs");
/**
 * Methods of a schema
 *
 * @name Methods
 * @function
 * @param {Object} schema
 * @param {String} path
 * @returns {{create: create, update: update, remove: remove}}
 */
function Methods(schema, path) {
    if (!(0, fs_1.existsSync)(path))
        (0, fs_1.writeFileSync)(path, '[]');
    let Model = (0, utils_1.read)(path);
    if (!Array.isArray(Model))
        Model = [];
    /**
     * Save the file back to disk.
     *
     * @name saveModel
     * @function
     * @param {Object} data The document object.
     * @param {Boolean} push Optional parameter to check if it will be set or add something to the document.
     * @returns {Object} The document object.
     */
    const setters = (data) => {
        const setters = {
            set: (val) => Object.assign(data, val),
        };
        for (const key of Object.keys(schema).filter((key) => key !== '_id')) {
            setters['set' + key[0].toUpperCase() + key.slice(1)] = (val) => {
                data[key] = val;
                return data;
            };
        }
        return setters;
    };
    const saveModel = (data, push) => {
        if (push)
            Model.push(data);
        else {
            const objIndex = Model.findIndex((obj) => obj._id === data._id);
            if (objIndex < 0)
                throw new Error(`Could not find item id ${data._id} to save it`);
            Model[objIndex] = data;
        }
        (0, utils_1.save)(path, Model);
        return Object.assign(data, {
            ...setters(data),
            save: () => saveModel(data, false),
            update: (values) => update({ _id: data._id }, values),
            remove: () => remove({ _id: data._id }),
        });
    };
    /**
     * Find an object in the document
     *
     * @name find
     * @function
     * @returns {{data, update: update, remove: remove}|null} The date object and its update and remove functions.
     */
    const find = (query) => {
        if (query == undefined)
            return Model;
        let data;
        if (typeof query === 'function') {
            data = Model.find(query);
        }
        else {
            data = Model.find((obj) => obj._id === (typeof query === 'object' ? query._id : query));
        }
        if (!data)
            return null;
        return Object.assign(data, {
            ...setters(data),
            update: (values) => update({ _id: data._id }, values),
            remove: () => remove({ _id: data._id }),
            save: () => saveModel(data, false),
        });
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
            throw new Error('Duplicate ids. The ids are unique, try another one.');
        data = (0, utils_1.verify)(data, schema);
        return Object.assign(data, {
            ...setters(data),
            save: () => saveModel(data, true),
        });
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
            throw new Error('The update function requires arguments, see the documentation.');
        const doc = find(_id).data;
        if (!doc)
            return;
        const data = (0, utils_1.concat)(doc, values, schema);
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
        (0, utils_1.save)(path, Model);
    };
    return {
        find,
        create,
        remove,
        update,
    };
}
exports.default = Methods;
//# sourceMappingURL=methods.js.map
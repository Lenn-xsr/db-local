"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.read = exports.save = exports.verify = exports.concat = void 0;
const fs_1 = require("fs");
const verify = (obj, schema) => {
    const defined = {};
    for (const key of Object.keys(schema))
        defined[key] = null;
    for (const key of Object.keys(defined)) {
        const { required, type } = schema[key];
        if ((required &&
            obj[key] === undefined &&
            schema[key].default === undefined) ||
            obj[key] === null) {
            throw Error(`The "${key}" value is required, it cannot be undefined or null`);
        }
        if (typeof obj[key] !== 'object')
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
exports.verify = verify;
const concat = (obj, entries, schema) => {
    const defined = { ...obj };
    Object.entries(entries).forEach((r) => {
        Object.entries(defined).filter((a) => {
            if (a[0] === r[0] && r[1] != a[1])
                defined[a[0]] = r[1];
            else if (r[0])
                defined[r[0]] = r[1];
        });
    });
    return verify(defined, schema);
};
exports.concat = concat;
const read = (path) => {
    return require(path);
};
exports.read = read;
const save = (path, content) => {
    (0, fs_1.writeFileSync)(path, JSON.stringify(content));
};
exports.save = save;
//# sourceMappingURL=utils.js.map
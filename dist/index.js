"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const schema_1 = (0, tslib_1.__importDefault)(require("./modules/schema"));
const path_1 = require("path");
/**
 * Create a new database.
 *
 * @name dbLocal
 * @constructor
 * @returns {{Schema: Schema}}
 */
function dbLocal({ path } = { path: './databases' }) {
    const databasePath = (0, path_1.resolve)(path);
    if (!(0, fs_1.existsSync)(databasePath))
        (0, fs_1.mkdirSync)(databasePath);
    return {
        Schema: (model, schema) => (0, schema_1.default)(model, schema, path),
    };
}
exports.default = dbLocal;
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const methods_1 = (0, tslib_1.__importDefault)(require("./methods"));
const path_1 = require("path");
const defaultId = { type: Number, default: Date.now(), required: true };
function Schema(model, schema, path) {
    if (!model)
        throw new Error('The Schema requires a name, see the documentation.');
    if (!schema._id)
        schema._id = defaultId;
    if (![Number, String].includes(schema._id.type))
        schema._id.type = Number;
    if (!schema._id.required || !schema._id.default)
        Object.assign(schema._id, defaultId);
    const databasePath = (0, path_1.resolve)(`${path}/${model}.json`);
    return {
        ...(0, methods_1.default)(schema, databasePath),
    };
}
exports.default = Schema;
//# sourceMappingURL=schema.js.map
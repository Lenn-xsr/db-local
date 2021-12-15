/**
 * Create a new Schema
 *
 * @name Schema
 * @function
 * @param {String} model
 * @param {Object} schema
 * @param {String} path
 * @returns {Methods}
 */
export declare type SchemaType = {
    _id?: {
        type: NumberConstructor | StringConstructor;
        required: boolean;
        default: number;
    };
    [key: string]: {
        type: any;
        default?: any;
        required?: boolean;
    };
};
declare function Schema(model: string, schema: SchemaType, path?: string): {
    find: (query: any) => any;
    create: (data: any) => any;
    remove: ({ _id }: {
        _id: any;
    }) => void;
    update: ({ _id }: {
        _id: any;
    }, values: any) => {
        save: () => any;
    };
};
export default Schema;
//# sourceMappingURL=schema.d.ts.map
/**
 * Methods of a schema
 *
 * @name Methods
 * @function
 * @param {Object} schema
 * @param {String} path
 * @returns {{create: create, update: update, remove: remove}}
 */
declare function Methods(schema: any, path: any): {
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
export default Methods;
//# sourceMappingURL=methods.d.ts.map
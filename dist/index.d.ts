/**
 * Create a new database.
 *
 * @name dbLocal
 * @constructor
 * @returns {{Schema: Schema}}
 */
declare function dbLocal({ path }?: {
    path: string;
}): {
    Schema: (model: any, schema: any) => {
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
};
export default dbLocal;
//# sourceMappingURL=index.d.ts.map
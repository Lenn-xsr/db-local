# db-local [![npm](https://img.shields.io/npm/v/db-local.svg?maxAge=3600)](https://www.npmjs.com/package/db-local) [![npm](https://img.shields.io/npm/dm/db-local.svg?maxAge=3600)](https://www.npmjs.com/package/db-local) [![npm](https://img.shields.io/npm/l/db-local.svg?maxAge=3600)](https://www.npmjs.com/package/db-local)

Local database using JSON to store data.

- **[Documentation](https://db-local.gitbook.io/docs/)**
- **[NPM Package](https://www.npmjs.com/package/db-local)**

## Installation

```bash
npm install db-local
```

## How to use

```js
const dbLocal = require("db-local")
const { Schema } = new dbLocal({ path: "./databases" })

const User = Schema("User", {
  _id: { type: Number },
  username: { type: String, required: true },
  bots: { type: Array, default: [{ name: "test" }] },
})

let user = User.find({ _id: 1 })

if (!user) user = User.create({ _id: 1, username: "lennart" }).save()

console.log(user)
// {
//   data: { _id: 1, username: "lennart", bots: [ { name: "test" } ] },
//   update: [Function: update],
//   remove: [Function: remove],
//   save: [Function: save]
// }
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)

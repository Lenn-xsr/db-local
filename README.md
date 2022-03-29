<div align="center">
	<h1>DB-Local</h1>
	<p>
		<a href="https://www.npmjs.com/package/db-local"><img src="https://img.shields.io/npm/v/db-local.svg?color=3884FF&label=npm" alt="NPM version" /></a>
	<a href="https://www.npmjs.com/package/db-local"><img src="https://img.shields.io/npm/dt/db-local.svg?color=3884FF" alt="NPM downloads" /></a>
	<a href="https://www.npmjs.com/package/db-local"><img src="https://img.shields.io/badge/dependencies-0-brightgreen?color=3884FF" alt="Dependencies" /></a>
	</p>
	<p>
		<a href="https://www.buymeacoffee.com/lenxsr" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" height="41" width="174"></a>
	</p>
	<br><br>
</div>

A local database for small to medium projects, that uses schema standardization and JSON to store data.

- **[Documentation](https://db-local.gitbook.io/docs/starting)**

- **[NPM Package](https://npmjs.com/package/db-local)**

Installation

---

```
npm install db-local
```

Creating database and schemas

---

```js
const dbLocal = require("db-local");
const { Schema } = new dbLocal({ path: "./databases" });

const User = Schema("User", {
  _id: { type: Number, required: true },
  username: { type: String, default: "Customer" },
  bag: {
    weapons: { type: Array },
  },
});
```

Creating Data

---

```js
const user = User.create({
  _id: 1,
  username: "Lennart",
  tag: "Lennart#123",
  bag: { weapons: ["bow", "katana"] },
});

user.save(); // Always run the "save" function after creating or editing a user
```

Updating Data

---

```js
user.update({ username: "Roger" });
// or
user.username = "Roger";

user.save();
```

Searching data

---

```js
User.find((user) => user.bag.weapons.length >= 2); // [ { _id: 1, username: 'Customer', bag: { weapons: [ 'bow', 'katana' ] } }, { _id: 2, username: 'Customer 2', bag: { weapons: [ 'bow', 'katana', 'javascript' ] } } ]
User.find({ _id: 1 }); // { _id: 1, username: 'Customer', bag: { weapons: [ 'bow', 'katana' ] } }
User.find(1); // { _id: 1, username: 'Customer', bag: { weapons: [ 'bow', 'katana' ] } }
```

Deleting data

---

```js
User.remove((user) => user.bag.weapons.length >= 2); // This function example removes multiple objects at once, be careful with usage.
User.remove({ _id: 1 });
User.remove(1);
```

###

## License

[MIT](
Example Usage

---

```js
const dbLocal = require("db-local");
const { Schema } = new dbLocal({ path: "./databases" });

const User = Schema("User", {
  _id: { type: Number, required: true },
  username: { type: String, default: "Rick" },
  tag: String,
  bag: {
    weapons: { type: Array },
  },
});

let user = User.find({ _id: 1 });

if (!user)
  user = User.create({
    _id: 1,
    username: "Lennart",
    tag: "Lennart#123",
    bag: { weapons: ["bow", "katana"] },
  }).save();

console.log(user); // { _id: 1, username: 'Lennart', tag: "Lennart#123" bag: { weapons: [ 'bow', 'katana' ] } }

user.update({ username: "Roger" }).save(); // { _id: 1, username: 'Roger', tag: "Lennart#123", bag: { weapons: [ 'bow', 'katana' ] } }
```

TO-DO

- [x] Make model creation more dynamic and recursive;
- [x] Replace Array Database Base to Object;
- [ ] Make it possible to create collections ( After completing the above update );

Contributing

---

Before [creating an issue](https://github.com/Lenn-xsr/db-local/issues), please ensure that it hasn't already been reported or suggested.

When [submitting a new pull request](https://github.com/Lenn-xsr/db-local/pulls), please make sure the code style/format used is the same as the one used in the original code.

License

---

Refer to the [MIT](https://choosealicense.com/licenses/mit/) file.

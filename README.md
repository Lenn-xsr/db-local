<div align="center">
	<h1>db-local</h1>
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

- **[Documentation](https://lenn.gitbook.io/db-local/)**
- **[Yarn Package](https://yarnpkg.com/package/db-local)**
- **[NPM Package](https://npmjs.com/package/db-local)**

## Installation

```sh-session
npm install db-local
yarn add db-local
```

## Example Usage

<h3>Database and Schemas</h3>

```js
const dbLocal = require("db-local");
const { Schema } = new dbLocal({ path: "./databases" });

const Creators = Schema("Creators", {
  _id: { type: Number, required: true },
  name: { type: String, default: "Customer" }
});

const User = Schema("User", {
  _id: { type: Number, required: true },
  username: { type: String, default: "Customer" },
  bag: {
    weapons: Array
  }
});
```

## <h3>Create, Search, Update and Remove data</h3>

```js
const user = User.create({
  _id: 1,
  username: "Lennart",
  tag: "Lennart#123",
  bag: { weapons: ["bow", "katana"] }
}).save();

User.find(user => user.bag.weapons.length >= 2); // Array(1)
User.find({ _id: 1 }); // Array(1)
User.find(1); // Array(1)

// Ways to get only one document

User.findOne(1); // Object
User.findOne({ _id: 1, $limit 1 }); // Object

user.update({ username: "Roger" });
user.username = "Roger"; // same as above

user.save(); // Always run the "save" function after creating or editing a user

user.remove();
User.remove(user => user.bag.weapons.length >= 2);
User.remove({ _id: 1 });
User.remove(1);
```

## Contributing

---

Before [creating an issue](https://github.com/Lenn-xsr/db-local/issues), please ensure that it hasn't already been reported or suggested.

When [submitting a new pull request](https://github.com/Lenn-xsr/db-local/pulls), please make sure the code style/format used is the same as the one used in the original code.

## License

---

Refer to the [MIT](https://choosealicense.com/licenses/mit/) file.

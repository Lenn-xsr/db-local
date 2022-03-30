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

- **[Documentation](https://lenn.gitbook.io/db-local/starting)**

- **[NPM Package](https://npmjs.com/package/db-local)**

## Installation

---

```
npm install db-local
```

### Creating database and schemas

---

```js
const dbLocal = require("db-local");
const { Schema } = new dbLocal({ path: "./databases" });

const Creators = Schema("Creators", {
  _id: { type: Number, required: true },
  name: { type: String, default: "Customer" },
});

const User = Schema("User", {
  _id: { type: Number, required: true },
  username: { type: String, default: "Customer" },
  bag: {
    weapons: { type: Array },
  },
});
```

### Creating Data

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

### Updating Data

---

```js
user.update({ username: "Roger" });
// or
user.username = "Roger";

user.save();
```

### Searching data

---

```js
User.find((user) => user.bag.weapons.length >= 2); // [ { _id: 1, username: 'Customer', bag: { weapons: [ 'bow', 'katana' ] } }, { _id: 2, username: 'Customer 2', bag: { weapons: [ 'bow', 'katana', 'javascript' ] } } ]
User.find({ _id: 1 }); // { _id: 1, username: 'Customer', bag: { weapons: [ 'bow', 'katana' ] } }
User.find(1); // { _id: 1, username: 'Customer', bag: { weapons: [ 'bow', 'katana' ] } }
```

### Searching data with other Schema references

---

The reference documents resemble the following document:

```js
{ "$ref" : <value>, "$id" : <value> }
```

> $ref
>    The `$ref` field holds the name of the Schema where the referenced document resides.
>
> $id
>    The `$id` field contains the value of the \_id field in the referenced document.

#

#### Example

```js
User.find({
  _id: 1,
  creator: { $ref: "Creators", $id: 1 },
}); // { _id: 1, username: 'Customer', bag: { weapons: [ 'bow', 'katana' ] }, creator: { _id: 2, name: 'Lennart' } }
```

In this example we use the "Creators" schema as `$ref`, looking for `_id` 2 in it.

To use the find base data, use `$data`, it returns the base value.
The `$data` can only be used in the `$id` field, for that, the `$id` can be an object with `$data` inside or just a string, starting with `$data`

We use an object reference system, so if you want to access an object, pass the path inside the string, for example:

```js
const $data = {
  a: {
    b: {
      c: 22,
      d: [1, 2, 3],
    },
  },
};

("$data.a.b.d.1"); // 2
("$data.a.b.c"); // 22
```

### Using the property $data

```js
User.find({
  _id: 1, // find base
  creator: { $ref: "Creators", $id: { $data: "creatorId" } }
  // or
  creator: { $ref: "Creators", $id: "$data.creatorId" }
})
```

### Deleting data

---

```js
User.remove((user) => user.bag.weapons.length >= 2); // This function example removes multiple objects at once, be careful with usage.
User.remove({ _id: 1 });
User.remove(1);
```

###

### Example Usage

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

## TO-DO

- [x] Make model creation more dynamic and recursive;
- [x] Replace Array Database Base to Object;
- [ ] Make it possible to create collections ( After completing the above update );

## Contributing

---

Before [creating an issue](https://github.com/Lenn-xsr/db-local/issues), please ensure that it hasn't already been reported or suggested.

When [submitting a new pull request](https://github.com/Lenn-xsr/db-local/pulls), please make sure the code style/format used is the same as the one used in the original code.

## License

---

Refer to the [MIT](https://choosealicense.com/licenses/mit/) file.

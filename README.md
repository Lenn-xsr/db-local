# local.db

In the testing phase!!

## How to use

#### Creating the Database and a Schema

```javascript
// schemas.js

const Database = require("./lib");
const { Schema } = new Database({ path: "./databases" });

/*
Schema(<MODEL NAME required>, <BASE MODEL>)

 - Examples of how a property can be set in the BASE MODEL

{
    property: { 
        type: < Number | String | Array | Object >, 
        required: < false | true >, 
        default: < Something standard according to the type of the property >
    }
}

 - Obs.: "_id" is always required <with type Number or String>, without it there is no way to search.
*/

const User = Schema("User", {
  _id: { type: Number },
  username: { type: String, required: true },
  bots: { type: Array, default: [{ name: "test" }] },
});

// In this example I will export for use, but it can be used in the same file.

module.exports = { User };
```

#### Using the created Schema

```javascript
// index.js
const { User } = require("./schemas.js");
const userFound = User.find({ _id: 1 });

if (!userFound) User.create({ _id: 1, username: "test" }).save();

console.log(userFound.data);
```

#### Methods for updating or deleting a document

```javascript
// index.js
const { User } = require("./schemas.js");

// Update a user's information using find

const userFound = User.find({ _id: 1 });
userFound.update({ username: "jorge" }).save();

// Update without find

User.update({ _id: 1 }, { username: "jorge geraldo" }).save();

// Delete a document

userFound.remove();

// or

User.remove({ _id: 1 });
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)

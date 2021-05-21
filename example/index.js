const { User } = require("./schemas.js");

const userFound = User.find({ _id: 1 });

if (!userFound) User.create({ _id: 1, username: "teste" }).save();

// Update a user's information using find

userFound.update({ username: "jorge" }).save();

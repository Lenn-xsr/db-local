const { User } = require("./schemas.js");

const user = User.find({ _id: 2 });

if (!user) User.create({ _id: 2, username: "teste" }).save();

console.log(user);

const dbLocal = require("../lib/index.js");
const { Schema } = new dbLocal({ path: "./databases" });

const User = Schema("User", {
  _id: { type: Number },
  username: { type: String, required: true },
});

let user = User.find({ _id: 1 });
if (!user) user = User.create({ _id: 1, username: "lennart" }).save();

console.log(user);

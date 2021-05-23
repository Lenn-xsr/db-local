const dbLocal = require("../lib");
const { Schema } = new dbLocal({ path: "./databases", pack: true });

const User = Schema("User", {
  _id: { type: Number },
  username: { type: String, required: true },
  bots: { type: Array, default: [{ name: "test" }] },
});

const user = User.find({ _id: 2 });
if (!user) User.create({ _id: 2, username: "test" }).save();

console.log(user);

const dbLocal = require("db-local");
const { Schema } = new dbLocal({ path: "./databases", compress: true });

const User = Schema("User", {
  _id: { type: Number },
  username: { type: String, required: true },
  bots: { type: Array, default: [{ name: "test" }] },
});

let user = User.find({ _id: 1 });
if (!user) User.create({ _id: 1, username: "test" }).save();

console.log(user);

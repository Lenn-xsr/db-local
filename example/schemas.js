const LocalDB = require("../lib");
const { Schema } = new LocalDB({ path: "./databases" });

const User = Schema("User", {
  _id: { type: Number, required: false },
  username: { type: String, required: true },
  bots: { type: Array, default: [{ name: "test" }] },
});

module.exports = { User };

const dbLocal = require("../lib/index.js")
const { Schema } = new dbLocal({ path: "./databases" })

const User = Schema("User", {
  _id: { type: Number },
  username: { type: String, required: true },
  Tag: { type: Number },

})

let user = User.find({ _id: 2221 })
if (!user) user = User.create({ _id: 2221, username: "lennart" }).save()

user
  .set({
    username: "acnologia"
  })
  .save()
console.log(user.username)

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PersonSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  username: {
    type: String,
  },
  profilepic: {
    type: String,
    default: 'https://cdn3.iconfinder.com/data/icons/avatars-round-flat/33/man5-512.png'
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = Person  = mongoose.model('myPerson', PersonSchema)
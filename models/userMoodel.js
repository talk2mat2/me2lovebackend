const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: { type: String, required: true }, // String is shorthand for {type: String}
  lastName: String,
  Age: Number,
  Gender: { type: String },
  county: String,
  country: String,
  Email: { type: String, required: true },
  Password: { type: String, required: true },
  state: String,
  RegisterdDate: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  offLineMessage: [{ Body: String, Sender: String }],
  Pictures: [{ url: String }],
  isVerified: { type: Boolean, default: false },
  Meta: [{ favs: String }],
});

UserSchema.methods.verifyPassword = function (Password) {
  return bcrypt.compare(Password, this.Password);
};

module.exports = mongoose.model("Users", UserSchema);

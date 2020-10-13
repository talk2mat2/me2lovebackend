const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: { type: String, required: true }, // String is shorthand for {type: String}
  lastName: String,
  Education: String,
  aboutMe: String,

  Age: Number,
  Gender: { type: String },
  interestedInMen: { type: Boolean, default: false },
  Football: { type: Boolean, default: false },
  Bassketball: { type: Boolean, default: false },
  Music: { type: Boolean, default: false },
  USA: { type: Boolean, default: false },
  nightLife: { type: Boolean, default: false },
  Religion: { type: Boolean, default: false },
  Party: { type: Boolean, default: false },
  Camping: { type: Boolean, default: false },
  Animals: { type: Boolean, default: false },
  Smoking: { type: Boolean, default: false },
  Drinking: { type: Boolean, default: false },
  interestedInWomen: { type: Boolean, default: false },
  county: String,
  country: String,
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  state: String,
  RegisterdDate: { type: Date },
  lastSeen: { type: Date, default: Date.now },
  offLineMessage: [{ Body: String, Sender: String }],
  Pictures: [{ url: String }],
  isVerified: { type: Boolean, default: false },
  Meta: [{ favs: String }],
});

UserSchema.methods.verifyPassword = async function (Password) {
  const match = await bcrypt.compare(Password, this.Password);

  if (match) {
    return true;
  } else {
    return false;
  }
};

module.exports = mongoose.model("Users", UserSchema);

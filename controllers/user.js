const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const UserSchema = require("../models/userMoodel");

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

exports.Login = async function (req, res) {
  const { Email, Password } = req.body;

  if (!validateEmail(Email)) {
    return res.status(404).json({ oops: "pls use a valid email address" });
  }

  UserSchema.findOne({ Email }, function (err, user) {
    if (err) throw err;
    if (!user) {
      res.status(404).json({
        message:
          "user with this email is not registered with us, concider registering",
      });
    } else if (user) {
      // console.log(bcrypt.compareSync(password, user.password))
      if (!user.verifyPassword(Password)) {
        res
          .status(401)
          .json({ message: "oopss! , the entered password is not correct." });
      } else {
        user.password = "****";
        return res.json({
          userdata: user,
          token: jwt.sign({ user: user }, process.env.JWTKEY, {
            expiresIn: "17520hr",
          }),
        });
      }
    }
  });
};

exports.Register = async (req, res) => {
  const { firstName, lastName, Email, Password, Password2 } = req.body;

  if (!validateEmail(Email)) {
    return res
      .status(404)
      .json({ oops: "pls use a valid email address to register" });
  }
  if (Password2 != Password) {
    return res.status(404).json({ oops: "both password dont match" });
  }
  if (!Password2 || !Password || !lastName || !firstName || !Email) {
    return res.status(404).json({ oops: "you didnt fill all values required" });
  }
  await UserSchema.findOne({ Email: Email }).then((user) => {
    if (user) {
      return res.status(401).send({
        message: `a user with email ${Email}is already registred, try to login`,
      });
    }
  });
  try {
    const RegisterdDate = Date.now;
    const Passwordhash = bcrypt.hashSync(Password, 10);
    const newUser = new UserSchema({
      firstName,
      lastName,
      Email,
      Password: Passwordhash,
      RegisterdDate,
    });
    await newUser.save();
    return res.status(200).send({ message: "account registered successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(501)
      .send({ message: "error occured pls try again or contact admin" });
  }
};

exports.UpdateUserData = async function (req, res) {
  const {
    interestedInMen,
    Football,
    Bassketball,
    Music,
    USA,
    nightLife,
    Religion,
    Party,
    Camping,
    Animals,
    Smoking,
    Drinking,
    interestedInWomen,
    firstName,
    county,
    state,
    country,
    Gender,
    lastSeen,
    lastName,
    Age,
    aboutMe,
    Education,
  } = req.body;
  const params = {
    interestedInMen,
    Football,
    Bassketball,
    Music,
    USA,
    nightLife,
    Religion,
    Party,
    Camping,
    Animals,
    Smoking,
    Drinking,
    interestedInWomen,
    firstName,
    county,
    state,
    country,
    Gender,
    lastSeen,
    lastName,
    Age,
    aboutMe,
    Education,
  };
  for (let prop in params) if (!params[prop]) delete params[prop];

  UserSchema.findByIdAndUpdate(
    { _id: req.body.id },
    {
      $set: params,
    },
    { new: true, useFindAndModify: false }
  )
    .then((user) => {
      // console.log(user);
      delete user.password.password;
      return res.json({
        userdata: user,
      });
    })
    .catch((err) => {
      res.status(401).send({ err: "an error occured,unable to send" });
    });
};

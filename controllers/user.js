const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const multer = require("multer");

const UserSchema = require("../models/userMoodel");

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

exports.Login = async function (req, res) {
  const { Email, Password } = req.body;
  if (!Password || !Email) {
    return res
      .status(404)
      .send({ message: "pls provide a valid password and email" });
  }

  if (!validateEmail(Email)) {
    return res.status(404).json({ message: "pls use a valid email address" });
  }

  UserSchema.findOne({ Email }, async function (err, user) {
    if (err) throw err;
    if (!user) {
      res.status(404).json({
        message:
          "user with this email is not registered with us, concider registering",
      });
    } else if (user) {
      console.log(Password);
      const match = await user.verifyPassword(Password);
      if (!match) {
        return res
          .status(401)
          .json({ message: "oopss! , the entered password is not correct." });
      } else {
        console.log(match);
        user.Password = "";
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
      .json({ message: "pls use a valid email address to register" });
  }
  if (Password2 != Password) {
    return res.status(404).json({ message: "both password dont match" });
  }
  if (!Password2 || !Password || !lastName || !firstName || !Email) {
    return res
      .status(404)
      .json({ message: "you didnt fill all values required" });
  }
  await UserSchema.findOne({ Email: Email }).then((user) => {
    if (user) {
      return res.status(401).send({
        message: `a user with email ${Email}is already registred, try to login`,
      });
    }
  });
  try {
    const RegisterdDate = new Date();

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

    Pictures,
    lastName,
    Age,
    aboutMe,
    Education,
  } = req.body;
  // for (values in req.body) {
  //   if (req.body[values] === "Null") return (req.body[values] = null);
  // }
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
    Pictures,
    Gender,

    lastName,
    Age,
    aboutMe,
    Education,
  };
  for (let prop in params) {
    if (
      params[prop] === "null" ||
      params[prop] === undefined ||
      params[prop] === null
    ) {
      delete params[prop];
    }
  }
  // console.log(params);
  UserSchema.findByIdAndUpdate(
    { _id: req.body.id },
    {
      $set: params,
    },
    { new: true, useFindAndModify: false }
  )
    .select("-Password")
    .then((user) => {
      return res.json({
        userdata: user,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(401).send({ err: "an error occured,unable to send" });
    });
};

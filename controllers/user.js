const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const haversine = require("haversine");

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
      const match = await user.verifyPassword(Password);
      if (!match) {
        return res
          .status(401)
          .json({ message: "oopss! , the entered password is not correct." });
      } else {
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
  const { firstName, lastName, Email, Password, Password2, Gender } = req.body;

  if (!validateEmail(Email)) {
    return res
      .status(404)
      .json({ message: "pls use a valid email address to register" });
  }
  if (Password2 != Password) {
    return res.status(404).json({ message: "both password dont match" });
  }
  if (!Password2 || !Password || !lastName || !firstName || !Email || !Gender) {
    return res.status(404).json({
      message: "oops! you didnt fill all values required,kindly try again",
    });
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
      Gender,
    });
    await newUser.save();
    return res.status(200).send({ message: "account registered successfully" });
  } catch (err) {
    console.log(err);
    return res.status(501).send({
      message: "error occured pls try again or contact admin",
      err: err,
    });
  }
};

exports.UpdateUserData = async function (req, res) {
  const {
    longitude,
    Number,
    latitude,
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
    Pictures,
    longitude,
    latitude,
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

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295; // Math.PI / 180
  var c = Math.cos;
  var a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

//search all users within
exports.searchUsers = async (req, res) => {
  // var filters = JSON.parse(req.query.filters);
  // console.log(req.query.filters);
  // const { id } = req.body.id;

  var filters = JSON.parse(req.query.filters) || {};
  var pageNo = JSON.parse(req.query.pageNo) || 0;
  const limit = 15;
  var skip = pageNo * (limit );
  var totalCount;
  console.log('pageNo',pageNo)

  var CurrentUser = await UserSchema.findById(req.body.id);
  // console.log(CurrentUser);
  // console.log(filters["$and"][0]);
 await UserSchema.countDocuments(filters,(err,count)=>{
   if(err){
    totalCount=0
   }
   else{
    totalCount=count
   }
 })
 if(totalCount==0){
  return res.status(404).send({ message: "no users found" });
 }
 
   



  UserSchema.find(filters).skip(skip).limit(limit)
    .select("-Password")
    .select("-Email")
    .select("-offLineMessage")
    .then(async (response) => {
      console.log(response.length);
      await response.map(async (user, index) => {
        if (
          user.longitude &
          user.latitude &
          CurrentUser.longitude &
          CurrentUser.latitude
        ) {
          //here we check distance of search resulte users to the current user
          const userdistance = await haversine(
            {
              latitude: CurrentUser.latitude,
              longitude: CurrentUser.longitude,
            },
            { latitude: user.latitude, longitude: user.longitude },
            { unit: "meter" }
          );
          response[index].distance = userdistance;
          // console.log(user.distance);
        }
      });
      response.totalRecords=totalCount
      return res.status(200).send({ userdata: response });
    })
    .catch((err) => {
      console.log(err);
      return res.status(404).send({ message: "no users found" });
    });
};
//fecth user details by id
exports.searchUserById = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  UserSchema.findById(id)
    .select("-Password")
    .select("-Email")
    .select("-offLineMessage")
    .then((response) => {
     
      return res.status(200).send({ userdata: response });
    })
    .catch((err) => {
      console.log(err);
      return res.status(404).send({ message: "no users found" });
    });
};

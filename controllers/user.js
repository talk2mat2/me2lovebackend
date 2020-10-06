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
       const userPassword=user.Password
       
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

exports.Register = async(req, res) => {
  const {
    firstName,
    lastName,
    Email,
    Password,
    Password2,
   
  } = req.body;


  if (!validateEmail(Email)) {
    return res.status(404).json({ oops: "pls use a valid email address to register" });
  }
  if (Password2!=Password) {
    return res.status(404).json({ oops: "both password dont match" });
  }
  if (!Password2||!Password||!lastName||!firstName||! Email) {
    return res.status(404).json({ oops: "you didnt fill all values required" });
  }
  await UserSchema.findOne({Email:Email}).then(user=>{if (user){
      return res.status(401).send({'message':`a user with email ${Email}is already registred, try to login`})
  }})
 try{ const Passwordhash=bcrypt.hashSync(Password, 10);
    const newUser= new UserSchema({firstName,lastName,Email,Password:Passwordhash})
    await newUser.save()
return res.status(200).send({message:"account registered successfully"})
}
    catch(err){
        console.log(err)
        return res.status(501).send({message:"error occured pls try again or contact admin"})
    }
  
};

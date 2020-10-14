const { LoginbyJWT } = require("../middlewares/auth");
const express = require("express");
const multer = require("multer");
const path = require("path");
const Router = express.Router();
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "martinsc",
  api_key: "724821836145235",
  api_secret: "atKrgqsSOhIobEEhOByHqeb_-tk",
});

const UserSchema = require("../models/userMoodel");
const { Login, Register, UpdateUserData } = require("../controllers/user");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/image/uploads/profilepics");
  },
  // filename: function (req, file, cb) {
  //   cb(null, file.fieldname + '-' + req.user.id+ path.extname(file.originalname))
  // }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

Router.post("/login", Login);

Router.post("/Register", Register);

Router.post("/Update", LoginbyJWT, UpdateUserData);
Router.post(
  "/Update/UploadImg",
  LoginbyJWT,
  upload.single("profilepicture"),
  (req, res) => {
    const file = req.file;
    const filter = { _id: req.body.id };
    if (!file) {
      return res.status(501).send({ error: "no image provided" });
    }
    if (file) {
      cloudinary.uploader.upload(
        path,
        { public_id: `image/${req.body.id}/${uniqueFilename}`, tags: `image` }, // directory and tags are optional
        async function (err, image) {
          if (err)
            return res.send({
              message: "unable to perfom the requested operation",
            });
          console.log("file uploaded to Cloudinary server");
          // console.log(path)
          // remove file from server
          const fs = require("fs");
          fs.unlinkSync(path);
          // return image details
          console.log(image.secure_url);

          // const profilepicture= '/image/uploads/profilepics/'+req.file.filename;

          await UserSchema.findByIdAndUpdate(
            filter,
            {
              Pictures: [image.secure_url],
            },
            { new: true, useFindAndModify: false }
          )
            .then((user) => {
              return res.json({
                userdata: user,
              });
            })
            .catch((err) => {
              console.log(err);
              res
                .status(401)
                .send({ message: "an error occured,unable to upload" });
            });
        }
      );
    }
  }
);

module.exports = Router;

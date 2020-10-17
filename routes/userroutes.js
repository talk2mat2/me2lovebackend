const { v4: uuidv4 } = require("uuid");

const { LoginbyJWT } = require("../middlewares/auth");
const express = require("express");
const multer = require("multer");
const path = require("path");
const Router = express.Router();
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEYS_CLOUD,
  api_secret: process.env.API_SECRET_CLOUD,
});
const fs = require("fs");

const UserSchema = require("../models/userMoodel");
const {
  Login,
  Register,
  UpdateUserData,
  searchUsers,
} = require("../controllers/user");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      "./upload"
      //  path.join(__dirname, "../public/image")
    );
  },
  // filename: function (req, file, cb) {
  //   cb(
  //     null,
  //     Date.now() + path.extname(file.originalname)

  // file.fieldname + "-" + `${uuidv4()}` + path.extname(file.originalname)
  // );
  // },
});

const fileFilter = async (req, file, cb) => {
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
const upload = multer({
  // dest: "public/image/uploaded",
  storage: storage,

  fileFilter: fileFilter,
});

Router.post("/login", Login);

Router.post("/Register", Register);

Router.post("/Update", LoginbyJWT, UpdateUserData);
Router.get("/searchUsers", LoginbyJWT, searchUsers);
Router.post(
  "/Update/UploadImg",
  LoginbyJWT,
  upload.single("file"),
  LoginbyJWT,
  async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    const file = req.file;

    const filter = { _id: req.body.id };
    const Path = req.file.path;

    await UserSchema.findOne(filter)
      .then((user) => {
        if (user.Pictures.length < 5) {
          if (!file) {
            return res.status(501).send({ message: "no image provided" });
          }

          // const uniqueFilename = req.user.id + req.user.firstname;

          if (file) {
            const uniqueFilename = `${uuidv4()}me2love`;

            cloudinary.uploader.upload(
              Path,
              {
                public_id: `image/${req.body.id}/${uniqueFilename}`,
                tags: `image`,
              },
              function (err, image) {
                if (err) {
                  console.log(err);
                  return res.send({
                    message: "unable to perfom the requested operation",
                  });
                }

                console.log("file uploaded to Cloudinary server");

                // remove file from server
                // const fs = require("fs");
                fs.unlinkSync(Path);
                // return image details
                // console.log(image.secure_url);

                user.Pictures.push({ url: image.secure_url });
                user.save();
                return res.status(200).send({ userdata: user });
              }
            );
          }
        } else {
          fs.unlinkSync(Path);
          return res.status(501).send({
            message: "maximum picture numbers  of 5 images reached",
          });
        }
      })
      .catch((err) => {
        console.log(err, "no user found with that user id provided");
        res.status(501).send({
          message:
            "an error occucured, unable to process your request, thats all we know",
        });
      });
  }
);

Router.delete("/image/delete/:id", LoginbyJWT, (req, res) => {
  //   const uniqueFilename = `${uuidv4()}me2love`;
  const id = req.params.id;
  const updatedId = id.split(".");
  const uniqueFilename = `${updatedId[0]}`;
  // const id = req.params;
  const values = {
    public_id: `image/${req.body.id}/${uniqueFilename}`,
    tags: `image`,
  };

  cloudinary.uploader.destroy(values.public_id, (err, success) => {
    if (err) {
      console.log(err);
      return res.status(404).send({ messge: "an error occured on the server" });
    } else {
      return res.status(200).send(success);
    }
  });
});

module.exports = Router;

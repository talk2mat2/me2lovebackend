const { LoginbyJWT } = require("../middlewares/auth");
const express = require("express");
const { Login, Register, UpdateUserData } = require("../controllers/user");

const Router = express.Router();

Router.post("/login", Login);

Router.post("/Register", Register);

Router.post("/Update", LoginbyJWT, UpdateUserData);

module.exports = Router;

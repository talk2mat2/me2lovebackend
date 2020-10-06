const {LoginbyJWT}= require ('../middlewares/auth')
const express = require('express')
const {Login,Register} = require('../controllers/user')
const { Console } = require('console')

const Router= express.Router()




Router.post('/login',Login)

Router.post('/Register',Register)





module.exports= Router
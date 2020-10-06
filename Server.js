const express = require("express");
const App = express();
const connectDB = require("./db/connection");
const cors= require('cors')
const UserRoutes= require('./routes/userroutes')



process.env.NODE_ENV !== "production" ? require("dotenv").config() : null;
connectDB();
const Port = process.env.PORT || 5000;

console.log(process.env.PORT)
App.use(cors())
App.use(express.json({extended:false}));
App.use('/api/v1',UserRoutes)
App.get('/',(req,res)=>{
    res.status(200).send({message:"welcome to me2love backend servers"})
})
App.listen(Port,()=>(console.log('server runinng ')));

const express = require("express");
const App = express();
const connectDB = require("./db/connection");
const cors= require('cors')
const UserRoutes= require('./routes/userroutes')



process.env.NODE_ENV !== "production" ? require("dotenv").config() : null;
connectDB();
const port = process.env.PORT || 5000;

App.use(cors())
App.use(express.json({extended:false}));
App.use('/api/v1',UserRoutes)
App.get('/',(req,res)=>{
    res.status(200).send({message:"welcome to me2love backend servers"})
})
app.listen(port,()=>(console.log('server runinng ')));

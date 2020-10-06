
const mongoose = require('mongoose');
// var url = "mongodb://localhost:27017/martins"
const url =`mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@cluster0-gussd.mongodb.net/tutorapp?retryWrites=true&w=majority`

const connectDB= async()=>{
 await mongoose.connect(url,{ useUnifiedTopology: true ,useNewUrlParser:true},(err,success)=>{if (err)console.log(err);
console.log('connected to remote mongodb server')} );

}

module.exports = connectDB;
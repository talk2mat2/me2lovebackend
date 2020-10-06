const mongoose = require("mongoose");
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

// var url = "mongodb://localhost:27017/martins"
const url = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@cluster0-gussd.mongodb.net/me2love?retryWrites=true&w=majority`;

const connectDB = async () => {
  await mongoose.connect( 
    url,
    { useUnifiedTopology: true, useNewUrlParser: true },
    (err, success) => {
      if (err) return console.log('error occureed, connction refused',err);
     
     
      return console.log("connected to remote mongodb server");
    }
  );
};

module.exports = connectDB;

const express = require("express");
const App = express();
const connectDB = require("./db/connection");
const cors = require("cors");
const UserRoutes = require("./routes/userroutes");
const mongoose = require("mongoose");

process.env.NODE_ENV !== "production" ? require("dotenv").config() : null;
connectDB();
const Port = process.env.PORT || 8080;

App.use(cors());
App.use(express.json({ extended: false }));
App.use("/api/v1", UserRoutes);
App.get("/", (req, res) => {
  res.status(200).send({ message: "welcome to me2love backend servers" });
});
const server = App.listen(Port, (err, successs) => {
  if (err) throw err;
  console.log(`server running on port ${Port}`);
});
const io = require("socket.io")(server);

io.on("connection", async (socket) => {
  console.log("socket cennected");
  const userId = await socket.handshake.query.Authorization;
  socket.join(userId); //joins a connected user to the general cloud room
  io.to(userId).emit("online", { status: "online" });

  //this is the message receiver and dispatcher function
  socket.on("newMsg", (data) => {
    const { msgTo, msgFrom, msgBody, msgFromId } = data;
    console.log("new message alert", msgTo);
    io.to(msgTo).emit("newMsgReceived", { msgFrom, msgBody, msgFromId });
  });
});

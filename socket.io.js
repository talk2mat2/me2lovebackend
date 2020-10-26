// // const { io } = require("./Server");
// const UserSchema = require("./models/userMoodel");

// exports.SocketIo = async (socket) => {
//   console.log("socket cennected");
//   const userId = await socket.handshake.query.Authorization;
//   // const client = io.sockets.clients();
//   // console.log(userId);

//   socket.join(userId);
//   //check if the user has offline message, and if so we send it to him and empty the message array
//   await UserSchema.findById(userId)
//     .select("-Password")
//     .select("-Email")

//     .then((response) => {
//       if (response.offLineMessage.length > 0) {
//         response.offLineMessage.map((message) => {
//           io.to(userId).emit("newMsgReceived", message);
//         });
//         response.offLineMessage = [];
//       }
//       response.isOnline = true;
//       response.save();
//     })
//     .catch((err) => {
//       console.log(err);
//     });

//   const rooms = socket.adapter.rooms;
//   // console.log(Object.keys(rooms));
//   // console.log(client.sockets.adapter);
//   //joins a connected user to the general cloud room
//   io.to(userId).emit("online", { status: "online" });

//   //this is the message receiver and dispatcher function
//   socket.on("newMsg", (data) => {
//     const { msgTo, msgFrom, msgBody, msgFromId } = data;
//     if (Object.keys(rooms).includes(msgTo)) {
//       console.log("new message alert", data);
//       io.to(msgTo).emit("newMsgReceived", { msgFrom, msgBody, msgFromId });
//     } else {
//       //if the user is offlibe we save the message to his mongo database, for delivery if he comes online
//       UserSchema.findById(msgTo)
//         .select("-Password")
//         .select("-Email")

//         .then((response) => {
//           // console.log(response);
//           response.offLineMessage.push({ msgFrom, msgBody, msgFromId });
//           response.save();
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//       console.log("the receipiant is not online");
//     }
//   });

//   socket.on("disconnect", async () => {
//     //if the user logges out the system write his status to offline at the database here
//     //so that others can see him/her as offline
//     await UserSchema.findById(userId)
//       .select("-Password")
//       .select("-Email")

//       .then((response) => {
//         response.isOnline = false;
//         response.save();
//         // console.log(response.isOnline);
//       })
//       .catch((err) => console.log(err));
//     // console.log(userId, "just left room");
//   });
// };

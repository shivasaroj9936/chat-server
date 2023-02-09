const app = require("express")();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: { origin: "*" },
});
const port = process.env.port || 3000;
users = [];
const groups = [];

io.on("connection", (socket) => {
  console.log("user connected ", socket.id);
  io.emit("users", users);
  io.emit("groupList", groups);

  socket.on("newUser", (userData) => {
    console.log("new user called..");
    userData["socketId"] = socket.id;
    users.push(userData);
    io.emit("users", users);
    console.log(users);
  });

  socket.on("isUserAvailable", (userData) => {
    console.log("isUserAvailable", users);
    isPresent = false;
    users.forEach((user) => {
      if (user.email?.toLowerCase() == userData.email?.toLowerCase()) {
        isPresent = true;
      }
    });
    io.emit("isUserAvailable", { isPresent: isPresent });
  });

  socket.on("message", (message) => {
    console.log(message, "message");
    io.emit("message", message);
  });

  socket.on("create-group", (groupDetails) => {
    socket.join(groupDetails.groupName);
    // io.in(room).emit('users', getUsers(room))
    groupDetails["groupId"] = Math.floor(Math.random() * 100000);
    groupDetails["messages"] = [];
    groupDetails["members"] = [groupDetails.createrDetails];
    groups.push(groupDetails);
    console.log(groups, "groups details");
    io.emit("groupList", groups);
  });

  socket.on("add-members", (groupDetails) => {
    console.log(groupDetails, "addd members");
    console.log(groups, "before addition");

    groups.forEach((group) => {
      if (group.groupId == groupDetails.activeGroupId) {
        group.members = groupDetails.selectedOptions;
      }
    });
    io.emit("groupList", groups);
    console.log(groups, "after addition");
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    console.log(users);
    const newUsers = users.filter((userDetails) => {
      return userDetails.socketId !== socket.id;
    });
    users = newUsers;
    console.log('new User after disconnect',users);
    io.emit("users", newUsers);
    // io.emit("groupList", groups);
  });
});

httpServer.listen(port, () => {
  // console.log(`listening on port${port}`);
});

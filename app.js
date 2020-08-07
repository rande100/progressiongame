var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));

http.listen(2000);
console.log("Server started. Listening on port 2000.");

let mob = {
  health: 15,
  maxHealth: 15
};

class Player {
  constructor() {
    this.name = "Player";
    this.health = 10;
    this.attack = 2;
    this.xp = 0;
    this.level = 1;
  }
}

// list of all connected players (key is socket ID, value is Player object)
let playerList = {};

io.on("connection", function (socket) {
  console.log("User connected. ID: " + socket.id);
  playerList[socket.id] = new Player();
  console.log("Connected users (" + playerList.length + "): " + playerList);

  // display starting stats for clients
  socket.emit("mob health update", mob.health);
  io.emit("player list update", playerList);

  socket.on("disconnect", () => {
    console.log("User disconnected. ID: " + socket.id);
    delete playerList[socket.id];
    io.emit("player list update", playerList);
  });

  socket.on("attack", () => {
    console.log("User attacked. ID: " + socket.id);

    // inflict 1 to 3 damage to the mob
    mob.health = mob.health - Math.floor(Math.random() * 4 + 1);

    // is the mob dead?
    if (mob.health <= 0) {
      // grant xp to all players
      for (let key in playerList) {
        playerList[key]["xp"]++;

        // check player xp for level-up
        if (playerList[key]["xp"] >= 10) {
          // increase player level and health
          playerList[key]["level"]++;
          playerList[key]["health"]++;

          // reset XP to 0
          playerList[key]["xp"] = 0;
        }
      }

      // generate new mob
      mob.health = mob.maxHealth;
    }

    // sync all players
    io.emit("player list update", playerList);

    // sync mob
    io.emit("mob health update", mob.health);
  });

  socket.on("player name save", function (playerName) {
    console.log("User changed name. ID: " + socket.id);
    playerList[socket.id]["name"] = playerName;
    io.emit("player list update", playerList);
  });
});

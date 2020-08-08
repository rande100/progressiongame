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

class Mob {
	constructor() {
		this.id = "";
		this.name = "";
		this.level = 0;
		this.health = 0;
	}
}

let mobList = {};

mobList["rat"] = new Mob();
mobList["rat"]["id"] = "rat";
mobList["rat"]["name"] = "Rat";
mobList["rat"]["level"] = 1;
mobList["rat"]["maxHealth"] = 5;
mobList["rat"]["health"] = mobList["rat"]["maxHealth"];

mobList["wolf"] = new Mob();
mobList["wolf"]["id"] = "wolf";
mobList["wolf"]["name"] = "Wolf";
mobList["wolf"]["level"] = 2;
mobList["wolf"]["maxHealth"] = 10;
mobList["wolf"]["health"] = mobList["wolf"]["maxHealth"];

mobList["bandit"] = new Mob();
mobList["bandit"]["id"] = "bandit";
mobList["bandit"]["name"] = "Bandit";
mobList["bandit"]["level"] = 3;
mobList["bandit"]["maxHealth"] = 20;
mobList["bandit"]["health"] = mobList["bandit"]["maxHealth"];

mobList["golem"] = new Mob();
mobList["golem"]["id"] = "golem";
mobList["golem"]["name"] = "Golem";
mobList["golem"]["level"] = 4;
mobList["golem"]["maxHealth"] = 40;
mobList["golem"]["health"] = mobList["golem"]["maxHealth"];

let mob = {};

class Player {
	constructor() {
		this.name = "Player";
		this.level = 1;
		this.health = 10;
		this.maxHealth = 10;
		this.xp = 0;
	}
}

// list of all connected players (key is socket ID, value is Player object)
let playerList = {};

io.on("connection", function (socket) {
	console.log("User connected. ID: " + socket.id);
	playerList[socket.id] = new Player();
	console.log("Connected users: " + Object.keys(playerList).length);

	// init
	socket.emit("mob list update", mobList);
	io.emit("mob update", mob);
	io.emit("player list update", playerList);

	socket.on("disconnect", () => {
		console.log("User disconnected. ID: " + socket.id);
		delete playerList[socket.id];
		io.emit("player list update", playerList);
	});

	socket.on("attack", () => {
		if (mob.health <= 0) {
			console.log("User attacked but mob is already dead. ID: " + socket.id);
			return;
		}

		console.log("User attacked. ID: " + socket.id);

		let playerDamage = 1;
		mob.health -= playerDamage;

		io.emit(
			"gamelog",
			playerList[socket.id]["name"] + " attacks " + mob.name + " for " + playerDamage + " damage."
		);

		// is the mob dead?
		if (mob.health <= 0) {
			mob.health = 0;

			io.emit("gamelog", mob.name + " dies.");

			// grant xp to all players
			for (let key in playerList) {
				playerList[key]["xp"] += 2 + mob.level;

				// check player xp for level-up
				if (playerList[key]["xp"] >= playerList[key]["level"] * 10) {
					// increase player level and health
					playerList[key]["level"]++;
					playerList[key]["maxHealth"]++;
					playerList[key]["health"] = playerList[key]["maxHealth"];
				}
			}
		}

		// sync all players
		io.emit("player list update", playerList);

		// sync mob
		io.emit("mob update", mob);
	});

	socket.on("player name save", function (playerName) {
		console.log("User changed name. ID: " + socket.id);
		playerList[socket.id]["name"] = playerName;
		io.emit("player list update", playerList);
	});

	socket.on("mob spawn", function (mobName) {
		console.log("User spawned mob. ID: " + socket.id);

		mob = Object.assign({}, mobList[mobName]);

		io.emit("mob update", mob);
	});
});

function mobAttack() {
	// is mob alive?
	if (mob.health > 0) {
		let numPlayers = Object.keys(playerList).length;
		let targetPlayerNum = Math.floor(Math.random() * numPlayers);
		let targetPlayerID = null;
		let mobDamage = 0;
		let i = 0;
		for (let key in playerList) {
			if (i === targetPlayerNum) {
				targetPlayerID = key;

				// is target player dead?
				if (playerList[key]["health"] <= 0) {
					break;
				}

				// attack target player
				mobDamage = mob.level;
				playerList[key]["health"] -= mobDamage;
				if (playerList[key]["health"] < 0) playerList[key]["health"] = 0;

				console.log("Mob attacks " + targetPlayerID + " for " + mobDamage + " damage.");
				io.emit("gamelog", mob.name + " attacks " + playerList[key]["name"] + " for " + mobDamage + " damage.");

				// sync all players
				io.emit("player list update", playerList);

				break;
			}
			i++;
		}
	}
}

setInterval(mobAttack, 3000);

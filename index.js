var PORT = process.env.PORT || 5000;
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var http = require('http');
var server = http.Server(app);

app.use(express.static('client'));
app.use(cookieParser());
server.listen(PORT, function () {
  console.log('Chat server running');
});

var io = require('socket.io')(server);


var gameNumber = 1;
var gameList = {};
var playerList = {};
app.get('/login', function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
})
function addGames(socket) {
}

io.on('connection', function (socket) {
  var cookies;


  socket.join("menu");
  socket.on('nameSet', function (msg) {
    cookies = cookie.parse(socket.handshake.headers.cookie+"");

    playerList[socket.id + ""] = { name: cookies.name, room: "menu" };
    io.emit('universalPlayerList', playerList);


  });

  io.emit('universalPlayerList', playerList);

  io.emit('addGames', gameList);



  socket.on('newGame', function (msg) {

    gameList[gameNumber + ""] = { name: msg };
    console.log(gameList);
    io.emit('addGames', gameList);
    socket.emit('joinedGame', 0);
    socket.leave("menu");
    socket.join(gameNumber);
    playerList[socket.id + ""] = { name: cookies.name, room: gameNumber + "" };

    gameList[gameNumber + ""]["players"] = [{ id: socket.id, name: cookies.name }];
    io.to(gameNumber + "").emit('playerList', gameList[gameNumber + ""]["players"]);

    gameNumber++;
    io.emit('universalPlayerList', playerList);

  });
  socket.on('message', function (msg) {
    var rooms = Object.keys(socket.rooms).filter(item => item != socket.id);
    io.to(rooms[0]).emit('message', msg);

  });
  socket.on('joinGame', function (msg) {
    socket.emit('joinedGame', 0);
    socket.leave("menu");
    socket.join(msg);
    gameList[msg + ""]["players"].push({ id: socket.id, name: cookies.name });
    playerList[socket.id + ""] = { name: cookies.name, room: msg + "" };

    io.to(msg).emit('playerList', gameList[msg + ""]["players"]);
    io.emit('universalPlayerList', playerList);

  });
  socket.on('leaveRoom', function (msg) {
    var rooms = Object.keys(socket.rooms).filter(item => item != socket.id);
    var currentRoom = playerList[socket.id + ""].room;

    playerList[socket.id + ""].room = "menu";
    socket.leave(currentRoom);
    socket.join("menu");

    socket.emit('leaveRoom', 0);
    console.log(currentRoom + " <----Current Room");
    if (gameList[currentRoom + ""] !== undefined) {
      gameList[currentRoom + ""]["players"] = gameList[currentRoom + ""]["players"].filter(item => item.id != socket.id);
      io.to(currentRoom).emit('playerList', gameList[currentRoom + ""]["players"]);
      checkLeaveRoom(currentRoom);

    }

    io.emit('addGames', gameList);

    io.emit('universalPlayerList', playerList);

  });
  socket.on('disconnect', function () {
    console.log("disconnect" + " " + socket.id);
    if (playerList[socket.id + ""] !== undefined) {
      var currentRoom = playerList[socket.id + ""].room;

      delete playerList[socket.id + ""];

      var rooms = Object.keys(socket.rooms).filter(item => item != socket.id);
      socket.leave(currentRoom);

      if (currentRoom != "menu") {
        if (gameList[currentRoom + ""] !== undefined) {

          gameList[currentRoom + ""]["players"] = gameList[currentRoom + ""]["players"].filter(item => item.id != socket.id);
          io.to(currentRoom + "").emit('playerList', gameList[currentRoom + ""]["players"]);
          checkLeaveRoom(currentRoom);
          io.emit('addGames', gameList);

        }

      }


      io.emit('universalPlayerList', playerList);
    }

  })
});
function checkLeaveRoom(roomName) {
  if (gameList[roomName + ""] !== undefined && gameList[roomName + ""]["players"].length == 0) {
    delete gameList[roomName + ""];
  }

}

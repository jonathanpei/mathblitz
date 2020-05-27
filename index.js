var PORT = process.env.PORT || 5000;
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var http = require('http');
var server = http.Server(app);

app.use(express.static('client'));
app.use(cookieParser());
server.listen(PORT, function() {
  console.log('Chat server running');
});

var io = require('socket.io')(server);


var gameNumber = 1;
var gameList = {};
var playerRoomList = {};
app.get('/login', function (req, res) {
  res.sendFile(__dirname+"/client/index.html");
})
function addGames(socket){
}

io.on('connection', function(socket) {
  socket.join("menu");
  playerRoomList[socket.id+""] = "menu";
  io.emit('addGames', gameList);



  socket.on('newGame', function(msg) {

    gameList[gameNumber+""]={name:msg};
    console.log(gameList);
    io.emit('addGames', gameList);
    socket.emit('joinedGame',0);
    socket.leave("menu");
    socket.join(gameNumber);
    playerRoomList[socket.id+""] = gameNumber;

    gameList[gameNumber+""]["players"] = [socket.id];
    gameNumber++;

  });
  socket.on('message', function(msg) {
    var rooms = Object.keys(socket.rooms).filter(item => item!=socket.id);
    io.to(rooms[0]).emit('message', msg);

  });
  socket.on('joinGame', function(msg) {
    socket.emit('joinedGame',0);
    socket.leave("menu");
    socket.join(msg);
    gameList[msg+""]["players"].push(socket.id);
    playerRoomList[socket.id+""] = msg;
  });
  socket.on('leaveRoom',function(msg){
    var rooms = Object.keys(socket.rooms).filter(item => item!=socket.id);
    var currentRoom = playerRoomList[socket.id+""];
    playerRoomList[socket.id+""] = "menu";
    socket.leave(currentRoom);
    socket.join("menu");
    socket.emit('leaveRoom',0);
    console.log(currentRoom+ " <----Current Room");
    gameList[currentRoom+""]["players"] = gameList[currentRoom+""]["players"].filter(item => item!=socket.id);
    checkLeaveRoom(currentRoom);
    io.emit('addGames', gameList);


  });
  socket.on('disconnect',function(){
    console.log("disconnect"+ " "+socket.id);
    var currentRoom = playerRoomList[socket.id+""];

    delete playerRoomList[socket.id+""];

    var rooms = Object.keys(socket.rooms).filter(item => item!=socket.id);
    socket.leave(currentRoom);
    if(currentRoom!="menu"){
      gameList[currentRoom+""]["players"] = gameList[currentRoom+""]["players"].filter(item => item!=socket.id);

      checkLeaveRoom(currentRoom);
      io.emit('addGames', gameList);
    }

  })
});
function checkLeaveRoom(roomName){
  if(gameList[roomName+""]["players"].length==0){
    delete gameList[roomName+""];
  }

}

var PORT = process.env.PORT || 5000;
var express = require('express');
var app = express();

var http = require('http');
var server = http.Server(app);

app.use(express.static('client'));

server.listen(PORT, function() {
  console.log('Chat server running');
});

var io = require('socket.io')(server);


var gameNumber = 1;
var games = [];

function addGames(socket){
}

io.on('connection', function(socket) {
  io.emit('addGames', games);



  socket.on('newGame', function(msg) {
    games.push(gameNumber);
    gameNumber++;
    io.emit('addGames', games);

  });
});




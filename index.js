var PORT = process.env.PORT || 5000;
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');

var http = require('http');
var server = http.Server(app);

app.use(express.static('client'));
app.use(cookieParser());
server.listen(PORT, function() {
  console.log('Chat server running');
});

var io = require('socket.io')(server);


var gameNumber = 1;
var games = [];
app.get('/login', function (req, res) {
  res.sendFile(__dirname+"/client/index.html");
})
function addGames(socket){
}

io.on('connection', function(socket) {
  io.emit('addGames', games);



  socket.on('newGame', function(msg) {
    games.push(gameNumber);
    gameNumber++;
    io.emit('addGames', games);

  });
  socket.on('message', function(msg) {
    io.emit('message', msg);

  });
});




var socket = io();

var form = document.getElementById("chatForm");

form.addEventListener('submit', function(e) {
  e.preventDefault();
  var input = document.querySelector('#message');
  var text = input.value;
  socket.emit('message', text);
  input.value = '';
});
$("#createGame").click(function(){
  socket.emit('newGame',0);
});
socket.on('message', function(text) {
  if (!text) {
    return;
  }
  var container = document.getElementById('chatBox');
  var newMessage = document.createElement('p');
  newMessage.innerText = text;
  container.appendChild(newMessage);

  var seperator = document.createElement('br');
  container.appendChild(seperator);

  container.scrollTop = container.scrollHeight;
});
socket.on('addGames',function(data){
  $("#games").empty();
  for(var i = 0; i<data.length; i++){
    $("#games").append("<button class='gameBtn' onclick='joinGame("+data[i]+")'>"+data[i]+"</button>")

  }
});
function joinGame(gameNum){
  socket.emit('joinGame',gameNum);
}

socket.on('joinedGame',function(data){
  hideMenu();
  showGame();
})
socket.on('menuPage',function(data){
  hideGame();
  showMenu();
})

function hideMenu(){
  $("#menu").hide();
}
function showGame(){
  $("#game").show();

}
function showMenu(){
  $("#menu").show();

}
function hideGame(){
  $("#game").hide();

}
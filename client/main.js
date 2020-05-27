var socket = io();

function promptUser () {
  let person = null;
  document.cookie = "";
  while (person == null && !document.cookie.startsWith("name")) {
    person = prompt("Please enter your name using only letters and numbers", 'Bakshar Ban Everyone Beccherla');
    if (person.includes(';')) {
      person = null;
    }
  }
  addCookie(person);
}

function addCookie (name) {
  let user = "name=" + name + "; gameId = -1";
  document.cookie = user;
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

var form = document.getElementById("chatForm");

form.addEventListener('submit', function(e) {
  e.preventDefault();
  var input = document.querySelector('#message');
  var text = input.value;
  socket.emit('message', text);
  input.value = '';
});
$("#createGame").click(function(){
  socket.emit('newGame',document.getElementById("gameName").value);
});
$("#leave").click(function(){
  socket.emit('leaveRoom',0);
});
socket.on('message', function(text) {
  if (!text) {
    return;
  }
  var container = document.getElementById('chatBox');
  var newMessage = document.createElement('p');
  var userName = getCookie("name");
  newMessage.innerText = userName + ": " + text;
  container.appendChild(newMessage);

  var seperator = document.createElement('br');
  container.appendChild(seperator);

  container.scrollTop = container.scrollHeight;
});
socket.on('addGames',function(data){
  $("#games").empty();
  for(var key in data){
    if(data.hasOwnProperty(key)){
      $("#games").append("<button class='gameBtn' onclick='joinGame("+key+")'>"+data[key+""]["name"]+"</button>")
    }
  }
});
function joinGame(gameNum){
  socket.emit('joinGame',gameNum);
}

socket.on('joinedGame',function(data){
  hideMenu();
  showGame();
})
socket.on('leaveRoom',function(data){
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

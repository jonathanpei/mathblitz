var socket = io();

function setCookie(cname,cvalue,exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  console.log(document.cookie);
}

function randomName() {
  let names = ["porcupine","hedgehog","pineapple","chicken","horse","cabbage","watermelon","dog","fish","elephant","rose","popcorn"];
  let name = names[Math.floor(Math.random() * 12)];
  let number = Math.ceil(Math.random() * 100);
  return (name.concat(number.toString()));
}

function promptUser () {
  let person = null;
  console.log(document.cookie);
  if (getCookie("name") != "") {
    socket.emit("nameSet","")
    

    putName();
    return;
  }
  while (person == null) {
    person = prompt("Please enter your name using only letters and numbers", randomName());
    if (person != null) {
      person = person.replace(/\s/g,'');
    }
    if (person != null) {
      if (person.includes(';') || person == "") {
        person = null;
      }
    }
  }
  setCookie("name",person,30);
  location.reload();
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

function putName() {
  document.getElementById("putNameHere").innerText = getCookie("name");
  document.getElementById("gameName").value = getCookie("name")+"'s game";
}

var form = document.getElementById("chatForm");

form.addEventListener('submit', function(e) {
  e.preventDefault();
  var input = document.querySelector('#message');
  var text = input.value;
  var userName = getCookie("name");
  text = userName + ": " + text;
  socket.emit('message', text);
  input.value = '';
});
$("#createGame").click(function(){
  if(document.getElementById("gameTimeLimit").value<1 || document.getElementById("gameTimeLimit").value>600) document.getElementById("gameTimeLimit").value = 60;
  if(document.getElementById("gameProblems").value<1 || document.getElementById("gameProblems").value>50) document.getElementById("gameProblems").value = 10;
  
  if(document.getElementById("ep").value<1 || document.getElementById("ep").value>15) {
    document.getElementById("ep").value = 1;
  }
  if(document.getElementById("hp").value<1 || document.getElementById("hp").value>15) {
    document.getElementById("hp").value = 15;
  }
  if(document.getElementById("hp").value<document.getElementById("ep").value) {
    document.getElementById("ep").value = 1; document.getElementById("hp").value = 15;
  }
  socket.emit('newGame',{
    name:document.getElementById("gameName").value,
    timeLimit:document.getElementById("gameTimeLimit").value,
    problems: document.getElementById("gameProblems").value,
    ep: document.getElementById("ep").value,
    hp: document.getElementById("hp").value

  });
});
$("#start").click(function(){
  socket.emit('start',0);
});
$("#leave").click(function(){
  socket.emit('leaveRoom',0);
});
$("#submitAns").click(function(){
  socket.emit('submitAns',document.getElementById("ansBox").value);
  document.getElementById("ansBox").value="";
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
  for(var key in data){
    if(data.hasOwnProperty(key)){
      $("#games").append("<button class='gameBtn' onclick='joinGame("+key+")'>"+data[key+""]["name"]+"</button>")
    }
  }
});
socket.on('playerList',function(data){
  $("#names").empty();
  for(var i = 0; i<data.length; i++){
    $("#names").append("<p>"+data[i].score+" "+data[i].name+"</p>");

  }
});
socket.on('universalPlayerList',function(data){
  $("#universalNames").empty();
  for(var key in data){
    if(data.hasOwnProperty(key) && data[key+""].room=="menu"){
      $("#universalNames").append("<p>"+data[key+""].name+"</p>");
    }
  }
});

socket.on('clock',function(data){
  if(data == 0)document.getElementById("gameTimer").style = "color:red;";
  else document.getElementById("gameTimer").style = "color:black;";

  document.getElementById("gameTimer").innerHTML = "Timer: "+data.toFixed(2);
});

socket.on('waiting',function(data){
 document.getElementById("gameTimer").style = "color:black;";
 document.getElementById("questionStatement").innerHTML = "";
 document.getElementById("questionImg").src = "";

  document.getElementById("gameTimer").innerHTML = "The Next Problem Will Start Soon";
});

socket.on('showProblem',function(data){
  document.getElementById("questionStatement").innerHTML = data;
  MathJax.Hub.Queue(["Typeset",MathJax.Hub,document.getElementById("questionStatement")]);

});
socket.on('showImage',function(data){
  document.getElementById("questionImg").src = data;
});
function joinGame(gameNum){
  socket.emit('joinGame',gameNum);
}

socket.on('joinedGame',function(data){
  hideMenu();
  showGame();
  document.getElementById("gameTimer").innerHTML = "";
  document.getElementById("questionStatement").innerHTML = "";
  document.getElementById("questionImg").src = "";


})
socket.on('leaveRoom',function(data){
  hideGame();
  showMenu();
})
socket.on('gameOver',function(data){
  document.getElementById("questionStatement").innerHTML = "Game Over";
  document.getElementById("questionImg").src = "";
  document.getElementById("gameTimer").innerHTML = "";


});

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

socket.on("console",function(msg){
  console.log(msg);
});
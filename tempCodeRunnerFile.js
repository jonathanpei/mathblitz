   gameList[currentRoom+""]["players"] = gameList[currentRoom+""]["players"].filter(item => item!=socket.id);

      checkLeaveRoom(currentRoom);
      io.em
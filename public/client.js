document.addEventListener("DOMContentLoaded", function(e) {
  var gameBoard = document.getElementById('game-board');
  window.corridorClient = new CorridorClient({
    el: gameBoard,
    gamestate: window.gamestate
  });
  corridorClient.draw();
  gameBoard.addEventListener('click', corridorClient.handleClick.bind(corridorClient));
  gameBoard.addEventListener('mousemove', corridorClient.handleMouseMove.bind(corridorClient));
});

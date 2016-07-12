document.addEventListener("DOMContentLoaded", function(e) {
  var gameBoard = document.getElementById('game-board');
  window.corridorClient = new CorridorClient({
    el: gameBoard,
    gamestate: window.gamestate
  });
  corridorClient.drawBoard();
  corridorClient.drawPawns();
  corridorClient.drawLegalMoves();
  corridorClient.drawWalls();
  gameBoard.addEventListener('click', corridorClient.handleClick);
});

CorridorClient = function (options) {

  this.defaults = function () {
    return {
      squares: 9,
      gridStroke: '#aaa'
    }
  };

  this.options = Object.assign(true, this.defaults(), options);
  this.ctx = this.options.el.getContext('2d');
  this.wRect = this.options.el.getAttribute('width') / this.options.squares;

  this.drawBoard = function () {
    for (var i = 0; i < this.options.squares; i++){
      for (var j = 0; j < this.options.squares; j++){
        this.ctx.fillStyle = (i+j) % 2 ? '#7c7880' : '#b1b1b1';
        this.ctx.fillRect(j * this.wRect, i * this.wRect, this.wRect, this.wRect)
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText(this.toSquare(j,i), j * this.wRect + 4, i * this.wRect + 12);
      }
    }
  }

  this.drawPawns = function () {
    var pawns = this.options.gamestate.pawnPositions;
    pawns.forEach(function(pawn, idx) {
      this.ctx.fillStyle = idx ? '#000' : '#fff';
      this.ctx.font="30px Arial";
      this.ctx.fillText('♟', (pawn.x * this.wRect) + 10, (pawn.y * this.wRect) + 35);
    }.bind(this))
  }

  this.drawLegalMoves = function () {
    var legalPawnMoves = this.options.gamestate.legalPawnMoves;
    legalPawnMoves.forEach(function(move) {
      this.ctx.fillStyle = 'rgba(100, 210, 35, 0.3)';
      this.ctx.fillRect(move.x * this.wRect, move.y * this.wRect, this.wRect, this.wRect)
    }.bind(this))
  }

  this.handleClick = function (e) {
    const [x,y] = [
      Math.floor((e.x - e.target.offsetLeft) / this.wRect),
      Math.floor((e.y - e.target.offsetTop) / this.wRect)
    ]
    if(this.isValidMove(x,y)){
      window.location = `/move/${this.toSquare(x,y)}?state=${this.options.gamestate.state}`
    }
  }.bind(this)

  this.drawWalls = function () {
    var walls = this.options.gamestate.wallPositions;
    walls.forEach(function(wall) {
      var height = wall.direction === 'v' ? 4 : this.wRect * 4;
      var width = wall.direction === 'h' ? 4 : this.wRect * 4;
      var x = wall.x * this.wRect;
      var y = wall.y * this.wRect;
      if(wall.direction === 'v') {
        x += this.wRect - 2;
      }
      if(wall.direction === 'h') {
        y += this.wRect - 2;
      }
      this.ctx.fillStyle = 'rgb(200, 0, 0)';
      this.ctx.fillRect(x, y, height, width)
    }.bind(this))
  }

  this.isValidMove = function (x, y) {
    return this.options.gamestate.legalPawnMoves.filter(function(move){
      return move.x === x && move.y === y;
    }).length > 0;
  }

  this.toSquare = function (x,y) {
    return String.fromCharCode(parseInt(x + 65)) + (y + 1)
  }

};

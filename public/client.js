document.addEventListener("DOMContentLoaded", function(e) {
  var gameBoard = document.getElementById('game-board');
  var corridorClient = new CorridorClient({ el: gameBoard, gamestate: window.gamestate });
  corridorClient.drawBoard();
  corridorClient.drawPawns();
});

CorridorClient = function (options) {
  this.defaults = { squares: 9, gridStroke: '#9d72e8' };
  this.options = Object.assign(true, this.defaults, options);
  this.ctx = this.options.el.getContext('2d');
  this.wRect = this.options.el.getAttribute('width') / this.options.squares;

  this.drawBoard = function () {
    for (var i = 0; i < this.options.squares; i++){
      for (var j = 0; j < this.options.squares; j++){
        this.ctx.strokeStyle = this.options.gridStroke;
        this.ctx.strokeRect(j * this.wRect, i * this.wRect, this.wRect, this.wRect);
        this.ctx.fillText(this.toSquare(i,j), j * this.wRect + 2, i * this.wRect + 10);
      }
    }
  }

  this.drawPawns = function () {
    var pawns = this.options.gamestate.pawnPositions;
    pawns.forEach(function(pawn, idx) {
      this.ctx.fillStyle = 'rgb(' + 255 * idx + ',0,0)';
      this.ctx.fillRect(pawn.y * this.wRect, pawn.x * this.wRect, this.wRect, this.wRect)
    }.bind(this))
  }

  this.drawWalls = function () {

  }

  this.toSquare = function (x,y) {
    return String.fromCharCode(parseInt(x + 65)) + (y + 1)
  }

};

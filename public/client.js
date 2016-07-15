document.addEventListener("DOMContentLoaded", function(e) {
  var gameBoard = document.getElementById('game-board');
  window.corridorClient = new CorridorClient({
    el: gameBoard,
    gamestate: window.gamestate
  });
  corridorClient.init();
  gameBoard.addEventListener('click', corridorClient.handleClick);
  gameBoard.addEventListener('mousemove', corridorClient.handleMouseMove);
});

CorridorClient = function (options) {

  this.defaults = function () {
    return {
      squares: 9,
      gridStroke: '#aaa',
      wallColor: 'rgb(200, 0, 0)',
      proposedWallColor: 'rgb(0, 200, 0)',
      wallWidth: 4
    };
  };

  this.options = Object.assign(true, this.defaults(), options);

  this.ctx = this.options.el.getContext('2d');

  this.dimensions = {
    width: this.options.el.getAttribute('width'),
    height: this.options.el.getAttribute('height')
  }

  this.wRect = this.dimensions.width / this.options.squares;

  this.init = function () {
    this.draw();
  }

  this.draw = function () {
    this.drawBoard();
    this.drawPawns();
    this.drawLegalMoves();
    this.drawWalls();
    if(this.isValidWall(this.proposedWall)) {
      this.drawWall(this.proposedWall, 'rgb(0,255,0)');
    }
  }

  this.clear = function () {
    this.ctx.clearRect(0, 0, this.dimensions.width, this.dimensions.height);
  }

  this.drawBoard = function () {
    for (var i = 0; i < this.options.squares; i++){
      for (var j = 0; j < this.options.squares; j++){
        this.ctx.fillStyle = (i+j) % 2 ? '#7c7880' : '#b1b1b1';
        this.ctx.fillRect(j * this.wRect, i * this.wRect, this.wRect, this.wRect);
        this.ctx.fillStyle = (i+j) % 2 ? '#b1b1b1' : '#7c7880';
        this.ctx.font="10px Arial";
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
      this.ctx.fillRect(move.x * this.wRect, move.y * this.wRect, this.wRect, this.wRect);
    }.bind(this));
  }

  this.handleClick = function (e) {
    var pointerPosition = this.resolvePointerPosition(e);

    if(this.isValidWall(this.proposedWall) && this.posWithinRect(this.proposedWall, pointerPosition)) {
      window.location = `/move/${this.proposedWall.squareAnnotation}?state=${this.options.gamestate.state}`;
      return;
    }

    var x = Math.floor(pointerPosition.x / this.wRect),
        y = Math.floor(pointerPosition.y / this.wRect);

    if(this.isValidMove(x,y)){
      window.location = `/move/${this.toSquare(x,y)}?state=${this.options.gamestate.state}`;
    }

  }.bind(this)

  this.posWithinRect = function (rect, pos) {
    var width = rect.direction === 'h' ? 2 * this.wRect : this.options.wallWidth,
        height = rect.direction === 'h' ? this.options.wallWidth : 2 * this.wRect,
        y = rect.direction === 'h' ? ((rect.y + 1) * this.wRect) - height / 2 : rect.y * this.wRect,
        x = rect.direction === 'h' ? rect.x * this.wRect : (rect.x + 1) * this.wRect - width / 2;

    return pos.x >= x &&
      pos.x <= x + width &&
      pos.y >= y &&
      pos.y <= y + height;
  }

  this.resolvePointerPosition = function (e) {
    return {
      x: e.x - e.target.offsetLeft,
      y: e.y - e.target.offsetTop
    };
  }

  this.drawWall = function (wall, color) {
    var height = wall.direction === 'v' ? this.options.wallWidth : this.wRect * 2;
    var width = wall.direction === 'h' ? this.options.wallWidth : this.wRect * 2;
    var x = wall.x * this.wRect;
    var y = wall.y * this.wRect;
    if(wall.direction === 'v') {
      x += this.wRect - (this.options.wallWidth / 2);
    }
    if(wall.direction === 'h') {
      y += this.wRect - (this.options.wallWidth / 2);
    }
    this.ctx.fillStyle = color || this.options.wallColor;
    this.ctx.fillRect(x, y, height, width);
    return {x: x, y: y, height: height, width: width};
  };

  this.drawWalls = function () {
    var walls = this.options.gamestate.wallPositions;
    walls.forEach(this.drawWall.bind(this));
  };

  this.handleMouseMove = function (e) {
    var pointerPosition = this.resolvePointerPosition(e);
    if(pointerPosition.x % this.wRect === 0) {
      var x = Math.floor((pointerPosition.x - 1) / this.wRect),
          y = Math.floor(pointerPosition.y / this.wRect);
      this.proposeWall({
        x: x,
        y: y,
        direction: 'v',
        squareAnnotation: 'v' + this.toSquare(x, y)
      });
    }
    if(pointerPosition.y % this.wRect === 0) {
      var x = Math.floor(pointerPosition.x / this.wRect),
          y = Math.floor((pointerPosition.y - 1) / this.wRect);
      this.proposeWall({
        x: x,
        y: y,
        direction: 'h',
        squareAnnotation: 'h' + this.toSquare(x, y)
      });
    }
  }.bind(this);

  this.proposedWall = {
    x: null,
    y: null,
    direction: null
  };

  this.proposeWall = function (wall) {
    if(this.isValidWall(wall) &&
    (
      wall.x !== this.proposedWall.x ||
      wall.y !== this.proposedWall.y ||
      wall.direction !== this.proposedWall.direction)
    ) {
      this.proposedWall = wall;
      this.clear();
      this.draw();
    }
  };

  this.isValidWall = function (wall) {
    return this.options.gamestate.legalWallMoves.filter(function(move){
      return move.x === wall.x && move.y === wall.y && move.direction === wall.direction;
    }).length > 0;
  };

  this.isValidMove = function (x, y) {
    return this.options.gamestate.legalPawnMoves.filter(function(move){
      return move.x === x && move.y === y;
    }).length > 0;
  };

  this.toSquare = function (x,y) {
    return String.fromCharCode(parseInt(x + 65)) + (y + 1);
  };

};

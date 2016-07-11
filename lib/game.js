const config = {
  defaultBounds: {
    x: 8,
    y: 8
  }
}

const toSquare = (x, y) => String.fromCharCode(parseInt(x + 65)) + (y + 1)

const fromSquare = square => {
  const x = parseInt(square[0].toUpperCase().charCodeAt(0) - 65)
  const y = parseInt(square.substr(1) - 1)
  return {x, y};
}

function neighbours(square) {
  const {x,y} = fromSquare(square);
  return [
    toSquare(x - 1, y),
    toSquare(x + 1, y),
    toSquare(x, y - 1),
    toSquare(x, y + 1)
  ].filter((square) => isWithinBounds(square));
}

const getMoves = state => state.split(';').filter(x => x !== '')

const nextPlayer = state => getMoves(state).length % 2

const excludeWallMoves = move => !isWallMove(move)

const locatePawns = state => [locatePawn(state, 0), locatePawn(state, 1)]

const locatePawn = (state, playerIndex) => {
  const moves = groupMovesByPlayer(state)[playerIndex].filter(excludeWallMoves)
  return moves.length ? moves[moves.length - 1] : (playerIndex ? 'E9' : 'E1')
}

const locateNextPawn = (state) => locatePawn(state, nextPlayer(state))

const isWallMove = move =>
  move.length === 3 && ['V', 'H'].indexOf(move[0]) > -1

const groupMovesByPlayer = (state) =>
  getMoves(state).reduce((prev, current, i, arr) => {
    const tmpArray = [].concat(prev)
    tmpArray[i%2].push(arr[i])
    return tmpArray
  }, [[],[]])

const isWithinBounds = (square, bounds = config.defaultBounds) => {
  const {x,y} = fromSquare(square);
  return y <= bounds.y && y >= 0 && x >= 0 && x <= bounds.x;
}

const isCollidingWall = (state, wall) => {

  if (!isWithinBounds(wall.substr(1), { x: 7, y: 7 })) {
    return true;
  }

  const walls = getMoves(state).filter(isWallMove);
  const flippedDirection = wall[0] === 'V' ? 'H' : 'V';
  const rotatedWall = `${flippedDirection}${wall.substr(1)}`
  const collidingWall = walls.find(x => x === wall || x === rotatedWall);
  return typeof collidingWall !== 'undefined';
};

const headToHead = state => {
  const [a, b] = locatePawns(state).map(fromSquare)
  if(a.x === b.x)
    return Math.abs(a.y - b.y) === 1
  if(a.y === b.y)
    return Math.abs(a.x - b.x) === 1
  return false
}

const isOccupiedSquare = (state, square) =>
  locatePawns(state).indexOf(square) > -1

const getJumpSquare = (pawn, otherPawn) => {
  pawn = fromSquare(pawn)
  otherPawn = fromSquare(otherPawn)
  return toSquare (
    pawn.x === otherPawn.x ?
      pawn.x :
      pawn.x > otherPawn.x ? otherPawn.x - 1 : otherPawn.x + 1,
    pawn.y === otherPawn.y ?
      pawn.y :
      otherPawn.y > pawn.y ? otherPawn.y + 1 : otherPawn.y - 1
  )
}

const isBlockedByWall = (state, from, to) => {
  from = fromSquare(from)
  to = fromSquare(to)
  if(from.x === to.x) {
    if(from.y > to.y) {
      return state.indexOf(`H${toSquare(from.x, from.y - 1)}`) > -1 ||    state.indexOf(`H${toSquare(from.x - 1, from.y - 1)}`) > -1
    }
    return state.indexOf(`H${toSquare(from.x, from.y)}`) > -1 || state.indexOf(`H${toSquare(from.x - 1, from.y)}`) > -1
  }
  if(from.y === to.y) {
    if(from.x > to.x) {
      return state.indexOf(`V${toSquare(from.x - 1, from.y)}`) > -1|| state.indexOf(`V${toSquare(from.x - 1, from.y - 1)}`) > -1
    }
    return state.indexOf(`V${toSquare(from.x, from.y - 1)}`) > -1 || state.indexOf(`V${toSquare(from.x, from.y)}`) > -1
  }
  return false;
}

const getLegalPawnMoves = state => {
  const pawn = locateNextPawn(state)
  return neighbours(pawn)
    .filter(neigbour =>
      !isBlockedByWall(state, pawn, neigbour)
    )
    .map(neigbour =>
      isOccupiedSquare(state, neigbour) ? getJumpSquare(pawn, neigbour) : neigbour
  )
}

const getLegalWallMoves = state => {
  let arr = []
  for(var i = 0; i <= 7; i++) {
    for(var j = 0; j <=7; j++) {
      if(!isCollidingWall(state, `V${toSquare(i, j)}`)) {
        arr.push(`V${toSquare(i, j)}`)
      }
      if(!isCollidingWall(state, `H${toSquare(i, j)}`)) {
        arr.push(`H${toSquare(i, j)}`)
      }
    }
  }
  return arr
}

const isValidMove = (state, move) =>
  isWallMove(move) ?
    !isCollidingWall(state, move) : getLegalPawnMoves(state).indexOf(move) > -1

const updateGameState = (state, move) => {
  return state !== '' ? `${state};${move}` : `${move}`
}

module.exports = {
  toSquare,
  neighbours,
  nextPlayer,
  isWallMove,
  groupMovesByPlayer,
  locateNextPawn,
  locatePawns,
  getMoves,
  fromSquare,
  headToHead,
  isCollidingWall,
  getLegalPawnMoves,
  isValidMove,
  getLegalWallMoves,
  updateGameState
}

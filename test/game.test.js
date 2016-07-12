'use strict'
import {expect, should} from 'chai'
import chai from 'chai'
import {
  isValidMove,
  updateGameState,
  toSquare,
  fromSquare,
  neighbours,
  isWallMove,
  nextPlayer,
  groupMovesByPlayer,
  locateNextPawn,
  locateWalls,
  getMoves,
  headToHead,
  getLegalPawnMoves,
  getLegalWallMoves,
  isCollidingWall
} from '../lib/game'

const toObjectOfKeys = (arr) =>
  arr.reduce( (prev, curr, i) => {
    prev[curr] = curr; return prev
  }, {})

describe('fromSquare', () => {
  it('should return x,y coordinate from square', () => {
    expect(fromSquare('F1')).to.deep.equal({
      x: 5,
      y: 0
    })
  })
  it('should return x,y and direction from wall move', () => {
    expect(fromSquare('HF1')).to.deep.equal({
      x: 5,
      y: 0,
      direction: 'H'
    })

    expect(fromSquare('VF1')).to.deep.equal({
      x: 5,
      y: 0,
      direction: 'V'
    })
  })
})

describe('locateWalls', () => {
  it('should return all walls', () => {
    expect(locateWalls('F1;F9;G1;G9;H1;H9;I1')).to.deep.equal([
      'H1', 'H9'
    ])
  })
})

describe('get all legal wall moves', () => {
  it('should return all legal wall moves', () => {
    expect(getLegalWallMoves('').indexOf('VA1')).to.not.equal(-1);
    expect(getLegalWallMoves('').indexOf('VH1')).to.not.equal(-1);
    expect(getLegalWallMoves('').indexOf('HA1')).to.not.equal(-1);
    expect(getLegalWallMoves('').indexOf('HH1')).to.not.equal(-1);
    expect(getLegalWallMoves('HH1').indexOf('HH1')).to.equal(-1);
    expect(getLegalWallMoves('HH1').indexOf('VA1')).to.not.equal(-1);
  })
})

describe('get all legal pawn moves', () => {
  it('should return all legal pawn moves', () => {
    expect(toObjectOfKeys(getLegalPawnMoves('E2;E8;E3;E7;E4;E6;E5')))
      .to.have.all.keys('D6', 'F6', 'E4', 'E7');
    expect(toObjectOfKeys(getLegalPawnMoves('E2;E8;E3;E7;E4;E6;E5;D6;E6')))
      .to.have.all.keys('D5', 'C6', 'D7', 'F6');
    expect(toObjectOfKeys(getLegalPawnMoves('F1;F9;G1;G9;H1;H9')))
      .to.have.all.keys('H2', 'G1', 'I1');
    expect(toObjectOfKeys(getLegalPawnMoves('F1;F9;G1;G9;H1;H9;I1;I9;I2;I8;I3;I7;I4;I6;I5'))).to.have.all.keys('H6', 'I4', 'I7');
  })

  it('should not cross a horizontal wall', () => {
    expect(getLegalPawnMoves('HE8').indexOf('D9')).to.not.equal(-1)
    expect(getLegalPawnMoves('HE8').indexOf('F9')).to.not.equal(-1)
    expect(getLegalPawnMoves('HE8').indexOf('E8')).to.equal(-1)
    expect(getLegalPawnMoves('HE7;E8;E2').indexOf('E7')).to.equal(-1)
    expect(getLegalPawnMoves('HE7;E8;E2').indexOf('D8')).to.not.equal(-1)
    expect(getLegalPawnMoves('HE7;E8;E2').indexOf('F8')).to.not.equal(-1)
    expect(getLegalPawnMoves('HE7;E8;E2').indexOf('E9')).to.not.equal(-1)
  })

  it('should not cross a vertical wall', () => {
    expect(getLegalPawnMoves('VE8').indexOf('F9')).to.equal(-1)
    expect(getLegalPawnMoves('VE8').indexOf('E8')).to.not.equal(-1)
    expect(getLegalPawnMoves('VE8').indexOf('D9')).to.not.equal(-1)
  })

})

describe('headToHead', () => {
  it('should detect to pawns head 2 head', () => {
    expect(headToHead('E1;E9')).to.equal(false)
    expect(headToHead('E2;E3')).to.equal(true)
    expect(headToHead('E2;E4')).to.equal(false)
    expect(headToHead('D6;E6')).to.equal(true)
    expect(headToHead('E6;D6')).to.equal(true)
  })
})

describe('locateNextPawn', () => {
  it('should locate pawn', () => {
    expect(locateNextPawn('')).to.equal('E1')
    expect(locateNextPawn('E2')).to.equal('E9')
  })
})

describe('filterMovesByPlayer', () => {
  it('should filter moves by player', () => {
    expect(groupMovesByPlayer('E2;E8;E3;E7')).to.deep.equal([['E2','E3'],['E8', 'E7']])
  })
})

describe('nextPlayer', () => {
  it('should identify next player', () => {
    expect(nextPlayer('')).to.equal(0)
    expect(nextPlayer('E2')).to.equal(1)
    expect(nextPlayer('E2;E8')).to.equal(0)
  })
})

describe('neighbours', () => {
  it('should return all adjecent squares', () => {
    expect(neighbours('E1')).to.contain('D1')
    expect(neighbours('E1')).to.contain('F1')
    expect(neighbours('E1')).to.contain('E2')
    expect(neighbours('E1').length).to.equal(3)
  })
})

describe('to square', () => {
  it('should translate from coordinates to square', () => {
    expect(toSquare(2,2)).to.equal('C3')
  })
})

describe('Corridor - game', () => {

  it('should validate legal first move', () => {
    expect(isValidMove("", "E2")).to.equal(true);
    expect(isValidMove("", "HA1")).to.equal(true);
    expect(isValidMove("", "VA1")).to.equal(true);
    expect(isValidMove("", "D1")).to.equal(true);
    expect(isValidMove("", "F1")).to.equal(true);
  })

  it('should invalidate illegal first move', () => {
    expect(isValidMove("", "C1")).to.equal(false);
    expect(isValidMove("", "G1")).to.equal(false);
    expect(isValidMove("", "E3")).to.equal(false);
    expect(isValidMove("", "VA9")).to.equal(false);
    expect(isValidMove("", "HA9")).to.equal(false);
    expect(isValidMove("", "VA0")).to.equal(false);
    expect(isValidMove("", "HA0")).to.equal(false);
  })

  it('should validate valid move(s)', () => {
    expect(isValidMove("E2;E8", "HD2")).to.be.true
  })

  it('should invalidate invalid move(s)', () => {
    const move = "F1"
    expect(isValidMove("E2;E8", move)).to.be.false
  })

  it('should update game state correctly', () => {
   const move = "HD2"
   const expected = `E2;E8;${move}`
   expect(updateGameState("E2;E8", move)).to.equal(expected)
  })

  it('should detect wall move', () => {
    expect(isWallMove('HD2')).to.be.true
    expect(isWallMove('VD2')).to.be.true
    expect(isWallMove('E3')).to.be.false
  })

  it('should detect colliding walls', () => {
    expect(isCollidingWall('HD2', 'VD2')).to.be.true
    expect(isCollidingWall('HD2', 'VG2')).to.be.false
    expect(isCollidingWall('VC6', 'VC6')).to.be.true
    expect(isCollidingWall('VC6', 'HC6')).to.be.true
  })

  it('should validate special moves', () => {
    expect(isValidMove('E2;E8;E3;E7;E4;E6;E5', 'E4')).to.equal(true);
    expect(isValidMove('E2;E8;E3;E7;E4;E6;E5', 'E5')).to.equal(false);
    expect(isValidMove('E2;E8;E3;E7;E4;E6;E5;D6;E6', 'F6')).to.equal(true);
    expect(isValidMove('E2;E8;E3;E7;E4;E6;E5;D6;E6', 'E6')).to.equal(false);
  })

})

'use strict'
const game = require('../game')
const express = require('express')
const app = express()

app.get('/:move', (req, res) => {
  const state = req.query.state
  const newState = game.isValidMove(state, req.params.move) ? game.updateGameState(state, req.params.move) : state
  res.render(
    'index', {
      state: newState,
      pawnPositions: game.locatePawns(newState).map(game.fromSquare),
      wallPositions: game.locateWalls(newState).map(game.fromSquare),
      legalPawnMoves: game.getLegalPawnMoves(newState).map(game.fromSquare),
      legalWallMoves: game.getLegalWallMoves(newState).map(game.fromSquare)
    }
  )
})

module.exports = app

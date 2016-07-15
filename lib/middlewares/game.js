'use strict'
const game = require('../game')
const express = require('express')
const app = express()

app.get('/',  (req, res) => {
  const state = req.query.state || '';
  res.render(
    'index', {
      state: state,
      pawnPositions: game.locatePawns(state).map(game.fromSquare),
      wallPositions: game.locateWalls(state).map(game.fromSquare),
      legalPawnMoves: game.getLegalPawnMoves(state).map(game.fromSquare),
      legalWallMoves: game.getLegalWallMoves(state).map(game.fromSquare)
    }
  )
})

module.exports = app

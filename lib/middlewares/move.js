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
      validPawnMoves: game.getLegalPawnMoves(newState),
      validWallMoves: game.getLegalWallMoves(newState)
    }
  )
})

module.exports = app

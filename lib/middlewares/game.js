'use strict'
const game = require('../game')
const express = require('express')
const app = express()

app.get('/', (req, res) =>
  res.render(
    'index', {
      state: '',
      validPawnMoves: game.getLegalPawnMoves(''),
      validWallMoves: game.getLegalWallMoves('')
    }
  )
)

module.exports = app

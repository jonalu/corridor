'use strict'
const express = require('express')
const middlewares = require('./lib/middlewares')
const app = express()

app.set('view engine', 'ejs')
app.use('/static', express.static('public'))

app.use('/move', middlewares.move)
app.use('/', middlewares.game)

var server = app.listen(process.env.PORT || 3000, () =>
  console.log(
    `Server running on port ${server.address().port}`
  )
)

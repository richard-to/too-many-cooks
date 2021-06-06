require('dotenv').config()

const http = require('http')
const path = require('path')

const compression = require('compression')
const cors = require('cors')
const express = require('express')

const PhaserGame = require('./game/game')

const app = express()
const server = http.createServer(app)

const game = new PhaserGame(server)
const port = 1444

app.use(cors())
app.use(compression())

app.use('/', express.static(path.join(__dirname, '../dist')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})


app.get('/getState', (_req, res) => {
  try {
    let gameScene = game.scene.keys['GameScene']
    return res.json({
      state: gameScene.getState(),
      channelEntityMap: gameScene.getChannelEntityMap(),
      orders: gameScene.orders.toArray(),
      scores: gameScene.scores.toArray(),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
})

server.listen(port, () => {
  console.log('Express is listening on http://localhost:' + port)
})


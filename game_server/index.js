require('dotenv').config()

const port = parseInt(process.env.INTERNAL_SERVER_PORT)

const http = require('http')
const path = require('path')

const compression = require('compression')
const cors = require('cors')
const express = require('express')

const PhaserGame = require('./game/game')

run()

async function run() {
  // Geckos uses ESM modules, so we need to perform an async import to make it work with
  // the old CommonJS approach.
  const geckos = await import('@geckos.io/server')

  const app = express()
  const server = http.createServer(app)
  const game = new PhaserGame(server, geckos.default)

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
        matchState: gameScene.matchState.getState(),
        orders: gameScene.orders.toArray(),
        scores: gameScene.scores.toArray(),
        state: gameScene.getState(),
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  })

  server.listen(port, () => {
    console.log('Express is listening on http://localhost:' + port)
  })

}

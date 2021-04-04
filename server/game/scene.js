const path = require('path')

const geckos = require('@geckos.io/server').default
const { Scene } = require('phaser')

const Player = require('./sprites/player')

// Size of level map (multiple number of cells by cell width/height)
const LEVEL_HEIGHT = 1935
const LEVEL_WIDTH = 2580


class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.playerId = 0
  }

  init() {
    this.io = geckos({
      iceServers: [],
    })
    this.io.addServer(this.game.server)
  }

  getId() {
    return this.playerId++
  }

  prepareToSync(player) {
    return `${player.playerId},${Math.round(player.x).toString(
      36
    )},${Math.round(player.y).toString(36)},${player.dead ? 1 : 0},${player.flipX ? 1 : 0},${player.anim ? 1 : 0}`
  }

  getState() {
    let state = ''
    this.playersGroup.children.iterate((player) => {
      state += this.prepareToSync(player)
    })
    return state
  }

  preload() {
    this.load.image('tiles', path.join(__dirname, '../../dist/assets/tiles.png'))
    this.load.tilemapTiledJSON('map', path.join(__dirname, '../../dist/assets/level-0.json'))
  }

  create() {
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT)

    const levelMap = this.make.tilemap({ key: 'map' })
    const tiles = levelMap.addTilesetImage('tiles', 'tiles', 129, 129)

    // Add collisions to tile map
    const worldLayer = levelMap.createDynamicLayer('level-0', tiles)
      .setCollisionByProperty({ collides: true })
      //.setTileIndexCallback(1, grabItemFromBlock, this)
      //.setTileIndexCallback(2, grabItemFromBlock, this)
      //.setTileIndexCallback(3, grabItemFromBlock, this)
      //.setTileIndexCallback(4, grabItemFromBlock, this)

  this.playersGroup = this.physics.add.group({
    bounceY: 0.2,
    collideWorldBounds: true,
  })
  this.physics.add.collider(this.playersGroup, worldLayer)

    this.io.onConnection((channel) => {
      channel.onDisconnect(() => {
        console.log('Disconnect user ' + channel.id)
        this.playersGroup.children.each((player) => {
          if (player.playerId === channel.playerId) {
            player.kill()
          }
        })
        channel.room.emit('removePlayer', channel.playerId)
      })

      channel.on('getId', () => {
        channel.playerId = this.getId()
        channel.emit('getId', channel.playerId.toString(36))
      })

      channel.on('playerMove', (data) => {
        this.playersGroup.children.iterate((player) => {
          if (player.playerId === channel.playerId) {
            player.setMove(data)
          }
        })
      })

      channel.on('addPlayer', (data) => {
        let dead = this.playersGroup.getFirstDead()
        if (dead) {
          dead.revive(channel.playerId, false)
        } else {
          this.playersGroup.add(
            new Player(
              this,
              channel.playerId,
              Phaser.Math.RND.integerInRange(100, 700)
            )
          )
        }
      })

      channel.emit('ready')
    })
  }

  update() {
    let updates = ''
    this.playersGroup.children.iterate((player) => {
      let x = Math.abs(player.x - player.prevX) > 0.5
      let y = Math.abs(player.y - player.prevY) > 0.5
      let dead = player.dead != player.prevDead
      if (x || y || dead) {
        if (dead || !player.dead) {
          updates += this.prepareToSync(player)
        }
      }
      player.postUpdate()
    })

    if (updates.length > 0) {
      this.io.room().emit('updateObjects', [updates])
    }
  }
}

module.exports = GameScene

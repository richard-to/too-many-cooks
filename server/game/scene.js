const path = require('path')

const geckos = require('@geckos.io/server').default
const { Scene } = require('phaser')

const Player = require('./sprites/player')
const Tomato = require('./sprites/tomato')

// Size of level map (multiple number of cells by cell width/height)
const LEVEL_HEIGHT = 1935
const LEVEL_WIDTH = 2580


class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.playerId = 1
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
    return `${player.type},${player.playerId},${Math.round(player.x).toString(
      36
    )},${Math.round(player.y).toString(36)},${player.dead ? 1 : 0},${player.flipX ? 1 : 0},${player.anim ? 1 : 0},${player.angle},`
  }

  getState() {
    let state = ''
    this.playersGroup.children.iterate((player) => {
      state += this.prepareToSync(player)
    })
    this.items.children.iterate((item) => {
      state += this.prepareToSync(item)
    })
    return state
  }

  preload() {
    this.load.image('tiles', path.join(__dirname, '../../dist/assets/tiles.png'))
    this.load.tilemapTiledJSON('map', path.join(__dirname, '../../dist/assets/level-0.json'))
  }

  create() {
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT)

    this.items = this.physics.add.group({
      angularVelocity: 0,
      allowGravity: false,
      immovable: true,
    })

    this.ingredients = this.physics.add.group({
      allowGravity: true,
      bounceY: 0.2,
      immovable: false,
      collideWorldBounds: true,
    })

    this.playersGroup = this.physics.add.group({
      bounceY: 0.2,
      collideWorldBounds: true,
    })

    const levelMap = this.make.tilemap({ key: 'map' })
    const tiles = levelMap.addTilesetImage('tiles', 'tiles', 129, 129)


    const grabItemFromBlock = (sprite, tile) => {
      if (sprite.type !== '1') {
        return
      }

      // Can't use sprite.body.blocked.down with this approach, so we'll calculate relative position
      const isAboveBlock = sprite.y < tile.y * tile.height
      if (!sprite.item && isAboveBlock && sprite.move.space) {
        sprite.move.space = false
        const ids = this.getId()
        const item = new Tomato(
          this,
          ids,
          sprite.x + 30,
          sprite.y - sprite.body.height + 30,
        )
        sprite.item = item
        this.items.add(item)
      }
    }

    const pickupIngredient = (sprite, ingredient) => {
      if (sprite.type !== '1') {
        return
      }

      if (!sprite.item && sprite.move.space) {
        sprite.move.space = false

        // Remove it from the ingredient physics group
        this.ingredients.remove(ingredient)
        // Add it to the item physics group which has different behavior
        this.items.add(ingredient)

        ingredient.x = sprite.x + 30
        ingredient.y = sprite.y - sprite.body.height + 30
        ingredient.angle = 0
        ingredient.setFlipY(false)

        sprite.item = ingredient
      }
    }

    // Add collisions to tile map
    const worldLayer = levelMap.createDynamicLayer('level-0', tiles)
      .setCollisionByProperty({ collides: true })
      .setTileIndexCallback(1, grabItemFromBlock, this)
      .setTileIndexCallback(2, grabItemFromBlock, this)
      .setTileIndexCallback(3, grabItemFromBlock, this)
      .setTileIndexCallback(4, grabItemFromBlock, this)

    this.physics.add.collider(this.ingredients, worldLayer)
    this.physics.add.collider(this.playersGroup, worldLayer)

    this.physics.add.overlap(this.playersGroup, this.ingredients, pickupIngredient, null, this)

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

    this.items.children.iterate((item) => {
      let x = Math.abs(item.x - item.prevX) > 0.5
      let y = Math.abs(item.y - item.prevY) > 0.5
      let dead = item.dead != item.prevDead
      if (x || y || dead) {
        if (dead || !item.dead) {
          updates += this.prepareToSync(item)
        }
      }
      item.postUpdate()
    })


    this.ingredients.children.iterate((item) => {
      let x = Math.abs(item.x - item.prevX) > 0.5
      let y = Math.abs(item.y - item.prevY) > 0.5
      let dead = item.dead != item.prevDead
      if (x || y || dead) {
        if (dead || !item.dead) {
          updates += this.prepareToSync(item)
        }
      }
      item.postUpdate()
    })


    if (updates.length > 0) {
      this.io.room().emit('updateObjects', [updates])
    }
  }
}

module.exports = GameScene

const path = require('path')

const geckos = require('@geckos.io/server').default
const { sample } = require('lodash')
const { Scene } = require('phaser')

const { PlayerPrefix, Settings, SpriteType, TileType } = require('./enums')
const {
  Bun,
  BurgerBeef,
  BurgerBeefLettuce,
  BurgerBeefTomato,
  BurgerBeefTomatoLettuce,
  BurgerLettuce,
  BurgerTomato,
  BurgerTomatoLettuce,
  Cow,
  Lettuce,
  Tomato,
} = require('./sprites/items')
const Player = require('./sprites/player')

const tileIndexMap = {
  [TileType.COW_BOX]: Cow,
  [TileType.BUN_BOX]: Bun,
  [TileType.LETTUCE_BOX]: Lettuce,
  [TileType.TOMATO_BOX]: Tomato,
}

class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.entityID = 1
  }

  init() {
    this.io = geckos({
      iceServers: [],
    })
    this.io.addServer(this.game.server)
  }

  getID() {
    return this.entityID++
  }

  prepareToSync(e) {
    const x = Math.round(e.x).toString(Settings.RADIX)
    const y = Math.round(e.y).toString(Settings.RADIX)
    return `${e.type},${e.entityID},${e.prefix},${x},${y},${e.flipX ? 1:0},${e.flipY ? 1:0},${e.angle},${e.anim ? 1:0},`
  }

  getState() {
    let state = ''
    this.playersGroup.children.iterate((player) => {
      state += this.prepareToSync(player)
    })
    this.itemsGroup.children.iterate((item) => {
      state += this.prepareToSync(item)
    })
    this.ingredientsGroup.children.iterate((item) => {
      state += this.prepareToSync(item)
    })
    return state
  }

  preload() {
    this.load.image('tiles', path.join(__dirname, '../../dist/assets/tiles.png'))
    this.load.tilemapTiledJSON('map', path.join(__dirname, '../../dist/assets/level-0.json'))
  }

  create() {
    this.physics.world.setBounds(0, 0, Settings.LEVEL_WIDTH, Settings.LEVEL_HEIGHT)

    this.itemsGroup = this.physics.add.group({
      angularVelocity: 0,
      allowGravity: false,
      immovable: true,
    })

    this.ingredientsGroup = this.physics.add.group({
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
    const tiles = levelMap.addTilesetImage('tiles', 'tiles', Settings.TILE_WIDTH, Settings.TILE_HEIGHT)

    const grabItemFromBlock = (sprite, tile) => {
      if (sprite.type !== SpriteType.PLAYER) {
        return
      }

      // Can't use sprite.body.blocked.down with this approach, so we'll calculate relative position
      const isAboveBlock = sprite.y < tile.y * tile.height
      if (!sprite.item && isAboveBlock && sprite.move.space) {
        sprite.move.space = false
        const item = new tileIndexMap[tile.index](this, this.getID())
        item.positionOnPlayer(sprite)
        sprite.item = item
        this.itemsGroup.add(item)
      }
    }

    const pickupIngredient = (sprite, ingredient) => {
      if (sprite.type !== SpriteType.PLAYER) {
        return
      }

      if (sprite.item && sprite.move.x) {
        sprite.move.x = false

        const item = sprite.item
        let BurgerClass
        // TODO: Refactor this ugly conditional
        if (item.type < SpriteType.BUN && ingredient.type > SpriteType.COW) {
          if (item.type === SpriteType.COW && ingredient.type === SpriteType.BUN) {
            BurgerClass = BurgerBeef
          } else if (item.type === SpriteType.COW && ingredient.type === SpriteType.BURGER_LETTUCE) {
            BurgerClass = BurgerBeefLettuce
          } else if (item.type === SpriteType.COW && ingredient.type === SpriteType.BURGER_TOMATO_LETTUCE) {
            BurgerClass = BurgerBeefTomato
          } else if (item.type === SpriteType.COW && ingredient.type === SpriteType.BURGER_TOMATO_LETTUCE) {
            BurgerClass = BurgerBeefTomatoLettuce
          } else if (item.type === SpriteType.LETTUCE && ingredient.type === SpriteType.BUN) {
            BurgerClass = BurgerLettuce
          } else if (item.type === SpriteType.LETTUCE && ingredient.type === SpriteType.BURGER_BEEF_TOMATO_LETTUCE) {
            BurgerClass = BurgerBeefLettuce
          } else if (item.type === SpriteType.LETTUCE && ingredient.type === SpriteType.BURGER_TOMATO) {
            BurgerClass = BurgerTomatoLettuce
          } else if (item.type === SpriteType.LETTUCE && ingredient.type === SpriteType.BURGER_BEEF_TOMATO) {
            BurgerClass = BurgerBeefTomatoLettuce
          } else if (item.type === SpriteType.TOMATO && ingredient.type === SpriteType.BUN) {
            BurgerClass = BurgerTomato
          } else if (item.type === SpriteType.TOMATO && ingredient.type === SpriteType.BURGER_BEEF) {
            BurgerClass = BurgerBeefTomato
          } else if (item.type === SpriteType.TOMATO && ingredient.type === SpriteType.BURGER_LETTUCE) {
            BurgerClass = BurgerTomatoLettuce
          } else if (item.type === SpriteType.TOMATO && ingredient.type === SpriteType.BURGER_BEEF_LETTUCE) {
            BurgerClass = BurgerBeefTomatoLettuce
          }
        }

        if (BurgerClass) {
          const newItem = new BurgerClass(this, this.getID())
          newItem.positionOnPlayer(sprite)
          this.itemsGroup.add(newItem)
          sprite.item = newItem

          this.io.room().emit('removePlayer', item.entityID)
          this.io.room().emit('removePlayer', ingredient.entityID)

          // Clean up merged items
          item.removeEvents()
          ingredient.removeEvents()

          this.itemsGroup.remove(item)
          this.ingredientsGroup.remove(ingredient)

          item.destroy()
          ingredient.destroy()
        }
        return
      }

      if (!sprite.item && sprite.move.space) {
        sprite.move.space = false

        // Remove it from the ingredient physics group
        this.ingredientsGroup.remove(ingredient)
        // Add it to the item physics group which has different behavior
        this.itemsGroup.add(ingredient)
        ingredient.positionOnPlayer(sprite)
        ingredient.setFlipY(false)

        sprite.item = ingredient
        return
      }
    }

    // Add collisions to tile map
    const worldLayer = levelMap.createDynamicLayer('level-0', tiles)
      .setCollisionByProperty({ collides: true })
      .setTileIndexCallback(TileType.COW_BOX, grabItemFromBlock, this)
      .setTileIndexCallback(TileType.BUN_BOX, grabItemFromBlock, this)
      .setTileIndexCallback(TileType.LETTUCE_BOX, grabItemFromBlock, this)
      .setTileIndexCallback(TileType.TOMATO_BOX, grabItemFromBlock, this)

    this.physics.add.collider(this.ingredientsGroup, worldLayer)
    this.physics.add.collider(this.playersGroup, worldLayer)

    this.physics.add.overlap(this.playersGroup, this.ingredientsGroup, pickupIngredient, null, this)

    this.io.onConnection((channel) => {
      channel.onDisconnect(() => {
        console.log('Disconnect user ' + channel.id)
        let disconnectedPlayer = null
        this.playersGroup.children.each((player) => {
          if (player.entityID === channel.entityID) {
            disconnectedPlayer = player
          }
        })
        if (disconnectedPlayer) {
          this.playersGroup.remove(disconnectedPlayer)
          disconnectedPlayer.removeEvents()
          disconnectedPlayer.destroy()
        }
        channel.room.emit('removePlayer', channel.entityID)
      })

      channel.on('getID', () => {
        channel.entityID = this.getID()
        channel.emit('getID', channel.entityID.toString(Settings.RADIX))
      })

      channel.on('playerMove', (data) => {
        this.playersGroup.children.iterate((player) => {
          if (player.entityID === channel.entityID) {
            player.setMove(data)
          }
        })
      })

      channel.on('addPlayer', () => {
        this.playersGroup.add(
          new Player(
            this,
            channel.entityID,
            sample(PlayerPrefix),
            Phaser.Math.RND.integerInRange(0, Settings.LEVEL_WIDTH),
          )
        )
      })

      channel.emit('ready')
    })
  }

  update() {
    let updates = ''

    const syncSpriteData = (sprite) => {
      let x = Math.abs(sprite.x - sprite.prevX) > 0.5
      let y = Math.abs(sprite.y - sprite.prevY) > 0.5
      if (x || y) {
        updates += this.prepareToSync(sprite)
      }
      sprite.postUpdate()
    }

    this.playersGroup.children.iterate(syncSpriteData)
    this.itemsGroup.children.iterate(syncSpriteData)
    this.ingredientsGroup.children.iterate(syncSpriteData)

    if (updates.length > 0) {
      this.io.room().emit('updateEntities', [updates])
    }
  }
}

module.exports = GameScene

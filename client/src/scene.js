import geckos from '@geckos.io/client'
import axios from 'axios'
import { has, sample } from 'lodash'
import { Scene } from 'phaser'

import { Tomato, Bun, Cow, Lettuce, Player } from './sprites'
import { Settings, SpriteType, PLAYER_PREFIXES } from './enums'
import Controls from './cursors'

const spriteMap = {
  [SpriteType.BUN]: Bun,
  [SpriteType.COW]: Cow,
  [SpriteType.LETTUCE]: Lettuce,
  [SpriteType.TOMATO]: Tomato,
}

export class BootScene extends Scene {
  constructor() {
    super({ key: 'BootScene' })

    const channel = geckos({ port: Settings.SERVER_PORT })

    channel.onConnect(error => {
      if (error) {
        console.error(error.message)
      }

      channel.on('ready', () => {
        this.scene.start('GameScene', { channel: channel })
      })
    })
  }
}

export class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.entities = {}
    this.playerID
  }

  init({ channel }) {
    this.channel = channel
  }

  preload() {
    this.load.image('sky', '/assets/sky.png')
    this.load.image('tiles', '/assets/tiles.png')
    this.load.tilemapTiledJSON('map', '/assets/level-0.json')
    this.load.multiatlas('players', '/assets/players.json', 'assets')
    this.load.multiatlas('assets', '/assets/assets.json', 'assets')
  }

  async create() {
    new Controls(this, this.channel)

    // Set camera boundary
    this.cameras.main.setBounds(0, 0, Settings.LEVEL_WIDTH, Settings.LEVEL_HEIGHT)

    // Add sky background
    this.add
      .sprite(Settings.LEVEL_WIDTH / 2, Settings.LEVEL_HEIGHT / 2, 'sky')
      .setDisplaySize(Settings.LEVEL_WIDTH, Settings.LEVEL_HEIGHT)

    const levelMap = this.make.tilemap({ key: 'map' })
    const tiles = levelMap.addTilesetImage('tiles', 'tiles', Settings.TILE_WIDTH, Settings.TILE_HEIGHT)
    levelMap.createStaticLayer('level-0', tiles)

    const parseUpdates = updates => {
      if (!updates) {
        return []
      }

      const numParams = 8

      // parse
      const updateParts = updates.split(',')
      updateParts.pop() // Handle trailing comma
      const parsedUpdates = []

      const n = updateParts.length
      if (n % numParams !== 0) {
        return []
      }

      for (let i = 0; i < n; i += numParams) {
        parsedUpdates.push({
          spriteType: updateParts[i + 0],
          entityID: updateParts[i + 1],
          x: parseInt(updateParts[i + 2], Settings.RADIX),
          y: parseInt(updateParts[i + 3], Settings.RADIX),
          flipX: updateParts[i + 4] === "1" ? true : false,
          flipY: updateParts[i + 5] === "1" ? true : false,
          angle: parseInt(updateParts[i + 6]),
          anim: updateParts[i + 7] === "1" ? true : false,
        })
      }
      return parsedUpdates
    }

    const updatesHandler = updates => {
      updates.forEach(entityData => {
        const {
          angle,
          anim,
          flipX,
          flipY,
          entityID,
          spriteType,
          x,
          y,
        } = entityData

        if (has(this.entities, entityID)) {
          // if the entityData does already exist, update the entity
          let sprite = this.entities[entityID].sprite
          sprite.setPosition(x, y).setFlip(flipX, flipY).setAngle(angle)
          if (anim) {
            sprite.anims.play(sprite.animWalkKey, true)
          }
        } else {
          const prefix = sample(PLAYER_PREFIXES)
          // if the entityData does NOT exist, create a new entity
          if (spriteType === SpriteType.PLAYER) {
            let newEntity = {
              sprite: new Player(this, entityID, x, y, prefix),
              entityID: entityID,
            }
            newEntity.sprite.setFlip(flipX, flipY)
            if (anim) {
              newEntity.sprite.anims.play(newGameObject.sprite.animWalkKey, true)
            }
            this.entities[entityID] = newEntity

            // If this is the player's sprite, set the camera to follow the sprite
            if (this.playerID && this.playerID.toString() === entityID) {
              this.cameras.main.startFollow(newEntity.sprite, true)
              this.cameras.main.setZoom(Settings.SCALE)
            }
          } else if (spriteType > SpriteType.PLAYER) {
            let newEntity = {
              sprite: new spriteMap[spriteType](this, entityID, x, y),
              entityID: entityID,
            }
            newEntity.sprite.setFlip(flipX, flipY).setAngle(angle)
            this.entities[entityID] = newEntity
          }
        }
      })
    }

    this.channel.on('updateEntities', updates => updatesHandler(parseUpdates(updates[0])))

    this.channel.on('removePlayer', entityID => {
      try {
        this.entities[entityID].sprite.destroy()
        delete this.entities[entityID]
      } catch (error) {
        console.error(error.message)
      }
    })

    try {
      // Load current game state
      let res = await axios.get(`${location.protocol}//${location.hostname}:${Settings.SERVER_PORT}/getState`)

      let parsedUpdates = parseUpdates(res.data.state)
      updatesHandler(parsedUpdates)

      this.channel.on('getID', playerID36 => {
        this.playerID = parseInt(playerID36, Settings.RADIX)
        this.channel.emit('addPlayer')
      })

      this.channel.emit('getID')
    } catch (error) {
      console.error(error.message)
    }
  }
}

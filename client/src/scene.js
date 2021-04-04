import geckos from '@geckos.io/client'
import axios from 'axios'
import { has, sample } from 'lodash'
import { Scene } from 'phaser'

import Player from './sprites/player'
import Controls from './cursors'

// Size of level map (multiple number of cells by cell width/height)
const LEVEL_HEIGHT = 1935
const LEVEL_WIDTH = 2580

const SCALE = 0.5

const PLAYER_PREFIXES = ['g', 'b']

export class BootScene extends Scene {
  constructor() {
    super({ key: 'BootScene' })

    const channel = geckos({ port: 1444 })

    channel.onConnect(error => {
      if (error) console.error(error.message)

      channel.on('ready', () => {
        this.scene.start('GameScene', { channel: channel })
      })
    })
  }
}

export class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.objects = {}
    this.playerId
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
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT)

    // Add sky background
    this.add.sprite(LEVEL_WIDTH / 2, LEVEL_HEIGHT / 2, 'sky').setDisplaySize(LEVEL_WIDTH, LEVEL_HEIGHT)

    const levelMap = this.make.tilemap({ key: 'map' })
    const tiles = levelMap.addTilesetImage('tiles', 'tiles', 129, 129)
    levelMap.createStaticLayer('level-0', tiles)

    const parseUpdates = updates => {
      if (typeof updates === undefined || updates === '') return []

      // parse
      const updateParts = updates.split(',')
      const parsedUpdates = []

      const n = updateParts.length

      for (let i = 0; i < n; i += 6) {
        parsedUpdates.push({
          playerId: updateParts[i + 0],
          x: parseInt(updateParts[i + 1], 36),
          y: parseInt(updateParts[i + 2], 36),
          dead: updateParts[i + 3] === "1" ? true : false,
          flipX: updateParts[i + 4] === "1" ? true : false,
          anim: updateParts[i + 5] === "1" ? true : false,
        })
      }

      return parsedUpdates
    }

    const updatesHandler = updates => {
      updates.forEach(gameObject => {
        const { playerId, x, y, dead, flipX, anim } = gameObject
        const alpha = dead ? 0 : 1

        if (has(this.objects, playerId)) {
          // if the gameObject does already exist, update the gameObject
          let sprite = this.objects[playerId].sprite
          sprite.setAlpha(alpha).setFlipX(flipX)
          sprite.setPosition(x, y)
          if (anim) {
            sprite.anims.play(sprite.animWalkKey, true)
          }
        } else {
          const prefix = sample(PLAYER_PREFIXES)
          // if the gameObject does NOT exist, create a new gameObject
          let newGameObject = {
            sprite: new Player(this, playerId, x || 200, y || 200, prefix),
            playerId: playerId
          }
          newGameObject.sprite.setAlpha(alpha).setFlipX(flipX)
          if (anim) {
            newGameObject.sprite.anims.play(newGameObject.sprite.animWalkKey, true)
          }

          this.objects = { ...this.objects, [playerId]: newGameObject }
          if (this.playerId && this.playerId.toString() === playerId) {
            this.cameras.main.startFollow(newGameObject.sprite, true)
            this.cameras.main.setZoom(SCALE)
          }
        }
      })
    }

    this.channel.on('updateObjects', updates => updatesHandler(parseUpdates(updates[0])))

    this.channel.on('removePlayer', playerId => {
      try {
        this.objects[playerId].sprite.destroy()
        delete this.objects[playerId]
      } catch (error) {
        console.error(error.message)
      }
    })

    try {
      // Load current game state
      let res = await axios.get(
        `${location.protocol}//${location.hostname}:1444/getState`
      )

      let parsedUpdates = parseUpdates(res.data.state)
      updatesHandler(parsedUpdates)

      this.channel.on('getId', playerId36 => {
        this.playerId = parseInt(playerId36, 36)
        this.channel.emit('addPlayer')
      })

      this.channel.emit('getId')
    } catch (error) {
      console.error(error.message)
    }
  }
}

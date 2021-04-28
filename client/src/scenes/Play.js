import axios from 'axios'
import { has } from 'lodash'
import Phaser from 'phaser'

import {
  Bun,
  BunBox,
  BurgerBeef,
  BurgerBeefLettuce,
  BurgerBeefTomato,
  BurgerBeefTomatoLettuce,
  BurgerLettuce,
  BurgerTomato,
  BurgerTomatoLettuce,
  Cow,
  CowBox,
  Lettuce,
  LettuceBox,
  Player,
  Tomato,
  TomatoBox,
} from '../sprites'
import { Settings, SpriteType } from '../enums'
import Controls from '../cursors'

const spriteMap = {
  [SpriteType.BUN]: Bun,
  [SpriteType.BUN_BOX]: BunBox,
  [SpriteType.BURGER_BEEF]: BurgerBeef,
  [SpriteType.BURGER_BEEF_TOMATO]: BurgerBeefTomato,
  [SpriteType.BURGER_BEEF_LETTUCE]: BurgerBeefLettuce,
  [SpriteType.BURGER_BEEF_TOMATO_LETTUCE]: BurgerBeefTomatoLettuce,
  [SpriteType.BURGER_TOMATO]:  BurgerTomato,
  [SpriteType.BURGER_TOMATO_LETTUCE]:  BurgerTomatoLettuce,
  [SpriteType.BURGER_LETTUCE]:  BurgerLettuce,
  [SpriteType.COW]: Cow,
  [SpriteType.COW_BOX]: CowBox,
  [SpriteType.LETTUCE]: Lettuce,
  [SpriteType.LETTUCE_BOX]: LettuceBox,
  [SpriteType.TOMATO]: Tomato,
  [SpriteType.TOMATO_BOX]: TomatoBox,
}

class Play extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.serverURL = `${location.protocol}//${location.hostname}:${Settings.SERVER_PORT}`
    // Map channel IDs to entity IDs. This is used for mapping video streams to the entity in the game
    // since streams are mapped to channels.
    this.channelEntityMap = {}
    this.entities = {}
    this.playerID = undefined
  }

  init({ channel }) {
    this.channel = channel
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
    const tiles = levelMap.addTilesetImage('platform', 'platform', Settings.TILE_WIDTH, Settings.TILE_HEIGHT)
    levelMap.createStaticLayer('platform', tiles)

    const parseUpdates = updates => {
      if (!updates) {
        return []
      }

      const numParams = 10

      // parse
      const updateParts = updates.split(',')
      updateParts.pop() // Handle trailing comma
      const parsedUpdates = []

      const n = updateParts.length
      if (n % numParams !== 0) {
        return []
      }

      for (let i = 0; i < n;) {
        parsedUpdates.push({
          spriteType: parseInt(updateParts[i++]),
          entityID: updateParts[i++],
          x: parseInt(updateParts[i++], Settings.RADIX),
          y: parseInt(updateParts[i++], Settings.RADIX),
          flipX: updateParts[i++] === "1" ? true : false,
          flipY: updateParts[i++] === "1" ? true : false,
          angle: parseInt(updateParts[i++]),
          anim: updateParts[i++] === "1" ? true : false,
          isJumping: updateParts[i++] === "1" ? true : false,
          hasItem: updateParts[i++] === "1" ? true : false,
        })
      }
      return parsedUpdates
    }

    const updatesHandler = updates => {
      updates.forEach(entityData => {
        const {
          angle,
          entityID,
          flipX,
          flipY,
          hasItem,
          isJumping,
          spriteType,
          x,
          y,
        } = entityData

        if (has(this.entities, entityID)) {
          // if the entityData does already exist, update the entity
          let sprite = this.entities[entityID].sprite
          sprite.setPosition(x, y).setFlip(flipX, flipY).setAngle(angle)
          if (sprite.type === SpriteType.PLAYER) {
            sprite.setIsJumping(isJumping).setHasItem(hasItem)
          }
        } else {
          // if the entityData does NOT exist, create a new entity
          if (spriteType === SpriteType.PLAYER) {
            let newEntity = {
              sprite: new Player(this, entityID, x, y),
              entityID: entityID,
            }
            newEntity.sprite.setFlip(flipX, flipY)
            this.entities[entityID] = newEntity

            // If this is the player's sprite, set the camera to follow the sprite
            if (this.playerID && this.playerID.toString() === entityID) {
              if (this.channel.stream) {
                newEntity.sprite.setStream(this.channel.stream)
              }
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

    // When a new player has joined the game, that means that a new stream will be added.
    // In order to retrieve these streams we will need to renegotiate the WebRTC connection
    // with the server.
    //
    // We will also log the player's channel ID with the entity ID so we can match the
    // streams.
    this.channel.on('joinGame', (data) => {
      const [channelID, entityID] = data.split(',')
      this.channelEntityMap[channelID] = parseInt(entityID)
      this.channel.reconnect()
    })

    this.channel.on('addTrack', async () => {
      // - Listen for add track event which is forwarded by the channel
      // - Since this event listener is added after connection, we will miss the first few events, which is OK
      //   since we call this.updatePlayerStreams() during initialization

      // We wait 1 second before updating the player streams since there seems to be a small delay between when
      // the ontrack event is triggered and when the connection/stream map is updated on the server.
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.updatePlayerStreams()
    })

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
      let res = await axios.get(`${this.serverURL}/getState`)

      // Sync channel/entity map
      this.channelEntityMap = res.data.channelEntityMap

      // Parse game state
      let parsedUpdates = parseUpdates(res.data.state)

      // Sync parsed gameState
      updatesHandler(parsedUpdates)

      // Set player ID from server
      this.channel.on('getID', playerID36 => {
        this.playerID = parseInt(playerID36, Settings.RADIX)
        this.channel.emit('addPlayer')
      })

      // Ask the server for a player ID
      this.channel.emit('getID')
    } catch (error) {
      console.error(error.message)
    }

    // Retrieve video streams for existing players
    this.updatePlayerStreams()
  }

  async updatePlayerStreams() {
    // TODO: Handle audio tracks
    try {
      // Get a mapping of tracks to channels so we know which player to associate audio/video to
      let res = await axios.post(`${this.serverURL}/.wrtc/v1/connections/${this.channel.id}/streams`)

      // Loop through the audio/video tracks the client is receiving and try to match it up with
      // the channel mapping
      this.channel.tracks.forEach(transceiver => {
        // Sometimes the audio/video track may not exist yet or we're looping through our own tracks
        if (!has(res.data.video, transceiver.mid)) {
          return
        }

        const channelID = res.data.video[transceiver.mid].toString()
        if (!has(this.channelEntityMap, channelID)) {
          console.debug(`Channel ID ${channelID} not found in channelEntityMap`)
          return
        }

        const entityID = this.channelEntityMap[channelID]
        if (!has(this.entities, entityID)) {
          console.debug(`Entity ID ${entityID} not found in entities`)
          return
        }

        // We're using the player's local video stream so don't need to use the incoming stream
        if (entityID === this.playerID) {
          return
        }

        // Only add a stream if the entity is not already connected to video
        if (!this.entities[entityID].sprite.hasStream()) {
          this.entities[entityID].sprite.setStream(new MediaStream([transceiver.receiver.track]))
        }
      })
    } catch (error) {
      console.error(error)
    }
  }
}

export default Play;

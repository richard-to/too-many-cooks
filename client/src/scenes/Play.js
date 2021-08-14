import axios from 'axios'
import { defaultTo, has, values } from 'lodash'
import Phaser from 'phaser'

import OrdersDisplay from '../hud/OrdersDisplay'
import PlayerMute from '../hud/PlayerMute'
import Scoreboard from '../hud/Scoreboard'
import WinMatchScreen from '../hud/WinMatchScreen'

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
  ChoppedLettuce,
  ChoppedTomato,
  CookedBeef,
  Cow,
  CowBox,
  CowCloner,
  Escalator,
  Face,
  Knife,
  Lettuce,
  LettuceBox,
  Oven,
  Player,
  Tomato,
  TomatoBox,
} from '../sprites'
import { MatchStates, OrderType, Settings, SpriteType } from '../enums'
import Controls from '../cursors'

const spriteMap = {
  [SpriteType.BUN]: Bun,
  [SpriteType.BUN_BOX]: BunBox,
  [SpriteType.BURGER_BEEF]: BurgerBeef,
  [SpriteType.BURGER_BEEF_TOMATO]: BurgerBeefTomato,
  [SpriteType.BURGER_BEEF_LETTUCE]: BurgerBeefLettuce,
  [SpriteType.BURGER_BEEF_TOMATO_LETTUCE]: BurgerBeefTomatoLettuce,
  [SpriteType.BURGER_TOMATO]: BurgerTomato,
  [SpriteType.BURGER_TOMATO_LETTUCE]: BurgerTomatoLettuce,
  [SpriteType.BURGER_LETTUCE]: BurgerLettuce,
  [SpriteType.CHOPPED_LETTUCE]: ChoppedLettuce,
  [SpriteType.CHOPPED_TOMATO]: ChoppedTomato,
  [SpriteType.COOKED_BEEF]: CookedBeef,
  [SpriteType.COW]: Cow,
  [SpriteType.COW_BOX]: CowBox,
  [SpriteType.COW_CLONER]: CowCloner,
  [SpriteType.ESCALATOR]: Escalator,
  [SpriteType.FACE]: Face,
  [SpriteType.KNIFE]: Knife,
  [SpriteType.LETTUCE]: Lettuce,
  [SpriteType.LETTUCE_BOX]: LettuceBox,
  [SpriteType.OVEN]: Oven,
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
    this.scores = [0, 0]
    this.matchState = {
      state: MatchStates.LOADING,
      team: null,
    }
  }

  init({ channel, playerVideoStream }) {
    this.channel = channel
    // Optimized video (no audio) stream for the current player
    this.playerVideoStream = playerVideoStream
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

    // HUDs
    this.ordersDisplay = new OrdersDisplay(this, 0, 0, [])
    this.scoreboard = new Scoreboard(this, 0, 0)
    this.playerMute = new PlayerMute(this)

    const parseUpdates = updates => {
      if (!updates) {
        return []
      }

      const numParams = 13

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
          flipX: updateParts[i++] === '1' ? true : false,
          flipY: updateParts[i++] === '1' ? true : false,
          angle: parseInt(updateParts[i++]),
          alpha: parseInt(updateParts[i++]),
          anim: updateParts[i++] === '1' ? true : false,
          isJumping: updateParts[i++] === '1' ? true : false,
          hasItem: updateParts[i++] === '1' ? true : false,
          team: parseInt(updateParts[i++]),
          muted: updateParts[i++] === '1' ? true : false ,
        })
      }
      return parsedUpdates
    }

    const updatesHandler = updates => {
      updates.forEach(entityData => {
        const {
          alpha,
          anim,
          angle,
          entityID,
          flipX,
          flipY,
          hasItem,
          isJumping,
          muted,
          spriteType,
          team,
          x,
          y,
        } = entityData
        if (has(this.entities, entityID)) {
          // if the entityData does already exist, update the entity
          let sprite = this.entities[entityID].sprite
          sprite.setPosition(x, y).setFlip(flipX, flipY).setAngle(angle).setAlpha(alpha)
          if (sprite.type === SpriteType.PLAYER) {
            sprite.setIsJumping(isJumping).setHasItem(hasItem).setMuted(muted)
            // Update HUD mute icon for current player
            if (this.playerID && this.playerID.toString() === entityID) {
              this.playerMute.setMuted(muted)
            }
          }
          // TODO: Make updating animations more generic
          if (sprite.type === SpriteType.OVEN) {
            sprite.setAnim(anim)
          }
        } else {
          // if the entityData does NOT exist, create a new entity
          if (spriteType === SpriteType.PLAYER) {
            let newEntity = {
              sprite: new Player(this, entityID, team, x, y),
              entityID: entityID,
            }
            newEntity.sprite.setFlip(flipX, flipY).setMuted(muted)
            this.entities[entityID] = newEntity

            // If this is the player's sprite, set the camera to follow the sprite
            if (this.playerID && this.playerID.toString() === entityID) {
              if (this.playerVideoStream) {
                // We don't want audio to play for the current player, so we pass in a video
                // only stream as the second parameter
                newEntity.sprite.setStreams(this.playerVideoStream, this.playerVideoStream)
              }
              this.cameras.main.startFollow(newEntity.sprite, true)
              this.cameras.main.setZoom(Settings.SCALE)
            }
          } else if (spriteType === SpriteType.FACE) {
            let newEntity = {
              sprite: new spriteMap[spriteType](this, entityID, x, y, team),
              entityID: entityID,
            }
            newEntity.sprite.setFlip(flipX, flipY).setAngle(angle).setAlpha(alpha)
            this.entities[entityID] = newEntity
          } else if (spriteType > SpriteType.PLAYER) {
            let newEntity = {
              sprite: new spriteMap[spriteType](this, entityID, x, y),
              entityID: entityID,
            }
            newEntity.sprite.setFlip(flipX, flipY).setAngle(angle).setAlpha(alpha)
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

    this.channel.on('updateMatchState', matchState => this.updateMatchState(matchState))

    this.channel.on('removeEntity', entityID => {
      try {
        this.entities[entityID].sprite.destroy()
        delete this.entities[entityID]
      } catch (error) {
        console.error(error.message)
      }
    })

    this.channel.on('updateOrders', (orders) => {
      this.parseOrders(orders)
    })

    this.channel.on('updateScores', (scores) => {
      this.scores = scores
      this.scoreboard.updateScores(...this.scores)
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

      // Parse orders
      this.parseOrders(res.data.orders)

      // Update match state
      this.updateMatchState(res.data.matchState)

      // Set scores
      this.scores = res.data.scores
      this.scoreboard.updateScores(...this.scores)

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

    try {
      // Get a mapping of tracks to channels so we know which player to associate audio/video to
      let res = await axios.post(`${this.serverURL}/.wrtc/v1/connections/${this.channel.id}/streams`)

      // Keep track of video/audio tracks associated with a player. We need to add both
      // video/audio tracks to the stream at the same time.
      let tracksByEntityID = {}

      // Loop through the audio/video tracks the client is receiving and try to match it up with
      // the channel mapping
      this.channel.tracks.forEach(transceiver => {
        let channelID = null
        let channelType = null
        if (has(res.data.video, transceiver.mid)) {
          channelID = res.data.video[transceiver.mid].toString()
          channelType = "video"
        } else if (has(res.data.audio, transceiver.mid)) {
          channelID = res.data.audio[transceiver.mid].toString()
          channelType = "audio"
        }

        // Sometimes the audio/video track may not exist yet or we're looping through our own tracks
        if (channelID === null) {
          return
        }

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

        let tracks = defaultTo(tracksByEntityID[entityID], {})
        tracks[channelType] = transceiver.receiver.track
        tracksByEntityID[entityID] = tracks
      })

      for (const [entityID, tracks] of Object.entries(tracksByEntityID)) {
        // Only add streams if the entity is not already connected to video/audio
        if (!this.entities[entityID].sprite.hasStreams()) {
          this.entities[entityID].sprite.setStreams(
            new MediaStream([tracks.video]),
            new MediaStream(values(tracks)),
          )
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  parseOrders(orders) {
    // Convert sprite IDs to image name
    const orderImages = orders.map(o => OrderType[o.toString()])
    this.ordersDisplay.updateOrders(orderImages)
  }

  updateMatchState(matchState) {
    if (this.matchState.state === matchState.state) {
      return
    }

    if (matchState.state === MatchStates.ENDED) {
      const teamName = (matchState.team) === 1 ? Settings.TEAM1_NAME : Settings.TEAM2_NAME
      const winningPlayers = Object.values(this.entities)
        .map(e => e.sprite)
        .filter(s => s.type === SpriteType.PLAYER)
        .filter(s => s.team === matchState.team)
      this.winMatchScreen = new WinMatchScreen(this, teamName, winningPlayers)
    } else if (matchState.state === MatchStates.ACTIVE && this.winMatchScreen) {
      this.winMatchScreen.destroy()
      this.winMatchScreen = null
    }

    this.matchState = matchState
  }


}

export default Play;

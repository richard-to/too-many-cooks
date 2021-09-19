import axios from 'axios'
import { has } from 'lodash'
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
    this.entities = {}
    this.playerID = undefined
    this.scores = [0, 0]
    this.matchState = {
      state: MatchStates.LOADING,
      team: null,
    }
  }

  init({ channel, videoClient }) {
    this.channel = channel
    this.playerVideoStream = videoClient.localVideoStream
    this.videoClient = videoClient
    this.videoClient.onUpdateLocalVideoStream = localVideoStream => {
      console.debug("Update local video stream:", localVideoStream.getVideoTracks()[0])
      this.playerVideoStream = localVideoStream
      this.entities[this.playerID].sprite.setLocalStream(this.playerVideoStream)
    }
    this.videoClient.onJoin = peer => {
      console.debug('Peer joined:', peer)
      if (this.entities[peer.id]) {
        this.entities[peer.id].sprite.setStreamsFromConsumers(peer.consumers)
      }
    }
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
                newEntity.sprite.setLocalStream(this.playerVideoStream)
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
      this.channel.on('getID', async (playerID36) => {
        this.playerID = parseInt(playerID36, Settings.RADIX)
        await this.videoClient.join(this.playerID)
        this.channel.emit('addPlayer')
      })

      // Ask the server for a player ID
      this.channel.emit('getID')
    } catch (error) {
      console.error(error.message)
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

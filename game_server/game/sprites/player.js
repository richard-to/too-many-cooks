const { Settings, SpriteType } = require('../enums')

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, entityID, team, x = 200, y = 200) {
    super(scene, x, y, '')

    this.scene = scene

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)

    this.team = team
    this.type = SpriteType.PLAYER
    this.entityID = entityID
    this.body.setSize(Settings.PLAYER_WIDTH, Settings.PLAYER_HEIGHT)
    this.body.onWorldBounds = true

    this.prevNoMovement = true
    this.prevX = -1
    this.prevY = -1
    this.prevVelocityY = 0
    this.prevHasItem = false
    this.prevMuted = false
    this.flipX = false

    this.anim = false
    this.move = {}
    this.item = null

    this.respawning = false
    this.respawnDelay = 3000
    this.respawnTime = null

    this.movementDisabled = false
    this.jumpCount = 0
    this.consecutiveJumps = 1

    this.defaultVelocity = 300
    this.cowVelocity = 150

    this.muted = false

    scene.events.on('update', this.update, this)
  }

  removeEvents() {
    this.scene.events.off('update', this.update, this)
  }

  respawn() {
    // When respawning occurs, player is temporarily out of game and must wait
    // until they have finished respawning.
    this.respawning = true
    this.scene.playersGroup.remove(this)
    this.scene.respawnGroup.add(this)
    // Reposition player off screen
    this.x = -100
    this.y = -200
  }

  _respawn() {
    // Called when respawn time has been reached, which means
    // player can enter game.
    this.respawning = false

    // Randomly drop player back on map
    this.x = Phaser.Math.RND.integerInRange(0, Settings.LEVEL_WIDTH)
    this.y = 0

    // Reset in-progress movement
    this.setVelocityX(0)
    this.setVelocityY(0)
    this.setMove()

    this.scene.respawnGroup.remove(this)
    this.scene.playersGroup.add(this)
  }

  setMove(data = '64') {
    let m = parseInt(data, Settings.RADIX)
    let move = {
      left: [1, 5, 9, 13, 17, 21, 33, 37].includes(m),
      right:[2, 6, 10, 14, 18, 22, 34, 38].includes(m),
      up: [4, 5, 6, 12, 13, 14, 20, 21, 22, 36, 37, 38].includes(m),
      space: [8, 9, 10, 12, 13, 14].includes(m),
      x: [16, 17, 18, 20, 21, 22].includes(m),
      m: [32, 33, 34, 36, 37, 38].includes(m),
      none: m === 64,
    }
    this.move = move
  }

  toggleMuted() {
    this.muted = !this.muted
    return this
  }

  update(time) {
    const onFloor = this.body.onFloor()

    // Manage respawn logic
    if (this.respawning) {
     if (!this.respawnTime) {
        // If a respawn time has not been set, then that means the player has begun the respawn process
       this.respawnTime = time + this.respawnDelay
     } else if(this.respawnTime <= time) {
       // Once respawn time has completed, the player can be respawned into the game
       this.respawnTime = null
       this._respawn()
     }
     return
    }

    // Player cannot move if they are chopping/cooking or if the game has ended
    if (this.movementDisabled) {
      // Reset sprite params to fix bug where a player activates chopping/cooking while jumping or moving
      // This bug can also occur if the player is moving when the game has ended.
      this.disableMovement()
      return
    }

    // If a player is holding a cow, they will move slower
    const velocity = (this.item && this.item.type === SpriteType.COW) ? this.cowVelocity : this.defaultVelocity

    if (this.move.m) {
      this.toggleMuted()
    }

    if (this.move.left) {
      this.setFlipX(true)
      this.setVelocityX(velocity * -1)
      this.anim = true
    } else if (this.move.right) {
      this.setFlipX(false)
      this.setVelocityX(velocity)
      this.anim = true
    } else {
      this.setVelocityX(0)
      this.anim = false
    }

    if ((onFloor || this.body.touching.down || this.jumpCount < this.consecutiveJumps) && this.move.up) {
      this.setVelocityY(-575)
      this.anim = false
      this.jumpCount += 1
    }

    if (onFloor || this.body.touching.down ) {
      this.jumpCount = 0
    }

    if (this.item) {
      this.item.positionOnPlayer(this)
    }

    if (this.item && this.move.space) {
      this.scene.ingredientsGroup.add(this.item)
      this.item.throw(this.flipX)
      this.scene.itemsGroup.remove(this.item)
      this.item = null
    }
  }

  disableMovement() {
    this.setVelocityX(0)
    this.jumpCount = 0
    this.anim = false
  }

  postUpdate() {
    this.prevX = this.x
    this.prevY = this.y
    this.prevVelocityY = this.body.velocity.y
    this.prevHasItem = this.item !== null
    this.prevMuted = this.muted
  }

  needsSync() {
    const x = Math.abs(this.x - this.prevX) >= 0.5
    const y = Math.abs(this.y - this.prevY) >= 0.5
    const vy = (
      (this.prevVelocityY >= Settings.SHOW_ROCKET_VY && this.body.velocity.y < Settings.SHOW_ROCKET_VY) ||
      (this.prevVelocityY < Settings.SHOW_ROCKET_VY && this.body.velocity.y >= Settings.SHOW_ROCKET_VY)
    )
    const hasItem = this.prevHasItem !== (this.item !== null)
    const muted = this.prevMuted !== this.muted
    return (x || y || vy || hasItem || muted)
  }
}

module.exports = Player

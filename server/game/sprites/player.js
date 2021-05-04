const { Settings, SpriteType } = require('../enums')

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, entityID, x = 200, y = 200) {
    super(scene, x, y, '')

    this.scene = scene

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)

    this.type = SpriteType.PLAYER
    this.entityID = entityID
    this.body.setSize(Settings.PLAYER_WIDTH, Settings.PLAYER_HEIGHT)

    this.prevNoMovement = true
    this.prevX = -1
    this.prevY = -1
    this.prevVelocityY = 0
    this.prevHasItem = false
    this.flipX = false

    this.anim = false
    this.move = {}
    this.item = null

    this.chopping = false
    this.jumpCount = 0
    this.consecutiveJumps = 1

    this.defaultVelocity = 300
    this.cowVelocity = 150

    scene.events.on('update', this.update, this)
  }

  removeEvents() {
    this.scene.events.off('update', this.update, this)
  }

  setMove(data) {
    let m = parseInt(data, Settings.RADIX)

    let move = {
      left: m === 1 || m === 5 || m === 9 || m === 13 || m === 17 || m === 21,
      right: m === 2 || m === 6 || m === 10 || m === 14|| m === 18 || m === 22,
      up: m === 4 || m === 6 || m === 5 || m === 12 || m === 13 || m === 14 || m === 20 || m === 21 || m === 22,
      space: m === 8 || m === 9 || m === 10 || m === 12 || m === 13 || m === 14,
      x: m === 16 || m === 17 || m === 18 || m === 20 || m === 21 || m === 22,
      none: m === 32,
    }

    this.move = move
  }

  update() {
    const onFloor = this.body.onFloor()

    // Player cannot move if they are chopping
    if (this.chopping) {
      // Reset sprite params to fix bug where a player activates chopping while jumping or moving
      this.setVelocityX(0)
      this.anim = false
      this.jumpCount = 0
      return
    }

    // If a player is holding a cow, they will move slower
    const velocity = (this.item && this.item.type === SpriteType.COW) ? this.cowVelocity : this.defaultVelocity

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

  postUpdate() {
    this.prevX = this.x
    this.prevY = this.y
    this.prevVelocityY = this.body.velocity.y
    this.prevHasItem = this.item !== null
  }

  needsSync() {
    const x = Math.abs(this.x - this.prevX) >= 0.5
    const y = Math.abs(this.y - this.prevY) >= 0.5
    const vy = (
      (this.prevVelocityY >= Settings.SHOW_ROCKET_VY && this.body.velocity.y < Settings.SHOW_ROCKET_VY) ||
      (this.prevVelocityY < Settings.SHOW_ROCKET_VY && this.body.velocity.y >= Settings.SHOW_ROCKET_VY)
    )
    const i = this.prevHasItem !== (this.item !== null)
    return (x || y || vy || i)
  }
}

module.exports = Player

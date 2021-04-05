const { Settings, SpriteType } = require('../enums')

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, entityID, prefix, x = 200, y = 200) {
    super(scene, x, y, '')

    this.scene = scene

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)

    this.type = SpriteType.PLAYER
    this.prefix = prefix
    this.entityID = entityID
    this.body.setSize(131, 121)

    this.prevNoMovement = true
    this.prevX = -1
    this.prevY = -1

    this.flipX = false

    this.anim = false
    this.move = {}
    this.item = null

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
    if (this.move.left) {
      this.setFlipX(true)
      this.setVelocityX(-200)
      this.anim = true
    } else if (this.move.right) {
      this.setFlipX(false)
      this.setVelocityX(200)
      this.anim = true
    }
    else {
      this.setVelocityX(0)
      this.anim = false
    }

    if (this.move.up && this.body.onFloor()) {
      this.setVelocityY(-575)
      this.anim = false
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
  }
}

module.exports = Player

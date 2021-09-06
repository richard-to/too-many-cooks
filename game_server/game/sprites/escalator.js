const { Settings, SpriteType } = require('../enums')

class Escalator extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, '')
    this.scene = scene

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)

    this.type = SpriteType.ESCALATOR
    this.entityID = entityID
    this.body.setSize(160, 35)
    this.body.allowGravity = false
    this.setImmovable(true)
    this.velocity = 100
    this.movingDown = false;

    // This variable holds a 25% padding from the top of the level height, so
    // that the escalator starts moving from there and then later stops at 75%
    // of the level height. In the end, the escalator will go back and forward
    // between the area of the 25% and 75% of the height.
    this.escalatorPadding = Settings.LEVEL_HEIGHT * 0.25

    scene.events.on('update', this.update, this)
  }

  update() {
    // If the escalator y position is smaller than 25% of the height, then it
    // starts going down
    if (this.y < this.escalatorPadding && !this.movingDown) {
      this.movingDown = true
      this.setVelocityY(this.velocity)
    }

    // If the escalator y position is greater than 75% of the height, then it
    // starts going up
    if (this.y > Settings.LEVEL_HEIGHT - this.escalatorPadding && this.movingDown) {
      this.movingDown = false
      this.setVelocityY(-this.velocity)
    }
  }
  postUpdate() {}

  needsSync() {
    return true
  }
}

module.exports = Escalator

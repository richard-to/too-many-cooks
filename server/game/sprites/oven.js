const { CookedBeef } = require('./items')
const { SpriteType } = require('../enums')


class Oven extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, entityID, x = -100, y = -100, animDelay = 5000) {
    super(scene, x, y, '')
    this.scene = scene
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.type = SpriteType.OVEN
    this.entityID = entityID
    this.body.setSize(464, 326)

    this.animDelay = animDelay
    this.anim = false
    this.prevAnim = false

    // Player cooking beef
    this.cooker = null
    this.cookStartTime = null

    scene.events.on('update', this.update, this)
  }

  setCooker(player) {
    this.cooker = player
    this.cooker.movementDisabled = true
  }

  update(time) {
    // Only start cooking animation if there is a cook and the animation has not started
    if (this.cooker && !this.cookStartTime) {
      this.cookStartTime = time
      this.anim = true
    }

    // Once the anim delay has elapsed, stop animation
    if (this.cooker && this.cookStartTime + this.animDelay <= time) {
      this.anim = false
      this.cooker.movementDisabled = false

      // Add cooked beef as player item
      const beef = new CookedBeef(this.scene, this.scene.getID())
      this.scene.itemsGroup.add(beef)
      beef.positionOnPlayer(this.cooker)
      beef.setFlipY(false)
      this.cooker.item = beef

      this.cooker = null
      this.cookStartTime = null
    }
  }

  postUpdate() {
    this.prevAnim = this.anim
  }

  needsSync() {
    return this.prevAnim !== this.anim
  }
}

module.exports = Oven

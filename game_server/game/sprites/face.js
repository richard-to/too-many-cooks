const { SpriteType } = require('../enums')


class Face extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, entityID, x = -100, y = -100, team = 1) {
    super(scene, x, y, '')
    this.scene = scene
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.team = team
    this.type = SpriteType.FACE
    this.entityID = entityID
    this.body.setSize(336, 209)
  }

  postUpdate() {}

  needsSync() {
    return false
  }
}

module.exports = Face

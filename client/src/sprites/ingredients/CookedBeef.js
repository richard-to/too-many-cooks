import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class CookedBeef extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'cooked-beef.png')
    this.type = SpriteType.COOKED_BEEF
    this.entityID = entityID
    scene.add.existing(this)
  }
}

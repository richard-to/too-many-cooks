import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class BurgerBeef extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-beef.png')
    this.type = SpriteType.BURGER_BEEF
    this.entityID = entityID
    scene.add.existing(this)
  }
}

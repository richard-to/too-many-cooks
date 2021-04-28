import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class BurgerBeefTomatoLettuce extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-beef-tomato-lettuce.png')
    this.type = SpriteType.BURGER_BEEF_TOMATO_LETTUCE
    this.entityID = entityID
    scene.add.existing(this)
  }
}

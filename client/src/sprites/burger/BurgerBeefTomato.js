import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class BurgerBeefTomato extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-beef-tomato.png')
    this.type = SpriteType.BURGER_BEEF_TOMATO
    this.entityID = entityID
    scene.add.existing(this)
  }
}

import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class TomatoBox extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'block-tomato.png')
    this.type = SpriteType.TOMATO_BOX
    this.entityID = entityID
    scene.add.existing(this)
  }
}

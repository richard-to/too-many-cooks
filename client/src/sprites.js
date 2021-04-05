import Phaser from 'phaser'


import { SpriteType } from './enums'


export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, prefix, x, y) {
    super(scene, x, y, 'players', `${prefix}1.png`)
    this.entityID = entityID
    this.type = SpriteType.PLAYER
    scene.add.existing(this)

    // Walk animation
    this.animWalkKey = `${prefix}-walk`
    const frames = [
      { key: 'players', frame: `${prefix}1.png` },
      { key: 'players', frame: `${prefix}2.png` },
      { key: 'players', frame: `${prefix}3.png` },
      { key: 'players', frame: `${prefix}4.png` },
      { key: 'players', frame: `${prefix}1.png` },
    ]
    scene.anims.create({ key: this.animWalkKey, frames: frames, frameRate: 12 })
  }
}

export class Tomato extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'tomato.png')
    this.type = SpriteType.TOMATO
    this.entityID = entityID
    scene.add.existing(this)
  }
}

export class Lettuce extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'lettuce.png')
    this.type = SpriteType.LETTUCE
    this.entityID = entityID
    scene.add.existing(this)
  }
}

export class Cow extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'beef.png')
    this.type = SpriteType.COW
    this.entityID = entityID
    scene.add.existing(this)
  }
}

export class Bun extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'bun.png')
    this.type = SpriteType.BUN
    this.entityID = entityID
    scene.add.existing(this)
  }
}

export class BurgerBeef extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-beef.png')
    this.type = SpriteType.BURGER_BEEF
    this.entityID = entityID
    scene.add.existing(this)
  }
}

export class BurgerBeefTomato extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-beef-tomato.png')
    this.type = SpriteType.BURGER_BEEF_TOMATO
    this.entityID = entityID
    scene.add.existing(this)
  }
}

export class BurgerBeefLettuce extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-beef-lettuce.png')
    this.type = SpriteType.BURGER_BEEF_LETTUCE
    this.entityID = entityID
    scene.add.existing(this)
  }
}

export class BurgerBeefTomatoLettuce extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-beef-tomato-lettuce.png')
    this.type = SpriteType.BURGER_BEEF_TOMATO_LETTUCE
    this.entityID = entityID
    scene.add.existing(this)
  }
}

export class BurgerTomato extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-tomato.png')
    this.type = SpriteType.BURGER_TOMATO
    this.entityID = entityID
    scene.add.existing(this)
  }
}

export class BurgerTomatoLettuce extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-tomato-lettuce.png')
    this.type = SpriteType.BURGER_TOMATO_LETTUCE
    this.entityID = entityID
    scene.add.existing(this)
  }
}

export class BurgerLettuce extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-lettuce.png')
    this.type = SpriteType.BURGER_LETTUCE
    this.entityID = entityID
    scene.add.existing(this)
  }
}

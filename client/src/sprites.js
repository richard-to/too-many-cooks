import Phaser from 'phaser'


import { Settings, SpriteType } from './enums'


export class Player extends Phaser.GameObjects.Video {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, `Player${entityID}`)
    this.entityID = entityID
    this.type = SpriteType.PLAYER
    scene.add.existing(this)
  }

  /**
   * Set the player's video stream
   *
   * @param {MediaStream} stream
   */
  setStream(stream) {
    this.video = document.createElement("video")
    this.video.playsInline = true
    this.video.srcObject = stream
    this.video.width = Settings.PLAYER_WIDTH
    this.video.height = Settings.PLAYER_HEIGHT
    this.video.autoplay = true
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

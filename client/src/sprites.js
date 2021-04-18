import Phaser from 'phaser'


import { Settings, SpriteType } from './enums'

/**
 * VideoPlayer is a sub-component of the Player container
 */
export class PlayerVideo extends Phaser.GameObjects.Video {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, `PlayerVideo${entityID}`)
    this.type = SpriteType.PlayerVideo
    this.entityID = entityID
    scene.add.existing(this)
  }

  /**
   * Set the player's video stream
   *
   * @param {MediaStream} stream
   */
  setStream(stream) {
    this.video = document.createElement('video')
    this.video.playsInline = true
    this.video.srcObject = stream
    this.video.width = Settings.PLAYER_WIDTH
    this.video.height = Settings.PLAYER_HEIGHT
    this.video.autoplay = true
    return this
  }
}

export class Player extends Phaser.GameObjects.Container {
  constructor(scene, entityID, x, y) {
    super(scene, x, y)
    this.type = SpriteType.PLAYER
    this.entityID = entityID
    scene.add.existing(this)

    const shell = scene.add.sprite(0, 0, 'assets', 'container.png')
    shell.active = false
    this.add(shell)

    this.magnet = scene.add.sprite(0, 0, 'assets', 'magnet.png')
    this.magnet.y = (shell.height / -2) + (this.magnet.height / -2)
    this.magnet.active = false
    this.magnet.visible = false
    this.add(this.magnet)

    this.rocket = scene.add.sprite(0, 0, 'assets', 'rocket.png')
    this.rocket.y = (shell.height / 2) + (this.rocket.height / 2)
    this.rocket.active = false
    this.rocket.visible = false
    this.add(this.rocket)

    this.video = new PlayerVideo(scene, entityID, 1, 1)
    this.add(this.video)
  }

  /**
   * Set the player's video stream
   *
   * @param {MediaStream} stream
   */
  setStream(stream) {
    this.video.setStream(stream)
    return this
  }

  setFlip(flip) {
    this.video.setFlip(flip)
    return this
  }

  setAngle(angle) {
    this.video.setAngle(angle)
    return this
  }

  setHasItem(hasItem) {
    this.magnet.visible = hasItem
    return this
  }

  setIsJumping(isJumping) {
    this.rocket.visible = isJumping
    return this
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

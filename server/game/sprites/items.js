const { SpriteType } = require('../enums')


class IngredientBox extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, x, y, '')
    this.scene = scene
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.entityID = entityID
    this.body.setSize(127, 127)
  }

  postUpdate() {}

  needsSync() {
    return false
  }
}

class BunBox extends IngredientBox {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.BUN_BOX
  }
}

class TomatoBox extends IngredientBox {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.TOMATO_BOX
  }
}

class LettuceBox extends IngredientBox {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.LETTUCE_BOX
  }
}

class CowBox extends IngredientBox {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.COW_BOX
  }
}

class Ingredient extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, x, y, '')

    this.scene = scene

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)

    this.entityID = entityID

    this.xPad = 0
    this.yPad = 10

    this.prevNoMovement = true
    this.prevX = -1
    this.prevY = -1

    this.anim = false
    this.move = {}

    this.onEscalator = false
    this.escalator = null

    scene.events.on('update', this.update, this)
  }

  removeEvents() {
    this.scene.events.off('update', this.update, this)
  }

  positionOnPlayer(player) {
    this.x = player.x + this.xPad
    this.y = player.y - player.body.height + this.yPad
    this.angle = 0
    this.flipY = this.defaultFlipY
  }

  throw(playerFlipX) {
    this.body.angularVelocity = 500
    if (playerFlipX) {
      this.setVelocityX(-350)
    } else {
      this.setVelocityX(350)
    }
  }

  update() {
    if (this.body && this.body.onFloor()) {
      this.body.angularVelocity = 0
      this.setVelocityX(0)
    }

    if (this.onEscalator) {
      this.body.angularVelocity = 0

      this.onEscalator = false
      this.escalator = null
    }
  }

  postUpdate() {
    this.prevX = this.x
    this.prevY = this.y
  }

  needsSync() {
    const x = Math.abs(this.x - this.prevX) > 0.5
    const y = Math.abs(this.y - this.prevY) > 0.5
    return (x || y)
  }
}

class Bun extends Ingredient {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.BUN
    this.body.setSize(118, 77)
    this.yPad = 20
  }
}

class Cow extends Ingredient {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.COW
    this.body.setSize(162, 185)
    this.defaultFlipY = true
    this.xPad = 30
    this.yPad = 30
  }
}

class Lettuce extends Ingredient {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.LETTUCE
    this.body.setSize(128, 104)
    this.yPad = 10
  }
}

class Tomato extends Ingredient {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.TOMATO
    this.body.setSize(95, 76)
    this.yPad = 25
  }
}

class BurgerBeef extends Ingredient {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.BURGER_BEEF
    this.body.setSize(126, 99)
  }
}

class BurgerBeefTomato extends Ingredient {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.BURGER_BEEF_TOMATO
    this.body.setSize(125, 115)
    this.yPad = 5
  }
}

class BurgerBeefLettuce extends Ingredient {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.BURGER_BEEF_LETTUCE
    this.body.setSize(124, 99)
  }
}

class BurgerBeefTomatoLettuce extends Ingredient {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.BURGER_BEEF_TOMATO_LETTUCE
    this.body.setSize(125, 115)
    this.yPad = 5
  }
}

class BurgerTomato extends Ingredient {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.BURGER_TOMATO
    this.body.setSize(118, 86)
  }
}

class BurgerTomatoLettuce extends Ingredient {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.BURGER_TOMATO_LETTUCE
    this.body.setSize(119, 90)
  }
}

class BurgerLettuce extends Ingredient {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.BURGER_LETTUCE
    this.body.setSize(118, 81)
    this.yPad = 15
  }
}


module.exports = {
  Bun,
  BunBox,
  BurgerBeef,
  BurgerBeefLettuce,
  BurgerBeefTomato,
  BurgerBeefTomatoLettuce,
  BurgerLettuce,
  BurgerTomato,
  BurgerTomatoLettuce,
  Cow,
  CowBox,
  Lettuce,
  LettuceBox,
  Tomato,
  TomatoBox,
}

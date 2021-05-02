const { SpriteType } = require('../enums')
const { random } = require('lodash')


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
      this.setVelocityY(0)
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

    // Randomly change direction after every X milliseconds
    this.timeFromLastMove = 0
    this.newMoveDelay = 4000

    // If moveLeft is true, the cow will move left, otherwise move right
    this.moveLeft = true

    // Reference to cloner that the cow came from
    // Mainly used to keep track of the cows that have been created by the cloner
    // Not the best approach, so probably want to improve on this later
    this.clonerSource = null
  }

  removeEvents() {
    // TODO: May need to rename this function to be something more like clean up or something
    super.removeEvents()
    // Need to decrement cow count when the cow is removed from the game, this way new cows
    // can be created
    this.clonerSource.subtractCow()
    this.clonerSource = null
  }

  setClonerSource(cloner) {
    this.clonerSource = cloner
  }

  shootUp() {
    // Logic for shooting a cow from the cloner
    // Randomly pick the x/y velocities so the cows fall in different directions
    this.body.angularVelocity = 500
    this.setVelocityY(random(-600, -1000))

    // Random pick velocity and also randomly pick direction of velocity
    this.setVelocityX(random(200, 600) * (random() ? 1 : -1))
  }

  update(time) {
    if (this.body && this.body.onFloor()) {
      // When the cow lands it needs to:
      //   - stop spinning
      //   - land on its feet
      //   - flipped so it's right side up (since it is upside down when a player holds it)
      //   - stop horizontal movement
      //   - stop vertical movement
      this.body.angularVelocity = 0
      this.angle = 0
      this.flipY = false
      this.setVelocityX(0)
      this.setVelocityY(0)

      // TODO(richard-to): Improve cow movement logic
      // For now randomly pick a direction (left/right) after X milliseconds elapse
      if (this.timeFromLastMove + this.newMoveDelay <= time) {
        this.moveLeft = random() ? true : false
        this.timeFromLastMove = time
      }

      if (this.moveLeft) {
        this.setFlipX(true)
        this.setVelocityX(-50)
      } else {
        this.setFlipX(false)
        this.setVelocityX(50)
      }
    }

    if (this.onEscalator) {
      this.body.angularVelocity = 0

      this.onEscalator = false
      this.escalator = null
    }
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

class ChoppedLettuce extends Ingredient {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.CHOPPED_LETTUCE
    this.body.setSize(81, 68)
    this.yPad = 25
  }
}

class ChoppedTomato extends Ingredient {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, entityID, x, y)
    this.type = SpriteType.CHOPPED_TOMATO
    this.body.setSize(105, 87)
    this.yPad = 25
  }
}

class Knife extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, entityID, x = -100, y = -100) {
    super(scene, x, y, '')
    this.scene = scene
    this.type = SpriteType.KNIFE
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.entityID = entityID
    this.body.setSize(112, 76)

    // Number of chops required to cut veggies
    this.maxChopCount = 5

    // Player chopping veggies
    this.chopper = null

    // Keep track of chop count
    this.chopCount = 0

    // When min angle is reached start chopping down
    this.minAngle = 0
    // When max angle is reached start chopping up
    this.maxAngle = 70

    // Default animation increment for chopping
    this.defaultAngleIncrement = 5

    // Angle increment changes when we're chopping up or down
    this.angleIncrement = this.defaultAngleIncrement

    scene.events.on('update', this.update, this)
  }

  update() {
    // If no one is chopping, reset the knife position to default angle
    if (!this.chopper) {
      this.angle = this.minAngle
      return
    }

    // - When the chop count is reached, the veggie has been chopped
    // - This means the player can move again
    // - They will also have now be holding the chopped veggie
    if (this.chopCount === this.maxChopCount) {
      this.choppedItem.positionOnPlayer(this.chopper)
      this.chopper.item = this.choppedItem
      this.chopper.chopping = false
      this.chopper = null
      this.chopCount = 0
    }

    if (this.angle > this.maxAngle) {
      // Every completed down chop is a completed chop
      this.chopCount++
      // Switch to upward chop animation
      this.angleIncrement = this.defaultAngleIncrement * -1
    } else if (this.angle < this.minAngle) {
      // Switch to down chop animation
      this.angleIncrement = this.defaultAngleIncrement
    }

    // Update the chop animation
    this.angle += this.angleIncrement
  }

  postUpdate() {}

  needsSync() {
    return true
  }

  setChopper(player, choppedItem) {
    this.chopper = player
    this.chopper.chopping = true
    this.choppedItem = choppedItem
    // TODO(richard-to): Fix hardcoded values
    this.choppedItem.y = this.y + 20
    this.choppedItem.x = this.x + 25
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
  ChoppedLettuce,
  ChoppedTomato,
  Cow,
  CowBox,
  Knife,
  Lettuce,
  LettuceBox,
  Tomato,
  TomatoBox,
}

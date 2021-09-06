const { SpriteType } = require('../enums')
const { Cow } = require('./items')

class CowCloner extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, entityID, x = -100, y = -100, maxCowCount = 5, cloneDelay = 4000) {
    super(scene, x, y, '')
    this.scene = scene
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setCollideWorldBounds(true)

    this.type = SpriteType.COW_CLONER
    this.entityID = entityID
    this.body.setSize(173, 185)

    this.prevX = -1
    this.prevY = -1

    // We only want to clone cows at a specific interval (in milliseconds)
    this.timeFromLastClone = cloneDelay
    this.cloneDelay = cloneDelay

    // Limit the number of cows in the game so we don't get infested with cows
    this.maxCowCount = maxCowCount
    this.cowCount = 0

    scene.events.on('update', this.update, this)
  }

  subtractCow() {
    this.cowCount--
  }

  update(time) {
    // Only create new cows if we are below the max number of cows
    if (this.cowCount === this.maxCowCount) {
      // Update the clone interval since we don't want a new cow to be cloned
      // when a cow is removed
      this.timeFromLastClone = time
    }

    // Only create cows if the clone interval is reached
    if (this.timeFromLastClone + this.cloneDelay <= time) {

      // Add cow to game
      const cow = new Cow(this.scene, this.scene.getID(), this.x, this.y - this.height * 3)
      this.scene.ingredientsGroup.add(cow)

      // Shoot up cow from cloner
      cow.shootUp()

      // Link cow to the cloner
      cow.setClonerSource(this)

      // Update last clone time
      this.timeFromLastClone = time

      this.cowCount++
    }
  }

  postUpdate() {
    this.prevX = this.x
    this.prevY = this.y
  }

  needsSync() {
    // Only update the game state of the cloner if it's being pushed
    const x = Math.abs(this.x - this.prevX) >= 0.5
    const y = Math.abs(this.y - this.prevY) >= 0.5
    return (x || y)
  }
}

module.exports = CowCloner

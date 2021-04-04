class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, playerId, x = 200, y = 200, dummy = false) {
    super(scene, x, y, '')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.scene = scene

    this.prevX = -1
    this.prevY = -1

    this.flipX = false

    this.dead = false

    this.anim = false
    this.type = '1'
    this.playerId = playerId
    this.move = {}

    this.item = null

    this.setDummy(dummy)

    this.body.setSize(131, 121)

    this.prevNoMovement = true

    this.setCollideWorldBounds(true)

    scene.events.on('update', this.update, this)
  }

  setDummy(dummy) {
    if (dummy) {
      this.body.setBounce(1)
      this.scene.time.addEvent({
        delay: Phaser.Math.RND.integerInRange(45, 90) * 1000,
        callback: () => this.kill()
      })
    } else {
      this.body.setBounce(0)
    }
  }

  kill() {
    this.dead = true
    this.setActive(false)
  }

  revive(playerId, dummy) {
    this.playerId = playerId
    this.dead = false
    this.setActive(true)
    this.setDummy(dummy)
    this.setVelocity(0)
  }

  setMove(data) {
    let moveCode = parseInt(data, 36)

    let move = {
      left: moveCode === 1 || moveCode === 5 || moveCode === 9 || moveCode === 13,
      right: moveCode === 2 || moveCode === 6 || moveCode === 10 || moveCode === 14,
      up: moveCode === 4 || moveCode === 6 || moveCode === 5 || moveCode === 12 || moveCode === 13 || moveCode === 14,
      space: moveCode === 8 || moveCode === 9 || moveCode === 10 || moveCode === 12 || moveCode === 13 || moveCode === 14,
      none: moveCode === 16,
    }

    this.move = move
  }

  update() {
    if (this.move.left) {
      this.setFlipX(true)
      this.setVelocityX(-200)
      this.anim = true
    } else if (this.move.right) {
      this.setFlipX(false)
      this.setVelocityX(200)
      this.anim = true
    }
    else {
      this.setVelocityX(0)
      this.anim = false
    }

    if (this.move.up && this.body.onFloor()) {
      this.setVelocityY(-575)
      this.anim = false
    }

    if (this.item) {
      this.item.setMovePosition(this.x, this.y - this.body.height + 30)
    }

    if (this.item && this.move.space) {
      this.scene.ingredients.add(this.item)
      this.item.throw(this.flipX)
      this.scene.items.remove(this.item)
      this.item = null
    }
  }

  postUpdate() {
    this.prevX = this.x
    this.prevY = this.y
    this.prevDead = this.dead
  }
}

module.exports = Player

class Tomato extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, playerId, x = 200, y = 200) {
    super(scene, x, y, '')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.scene = scene

    this.prevX = -1
    this.prevY = -1

    this.flipX = false

    this.dead = false

    this.anim = false
    this.type = '2'
    this.playerId = playerId
    this.move = {}

    this.body.setSize(95, 76)

    this.prevNoMovement = true

    this.setCollideWorldBounds(true)

    scene.events.on('update', this.update, this)
  }

  kill() {
    this.dead = true
    this.setActive(false)
  }

  revive(playerId, dummy) {
    this.playerId = playerId
    this.dead = false
    this.setActive(true)
    this.setVelocity(0)
  }

  setMove(data) {
    let moveCode = parseInt(data, 36)

    let move = {
      left: moveCode === 1 || moveCode === 5,
      right: moveCode === 2 || moveCode === 6,
      up: moveCode === 4 || moveCode === 6 || moveCode === 5,
      none: moveCode === 8,
    }

    this.move = move
  }

  setMovePosition(x, y) {
    this.x = x
    this.y = y
  }

  update() {
    if (this.body.onFloor()) {
      this.body.angularVelocity = 0
      this.setVelocityX(0)
    }
  }

  postUpdate() {
    this.prevX = this.x
    this.prevY = this.y
    this.prevDead = this.dead
  }
}

module.exports = Tomato

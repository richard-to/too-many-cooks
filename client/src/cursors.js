export default class Cursors {
  constructor(scene, channel) {
    this.channel = channel
    this.cursors = scene.input.keyboard.createCursorKeys()
    this.space = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    scene.events.on('update', this.update, this)
  }

  update() {
    let move = {
      left: false,
      right: false,
      up: false,
      none: true,
      space: false,
    }

    if (this.cursors.left.isDown) {
      move.left = true
      move.none = false
    } else if (this.cursors.right.isDown) {
      move.right = true
      move.none = false
    }

    if (this.cursors.up.isDown) {
      move.up = true
      move.none = false
    }

    if (Phaser.Input.Keyboard.JustDown(this.space)) {
      move.space = true
    } else {
      move.space = false
    }

    if (
      move.left ||
      move.right ||
      move.up ||
      move.none !== this.prevNoMovement ||
      move.space !== this.prevSpace
    ) {
      let total = 0
      if (move.left) total += 1
      if (move.right) total += 2
      if (move.up) total += 4
      if (move.space) total += 8
      let str36 = total.toString(36)

      this.channel.emit('playerMove', str36)
    }
    this.prevSpace = move.space
    this.prevNoMovement = move.none
  }
}

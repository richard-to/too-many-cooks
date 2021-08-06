import { MatchStates, Settings } from './enums'

export default class Cursors {
  constructor(scene, channel) {
    this.scene = scene
    this.channel = channel
    this.cursors = scene.input.keyboard.createCursorKeys()
    this.space = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.xKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)
    scene.events.on('update', this.update, this)
  }

  update() {
    let move = {
      left: false,
      right: false,
      up: false,
      space: false,
      x: false,
      none: true,
    }

    if (this.scene.matchState.state !== MatchStates.ACTIVE) {
      return
    }

    if (this.cursors.left.isDown) {
      move.left = true
      move.none = false
    } else if (this.cursors.right.isDown) {
      move.right = true
      move.none = false
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      move.up = true
      move.none = false
    }

    if (Phaser.Input.Keyboard.JustDown(this.space)) {
      move.space = true
    } else {
      move.space = false
    }

    if (Phaser.Input.Keyboard.JustDown(this.xKey)) {
      move.x = true
    } else {
      move.x = false
    }

    if (
      move.left ||
      move.right ||
      move.up ||
      move.space !== this.prevSpace ||
      move.x !== this.prevX ||
      move.none !== this.prevNoMovement
    ) {
      let total = 0
      if (move.left) total += 1
      if (move.right) total += 2
      if (move.up) total += 4
      if (move.space) total += 8
      if (move.x) total += 16
      let str36 = total.toString(Settings.RADIX)

      this.channel.emit('playerMove', str36)
    }
    this.prevSpace = move.space
    this.prevX = move.x
    this.prevNoMovement = move.none
  }
}

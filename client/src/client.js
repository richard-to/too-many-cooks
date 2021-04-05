import Phaser, { Game } from 'phaser'
import { BootScene, GameScene } from './scene'
import { Settings } from './enums'

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: Settings.SCREEN_WIDTH,
    height: Settings.SCREEN_HEIGHT,
  },
  scene: [BootScene, GameScene],
}

window.addEventListener('load', () => {
  new Game(config)
})

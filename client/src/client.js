import Phaser, { Game } from 'phaser'
import { BootScene, GameScene } from './scene'

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  scene: [BootScene, GameScene],
}

window.addEventListener('load', () => {
  new Game(config)
})

import Phaser, { Game } from 'phaser'

import { BootScene, PlayScene, PreloadScene } from './scenes'
import { Settings } from './enums'

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: Settings.SCREEN_WIDTH,
    height: Settings.SCREEN_HEIGHT,
  },
  scene: [PreloadScene, BootScene, PlayScene],
}

document.getElementById('home-screen').addEventListener('click', (e) => {
  e.target.remove()
  new Game(config)
})

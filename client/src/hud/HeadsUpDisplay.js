import Phaser from 'phaser'

import { Settings } from '../enums'

class HeadsUpDisplay extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y)

    scene.add.existing(this)

    this.fontSize = 70
    this.lineHeight = 20
    this.textColor = '#FFFFFF'
    this.topPadding = 150
    this.rightPadding = 30

    const rightTopCorner = Settings.RIGHT_TOP_CORNER;
    this.setPosition(rightTopCorner.x - this.topPadding, rightTopCorner.y + this.rightPadding)
    this.setScrollFactor(0)
    this.setupList()
    this.setDepth(1)
  }

  setupList() {
    const scoreBoard = this.createScoreBoard()
    this.add([scoreBoard])
  }

  createScoreBoard() {
    const scoreText = this.scene.add.text(0, 0, '0',{fontSize: `${this.fontSize}px`, fill: this.textColor })
    const scoreImage = this.scene.add.image(scoreText.width + 5, 0, 'assets', 'burger-beef-tomato-lettuce.png')
      .setOrigin(0)
      .setScale(0.5)

    return this.scene.add.container(0, 0, [scoreText, scoreImage]).setName('scoreBoard')
  }

  updateScoreBoard(score) {
    const [scoreText, scoreImage] = this.getByName('scoreBoard').list

    scoreText.setText(score)
    scoreImage.setX(scoreText.width + 5)
  }
}

export default HeadsUpDisplay

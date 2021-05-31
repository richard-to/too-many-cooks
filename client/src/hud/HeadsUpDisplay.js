import Phaser from 'phaser'

import { Settings } from '../enums'

class HeadsUpDisplay extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y)

    scene.add.existing(this)

    this.topPadding = 20
    this.rightPadding = 300

    // Keep track of the score sprites so we can update the score
    this.t1Score = null
    this.t2Score = null

    const rightTopCorner = Settings.RIGHT_TOP_CORNER
    this.setPosition(rightTopCorner.x - this.rightPadding, rightTopCorner.y + this.topPadding)
    this.setScrollFactor(0)
    this.setupList()
    this.setDepth(2)
  }

  setupList() {
    this.add(this.createScoreBoard())
  }

  createScoreBoard() {
    const fontSize = 40

    const margin = 10
    const padding = 15
    const spacer = 10
    const width = 175
    const height = fontSize + margin



    const scoreBgColor = 0xFFFFFF
    const scoreBgAlpha = 0.8
    const scoreBgWidth = 70

    const defaultScore = '0'

    // Font style for the team name label
    const teamFontStyle = {
      fontSize: `${fontSize}px`,
      color: '#FFF',
      fontFamily: Settings.UI_FONT,
    }

    // Font style for the team score label
    const scoreFontStyle = {
      align: 'center',
      fontSize: `${fontSize}px`,
      color: '#555',
      fontFamily: Settings.UI_FONT,
      fixedWidth: scoreBgWidth - padding,
    }

    // Team 1 Score UI
    const t1LabelBg = this.scene.add.graphics()
      .fillStyle(Settings.TEAM1_COLOR, 1)
      .fillRect(0, 0, padding + width, padding + height)

    const t1ScoreBg = this.scene.add.graphics()
      .fillStyle(scoreBgColor, scoreBgAlpha)
      .fillRect( padding + width, 0, scoreBgWidth, padding + height)

    const t1Label = this.scene.add.text(margin, margin, Settings.TEAM1_NAME, teamFontStyle)
    const t1Score = this.scene.add.text(margin + padding + width, margin, defaultScore, scoreFontStyle)
    this.t1Score = t1Score

    // Team 2 Score UI
    const t2LabelBg = this.scene.add.graphics()
      .fillStyle(Settings.TEAM2_COLOR, scoreBgAlpha)
      .fillRect(0, padding + margin + height, padding + width, padding + height)

    const t2ScoreBg = this.scene.add.graphics()
      .fillStyle(scoreBgColor, scoreBgAlpha)
      .fillRect(padding + width, padding + margin + height, scoreBgWidth, padding + height)

    const t2Label = this.scene.add.text(margin, padding + margin + spacer + height, Settings.TEAM2_NAME, teamFontStyle)
    const t2Score = this.scene.add.text(padding + width + margin, padding + margin + spacer + height, defaultScore, scoreFontStyle)
    this.t2Score = t2Score

    return [
      t1LabelBg,
      t1Label,
      t1ScoreBg,
      t1Score,
      t2LabelBg,
      t2Label,
      t2ScoreBg,
      t2Score,
    ]
  }

  updateScoreBoard(t1Score, t2Score) {
    this.t1Score.setText(t1Score)
    this.t2Score.setText(t2Score)
  }
}

export default HeadsUpDisplay

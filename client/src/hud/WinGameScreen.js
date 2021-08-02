import Phaser from 'phaser'
import { Player } from '../sprites/Player'
import { Settings } from '../enums'


class WinGameScreen extends Phaser.GameObjects.Container {
  constructor(scene, x, y, teamName, players) {
    super(scene, x, y)

    scene.add.existing(this)

    this.setScrollFactor(0)
    this.setDepth(2)

    this.add(this._createWinGameScreen(teamName, players))
  }

  _createWinGameScreen(teamName, players) {
    const gameObjects = []

    const label = `Team ${teamName} Wins!`

    const bgAlpha = 0.9
    const bgColor = (teamName === Settings.TEAM1_NAME) ? Settings.TEAM1_COLOR : Settings.TEAM2_COLOR
    const cornerRadius = 5
    const fontSize = 72
    const padding = 20

    const horizontalSpacer = players[0].shell.width + padding
    const playerHorizontalSpace = players[0].shell.width * players.length
    const playerRowSpace = fontSize + padding + padding + players[0].shell.height / 2
    const width = horizontalSpacer * Settings.PLAYERS_PER_TEAM
    const height = players[0].shell.height + fontSize + padding + padding

    const fontStyle = {
      color: '#FFF',
      fontFamily: Settings.UI_FONT,
      fontSize: `${fontSize}px`,
    }

    // Add background for win game screen
    const bg = this.scene.add.graphics()
      .fillStyle(bgColor, bgAlpha)
      .fillRoundedRect(0, 0, padding + width, padding + height, cornerRadius)
      .lineStyle(2, bgColor, 1)
      .strokeRoundedRect(0, 0, padding + width, padding + height, cornerRadius)
      gameObjects.push(bg)

    // Add win game label to first row
    const textLabel = this.scene.add.text(width / 2, padding, label, fontStyle).setOrigin(0.5, 0)
    gameObjects.push(textLabel)


    // Add winning players to second row
    let horizontalSpace = (width - playerHorizontalSpace) / 2 + padding + players[0].shell.width / 2
    players.forEach(player => {
      const playerClone = new Player(this.scene, player.entityID, horizontalSpace, playerRowSpace)
      playerClone.setStream(player.video.video.srcObject)
      gameObjects.push(playerClone)
      horizontalSpace += horizontalSpacer
    })

    this.setPosition(
      Settings.SCREEN_WIDTH / 2 - width / 2,
      Settings.SCREEN_HEIGHT / 2 - height / 2
    )

    return gameObjects
  }
}

export default WinGameScreen

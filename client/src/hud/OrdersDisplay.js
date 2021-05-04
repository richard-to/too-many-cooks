import Phaser from 'phaser';

import { Settings } from '../enums'

class HealthBar extends Phaser.GameObjects.Container {
  constructor(scene, x, y, orders) {
    super(scene, x, y)

    this.orders = orders

    this.horizontalSpace = 200
    this.topPadding = 80
    this.leftPadding = 40
    this.fontSize = 50
    this.textColor = '#FFFFFF'

    scene.add.existing(this)

    const leftTopCorner = Settings.LEFT_TOP_CORNER
    this.setPosition(leftTopCorner.x + this.topPadding, leftTopCorner.y + this.leftPadding)
    this.setScrollFactor(0)
    this.setDepth(2)
    this.setupOrders()
  }

  setupOrders() {
    const ordersBoard = this.createOrdersBoard()
    this.add([ordersBoard])
  }

  createOrdersBoard() {
    const orderContainers = []

    // Add Orders Text
    const scoreText = this.scene.add.text(0, -20, 'Orders:',{fontSize: `${this.fontSize}px`, fill: this.textColor })
    orderContainers.push(scoreText)

    // Add orders with Burger sprites for every order
    let horizontalSpace = 0
    this.orders.forEach(order => {
      orderContainers.push(
        this.scene.add.image(horizontalSpace, 180, 'assets', order.frame)
        .setOrigin(0, 1)
        .setScale(1.2)
      )
      horizontalSpace += this.horizontalSpace
    })

    return this.scene.add.container(0, 0, orderContainers).setName('ordersBoard')
  }
}

export default HealthBar

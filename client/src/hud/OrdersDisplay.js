import Phaser from 'phaser';

import { Settings } from '../enums'

class OrdersDisplay extends Phaser.GameObjects.Container {
  constructor(scene, x, y, orders) {
    super(scene, x, y)

    this.orders = orders

    this.horizontalSpace = 150
    this.leftPadding = 20
    this.topPadding = 20
    this.fontSize = 36
    this.textColor = '#FFFFFF'
    this.backgroundColor = '#ECECEC'

    scene.add.existing(this)

    const leftTopCorner = Settings.LEFT_TOP_CORNER
    this.setPosition(leftTopCorner.x + this.leftPadding, leftTopCorner.y + this.topPadding)
    this.setScrollFactor(0)
    this.setDepth(2)
    this._setupOrders()
  }

  updateOrders(orders) {
    this.orders = orders
    this._setupOrders()
  }

  _setupOrders() {
    // For now clear sprites in container first before update order board
    this._clearOrdersBoard()
    const ordersBoard = this._createOrdersBoard()
    this.add(ordersBoard)
  }

  _createOrdersBoard() {
    const orderContainers = []

    // Add HUD box
    const rect = this.scene.add.graphics()
    rect.fillStyle(0x222, 0.5)
    rect.fillRoundedRect(0, 0, 430, 175, 5)
    rect.strokeRoundedRect(0, 0, 430, 175, 5)
    rect.lineStyle(2, 0x222, 1)
    orderContainers.push(rect)

    // Add Orders Text
    const scoreText = this.scene.add.text(
      15,
      15,
      'orders:',
      {
        fill: this.textColor,
        fontFamily: 'Arial',
        fontSize: `${this.fontSize}px`,
      },
    )
    orderContainers.push(scoreText)

    // Add orders with Burger sprites for every order
    let horizontalSpace = 15
    this.orders.forEach(order => {
      orderContainers.push(
        this.scene.add.image(horizontalSpace, 150, 'assets', order.frame)
        .setOrigin(0, 1)
        .setScale(0.8)
      )
      horizontalSpace += this.horizontalSpace
    })
    return orderContainers
  }

  _clearOrdersBoard() {
    this.removeAll(true)
  }
}

export default OrdersDisplay

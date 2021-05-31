import Phaser from 'phaser';

import { Settings } from '../enums'

class OrdersDisplay extends Phaser.GameObjects.Container {
  constructor(scene, x, y, orders) {
    super(scene, x, y)

    this.orders = orders

    this.horizontalSpace = 140
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

    const padding = 15
    const width = this.horizontalSpace * this.orders.length
    const height = 160
    const cornerRadius = 5
    const bgColor = 0x222

    // Add HUD box
    // TODO: Fix hardcoded numbers
    const rect = this.scene.add.graphics()
    rect.fillStyle(bgColor, 0.5)
    rect.fillRoundedRect(0, 0, padding + width, padding + height, cornerRadius)
    rect.strokeRoundedRect(0, 0, padding + width, padding + height, cornerRadius)
    rect.lineStyle(2, bgColor, 1)
    orderContainers.push(rect)

    // Add Orders Text
    const scoreText = this.scene.add.text(
      padding,
      padding,
      'orders:',
      {
        fill: this.textColor,
        fontFamily: 'Arial',
        fontSize: `${this.fontSize}px`,
      },
    )
    orderContainers.push(scoreText)

    // Add orders with Burger sprites for every order
    let horizontalSpace = padding
    this.orders.forEach(order => {
      orderContainers.push(
        this.scene.add.image(horizontalSpace, height, 'assets', order.frame)
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

import Phaser from 'phaser';

import { Settings } from '../enums'

class OrdersDisplay extends Phaser.GameObjects.Container {
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
    return orderContainers
  }

  _clearOrdersBoard() {
    this.removeAll(true)
  }
}

export default OrdersDisplay

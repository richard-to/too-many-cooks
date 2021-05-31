import Phaser from 'phaser';

import { Settings } from '../enums'

class OrdersDisplay extends Phaser.GameObjects.Container {
  constructor(scene, x, y, orders) {
    super(scene, x, y)

    this.orders = orders

    this.hudLabel = 'Orders'
    this.leftPadding = 20
    this.topPadding = 20

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
    const horizontalSpacer = 140
    const padding = 15
    const width = horizontalSpacer * this.orders.length
    const height = 150
    const cornerRadius = 5
    const hudBgAlpha = 0.5
    const hudBgColor = 0x222

    const ordersFontStyle = {
      color: '#FFF',
      fontFamily: Settings.UI_FONT,
      fontSize: '36px',
    }

    // Add background for orders HUD
    const hudBg = this.scene.add.graphics()
      .fillStyle(hudBgColor, hudBgAlpha)
      .fillRoundedRect(0, 0, padding + width, padding + height, cornerRadius)
      .lineStyle(2, hudBgColor, 1)
      .strokeRoundedRect(0, 0, padding + width, padding + height, cornerRadius)
    orderContainers.push(hudBg)

    // Add Orders Text
    const ordersLabel = this.scene.add.text(padding, padding, this.hudLabel, ordersFontStyle)
    orderContainers.push(ordersLabel)

    // Add orders with Burger sprites for every order
    let horizontalSpace = padding
    this.orders.forEach(order => {
      orderContainers.push(
        this.scene.add.image(horizontalSpace, height, 'assets', order.frame)
        .setOrigin(0, 1)
        .setScale(0.8)
      )
      horizontalSpace += horizontalSpacer
    })
    return orderContainers
  }

  _clearOrdersBoard() {
    this.removeAll(true)
  }
}

export default OrdersDisplay

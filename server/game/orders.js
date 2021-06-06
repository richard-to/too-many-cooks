const { sample } = require('lodash')

class Orders {
  constructor(validOrders, queueSize = 3) {
    // List of valid orders to generate
    this.validOrders = validOrders
    // Max number of orders shown
    this.queueSize = queueSize
    // Current order queue (technically orders can be processed in any order)
    this.orders = []
    this.fill()
  }

  toArray() {
    // Returns order list for serialization to clients
    return this.orders
  }

  fill() {
    // Fills order queue with random orders
    while (this.orders.length < this.queueSize) {
      this.orders.push(sample(this.validOrders))
    }
  }

  remove(item) {
    // Removes an order from the queue if it is valid
    // The first element is if the order was found
    // The second element is if the order was in order
    const index = this.orders.findIndex(o => o === item.type)
    let isInOrder = false
    if (index >= 0) {
      this.orders.splice(index, 1)
      isInOrder = index === 0
      return [true, isInOrder]
    }
    return [false, isInOrder]
  }
}

module.exports = Orders

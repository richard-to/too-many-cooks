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
    const index = this.orders.findIndex(o => o === item.type)
    if (index >= 0) {
      this.orders.splice(index, 1)
      return true
    }
    return false
  }
}

module.exports = Orders

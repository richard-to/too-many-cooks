// Size of level map (multiple number of cells by cell width/height)
const LEVEL_HEIGHT = 1935
const LEVEL_WIDTH = 2580

// Zoom out on map (129px -> 64.5px) // I wonder if the float affects perf
const SCALE = 0.5

// Calculate the expected dimensions after scaling
const SCALED_LEVEL_HEIGHT = LEVEL_HEIGHT * SCALE
const SCALED_LEVEL_WIDTH = LEVEL_WIDTH * SCALE

// Since the map may be be bigger or smaller than the browser window, need to determine the screen
// dimensions dynamically based on the scaled dimensions of the map.
const SCREEN_WIDTH = (window.innerWidth > SCALED_LEVEL_WIDTH) ? SCALED_LEVEL_WIDTH : window.innerWidth
const SCREEN_HEIGHT = (window.innerHeight > SCALED_LEVEL_HEIGHT) ? SCALED_LEVEL_HEIGHT : window.innerHeight

// Sprite types
const TYPE_PLAYER = 'Player'
const TYPE_INGREDIENT = 'Ingredient'
const TYPE_BURGER = 'Burger'

// Create new phaser game
const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
})

// The sprite images for the two players are prefixed as g (for green) and b (for blue)
const PLAYER_PREFIXES = ['g', 'b']

// Metadata to add to ingredient sprites
// TODO: Move this info to sprite subclasses instead
const INGREDIENT_TILE_MAP = {
  1: {
    name: 'beef.png',
    xPad: 30,
    yPad: 40,
    flipY: true,
  },
  2: {
    name: 'bun.png',
    xPad: 0,
    yPad: 30,
    flipY: false,
  },
  3: {
    name: 'lettuce.png',
    xPad: 0,
    yPad: 30,
  },
  4: {
    name: 'tomato.png',
    xPad: 0,
    yPad: 30,
    flipY: false,
  }
}

// Player subclass
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y, index) {
      // Player 0 = green
      // Player 1 = blue
      const prefix = PLAYER_PREFIXES[index]

      super(scene, x, y, 'players', `${prefix}1.png`)
      scene.add.existing(this)

      this.type = TYPE_PLAYER

      // Define some metadata
      this
        .setData('type', TYPE_PLAYER)  // TODO: not needed, remove. Use this.type instead
        .setData('playerIndex', index)

      // Define walking animation
      this.animWalkKey = `${prefix}-walk`
      const frames = [
        { key: 'players', frame: `${prefix}1.png` },
        { key: 'players', frame: `${prefix}2.png` },
        { key: 'players', frame: `${prefix}3.png` },
        { key: 'players', frame: `${prefix}4.png` },
        { key: 'players', frame: `${prefix}1.png` },
      ]
      scene.anims.create({ key: this.animWalkKey, frames: frames, frameRate: 12 })
    }
}

var players
var activePlayer
var item
var items
var ingredients
var worldLayer

// Preload our assets
function preload() {
  this.load.image('sky', 'assets/sky.png')
  this.load.image('tiles', 'assets/tiles.png')
  this.load.tilemapTiledJSON('map', 'assets/level-0.json')
  this.load.multiatlas('players', 'assets/players.json', 'assets')
  this.load.multiatlas('assets', 'assets/assets.json', 'assets')
}

// Initialize the game
function create() {
  // Set physics boundary
  this.physics.world.setBounds( 0, 0, LEVEL_WIDTH, LEVEL_HEIGHT)
  // Set camera boundary
  this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT)

  // Add sky background
  this.add.sprite(LEVEL_WIDTH / 2, LEVEL_HEIGHT / 2, 'sky').setDisplaySize(LEVEL_WIDTH, LEVEL_HEIGHT)

  // Load level map created from Tiled
  const levelMap = this.make.tilemap({ key: 'map' })
  const tiles = levelMap.addTilesetImage('tiles', 'tiles', 129, 129)

  // Add collisions to tile map
  worldLayer = levelMap.createLayer('level-0', tiles)
    .setCollisionByProperty({ collides: true })
    .setTileIndexCallback(1, grabItemFromBlock, this)
    .setTileIndexCallback(2, grabItemFromBlock, this)
    .setTileIndexCallback(3, grabItemFromBlock, this)
    .setTileIndexCallback(4, grabItemFromBlock, this)

  // Add players to physics group
  players = this.physics.add.group({
    bounceY: 0.2,
    collideWorldBounds: true,
  }).addMultiple([
    new Player(this, 64, 0, 0), // Set at left of map
    new Player(this, 2580, 0, 1), // Set at right of map
  ])
  // Make it so players can interact with tile map objects (collisions)
  this.physics.add.collider(players, worldLayer)

  // Set the actively controlled player to player 0 (e.g. green)
  activePlayer = players.getChildren()[0]

  // Make player 1 face left other wise they'll be facing the right edge of the map
  players.getChildren()[1].setFlipX(true)

  // Add physics group for picked up items
  items = this.physics.add.group({
    angularVelocity: 0,
    allowGravity: false,
    immovable: true,
  })

  // Add physics group for picked up ingredients on the map that not picked up
  ingredients = this.physics.add.group({
    allowGravity: true,
    bounceY: 0.2,
    immovable: false,
    collideWorldBounds: true,
  })
  // Make it so ingredients can interact with the tile map
  this.physics.add.collider(ingredients, worldLayer)
  // Pick up ingredient event
  this.physics.add.overlap(players, ingredients, pickupIngredient, null, this)

  // Follow the active player
  this.cameras.main.startFollow(activePlayer, true)
  this.cameras.main.setZoom(SCALE)

  // Press 1 to switch to player 0
  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE).on('down', () => {
    activePlayer = players.getChildren()[0]
    this.cameras.main.startFollow(activePlayer, true)
  })

  // Press 2 to switch to player 1
  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO).on('down', () => {
    activePlayer = players.getChildren()[1]
    this.cameras.main.startFollow(activePlayer, true)
  })
}

// When a player stands on top of a "ingredient" block, they can press spacebar to grab
// the selected ingredient from the block. This creates a new ingredient sprite.
function grabItemFromBlock(sprite, tile) {
  // Only the active sprite can grab an item from the block
  if (sprite !== activePlayer) {
    return
  }

  // Can't use sprite.body.blocked.down with this approach, so we'll calculate relative position
  const isAboveBlock = sprite.y < tile.y * tile.height
  const SPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  if (!item && isAboveBlock && Phaser.Input.Keyboard.JustDown(SPACE)) {
    const tileMeta = INGREDIENT_TILE_MAP[tile.index]
    item = this.physics.add
      // Position sprite above player's head
      .sprite(sprite.x + tileMeta.xPad, sprite.y - sprite.height + tileMeta.yPad, 'assets', tileMeta.name)
      .setFlipY(tileMeta.flipY)
      .setData('type', TYPE_INGREDIENT)
      .setData('meta', tileMeta)
    items.add(item) // Add to item physics group
  }
}

// Picks up ingredients on the ground (via spacebar)
// Merges ingredient into a burger (via x)
//  - Player must be holding a tomato/lettuce/cow
//  - Player must be touch one of the burger types (bun, bun with lettuce/tomato/beef)
function pickupIngredient(player, ingredient) {
  // Only active player can pick up ingredients
  if (player !== activePlayer) {
    return
  }

  const SPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  const X = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)

  const ingMeta = ingredient.data.values.meta

  // Handle ingredient merge logic
  if (Phaser.Input.Keyboard.JustDown(X)) {

    if (item) {
      const meta = item.data.values.meta
      if (
        item.data.values.type === TYPE_INGREDIENT && meta.name !== 'bun.png' &&
        (ingMeta.name === 'bun.png' || ingredient.data.values.type === TYPE_BURGER)
      ) {
        let burgerType
        // TODO: Refactor this ugly conditional
        if (meta.name === 'beef.png' && ingMeta.name === 'bun.png') {
          burgerType = 'burger-beef.png'
        } else if (meta.name === 'beef.png' && ingMeta.name === 'burger-lettuce.png') {
          burgerType = 'burger-beef-lettuce.png'
        } else if (meta.name === 'beef.png' && ingMeta.name === 'burger-tomato.png') {
          burgerType = 'burger-beef-tomato.png'
        } else if (meta.name === 'beef.png' && ingMeta.name === 'burger-tomato-lettuce.png') {
          burgerType = 'burger-beef-tomato-lettuce.png'
        } else if (meta.name === 'lettuce.png' && ingMeta.name === 'bun.png') {
          burgerType = 'burger-lettuce.png'
        } else if (meta.name === 'lettuce.png' && ingMeta.name === 'burger-beef.png') {
          burgerType = 'burger-beef-lettuce.png'
        } else if (meta.name === 'lettuce.png' && ingMeta.name === 'burger-tomato.png') {
          burgerType = 'burger-tomato-lettuce.png'
        } else if (meta.name === 'lettuce.png' && ingMeta.name === 'burger-beef-tomato.png') {
          burgerType = 'burger-beef-tomato-lettuce.png'
        } else if (meta.name === 'tomato.png' && ingMeta.name === 'bun.png') {
          burgerType = 'burger-tomato.png'
        } else if (meta.name === 'tomato.png' && ingMeta.name === 'burger-beef.png') {
          burgerType = 'burger-beef-tomato.png'
        } else if (meta.name === 'tomato.png' && ingMeta.name === 'burger-lettuce.png') {
          burgerType = 'burger-tomato-lettuce.png'
        } else if (meta.name === 'tomato.png' && ingMeta.name === 'burger-beef-lettuce.png') {
          burgerType = 'burger-beef-tomato-lettuce.png'
        }
        // If a valid burger type, then create a new burger sprite
        if (burgerType) {
          tempItem = item

          item = this.physics.add
          .sprite(player.x, player.y - player.height + 30, 'assets', burgerType)
          .setData('type', TYPE_BURGER)
          .setData('meta', {
            name: burgerType,
            xPad: 0,
            yPad: 30,
          })
          items.add(item)

          // Clean up merged items
          items.remove(tempItem)
          ingredients.remove(ingredient)
          tempItem.destroy()
          ingredient.destroy()
        }
      }
    }
  } else if (!item && Phaser.Input.Keyboard.JustDown(SPACE)) {
    // Picks up ingredient from the ground.

    // Remove it from the ingredient physics group
    ingredients.remove(ingredient)
    // Add it to the item physics group which has different behavior
    items.add(ingredient)

    ingredient.x = player.x + ingMeta.xPad
    ingredient.y = player.y - player.height + ingMeta.yPad
    ingredient.angle = 0
    ingredient.setFlipY(ingMeta.flipY)

    item = ingredient
  }
}

// Game loop
function update() {
  const cursors = this.input.keyboard.createCursorKeys()
  if (cursors.left.isDown) {
    // Move left
    activePlayer.setFlipX(true)
    activePlayer.setVelocityX(-200)
    activePlayer.anims.play(activePlayer.animWalkKey, true)
  } else if (cursors.right.isDown) {
    // Move right
    activePlayer.setFlipX(false)
    activePlayer.setVelocityX(200)
    activePlayer.anims.play(activePlayer.animWalkKey, true)
  }
  else {
    // Stop
    activePlayer.setVelocityX(0)
  }

  // Move jump
  if (cursors.up.isDown && activePlayer.body.blocked.down) {
    activePlayer.setVelocityY(-575)
  }

  const spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  // Throw item
  if (item && Phaser.Input.Keyboard.JustDown(spacebar)) {
    ingredients.add(item)

    item.body.angularVelocity = 500
    if (activePlayer.flipX) {
      item.setVelocityX(-350)
    } else {
      item.setVelocityX(350)
    }

    items.remove(item)
    item = null
  }

  // Position item on activePlayer's head
  if (item) {
    item.x = activePlayer.x + item.data.values.meta.xPad
    item.y = activePlayer.y - activePlayer.height + item.data.values.meta.yPad
  }

  // If an ingredient has collided, then stop its movement
  ingredients.getChildren().forEach(ingredient => {
    if (ingredient.body && ingredient.body.blocked.down) {
      ingredient.body.angularVelocity = 0
      ingredient.setVelocityX(0)
    }
  })
}


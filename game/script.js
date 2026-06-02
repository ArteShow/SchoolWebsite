let config = {
    width: 800,
    height: 600,
    parent: "box",
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 1200
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

let player = null
let cursors = null

function preload() {
    this.load.image("clouds", "./images/clouds.jpg")
    this.load.image("bullet", "./images/bullet.png")
}

function create() {
    this.add.tileSprite(0, 0, 800, 600, "clouds").setOrigin(0, 0)
    player = this.physics.add.sprite(400, 300, "bullet")

    cursors = this.input.keyboard.createCursorKeys()
}

function update() {
    player.setCollideWorldBounds(true)
    player.setBounce(0.8)

    if (cursors.left.isDown) {
        player.setFlipX(false)
        player.x -= 5;
    } if (cursors.right.isDown) {
        player.setFlipX(true)
        player.x += 5;
    } if (cursors.space.isDown) {
        player.setVelocityY(-500)
    }
}

let game = new Phaser.Game(config) 
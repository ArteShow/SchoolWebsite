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

function preload() {
    this.load.image("clouds", "./images/clouds.jpg")
    this.load.image("bullet", "./images/bullet.png")
}

function create() {
    this.add.tileSprite(0, 0, 800, 600, "clouds").setOrigin(0, 0)
    this.add.tileSprite(400, 300, 30, 30, "bullet")
}

function update() {
    
}

let game = new Phaser.Game(config) 
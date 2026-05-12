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

}

function create() {
    
}

function update() {
    
}

let game = new Phaser.Game(config) 
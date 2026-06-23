let config = {
    width: 800,
    height: 600,
    parent: "box",
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 1200
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

let player = null
let keys = null
let fireballs = null
let jumpCount = 0
let spawnTimer = null
let gameTimer = null

let survivedSeconds = 0
let highSeconds = 0
let scoreText = null
let shieldText = null
let cooldownText = null
let campText = null
let gameOverText = null
let pauseMenuText = null
let marketContainer = null 

let isGameOver = false
let isPaused = false
let isMarketOpen = false
let maxJumps = 2

let shieldLives = 0
let maxShieldLives = 3 

let isDashing = false
let dashEndTime = 0
let lastShiftTime = 0
const COOLDOWN_DURATION = 5000

let isInvincible = false
let invincibilityEndTime = 0

let coins = parseInt(localStorage.getItem('savedCoins')) || 0
let inventoryText = null
let invincibilityPotions = 0

let floorCampTime = 0
const MAX_CAMP_TIME = 5000 

function preload() {
    this.load.image("clouds", "./images/clouds.jpg")
    this.load.image("bullet", "./images/bullet.png")
    this.load.image("sun", "./images/sun.png")
}

function create() {
    isGameOver = false
    isPaused = false
    isDashing = false
    isMarketOpen = false
    isInvincible = false
    survivedSeconds = 0
    maxJumps = 2
    shieldLives = 0
    maxShieldLives = 3
    invincibilityPotions = 0
    lastShiftTime = -COOLDOWN_DURATION
    floorCampTime = 0

    this.add.tileSprite(0, 0, 800, 600, "clouds").setOrigin(0, 0)
    player = this.physics.add.sprite(400, 300, "bullet")

    player.setCollideWorldBounds(true)
    player.setBounce(0.25) 

    keys = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
        esc: Phaser.Input.Keyboard.KeyCodes.ESC,
        m: Phaser.Input.Keyboard.KeyCodes.M,
        e: Phaser.Input.Keyboard.KeyCodes.E,
        one: Phaser.Input.Keyboard.KeyCodes.ONE,
        two: Phaser.Input.Keyboard.KeyCodes.TWO
    })

    fireballs = this.physics.add.group()

    scoreText = this.add.text(16, 16, '⏱️ TIME: 0s\n🏆 BEST: ' + highSeconds + 's\n🪙 COINS: ' + coins, { 
        fontSize: '24px', 
        fill: '#ffffff', 
        fontFamily: 'Arial, sans-serif',
        stroke: '#000000',
        strokeThickness: 4
    })

    inventoryText = this.add.text(16, 105, '🧪 STAR (E): 0', {
        fontSize: '18px',
        fill: '#ffff00',
        fontFamily: 'Arial, sans-serif',
        stroke: '#000000',
        strokeThickness: 3
    })

    shieldText = this.add.text(784, 16, '🛡️ SHIELD: INACTIVE', { 
        fontSize: '24px', 
        fill: '#aaaaaa', 
        fontFamily: 'Arial, sans-serif',
        stroke: '#000000',
        strokeThickness: 4
    })
    shieldText.setOrigin(1, 0)

    cooldownText = this.add.text(784, 52, '⚡ DASH: READY', {
        fontSize: '20px',
        fill: '#00ff00',
        fontFamily: 'Arial, sans-serif',
        stroke: '#000000',
        strokeThickness: 4
    })
    cooldownText.setOrigin(1, 0)

    campText = this.add.text(400, 80, '', {
        fontSize: '28px',
        fill: '#ff3333',
        fontFamily: 'Arial, sans-serif',
        style: 'bold',
        stroke: '#000000',
        strokeThickness: 5
    })
    campText.setOrigin(0.5, 0)

    gameOverText = this.add.text(400, 300, '', { 
        fontSize: '42px', 
        fill: '#ff3333', 
        align: 'center', 
        fontFamily: 'Arial, sans-serif',
        style: 'bold',
        stroke: '#000000',
        strokeThickness: 6
    })
    gameOverText.setOrigin(0.5)
    gameOverText.setVisible(false)

    pauseMenuText = this.add.text(400, 300, '⏸️ GAME PAUSED\n\nPress ESC to Resume', {
        fontSize: '42px',
        fill: '#ffff00',
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        style: 'bold',
        stroke: '#000000',
        strokeThickness: 6
    })
    pauseMenuText.setOrigin(0.5)
    pauseMenuText.setVisible(false)

    createMarketUI.call(this)

    spawnTimer = this.time.addEvent({
        delay: 1500,
        callback: spawnFireball,
        callbackScope: this,
        loop: true
    })

    gameTimer = this.time.addEvent({
        delay: 1000,
        callback: updateTime,
        callbackScope: this,
        loop: true
    })

    this.physics.add.collider(player, fireballs, hitFireball, null, this)
}

function createMarketUI() {
    marketContainer = this.add.container(400, 300);

    let bg = this.add.graphics();
    bg.fillStyle(0x0d1423, 0.95);
    bg.lineStyle(4, 0x00ffff, 1);
    bg.fillRoundedRect(-200, -180, 400, 360, 15);
    bg.strokeRoundedRect(-200, -180, 400, 360, 15);

    let title = this.add.text(0, -140, '🛒 COIN MARKET', { fontSize: '32px', fill: '#00ffff', fontFamily: 'Arial', style: 'bold' }).setOrigin(0.5);
    let subtitle = this.add.text(0, -100, 'Press M to exit shop menu', { fontSize: '14px', fill: '#8fa0ba', fontFamily: 'Arial' }).setOrigin(0.5);

    let item1 = this.add.text(0, -30, '[1] 🛡️ Max Shield +1 \n     Cost: 3 Coins', { fontSize: '20px', fill: '#ffffff', fontFamily: 'Arial' }).setOrigin(0.5);
    let item2 = this.add.text(0, 40, '[2] ⭐ 3s Invincibility \n     Cost: 2 Coins', { fontSize: '20px', fill: '#ffffff', fontFamily: 'Arial' }).setOrigin(0.5);
    
    let infoLabel = this.add.text(0, 130, 'Press [1] or [2] keys to buy!', { fontSize: '16px', fill: '#ffcc00', fontFamily: 'Arial', style: 'bold' }).setOrigin(0.5);

    marketContainer.add([bg, title, subtitle, item1, item2, infoLabel]);
    marketContainer.setVisible(false);
}

function update(time, delta) {
    let currentTime = this.time.now

    if (isGameOver) {
        if (Phaser.Input.Keyboard.JustDown(keys.space)) {
            this.scene.restart()
        }
        return
    }

    if (Phaser.Input.Keyboard.JustDown(keys.m) && !isGameOver && !isPaused) {
        if (isMarketOpen) {
            this.physics.resume()
            spawnTimer.paused = false
            gameTimer.paused = false
            marketContainer.setVisible(false)
            isMarketOpen = false
        } else {
            this.physics.pause()
            spawnTimer.paused = true
            gameTimer.paused = true
            player.setVelocity(0, 0)
            marketContainer.setVisible(true)
            isMarketOpen = true
        }
    }

    if (isMarketOpen) {
        if (Phaser.Input.Keyboard.JustDown(keys.one)) {
            if (coins >= 3) {
                coins -= 3;
                localStorage.setItem('savedCoins', coins)
                maxShieldLives++;
                updateShieldUI();
                updateCoinText();
                flashPlayerColor(this, 0x00ff00);
            }
        }
        if (Phaser.Input.Keyboard.JustDown(keys.two)) {
            if (coins >= 2) {
                coins -= 2;
                localStorage.setItem('savedCoins', coins)
                invincibilityPotions++;
                updateInventoryText();
                updateCoinText();
                flashPlayerColor(this, 0xffff00);
            }
        }
        return; 
    }

    if (Phaser.Input.Keyboard.JustDown(keys.esc)) {
        if (isPaused) {
            this.physics.resume()
            spawnTimer.paused = false
            gameTimer.paused = false
            pauseMenuText.setVisible(false)
            isPaused = false
        } else {
            this.physics.pause()
            spawnTimer.paused = true
            gameTimer.paused = true
            pauseMenuText.setVisible(true)
            player.setVelocity(0, 0)
            isPaused = true
        }
    }

    if (isPaused) return

    if (Phaser.Input.Keyboard.JustDown(keys.e) && invincibilityPotions > 0 && !isInvincible) {
        invincibilityPotions--;
        updateInventoryText();
        isInvincible = true;
        invincibilityEndTime = currentTime + 3000;
        player.setAlpha(0.6);
        player.setTint(0xffff00); 
    }

    if (isInvincible && currentTime > invincibilityEndTime) {
        isInvincible = false;
        player.setAlpha(1);
        player.clearTint();
    }

    if (isDashing) {
        if (currentTime > dashEndTime) {
            isDashing = false
            player.body.setAllowGravity(true)
        }
    }

    if (player.body.blocked.down) {
        jumpCount = 0
        floorCampTime += delta
        let remainingCamp = Math.ceil((MAX_CAMP_TIME - floorCampTime) / 1000)
        
        if (remainingCamp <= 3 && remainingCamp > 0) {
            campText.setText('⚠️ GROUND CORROSION: ' + remainingCamp + 's')
        } else {
            campText.setText('')
        }

        if (floorCampTime >= MAX_CAMP_TIME) {
            floorCampTime = 0 
            if (!isInvincible && shieldLives > 0) {
                shieldLives--
                updateShieldUI()
                flashPlayerColor(this, 0xff0000);
            } else if (!isInvincible) {
                triggerGameOver(this, "💥 CAUGHT CAMPING ON THE FLOOR! 💥")
                return
            }
        }
    } else {
        floorCampTime = 0
        campText.setText('')
    }

    let currentMoveSpeed = 300 + (survivedSeconds * 10)

    if (!isDashing) {
        if (keys.left.isDown) {
            player.setFlipX(false)
            player.setVelocityX(-currentMoveSpeed)
        } else if (keys.right.isDown) {
            player.setFlipX(true)
            player.setVelocityX(currentMoveSpeed)
        } else {
            player.setVelocityX(0)
        }
    }

    let timePassed = currentTime - lastShiftTime
    if (Phaser.Input.Keyboard.JustDown(keys.shift) && timePassed >= COOLDOWN_DURATION) {
        let targetDirection = 0
        if (keys.left.isDown) targetDirection = -1
        else if (keys.right.isDown) targetDirection = 1
        else if (player.flipX) targetDirection = 1 
        else targetDirection = -1

        if (targetDirection !== 0) {
            isDashing = true
            dashEndTime = currentTime + 180 
            lastShiftTime = currentTime
            
            player.body.setAllowGravity(false) 
            player.setVelocityY(0)
            player.setVelocityX(targetDirection * 1500) 
            applyDashEffect(this)
        }
    }

    if (timePassed < COOLDOWN_DURATION) {
        let remaining = Math.ceil((COOLDOWN_DURATION - timePassed) / 1000)
        cooldownText.setText('⚡ DASH: CD ' + remaining + 's')
        cooldownText.setFill('#ff9900')
    } else {
        cooldownText.setText('⚡ DASH: READY')
        cooldownText.setFill('#00ff00')
    }

    if (Phaser.Input.Keyboard.JustDown(keys.space) && !isDashing) {
        if (player.body.blocked.down || jumpCount < maxJumps) {
            player.setVelocityY(-650)
            jumpCount++
        }
    }

    let fireballArray = fireballs.getChildren()
    for (let i = fireballArray.length - 1; i >= 0; i--) {
        let fireball = fireballArray[i]
        if (fireball.x < -50 || fireball.x > 850 || fireball.y > 650) {
            fireball.destroy()
        }
    }
}

function flashPlayerColor(scene, tintHex) {
    player.setTint(tintHex);
    scene.time.delayedCall(200, () => {
        if (!isInvincible) player.clearTint();
        else player.setTint(0xffff00);
    });
}

function applyDashEffect(scene) {
    scene.tweens.add({
        targets: player,
        alpha: 0.3,
        duration: 90,
        yoyo: true,
        repeat: 1
    })
}

function updateTime() {
    survivedSeconds++
    
    if (survivedSeconds % 10 === 0) {
        coins++;
        localStorage.setItem('savedCoins', coins)
    }

    if (survivedSeconds > highSeconds) {
        highSeconds = survivedSeconds
    }
    updateCoinText();

    let dynamicDelay = Math.max(400, 1500 - (survivedSeconds * 40))
    spawnTimer.delay = dynamicDelay
}

function updateCoinText() {
    scoreText.setText('⏱️ TIME: ' + survivedSeconds + 's\n🏆 BEST: ' + highSeconds + 's\n🪙 COINS: ' + coins)
}

function updateInventoryText() {
    inventoryText.setText('🧪 STAR (E): ' + invincibilityPotions);
}

function spawnFireball() {
    let x, y, velocityX, velocityY
    let side = Phaser.Math.Between(0, 2)
    let speedMultiplier = 1 + (survivedSeconds * 0.04)

    if (side === 0) {
        x = -30
        y = Phaser.Math.Between(50, 400)
        velocityX = Phaser.Math.Between(200, 400) * speedMultiplier
        velocityY = Phaser.Math.Between(-100, 100) * speedMultiplier
    } else if (side === 1) {
        x = 830
        y = Phaser.Math.Between(50, 400)
        velocityX = Phaser.Math.Between(-400, -200) * speedMultiplier
        velocityY = Phaser.Math.Between(-100, 100) * speedMultiplier
    } else {
        x = Phaser.Math.Between(50, 750)
        y = -30
        velocityX = Phaser.Math.Between(-150, 150) * speedMultiplier
        velocityY = Phaser.Math.Between(150, 300) * speedMultiplier
    }

    let fireball = fireballs.create(x, y, "sun")
    fireball.body.setAllowGravity(false)
    fireball.setVelocity(velocityX, velocityY)
    fireball.body.setSize(fireball.width * 0.15, fireball.height * 0.15)
    fireball.body.setOffset((fireball.width - fireball.body.width) / 2, (fireball.height - fireball.body.height) / 2)

    if (Phaser.Math.Between(1, 5) === 1) {
        fireball.isColorful = true
        fireball.setTint(Phaser.Display.Color.RandomRGB().color)
    } else {
        fireball.isColorful = false
    }
}

function updateShieldUI() {
    let activeHearts = '';
    let emptyHearts = '';
    
    for (let i = 0; i < maxShieldLives; i++) {
        if (i < shieldLives) activeHearts += '❤️';
        else emptyHearts += '🖤';
    }

    if (shieldLives > 0) {
        shieldText.setText('🛡️ SHIELD: ' + activeHearts + emptyHearts);
    } else {
        shieldText.setText('🛡️ SHIELD: INACTIVE (' + emptyHearts + ')');
        shieldText.setFill('#aaaaaa');
    }
}

function hitFireball(player, fireball) {
    if (isInvincible) {
        fireball.destroy();
        return;
    }

    if (fireball.isColorful) {
        fireball.destroy()
        if (shieldLives < maxShieldLives) {
            shieldLives++
        }
        shieldText.setFill('#00ffff')
        updateShieldUI()
        
        player.clearTint()
        this.tweens.add({
            targets: player,
            tint: 0x00ffff,
            duration: 100,
            yoyo: true,
            repeat: 3
        })
        return
    }

    if (shieldLives > 0) {
        fireball.destroy()
        shieldLives--
        updateShieldUI()

        this.tweens.add({
            targets: player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 2
        })
        return
    }

    triggerGameOver(this, '💥 GAME OVER 💥\n\nYou survived ' + survivedSeconds + ' seconds')
}

function triggerGameOver(scene, textMessage) {
    scene.physics.pause()
    spawnTimer.destroy()
    gameTimer.destroy()
    player.setTint(0xff0000)
    isGameOver = true
    campText.setText('')
    
    localStorage.setItem('savedCoins', coins)
    
    gameOverText.setText(textMessage + '\n\n🔄 Press SPACE to retry')
    gameOverText.setVisible(true)
}

let game = new Phaser.Game(config)